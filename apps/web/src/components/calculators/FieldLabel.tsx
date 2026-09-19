import { useState } from "react";
import { FIELD, type FieldId } from "../../i18n/calculators";
import { useI18n } from "../../i18n/I18nContext";
import { Dialog } from "../ui/Dialog";
import { Icon } from "../ui/Icon";

/**
 * La etiqueta de un campo y, donde una línea no basta, el botón que abre la
 * explicación larga. A 44px: el botón de borrar sesión de Progreso ya enseñó
 * lo que pasa cuando un control de verdad se queda en 36.
 */
export function FieldLabel({ id, htmlFor }: { id: FieldId; htmlFor?: string }) {
  const { t, lang } = useI18n();
  const [help, setHelp] = useState(false);

  const field = FIELD[id];
  const label = field.label[lang];

  return (
    <div className="field-label-row">
      {htmlFor ? (
        <label className="field-label" htmlFor={htmlFor}>
          {label}
        </label>
      ) : (
        <span className="field-label">{label}</span>
      )}

      {field.long && (
        <button
          type="button"
          className="btn icon ghost field-help-btn"
          onClick={() => setHelp(true)}
          aria-label={t("calcHelpFor", { field: label })}
        >
          <Icon name="info" size={18} />
        </button>
      )}

      {help && field.long && (
        <Dialog title={label} onClose={() => setHelp(false)}>
          <p className="calc-prose">{field.long[lang]}</p>
        </Dialog>
      )}
    </div>
  );
}
