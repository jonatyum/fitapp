import { readFileSync } from "node:fs";
import { prisma } from "./db.js";
import type { RawExercise } from "./types.js";
import { seedPlans } from "./billing/plans.js";
import { BOOTSTRAP_ADMINS, seedAdmins } from "./roles.js";
import { seedAllowedEmails } from "./beta.js";

// Path to the mounted dataset (see docker-compose: ../exercises-dataset -> /dataset).
const DATASET_PATH =
  process.env.DATASET_PATH ?? "/dataset/data/exercises.json";

// La ponderación por músculo primario vive en el repo, no en el dataset.
const PRIMARY_MUSCLES_PATH = new URL("../data/primary-muscles.json", import.meta.url);

interface PrimaryMuscleRow {
  id: string;
  primaryMuscle: string;
  score: number;
}

async function main() {
  await seedPlans();
  await seedAdmins();
  await seedAllowedEmails(BOOTSTRAP_ADMINS);
  await seedExercises();
  await seedPrimaryMuscles();
}

async function seedExercises() {
  const existing = await prisma.exercise.count();
  if (existing > 0) {
    console.log(`[seed] ${existing} exercises already present — skipping.`);
    return;
  }

  const raw = readFileSync(DATASET_PATH, "utf-8");
  const rows = JSON.parse(raw) as RawExercise[];
  console.log(`[seed] importing ${rows.length} exercises from ${DATASET_PATH}`);

  const data = rows.map((e) => ({
    id: e.id,
    name: e.name,
    category: e.category,
    bodyPart: e.body_part,
    equipment: e.equipment,
    target: e.target,
    muscleGroup: e.muscle_group,
    secondaryMuscles: e.secondary_muscles,
    instructions: e.instructions,
    instructionSteps: e.instruction_steps,
    image: e.image,
    gifUrl: e.gif_url,
    mediaId: e.media_id,
    attribution: e.attribution,
  }));

  const result = await prisma.exercise.createMany({
    data,
    skipDuplicates: true,
  });
  console.log(`[seed] inserted ${result.count} exercises.`);
}

/**
 * Se reaplica en cada arranque en vez de saltarse cuando ya hay valores: son
 * ~100 sentencias (una por pareja músculo/ponderación, no una por ejercicio) y
 * es lo que hace que editar el JSON baste para cambiar el catálogo.
 */
async function seedPrimaryMuscles() {
  const doc = JSON.parse(readFileSync(PRIMARY_MUSCLES_PATH, "utf-8")) as {
    exercises: PrimaryMuscleRow[];
  };

  const groups = new Map<string, string[]>();
  for (const row of doc.exercises) {
    const key = `${row.primaryMuscle}|${row.score}`;
    const ids = groups.get(key);
    if (ids) ids.push(row.id);
    else groups.set(key, [row.id]);
  }

  let updated = 0;
  for (const [key, ids] of groups) {
    const sep = key.lastIndexOf("|");
    const result = await prisma.exercise.updateMany({
      where: { id: { in: ids } },
      data: { primaryMuscle: key.slice(0, sep), primaryScore: Number(key.slice(sep + 1)) },
    });
    updated += result.count;
  }
  console.log(`[seed] primary muscle weights applied to ${updated} exercises.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error("[seed] failed:", err);
    await prisma.$disconnect();
    process.exit(1);
  });
