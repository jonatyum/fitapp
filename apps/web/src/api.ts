import type {
  Exercise,
  ExerciseList,
  GeneratedRoutine,
  Goal,
  Level,
  Meta,
  Routine,
  RoutineSummary,
  Stats,
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
  limit?: number;
  offset?: number;
}

export async function fetchExercises(filters: ExerciseFilters): Promise<ExerciseList> {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== "") params.set(k, String(v));
  }
  const res = await fetch(`${API_URL}/exercises?${params.toString()}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export async function fetchMeta(): Promise<Meta> {
  const res = await fetch(`${API_URL}/meta`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

/** Exercise count per muscle (target + secondary), for the muscle map. */
export async function fetchMuscleCounts(): Promise<Record<string, number>> {
  const res = await fetch(`${API_URL}/muscles/counts`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export type { Exercise };

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

/** Which sign-in methods this deployment offers. */
export const apiAuthConfig = () =>
  request<{ googleClientId: string | null }>("/auth/config");

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
