import { readFileSync } from "node:fs";
import { prisma } from "./db.js";
import type { RawExercise } from "./types.js";

// Path to the mounted dataset (see docker-compose: ../exercises-dataset -> /dataset).
const DATASET_PATH =
  process.env.DATASET_PATH ?? "/dataset/data/exercises.json";

async function main() {
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

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error("[seed] failed:", err);
    await prisma.$disconnect();
    process.exit(1);
  });
