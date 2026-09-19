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
  | "guide"
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
  guide: "/guide",
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
 * Los temas del recorrido, en el orden del viaje real —crear, ajustar,
 * entrenar, ver que sirve—, no en el de la barra de pestañas: la guía cuenta
 * cómo se usa Chamani, no dónde están los botones.
 */
export const GUIDE_TOPICS = [
  "today",
  "plan",
  "swap",
  "workout",
  "streak",
  "progress",
  "exercises",
  "calculators",
  "pro",
] as const;

export type GuideTopic = (typeof GUIDE_TOPICS)[number];

export const guidePath = (id: GuideTopic) => `${PATHS.guide}/${id}`;

export const guideTopicOf = (path: string): GuideTopic | null =>
  GUIDE_TOPICS.find((id) => guidePath(id) === path) ?? null;

/**
 * Deja de ser el inverso 1-1 de `PATHS`: cada calculadora es una ruta propia
 * para que el atrás del navegador cierre la que esté abierta, pero ninguna es
 * una pestaña, así que todas apuntan a la misma vista.
 */
export const VIEW_BY_PATH: Record<string, View> = Object.fromEntries([
  ...Object.entries(PATHS).map(([view, path]) => [path, view as View]),
  ...CALCULATORS.map((id) => [calculatorPath(id), "calculators" as View]),
  ...GUIDE_TOPICS.map((id) => [guidePath(id), "guide" as View]),
]);
