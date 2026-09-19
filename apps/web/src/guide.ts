/**
 * Memoria del recorrido de bienvenida. Mismo patrón que `paywall.ts`: una
 * clave en el dispositivo, sin columna en la base.
 *
 * Se guarda la versión ya vista y no un booleano, así que subir
 * `GUIDE_VERSION` al añadir un tema devuelve la invitación una vez con el
 * texto de novedad. Es el canal de anuncio por slice, y sale gratis.
 */
export const GUIDE_VERSION = 1;

const KEY = "fitapp:guide";

export const seenVersion = (): number => {
  try {
    return Number(localStorage.getItem(KEY) ?? 0) || 0;
  } catch {
    return 0;
  }
};

export function markGuideSeen() {
  try {
    localStorage.setItem(KEY, String(GUIDE_VERSION));
  } catch {
    // Modo incógnito con almacenamiento bloqueado: como mucho se vuelve a ver.
  }
}

export type GuideInviteKind = "first" | "updated";

export function guideInvite(): GuideInviteKind | null {
  const seen = seenVersion();
  if (seen === 0) return "first";
  return seen < GUIDE_VERSION ? "updated" : null;
}
