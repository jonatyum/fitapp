import { useEffect, useMemo, useRef, useState } from "react";
import Model, {
  type IExerciseData,
  type IMuscleStats,
  type Muscle,
} from "react-body-highlighter";
import { useI18n } from "../i18n/I18nContext";

/**
 * The library draws more detail than the dataset has (e.g. separate soleus, or
 * front/back deltoids). Each GROUP bundles the library muscles that map to a
 * single dataset concept, so hovering any part highlights the whole group.
 */
interface Group {
  id: string; // also the label key (translated through tv())
  keys: string[]; // dataset synonyms (target + secondary) used to filter
  muscles: Muscle[];
}

const GROUPS: Group[] = [
  { id: "pectorals", keys: ["pectorals", "chest", "upper chest"], muscles: ["chest"] },
  { id: "delts", keys: ["delts", "deltoids", "shoulders", "rear deltoids"], muscles: ["front-deltoids", "back-deltoids"] },
  { id: "biceps", keys: ["biceps", "brachialis"], muscles: ["biceps"] },
  { id: "triceps", keys: ["triceps"], muscles: ["triceps"] },
  { id: "forearms", keys: ["forearms", "wrist flexors", "wrist extensors"], muscles: ["forearm"] },
  { id: "traps", keys: ["traps", "trapezius", "levator scapulae"], muscles: ["trapezius"] },
  { id: "upper back", keys: ["upper back", "rhomboids"], muscles: ["upper-back"] },
  { id: "spine", keys: ["spine", "lower back"], muscles: ["lower-back"] },
  { id: "abs", keys: ["abs", "abdominals", "core", "lower abs"], muscles: ["abs"] },
  { id: "obliques", keys: ["obliques", "serratus anterior"], muscles: ["obliques"] },
  { id: "quads", keys: ["quads", "quadriceps"], muscles: ["quadriceps"] },
  { id: "hamstrings", keys: ["hamstrings"], muscles: ["hamstring"] },
  { id: "glutes", keys: ["glutes"], muscles: ["gluteal"] },
  { id: "adductors", keys: ["adductors", "inner thighs", "groin"], muscles: ["adductor"] },
  { id: "abductors", keys: ["abductors"], muscles: ["abductors"] },
  { id: "calves", keys: ["calves", "soleus"], muscles: ["calves", "left-soleus", "right-soleus"] },
  { id: "neck", keys: ["levator scapulae", "sternocleidomastoid"], muscles: ["neck"] },
];

const ALL_MUSCLES: Muscle[] = GROUPS.flatMap((g) => g.muscles);
const MUSCLE_GROUP = new Map<Muscle, Group>(
  GROUPS.flatMap((g) => g.muscles.map((m) => [m, g] as [Muscle, Group])),
);

/**
 * Los polígonos se pintan con la custom property, no con un color resuelto en
 * JS: el navegador la re-resuelve sola cuando cambia `data-theme`, así que el
 * mapa sigue al tema sin releer estilos ni depender del orden de los efectos.
 *
 * No afecta a la identificación de polígonos, que ocurre antes del primer
 * repintado comparando el `probeColor` que la librería dejó en `style.fill`.
 */
const FILL_ACTIVE = "var(--brand)"; // seleccionado o bajo el cursor
const FILL_AVAILABLE = "var(--muscle)"; // músculo con ejercicios
const FILL_EMPTY = "var(--joint)"; // sin ejercicios en el dataset

// Each muscle gets a visually identical but numerically unique colour so we can
// read it back from the DOM and know which polygon is which muscle.
const probeColor = (i: number) => `rgb(89, 97, ${150 - i})`;
const normalize = (c: string) => c.replace(/\s/g, "");

export function MuscleMap({
  activeMuscle,
  counts,
  onSelect,
}: {
  activeMuscle: string;
  counts: Record<string, number>;
  onSelect: (keys: string[], label: string) => void;
}) {
  const { t, tv } = useI18n();
  const [hovered, setHovered] = useState<string | null>(null);
  const figuresRef = useRef<HTMLDivElement>(null);
  const polyGroup = useRef<Map<Element, Group>>(new Map());

  const groupCount = (g: Group) =>
    g.keys.reduce((sum, k) => sum + (counts[k] ?? 0), 0);

  const activeKeys = activeMuscle ? activeMuscle.split(",") : [];
  const activeGroup =
    GROUPS.find((g) => g.keys.some((k) => activeKeys.includes(k)))?.id ?? null;

  // Unique probe colours (only used to identify polygons on first paint).
  const { data, highlightedColors, colorIndex } = useMemo(() => {
    const d: IExerciseData[] = ALL_MUSCLES.map((m, i) => ({
      name: m,
      muscles: [m],
      frequency: i + 1,
    }));
    const colors = ALL_MUSCLES.map((_, i) => probeColor(i));
    const idx = new Map<string, Muscle>();
    ALL_MUSCLES.forEach((m, i) => idx.set(normalize(probeColor(i)), m));
    return { data: d, highlightedColors: colors, colorIndex: idx };
  }, []);

  // Identify polygons once, then repaint them on every hover/selection change.
  useEffect(() => {
    const root = figuresRef.current;
    if (!root) return;
    const polys = root.querySelectorAll("polygon");

    if (polyGroup.current.size === 0) {
      polys.forEach((p) => {
        const m = colorIndex.get(normalize((p as SVGPolygonElement).style.fill));
        const g = m ? MUSCLE_GROUP.get(m) : undefined;
        if (g) polyGroup.current.set(p, g);
      });
    }

    polys.forEach((p) => {
      const el = p as SVGPolygonElement;
      const g = polyGroup.current.get(p);
      if (!g) {
        el.style.cursor = "default";
        return;
      }
      const available = groupCount(g) > 0;
      const on = g.id === hovered || g.id === activeGroup;
      el.style.fill = on ? FILL_ACTIVE : available ? FILL_AVAILABLE : FILL_EMPTY;
      el.style.cursor = available ? "pointer" : "default";
    });
  }, [hovered, activeGroup, counts, colorIndex]);

  const handleOver = (e: React.MouseEvent) => {
    const g = polyGroup.current.get(e.target as Element);
    if (g && groupCount(g) > 0) setHovered(g.id);
    else setHovered(null);
  };

  const handleClick = ({ muscle }: IMuscleStats) => {
    const g = MUSCLE_GROUP.get(muscle);
    if (g && groupCount(g) > 0) onSelect(g.keys, g.id);
  };

  const shownGroup = GROUPS.find((g) => g.id === (hovered ?? activeGroup));
  const shownCount = shownGroup ? groupCount(shownGroup) : 0;

  const modelProps = {
    data,
    highlightedColors,
    bodyColor: FILL_EMPTY,
    onClick: handleClick,
    svgStyle: { width: "100%", height: "auto" },
  };

  return (
    <div className="musclemap">
      <div className="musclemap-hint">
        {shownGroup ? (
          <>
            <strong>{tv(shownGroup.keys[0])}</strong>
            <span className="muscle-count">
              {t("results", { n: shownCount.toLocaleString() })}
            </span>
          </>
        ) : (
          <span className="muscle-count">{t("mapHint")}</span>
        )}
      </div>

      <div
        className="figures"
        ref={figuresRef}
        onMouseOver={handleOver}
        onMouseLeave={() => setHovered(null)}
      >
        <div className="body-figure">
          <Model {...modelProps} type="anterior" />
          <span className="body-caption">{t("mapFront")}</span>
        </div>
        <div className="body-figure">
          <Model {...modelProps} type="posterior" />
          <span className="body-caption">{t("mapBack")}</span>
        </div>
      </div>
    </div>
  );
}
