import { useCallback, useEffect, useState } from "react";
import {
  ApiError,
  apiDeleteRoutine,
  apiRoutine,
  apiRoutines,
  apiSwapRoutineExercise,
  apiUpdateRoutine,
} from "../api";
import { useI18n } from "../i18n/I18nContext";
import { tGoal, tLevel, tSplit } from "../i18n/plan";
import type { Alternative, Exercise, Routine, RoutineSummary } from "../types";
import { ConfirmDialog } from "./ConfirmDialog";
import { DayCard, type DayExercise } from "./DayCard";
import { ExerciseSwap } from "./ExerciseSwap";
import { RoutineWizard } from "./RoutineWizard";
import { Icon } from "./ui/Icon";
import type { Meta } from "../types";

export function RoutineView({
  meta,
  onStartWorkout,
  onOpenExercise,
}: {
  meta: Meta | null;
  onStartWorkout: (routine: Routine, dayIndex: number) => void;
  onOpenExercise: (ex: Exercise) => void;
}) {
  const { t, lang } = useI18n();

  const [list, setList] = useState<RoutineSummary[] | null>(null);
  const [current, setCurrent] = useState<Routine | null>(null);
  const [wizard, setWizard] = useState(false);
  const [loading, setLoading] = useState(true);
  /** routine queued for deletion, pending confirmation */
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  /** fila del plan que se está cambiando por una alternativa */
  const [swapping, setSwapping] = useState<{
    dayId: string;
    rowId: string;
    current: DayExercise;
  } | null>(null);
  const [swapBusy, setSwapBusy] = useState<string | null>(null);
  const [swapError, setSwapError] = useState<string | null>(null);

  // Aquí el plan ya existe en el servidor, así que el cambio se persiste y la
  // respuesta trae la rutina entera: no hace falta recomponerla en el cliente.
  const applySwap = async (alt: Alternative) => {
    if (!swapping || !current) return;
    setSwapBusy(swapping.current.exercise.id);
    setSwapError(null);
    try {
      setCurrent(await apiSwapRoutineExercise(current.id, swapping.rowId, alt.id));
      setSwapping(null);
    } catch (e) {
      setSwapError(
        e instanceof ApiError && e.code === "already_in_day" ? t("swapDuplicate") : t("swapFailed"),
      );
    } finally {
      setSwapBusy(null);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const routines = await apiRoutines();
      setList(routines);
      const target = routines.find((r) => r.active) ?? routines[0];
      setCurrent(target ? await apiRoutine(target.id) : null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const activate = async (id: string) => {
    await apiUpdateRoutine(id, { active: true });
    await load();
  };

  const remove = async (id: string) => {
    setPendingDelete(null);
    await apiDeleteRoutine(id);
    await load();
  };

  if (wizard) {
    return (
      <RoutineWizard
        meta={meta}
        onCancel={() => setWizard(false)}
        onSaved={async (saved) => {
          setWizard(false);
          setCurrent(saved);
          setList(await apiRoutines());
        }}
      />
    );
  }

  if (loading) return <p className="status" role="status">{t("loading")}</p>;

  if (!current) {
    return (
      <div className="empty first-use">
        <Icon name="calendar" size={48} className="empty-icon" />
        <h2>{t("noRoutineTitle")}</h2>
        <p>{t("noRoutineText")}</p>
        <button className="btn primary lg" onClick={() => setWizard(true)}>
          {t("newRoutine")}
        </button>
      </div>
    );
  }

  const others = (list ?? []).filter((r) => r.id !== current.id);

  return (
    <div className="routineview">
      <header className="routine-head">
        <div>
          <div className="routine-title">
            <h1>{current.name}</h1>
            {current.active && <span className="badge brand">{t("activeBadge")}</span>}
          </div>
          <p className="hint">
            {tSplit(current.split, lang)} · {t("perWeek", { n: current.daysPerWeek })} ·{" "}
            {tGoal(current.goal, lang)} · {tLevel(current.level, lang)}
          </p>
        </div>
        <button className="btn primary" onClick={() => setWizard(true)}>
          <Icon name="plus" size={18} />
          {t("newRoutine")}
        </button>
      </header>

      <div className="daylist">
        {current.days.map((d, i) => (
          <DayCard
            key={d.id}
            day={d}
            index={i}
            onStart={() => onStartWorkout(current, i)}
            onOpenExercise={onOpenExercise}
            onSwap={(e, position) => {
              setSwapError(null);
              setSwapping({ dayId: d.id, rowId: d.exercises[position].id, current: e });
            }}
            swappingId={swapBusy}
          />
        ))}
      </div>

      {others.length > 0 && (
        <>
          <h2 className="section-label">{t("otherRoutines")}</h2>
          <ul className="routine-list">
            {others.map((r) => (
              <li key={r.id}>
                <button className="routine-row" onClick={() => activate(r.id)}>
                  <span>
                    <strong>{r.name}</strong>
                    <small>
                      {tGoal(r.goal, lang)} · {t("perWeek", { n: r.daysPerWeek })}
                    </small>
                  </span>
                  <span className="linkish">{t("makeActive")}</span>
                </button>
                <button
                  className="btn icon ghost"
                  onClick={() => setPendingDelete(r.id)}
                  aria-label={`${t("delete")}: ${r.name}`}
                  title={t("delete")}
                >
                  <Icon name="trash" size={18} />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {pendingDelete && (
        <ConfirmDialog
          message={t("deleteConfirm")}
          onConfirm={() => remove(pendingDelete)}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {swapping && current && (
        <ExerciseSwap
          current={swapping.current.exercise}
          slot={swapping.current.slot}
          level={current.level}
          equipment={current.equipment}
          exclude={
            current.days.find((d) => d.id === swapping.dayId)?.exercises.map((e) => e.exerciseId) ??
            []
          }
          busy={swapBusy !== null}
          error={swapError}
          onPick={applySwap}
          onClose={() => {
            setSwapping(null);
            setSwapError(null);
          }}
        />
      )}
    </div>
  );
}
