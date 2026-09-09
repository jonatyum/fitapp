import { useCallback, useEffect, useRef, useState } from "react";
import { fetchExercises } from "./api";
import type { FilterState } from "./components/FilterBar";
import type { Exercise } from "./types";

const PAGE_SIZE = 60;

/** Lo que tarda en dejar de teclear antes de pedir resultados. */
const DEBOUNCE_MS = 220;

/**
 * El catálogo del dataset son 1.324 ejercicios y la lista pedía siempre los 60
 * primeros: los demás no existían para nadie. Aquí 60 es una página, y `más`
 * añade la siguiente sin volver a traer lo que ya se está viendo.
 */
export function useExerciseList(q: string, filters: FilterState, enabled: boolean) {
  const [items, setItems] = useState<Exercise[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [failed, setFailed] = useState(false);

  // Cambiar de criterio invalida lo que hubiera en vuelo: sin esto, un `más`
  // lento podía pegar la página de la búsqueda anterior debajo de la nueva.
  const run = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    const id = ++run.current;
    setLoading(true);

    const timer = setTimeout(() => {
      fetchExercises({ q, ...filters, limit: PAGE_SIZE, offset: 0 })
        .then((res) => {
          if (id !== run.current) return;
          setItems(res.items);
          setTotal(res.total);
          setFailed(false);
        })
        .catch(() => {
          if (id === run.current) setFailed(true);
        })
        .finally(() => {
          if (id === run.current) setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [q, filters, enabled]);

  const loadMore = useCallback(() => {
    const id = run.current;
    setLoadingMore(true);
    fetchExercises({ q, ...filters, limit: PAGE_SIZE, offset: items.length })
      .then((res) => {
        if (id === run.current) setItems((prev) => [...prev, ...res.items]);
      })
      .catch(() => {
        if (id === run.current) setFailed(true);
      })
      .finally(() => {
        if (id === run.current) setLoadingMore(false);
      });
  }, [q, filters, items.length]);

  return {
    items,
    total,
    loading,
    loadingMore,
    failed,
    hasMore: items.length < total,
    loadMore,
  };
}
