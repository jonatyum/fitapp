import { bmrKatch, bmrMifflin, inRange } from "../../calculators/formulas";
import { CALC, SEX } from "../../i18n/calculators";
import { useI18n } from "../../i18n/I18nContext";
import { useProfile } from "../../profile";
import { CalcChoice } from "./CalcChoice";
import { CalcField } from "./CalcField";
import { CalcResult } from "./CalcResult";
import { CalculatorShell } from "./CalculatorShell";

export function BmrCalculator() {
  const { t, lang } = useI18n();
  const { profile, patch } = useProfile();
  const { sex, age, heightCm, weightKg, bodyFatPct } = profile;

  const ready =
    sex !== null && inRange(age, "age") && inRange(heightCm, "height") && inRange(weightKg, "weight");
  const usesBodyFat = ready && bodyFatPct !== null;
  const value = !ready
    ? null
    : usesBodyFat
      ? bmrKatch(weightKg, bodyFatPct)
      : bmrMifflin(sex, weightKg, heightCm, age);

  return (
    <CalculatorShell
      id="bmr"
      result={
        <CalcResult
          label={t("calcAtRest")}
          value={value === null ? null : Math.round(value).toLocaleString(lang)}
          unit={t("calcUnitKcalDay")}
          note={CALC.bmr.note[lang]}
        >
          <p className="result-aside">
            {usesBodyFat ? t("calcUsesBodyFat") : t("calcBmrFloorNote")}
          </p>
        </CalcResult>
      }
    >
      <CalcChoice
        id="sex"
        value={sex}
        onChange={(v) => patch({ sex: v })}
        options={[
          { id: "female" as const, name: SEX.female[lang] },
          { id: "male" as const, name: SEX.male[lang] },
        ]}
      />
      <CalcField id="age" value={age} onChange={(v) => patch({ age: v })} />
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
