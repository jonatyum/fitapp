import { useSyncExternalStore } from "react";

/**
 * Router mínimo sobre `history.pushState`: el árbol de rutas de la app es
 * plano y una librería cuesta más de lo que resuelve.
 *
 * `pushState` no dispara ningún evento, así que la navegación propia avisa a
 * los suscriptores a mano; `popstate` cubre el atrás del navegador.
 */
const subscribers = new Set<() => void>();

function subscribe(onChange: () => void) {
  subscribers.add(onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    subscribers.delete(onChange);
    window.removeEventListener("popstate", onChange);
  };
}

/** "" en la raíz, "/fitapp" en GitHub Pages (VITE_BASE). */
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, "");

/** Ruta de la app, sin la base del despliegue y sin barra final. */
function normalize(pathname: string): string {
  const withoutBase = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname;
  const clean = withoutBase.replace(/\/+$/, "");
  return clean === "" ? "/" : clean;
}

function currentPath(): string {
  return normalize(window.location.pathname);
}

function href(path: string): string {
  return path === "/" ? `${BASE}/` : BASE + path;
}

export function usePath(): string {
  return useSyncExternalStore(subscribe, currentPath);
}

export function navigate(to: string, { replace = false }: { replace?: boolean } = {}) {
  const path = normalize(to);
  if (path === currentPath()) return;
  if (replace) window.history.replaceState(null, "", href(path));
  else window.history.pushState(null, "", href(path));
  subscribers.forEach((onChange) => onChange());
}
