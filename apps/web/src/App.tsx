import { useEffect, useState } from "react";
import { fetchMeta, fetchMuscleCounts } from "./api";
import type { UIKey } from "./i18n/ui";
import type { Exercise, Meta, Routine } from "./types";
import { useI18n } from "./i18n/I18nContext";
import { navigate, usePath } from "./router";
import { PATHS, VIEW_BY_PATH, type View } from "./routes";
import { useTheme } from "./theme";
import { useExerciseList } from "./useExerciseList";
import { useAuth } from "./auth/AuthContext";
import { LanguageMenu } from "./components/LanguageMenu";
import { AccountMenu } from "./components/AccountMenu";
import { ExerciseCard, SkeletonCard } from "./components/ExerciseCard";
import { ExerciseDetail } from "./components/ExerciseDetail";
import { FilterBar, type FilterState } from "./components/FilterBar";
import { MuscleMap } from "./components/MuscleMap";
import { AdminView } from "./components/AdminView";
import { AuthModal } from "./components/AuthModal";
import { MeView } from "./components/MeView";
import { RoutineView } from "./components/RoutineView";
import { RoutineWizard } from "./components/RoutineWizard";
import { SettingsView } from "./components/SettingsView";
import { TodayView } from "./components/TodayView";
import { WorkoutLogger } from "./components/WorkoutLogger";
import { ProgressView } from "./components/ProgressView";
import { PlansView } from "./components/PlansView";
import { Icon, type IconName } from "./components/ui/Icon";
import { Logo } from "./components/ui/Logo";

/**
 * Cuatro pestañas. Progreso se alcanza desde Hoy, Planes desde Yo: ninguna de
 * las dos es un sitio donde el usuario vaya a vivir, y una barra de cinco
 * pestañas no deja sitio a la que importa.
 */
const NAV: { view: View; label: UIKey; icon: IconName }[] = [
  { view: "today", label: "navToday", icon: "home" },
  { view: "routine", label: "navPlan", icon: "calendar" },
  { view: "exercises", label: "navExercises", icon: "grid" },
  { view: "me", label: "navMe", icon: "user" },
];

/** Rutas sin pestaña propia que pertenecen a una. */
const TAB_OF: Partial<Record<View, View>> = { wizard: "routine", workout: "routine" };

export function App() {
  const { t, lang } = useI18n();
  const { theme, toggle } = useTheme();
  const { user, ready } = useAuth();

  const [meta, setMeta] = useState<Meta | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  /** lista o cuerpo: dos pieles del mismo catálogo */
  const [mode, setMode] = useState<"list" | "body">("list");
  /** non-null while a workout is being logged */
  const [workout, setWorkout] = useState<{ routine: Routine; dayIndex: number } | null>(null);

  const path = usePath();
  const view = VIEW_BY_PATH[path] ?? "today";

  useEffect(() => {
    // Una ruta desconocida cae a Hoy, y /workout sin entrenamiento en curso
    // (una recarga, por ejemplo) vuelve al plan. Sin cuenta no hay plan que
    // enseñar: la pestaña lleva al asistente, que es el camino de activación.
    if (!VIEW_BY_PATH[path]) navigate(PATHS.today, { replace: true });
    else if (view === "workout" && !workout) navigate(PATHS.routine, { replace: true });
    else if (view === "routine" && ready && !user) navigate(PATHS.wizard, { replace: true });
    // Los ajustes son de una cuenta: sin sesión, "Yo" es donde se crea.
    else if (view === "settings" && ready && !user) navigate(PATHS.me, { replace: true });
    // /admin no está enlazada en ningún sitio salvo en "Yo" y sólo para quien
    // tiene el rol; entrar a mano sin él devuelve a Hoy. La autorización de
    // verdad la hace el API en cada petición.
    else if (view === "admin" && ready && user?.role !== "admin") {
      navigate(PATHS.today, { replace: true });
    }
  }, [path, view, workout, ready, user]);

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
    fetchMeta().then(setMeta).catch(() => {});
    fetchMuscleCounts().then(setCounts).catch(() => {});
  }, []);

  const { items, total, loading, loadingMore, failed, hasMore, loadMore } =
    useExerciseList(q, filters, view === "exercises");

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
    setMode("list");
  };

  const browse = () => {
    setMode("list");
    navigate(PATHS.exercises);
  };

  const startWorkout = (routine: Routine, dayIndex: number) => {
    setWorkout({ routine, dayIndex });
    navigate(PATHS.workout);
  };

  const go = (next: View) => {
    setWorkout(null);
    navigate(PATHS[next]);
  };

  const navItems = NAV.map((n) => ({ ...n, current: (TAB_OF[view] ?? view) === n.view }));

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
              browse();
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

      {view === "exercises" && (
        <FilterBar
          meta={meta}
          filters={filters}
          set={setFilter}
          q={q}
          onQ={(v) => {
            setQ(v);
            browse();
          }}
          total={total}
          loading={loading}
          mode={mode}
          onMode={setMode}
        />
      )}

      <main id="main" className="app-main">
        {view === "today" && (
          <div className="container narrow">
            <TodayView onStartWorkout={startWorkout} onSignIn={() => setAuthOpen(true)} />
          </div>
        )}

        {view === "exercises" && (
          <div className={`container ${mode === "list" ? "wide" : ""}`}>
            <h1 className="sr-only">{t("navExercises")}</h1>
            {mode === "list" ? (
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
            ) : (
              <MuscleMap activeMuscle={filters.muscle} counts={counts} onSelect={selectMuscle} />
            )}

            {/* Paginación explícita, no scroll infinito: el catálogo se recorre
                con el pulgar y hace falta poder parar, volver y saber cuánto
                queda. */}
            {mode === "list" && hasMore && (
              <div className="grid-more">
                <button
                  className={`btn secondary lg${loadingMore ? " loading" : ""}`}
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore && <span className="btn-spinner" aria-hidden="true" />}
                  <span>{t("loadMore")}</span>
                </button>
                <p className="hint" aria-live="polite">
                  {t("showingOf", { n: items.length, total: total.toLocaleString(lang) })}
                </p>
              </div>
            )}
          </div>
        )}

        {view === "routine" && (
          <div className="container narrow">
            <RoutineView onOpenExercise={setSelected} onStartWorkout={startWorkout} />
          </div>
        )}

        {view === "wizard" && (
          <div className="container narrow">
            <RoutineWizard
              meta={meta}
              onRequireAuth={() => setAuthOpen(true)}
              onCancel={() => navigate(user ? PATHS.routine : PATHS.today)}
              onSaved={() => navigate(PATHS.routine)}
            />
          </div>
        )}

        {view === "me" && (
          <div className="container narrow">
            <MeView onSignIn={() => setAuthOpen(true)} />
          </div>
        )}

        {view === "progress" && (
          <div className="container narrow">
            {user ? (
              <ProgressView onSeePlans={() => navigate(PATHS.billing)} />
            ) : (
              <>
                <h1 className="sr-only">{t("navProgress")}</h1>
                <div className="empty first-use">
                  <Icon name="lock" size={48} className="empty-icon" />
                  <h2>{t("signIn")}</h2>
                  <p>{t("authRequired")}</p>
                  <button className="btn primary lg" onClick={() => setAuthOpen(true)}>
                    {t("signIn")}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {view === "settings" && (
          <div className="container narrow">
            <SettingsView />
          </div>
        )}

        {view === "admin" && user?.role === "admin" && (
          <div className="container narrow">
            <AdminView />
          </div>
        )}

        {view === "billing" && (
          <div className="container narrow">
            <PlansView onSignIn={() => setAuthOpen(true)} />
          </div>
        )}

        {view === "workout" && workout && (
          <div className="container narrow">
            <WorkoutLogger
              routine={workout.routine}
              dayIndex={workout.dayIndex}
              onOpenExercise={setSelected}
              onCancel={() => {
                setWorkout(null);
                navigate(PATHS.routine);
              }}
              onDone={() => {
                setWorkout(null);
                navigate(PATHS.today);
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
