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
  total,
  loading,
}: {
  meta: Meta | null;
  filters: FilterState;
  set: (patch: Partial<FilterState>) => void;
  total: number;
  loading: boolean;
}) {
  const { t, tv } = useI18n();
  const { bodyPart, target, equipment, muscle, tag } = filters;
  const hasFilters = !!(bodyPart || target || equipment || muscle || tag);

  return (
    <div className="filterbar">
      <div className="filterbar-row">
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
      </div>

      <div className="filterbar-meta">
        <span className="count">
          {loading ? t("loading") : t("results", { n: total.toLocaleString() })}
        </span>

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
