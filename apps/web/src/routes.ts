/**
 * Tabla de rutas de la app. Vive fuera de `App` para que cualquier vista pueda
 * navegar sin recibir un callback por cada destino.
 */
export type View =
  | "today"
  | "routine"
  | "wizard"
  | "exercises"
  | "me"
  | "progress"
  | "billing"
  | "workout"
  | "admin";

export const PATHS: Record<View, string> = {
  today: "/",
  routine: "/routine",
  wizard: "/routine/new",
  exercises: "/exercises",
  me: "/me",
  progress: "/progress",
  billing: "/plans",
  workout: "/workout",
  admin: "/admin",
};

export const VIEW_BY_PATH: Record<string, View> = Object.fromEntries(
  Object.entries(PATHS).map(([view, path]) => [path, view as View]),
);
