import type { ReactNode } from "react";
import { useI18n } from "../../i18n/I18nContext";
import { Icon } from "../ui/Icon";

export interface ResultBand {
  name: string;
  advice: string;
}

/**
 * Va encima del formulario a propósito: en un móvil el teclado se come media
 * pantalla, y con el resultado debajo se teclea a ciegas.
 *
 * `label` no es decorativo. Sin él, el TDEE enseñaba dos cifras en kcal —la
 * del objetivo arriba y la de mantenimiento debajo— sin decir cuál era cuál.
 *
 * Sólo se rellena cuando todos los campos necesarios son válidos, así que el
 * lector de pantalla anuncia un resultado y no cada tecla.
 */
export function CalcResult({
  label,
  value,
  unit,
  band,
  extras,
  note,
  children,
}: {
  label: string;
  value: string | null;
  unit?: string;
  band?: ResultBand;
  extras?: { label: string; value: string }[];
  note: string;
  children?: ReactNode;
}) {
  const { t } = useI18n();

  return (
    <div className="result">
      <output className="result-out" aria-live="polite">
        {value === null ? (
          <p className="result-empty">{t("calcResultEmpty")}</p>
        ) : (
          <>
            <p className="result-label">{label}</p>
            <p className="result-value t-num">
              {value}
              {unit && <span className="result-unit">{unit}</span>}
            </p>
            {band && (
              <p className="result-band">
                <Icon name="info" size={16} />
                <strong>{band.name}</strong>
                <span>{band.advice}</span>
              </p>
            )}
            {extras && extras.length > 0 && (
              <dl className="result-extras">
                {extras.map((e) => (
                  <div key={e.label}>
                    <dt>{e.label}</dt>
                    <dd className="t-num">{e.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </>
        )}
      </output>
      {/* Fuera de la región viva: botones y listas largas no tienen que
          releerse enteros en cada tecla. */}
      {value !== null && children}
      <p className="result-note">{note}</p>
    </div>
  );
}
