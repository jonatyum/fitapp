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
  | "settings"
  | "calculators"
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
  settings: "/settings",
  calculators: "/calculators",
  admin: "/admin",
};

/**
 * Cada id de aquí es una ruta que existe y una pantalla que se pinta: que el
 * tipo sea exhaustivo es lo que impide publicar el enlace a una calculadora
 * antes que la calculadora.
 */
export const CALCULATORS = [
  "bmi",
  "bmr",
  "tdee",
  "bodyfat",
  "macros",
  "onerm",
  "heartrate",
] as const;

export type CalculatorId = (typeof CALCULATORS)[number];

export const calculatorPath = (id: CalculatorId) => `${PATHS.calculators}/${id}`;

export const calculatorOf = (path: string): CalculatorId | null =>
  CALCULATORS.find((id) => calculatorPath(id) === path) ?? null;

/**
 * Deja de ser el inverso 1-1 de `PATHS`: cada calculadora es una ruta propia
 * para que el atrás del navegador cierre la que esté abierta, pero ninguna es
 * una pestaña, así que todas apuntan a la misma vista.
 */
export const VIEW_BY_PATH: Record<string, View> = Object.fromEntries([
  ...Object.entries(PATHS).map(([view, path]) => [path, view as View]),
  ...CALCULATORS.map((id) => [calculatorPath(id), "calculators" as View]),
]);
