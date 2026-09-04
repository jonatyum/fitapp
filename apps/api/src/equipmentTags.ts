/**
 * Equipment groupings behind the "train at home" tags.
 *
 * The dataset's `equipment` column is the only signal there is, and it is
 * coarse: "body weight" covers both a squat on the floor and a muscle-up on a
 * bar. So these sets describe *what someone plausibly owns*, not what a
 * movement strictly requires.
 */

/** The kit a home trainee realistically has. */
export const HOME_EQUIPMENT = [
  "body weight",
  "band",
  "resistance band",
  "dumbbell",
  "kettlebell",
  "stability ball",
  "medicine ball",
] as const;

/**
 * Nothing but the floor — as far as `equipment` can tell. Some of these still
 * want a bar (pull-ups, dips); the column does not distinguish them, and the
 * catalog tag is honest enough at this granularity.
 */
export const BODYWEIGHT_EQUIPMENT = ["body weight"] as const;

export const EXERCISE_TAGS = {
  home: HOME_EQUIPMENT,
  bodyweight: BODYWEIGHT_EQUIPMENT,
} as const;

export type ExerciseTag = keyof typeof EXERCISE_TAGS;

export const isExerciseTag = (v: unknown): v is ExerciseTag =>
  typeof v === "string" && v in EXERCISE_TAGS;
