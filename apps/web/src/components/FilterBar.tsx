import { useI18n } from "../i18n/I18nContext";
import type { Lang } from "../i18n/languages";
import type { Meta } from "../types";
import { FilterDropdown } from "./FilterDropdown";

const ALL_LABEL: Record<Lang, string> = {
  en: "All",
  es: "Todos",
  it: "Tutti",
  fr: "Tous",
  tr: "Tümü",
  ru: "Все",
  zh: "全部",
  hi: "सभी",
  pl: "Wszystkie",
  ko: "전체",
};

export interface FilterState {
  bodyPart: string;
  target: string;
  equipment: string;
  /** comma-separated muscle keys set from the muscle map (target + secondary) */
  muscle: string;
}

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
  const { t, tv, lang } = useI18n();
  const { bodyPart, target, equipment, muscle } = filters;
  const hasFilters = !!(bodyPart || target || equipment || muscle);

  return (
    <div className="filterbar">
      <div className="filterbar-row">
        {/* Body-part quick pills (horizontal scroll) */}
        <div className="pill-scroll">
          <button
            className={`pill ${!bodyPart ? "active" : ""}`}
            onClick={() => set({ bodyPart: "" })}
          >
            {ALL_LABEL[lang]}
          </button>
          {meta?.bodyParts.map((b) => (
            <button
              key={b}
              className={`pill ${bodyPart === b ? "active" : ""}`}
              onClick={() => set({ bodyPart: bodyPart === b ? "" : b })}
            >
              {tv(b)}
            </button>
          ))}
        </div>

        {/* Dropdowns */}
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
          <button className="muscle-chip" onClick={() => set({ muscle: "" })}>
            💪 {tv(muscle.split(",")[0])} <span className="x">✕</span>
          </button>
        )}
        {hasFilters && (
          <button
            className="clear-link"
            onClick={() =>
              set({ bodyPart: "", target: "", equipment: "", muscle: "" })
            }
          >
            {t("clearAll")}
          </button>
        )}
      </div>
    </div>
  );
}
