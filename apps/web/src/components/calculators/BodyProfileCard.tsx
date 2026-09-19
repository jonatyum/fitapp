import { useState } from "react";
import { SEX } from "../../i18n/calculators";
import { useI18n } from "../../i18n/I18nContext";
import { setProfileSync, useProfile } from "../../profile";
import { Icon } from "../ui/Icon";
import { Toggle } from "../ui/Toggle";

/**
 * El resumen de lo que ya está tecleado y el interruptor de guardarlo en la
 * cuenta. Vive aquí y no en Ajustes porque son entradas de la calculadora, no
 * datos del perfil: allí está escrito que el nombre es lo único editable.
 */
export function BodyProfileCard() {
  const { t, lang } = useI18n();
  const { profile, synced } = useProfile();
  const [failed, setFailed] = useState(false);

  const parts = [
    profile.sex ? SEX[profile.sex][lang] : null,
    profile.age !== null ? `${profile.age} ${t("calcUnitYears")}` : null,
    profile.heightCm !== null ? `${profile.heightCm} cm` : null,
    profile.weightKg !== null ? `${profile.weightKg} ${t("calcUnitKg")}` : null,
  ].filter(Boolean);

  const toggle = async (on: boolean) => {
    setFailed(false);
    try {
      await setProfileSync(on);
    } catch {
      setFailed(true);
      await setProfileSync(!on).catch(() => undefined);
    }
  };

  return (
    <section className="card calc-profile">
      <h2 className="section-label">{t("calcYourData")}</h2>
      <p className="calc-profile-summary">{parts.length ? parts.join(" · ") : t("calcNoData")}</p>

      <Toggle
        block
        label={t("calcSyncLabel")}
        checked={synced}
        onChange={toggle}
        describedBy="calc-sync-hint"
      />
      <p className="field-help" id="calc-sync-hint">
        {t("calcSyncHint")}
      </p>

      {failed && (
        <p className="field-error" role="alert">
          <Icon name="alert-circle" size={14} />
          {t("calcSyncFailed")}
        </p>
      )}
    </section>
  );
}
