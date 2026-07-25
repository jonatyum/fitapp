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
    <article className="card" onClick={() => onOpen(ex)}>
      <div className="media">
        <img src={mediaUrl(ex.gifUrl)} alt={ex.name} loading="lazy" />
      </div>
      <div className="body">
        <div className="name">{translateName(ex.name, lang)}</div>
        <div className="tags">
          <span className="tag target">{tv(ex.target)}</span>
          <span className="tag plain">{tv(ex.equipment)}</span>
        </div>
      </div>
    </article>
  );
}

export function SkeletonCard() {
  return (
    <div className="card skeleton">
      <div className="media" />
      <div className="body">
        <div className="line" />
        <div className="line short" />
      </div>
    </div>
  );
}
