import type { Lang } from "../languages";

export type CommonKey =
  | "tagline"
  | "close"
  | "language"
  | "theme"
  | "loading"
  | "cancel"
  | "save"
  | "delete"
  | "back"
  | "next"
  | "errGeneric"
  | "navCatalog"
  | "navMap"
  | "navRoutine"
  | "navProgress"
  | "navPlans"
  | "appName"
  | "skipToContent"
  | "themeToLight"
  | "themeToDark"
  | "account"
  | "mainNav"
  | "loadError";

export const common: Record<Lang, Record<CommonKey, string>> = {
  en: {
    tagline: "The strength is yours",
    close: "Close",
    language: "Language",
    theme: "Theme",
    loading: "Loading…",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    back: "Back",
    next: "Next",
    errGeneric: "Something went wrong. Try again.",
    navCatalog: "Catalog",
    navMap: "Muscle map",
    navRoutine: "Routine",
    navProgress: "Progress",
    navPlans: "Plans",

    appName: "Chamani",
    skipToContent: "Skip to content",
    themeToLight: "Switch to light theme",
    themeToDark: "Switch to dark theme",
    account: "Account",
    mainNav: "Main",
    loadError: "We couldn't load this. Try again.",
  },
  es: {
    tagline: "La fuerza es tuya",
    close: "Cerrar",
    language: "Idioma",
    theme: "Tema",
    loading: "Cargando…",
    cancel: "Cancelar",
    save: "Guardar",
    delete: "Eliminar",
    back: "Atrás",
    next: "Siguiente",
    errGeneric: "Algo salió mal. Inténtalo de nuevo.",
    navCatalog: "Catálogo",
    navMap: "Mapa muscular",
    navRoutine: "Rutina",
    navProgress: "Progreso",
    navPlans: "Planes",

    appName: "Chamani",
    skipToContent: "Saltar al contenido",
    themeToLight: "Cambiar a tema claro",
    themeToDark: "Cambiar a tema oscuro",
    account: "Cuenta",
    mainNav: "Principal",
    loadError: "No pudimos cargar esto. Vuelve a intentar.",
  },
};
