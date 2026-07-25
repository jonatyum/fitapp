import { useEffect, useMemo, useRef, useState } from "react";
import { apiDeleteSession, apiSaveSession, apiStartSession, mediaUrl, type SetInput } from "../api";
import { useI18n } from "../i18n/I18nContext";
import { tDayLabel } from "../i18n/plan";
import { translateName } from "../i18n/translateName";
import type { Routine, WorkoutSession } from "../types";
import { ConfirmDialog } from "./ConfirmDialog";

interface Row {
  reps: string;
  weight: string;
  done: boolean;
}

const clock = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = String(Math.floor(total / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
};

export function WorkoutLogger({
  routine,
  dayIndex,
  onDone,
  onCancel,
}: {
  routine: Routine;
  dayIndex: number;
  onDone: () => void;
  onCancel: () => void;
}) {
  const { t, lang } = useI18n();
  const day = routine.days[dayIndex];

  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [rows, setRows] = useState<Row[][]>(() =>
    day.exercises.map((e) =>
      Array.from({ length: e.sets }, () => ({
        reps: String(e.repsMin),
        weight: "",
        done: false,
      })),
    ),
  );
  const [notes, setNotes] = useState("");
  const [now, setNow] = useState(Date.now());
  const [busy, setBusy] = useState(false);
  const [warn, setWarn] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Guard against React 18 StrictMode double-invoking the effect and opening
  // two sessions.
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    apiStartSession(day.id).then(setSession).catch(() => setWarn(true));
  }, [day.id]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const elapsed = session ? now - new Date(session.startedAt).getTime() : 0;

  const patch = (exIdx: number, setIdx: number, next: Partial<Row>) =>
    setRows((prev) =>
      prev.map((sets, i) =>
        i !== exIdx ? sets : sets.map((r, j) => (j !== setIdx ? r : { ...r, ...next })),
      ),
    );

  const addSet = (exIdx: number) =>
    setRows((prev) =>
      prev.map((sets, i) =>
        i !== exIdx
          ? sets
          : [...sets, { ...(sets[sets.length - 1] ?? { reps: "10", weight: "" }), done: false }],
      ),
    );

  const payload = useMemo<SetInput[]>(
    () =>
      rows.flatMap((sets, exIdx) =>
        sets
          .map((r, j) => ({ r, j }))
          .filter(({ r }) => r.done && Number(r.reps) > 0)
          .map(({ r, j }) => ({
            exerciseId: day.exercises[exIdx].exercise.id,
            setNumber: j + 1,
            reps: Number(r.reps),
            weight: Number(r.weight) || 0,
          })),
      ),
    [rows, day.exercises],
  );

  const volume = payload.reduce((v, s) => v + s.reps * s.weight, 0);

  const finish = async () => {
    if (!session) return;
    if (!payload.length) {
      setWarn(true);
      return;
    }
    setBusy(true);
    try {
      await apiSaveSession(session.id, { sets: payload, notes, finish: true });
      onDone();
    } finally {
      setBusy(false);
    }
  };

  const discard = async () => {
    if (session) await apiDeleteSession(session.id).catch(() => {});
    onCancel();
  };

  return (
    <div className="logger">
      <header className="logger-head">
        <div>
          <span className="daycard-index">{t("workoutTitle")}</span>
          <h2>{tDayLabel(day.label, lang)}</h2>
          <p className="hint">
            {t("elapsed")} {clock(elapsed)} · {t("statVolume")}{" "}
            {volume.toLocaleString(lang)} {t("weightCol")}
          </p>
        </div>
        <div className="logger-actions">
          <button className="btn ghost" onClick={() => setConfirming(true)}>
            {t("cancel")}
          </button>
          <button className="btn primary" onClick={finish} disabled={busy || !session}>
            {busy ? t("loading") : t("finish")}
          </button>
        </div>
      </header>

      {warn && !payload.length && <div className="form-error">{t("emptyWorkout")}</div>}

      {day.exercises.map((e, exIdx) => (
        <section className="logblock" key={e.id}>
          <div className="logblock-head">
            <img src={mediaUrl(e.exercise.gifUrl)} alt="" loading="lazy" />
            <div>
              <strong>{translateName(e.exercise.name, lang)}</strong>
              <small>
                {e.sets} × {e.repsMin}–{e.repsMax} · {t("restN", { n: e.restSec })}
              </small>
            </div>
          </div>

          <table className="settable">
            <thead>
              <tr>
                <th>{t("setCol")}</th>
                <th>{t("repsCol")}</th>
                <th>{t("weightCol")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows[exIdx].map((r, setIdx) => (
                <tr key={setIdx} className={r.done ? "done" : ""}>
                  <td className="setnum">{setIdx + 1}</td>
                  <td>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={r.reps}
                      onChange={(ev) => patch(exIdx, setIdx, { reps: ev.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="0.5"
                      placeholder="0"
                      value={r.weight}
                      onChange={(ev) => patch(exIdx, setIdx, { weight: ev.target.value })}
                    />
                  </td>
                  <td>
                    <button
                      className={`checkbtn ${r.done ? "on" : ""}`}
                      onClick={() => patch(exIdx, setIdx, { done: !r.done })}
                      aria-pressed={r.done}
                    >
                      ✓
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="btn ghost small" onClick={() => addSet(exIdx)}>
            + {t("addSet")}
          </button>
        </section>
      ))}

      <label className="field">
        <span>{t("notesLabel")}</span>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("notesPlaceholder")}
        />
      </label>

      <button className="btn primary block" onClick={finish} disabled={busy || !session}>
        {busy ? t("loading") : t("finish")}
      </button>

      {confirming && (
        <ConfirmDialog
          message={t("discardConfirm")}
          onConfirm={discard}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  );
}
