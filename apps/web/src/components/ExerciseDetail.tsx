import { useEffect } from "react";
import { mediaUrl } from "../api";
import { useI18n } from "../i18n/I18nContext";
import { translateName } from "../i18n/translateName";
import { DEFAULT_LANG } from "../i18n/languages";
import type { Exercise } from "../types";

export function ExerciseDetail({
  ex,
  onClose,
}: {
  ex: Exercise;
  onClose: () => void;
}) {
  const { t, tv, lang } = useI18n();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Prefer step-by-step in the active language; fall back to Spanish/English,
  // then to splitting the paragraph instructions.
  const steps =
    ex.instructionSteps?.[lang] ??
    ex.instructionSteps?.[DEFAULT_LANG] ??
    ex.instructionSteps?.en ??
    (ex.instructions?.[lang] ?? ex.instructions?.en ?? "")
      .split(/(?<=\.)\s+/)
      .filter(Boolean);

  const secondary = ex.secondaryMuscles?.filter(Boolean) ?? [];

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-grid">
          <div className="modal-media">
            <img src={mediaUrl(ex.gifUrl)} alt={ex.name} />
          </div>
          <div className="modal-body">
            <button className="modal-close" onClick={onClose} aria-label={t("close")}>
              ✕
            </button>
            <h2>{translateName(ex.name, lang)}</h2>

            <div className="meta-row">
              <span className="badge accent">{tv(ex.target)}</span>
              <span className="badge soft">{tv(ex.bodyPart)}</span>
              <span className="badge soft">{tv(ex.equipment)}</span>
            </div>

            {secondary.length > 0 && (
              <>
                <div className="section-label">{t("secondaryLabel")}</div>
                <div className="meta-row" style={{ margin: 0 }}>
                  {secondary.map((m) => (
                    <span key={m} className="badge soft">
                      {tv(m)}
                    </span>
                  ))}
                </div>
              </>
            )}

            <div className="section-label">{t("steps")}</div>
            <ol className="steps">
              {steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>

            <p className="attribution">{ex.attribution}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
