import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_LANG, isLang, type Lang } from "./languages";
import { UI, type UIKey } from "./ui";
import { tVocab } from "./vocab";

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** UI string, with optional {n} interpolation. */
  t: (key: UIKey, vars?: Record<string, string | number>) => string;
  /** Translate a dataset category value (body part / muscle / equipment). */
  tv: (value: string) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

function initialLang(): Lang {
  const stored = localStorage.getItem("fitapp:lang");
  const nav = navigator.language.slice(0, 2);
  const lang: Lang =
    stored && isLang(stored) ? stored : isLang(nav) ? nav : DEFAULT_LANG;
  // Se aplica ya, no en el efecto: index.html sirve lang="es" y sin esto un
  // usuario en inglés tiene el documento mal etiquetado hasta el primer commit.
  document.documentElement.lang = lang;
  return lang;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    localStorage.setItem("fitapp:lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang: setLangState,
      t: (key, vars) => {
        let s = UI[lang][key] ?? UI.en[key] ?? key;
        if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
        return s;
      },
      tv: (v) => tVocab(v, lang),
    }),
    [lang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
