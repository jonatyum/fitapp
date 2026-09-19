import { bodyFatBand, bodyFatNavy, inRange } from "../../calculators/formulas";
import { CALC, FAT_BAND, SEX } from "../../i18n/calculators";
import { useI18n } from "../../i18n/I18nContext";
import { useProfile } from "../../profile";
import { Icon } from "../ui/Icon";
import { CalcChoice } from "./CalcChoice";
import { CalcField } from "./CalcField";
import { CalcResult } from "./CalcResult";
import { CalculatorShell } from "./CalculatorShell";

export function BodyFatCalculator() {
  const { t, lang } = useI18n();
  const { profile, patch } = useProfile();
  const { sex, heightCm, weightKg, neckCm, waistCm, hipCm, bodyFatPct } = profile;

  const needsHip = sex === "female";
  const ready =
    sex !== null &&
    inRange(heightCm, "height") &&
    inRange(neckCm, "neck") &&
    inRange(waistCm, "waist") &&
    (!needsHip || inRange(hipCm, "hip"));

  const pct = ready ? bodyFatNavy(sex, heightCm, neckCm, waistCm, hipCm ?? 0) : null;
  const band = pct === null ? null : bodyFatBand(sex!, pct);
  const fatKg = pct !== null && inRange(weightKg, "weight") ? (weightKg * pct) / 100 : null;

  // `bodyFatNavy` devuelve null cuando la resta de contornos no es positiva:
  // es un error de medida, no un fallo de cálculo, y se dice cuál revisar.
  const impossible = ready && pct === null;
  const saved = bodyFatPct !== null && pct !== null && Math.abs(bodyFatPct - pct) < 0.05;

  return (
    <CalculatorShell
      id="bodyfat"
      result={
        <CalcResult
          label={t("calcBodyFatValue")}
          value={pct === null ? null : pct.toFixed(1)}
          unit={t("calcUnitPct")}
          band={
            band
              ? { name: FAT_BAND[band].name[lang], advice: FAT_BAND[band].advice[lang] }
              : undefined
          }
          extras={
            fatKg === null || weightKg === null
              ? undefined
              : [
                  { label: t("calcFatMass"), value: `${fatKg.toFixed(1)} ${t("calcUnitKg")}` },
                  {
                    label: t("calcLeanMass"),
                    value: `${(weightKg - fatKg).toFixed(1)} ${t("calcUnitKg")}`,
                  },
                ]
          }
          note={CALC.bodyfat.note[lang]}
        >
          {pct !== null &&
            (saved ? (
              <p className="result-aside">{t("calcSavedToBmr")}</p>
            ) : (
              <button className="btn secondary" onClick={() => patch({ bodyFatPct: pct })}>
                {t("calcSaveToBmr")}
              </button>
            ))}
        </CalcResult>
      }
    >
      {impossible && (
        <p className="form-error" role="alert">
          <Icon name="alert-circle" size={18} />
          {t("calcWaistNeck")}
        </p>
      )}

      <CalcChoice
        id="sex"
        value={sex}
        onChange={(v) => patch({ sex: v })}
        options={[
          { id: "female" as const, name: SEX.female[lang] },
          { id: "male" as const, name: SEX.male[lang] },
        ]}
      />
      <CalcField id="height" value={heightCm} onChange={(v) => patch({ heightCm: v })} />
      <CalcField id="weight" value={weightKg} onChange={(v) => patch({ weightKg: v })} step={0.1} />
      <CalcField id="neck" value={neckCm} onChange={(v) => patch({ neckCm: v })} step={0.5} />
      <CalcField id="waist" value={waistCm} onChange={(v) => patch({ waistCm: v })} step={0.5} />
      {needsHip && (
        <CalcField id="hip" value={hipCm} onChange={(v) => patch({ hipCm: v })} step={0.5} />
      )}
    </CalculatorShell>
  );
}
