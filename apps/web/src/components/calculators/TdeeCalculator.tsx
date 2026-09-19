import { useState } from "react";
import {
  ACTIVITY_FACTORS,
  bmrKatch,
  bmrMifflin,
  goalKcal,
  inRange,
  tdee,
  type ActivityId,
  type GoalId,
} from "../../calculators/formulas";
import { ACTIVITY, CALC, GOAL, SEX } from "../../i18n/calculators";
import { useI18n } from "../../i18n/I18nContext";
import { useProfile } from "../../profile";
import { CalcChoice } from "./CalcChoice";
import { CalcField } from "./CalcField";
import { CalcResult } from "./CalcResult";
import { CalculatorShell } from "./CalculatorShell";

const ACTIVITY_IDS = Object.keys(ACTIVITY_FACTORS) as ActivityId[];
const GOAL_IDS: GoalId[] = ["lose", "maintain", "gain"];

export function TdeeCalculator() {
  const { t, lang } = useI18n();
  const { profile, patch } = useProfile();
  const { sex, age, heightCm, weightKg, bodyFatPct } = profile;

  // Actividad y objetivo describen un momento, no el cuerpo: no van al perfil
  // compartido, que es lo que las otras calculadoras releen.
  const [activity, setActivity] = useState<ActivityId>("moderate");
  const [goal, setGoal] = useState<GoalId>("maintain");

  const ready =
    sex !== null && inRange(age, "age") && inRange(heightCm, "height") && inRange(weightKg, "weight");
  const bmrValue = !ready
    ? null
    : bodyFatPct !== null
      ? bmrKatch(weightKg, bodyFatPct)
      : bmrMifflin(sex, weightKg, heightCm, age);

  const maintenance = bmrValue === null ? null : tdee(bmrValue, activity);
  const target = maintenance === null || sex === null ? null : goalKcal(maintenance, goal, sex);

  const kcal = (n: number) => Math.round(n).toLocaleString(lang);

  return (
    <CalculatorShell
      id="tdee"
      result={
        <CalcResult
          value={target === null ? null : kcal(target.kcal)}
          unit={t("calcUnitKcalDay")}
          extras={
            maintenance === null
              ? undefined
              : [{ label: t("calcMaintenance"), value: `${kcal(maintenance)} ${t("calcUnitKcal")}` }]
          }
          note={CALC.tdee.note[lang]}
        >
          {target?.floored && <p className="result-aside">{t("calcKcalFloor")}</p>}
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
      <CalcChoice
        id="activity"
        value={activity}
        onChange={setActivity}
        options={ACTIVITY_IDS.map((id) => ({
          id,
          name: ACTIVITY[id].name[lang],
          detail: ACTIVITY[id].detail[lang],
        }))}
      />
      <CalcChoice
        id="goal"
        value={goal}
        onChange={setGoal}
        options={GOAL_IDS.map((id) => ({
          id,
          name: GOAL[id].name[lang],
          detail: GOAL[id].detail[lang],
        }))}
      />
    </CalculatorShell>
  );
}
