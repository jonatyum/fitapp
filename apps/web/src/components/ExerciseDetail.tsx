import { useEffect, useState } from "react";
import { apiExercise, mediaUrl } from "../api";
import { useI18n } from "../i18n/I18nContext";
import { translateName } from "../i18n/translateName";
import { DEFAULT_LANG } from "../i18n/languages";
import type { Exercise, ExercisePreview } from "../types";
import { Dialog } from "./ui/Dialog";

const isFull = (ex: ExercisePreview): ex is Exercise => "instructionSteps" in ex;

export function ExerciseDetail({
  ex,
  onClose,
}: {
  /**
   * Un plan recién generado trae sólo la vista previa del ejercicio, así que
   * la ficha se completa aquí en vez de engordar la respuesta del generador.
   */
  ex: ExercisePreview;
  onClose: () => void;
}) {
  const { t, tv, lang } = useI18n();
  const [full, setFull] = useState<Exercise | null>(isFull(ex) ? ex : null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (isFull(ex)) {
      setFull(ex);
      setFailed(false);
      return;
    }
    let alive = true;
    setFull(null);
    setFailed(false);
    apiExercise(ex.id)
      .then((r) => alive && setFull(r))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [ex]);

  // Prefer step-by-step in the active language; fall back to Spanish/English,
  // then to splitting the paragraph instructions.
  const steps = full
    ? (full.instructionSteps?.[lang] ??
      full.instructionSteps?.[DEFAULT_LANG] ??
      full.instructionSteps?.en ??
      (full.instructions?.[lang] ?? full.instructions?.en ?? "")
        .split(/(?<=\.)\s+/)
        .filter(Boolean))
    : [];

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

          {!full && !failed && (
            <div>
              <h3 className="section-label">{t("steps")}</h3>
              <div className="steps-loading" aria-busy="true">
                <span className="skeleton line long" />
                <span className="skeleton line long" />
                <span className="skeleton line short" />
              </div>
            </div>
          )}

          {steps.length > 0 && (
            <div>
              <h3 className="section-label">{t("steps")}</h3>
              <ol className="steps">
                {steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </div>
          )}

          {full && <p className="attribution">{full.attribution}</p>}
        </div>
      </div>
    </Dialog>
  );
}
