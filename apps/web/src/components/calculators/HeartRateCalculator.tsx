import { hrMax, hrZones, inRange } from "../../calculators/formulas";
import { CALC, ZONE } from "../../i18n/calculators";
import { useI18n } from "../../i18n/I18nContext";
import { useProfile } from "../../profile";
import { CalcField } from "./CalcField";
import { CalcResult } from "./CalcResult";
import { CalculatorShell } from "./CalculatorShell";

export function HeartRateCalculator() {
  const { t, lang } = useI18n();
  const { profile, patch } = useProfile();
  const { age, restingHr } = profile;

  const ready = inRange(age, "age");
  const resting = inRange(restingHr, "restingHr") ? restingHr : null;
  const max = ready ? hrMax(age) : null;
  const zones = ready ? hrZones(age, resting) : [];

  return (
    <CalculatorShell
      id="heartrate"
      result={
        <CalcResult
          value={max === null ? null : Math.round(max).toLocaleString(lang)}
          unit={t("calcUnitBpm")}
          note={CALC.heartrate.note[lang]}
        >
          {max !== null && (
            <>
              <p className="result-aside">
                {resting === null ? t("calcZoneMaxOnly") : t("calcZoneKarvonen")}
              </p>
              <ul className="zonelist">
                {zones.map((z) => (
                  <li key={z.id} className="zonelist-row">
                    <strong>{ZONE[z.id].name[lang]}</strong>
                    <span className="t-num">
                      {z.from}–{z.to} {t("calcUnitBpm")}
                    </span>
                    <small>{ZONE[z.id].purpose[lang]}</small>
                  </li>
                ))}
              </ul>
            </>
          )}
        </CalcResult>
      }
    >
      <CalcField id="age" value={age} onChange={(v) => patch({ age: v })} />
      <CalcField id="restingHr" value={restingHr} onChange={(v) => patch({ restingHr: v })} />
    </CalculatorShell>
  );
}
