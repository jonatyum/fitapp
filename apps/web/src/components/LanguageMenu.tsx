import { LANGS } from "../i18n/languages";
import { useI18n } from "../i18n/I18nContext";

// Con solo dos idiomas (es/en) el selector es un simple toggle: muestra el
// idioma activo y al pulsarlo cambia al otro.
export function LanguageMenu() {
  const { lang, setLang } = useI18n();
  const current = LANGS.find((l) => l.code === lang)!;
  const other = LANGS.find((l) => l.code !== lang)!;

  return (
    <div className="lang">
      <button
        className="lang-trigger"
        onClick={() => setLang(other.code)}
        title={other.name}
        aria-label={other.name}
      >
        <span className="flag">{current.flag}</span>
        <span className="lang-name">{current.name}</span>
      </button>
    </div>
  );
}
