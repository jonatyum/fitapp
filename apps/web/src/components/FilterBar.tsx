import { useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import type { UIKey } from "../i18n/ui";
import type { Meta } from "../types";
import { FilterDropdown } from "./FilterDropdown";
import { Icon, type IconName } from "./ui/Icon";

export interface FilterState {
  bodyPart: string;
  target: string;
  equipment: string;
  /** comma-separated muscle keys set from the muscle map (target + secondary) */
  muscle: string;
  /** "home" | "bodyweight" | "" — the train-at-home shortcuts */
  tag: string;
}

/** Front-and-centre shortcuts: most people here train at home, not in a gym. */
const TAGS: { id: string; icon: IconName; label: UIKey }[] = [
  { id: "home", icon: "home", label: "tagHome" },
  { id: "bodyweight", icon: "body", label: "tagBodyweight" },
];

export function FilterBar({
  meta,
  filters,
  set,
  q,
  onQ,
  total,
  loading,
  mode,
  onMode,
}: {
  meta: Meta | null;
  filters: FilterState;
  set: (patch: Partial<FilterState>) => void;
  q: string;
  onQ: (q: string) => void;
  total: number;
  loading: boolean;
  /** el mapa muscular es otro filtro, no otro destino: se conmuta desde aquí */
  mode: "list" | "body";
  onMode: (mode: "list" | "body") => void;
}) {
  const { t, tv, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const { bodyPart, target, equipment, muscle, tag } = filters;
  const active = [bodyPart, target, equipment, muscle, tag].filter(Boolean);
  const hasFilters = active.length > 0;
  // Desplegada, la barra ocupaba 338px de una pantalla de 844 y dejaba ver
  // ejercicio y medio. Sobre el cuerpo no hay nada que plegar: la figura es el
  // selector.
  const collapsed = mode === "list" && !open;

  return (
    <div className="filterbar" data-filters={collapsed ? "closed" : "open"}>
      <div className="filterbar-row">
        {/* El mismo componente que en la cabecera, y sólo uno visible a la vez:
            por debajo de 480 la cabecera no tiene sitio, y buscar un ejercicio
            por nombre entre 1.324 es justo lo que se hace desde el teléfono. */}
        <div className="searchbox">
          <Icon name="search" size={18} />
          <input
            type="search"
            aria-label={t("searchPlaceholder")}
            placeholder={t("searchPlaceholder")}
            value={q}
            onChange={(e) => onQ(e.target.value)}
          />
        </div>

        <div className="filterbar-modes">
          <div className="viewswitch" role="group" aria-label={t("viewMode")}>
            <button
              className="switch-opt"
              aria-pressed={mode === "list"}
              onClick={() => onMode("list")}
            >
              <Icon name="grid" size={16} />
              {t("viewList")}
            </button>
            <button
              className="switch-opt"
              aria-pressed={mode === "body"}
              onClick={() => onMode("body")}
            >
              <Icon name="body" size={16} />
              {t("viewBody")}
            </button>
          </div>

          {mode === "list" && (
            <button
              className="btn secondary filterbar-toggle"
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              <Icon name="sliders" size={18} />
              {t("filters")}
              {/* El recuento es lo que impide que un filtro quede escondido y
                  olvidado detrás del botón. */}
              {hasFilters && <span className="badge brand">{active.length}</span>}
            </button>
          )}

          <div className="chip-row">
            {TAGS.map((x) => {
              const on = tag === x.id;
              return (
                <button
                  key={x.id}
                  className="chip"
                  aria-pressed={on}
                  onClick={() => set({ tag: on ? "" : x.id })}
                >
                  {/* Activo = fondo + borde + check. Nunca solo color. */}
                  <Icon name={on ? "check" : x.icon} size={16} />
                  {t(x.label)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sobre el cuerpo, la figura es el selector: las pills y los
            desplegables sólo tienen sentido sobre la lista. */}
        {mode === "list" && (
          <>
            {/* Región desplazable: alcanzable por teclado y anunciada. */}
            <div
              className="pill-scroll"
              tabIndex={0}
              role="group"
              aria-label={t("bodyPartFilters")}
            >
              <button
                className="pill"
                aria-pressed={!bodyPart}
                onClick={() => set({ bodyPart: "" })}
              >
                {t("filterAll")}
              </button>
              {meta?.bodyParts.map((b) => (
                <button
                  key={b}
                  className="pill"
                  aria-pressed={bodyPart === b}
                  onClick={() => set({ bodyPart: bodyPart === b ? "" : b })}
                >
                  {tv(b)}
                </button>
              ))}
            </div>

            <div className="filterbar-dropdowns">
              <FilterDropdown
                label={t("target")}
                values={meta?.targets}
                active={target}
                onSelect={(v) => set({ target: v })}
                translate={tv}
                searchable
              />
              <FilterDropdown
                label={t("equipment")}
                values={meta?.equipment}
                active={equipment}
                onSelect={(v) => set({ equipment: v })}
                translate={tv}
                searchable
              />
            </div>
          </>
        )}
      </div>

      <div className="filterbar-meta">
        {mode === "list" && (
          <span className="count">
            {loading ? t("loading") : t("results", { n: total.toLocaleString(lang) })}
          </span>
        )}

        {muscle && (
          <span className="chip dismissible capitalize">
            {tv(muscle.split(",")[0])}
            <button
              type="button"
              className="chip-x"
              onClick={() => set({ muscle: "" })}
              aria-label={`${t("removeFilter")}: ${tv(muscle.split(",")[0])}`}
            >
              <Icon name="x" size={14} />
            </button>
          </span>
        )}

        {hasFilters && (
          <button
            className="clear-link"
            onClick={() =>
              set({ bodyPart: "", target: "", equipment: "", muscle: "", tag: "" })
            }
          >
            {t("clearAll")}
          </button>
        )}
      </div>
    </div>
  );
}
