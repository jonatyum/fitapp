import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";

import { prisma } from "./db.js";
import { generateRoutine, type GenerateInput, type PoolExercise } from "./generator.js";

/**
 * The generator's only I/O is `prisma.exercise.findMany`, and the result is
 * memoised in a module-level cache. Swapping the delegate before the first call
 * gives the whole file one deterministic catalog with no database and no
 * production code changed for the sake of testing.
 */

/** Every muscle key the slot table can ask for. */
const TARGETS = [
  "pectorals", "lats", "upper back", "delts", "biceps", "triceps", "forearms",
  "quads", "hamstrings", "glutes", "calves", "abs", "obliques", "spine",
  "adductors", "abductors", "cardiovascular system",
];

const ex = (
  id: string,
  name: string,
  target: string,
  equipment: string,
  secondaryMuscles: string[] = [],
): PoolExercise => ({
  id,
  name,
  target,
  equipment,
  bodyPart: "test",
  secondaryMuscles,
  gifUrl: "",
  image: "",
});

/**
 * One gym, one bodyweight and one band option per target, so no slot is ever
 * empty for want of data — an empty slot in a test must mean the generator
 * chose to leave it out.
 */
const POOL: PoolExercise[] = [
  // Same movement word and same word count in all three, so the only thing
  // that can separate them in the ranking is the equipment.
  ...TARGETS.flatMap((t, i) => [
    ex(`bb-${i}`, `barbell ${t} press`, t, "barbell"),
    ex(`bw-${i}`, `bodyweight ${t} press`, t, "body weight"),
    ex(`bd-${i}`, `band ${t} press`, t, "band"),
    // Dumbbell is the case where the two rankings genuinely disagree: the gym
    // list puts it above body weight, the home list below.
    ex(`db-${i}`, `dumbbell ${t} press`, t, "dumbbell"),
  ]),
  // Only one target has this, so a medicine-ball-only kit starves every
  // other slot — that is how the home hard filter gets exercised.
  ex("mb-1", "medicine ball chest throw", "pectorals", "medicine ball"),
  // Filtered by name, whatever the equipment says.
  ex("st-1", "quads stretch", "quads", "body weight"),
  ex("st-2", "hamstrings foam roll", "hamstrings", "body weight"),
  // Allowed only at advanced level.
  ex("ad-1", "lats muscle up", "lats", "body weight"),
];

const base: GenerateInput = {
  goal: "hypertrophy",
  level: "intermediate",
  daysPerWeek: 4,
  equipment: [],
};

const allExercises = (r: { days: { exercises: { exercise: PoolExercise }[] }[] }) =>
  r.days.flatMap((d) => d.exercises.map((e) => e.exercise));

let restoreRandom: (() => void) | null = null;

/** Always take the top-ranked candidate, so a ranking assertion is stable. */
function freezeRandom() {
  const original = Math.random;
  Math.random = () => 0;
  restoreRandom = () => {
    Math.random = original;
  };
}

before(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (prisma as any).exercise = { findMany: async () => POOL };
});

after(() => restoreRandom?.());

describe("splits and volume", () => {
  it("clamps days per week into the 2-6 range the split table covers", async () => {
    assert.equal((await generateRoutine({ ...base, daysPerWeek: 1 })).daysPerWeek, 2);
    assert.equal((await generateRoutine({ ...base, daysPerWeek: 9 })).daysPerWeek, 6);
  });

  it("picks the split that matches the days asked for", async () => {
    const split = async (daysPerWeek: number) =>
      (await generateRoutine({ ...base, daysPerWeek })).split;
    assert.equal(await split(2), "fullbody");
    assert.equal(await split(3), "fullbody");
    assert.equal(await split(4), "upperlower");
    assert.equal(await split(5), "ppl-ul");
    assert.equal(await split(6), "ppl");
  });

  it("emits one day per training day", async () => {
    const r = await generateRoutine({ ...base, daysPerWeek: 6 });
    assert.equal(r.days.length, 6);
  });

  it("scales exercises per day with the level", async () => {
    const perDay = async (level: "beginner" | "intermediate" | "advanced") =>
      (await generateRoutine({ ...base, level })).days[0].exercises.length;
    assert.equal(await perDay("beginner"), 5);
    assert.equal(await perDay("intermediate"), 6);
    assert.equal(await perDay("advanced"), 8);
  });

  it("never repeats an exercise inside the same day", async () => {
    const r = await generateRoutine({ ...base, level: "advanced", daysPerWeek: 6 });
    for (const day of r.days) {
      const ids = day.exercises.map((e) => e.exercise.id);
      assert.equal(new Set(ids).size, ids.length, `día ${day.label} repite un ejercicio`);
    }
  });
});

describe("prescription", () => {
  it("gives compound work the full strength prescription", async () => {
    const r = await generateRoutine({ ...base, goal: "strength", level: "intermediate" });
    const compound = r.days.flatMap((d) => d.exercises).find((e) => e.slot === "chest");
    assert.ok(compound, "no se programó ningún slot de pecho");
    assert.deepEqual(
      { sets: compound.sets, repsMin: compound.repsMin, repsMax: compound.repsMax, restSec: compound.restSec },
      { sets: 5, repsMin: 4, repsMax: 6, restSec: 180 },
    );
  });

  it("drops a set for beginners", async () => {
    const setsFor = async (level: "beginner" | "intermediate") => {
      const r = await generateRoutine({ ...base, goal: "strength", level });
      return r.days.flatMap((d) => d.exercises).find((e) => e.slot === "chest")!.sets;
    };
    assert.equal(await setsFor("beginner"), (await setsFor("intermediate")) - 1);
  });

  it("refuses to prescribe heavy low reps on isolation work", async () => {
    // Biceps is not in COMPOUND, so a strength goal must still land in 8-10.
    const r = await generateRoutine({ ...base, goal: "strength", level: "advanced", daysPerWeek: 6 });
    const curl = r.days.flatMap((d) => d.exercises).find((e) => e.slot === "biceps");
    assert.ok(curl, "no se programó ningún slot de bíceps");
    assert.equal(curl.repsMin, 8);
    assert.equal(curl.repsMax, 10);
  });

  it("adds a cardio finisher for fat loss and endurance only", async () => {
    for (const goal of ["fatloss", "endurance"] as const) {
      const r = await generateRoutine({ ...base, goal });
      assert.ok(
        r.days.every((d) => d.exercises.some((e) => e.slot === "cardio")),
        `${goal} debería terminar con cardio`,
      );
    }
    for (const goal of ["strength", "hypertrophy"] as const) {
      const r = await generateRoutine({ ...base, goal });
      assert.ok(r.days.every((d) => d.exercises.every((e) => e.slot !== "cardio")));
    }
  });

  it("prescribes cardio as a single block, not straight sets", async () => {
    const r = await generateRoutine({ ...base, goal: "fatloss" });
    const cardio = r.days[0].exercises.find((e) => e.slot === "cardio")!;
    assert.equal(cardio.sets, 1);
  });
});

describe("exercise filtering", () => {
  it("never programs a stretch or a mobility drill", async () => {
    const r = await generateRoutine({ ...base, level: "advanced", daysPerWeek: 6 });
    const names = allExercises(r).map((e) => e.name);
    assert.ok(!names.some((n) => /stretch|foam roll/i.test(n)), `programó ${names}`);
  });

  it("hides advanced calisthenics below advanced level", async () => {
    for (const level of ["beginner", "intermediate"] as const) {
      const r = await generateRoutine({ ...base, level, daysPerWeek: 6 });
      assert.ok(
        !allExercises(r).some((e) => e.id === "ad-1"),
        `${level} no debería recibir un muscle up`,
      );
    }
  });
});

describe("place: home", () => {
  const HOME_KIT = new Set([
    "body weight", "band", "resistance band", "dumbbell",
    "kettlebell", "stability ball", "medicine ball",
  ]);

  it("defaults to the gym when no place is given", async () => {
    assert.equal((await generateRoutine({ ...base })).place, "gym");
    assert.equal((await generateRoutine({ ...base, place: "home" })).place, "home");
  });

  it("never programs equipment outside the home kit", async () => {
    const r = await generateRoutine({ ...base, level: "advanced", daysPerWeek: 6, place: "home" });
    const outside = allExercises(r)
      .map((e) => e.equipment)
      .filter((eq) => !HOME_KIT.has(eq));
    assert.deepEqual(outside, [], `se coló equipo de gimnasio: ${outside}`);
  });

  it("flips the equipment ranking instead of just narrowing the pool", async () => {
    freezeRandom();
    const topChest = async (place?: "gym" | "home", equipment: string[] = []) => {
      const r = await generateRoutine({ ...base, equipment, ...(place ? { place } : {}) });
      return r.days.flatMap((d) => d.exercises).find((e) => e.slot === "chest")!.exercise.equipment;
    };

    // All candidates share a name and a word count, so only the rank separates
    // them. Barbell tops the gym list.
    assert.equal(await topChest(), "barbell");

    // Body weight over dumbbell is the assertion that bites: both are in the
    // home kit, and the gym ranking would have picked the dumbbell. Reverting
    // the home ranking therefore fails here rather than passing by accident.
    assert.equal(await topChest("gym", ["body weight", "dumbbell"]), "dumbbell");
    assert.equal(await topChest("home", ["body weight", "dumbbell"]), "body weight");

    restoreRandom?.();
    restoreRandom = null;
  });

  it("drops a slot rather than falling back to gym kit", async () => {
    const r = await generateRoutine({
      ...base, daysPerWeek: 6, place: "home", equipment: ["medicine ball"],
    });
    const used = allExercises(r);
    assert.ok(used.length > 0, "no programó nada en absoluto");
    assert.ok(
      used.every((e) => e.equipment === "medicine ball"),
      "el filtro de casa debe ser duro, no una preferencia",
    );
  });

  it("still falls back to the full pool at the gym (unchanged behaviour)", async () => {
    const r = await generateRoutine({ ...base, daysPerWeek: 6, equipment: ["medicine ball"] });
    assert.ok(
      allExercises(r).some((e) => e.equipment !== "medicine ball"),
      "en gimnasio la lista de equipo es una preferencia, no un límite",
    );
  });

  it("records the kit actually used so a home plan stays a home plan", async () => {
    const r = await generateRoutine({ ...base, place: "home" });
    assert.deepEqual([...r.equipment].sort(), [...HOME_KIT].sort());
  });

  it("ignores gym kit ticked alongside the home preset", async () => {
    const r = await generateRoutine({ ...base, place: "home", equipment: ["barbell"] });
    assert.deepEqual([...r.equipment].sort(), [...HOME_KIT].sort());
    assert.ok(allExercises(r).every((e) => HOME_KIT.has(e.equipment)));
  });

  it("honours a narrower home kit when one is ticked", async () => {
    const r = await generateRoutine({ ...base, place: "home", equipment: ["band", "barbell"] });
    assert.deepEqual(r.equipment, ["band"]);
    assert.ok(allExercises(r).every((e) => e.equipment === "band"));
  });
});
