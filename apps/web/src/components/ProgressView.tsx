import { useCallback, useEffect, useState } from "react";
import { ApiError, apiDeleteSession, apiSessions, apiStats, mediaUrl } from "../api";
import { useI18n } from "../i18n/I18nContext";
import { tDayLabel } from "../i18n/plan";
import { translateName } from "../i18n/translateName";
import type { Stats, WorkoutSession } from "../types";
import { ConfirmDialog } from "./ConfirmDialog";
import { ProOnly } from "./PlansView";
import { Icon } from "./ui/Icon";

/** Plot height in px — bars are sized in pixels, matching .chart-track in CSS. */
const CHART_H = 130;

/** Compact number for the stat tiles: 12 400 → 12.4k. */
const compact = (n: number, lang: string) =>
  n >= 10_000 ? `${(n / 1000).toFixed(1)}k` : Math.round(n).toLocaleString(lang);

export function ProgressView({ onSeePlans }: { onSeePlans: () => void }) {
  const { t, lang } = useI18n();
  const [stats, setStats] = useState<Stats | null>(null);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  /** true when the API answered 402: the dashboard is Pro-only */
  const [locked, setLocked] = useState(false);
  /** session queued for deletion, pending confirmation */
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, h] = await Promise.all([apiStats(), apiSessions(20)]);
      setStats(s);
      setSessions(h);
      setLocked(false);
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) setLocked(true);
      else throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (id: string) => {
    setPendingDelete(null);
    await apiDeleteSession(id);
    await load();
  };

  // El h1 acompaña a todos los estados: la vista no puede quedarse sin
  // encabezado mientras carga, está bloqueada o aún no hay nada registrado.
  const heading = <h1 className="sr-only">{t("progress")}</h1>;

  if (loading) {
    return (
      <>
        {heading}
        <p className="status" role="status">
          {t("loading")}
        </p>
      </>
    );
  }

  if (locked) {
    return (
      <>
        {heading}
        <ProOnly onSeePlans={onSeePlans} />
      </>
    );
  }

  if (!stats || stats.totalSessions === 0) {
    return (
      <>
        {heading}
        <div className="empty first-use">
          <Icon name="chart" size={48} className="empty-icon" />
          <h2>{t("noSessionsTitle")}</h2>
          <p>{t("noSessionsText")}</p>
        </div>
      </>
    );
  }

  const peak = Math.max(...stats.weekly.map((w) => w.volume), 1);
  const dateFmt = new Intl.DateTimeFormat(lang, { day: "numeric", month: "short" });

  return (
    <div className="progress">
      {heading}

      <div className="stat-grid">
        <div className="stat">
          <span className="stat-value">{stats.totalSessions}</span>
          <span className="stat-label">{t("statSessions")}</span>
        </div>
        <div className="stat">
          <span className="stat-value">
            {compact(stats.totalVolume, lang)} <em>{t("weightCol")}</em>
          </span>
          <span className="stat-label">{t("statVolume")}</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.totalSets}</span>
          <span className="stat-label">{t("statSets")}</span>
        </div>
        <div className="stat">
          <span className="stat-value">
            <Icon name="flame" size={20} />
            {stats.streakWeeks}
          </span>
          <span className="stat-label">{t("statStreak")}</span>
        </div>
      </div>

      <section className="panel">
        <h2 className="section-label">{t("weeklyVolume")}</h2>
        <div className="chart">
          {stats.weekly.map((w) => (
            <div
              className="chart-col"
              key={w.week}
              title={`${Math.round(w.volume).toLocaleString(lang)} ${t("weightCol")}`}
            >
              <div className="chart-track">
                <div
                  className={`chart-bar ${w.volume ? "" : "flat"}`}
                  style={{ height: Math.max(3, Math.round((w.volume / peak) * CHART_H)) }}
                />
              </div>
              <span className="chart-x">{dateFmt.format(new Date(`${w.week}T00:00:00`))}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="panel-row">
        {stats.topExercises.length > 0 && (
          <section className="panel">
            <h2 className="section-label">{t("topExercises")}</h2>
            <ul className="ranklist">
              {stats.topExercises.map((e) => (
                <li key={e.exerciseId}>
                  <img src={mediaUrl(e.gifUrl)} alt="" loading="lazy" />
                  <span className="rank-main">
                    <strong>{translateName(e.name, lang)}</strong>
                    <small>{t("setsN", { n: e.sets })}</small>
                  </span>
                  <span className="rank-value">
                    {compact(e.volume, lang)} {t("weightCol")}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {stats.records.length > 0 && (
          <section className="panel">
            <h2 className="section-label">{t("personalRecords")}</h2>
            <ul className="ranklist">
              {stats.records.map((r) => (
                <li key={r.exerciseId}>
                  <span className="rank-icon">
                    <Icon name="medal" size={20} />
                  </span>
                  <span className="rank-main">
                    <strong>{translateName(r.name, lang)}</strong>
                    <small>
                      {r.bestWeight} {t("weightCol")} × {r.bestReps}
                    </small>
                  </span>
                  <span className="rank-value">
                    {r.est1rm} <em>{t("est1rm")}</em>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <section className="panel">
        <h2 className="section-label">{t("historyTitle")}</h2>
        <ul className="historylist">
          {sessions.map((s) => (
            <li key={s.id}>
              <span className="hist-date">
                {dateFmt.format(new Date(s.startedAt))}
              </span>
              <span className="rank-main">
                <strong>{s.day ? tDayLabel(s.day.label, lang) : t("freeWorkout")}</strong>
                <small>
                  {t("setsN", { n: s.setCount ?? s.sets.length })}
                  {s.notes ? ` · ${s.notes}` : ""}
                </small>
              </span>
              <span className="rank-value">
                {compact(s.volume ?? 0, lang)} {t("weightCol")}
              </span>
              <button
                className="btn icon ghost sm"
                onClick={() => setPendingDelete(s.id)}
                aria-label={t("delete")}
                title={t("delete")}
              >
                <Icon name="trash" size={18} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {pendingDelete && (
        <ConfirmDialog
          message={t("deleteConfirm")}
          onConfirm={() => remove(pendingDelete)}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
