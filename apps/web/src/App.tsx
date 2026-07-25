import { useEffect, useState, type ReactNode } from "react";
import { fetchExercises, fetchMeta, fetchMuscleCounts } from "./api";
import type { UIKey } from "./i18n/ui";
import type { Exercise, Meta, Routine } from "./types";
import { useI18n } from "./i18n/I18nContext";
import { useTheme } from "./useTheme";
import { useAuth } from "./auth/AuthContext";
import { LanguageMenu } from "./components/LanguageMenu";
import { ExerciseCard, SkeletonCard } from "./components/ExerciseCard";
import { ExerciseDetail } from "./components/ExerciseDetail";
import { FilterBar, type FilterState } from "./components/FilterBar";
import { MuscleMap } from "./components/MuscleMap";
import { AuthModal } from "./components/AuthModal";
import { RoutineView } from "./components/RoutineView";
import { WorkoutLogger } from "./components/WorkoutLogger";
import { ProgressView } from "./components/ProgressView";

type View = "catalog" | "map" | "routine" | "progress";

const NAV_LABEL: Record<View, UIKey> = {
  catalog: "navCatalog",
  map: "navMap",
  routine: "navRoutine",
  progress: "navProgress",
};

const NAV_ICONS: Record<View, ReactNode> = {
  catalog: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  map: (
    <>
      <circle cx="12" cy="4.5" r="2.2" />
      <path
        d="M12 7v7M12 8.5 7 11M12 8.5 17 11M9.5 21l2.5-7 2.5 7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  routine: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M8 3v4M16 3v4M3 10h18M8 15h3" strokeLinecap="round" />
    </>
  ),
  progress: (
    <path
      d="M4 19V9M10 19V5M16 19v-7M22 19H2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
};

export function App() {
  const { t } = useI18n();
  const { theme, toggle } = useTheme();
  const { user, ready, logout } = useAuth();

  const [meta, setMeta] = useState<Meta | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [items, setItems] = useState<Exercise[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [view, setView] = useState<View>("catalog");
  const [authOpen, setAuthOpen] = useState(false);
  /** non-null while a workout is being logged */
  const [workout, setWorkout] = useState<{ routine: Routine; dayIndex: number } | null>(null);

  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    bodyPart: "",
    target: "",
    equipment: "",
    muscle: "",
  });
  const setFilter = (patch: Partial<FilterState>) =>
    setFilters((f) => ({ ...f, ...patch }));

  useEffect(() => {
    fetchMeta().then(setMeta).catch((e) => setError(String(e)));
    fetchMuscleCounts().then(setCounts).catch(() => {});
  }, []);

  useEffect(() => {
    if (view !== "catalog") return;
    setLoading(true);
    const timer = setTimeout(() => {
      fetchExercises({ q, ...filters, limit: 60 })
        .then((res) => {
          setItems(res.items);
          setTotal(res.total);
          setError(null);
        })
        .catch((e) => setError(String(e)))
        .finally(() => setLoading(false));
    }, 220);
    return () => clearTimeout(timer);
  }, [q, filters, view]);

  const selectMuscle = (keys: string[]) => {
    setFilters({ bodyPart: "", target: "", equipment: "", muscle: keys.join(",") });
    setView("catalog");
  };

  /** Views that need an account; anonymous visitors get a sign-in prompt. */
  const go = (next: View) => {
    if ((next === "routine" || next === "progress") && !user) {
      setAuthOpen(true);
      return;
    }
    setView(next);
    setWorkout(null);
  };

  const signInPrompt = (
    <div className="empty">
      <div className="empty-icon">🔐</div>
      <h2>{t("signIn")}</h2>
      <p>{t("authRequired")}</p>
      <button className="btn primary" onClick={() => setAuthOpen(true)}>
        {t("signIn")}
      </button>
    </div>
  );

  return (
    <>
      <header className="topbar">
        <div className="brand">
          💪 <span className="tag-name">FitApp</span>
        </div>

        <div className="searchbox">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            placeholder={t("searchPlaceholder")}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setView("catalog");
            }}
          />
        </div>

        <div className="topbar-actions">
          <nav className="viewtoggle" role="tablist">
            {(Object.keys(NAV_ICONS) as View[]).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                className={view === v && !workout ? "active" : ""}
                onClick={() => go(v)}
                aria-label={t(NAV_LABEL[v])}
                title={t(NAV_LABEL[v])}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {NAV_ICONS[v]}
                </svg>
              </button>
            ))}
          </nav>
          <LanguageMenu />
          <button className="icon-btn" onClick={toggle} aria-label={t("theme")} title={t("theme")}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          {ready &&
            (user ? (
              <button
                className="icon-btn avatar"
                onClick={logout}
                title={`${user.name} — ${t("signOut")}`}
                aria-label={t("signOut")}
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" />
                ) : (
                  user.name.slice(0, 1).toUpperCase()
                )}
              </button>
            ) : (
              <button className="btn ghost small" onClick={() => setAuthOpen(true)}>
                {t("signIn")}
              </button>
            ))}
        </div>
      </header>

      {view === "catalog" && !workout && (
        <>
          <FilterBar
            meta={meta}
            filters={filters}
            set={setFilter}
            total={total}
            loading={loading}
          />
          <main className="content">
            <div className="grid">
              {error && <div className="status">Error: {error}</div>}
              {loading &&
                items.length === 0 &&
                Array.from({ length: 15 }).map((_, i) => <SkeletonCard key={i} />)}
              {!loading && !error && items.length === 0 && (
                <div className="status">{t("noResults")}</div>
              )}
              {items.map((ex) => (
                <ExerciseCard key={ex.id} ex={ex} onOpen={setSelected} />
              ))}
            </div>
          </main>
        </>
      )}

      {view === "map" && !workout && (
        <main className="content">
          <MuscleMap activeMuscle={filters.muscle} counts={counts} onSelect={selectMuscle} />
        </main>
      )}

      {view === "routine" && !workout && (
        <main className="content narrow">
          {user ? (
            <RoutineView
              meta={meta}
              onOpenExercise={setSelected}
              onStartWorkout={(routine, dayIndex) => setWorkout({ routine, dayIndex })}
            />
          ) : (
            signInPrompt
          )}
        </main>
      )}

      {view === "progress" && !workout && (
        <main className="content narrow">{user ? <ProgressView /> : signInPrompt}</main>
      )}

      {workout && (
        <main className="content narrow">
          <WorkoutLogger
            routine={workout.routine}
            dayIndex={workout.dayIndex}
            onCancel={() => setWorkout(null)}
            onDone={() => {
              setWorkout(null);
              setView("progress");
            }}
          />
        </main>
      )}

      {selected && <ExerciseDetail ex={selected} onClose={() => setSelected(null)} />}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  );
}
