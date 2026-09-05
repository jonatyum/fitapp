import { mediaUrl } from "../api";
import { useI18n } from "../i18n/I18nContext";
import { translateName } from "../i18n/translateName";
import { DEFAULT_LANG } from "../i18n/languages";
import type { Exercise } from "../types";
import { Dialog } from "./ui/Dialog";

export function ExerciseDetail({
  ex,
  onClose,
}: {
  ex: Exercise;
  onClose: () => void;
}) {
  const { t, tv, lang } = useI18n();

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
    <Dialog title={translateName(ex.name, lang)} onClose={onClose} wide>
      <div className="exercise-detail">
        <div className="exercise-media">
          <img src={mediaUrl(ex.gifUrl)} alt="" />
        </div>

        <div className="exercise-info">
          <div className="meta-row">
            <span className="badge brand">{tv(ex.target)}</span>
            <span className="badge soft">{tv(ex.bodyPart)}</span>
            <span className="badge soft">{tv(ex.equipment)}</span>
          </div>

          {secondary.length > 0 && (
            <div>
              <h3 className="section-label">{t("secondaryLabel")}</h3>
              <div className="meta-row">
                {secondary.map((m) => (
                  <span key={m} className="badge soft">
                    {tv(m)}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="section-label">{t("steps")}</h3>
            <ol className="steps">
              {steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>

          <p className="attribution">{ex.attribution}</p>
        </div>
      </div>
    </Dialog>
  );
}
