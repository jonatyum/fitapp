export interface Exercise {
  id: string;
  name: string;
  category: string;
  bodyPart: string;
  equipment: string;
  target: string;
  muscleGroup: string;
  secondaryMuscles: string[];
  instructions: Record<string, string>;
  instructionSteps: Record<string, string[]>;
  image: string;
  gifUrl: string;
  mediaId: string;
  attribution: string;
}

export interface ExerciseList {
  total: number;
  limit: number;
  offset: number;
  items: Exercise[];
}

export interface Meta {
  bodyParts: string[];
  equipment: string[];
  targets: string[];
}

// ── Phase 2 — account, routines, workout logging ───────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  /** Google profile picture, when the account is linked to Google */
  avatarUrl: string | null;
}

export type Goal = "strength" | "hypertrophy" | "endurance" | "fatloss";
export type Level = "beginner" | "intermediate" | "advanced";

export interface Prescription {
  sets: number;
  repsMin: number;
  repsMax: number;
  restSec: number;
}

/** An exercise inside a generated (not yet saved) plan. */
export interface GeneratedExercise extends Prescription {
  slot: string;
  exercise: Exercise;
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

/** An exercise inside a saved routine. */
export interface RoutineExercise extends Prescription {
  id: string;
  position: number;
  slot: string;
  exerciseId: string;
  exercise: Exercise;
}

export interface RoutineDay {
  id: string;
  position: number;
  label: string;
  focus: string[];
  exercises: RoutineExercise[];
}

export interface Routine {
  id: string;
  name: string;
  goal: Goal;
  level: Level;
  daysPerWeek: number;
  split: string;
  equipment: string[];
  active: boolean;
  createdAt: string;
  days: RoutineDay[];
}

export interface RoutineSummary extends Omit<Routine, "days"> {
  _count: { days: number; sessions: number };
}

export interface SetLog {
  id: string;
  exerciseId: string;
  setNumber: number;
  reps: number;
  weight: number;
}

export interface WorkoutSession {
  id: string;
  routineId: string | null;
  dayId: string | null;
  startedAt: string;
  finishedAt: string | null;
  notes: string | null;
  sets: SetLog[];
  day: { id: string; label: string; position: number } | null;
  routine: { id: string; name: string } | null;
  /** only present on the history list */
  volume?: number;
  setCount?: number;
}

export interface Stats {
  totalSessions: number;
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  sessionsThisWeek: number;
  streakWeeks: number;
  weekly: { week: string; volume: number; sessions: number }[];
  topExercises: { exerciseId: string; name: string; gifUrl: string; volume: number; sets: number }[];
  records: { exerciseId: string; name: string; bestWeight: number; bestReps: number; est1rm: number }[];
}
