import type { Lang } from "../languages";

export type ProgressKey =
  | "progress"
  | "statSessions"
  | "statVolume"
  | "statSets"
  | "statStreak"
  | "weeklyVolume"
  | "topExercises"
  | "personalRecords"
  | "historyTitle"
  | "noSessionsTitle"
  | "noSessionsText"
  | "est1rm"
  | "setsN";

export const progress: Record<Lang, Record<ProgressKey, string>> = {
  en: {
    progress: "Progress",
    statSessions: "Workouts",
    statVolume: "Total volume",
    statSets: "Sets",
    statStreak: "Week streak",
    weeklyVolume: "Volume per week",
    topExercises: "Most trained",
    personalRecords: "Personal records",
    historyTitle: "History",
    noSessionsTitle: "Nothing logged yet",
    noSessionsText: "Finish a workout and your stats will show up here.",
    est1rm: "est. 1RM",
    setsN: "{n} sets",
  },
  es: {
    progress: "Progreso",
    statSessions: "Entrenamientos",
    statVolume: "Volumen total",
    statSets: "Series",
    statStreak: "Racha (semanas)",
    weeklyVolume: "Volumen por semana",
    topExercises: "Más entrenados",
    personalRecords: "Récords personales",
    historyTitle: "Historial",
    noSessionsTitle: "Aún no has registrado nada",
    noSessionsText: "Termina un entrenamiento y tus estadísticas aparecerán aquí.",
    est1rm: "1RM est.",
    setsN: "{n} series",
  },
};
