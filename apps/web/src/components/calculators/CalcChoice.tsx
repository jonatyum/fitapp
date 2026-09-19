import { FIELD, type FieldId } from "../../i18n/calculators";
import { useI18n } from "../../i18n/I18nContext";
import { FieldLabel } from "./FieldLabel";

export interface ChoiceOption<T extends string> {
  id: T;
  name: string;
  detail?: string;
}

/**
 * Pocas opciones excluyentes. Botones y no un `<select>`: al pulgar le cuesta
 * menos, y el estado vive en `aria-pressed`, que es lo que ya estila `.choice`.
 */
export function CalcChoice<T extends string>({
  id,
  value,
  onChange,
  options,
}: {
  id: FieldId;
  value: T | null;
  onChange: (value: T) => void;
  options: ChoiceOption<T>[];
}) {
  const { lang } = useI18n();
  const detailed = options.some((o) => o.detail);

  return (
    <div className="field">
      <FieldLabel id={id} />
      <div className={detailed ? "choice-grid" : "choice-row"}>
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            className={detailed ? "choice" : "choice big"}
            aria-pressed={value === o.id}
            onClick={() => onChange(o.id)}
          >
            <strong>{o.name}</strong>
            {o.detail && <small>{o.detail}</small>}
          </button>
        ))}
      </div>
      <p className="field-help">{FIELD[id].help[lang]}</p>
    </div>
  );
}
