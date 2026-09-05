import { LANGS } from "../i18n/languages";
import { useI18n } from "../i18n/I18nContext";
import { Icon } from "./ui/Icon";

// Con solo dos idiomas (es/en) el selector es un simple toggle: muestra el
// idioma activo y al pulsarlo cambia al otro.
export function LanguageMenu() {
  const { lang, setLang } = useI18n();
  const current = LANGS.find((l) => l.code === lang)!;
  const other = LANGS.find((l) => l.code !== lang)!;

  return (
    <button
      className="lang-trigger"
      onClick={() => setLang(other.code)}
      title={other.name}
      aria-label={other.name}
    >
      <Icon name="globe" size={18} />
      <span className="lang-name">{current.name}</span>
    </button>
  );
}
