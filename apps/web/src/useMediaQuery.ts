import { useEffect, useState } from "react";

/** Breakpoints del sistema (mobile-first, siempre min-width). */
export const BP = {
  sm: "(min-width: 480px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
} as const;

/**
 * Para los casos en que el layout no basta y hay que cambiar de componente
 * (p. ej. un desplegable que en móvil es una hoja a pantalla completa).
 * Cuando el CSS puede resolverlo solo, se resuelve en el CSS.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
