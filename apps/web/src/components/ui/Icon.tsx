import type { SVGProps } from "react";

/**
 * Único sistema de iconografía: SVG inline, sin librería, sin emoji.
 * Rejilla de 24 con margen óptico de 2 (el dibujo vive en 20×20 centrado).
 * El trazo no escala con el tamaño: a 16px engorda, a 48px adelgaza.
 */
export type IconName =
  | "home"
  | "calendar"
  | "search"
  | "grid"
  | "body"
  | "chart"
  | "user"
  | "settings"
  | "check"
  | "x"
  | "chevron-left"
  | "chevron-right"
  | "chevron-down"
  | "plus"
  | "minus"
  | "trash"
  | "alert-circle"
  | "alert-triangle"
  | "info"
  | "check-circle"
  | "lock"
  | "flame"
  | "play"
  | "sun"
  | "moon"
  | "globe"
  | "logout"
  | "shield"
  | "credit-card"
  | "dumbbell"
  | "medal"
  | "eye"
  | "refresh"
  | "swap"
  | "sparkle";

const PATHS: Record<IconName, JSX.Element> = {
  home: <path d="M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5M10 20v-5.5h4V20" />,
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
    </>
  ),
  body: (
    <>
      <circle cx="12" cy="4.5" r="2.2" />
      <path d="M12 7v7M12 8.5 7 11M12 8.5 17 11M9.5 21l2.5-7 2.5 7" />
    </>
  ),
  chart: <path d="M4 20V10M10 20V4M16 20v-6M21 20H3" />,
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2.5M12 18.5V21M4.2 7.5l2.2 1.3M17.6 15.2l2.2 1.3M4.2 16.5l2.2-1.3M17.6 8.8l2.2-1.3" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  "chevron-left": <path d="m14.5 5-7 7 7 7" />,
  "chevron-right": <path d="m9.5 5 7 7-7 7" />,
  "chevron-down": <path d="m5 9.5 7 7 7-7" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  trash: <path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10.5 11v5M13.5 11v5" />,
  "alert-circle": (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v5M12 16h.01" />
    </>
  ),
  "alert-triangle": <path d="M12 4 2.8 20h18.4L12 4ZM12 10v4M12 17.5h.01" />,
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5M12 8h.01" />
    </>
  ),
  "check-circle": (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8 12.2 2.8 2.8L16 9.5" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  flame: <path d="M12 3s5 4.2 5 9a5 5 0 0 1-10 0c0-1.8.9-3.2 1.8-4.2.3 1.4 1 2.2 1.8 2.2 1 0 1.6-1 1.6-2.7 0-1.6-.4-3-.2-4.3Z" />,
  play: <path d="M8 5.5v13l11-6.5z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </>
  ),
  moon: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.2 2.4 3.3 5.3 3.3 8.5s-1.1 6.1-3.3 8.5c-2.2-2.4-3.3-5.3-3.3-8.5s1.1-6.1 3.3-8.5Z" />
    </>
  ),
  logout: <path d="M15 8V5.5a1.5 1.5 0 0 0-1.5-1.5h-7A1.5 1.5 0 0 0 5 5.5v13A1.5 1.5 0 0 0 6.5 20h7a1.5 1.5 0 0 0 1.5-1.5V16M11 12h9M17.5 8.5 21 12l-3.5 3.5" />,
  shield: <path d="M12 3.5 5 6.2v5.4c0 4 2.9 7.5 7 8.9 4.1-1.4 7-4.9 7-8.9V6.2z" />,
  "credit-card": (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="M3 10h18M7 14.5h3" />
    </>
  ),
  dumbbell: <path d="M6.5 9v6M3.5 10.5v3M17.5 9v6M20.5 10.5v3M6.5 12h11" />,
  medal: (
    <>
      <circle cx="12" cy="14.5" r="5" />
      <path d="M8.5 9.8 6 3.5h12l-2.5 6.3" />
    </>
  ),
  eye: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    </>
  ),
  refresh: <path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v4.5h-4.5" />,
  // Intercambio: dos carriles en sentidos opuestos. No es el circular de
  // `refresh`, que significa "regenerar", sino "cambiar esto por otra cosa".
  swap: <path d="M4 8h13M14 5l3 3-3 3M20 16H7m3-3-3 3 3 3" />,
  sparkle: <path d="m12 3 2 5.6 5.6 2-5.6 2-2 5.6-2-5.6-5.6-2 5.6-2zM18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />,
};

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  /** 16 en texto · 18 botones · 20 campos y toasts · 24 navegación · 48 vacíos */
  size?: number;
}

/** Compensa el peso óptico: fino en grande, grueso en pequeño. */
const strokeFor = (size: number) => (size <= 16 ? 2 : size >= 40 ? 1.5 : 1.75);

export function Icon({ name, size = 20, strokeWidth, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth ?? strokeFor(size)}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
