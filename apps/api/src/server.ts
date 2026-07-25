import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import { prisma } from "./db.js";
import type { Prisma } from "@prisma/client";
import { registerAuth } from "./auth.js";
import { registerRoutines } from "./routines.js";
import { registerSessions } from "./sessions.js";

const app = Fastify({ logger: true });

// CORS_ORIGIN is a comma-separated allow-list of front-end origins
// (e.g. "https://user.github.io"). Unset = reflect any origin (dev default).
const corsEnv = process.env.CORS_ORIGIN?.trim();
const corsOrigin = corsEnv
  ? corsEnv.split(",").map((s) => s.trim()).filter(Boolean)
  : true;
await app.register(cors, { origin: corsOrigin });
await registerAuth(app);
registerRoutines(app);
registerSessions(app);

// Serve the dataset media (images/ and videos/) at /media/*
// e.g. an exercise's image "images/0001-xxx.jpg" -> /media/images/0001-xxx.jpg
await app.register(fastifyStatic, {
  root: process.env.DATASET_ROOT ?? "/dataset",
  prefix: "/media/",
  decorateReply: false,
});

app.get("/health", async () => ({ status: "ok" }));

// Distinct values for building filter UIs.
app.get("/meta", async () => {
  const [bodyParts, equipment, targets] = await Promise.all([
    prisma.exercise.findMany({ distinct: ["bodyPart"], select: { bodyPart: true }, orderBy: { bodyPart: "asc" } }),
    prisma.exercise.findMany({ distinct: ["equipment"], select: { equipment: true }, orderBy: { equipment: "asc" } }),
    prisma.exercise.findMany({ distinct: ["target"], select: { target: true }, orderBy: { target: "asc" } }),
  ]);
  return {
    bodyParts: bodyParts.map((r) => r.bodyPart),
    equipment: equipment.map((r) => r.equipment),
    targets: targets.map((r) => r.target),
  };
});

interface ExerciseQuery {
  q?: string;
  bodyPart?: string;
  equipment?: string;
  target?: string;
  muscle?: string;
  limit?: string;
  offset?: string;
}

// Filtered, paginated list of exercises.
app.get<{ Querystring: ExerciseQuery }>("/exercises", async (req) => {
  const { q, bodyPart, equipment, target, muscle } = req.query;
  const limit = Math.min(Number(req.query.limit ?? 60), 200);
  const offset = Number(req.query.offset ?? 0);

  const where: Prisma.ExerciseWhereInput = {
    ...(bodyPart ? { bodyPart } : {}),
    ...(equipment ? { equipment } : {}),
    ...(target ? { target } : {}),
    // `muscle` matches the primary target OR any secondary muscle — used by the
    // interactive muscle map. Accepts a comma-separated list of synonyms
    // (the dataset uses e.g. "quads" as target but "quadriceps" as secondary).
    ...(muscle
      ? (() => {
          const list = muscle.split(",").map((s) => s.trim()).filter(Boolean);
          return {
            OR: [
              { target: { in: list } },
              { secondaryMuscles: { hasSome: list } },
            ],
          };
        })()
      : {}),
    ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
  };

  const [total, items] = await Promise.all([
    prisma.exercise.count({ where }),
    prisma.exercise.findMany({ where, orderBy: { id: "asc" }, take: limit, skip: offset }),
  ]);

  return { total, limit, offset, items };
});

// Exercise count per muscle (target + secondary), for the muscle map.
// Computed once and cached in memory.
let muscleCounts: Record<string, number> | null = null;
app.get("/muscles/counts", async () => {
  if (!muscleCounts) {
    const rows = await prisma.exercise.findMany({
      select: { target: true, secondaryMuscles: true },
    });
    const counts: Record<string, number> = {};
    for (const r of rows) {
      const muscles = new Set([r.target, ...r.secondaryMuscles]);
      for (const m of muscles) counts[m] = (counts[m] ?? 0) + 1;
    }
    muscleCounts = counts;
  }
  return muscleCounts;
});

// Single exercise by id.
app.get<{ Params: { id: string } }>("/exercises/:id", async (req, reply) => {
  const ex = await prisma.exercise.findUnique({ where: { id: req.params.id } });
  if (!ex) return reply.code(404).send({ error: "not found" });
  return ex;
});

const port = Number(process.env.PORT ?? 3001);
app
  .listen({ port, host: "0.0.0.0" })
  .then(() => app.log.info(`API listening on :${port}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
