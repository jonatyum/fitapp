import { useId } from "react";
import { RANGE, type NumericFieldId } from "../../calculators/formulas";
import { FIELD } from "../../i18n/calculators";
import { useI18n } from "../../i18n/I18nContext";
import { Icon } from "../ui/Icon";
import { FieldLabel } from "./FieldLabel";

export function CalcField({
  id,
  value,
  onChange,
  step,
}: {
  id: NumericFieldId;
  value: number | null;
  onChange: (value: number | null) => void;
  step?: number;
}) {
  const { t, lang } = useI18n();
  const inputId = useId();
  const helpId = `${inputId}-help`;

  const field = FIELD[id];
  const [min, max] = RANGE[id];
  const outOfRange = value !== null && (value < min || value > max);

  return (
    <div className="field">
      <FieldLabel id={id} htmlFor={inputId} />

      <div className={`field-control${field.unit ? " has-unit" : ""}`}>
        <input
          id={inputId}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={value ?? ""}
          aria-describedby={helpId}
          aria-invalid={outOfRange || undefined}
          onChange={(ev) => onChange(ev.target.value === "" ? null : Number(ev.target.value))}
        />
        {field.unit && <span className="field-unit">{field.unit[lang]}</span>}
      </div>

      {outOfRange ? (
        <p className="field-error" id={helpId} role="alert">
          <Icon name="alert-circle" size={14} />
          {t("errCalcRange", { min: String(min), max: String(max) })}
        </p>
      ) : (
        <p className="field-help" id={helpId}>
          {field.help[lang]}
        </p>
      )}
    </div>
  );
}
