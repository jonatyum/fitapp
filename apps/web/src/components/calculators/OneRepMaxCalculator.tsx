import { useState } from "react";
import { RM_PERCENTS, inRange, oneRepMax, roundToPlate } from "../../calculators/formulas";
import { CALC } from "../../i18n/calculators";
import { useI18n } from "../../i18n/I18nContext";
import { navigate } from "../../router";
import { PATHS } from "../../routes";
import { CalcField } from "./CalcField";
import { CalcResult } from "./CalcResult";
import { CalculatorShell } from "./CalculatorShell";

export function OneRepMaxCalculator() {
  const { t, lang } = useI18n();

  // Un set concreto no describe el cuerpo, así que no va al perfil compartido.
  const [load, setLoad] = useState<number | null>(null);
  const [reps, setReps] = useState<number | null>(null);

  const ready = inRange(load, "load") && inRange(reps, "reps");
  const value = ready ? oneRepMax(load, reps) : null;

  return (
    <CalculatorShell
      id="onerm"
      result={
        <CalcResult
          label={t("calcEstimated1rm")}
          value={value === null ? null : Math.round(value).toLocaleString(lang)}
          unit={t("calcUnitKg")}
          note={CALC.onerm.note[lang]}
        >
          {value !== null && reps !== null && reps > 10 && (
            <p className="result-aside">{t("calcRmHighReps")}</p>
          )}
          {value !== null && (
            <button className="btn ghost" onClick={() => navigate(PATHS.progress)}>
              {t("calcRmSeeProgress")}
            </button>
          )}
        </CalcResult>
      }
    >
      <CalcField id="load" value={load} onChange={setLoad} step={0.5} />
      <CalcField id="reps" value={reps} onChange={setReps} />

      {value !== null && (
        <div className="calc-wide">
          <h2 className="section-label">{t("calcRmTable")}</h2>
          <ul className="pcttable">
            {RM_PERCENTS.map((pct) => (
              <li key={pct}>
                <span className="pcttable-pct t-num">{pct}%</span>
                <strong className="t-num">
                  {roundToPlate((value * pct) / 100).toLocaleString(lang)} {t("calcUnitKg")}
                </strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </CalculatorShell>
  );
}
