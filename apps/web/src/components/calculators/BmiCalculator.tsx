import { bmi, bmiBand, healthyWeightRange, inRange } from "../../calculators/formulas";
import { BMI_BAND, CALC } from "../../i18n/calculators";
import { useI18n } from "../../i18n/I18nContext";
import { useProfile } from "../../profile";
import { CalcField } from "./CalcField";
import { CalcResult } from "./CalcResult";
import { CalculatorShell } from "./CalculatorShell";

export function BmiCalculator() {
  const { t, lang } = useI18n();
  const { profile, patch } = useProfile();
  const { heightCm, weightKg, age } = profile;

  const value =
    inRange(heightCm, "height") && inRange(weightKg, "weight") ? bmi(weightKg, heightCm) : null;
  const band = value === null ? null : bmiBand(value);
  const [min, max] = inRange(heightCm, "height") ? healthyWeightRange(heightCm) : [0, 0];

  // Por debajo de 18 el IMC se lee en percentiles de edad y sexo, así que la
  // banda de adulto no sólo no aplica: etiqueta a un adolescente.
  const minor = age !== null && age < 18;

  return (
    <CalculatorShell
      id="bmi"
      result={
        <CalcResult
          label={t("calcBmiValue")}
          value={value === null ? null : value.toFixed(1)}
          band={
            band && !minor
              ? { name: BMI_BAND[band].name[lang], advice: BMI_BAND[band].advice[lang] }
              : undefined
          }
          note={CALC.bmi.note[lang]}
        >
          {minor ? (
            <div className="result-aside">
              <strong>{t("calcMinorTitle")}</strong>
              <p>{t("calcMinorText")}</p>
            </div>
          ) : (
            <p className="result-aside">
              {t("calcHealthyRange", { min: min.toFixed(0), max: max.toFixed(0) })}
            </p>
          )}
        </CalcResult>
      }
    >
      <CalcField
        id="height"
        value={heightCm}
        onChange={(v) => patch({ heightCm: v })}
      />
      <CalcField
        id="weight"
        value={weightKg}
        onChange={(v) => patch({ weightKg: v })}
        step={0.1}
      />
    </CalculatorShell>
  );
}
