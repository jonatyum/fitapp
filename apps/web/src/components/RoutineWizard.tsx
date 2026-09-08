import { useCallback, useEffect, useState } from "react";
import { apiGenerateRoutine, apiSaveRoutine } from "../api";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import {
  GOALS,
  LEVELS,
  tGoal,
  tGoalDesc,
  tLevel,
  tLevelDesc,
  tSplit,
} from "../i18n/plan";
import type { Alternative, GeneratedRoutine, Goal, Level, Meta, Place, Routine } from "../types";
import { DayCard, type DayExercise } from "./DayCard";
import { ExerciseSwap } from "./ExerciseSwap";
import { Icon, type IconName } from "./ui/Icon";

const DAY_CHOICES = [2, 3, 4, 5, 6];

/** Equipment worth offering as a checkbox — the long tail is noise. */
const EQUIPMENT_CHOICES = [
  "body weight",
  "dumbbell",
  "barbell",
  "cable",
  "leverage machine",
  "smith machine",
  "kettlebell",
  "band",
  "ez barbell",
  "stability ball",
  "medicine ball",
  "resistance band",
];

type Step = "place" | "goal" | "days" | "level" | "equipment" | "preview";
const ORDER: Step[] = ["place", "goal", "days", "level", "equipment", "preview"];

/**
 * Asked first, because it decides everything downstream: at home the generator
 * treats the kit as a hard boundary instead of a preference.
 */
const PLACES: { id: Place; icon: IconName; title: "placeHome" | "placeGym"; desc: "placeHomeDesc" | "placeGymDesc" }[] = [
  { id: "home", icon: "home", title: "placeHome", desc: "placeHomeDesc" },
  { id: "gym", icon: "dumbbell", title: "placeGym", desc: "placeGymDesc" },
];

/** Preselected when "at home" is picked; the equipment step still refines it. */
const HOME_KIT = ["body weight", "band", "resistance band", "dumbbell"];

export function RoutineWizard({
  meta,
  onSaved,
  onCancel,
  onRequireAuth,
}: {
  meta: Meta | null;
  onSaved: (routine: Routine) => void;
  onCancel: () => void;
  /** El plan se arma sin cuenta; guardarlo sí la exige. */
  onRequireAuth: () => void;
}) {
  const { t, tv, lang } = useI18n();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>("place");
  const [place, setPlace] = useState<Place>("home");
  const [goal, setGoal] = useState<Goal>("hypertrophy");
  const [days, setDays] = useState(4);
  const [level, setLevel] = useState<Level>("beginner");
  const [equipment, setEquipment] = useState<string[]>([]);

  const [plan, setPlan] = useState<GeneratedRoutine | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  /** guardado en espera de que el usuario termine de crear su cuenta */
  const [pendingSave, setPendingSave] = useState(false);
  /** ejercicio del preview que se está cambiando; el plan aún no existe en el servidor */
  const [swapping, setSwapping] = useState<{
    dayIndex: number;
    position: number;
    current: DayExercise;
  } | null>(null);

  // El plan todavía no está guardado, así que el cambio es puramente local:
  // se aplica sobre el borrador y se persiste cuando el usuario guarda.
  const applySwap = (alt: Alternative) => {
    if (!swapping) return;
    const { dayIndex, position } = swapping;
    // `fitsKit` describe la alternativa frente al kit, no al ejercicio: no
    // tiene sentido guardarlo dentro del plan.
    const { fitsKit: _fitsKit, ...picked } = alt;
    setPlan((prev) =>
      prev
        ? {
            ...prev,
            days: prev.days.map((d, i) =>
              i !== dayIndex
                ? d
                : {
                    ...d,
                    exercises: d.exercises.map((e, j) =>
                      j !== position ? e : { ...e, exercise: { ...e.exercise, ...picked } },
                    ),
                  },
            ),
          }
        : prev,
    );
    setSwapping(null);
  };

  // Only offer equipment the dataset actually has.
  const choices = EQUIPMENT_CHOICES.filter((e) => meta?.equipment.includes(e) ?? true);

  const toggleEquipment = (value: string) =>
    setEquipment((prev) =>
      prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value],
    );

  const generate = async () => {
    setBusy(true);
    setError(false);
    try {
      const p = await apiGenerateRoutine({ goal, level, daysPerWeek: days, equipment, place });
      setPlan(p);
      if (!name) setName(`${tGoal(goal, lang)} · ${t("perWeek", { n: days })}`);
      setStep("preview");
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  const save = useCallback(async () => {
    if (!plan) return;
    setBusy(true);
    setError(false);
    try {
      onSaved(await apiSaveRoutine(plan, name));
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }, [plan, name, onSaved]);

  // En cuanto la cuenta existe se guarda solo: el usuario ya pulsó guardar una
  // vez y volver a pedírselo sería cobrarle dos veces el mismo gesto.
  useEffect(() => {
    if (!user || !pendingSave) return;
    setPendingSave(false);
    save();
  }, [user, pendingSave, save]);

  const requestSave = () => {
    if (!user) {
      setPendingSave(true);
      onRequireAuth();
      return;
    }
    save();
  };

  const stepIndex = ORDER.indexOf(step);
  const goBack = () =>
    stepIndex === 0 ? onCancel() : setStep(ORDER[stepIndex - 1]);

  return (
    <div className="wizard">
      <h1 className="sr-only">{t("newRoutine")}</h1>

      <div className="wizard-head">
        <button className="btn ghost" onClick={goBack}>
          <Icon name="chevron-left" size={18} />
          {t("back")}
        </button>
        <div className="wizard-dots">
          {ORDER.map((s, i) => (
            <span key={s} className={`dot ${i <= stepIndex ? "on" : ""}`} />
          ))}
        </div>
      </div>

      {step === "place" && (
        <fieldset className="wizard-step">
          <legend>{t("wizPlace")}</legend>
          <div className="choice-grid">
            {PLACES.map((opt) => (
              <button
                key={opt.id}
                className="choice"
                aria-pressed={place === opt.id}
                onClick={() => {
                  setPlace(opt.id);
                  // Sensible starting kit; the equipment step can still change it.
                  setEquipment(
                    opt.id === "home" ? HOME_KIT.filter((e) => choices.includes(e)) : [],
                  );
                  setStep("goal");
                }}
              >
                <strong>
                  <Icon name={opt.icon} size={18} />
                  {t(opt.title)}
                </strong>
                <small>{t(opt.desc)}</small>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {step === "goal" && (
        <fieldset className="wizard-step">
          <legend>{t("wizGoal")}</legend>
          <div className="choice-grid">
            {GOALS.map((g) => (
              <button
                key={g}
                className="choice"
                aria-pressed={goal === g}
                onClick={() => {
                  setGoal(g);
                  setStep("days");
                }}
              >
                <strong>{tGoal(g, lang)}</strong>
                <small>{tGoalDesc(g, lang)}</small>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {step === "days" && (
        <fieldset className="wizard-step">
          <legend>{t("wizDays")}</legend>
          <div className="choice-row">
            {DAY_CHOICES.map((d) => (
              <button
                key={d}
                className="choice big"
                aria-pressed={days === d}
                onClick={() => {
                  setDays(d);
                  setStep("level");
                }}
              >
                <strong>{d}</strong>
                <small>{t("daysValue", { n: d })}</small>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {step === "level" && (
        <fieldset className="wizard-step">
          <legend>{t("wizLevel")}</legend>
          <div className="choice-grid">
            {LEVELS.map((l) => (
              <button
                key={l}
                className="choice"
                aria-pressed={level === l}
                onClick={() => {
                  setLevel(l);
                  setStep("equipment");
                }}
              >
                <strong>{tLevel(l, lang)}</strong>
                <small>{tLevelDesc(l, lang)}</small>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {step === "equipment" && (
        <fieldset className="wizard-step">
          <legend>{t("wizEquipment")}</legend>
          <p className="hint">{t(place === "home" ? "equipmentHintHome" : "equipmentHint")}</p>
          <div className="check-grid">
            {choices.map((e) => (
              <button
                key={e}
                className="chip capitalize"
                aria-pressed={equipment.includes(e)}
                onClick={() => toggleEquipment(e)}
              >
                {equipment.includes(e) && <Icon name="check" size={14} />}
                {tv(e)}
              </button>
            ))}
          </div>
          <div className="wizard-actions">
            <button className="btn ghost" onClick={() => setEquipment([])}>
              {t("clearSel")}
            </button>
            <button className="btn ghost" onClick={() => setEquipment(choices)}>
              {t("selectAll")}
            </button>
            <button
              className={`btn primary lg${busy ? " loading" : ""}`}
              onClick={generate}
              disabled={busy}
              aria-busy={busy}
            >
              {busy && <span className="btn-spinner" aria-hidden="true" />}
              <span>{t("generateRoutine")}</span>
            </button>
          </div>
          {error && (
            <p className="form-error" role="alert">
              <Icon name="alert-circle" size={18} />
              {t("errGeneric")}
            </p>
          )}
        </fieldset>
      )}

      {step === "preview" && plan && (
        <>
          <div className="preview-head">
            <div className="field grow">
              <label className="field-label" htmlFor="routine-name">
                {t("routineNameLabel")}
              </label>
              <input
                id="routine-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("routineNamePlaceholder")}
              />
            </div>
            <div className="preview-actions">
              <button className="btn secondary" onClick={generate} disabled={busy}>
                <Icon name="refresh" size={18} />
                {t("regenerate")}
              </button>
              <button
                className={`btn primary${busy ? " loading" : ""}`}
                onClick={requestSave}
                disabled={busy}
                aria-busy={busy}
              >
                {busy && <span className="btn-spinner" aria-hidden="true" />}
                <span>{t("saveRoutine")}</span>
              </button>
            </div>
          </div>
          <p className="hint">
            {tSplit(plan.split, lang)} · {t("perWeek", { n: plan.daysPerWeek })} ·{" "}
            {tGoal(plan.goal, lang)} · {tLevel(plan.level, lang)}
          </p>
          {!user && <p className="hint">{t("saveNeedsAccount")}</p>}
          {error && (
            <p className="form-error" role="alert">
              <Icon name="alert-circle" size={18} />
              {t("errGeneric")}
            </p>
          )}

          <div className="daylist">
            {plan.days.map((d, i) => (
              <DayCard
                key={i}
                day={d}
                index={i}
                onSwap={(e, position) => setSwapping({ dayIndex: i, position, current: e })}
              />
            ))}
          </div>
        </>
      )}

      {swapping && plan && (
        <ExerciseSwap
          current={swapping.current.exercise}
          slot={swapping.current.slot}
          level={plan.level}
          equipment={plan.equipment}
          place={plan.place}
          // Todo el día, para no ofrecer algo que ya está prescrito ahí.
          exclude={plan.days[swapping.dayIndex].exercises.map((e) => e.exercise.id)}
          onPick={applySwap}
          onClose={() => setSwapping(null)}
        />
      )}
    </div>
  );
}
