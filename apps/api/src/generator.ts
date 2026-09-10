/**
 * Routine generator.
 *
 * Turns a short questionnaire (goal, days/week, level, available equipment)
 * into a concrete plan: one template per training day, each day a list of
 * muscle "slots" filled with real exercises from the dataset.
 */
import { prisma } from "./db.js";
import { HOME_EQUIPMENT } from "./equipmentTags.js";

export type Goal = "strength" | "hypertrophy" | "endurance" | "fatloss";
export type Level = "beginner" | "intermediate" | "advanced";
/** Where the plan will be trained. Drives the equipment pool and its ranking. */
export type Place = "gym" | "home";

export const GOALS: Goal[] = ["strength", "hypertrophy", "endurance", "fatloss"];
export const LEVELS: Level[] = ["beginner", "intermediate", "advanced"];
export const PLACES: Place[] = ["gym", "home"];

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
  /**
   * Músculo primario ponderado (data/primary-muscles.json). Opcionales porque
   * un ejercicio que el JSON no cubra sigue siendo programable: sin ellos el
   * ranking cae al `target` del dataset, que es como funcionaba antes.
   */
  primaryMuscle?: string | null;
  primaryScore?: number | null;
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
        primaryMuscle: true,
        primaryScore: true,
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

/**
 * Same idea for `place: "home"`, but the order is inverted: body weight and
 * bands come first because they are what the trainee actually has. Reusing the
 * gym ranking here would bury a push-up under a dumbbell press for someone who
 * owns no dumbbells.
 */
const HOME_COMPOUND_EQUIPMENT = [
  "body weight",
  "dumbbell",
  "kettlebell",
  "band",
  "resistance band",
  "medicine ball",
  "stability ball",
];
const HOME_ISOLATION_EQUIPMENT = [
  "body weight",
  "band",
  "resistance band",
  "dumbbell",
  "kettlebell",
  "medicine ball",
  "stability ball",
];

const rankOf = (list: string[], equipment: string) => {
  const i = list.indexOf(equipment);
  return i === -1 ? 0 : (list.length - i) * 3;
};

/**
 * Debajo de esto el ejercicio estira o moviliza el músculo, no lo entrena
 * («hamstring stretch», «ankle circles»). Coge lo que el filtro por nombre no
 * ve, que es la mitad de los estiramientos del dataset.
 */
const MIN_TRAINABLE_SCORE = 4;

/**
 * Si el ejercicio entrena el músculo del slot. Con ponderación manda ella; el
 * `target` del dataset sólo decide cuando el JSON no cubre el ejercicio.
 */
const matchesSlot = (ex: PoolExercise, keys: string[]): boolean =>
  ex.primaryMuscle ? keys.includes(ex.primaryMuscle) : keys.includes(ex.target);

function scoreExercise(
  ex: PoolExercise,
  keys: string[],
  compound: boolean,
  level: Level,
  place: Place,
): number {
  if (EXCLUDE_RE.test(ex.name)) return -Infinity;
  if (ADVANCED_RE.test(ex.name) && level !== "advanced") return -Infinity;
  if (ex.primaryScore != null && ex.primaryScore < MIN_TRAINABLE_SCORE) return -Infinity;

  // Primary target beats an exercise that only lists the muscle as secondary.
  // Cuál es el primario lo dice la ponderación, no el `target` del dataset:
  // para un slot de glúteo, éste etiqueta igual un hip thrust que una
  // sentadilla. Sin ponderación (un ejercicio que el JSON no cubra) el criterio
  // es el de antes.
  const weighted = ex.primaryMuscle && keys.includes(ex.primaryMuscle) ? ex.primaryScore : null;
  let score = weighted != null || (!ex.primaryMuscle && keys.includes(ex.target)) ? 100 : 40;

  if (compound) {
    score += COMPOUND_RE.test(ex.name) ? 45 : 0;
    score += ISOLATION_RE.test(ex.name) ? -20 : 0;
    score += rankOf(place === "home" ? HOME_COMPOUND_EQUIPMENT : COMPOUND_EQUIPMENT, ex.equipment);
    // Multi-joint work recruits helpers; a long secondary list corroborates it.
    score += 4 * Math.min(ex.secondaryMuscles.length, 4);
  } else {
    score += ISOLATION_RE.test(ex.name) ? 35 : 0;
    score += rankOf(place === "home" ? HOME_ISOLATION_EQUIPMENT : ISOLATION_EQUIPMENT, ex.equipment);
    score -= 5 * Math.min(ex.secondaryMuscles.length, 4);
  }

  // Long names are usually oddly specific variants ("standing wide-grip …").
  score -= Math.max(0, ex.name.split(" ").length - 5) * 3;

  // La ponderación escala, no suma: sumándola, un ejercicio que entrena el
  // slot a medias («clean and press» para glúteo, 7) le ganaba a uno que va
  // directo (peso muerto, 9) sólo por acumular bonus de patrón y de equipo.
  return weighted != null ? score * (weighted / 10) : score;
}

/** Pick at random among the best candidates so re-generating gives variety. */
const TOP_K = 4;

export interface GenerateInput {
  goal: Goal;
  level: Level;
  daysPerWeek: number;
  /** empty = assume everything is available */
  equipment: string[];
  /** defaults to "gym", which is the behaviour this generator always had */
  place?: Place;
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
  place: Place;
  days: GeneratedDay[];
}

export interface AlternativesInput {
  /** muscle slot the exercise occupies in the plan, e.g. "chest" */
  slot: string;
  level: Level;
  /** the plan's kit; empty means everything is available */
  equipment: string[];
  place?: Place;
  /** exercise ids already in the same day, so we never offer a duplicate */
  exclude?: string[];
  limit?: number;
}

/** An alternative, plus whether it fits the kit the plan was built with. */
export interface Alternative extends PoolExercise {
  fitsKit: boolean;
}

/**
 * Exercises that can take over a slot, best first.
 *
 * Same scoring the generator uses to fill the slot in the first place, so the
 * order the user sees matches the reasoning behind the plan. It differs from
 * generation in one deliberate way: generation treats the home kit as a hard
 * boundary, but a manual swap is an explicit choice, so out-of-kit options are
 * still offered — ranked below the ones that fit and flagged with `fitsKit`.
 * Hiding them would strand someone whose only barbell is taken.
 */
export async function alternativesFor(input: AlternativesInput): Promise<Alternative[]> {
  const pool = await loadPool();
  const place: Place = input.place === "home" ? "home" : "gym";
  const keys = SLOT_KEYS[input.slot] ?? [input.slot];
  const compound = COMPOUND.has(input.slot);
  const excluded = new Set(input.exclude ?? []);
  const kit = input.equipment.length ? new Set(input.equipment) : null;

  const ranked = pool
    .filter(
      (ex) =>
        !excluded.has(ex.id) &&
        (matchesSlot(ex, keys) || ex.secondaryMuscles.some((m) => keys.includes(m))),
    )
    .map((ex) => ({
      ex,
      fitsKit: kit ? kit.has(ex.equipment) : true,
      // Whether the slot is what the exercise actually trains, rather than a
      // muscle it happens to list as secondary. Generation never had to care:
      // it only ever looks at its top four candidates, where a primary match
      // always wins. A swap menu of 24 reaches far enough down to start
      // offering an elliptical as a substitute for a squat.
      primary: matchesSlot(ex, keys),
      score: scoreExercise(ex, keys, compound, input.level, place),
    }))
    .filter((c) => c.score > -Infinity)
    // Two tiers before score: an exercise the user cannot perform today is
    // never the better suggestion, and neither is one that does not train the
    // muscle the slot exists for.
    .sort(
      (a, b) =>
        Number(b.fitsKit) - Number(a.fitsKit) ||
        Number(b.primary) - Number(a.primary) ||
        b.score - a.score,
    );

  const limit = Math.min(60, Math.max(1, input.limit ?? 24));

  // Straight score order returns eight variations of the barbell bench press,
  // which is useless as a swap menu: someone changing an exercise wants a
  // different movement, not a different grip on the same one. So the list is
  // dealt round-robin across equipment, best of each first — bench, dumbbell
  // press, machine press, cable fly, push-up — and only then second choices.
  // Buckets are grouped by tier first and dealt tier by tier, so variety never
  // promotes a worse tier: the list fills up with equipment variety among the
  // exercises that fit and actually train the slot before it offers anything
  // else at all.
  const tiers = new Map<string, Map<string, typeof ranked>>();
  for (const c of ranked) {
    const tier = `${c.fitsKit ? "1" : "0"}${c.primary ? "1" : "0"}`;
    const byEquipment = tiers.get(tier) ?? new Map<string, typeof ranked>();
    if (!tiers.has(tier)) tiers.set(tier, byEquipment);
    const bucket = byEquipment.get(c.ex.equipment);
    if (bucket) bucket.push(c);
    else byEquipment.set(c.ex.equipment, [c]);
  }

  const out: typeof ranked = [];
  for (const byEquipment of tiers.values()) {
    if (out.length >= limit) break;
    const buckets = [...byEquipment.values()];
    for (let round = 0; out.length < limit; round++) {
      let dealt = false;
      for (const b of buckets) {
        if (round < b.length) {
          out.push(b[round]);
          dealt = true;
          if (out.length === limit) break;
        }
      }
      if (!dealt) break;
    }
  }

  // Se devuelve en el orden en que se repartió, no por score: reordenar por
  // calidad vuelve a amontonar seis variantes de barra antes de la primera
  // mancuerna, que es justo lo que el reparto evita. Cada vuelta ya sale de
  // mejor a peor, así que la primera pantalla es "la mejor de cada equipo".
  return out.map(({ ex, fitsKit }) => ({ ...ex, fitsKit }));
}

export async function generateRoutine(input: GenerateInput): Promise<GeneratedRoutine> {
  const daysPerWeek = Math.min(6, Math.max(2, Math.round(input.daysPerWeek)));
  const split = SPLITS[daysPerWeek];
  const pool = await loadPool();
  const place: Place = input.place === "home" ? "home" : "gym";
  const perDay = VOLUME[input.level];

  // At home the kit is a hard boundary, so whatever the user picked is
  // intersected with it; picking nothing that fits means the whole home kit.
  const chosen = input.equipment.length ? new Set(input.equipment) : null;
  let allowed: Set<string> | null = chosen;
  if (place === "home") {
    const home = new Set<string>(HOME_EQUIPMENT);
    const narrowed = chosen ? [...chosen].filter((e) => home.has(e)) : [];
    allowed = narrowed.length ? new Set(narrowed) : home;
  }

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
          (matchesSlot(ex, keys) || ex.secondaryMuscles.some((m) => keys.includes(m))),
      );
      const available = allowed ? matches.filter((ex) => allowed.has(ex.equipment)) : matches;

      // In the gym the equipment list is a preference: an empty slot falls back
      // to the full pool. At home it is a hard boundary — falling back would
      // quietly prescribe a barbell row to someone who owns no barbell, which
      // is worse than leaving the slot out.
      const candidates = available.length ? available : place === "home" ? [] : matches;

      const ranked = candidates
        .map((ex) => ({ ex, score: scoreExercise(ex, keys, compound, input.level, place) }))
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
    // The kit actually used, not just what was ticked: this is what records a
    // home plan as a home plan, without needing a new column.
    equipment: allowed ? [...allowed] : input.equipment,
    place,
    days,
  };
}
