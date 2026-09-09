import { useEffect, useState } from "react";
import { apiAlternatives, mediaUrl } from "../api";
import { useI18n } from "../i18n/I18nContext";
import { translateName } from "../i18n/translateName";
import { Dialog } from "./ui/Dialog";
import { Icon } from "./ui/Icon";
import type { Alternative, Exercise, Level, Place } from "../types";

/**
 * Elige el reemplazo de un ejercicio dentro de un plan.
 *
 * Las alternativas llegan del backend ya ordenadas y diversificadas por
 * equipo, así que aquí no se reordena nada: lo que el servidor considera la
 * mejor opción es la primera, y es la misma lógica con la que el generador
 * llenó el hueco.
 */
export function ExerciseSwap({
  current,
  slot,
  level,
  equipment,
  place,
  exclude,
  busy = false,
  error = null,
  onPick,
  onClose,
}: {
  current: Exercise;
  slot: string;
  level: Level;
  equipment: string[];
  place?: Place;
  /** ids ya presentes en el día: no se ofrecen como alternativa */
  exclude: string[];
  busy?: boolean;
  error?: string | null;
  onPick: (ex: Alternative) => void;
  onClose: () => void;
}) {
  const { t, tv, lang } = useI18n();
  const [items, setItems] = useState<Alternative[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    setItems(null);
    setFailed(false);
    apiAlternatives({ slot, level, equipment, place, exclude })
      .then((r) => alive && setItems(r))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
    // `exclude` es un array nuevo en cada render del padre; su contenido es lo
    // que importa, no la identidad.
  }, [slot, level, place, equipment.join(","), exclude.join(",")]);

  const fitting = items?.filter((e) => e.fitsKit) ?? [];
  const others = items?.filter((e) => !e.fitsKit) ?? [];

  const row = (ex: Alternative) => (
    <li key={ex.id}>
      <button className="exrow" onClick={() => onPick(ex)} disabled={busy}>
        <img src={mediaUrl(ex.image)} alt="" loading="lazy" />
        <span className="exrow-main">
          <span className="exrow-name">{translateName(ex.name, lang)}</span>
          <span className="exrow-meta">
            {tv(ex.target)} · {tv(ex.equipment)}
          </span>
        </span>
        <span className="swap-pick" aria-hidden="true">
          <Icon name="chevron-right" size={18} />
        </span>
      </button>
    </li>
  );

  return (
    <Dialog title={t("swapTitle")} onClose={onClose} wide>
      <p className="swap-current">
        {t("swapCurrent")} <strong>{translateName(current.name, lang)}</strong>
      </p>

      {error && (
        <p className="field-error" role="alert">
          <Icon name="alert-circle" size={14} />
          {error}
        </p>
      )}

      {items === null && !failed && (
        <ul className="exlist" aria-busy="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <li key={i}>
              <span className="exrow">
                <span className="skeleton media" />
                <span className="exrow-main">
                  <span className="skeleton line long" />
                  <span className="skeleton line short" />
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {failed && (
        <div className="empty inline">
          <Icon name="alert-triangle" size={32} className="empty-icon" />
          <p className="empty-text">{t("swapFailed")}</p>
        </div>
      )}

      {items !== null && items.length === 0 && (
        <div className="empty inline">
          <Icon name="search" size={32} className="empty-icon" />
          <p className="empty-text">{t("swapEmpty")}</p>
        </div>
      )}

      {fitting.length > 0 && (
        <>
          {others.length > 0 && <h3 className="section-label">{t("swapFits")}</h3>}
          <ul className="exlist">{fitting.map(row)}</ul>
        </>
      )}

      {others.length > 0 && (
        <>
          <h3 className="section-label">{t("swapNeedsKit")}</h3>
          <p className="swap-note">{t("swapNeedsKitHint")}</p>
          <ul className="exlist">{others.map(row)}</ul>
        </>
      )}
    </Dialog>
  );
}
