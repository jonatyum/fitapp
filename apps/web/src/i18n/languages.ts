// Idiomas soportados por la interfaz. El dataset trae instrucciones en más
// idiomas, pero la app solo muestra español (por defecto) e inglés.
export const LANGS = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
] as const;

export type Lang = (typeof LANGS)[number]["code"];

export const DEFAULT_LANG: Lang = "es";

export function isLang(v: string): v is Lang {
  return LANGS.some((l) => l.code === v);
}
