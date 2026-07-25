/**
 * Routine generator.
 *
 * Turns a short questionnaire (goal, days/week, level, available equipment)
 * into a concrete plan: one template per training day, each day a list of
 * muscle "slots" filled with real exercises from the dataset.
 */
import { prisma } from "./db.js";

export type Goal = "strength" | "hypertrophy" | "endurance" | "fatloss";
export type Level = "beginner" | "intermediate" | "advanced";

export const GOALS: Goal[] = ["strength", "hypertrophy", "endurance", "fatloss"];
export const LEVELS: Level[] = ["beginner", "intermediate", "advanced"];

/**
 * Slot -> dataset muscle names. The dataset is inconsistent between `target`
 * and `secondary_muscles` (quads/quadriceps, abs/abdominals, delts/deltoids),
 * so every slot carries all the synonyms it should match.
 */
const SLOT_KEYS: Record<string, string[]> = {
  chest: ["pectorals", "chest", "upper chest"],
  lats: ["lats"],
  "upper back": ["upper back", "traps", "rhomboids", "trapezius"],
  shoulders: ["delts", "deltoids", "shoulders", "rear deltoids"],
  biceps: ["biceps", "brachialis"],
  triceps: ["triceps"],
  forearms: ["forearms", "wrist flexors", "wrist extensors"],
  quads: ["quads", "quadriceps"],
  hamstrings: ["hamstrings"],
  glutes: ["glutes"],
  calves: ["calves", "soleus"],
  abs: ["abs", "abdominals", "core", "lower abs"],
  obliques: ["obliques", "serratus anterior"],
  spine: ["spine", "lower back"],
  adductors: ["adductors", "inner thighs", "groin"],
  abductors: ["abductors"],
  cardio: ["cardiovascular system"],
};

/** Slots trained with heavy multi-joint work — they get the full prescription. */
const COMPOUND = new Set([
  "chest",
  "lats",
  "upper back",
  "shoulders",
  "quads",
  "hamstrings",
  "glutes",
  "spine",
]);

interface DayTemplate {
  /** translated in the UI through the `dayLabel` dictionary */
  label: string;
  /** priority-ordered; the first N are used, N depends on the level */
  slots: string[];
}

const FULL_A: DayTemplate = {
  label: "fullbody-a",
  slots: ["quads", "chest", "lats", "shoulders", "abs", "hamstrings", "triceps", "calves"],
};
const FULL_B: DayTemplate = {
  label: "fullbody-b",
  slots: ["hamstrings", "upper back", "chest", "glutes", "biceps", "abs", "shoulders", "calves"],
};
const FULL_C: DayTemplate = {
  label: "fullbody-c",
  slots: ["glutes", "lats", "shoulders", "quads", "triceps", "obliques", "chest", "calves"],
};
const PUSH: DayTemplate = {
  label: "push",
  slots: ["chest", "shoulders", "triceps", "chest", "shoulders", "triceps", "abs", "obliques"],
};
const PULL: DayTemplate = {
  label: "pull",
  slots: ["lats", "upper back", "biceps", "lats", "upper back", "biceps", "forearms", "spine"],
};
const LEGS: DayTemplate = {
  label: "legs",
  slots: ["quads", "hamstrings", "glutes", "quads", "calves", "hamstrings", "abs", "adductors"],
};
const UPPER: DayTemplate = {
  label: "upper",
  slots: ["chest", "lats", "shoulders", "upper back", "triceps", "biceps", "forearms", "abs"],
};
const LOWER: DayTemplate = {
  label: "lower",
  slots: ["quads", "hamstrings", "glutes", "calves", "abs", "adductors", "spine", "abductors"],
};

interface Split {
  id: string;
  days: DayTemplate[];
}

/** One split per days-per-week, 2 through 6. */
const SPLITS: Record<number, Split> = {
  2: { id: "fullbody", days: [FULL_A, FULL_B] },
  3: { id: "fullbody", days: [FULL_A, FULL_B, FULL_C] },
  4: { id: "upperlower", days: [UPPER, LOWER, UPPER, LOWER] },
  5: { id: "ppl-ul", days: [PUSH, PULL, LEGS, UPPER, LOWER] },
  6: { id: "ppl", days: [PUSH, PULL, LEGS, PUSH, PULL, LEGS] },
};

/** Exercises per day. */
const VOLUME: Record<Level, number> = { beginner: 5, intermediate: 6, advanced: 8 };

interface Prescription {
  sets: number;
  repsMin: number;
  repsMax: number;
  restSec: number;
}

const BASE_PRESCRIPTION: Record<Goal, Prescription> = {
  strength: { sets: 5, repsMin: 4, repsMax: 6, restSec: 180 },
  hypertrophy: { sets: 4, repsMin: 8, repsMax: 12, restSec: 90 },
  endurance: { sets: 3, repsMin: 15, repsMax: 20, restSec: 45 },
  fatloss: { sets: 3, repsMin: 12, repsMax: 15, restSec: 45 },
};

function prescribe(goal: Goal, level: Level, slot: string): Prescription {
  const base = BASE_PRESCRIPTION[goal];
  const isolation = !COMPOUND.has(slot);
  let { sets, repsMin, repsMax, restSec } = base;

  if (level === "beginner") sets = Math.max(2, sets - 1);
  if (level === "advanced" && goal !== "strength") sets += 1;

  if (isolation) {
    sets = Math.max(2, sets - 1);
    restSec = Math.max(45, restSec - 60);
    // Heavy low-rep work on isolation movements is a poor trade-off.
    if (goal === "strength") {
      repsMin = 8;
      repsMax = 10;
    } else {
      repsMax += 3;
    }
  }
  if (slot === "cardio") return { sets: 1, repsMin: 10, repsMax: 15, restSec: 60 };

  return { sets, repsMin, repsMax, restSec };
}

// --- exercise pool -------------------------------------------------------

export interface PoolExercise {
  id: string;
  name: string;
  target: string;
  equipment: string;
  bodyPart: string;
  secondaryMuscles: string[];
  gifUrl: string;
  image: string;
}

let poolCache: PoolExercise[] | null = null;

async function loadPool(): Promise<PoolExercise[]> {
  if (!poolCache) {
    poolCache = await prisma.exercise.findMany({
      select: {
        id: true,
        name: true,
        target: true,
        equipment: true,
        bodyPart: true,
        secondaryMuscles: true,
        gifUrl: true,
        image: true,
      },
    });
  }
  return poolCache;
}

// The dataset mixes real lifts with mobility drills and circus calisthenics.
// Names are the only signal available, so the filters below are name-based.

/** Never programmed as a working set. */
const EXCLUDE_RE =
  /\b(stretch|stretches|yoga|pose|foam roll|roller|mobility|warm[- ]?up|breathing|scapular|dead hang|hang\b)/i;

/** Impressive, but not something to prescribe below an advanced level. */
const ADVANCED_RE =
  /\b(muscle[- ]up|back lever|front lever|planche|human flag|handstand|iron cross|skin the cat|one arm|single arm|archer|360|windshield)\b/i;

/** Classic multi-joint movement patterns. */
const COMPOUND_RE =
  /\b(squat|deadlift|press|row|pull[- ]?up|chin[- ]?up|lunge|dip|thrust|clean|snatch|pulldown|pull down|step[- ]?up|hip thrust)\b/i;

/** Classic single-joint movement patterns. */
const ISOLATION_RE =
  /\b(curl|extension|raise|fly|flye|pushdown|push down|kickback|crunch|shrug|pullover|adduction|abduction|twist|sit[- ]?up|leg lift)\b/i;

/**
 * Equipment preference. Loadable equipment ranks first because it is what
 * makes progressive overload — and therefore the progress tracker — work.
 */
const COMPOUND_EQUIPMENT = [
  "barbell",
  "dumbbell",
  "leverage machine",
  "smith machine",
  "cable",
  "body weight",
  "kettlebell",
  "olympic barbell",
  "trap bar",
];
const ISOLATION_EQUIPMENT = [
  "dumbbell",
  "cable",
  "leverage machine",
  "ez barbell",
  "barbell",
  "body weight",
  "band",
  "kettlebell",
];

const rankOf = (list: string[], equipment: string) => {
  const i = list.indexOf(equipment);
  return i === -1 ? 0 : (list.length - i) * 3;
};

function scoreExercise(ex: PoolExercise, keys: string[], compound: boolean, level: Level): number {
  if (EXCLUDE_RE.test(ex.name)) return -Infinity;
  if (ADVANCED_RE.test(ex.name) && level !== "advanced") return -Infinity;

  // Primary target beats an exercise that only lists the muscle as secondary.
  let score = keys.includes(ex.target) ? 100 : 40;

  if (compound) {
    score += COMPOUND_RE.test(ex.name) ? 45 : 0;
    score += ISOLATION_RE.test(ex.name) ? -20 : 0;
    score += rankOf(COMPOUND_EQUIPMENT, ex.equipment);
    // Multi-joint work recruits helpers; a long secondary list corroborates it.
    score += 4 * Math.min(ex.secondaryMuscles.length, 4);
  } else {
    score += ISOLATION_RE.test(ex.name) ? 35 : 0;
    score += rankOf(ISOLATION_EQUIPMENT, ex.equipment);
    score -= 5 * Math.min(ex.secondaryMuscles.length, 4);
  }

  // Long names are usually oddly specific variants ("standing wide-grip …").
  score -= Math.max(0, ex.name.split(" ").length - 5) * 3;

  return score;
}

/** Pick at random among the best candidates so re-generating gives variety. */
const TOP_K = 4;

export interface GenerateInput {
  goal: Goal;
  level: Level;
  daysPerWeek: number;
  /** empty = assume everything is available */
  equipment: string[];
}

export interface GeneratedExercise extends Prescription {
  slot: string;
  exercise: PoolExercise;
}

export interface GeneratedDay {
  label: string;
  focus: string[];
  exercises: GeneratedExercise[];
}

export interface GeneratedRoutine {
  name: string;
  goal: Goal;
  level: Level;
  daysPerWeek: number;
  split: string;
  equipment: string[];
  days: GeneratedDay[];
}

export async function generateRoutine(input: GenerateInput): Promise<GeneratedRoutine> {
  const daysPerWeek = Math.min(6, Math.max(2, Math.round(input.daysPerWeek)));
  const split = SPLITS[daysPerWeek];
  const pool = await loadPool();
  const equipment = input.equipment.length ? new Set(input.equipment) : null;
  const perDay = VOLUME[input.level];

  const days: GeneratedDay[] = split.days.map((tpl) => {
    const slots = tpl.slots.slice(0, perDay);
    if (input.goal === "fatloss" || input.goal === "endurance") slots.push("cardio");

    // Exercises are unique within a day; across days repeats are fine (and
    // wanted — a 6-day PPL repeats push/pull/legs by design).
    const usedInDay = new Set<string>();
    const exercises: GeneratedExercise[] = [];

    for (const slot of slots) {
      const keys = SLOT_KEYS[slot] ?? [slot];
      const compound = COMPOUND.has(slot);

      const matches = pool.filter(
        (ex) =>
          !usedInDay.has(ex.id) &&
          (keys.includes(ex.target) || ex.secondaryMuscles.some((m) => keys.includes(m))),
      );
      // The equipment list is a preference, not a hard filter: if it leaves a
      // slot with nothing to program, fall back to the full pool.
      const available = equipment ? matches.filter((ex) => equipment.has(ex.equipment)) : matches;
      const candidates = available.length ? available : matches;

      const ranked = candidates
        .map((ex) => ({ ex, score: scoreExercise(ex, keys, compound, input.level) }))
        .filter((c) => c.score > -Infinity)
        .sort((a, b) => b.score - a.score)
        .slice(0, TOP_K);
      if (!ranked.length) continue;

      const best = ranked[Math.floor(Math.random() * ranked.length)].ex;
      usedInDay.add(best.id);
      exercises.push({ slot, exercise: best, ...prescribe(input.goal, input.level, slot) });
    }

    return {
      label: tpl.label,
      focus: [...new Set(slots.filter((s) => s !== "cardio"))].slice(0, 4),
      exercises,
    };
  });

  return {
    name: "",
    goal: input.goal,
    level: input.level,
    daysPerWeek,
    split: split.id,
    equipment: input.equipment,
    days,
  };
}
