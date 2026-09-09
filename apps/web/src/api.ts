import type {
  AdminPayment,
  AdminUser,
  Alternative,
  BillingCatalog,
  CheckoutResult,
  Exercise,
  ExerciseList,
  GeneratedRoutine,
  Goal,
  Level,
  Meta,
  Payment,
  Place,
  Routine,
  RoutineSummary,
  Stats,
  StatsSummary,
  Subscription,
  User,
  WorkoutSession,
} from "./types";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

/** Absolute URL for a media path stored in the dataset (e.g. "images/0001-x.jpg"). */
export function mediaUrl(path: string): string {
  return `${API_URL}/media/${path}`;
}

export interface ExerciseFilters {
  q?: string;
  bodyPart?: string;
  equipment?: string;
  target?: string;
  muscle?: string;
  /** "home" | "bodyweight" — shorthand for a set of equipment values */
  tag?: string;
  limit?: number;
  offset?: number;
}

/**
 * El catálogo va por `request` como todo lo demás: dejó de ser público al
 * cerrar la beta, y con `fetch` pelado se quedaría sin la cabecera del token.
 */
export async function fetchExercises(filters: ExerciseFilters): Promise<ExerciseList> {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== "") params.set(k, String(v));
  }
  return request<ExerciseList>(`/exercises?${params.toString()}`);
}

export const fetchMeta = () => request<Meta>("/meta");

/** Exercise count per muscle (target + secondary), for the muscle map. */
export const fetchMuscleCounts = () => request<Record<string, number>>("/muscles/counts");

export type { Exercise };

/** Cómo se entra en este despliegue, y si la beta está cerrada. */
export interface AuthConfig {
  googleClientId: string | null;
  closedBeta: boolean;
  passwordAuth: boolean;
}

// ── Authenticated calls ────────────────────────────────────────────────────

export const TOKEN_KEY = "fitapp:token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string | null) =>
  t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY);

/** Thrown for non-2xx responses; `code` is the API's machine-readable error. */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(init.body ? { "content-type": "application/json" } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body?.error ?? "http_error");
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

interface AuthResult {
  token: string;
  user: User;
}

export const apiRegister = (email: string, password: string, name: string) =>
  request<AuthResult>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });

export const apiLogin = (email: string, password: string) =>
  request<AuthResult>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const apiMe = () => request<User>("/auth/me");

export const apiUpdateProfile = (name: string) =>
  request<User>("/auth/me", { method: "PATCH", body: JSON.stringify({ name }) });

/** Sin `currentPassword` en las cuentas de Google: es la primera que tienen. */
export const apiChangePassword = (body: {
  currentPassword?: string;
  newPassword: string;
}) => request<User>("/auth/password", { method: "POST", body: JSON.stringify(body) });

export const apiDeleteAccount = (body: { password?: string; confirm?: string }) =>
  request<void>("/auth/account", { method: "DELETE", body: JSON.stringify(body) });

/** Which sign-in methods this deployment offers. */
export const apiAuthConfig = () => request<AuthConfig>("/auth/config");

/** Exchange a Google Identity Services ID token for a FitApp session. */
export const apiGoogleLogin = (credential: string) =>
  request<AuthResult>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });

// Routines

export interface GenerateInput {
  goal: Goal;
  level: Level;
  daysPerWeek: number;
  equipment: string[];
  place: Place;
}

export const apiGenerateRoutine = (input: GenerateInput) =>
  request<GeneratedRoutine>("/routines/generate", {
    method: "POST",
    body: JSON.stringify(input),
  });

/** Persist a generated plan; the exercise objects are flattened to ids. */
export const apiSaveRoutine = (routine: GeneratedRoutine, name: string) =>
  request<Routine>("/routines", {
    method: "POST",
    body: JSON.stringify({
      ...routine,
      name,
      days: routine.days.map((d) => ({
        label: d.label,
        focus: d.focus,
        exercises: d.exercises.map((e) => ({
          exerciseId: e.exercise.id,
          slot: e.slot,
          sets: e.sets,
          repsMin: e.repsMin,
          repsMax: e.repsMax,
          restSec: e.restSec,
        })),
      })),
    }),
  });

export const apiRoutines = () => request<RoutineSummary[]>("/routines");
export const apiRoutine = (id: string) => request<Routine>(`/routines/${id}`);

export const apiUpdateRoutine = (id: string, patch: { name?: string; active?: boolean }) =>
  request<RoutineSummary>(`/routines/${id}`, { method: "PATCH", body: JSON.stringify(patch) });

export const apiDeleteRoutine = (id: string) =>
  request<void>(`/routines/${id}`, { method: "DELETE" });

/**
 * Swap candidates for one slot. Stateless, so the generator preview (no
 * routine id yet) and a saved routine both use it.
 */
export const apiAlternatives = (input: {
  slot: string;
  level: Level;
  equipment: string[];
  place?: Place;
  exclude?: string[];
  limit?: number;
}) =>
  request<{ items: Alternative[] }>("/routines/alternatives", {
    method: "POST",
    body: JSON.stringify(input),
  }).then((r) => r.items);

/** Replace one exercise of a saved routine, keeping its slot and prescription. */
export const apiSwapRoutineExercise = (
  routineId: string,
  routineExerciseId: string,
  exerciseId: string,
) =>
  request<Routine>(`/routines/${routineId}/exercises/${routineExerciseId}`, {
    method: "PATCH",
    body: JSON.stringify({ exerciseId }),
  });

// Workout sessions

export const apiStartSession = (dayId?: string) =>
  request<WorkoutSession>("/sessions", {
    method: "POST",
    body: JSON.stringify(dayId ? { dayId } : {}),
  });

export interface SetInput {
  exerciseId: string;
  setNumber: number;
  reps: number;
  weight: number;
}

export const apiSaveSession = (
  id: string,
  body: { sets: SetInput[]; notes?: string; finish?: boolean },
) => request<WorkoutSession>(`/sessions/${id}`, { method: "PUT", body: JSON.stringify(body) });

export const apiSessions = (limit = 30) =>
  request<WorkoutSession[]>(`/sessions?limit=${limit}`);

export const apiDeleteSession = (id: string) =>
  request<void>(`/sessions/${id}`, { method: "DELETE" });

export const apiStats = () => request<Stats>("/stats");

/** Racha y semana en curso; libre, a diferencia de `/stats`. */
export const apiStatsSummary = () => request<StatsSummary>("/stats/summary");

// Administración

export const apiAdminPayments = (params: { status?: string; q?: string } = {}) => {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) qs.set(k, v);
  return request<AdminPayment[]>(`/admin/payments?${qs.toString()}`);
};

/** Da por bueno un pago y arranca el periodo. Sólo tras ver el extracto. */
export const apiConfirmPayment = (reference: string) =>
  request<{ payment: AdminPayment; subscription: Subscription }>(
    `/admin/payments/${reference}/confirm`,
    { method: "POST" },
  );

export const apiRejectPayment = (reference: string) =>
  request<{ ok: boolean }>(`/admin/payments/${reference}/reject`, { method: "POST" });

export const apiAdminUsers = (q = "") =>
  request<AdminUser[]>(`/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`);

export const apiSetUserRole = (id: string, role: string) =>
  request<AdminUser>(`/admin/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });

// Subscriptions

/** Public: the plan catalog and which ways to pay this deployment offers. */
export const apiBillingPlans = () => request<BillingCatalog>("/billing/plans");

export const apiSubscription = () => request<Subscription>("/billing/subscription");

/** Opens a charge, or hands back the pending one if the user already has it. */
export const apiCheckout = (planCode: string, provider?: string) =>
  request<CheckoutResult>("/billing/checkout", {
    method: "POST",
    body: JSON.stringify({ planCode, ...(provider ? { provider } : {}) }),
  });

export const apiPayments = () => request<Payment[]>("/billing/payments");

/**
 * "Ya transferí": el número de operación del banco. No marca el pago como
 * cobrado — eso sólo lo hace un admin que ha visto el extracto.
 */
export const apiDeclarePayment = (
  reference: string,
  body: { operation: string; paidOn?: string; bank?: string },
) =>
  request<Payment>(`/billing/payments/${reference}/declare`, {
    method: "POST",
    body: JSON.stringify(body),
  });

/** Re-reads one payment, asking the provider when it has an API of its own. */
export const apiPayment = (reference: string) =>
  request<Payment>(`/billing/payments/${reference}`);
