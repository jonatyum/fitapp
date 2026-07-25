import { mediaUrl } from "../api";
import { useI18n } from "../i18n/I18nContext";
import { tDayLabel } from "../i18n/plan";
import { translateName } from "../i18n/translateName";
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
}: {
  day: DayLike;
  index: number;
  onStart?: () => void;
  onOpenExercise?: (ex: Exercise) => void;
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
          <li key={`${e.exercise.id}-${i}`}>
            <button
              className="exrow"
              onClick={() => onOpenExercise?.(e.exercise)}
              disabled={!onOpenExercise}
            >
              <img src={mediaUrl(e.exercise.gifUrl)} alt="" loading="lazy" />
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
          </li>
        ))}
      </ol>
    </section>
  );
}
