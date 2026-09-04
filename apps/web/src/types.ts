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
  place: Place;
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

/** Where a plan is meant to be trained; drives the generator's equipment pool. */
export type Place = "gym" | "home";

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

// ── Subscriptions ───────────────────────────────────────────────────────────

export type ProviderId = "manual-qr" | "polar";
export type PaymentStatus = "pending" | "paid" | "failed" | "expired";

export interface Plan {
  code: string;
  name: string;
  priceCents: number;
  currency: string;
  /** 0 = never expires (the free plan). */
  periodDays: number;
  /** Pre-formatted by the API, e.g. "Bs 49.00". */
  amountLabel: string;
}

export interface BillingCatalog {
  plans: Plan[];
  providers: { id: ProviderId; enabled: boolean }[];
}

export interface Payment {
  reference: string;
  planCode: string;
  provider: ProviderId;
  status: PaymentStatus;
  amountCents: number;
  currency: string;
  amountLabel: string;
  createdAt: string;
  expiresAt: string | null;
  paidAt: string | null;
}

export interface Subscription {
  planCode: string;
  /** active | expired | cancelled | none */
  status: string;
  isPro: boolean;
  startedAt: string | null;
  expiresAt: string | null;
  pendingPayment: Payment | null;
}

/** What to show the payer for a QR Simple / bank transfer. */
export interface ChargeInstructions {
  bankName: string;
  accountName: string;
  accountNumber: string;
  qrImageUrl: string | null;
  reference: string;
  amountCents: number;
  currency: string;
  contact: string;
}

export type Charge =
  | { kind: "instructions"; instructions: ChargeInstructions }
  | { kind: "redirect"; url: string; externalId: string };

export interface CheckoutResult {
  payment: Payment;
  charge: Charge;
}
