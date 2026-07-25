import type { FastifyInstance } from "fastify";
import { prisma } from "./db.js";
import { requireAuth, userId } from "./auth.js";
import {
  GOALS,
  LEVELS,
  generateRoutine,
  type Goal,
  type Level,
} from "./generator.js";

interface GenerateBody {
  goal?: string;
  level?: string;
  daysPerWeek?: number;
  equipment?: string[];
}

interface SaveExercise {
  exerciseId: string;
  slot: string;
  sets: number;
  repsMin: number;
  repsMax: number;
  restSec: number;
}

interface SaveDay {
  label: string;
  focus: string[];
  exercises: SaveExercise[];
}

interface SaveBody {
  name?: string;
  goal: Goal;
  level: Level;
  daysPerWeek: number;
  split: string;
  equipment?: string[];
  days: SaveDay[];
}

const isGoal = (v: unknown): v is Goal => GOALS.includes(v as Goal);
const isLevel = (v: unknown): v is Level => LEVELS.includes(v as Level);

/** Days + exercises + the exercise rows the UI needs to render cards. */
const routineInclude = {
  days: {
    orderBy: { position: "asc" },
    include: {
      exercises: {
        orderBy: { position: "asc" },
        include: { exercise: true },
      },
    },
  },
} as const;

export function registerRoutines(app: FastifyInstance) {
  const auth = { preHandler: requireAuth };

  // Preview a plan without persisting anything.
  app.post<{ Body: GenerateBody }>("/routines/generate", auth, async (req, reply) => {
    const { goal, level, daysPerWeek, equipment } = req.body ?? {};
    if (!isGoal(goal) || !isLevel(level)) {
      return reply.code(400).send({ error: "invalid_goal_or_level" });
    }
    return generateRoutine({
      goal,
      level,
      daysPerWeek: Number(daysPerWeek ?? 3),
      equipment: Array.isArray(equipment) ? equipment : [],
    });
  });

  app.get("/routines", auth, async (req) => {
    const routines = await prisma.routine.findMany({
      where: { userId: userId(req) },
      orderBy: [{ active: "desc" }, { createdAt: "desc" }],
      include: {
        _count: { select: { days: true, sessions: true } },
      },
    });
    return routines;
  });

  app.get<{ Params: { id: string } }>("/routines/:id", auth, async (req, reply) => {
    const routine = await prisma.routine.findFirst({
      where: { id: req.params.id, userId: userId(req) },
      include: routineInclude,
    });
    if (!routine) return reply.code(404).send({ error: "not_found" });
    return routine;
  });

  app.post<{ Body: SaveBody }>("/routines", auth, async (req, reply) => {
    const body = req.body;
    if (!body || !isGoal(body.goal) || !isLevel(body.level) || !Array.isArray(body.days)) {
      return reply.code(400).send({ error: "invalid_routine" });
    }

    const uid = userId(req);
    // Only one active routine at a time — the new one takes over.
    await prisma.routine.updateMany({ where: { userId: uid, active: true }, data: { active: false } });

    const routine = await prisma.routine.create({
      data: {
        userId: uid,
        name: (body.name ?? "").trim() || `${body.goal} · ${body.daysPerWeek}d`,
        goal: body.goal,
        level: body.level,
        daysPerWeek: body.daysPerWeek,
        split: body.split,
        equipment: body.equipment ?? [],
        days: {
          create: body.days.map((d, i) => ({
            position: i,
            label: d.label,
            focus: d.focus ?? [],
            exercises: {
              create: (d.exercises ?? []).map((e, j) => ({
                position: j,
                exerciseId: e.exerciseId,
                slot: e.slot,
                sets: e.sets,
                repsMin: e.repsMin,
                repsMax: e.repsMax,
                restSec: e.restSec,
              })),
            },
          })),
        },
      },
      include: routineInclude,
    });
    return reply.code(201).send(routine);
  });

  app.patch<{ Params: { id: string }; Body: { name?: string; active?: boolean } }>(
    "/routines/:id",
    auth,
    async (req, reply) => {
      const uid = userId(req);
      const owned = await prisma.routine.findFirst({
        where: { id: req.params.id, userId: uid },
        select: { id: true },
      });
      if (!owned) return reply.code(404).send({ error: "not_found" });

      if (req.body?.active) {
        await prisma.routine.updateMany({ where: { userId: uid }, data: { active: false } });
      }
      return prisma.routine.update({
        where: { id: owned.id },
        data: {
          ...(req.body?.name !== undefined ? { name: req.body.name.trim() } : {}),
          ...(req.body?.active !== undefined ? { active: req.body.active } : {}),
        },
      });
    },
  );

  app.delete<{ Params: { id: string } }>("/routines/:id", auth, async (req, reply) => {
    const { count } = await prisma.routine.deleteMany({
      where: { id: req.params.id, userId: userId(req) },
    });
    if (!count) return reply.code(404).send({ error: "not_found" });
    return reply.code(204).send();
  });
}
