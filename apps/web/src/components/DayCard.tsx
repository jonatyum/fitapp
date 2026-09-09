import { mediaUrl } from "../api";
import { useI18n } from "../i18n/I18nContext";
import { tDayLabel } from "../i18n/plan";
import { translateName } from "../i18n/translateName";
import { Icon } from "./ui/Icon";
import type { Exercise, Prescription } from "../types";

export interface DayExercise extends Prescription {
  slot: string;
  exercise: Exercise;
}

export interface DayLike {
  label: string;
  focus: string[];
  exercises: DayExercise[];
}

/**
 * One training day — used both for the generator preview and for a saved
 * routine, which share the same shape.
 */
export function DayCard({
  day,
  index,
  onStart,
  onOpenExercise,
  onSwap,
  swappingId,
}: {
  day: DayLike;
  index: number;
  onStart?: () => void;
  onOpenExercise?: (ex: Exercise) => void;
  /** cuando se pasa, cada ejercicio ofrece cambiarse por una alternativa */
  onSwap?: (e: DayExercise, position: number) => void;
  /** id del ejercicio que se está cambiando ahora mismo */
  swappingId?: string | null;
}) {
  const { t, tv, lang } = useI18n();

  return (
    <section className="daycard">
      <header className="daycard-head">
        <div>
          <span className="daycard-index">{t("dayN", { n: index + 1 })}</span>
          <h3>{tDayLabel(day.label, lang)}</h3>
          <div className="daycard-focus">
            {day.focus.map((f) => (
              <span key={f} className="badge soft">
                {tv(f)}
              </span>
            ))}
          </div>
        </div>
        {onStart && (
          <button className="btn primary" onClick={onStart}>
            {t("startWorkout")}
          </button>
        )}
      </header>

      <ol className="exlist">
        {day.exercises.map((e, i) => (
          <li key={`${e.exercise.id}-${i}`} className={onSwap ? "exline" : undefined}>
            <button
              className="exrow"
              onClick={() => onOpenExercise?.(e.exercise)}
              disabled={!onOpenExercise}
            >
              <img src={mediaUrl(e.exercise.image)} alt="" loading="lazy" />
              <span className="exrow-main">
                <span className="exrow-name">{translateName(e.exercise.name, lang)}</span>
                <span className="exrow-meta">
                  {tv(e.slot)} · {tv(e.exercise.equipment)}
                </span>
              </span>
              <span className="exrow-dose">
                <strong>
                  {e.sets} × {e.repsMin}–{e.repsMax}
                </strong>
                <small>{t("restN", { n: e.restSec })}</small>
              </span>
            </button>
            {onSwap && (
              <button
                className={`btn icon ghost exswap${swappingId === e.exercise.id ? " loading" : ""}`}
                onClick={() => onSwap(e, i)}
                disabled={swappingId === e.exercise.id}
                aria-label={t("swapAria", { name: translateName(e.exercise.name, lang) })}
                title={t("swapAction")}
              >
                <Icon name="swap" size={18} />
              </button>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
