import { useEffect } from "react";
import { apiBodyProfile } from "../api";
import { CALC } from "../i18n/calculators";
import { useI18n } from "../i18n/I18nContext";
import { adoptRemoteProfile } from "../profile";
import { navigate, usePath } from "../router";
import { CALCULATORS, calculatorOf, calculatorPath, type CalculatorId } from "../routes";
import { BmiCalculator } from "./calculators/BmiCalculator";
import { BmrCalculator } from "./calculators/BmrCalculator";
import { BodyFatCalculator } from "./calculators/BodyFatCalculator";
import { BodyProfileCard } from "./calculators/BodyProfileCard";
import { HeartRateCalculator } from "./calculators/HeartRateCalculator";
import { MacrosCalculator } from "./calculators/MacrosCalculator";
import { OneRepMaxCalculator } from "./calculators/OneRepMaxCalculator";
import { TdeeCalculator } from "./calculators/TdeeCalculator";
import { Icon, type IconName } from "./ui/Icon";

const ICONS: Record<CalculatorId, IconName> = {
  bmi: "body",
  bmr: "flame",
  tdee: "chart",
  bodyfat: "sliders",
  macros: "grid",
  onerm: "dumbbell",
  heartrate: "medal",
};

const VIEWS: Record<CalculatorId, () => JSX.Element> = {
  bmi: BmiCalculator,
  bmr: BmrCalculator,
  tdee: TdeeCalculator,
  bodyfat: BodyFatCalculator,
  macros: MacrosCalculator,
  onerm: OneRepMaxCalculator,
  heartrate: HeartRateCalculator,
};

export function CalculatorsView() {
  const { t, lang } = useI18n();
  const open = calculatorOf(usePath());

  /**
   * Se pregunta siempre, no sólo cuando el dispositivo cree estar sincronizado:
   * en un teléfono nuevo la marca local no existe, y sin esto encender el
   * interruptor subiría un perfil vacío encima del que ya está guardado.
   */
  useEffect(() => {
    let alive = true;
    apiBodyProfile()
      .then((row) => {
        if (alive && row) adoptRemoteProfile(row);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  if (open) {
    const Tool = VIEWS[open];
    return <Tool />;
  }

  return (
    <div className="calculators">
      <h1>{t("calculatorsTitle")}</h1>
      <p className="calc-lead">{t("calculatorsLead")}</p>

      <p className="calc-disclaimer">
        <Icon name="info" size={16} />
        {t("calcDisclaimer")}
      </p>

      <BodyProfileCard />

      <ul className="calc-grid">
        {CALCULATORS.map((id) => (
          <li key={id}>
            <button
              className="card interactive calc-card"
              onClick={() => navigate(calculatorPath(id))}
            >
              <Icon name={ICONS[id]} size={22} />
              <strong>{CALC[id].name[lang]}</strong>
              <small>{CALC[id].lead[lang]}</small>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
