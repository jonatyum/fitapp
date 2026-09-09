import type { StatsSummary } from "./types";

/**
 * Momentos en los que se ofrece Pro. Nunca hay una pestaña de pago: el plan se
 * ofrece cuando el usuario acaba de demostrarse a sí mismo que la app le
 * sirve, y cada momento se ofrece una sola vez en la vida de la cuenta.
 */
export type PaywallTrigger = "sessions" | "plans" | "streak";

const KEY = "fitapp:paywall";

const seen = (): string[] => {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
};

export function markSeen(trigger: PaywallTrigger) {
  const next = [...new Set([...seen(), trigger])];
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Modo incógnito con almacenamiento bloqueado: como mucho se vuelve a ver.
  }
}

/**
 * El primer momento que se cumple y no se ha mostrado ya.
 *
 * La racha se mide en semanas, no en días: dos semanas seguidas entrenando es
 * la traducción honesta de "7 días de racha" sobre los datos que existen.
 */
export function pendingTrigger(input: {
  summary: StatsSummary;
  routines: number;
}): PaywallTrigger | null {
  if (input.summary.isPro) return null;
  const shown = seen();

  const candidates: [PaywallTrigger, boolean][] = [
    ["sessions", input.summary.totalSessions >= 3],
    ["plans", input.routines >= 2],
    ["streak", input.summary.streakWeeks >= 2],
  ];
  return candidates.find(([id, hit]) => hit && !shown.includes(id))?.[0] ?? null;
}
