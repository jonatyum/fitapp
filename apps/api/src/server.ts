import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import { prisma } from "./db.js";
import type { Prisma } from "@prisma/client";
import { registerAuth } from "./auth.js";
import { registerRoutines } from "./routines.js";
import { registerSessions } from "./sessions.js";
import { registerRateLimit, trustProxyOption } from "./rateLimit.js";
import { registerBilling } from "./billing/routes.js";
import { registerAdmin } from "./admin.js";
import { registerAccessGuard } from "./access.js";
import { assertBetaConfig } from "./beta.js";
import { EXERCISE_TAGS, isExerciseTag } from "./equipmentTags.js";

const app = Fastify({ logger: true, trustProxy: trustProxyOption() });

// CORS_ORIGIN is a comma-separated allow-list of front-end origins
// (e.g. "https://user.github.io"). Unset = reflect any origin (dev default).
const corsEnv = process.env.CORS_ORIGIN?.trim();
const corsOrigin = corsEnv
  ? corsEnv.split(",").map((s) => s.trim()).filter(Boolean)
  : true;
await app.register(cors, { origin: corsOrigin });

// Must come before any route is declared: it tags each route with its limit
// as the route is registered.
await registerRateLimit(app);

// Igual que el rate limit, tiene que preceder a toda ruta: un hook de
// instancia sólo alcanza a lo que se declara después.
assertBetaConfig(app.log);
registerAccessGuard(app);

await registerAuth(app);
registerRoutines(app);
registerSessions(app);
await registerBilling(app);
registerAdmin(app);

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
  /** "home" | "bodyweight" — shorthand for a set of equipment values. */
  tag?: string;
  limit?: string;
  offset?: string;
}

// Filtered, paginated list of exercises.
app.get<{ Querystring: ExerciseQuery }>("/exercises", async (req) => {
  const { q, bodyPart, equipment, target, muscle, tag } = req.query;
  const limit = Math.min(Number(req.query.limit ?? 60), 200);
  const offset = Number(req.query.offset ?? 0);

  // An unknown tag is ignored rather than rejected: it is a discovery
  // shortcut, not something a saved routine depends on.
  const tagEquipment = isExerciseTag(tag) ? EXERCISE_TAGS[tag] : null;

  // Accepts a comma-separated list of synonyms (the dataset uses e.g. "quads"
  // as target but "quadriceps" as secondary).
  const muscleList = muscle
    ? muscle.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const where: Prisma.ExerciseWhereInput = {
    ...(bodyPart ? { bodyPart } : {}),
    ...(equipment ? { equipment } : {}),
    // Goes through AND so it narrows an explicit `equipment` instead of
    // colliding with it on the same key.
    ...(tagEquipment ? { AND: [{ equipment: { in: [...tagEquipment] } }] } : {}),
    ...(target ? { target } : {}),
    // `muscle` matches the primary target OR any secondary muscle — used by the
    // interactive muscle map.
    ...(muscleList.length
      ? {
          OR: [
            { target: { in: muscleList } },
            { secondaryMuscles: { hasSome: muscleList } },
          ],
        }
      : {}),
    ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
  };

  const [total, items] = await Promise.all([
    prisma.exercise.count({ where }),
    listExercises(where, muscleList.length ? muscleList : target ? [target] : [], limit, offset),
  ]);

  return { total, limit, offset, items };
});

// Del más directo al menos directo para un mismo músculo primario
// (data/primary-muscles.json). `id` cierra el orden porque hay nombres
// repetidos y la paginación por offset necesita un orden total.
const BY_WEIGHT: Prisma.ExerciseOrderByWithRelationInput[] = [
  { primaryScore: { sort: "desc", nulls: "last" } },
  { name: "asc" },
  { id: "asc" },
];
const BY_MUSCLE: Prisma.ExerciseOrderByWithRelationInput[] = [
  { primaryMuscle: { sort: "asc", nulls: "last" } },
  ...BY_WEIGHT,
];

/**
 * Una página del catálogo, agrupada por el músculo que cada ejercicio entrena
 * de verdad y ordenada dentro del grupo por lo directo que es para él. Antes
 * era el orden del dataset (`id asc`), que dejaba el estiramiento de isquios
 * entre los ejercicios de isquios.
 *
 * Si se filtró por un músculo, ese grupo va primero: con el orden alfabético a
 * secas, buscar glúteo abría la lista con los abductores. Son dos consultas
 * porque el criterio es "coincide con el filtro", y eso en SQL es un ORDER BY
 * CASE que Prisma no sabe expresar sobre un `where` que arma él mismo.
 */
function listExercises(
  where: Prisma.ExerciseWhereInput,
  focus: string[],
  limit: number,
  offset: number,
) {
  if (!focus.length) {
    return prisma.exercise.findMany({ where, orderBy: BY_MUSCLE, take: limit, skip: offset });
  }

  const focused: Prisma.ExerciseWhereInput = { AND: [where, { primaryMuscle: { in: focus } }] };
  // `NOT IN` deja fuera los nulos, así que un ejercicio que el JSON no cubra
  // desaparecería de la lista en vez de caer al final.
  const rest: Prisma.ExerciseWhereInput = {
    AND: [where, { OR: [{ primaryMuscle: null }, { NOT: { primaryMuscle: { in: focus } } }] }],
  };

  return prisma.exercise.count({ where: focused }).then(async (focusedCount) => {
    const items =
      offset < focusedCount
        ? await prisma.exercise.findMany({
            where: focused,
            orderBy: BY_WEIGHT,
            take: limit,
            skip: offset,
          })
        : [];
    if (items.length >= limit) return items;
    const more = await prisma.exercise.findMany({
      where: rest,
      orderBy: BY_MUSCLE,
      take: limit - items.length,
      skip: Math.max(0, offset - focusedCount),
    });
    return [...items, ...more];
  });
}

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
