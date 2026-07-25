import { useState } from "react";
import { apiGenerateRoutine, apiSaveRoutine } from "../api";
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
import type { GeneratedRoutine, Goal, Level, Meta, Routine } from "../types";
import { DayCard } from "./DayCard";

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

type Step = "goal" | "days" | "level" | "equipment" | "preview";
const ORDER: Step[] = ["goal", "days", "level", "equipment", "preview"];

export function RoutineWizard({
  meta,
  onSaved,
  onCancel,
}: {
  meta: Meta | null;
  onSaved: (routine: Routine) => void;
  onCancel: () => void;
}) {
  const { t, tv, lang } = useI18n();

  const [step, setStep] = useState<Step>("goal");
  const [goal, setGoal] = useState<Goal>("hypertrophy");
  const [days, setDays] = useState(4);
  const [level, setLevel] = useState<Level>("beginner");
  const [equipment, setEquipment] = useState<string[]>([]);

  const [plan, setPlan] = useState<GeneratedRoutine | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

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
      const p = await apiGenerateRoutine({ goal, level, daysPerWeek: days, equipment });
      setPlan(p);
      if (!name) setName(`${tGoal(goal, lang)} · ${t("perWeek", { n: days })}`);
      setStep("preview");
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
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
  };

  const stepIndex = ORDER.indexOf(step);
  const goBack = () =>
    stepIndex === 0 ? onCancel() : setStep(ORDER[stepIndex - 1]);

  return (
    <div className="wizard">
      <div className="wizard-head">
        <button className="btn ghost" onClick={goBack}>
          ← {t("back")}
        </button>
        <div className="wizard-dots">
          {ORDER.map((s, i) => (
            <span key={s} className={`dot ${i <= stepIndex ? "on" : ""}`} />
          ))}
        </div>
      </div>

      {step === "goal" && (
        <fieldset className="wizard-step">
          <legend>{t("wizGoal")}</legend>
          <div className="choice-grid">
            {GOALS.map((g) => (
              <button
                key={g}
                className={`choice ${goal === g ? "on" : ""}`}
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
                className={`choice big ${days === d ? "on" : ""}`}
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
                className={`choice ${level === l ? "on" : ""}`}
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
          <p className="hint">{t("equipmentHint")}</p>
          <div className="check-grid">
            {choices.map((e) => (
              <button
                key={e}
                className={`checkchip ${equipment.includes(e) ? "on" : ""}`}
                onClick={() => toggleEquipment(e)}
              >
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
            <button className="btn primary" onClick={generate} disabled={busy}>
              {busy ? t("generating") : t("generateRoutine")}
            </button>
          </div>
          {error && <div className="form-error">{t("errGeneric")}</div>}
        </fieldset>
      )}

      {step === "preview" && plan && (
        <>
          <div className="preview-head">
            <label className="field grow">
              <span>{t("routineNameLabel")}</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("routineNamePlaceholder")}
              />
            </label>
            <div className="preview-actions">
              <button className="btn ghost" onClick={generate} disabled={busy}>
                ↻ {t("regenerate")}
              </button>
              <button className="btn primary" onClick={save} disabled={busy}>
                {busy ? t("loading") : t("saveRoutine")}
              </button>
            </div>
          </div>
          <p className="hint">
            {tSplit(plan.split, lang)} · {t("perWeek", { n: plan.daysPerWeek })} ·{" "}
            {tGoal(plan.goal, lang)} · {tLevel(plan.level, lang)}
          </p>
          {error && <div className="form-error">{t("errGeneric")}</div>}

          <div className="daylist">
            {plan.days.map((d, i) => (
              <DayCard key={i} day={d} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
