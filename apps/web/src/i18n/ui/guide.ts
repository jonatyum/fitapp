import type { Lang } from "../languages";

export type GuideKey =
  | "navGuide"
  | "guideTitle"
  | "guideLead"
  | "guideStart"
  | "guideStepOf"
  | "guidePrev"
  | "guideNext"
  | "guideFinish"
  | "guideTryIt"
  | "guideInviteTitle"
  | "guideInviteText"
  | "guideInviteCta"
  | "guideInviteDismiss"
  | "guideUpdatedTitle"
  | "guideUpdatedText";

export const guide: Record<Lang, Record<GuideKey, string>> = {
  en: {
    navGuide: "How Chamani works",
    guideTitle: "How Chamani works",
    guideLead: "Nine short steps through everything the app does. Read it now or come back whenever.",
    guideStart: "Start the tour",
    guideStepOf: "Step {n} of {total}",
    guidePrev: "Back",
    guideNext: "Next",
    guideFinish: "Done",
    guideTryIt: "Try it",
    guideInviteTitle: "New here?",
    guideInviteText: "Nine short steps through everything Chamani does.",
    guideInviteCta: "Show me",
    guideInviteDismiss: "Not now",
    guideUpdatedTitle: "The guide has something new",
    guideUpdatedText: "We added what is new since you last read it.",
  },
  es: {
    navGuide: "Cómo funciona Chamani",
    guideTitle: "Cómo funciona Chamani",
    guideLead: "Nueve pasos cortos por todo lo que hace la app. Léelo ahora o vuelve cuando quieras.",
    guideStart: "Empezar el recorrido",
    guideStepOf: "Paso {n} de {total}",
    guidePrev: "Anterior",
    guideNext: "Siguiente",
    guideFinish: "Terminar",
    guideTryIt: "Probarlo",
    guideInviteTitle: "¿Primera vez por aquí?",
    guideInviteText: "Nueve pasos cortos por todo lo que hace Chamani.",
    guideInviteCta: "Ver la guía",
    guideInviteDismiss: "Ahora no",
    guideUpdatedTitle: "La guía tiene algo nuevo",
    guideUpdatedText: "Añadimos lo que cambió desde la última vez que la leíste.",
  },
};
