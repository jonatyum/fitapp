import type { ReactNode } from "react";
import { CALC } from "../../i18n/calculators";
import { useI18n } from "../../i18n/I18nContext";
import { navigate } from "../../router";
import { PATHS, type CalculatorId } from "../../routes";
import { Icon } from "../ui/Icon";

/**
 * El armazón de una calculadora: volver, título, resultado, qué es y campos.
 *
 * «Qué es» va en un `<details>` plegado: quien ya sabe qué es el IMC no
 * scrollea sesenta palabras, y quien no lo sabe lo tiene a un toque. Es
 * nativo, así que no cuesta JavaScript y el foco ya está resuelto en `base`.
 */
export function CalculatorShell({
  id,
  result,
  children,
}: {
  id: CalculatorId;
  result: ReactNode;
  children: ReactNode;
}) {
  const { t, lang } = useI18n();
  const calc = CALC[id];

  return (
    <div className="calc">
      <div className="calc-head">
        <button className="btn ghost" onClick={() => navigate(PATHS.calculators)}>
          <Icon name="chevron-left" size={18} />
          {t("back")}
        </button>
      </div>

      <h1>{calc.name[lang]}</h1>
      <p className="calc-lead">{calc.lead[lang]}</p>

      {result}

      <details className="disclosure">
        <summary>
          <span>{t("calcWhatIs")}</span>
          <Icon name="chevron-down" size={18} />
        </summary>
        {calc.what[lang].split("\n\n").map((paragraph, i) => (
          <p key={i} className="calc-prose">
            {paragraph}
          </p>
        ))}
      </details>

      <div className="calc-form">{children}</div>
    </div>
  );
}
