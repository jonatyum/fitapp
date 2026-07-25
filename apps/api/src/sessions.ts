import type { FastifyInstance } from "fastify";
import { prisma } from "./db.js";
import { requireAuth, userId } from "./auth.js";

interface SetInput {
  exerciseId: string;
  setNumber: number;
  reps: number;
  weight?: number;
}

/** Monday 00:00 of the week a date falls in, as YYYY-MM-DD. */
function weekStart(d: Date): string {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dow = (x.getUTCDay() + 6) % 7; // 0 = Monday
  x.setUTCDate(x.getUTCDate() - dow);
  return x.toISOString().slice(0, 10);
}

const addWeeks = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n * 7);
  return d.toISOString().slice(0, 10);
};

/** Epley estimate — comparable across rep ranges, good enough for a PR board. */
const est1rm = (weight: number, reps: number) => weight * (1 + reps / 30);

const sessionInclude = {
  sets: { orderBy: [{ exerciseId: "asc" }, { setNumber: "asc" }] },
  day: { select: { id: true, label: true, position: true } },
  routine: { select: { id: true, name: true } },
} as const;

const volumeOf = (sets: { reps: number; weight: number }[]) =>
  sets.reduce((v, s) => v + s.reps * s.weight, 0);

export function registerSessions(app: FastifyInstance) {
  const auth = { preHandler: requireAuth };

  // Start a session. `dayId` links it to a routine day; without it the
  // session is a free workout.
  app.post<{ Body: { routineId?: string; dayId?: string } }>(
    "/sessions",
    auth,
    async (req, reply) => {
      const uid = userId(req);
      const { routineId, dayId } = req.body ?? {};

      if (dayId) {
        const day = await prisma.routineDay.findFirst({
          where: { id: dayId, routine: { userId: uid } },
          select: { id: true, routineId: true },
        });
        if (!day) return reply.code(404).send({ error: "day_not_found" });
        const session = await prisma.workoutSession.create({
          data: { userId: uid, dayId: day.id, routineId: day.routineId },
          include: sessionInclude,
        });
        return reply.code(201).send(session);
      }

      const session = await prisma.workoutSession.create({
        data: { userId: uid, routineId: routineId ?? null },
        include: sessionInclude,
      });
      return reply.code(201).send(session);
    },
  );

  app.get<{ Querystring: { limit?: string } }>("/sessions", auth, async (req) => {
    const take = Math.min(Number(req.query.limit ?? 30), 100);
    // A session is created the moment "start workout" is tapped, so unfinished
    // ones are abandoned attempts — they don't belong in the history.
    const rows = await prisma.workoutSession.findMany({
      where: { userId: userId(req), finishedAt: { not: null } },
      orderBy: { startedAt: "desc" },
      take,
      include: sessionInclude,
    });
    return rows.map((s) => ({
      ...s,
      volume: volumeOf(s.sets),
      setCount: s.sets.length,
    }));
  });

  app.get<{ Params: { id: string } }>("/sessions/:id", auth, async (req, reply) => {
    const session = await prisma.workoutSession.findFirst({
      where: { id: req.params.id, userId: userId(req) },
      include: sessionInclude,
    });
    if (!session) return reply.code(404).send({ error: "not_found" });
    return session;
  });

  // Save the whole set list at once — the logger keeps its state client-side
  // and pushes the full snapshot, so replacing is simpler than diffing.
  app.put<{
    Params: { id: string };
    Body: { sets?: SetInput[]; notes?: string; finish?: boolean };
  }>("/sessions/:id", auth, async (req, reply) => {
    const owned = await prisma.workoutSession.findFirst({
      where: { id: req.params.id, userId: userId(req) },
      select: { id: true, finishedAt: true },
    });
    if (!owned) return reply.code(404).send({ error: "not_found" });

    const sets = (req.body?.sets ?? []).filter((s) => s.exerciseId && s.reps > 0);

    await prisma.$transaction([
      prisma.setLog.deleteMany({ where: { sessionId: owned.id } }),
      prisma.setLog.createMany({
        data: sets.map((s) => ({
          sessionId: owned.id,
          exerciseId: s.exerciseId,
          setNumber: s.setNumber,
          reps: Math.max(0, Math.round(s.reps)),
          weight: Math.max(0, Number(s.weight ?? 0)),
        })),
      }),
      prisma.workoutSession.update({
        where: { id: owned.id },
        data: {
          ...(req.body?.notes !== undefined ? { notes: req.body.notes } : {}),
          ...(req.body?.finish ? { finishedAt: owned.finishedAt ?? new Date() } : {}),
        },
      }),
    ]);

    return prisma.workoutSession.findUnique({
      where: { id: owned.id },
      include: sessionInclude,
    });
  });

  app.delete<{ Params: { id: string } }>("/sessions/:id", auth, async (req, reply) => {
    const { count } = await prisma.workoutSession.deleteMany({
      where: { id: req.params.id, userId: userId(req) },
    });
    if (!count) return reply.code(404).send({ error: "not_found" });
    return reply.code(204).send();
  });

  /** Aggregates for the progress dashboard. */
  app.get("/stats", auth, async (req) => {
    const sessions = await prisma.workoutSession.findMany({
      where: { userId: userId(req), finishedAt: { not: null } },
      orderBy: { startedAt: "desc" },
      include: { sets: { include: { exercise: { select: { name: true, gifUrl: true } } } } },
    });

    let totalVolume = 0;
    let totalSets = 0;
    let totalReps = 0;

    const byWeek = new Map<string, { volume: number; sessions: number }>();
    const byExercise = new Map<
      string,
      { name: string; gifUrl: string; volume: number; sets: number; bestWeight: number; bestReps: number; best1rm: number }
    >();

    for (const s of sessions) {
      const wk = weekStart(s.startedAt);
      const w = byWeek.get(wk) ?? { volume: 0, sessions: 0 };
      w.sessions += 1;

      for (const set of s.sets) {
        const vol = set.reps * set.weight;
        totalVolume += vol;
        totalSets += 1;
        totalReps += set.reps;
        w.volume += vol;

        const e =
          byExercise.get(set.exerciseId) ??
          {
            name: set.exercise.name,
            gifUrl: set.exercise.gifUrl,
            volume: 0,
            sets: 0,
            bestWeight: 0,
            bestReps: 0,
            best1rm: 0,
          };
        e.volume += vol;
        e.sets += 1;
        const rm = est1rm(set.weight, set.reps);
        if (rm > e.best1rm) {
          e.best1rm = rm;
          e.bestWeight = set.weight;
          e.bestReps = set.reps;
        }
        byExercise.set(set.exerciseId, e);
      }
      byWeek.set(wk, w);
    }

    // Last 8 weeks, oldest first, zero-filled.
    const thisWeek = weekStart(new Date());
    const weekly = Array.from({ length: 8 }, (_, i) => {
      const week = addWeeks(thisWeek, i - 7);
      const v = byWeek.get(week);
      return { week, volume: v?.volume ?? 0, sessions: v?.sessions ?? 0 };
    });

    // Consecutive weeks with at least one session. A current week with nothing
    // logged yet doesn't break the streak — it just hasn't happened.
    let streakWeeks = 0;
    const from = byWeek.get(thisWeek)?.sessions ? 0 : 1;
    for (let i = from; i < 260; i++) {
      if (!byWeek.get(addWeeks(thisWeek, -i))?.sessions) break;
      streakWeeks += 1;
    }

    const entries = [...byExercise.entries()];
    return {
      totalSessions: sessions.length,
      totalVolume,
      totalSets,
      totalReps,
      sessionsThisWeek: byWeek.get(thisWeek)?.sessions ?? 0,
      streakWeeks,
      weekly,
      topExercises: entries
        .sort((a, b) => b[1].volume - a[1].volume)
        .slice(0, 5)
        .map(([id, e]) => ({ exerciseId: id, name: e.name, gifUrl: e.gifUrl, volume: e.volume, sets: e.sets })),
      records: entries
        .filter(([, e]) => e.bestWeight > 0)
        .sort((a, b) => b[1].best1rm - a[1].best1rm)
        .slice(0, 6)
        .map(([id, e]) => ({
          exerciseId: id,
          name: e.name,
          bestWeight: e.bestWeight,
          bestReps: e.bestReps,
          est1rm: Math.round(e.best1rm),
        })),
    };
  });
}
