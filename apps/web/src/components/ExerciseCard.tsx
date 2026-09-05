import { mediaUrl } from "../api";
import { useI18n } from "../i18n/I18nContext";
import { translateName } from "../i18n/translateName";
import type { Exercise } from "../types";

export function ExerciseCard({
  ex,
  onOpen,
}: {
  ex: Exercise;
  onOpen: (ex: Exercise) => void;
}) {
  const { tv, lang } = useI18n();
  return (
    /* Un <button>, no un <article onClick>: así entra en el orden de tabulación
       y responde a Enter y Espacio sin código extra. */
    <button type="button" className="card interactive" onClick={() => onOpen(ex)}>
      <span className="card-media">
        <img src={mediaUrl(ex.gifUrl)} alt="" loading="lazy" />
      </span>
      <span className="card-body">
        <span className="card-title exercise">{translateName(ex.name, lang)}</span>
        <span className="card-meta">
          <span className="tag target">{tv(ex.target)}</span>
          <span className="tag plain">{tv(ex.equipment)}</span>
        </span>
      </span>
    </button>
  );
}

export function SkeletonCard() {
  return (
    <div className="card" aria-hidden="true">
      <div className="skeleton media" />
      <div className="card-body">
        <div className="skeleton line title" />
        <div className="skeleton line short" />
      </div>
    </div>
  );
}
