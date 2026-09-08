import { useEffect, useState } from "react";
import { apiRoutine, apiRoutines, apiSessions, apiStatsSummary } from "../api";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import { tDayLabel } from "../i18n/plan";
import { navigate } from "../router";
import { PATHS } from "../routes";
import type { Routine, RoutineDay, StatsSummary, WorkoutSession } from "../types";
import { Icon } from "./ui/Icon";

/** Trabajo por serie, aparte del descanso prescrito. Sostiene un "≈", no más. */
const SET_WORK_SEC = 45;

// Descansos entre series, no después de la última: contarlos todos añadía casi
// un cuarto de hora de gimnasio imaginario.
const minutesOf = (day: RoutineDay) =>
  Math.round(
    day.exercises.reduce((s, e) => s + e.sets * SET_WORK_SEC + (e.sets - 1) * e.restSec, 0) / 60,
  );

/**
 * El plan no tiene calendario: la rutina es una rotación de días. El que toca
 * es el siguiente al último registrado, así que saltarse un día no descoloca
 * el plan, sólo lo retrasa.
 */
function nextDayIndex(routine: Routine, sessions: WorkoutSession[]): number {
  const last = sessions.find((s) => s.routineId === routine.id && s.dayId);
  const done = last ? routine.days.findIndex((d) => d.id === last.dayId) : -1;
  return done < 0 ? 0 : (done + 1) % routine.days.length;
}

const isToday = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

export function TodayView({
  onStartWorkout,
  onSignIn,
}: {
  onStartWorkout: (routine: Routine, dayIndex: number) => void;
  onSignIn: () => void;
}) {
  const { t, tv, lang } = useI18n();
  const { user, ready } = useAuth();

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [dayIndex, setDayIndex] = useState(0);
  const [doneToday, setDoneToday] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      setLoading(false);
      return;
    }

    let alive = true;
    setLoading(true);
    setFailed(false);
    (async () => {
      const [list, sessions, stats] = await Promise.all([
        apiRoutines(),
        apiSessions(10),
        apiStatsSummary(),
      ]);
      const active = list.find((r) => r.active) ?? list[0];
      const full = active ? await apiRoutine(active.id) : null;
      if (!alive) return;
      setRoutine(full);
      setSummary(stats);
      setDayIndex(full ? nextDayIndex(full, sessions) : 0);
      setDoneToday(sessions.some((s) => isToday(s.startedAt)));
    })()
      .catch(() => {
        if (alive) setFailed(true);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [ready, user]);

  if (!ready || loading || failed) {
    return (
      <div className="today">
        <h1 className="sr-only">{t("todayTitle")}</h1>
        {failed ? (
          <p className="status error">{t("loadError")}</p>
        ) : (
          <p className="status" role="status">
            {t("loading")}
          </p>
        )}
      </div>
    );
  }

  // Sin cuenta y sin plan comparten pantalla: en los dos casos lo único que
  // importa es llegar al plan, y el asistente no pide cuenta para llegar.
  if (!routine) {
    return (
      <div className="today">
        <section className="hero">
          <h1>{t("todayHeroTitle")}</h1>
          <p>{user ? t("todayNoPlanText") : t("todayHeroText")}</p>
          <button className="btn primary lg block" onClick={() => navigate(PATHS.wizard)}>
            <Icon name="sparkle" size={20} />
            {t("todayHeroCta")}
          </button>
          <button className="btn ghost block" onClick={() => navigate(PATHS.exercises)}>
            {t("todayExplore")}
          </button>
        </section>

        {!user && (
          <p className="auth-switch">
            {t("haveAccount")}{" "}
            <button type="button" className="linkish" onClick={onSignIn}>
              {t("signIn")}
            </button>
          </p>
        )}
      </div>
    );
  }

  const day = routine.days[dayIndex];
  const dateFmt = new Intl.DateTimeFormat(lang, { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="today">
      <header className="today-head">
        <p className="today-date">{dateFmt.format(new Date())}</p>
        <h1>{t("todayGreeting", { name: user?.name.split(" ")[0] ?? "" })}</h1>
      </header>

      <section className="today-card">
        <span className={`badge ${doneToday ? "success" : "brand"}`}>
          <Icon name={doneToday ? "check-circle" : "calendar"} size={14} />
          {doneToday ? t("todayDone") : t("todayNext")}
        </span>
        <h2>{tDayLabel(day.label, lang)}</h2>
        <div className="daycard-focus">
          {day.focus.map((f) => (
            <span key={f} className="badge soft">
              {tv(f)}
            </span>
          ))}
        </div>
        <p className="hint">
          {t("exercisesN", { n: day.exercises.length })} · {t("todayAboutMin", { n: minutesOf(day) })}
        </p>
        <button
          className={`btn ${doneToday ? "secondary" : "primary"} lg block`}
          onClick={() => onStartWorkout(routine, dayIndex)}
        >
          <Icon name="play" size={20} />
          {doneToday ? t("todayTrainAgain") : t("startWorkout")}
        </button>
        <button className="btn ghost block" onClick={() => navigate(PATHS.routine)}>
          {t("todaySeePlan")}
        </button>
      </section>

      {summary && (
        <>
          <div className="today-stats">
            <div className="stat">
              <span className="stat-value">
                <Icon name="flame" size={20} />
                {summary.streakWeeks}
              </span>
              <span className="stat-label">{t("statStreak")}</span>
            </div>
            <div className="stat">
              <span className="stat-value">{summary.sessionsThisWeek}</span>
              <span className="stat-label">{t("todayWeekSessions")}</span>
            </div>
            <div className="stat">
              <span className="stat-value">
                {Math.round(summary.weekVolume).toLocaleString(lang)} <em>{t("weightCol")}</em>
              </span>
              <span className="stat-label">{t("todayWeekVolume")}</span>
            </div>
          </div>

          <button className="btn secondary block" onClick={() => navigate(PATHS.progress)}>
            <Icon name="chart" size={18} />
            {t("todaySeeProgress")}
          </button>
        </>
      )}
    </div>
  );
}
