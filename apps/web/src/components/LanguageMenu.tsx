import { useEffect, useRef, useState } from "react";
import { LANGS } from "../i18n/languages";
import { useI18n } from "../i18n/I18nContext";

export function LanguageMenu() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGS.find((l) => l.code === lang)!;

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="lang" ref={ref}>
      <button className="lang-trigger" onClick={() => setOpen((o) => !o)}>
        <span className="flag">{current.flag}</span>
        <span className="lang-name">{current.name}</span>
      </button>
      {open && (
        <div className="lang-menu">
          {LANGS.map((l) => (
            <button
              key={l.code}
              className={l.code === lang ? "active" : ""}
              onClick={() => {
                setLang(l.code);
                setOpen(false);
              }}
            >
              <span className="flag">{l.flag}</span>
              {l.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
