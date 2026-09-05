import { useEffect, useState } from "react";
import { fetchExercises, fetchMeta, fetchMuscleCounts } from "./api";
import type { UIKey } from "./i18n/ui";
import type { Exercise, Meta, Routine } from "./types";
import { useI18n } from "./i18n/I18nContext";
import { useTheme } from "./theme";
import { useAuth } from "./auth/AuthContext";
import { LanguageMenu } from "./components/LanguageMenu";
import { AccountMenu } from "./components/AccountMenu";
import { ExerciseCard, SkeletonCard } from "./components/ExerciseCard";
import { ExerciseDetail } from "./components/ExerciseDetail";
import { FilterBar, type FilterState } from "./components/FilterBar";
import { MuscleMap } from "./components/MuscleMap";
import { AuthModal } from "./components/AuthModal";
import { RoutineView } from "./components/RoutineView";
import { WorkoutLogger } from "./components/WorkoutLogger";
import { ProgressView } from "./components/ProgressView";
import { PlansView } from "./components/PlansView";
import { Icon, type IconName } from "./components/ui/Icon";
import { Logo } from "./components/ui/Logo";

type View = "catalog" | "map" | "routine" | "progress" | "billing";

const NAV: { view: View; label: UIKey; icon: IconName }[] = [
  { view: "catalog", label: "navCatalog", icon: "grid" },
  { view: "map", label: "navMap", icon: "body" },
  { view: "routine", label: "navRoutine", icon: "calendar" },
  { view: "progress", label: "navProgress", icon: "chart" },
  { view: "billing", label: "navPlans", icon: "credit-card" },
];

export function App() {
  const { t } = useI18n();
  const { theme, toggle } = useTheme();
  const { user, ready } = useAuth();

  const [meta, setMeta] = useState<Meta | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [items, setItems] = useState<Exercise[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
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
    tag: "",
  });
  const setFilter = (patch: Partial<FilterState>) =>
    setFilters((f) => ({ ...f, ...patch }));

  useEffect(() => {
    fetchMeta().then(setMeta).catch(() => setFailed(true));
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
          setFailed(false);
        })
        .catch(() => setFailed(true))
        .finally(() => setLoading(false));
    }, 220);
    return () => clearTimeout(timer);
  }, [q, filters, view]);

  const selectMuscle = (keys: string[]) => {
    // The home/no-gym tag survives: picking a muscle off the map is narrowing
    // the search, not starting a new one.
    setFilters((f) => ({
      bodyPart: "",
      target: "",
      equipment: "",
      muscle: keys.join(","),
      tag: f.tag,
    }));
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
    <div className="empty first-use">
      <Icon name="lock" size={48} className="empty-icon" />
      <h2>{t("signIn")}</h2>
      <p>{t("authRequired")}</p>
      <button className="btn primary lg" onClick={() => setAuthOpen(true)}>
        {t("signIn")}
      </button>
    </div>
  );

  const navItems = NAV.map((n) => ({ ...n, current: view === n.view && !workout }));

  return (
    <>
      <a className="skip-link" href="#main">
        {t("skipToContent")}
      </a>

      <header className="topbar">
        <Logo />

        <div className="searchbox">
          <Icon name="search" size={18} />
          <input
            type="search"
            aria-label={t("searchPlaceholder")}
            placeholder={t("searchPlaceholder")}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setView("catalog");
            }}
          />
        </div>

        <div className="topbar-actions">
          {/* Navegación de aplicación: <nav> + aria-current, no un tablist
              (un tablist obliga al patrón de flechas de APG). */}
          <nav className="navtabs" aria-label={t("mainNav")}>
            {navItems.map((n) => (
              <button
                key={n.view}
                className="tab"
                aria-current={n.current ? "page" : undefined}
                onClick={() => go(n.view)}
              >
                <Icon name={n.icon} size={18} />
                {t(n.label)}
              </button>
            ))}
          </nav>

          <LanguageMenu />

          <button
            className="btn icon ghost"
            onClick={toggle}
            aria-label={t(theme === "dark" ? "themeToLight" : "themeToDark")}
            title={t(theme === "dark" ? "themeToLight" : "themeToDark")}
          >
            <Icon name={theme === "dark" ? "sun" : "moon"} size={20} />
          </button>

          {ready &&
            (user ? (
              <AccountMenu />
            ) : (
              <button className="btn secondary sm" onClick={() => setAuthOpen(true)}>
                {t("signIn")}
              </button>
            ))}
        </div>
      </header>

      {view === "catalog" && !workout && (
        <FilterBar
          meta={meta}
          filters={filters}
          set={setFilter}
          total={total}
          loading={loading}
        />
      )}

      <main id="main" className="app-main">
        {view === "catalog" && !workout && (
          <div className="container wide">
            <h1 className="sr-only">{t("catalogList")}</h1>
            <div className="grid" aria-busy={loading}>
              {failed && <div className="status error">{t("loadError")}</div>}
              {loading &&
                items.length === 0 &&
                Array.from({ length: 15 }).map((_, i) => <SkeletonCard key={i} />)}
              {!loading && !failed && items.length === 0 && (
                <div className="status">{t("noResults")}</div>
              )}
              {items.map((ex) => (
                <ExerciseCard key={ex.id} ex={ex} onOpen={setSelected} />
              ))}
            </div>
          </div>
        )}

        {view === "map" && !workout && (
          <div className="container">
            <h1 className="sr-only">{t("navMap")}</h1>
            <MuscleMap activeMuscle={filters.muscle} counts={counts} onSelect={selectMuscle} />
          </div>
        )}

        {view === "routine" && !workout && (
          <div className="container narrow">
            {user ? (
              <RoutineView
                meta={meta}
                onOpenExercise={setSelected}
                onStartWorkout={(routine, dayIndex) => setWorkout({ routine, dayIndex })}
              />
            ) : (
              signInPrompt
            )}
          </div>
        )}

        {view === "progress" && !workout && (
          <div className="container narrow">
            {user ? <ProgressView onSeePlans={() => setView("billing")} /> : signInPrompt}
          </div>
        )}

        {view === "billing" && !workout && (
          <div className="container narrow">
            <PlansView onSignIn={() => setAuthOpen(true)} />
          </div>
        )}

        {workout && (
          <div className="container narrow">
            <WorkoutLogger
              routine={workout.routine}
              dayIndex={workout.dayIndex}
              onOpenExercise={setSelected}
              onCancel={() => setWorkout(null)}
              onDone={() => {
                setWorkout(null);
                setView("progress");
              }}
            />
          </div>
        )}
      </main>

      <nav className="tabbar" aria-label={t("mainNav")}>
        {navItems.map((n) => (
          <button
            key={n.view}
            className="tabbar-item"
            aria-current={n.current ? "page" : undefined}
            onClick={() => go(n.view)}
          >
            <Icon name={n.icon} size={24} className="tabbar-icon" />
            <span className="tabbar-label">{t(n.label)}</span>
          </button>
        ))}
      </nav>

      {selected && <ExerciseDetail ex={selected} onClose={() => setSelected(null)} />}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  );
}
