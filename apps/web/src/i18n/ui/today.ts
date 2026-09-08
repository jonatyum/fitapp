import type { Lang } from "../languages";

export type TodayKey =
  | "todayTitle"
  | "todayGreeting"
  | "todayNext"
  | "todayDone"
  | "todayTrainAgain"
  | "todayAboutMin"
  | "todayHeroTitle"
  | "todayHeroText"
  | "todayHeroCta"
  | "todayExplore"
  | "todayNoPlanText"
  | "todayWeekSessions"
  | "todayWeekVolume"
  | "todaySeeProgress"
  | "todaySeePlan";

export const today: Record<Lang, Record<TodayKey, string>> = {
  en: {
    todayTitle: "Today",
    todayGreeting: "Hi, {name}",
    todayNext: "Up next",
    todayDone: "Trained today",
    todayTrainAgain: "Train again",
    todayAboutMin: "≈ {n} min",
    todayHeroTitle: "Your week's plan, built for you",
    todayHeroText:
      "Answer five questions and we build it around the kit you actually have. No account needed.",
    todayHeroCta: "Build my plan",
    todayExplore: "Browse exercises",
    todayNoPlanText: "Build one and today's workout shows up right here.",
    todayWeekSessions: "This week",
    todayWeekVolume: "Volume this week",
    todaySeeProgress: "See progress",
    todaySeePlan: "See the full plan",
  },
  es: {
    todayTitle: "Hoy",
    todayGreeting: "Hola, {name}",
    todayNext: "Te toca",
    todayDone: "Ya entrenaste hoy",
    todayTrainAgain: "Entrenar otra vez",
    todayAboutMin: "≈ {n} min",
    todayHeroTitle: "Tu plan de la semana, hecho para ti",
    todayHeroText:
      "Responde cinco preguntas y lo armamos con el equipo que tengas. No hace falta cuenta.",
    todayHeroCta: "Crear mi plan",
    todayExplore: "Ver ejercicios",
    todayNoPlanText: "Crea uno y aquí mismo aparecerá lo que toca hoy.",
    todayWeekSessions: "Esta semana",
    todayWeekVolume: "Volumen de la semana",
    todaySeeProgress: "Ver progreso",
    todaySeePlan: "Ver el plan completo",
  },
};
