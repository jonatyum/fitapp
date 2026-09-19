import { useState } from "react";
import { inRange, macros } from "../../calculators/formulas";
import { CALC, MACRO } from "../../i18n/calculators";
import { useI18n } from "../../i18n/I18nContext";
import { useProfile } from "../../profile";
import { CalcField } from "./CalcField";
import { CalcResult } from "./CalcResult";
import { CalculatorShell } from "./CalculatorShell";

export function MacrosCalculator() {
  const { t, lang } = useI18n();
  const { profile, patch } = useProfile();
  const { weightKg } = profile;

  const [kcal, setKcal] = useState<number | null>(null);

  const ready = inRange(kcal, "kcal") && inRange(weightKg, "weight");
  const split = ready ? macros(kcal, weightKg) : null;
  const total = split ? split.proteinKcal + split.fatKcal + split.carbKcal : 0;

  const rows = split
    ? ([
        { id: "protein" as const, grams: split.proteinG, kcal: split.proteinKcal },
        { id: "fat" as const, grams: split.fatG, kcal: split.fatKcal },
        { id: "carb" as const, grams: split.carbG, kcal: split.carbKcal },
      ])
    : [];

  return (
    <CalculatorShell
      id="macros"
      result={
        <CalcResult
          value={split === null ? null : Math.round(kcal!).toLocaleString(lang)}
          unit={t("calcUnitKcalDay")}
          note={CALC.macros.note[lang]}
        >
          {split && (
            <>
              <ul className="macrobar" aria-hidden="true">
                {rows.map((r) => (
                  <li
                    key={r.id}
                    className={`macrobar-seg ${r.id}`}
                    style={{ flexGrow: r.kcal / total }}
                  />
                ))}
              </ul>
              <dl className="result-extras">
                {rows.map((r) => (
                  <div key={r.id}>
                    <dt>
                      {MACRO[r.id][lang]} · {Math.round((r.kcal / total) * 100)}%
                    </dt>
                    <dd className="t-num">
                      {Math.round(r.grams).toLocaleString(lang)} {t("calcUnitGram")}
                    </dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </CalcResult>
      }
    >
      <CalcField id="kcal" value={kcal} onChange={setKcal} step={10} />
      <CalcField id="weight" value={weightKg} onChange={(v) => patch({ weightKg: v })} step={0.1} />
    </CalculatorShell>
  );
}
