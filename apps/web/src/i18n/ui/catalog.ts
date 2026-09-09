import type { Lang } from "../languages";

export type CatalogKey =
  | "searchPlaceholder"
  | "bodyPart"
  | "equipment"
  | "target"
  | "filters"
  | "clearAll"
  | "results"
  | "noResults"
  | "loadMore"
  | "showingOf"
  | "steps"
  | "targetLabel"
  | "secondaryLabel"
  | "equipmentLabel"
  | "bodyPartLabel"
  | "tagHome"
  | "tagBodyweight"
  | "filterAll"
  | "filterSearch"
  | "removeFilter"
  | "bodyPartFilters"
  | "mapFront"
  | "mapBack"
  | "mapHint";

export const catalog: Record<Lang, Record<CatalogKey, string>> = {
  en: {
    searchPlaceholder: "Search exercises…",
    bodyPart: "Body part",
    equipment: "Equipment",
    target: "Target muscle",
    filters: "Filters",
    clearAll: "Clear",
    results: "{n} exercises",
    noResults: "No exercises found",
    loadMore: "Show more",
    showingOf: "Showing {n} of {total}",
    steps: "Step-by-step",
    targetLabel: "Target",
    secondaryLabel: "Secondary muscles",
    equipmentLabel: "Equipment",
    bodyPartLabel: "Body part",
    tagHome: "At home",
    tagBodyweight: "No gym",

    filterAll: "All",
    filterSearch: "Search…",
    removeFilter: "Remove filter",
    bodyPartFilters: "Filter by body part",
    mapFront: "Front",
    mapBack: "Back",
    mapHint: "Pick a muscle",
  },
  es: {
    searchPlaceholder: "Buscar ejercicios…",
    bodyPart: "Parte del cuerpo",
    equipment: "Equipo",
    target: "Músculo objetivo",
    filters: "Filtros",
    clearAll: "Limpiar",
    results: "{n} ejercicios",
    noResults: "No se encontraron ejercicios",
    loadMore: "Ver más",
    showingOf: "Mostrando {n} de {total}",
    steps: "Paso a paso",
    targetLabel: "Objetivo",
    secondaryLabel: "Músculos secundarios",
    equipmentLabel: "Equipo",
    bodyPartLabel: "Parte del cuerpo",
    tagHome: "En casa",
    tagBodyweight: "Sin equipo",

    filterAll: "Todos",
    filterSearch: "Buscar…",
    removeFilter: "Quitar filtro",
    bodyPartFilters: "Filtrar por parte del cuerpo",
    mapFront: "Frente",
    mapBack: "Espalda",
    mapHint: "Elige un músculo",
  },
};
