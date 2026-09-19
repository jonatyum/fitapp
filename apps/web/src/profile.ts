import { useSyncExternalStore } from "react";
import { apiDeleteBodyProfile, apiSaveBodyProfile } from "./api";

/**
 * Los datos del cuerpo que comparten las calculadoras. El peso sale en cinco
 * de las siete: si hubiera que teclearlo en cada una, esto sería un formulario
 * y no una herramienta.
 *
 * Viven en el dispositivo salvo que se pida guardarlos en la cuenta, y ninguna
 * vista toca `localStorage` ni el API directamente: cambiar dónde se guardan
 * es reescribir este archivo.
 */
export interface BodyProfile {
  sex: "female" | "male" | null;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  neckCm: number | null;
  waistCm: number | null;
  hipCm: number | null;
  restingHr: number | null;
  /** Calculado en la herramienta de grasa corporal; la TMB lo usa si existe. */
  bodyFatPct: number | null;
}

export const EMPTY_PROFILE: BodyProfile = {
  sex: null,
  age: null,
  heightCm: null,
  weightKg: null,
  neckCm: null,
  waistCm: null,
  hipCm: null,
  restingHr: null,
  bodyFatPct: null,
};

const KEY = "fitapp:profile";
const SYNC_KEY = "fitapp:profile-sync";

/** El servidor manda más campos de los que la app usa; sólo se leen éstos. */
function pick(raw: Partial<BodyProfile> | null): BodyProfile {
  if (!raw) return EMPTY_PROFILE;
  const out = { ...EMPTY_PROFILE };
  for (const key of Object.keys(EMPTY_PROFILE) as (keyof BodyProfile)[]) {
    const value = raw[key];
    if (value !== undefined) Object.assign(out, { [key]: value ?? null });
  }
  return out;
}

const subscribers = new Set<() => void>();
let cache: BodyProfile = readLocal();
let synced = readFlag();

function readLocal(): BodyProfile {
  try {
    const raw = localStorage.getItem(KEY);
    return pick(raw ? (JSON.parse(raw) as Partial<BodyProfile>) : null);
  } catch {
    return EMPTY_PROFILE;
  }
}

function readFlag(): boolean {
  try {
    return localStorage.getItem(SYNC_KEY) === "1";
  } catch {
    return false;
  }
}

function writeLocal() {
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
    localStorage.setItem(SYNC_KEY, synced ? "1" : "0");
  } catch {
    // Modo privado o almacenamiento lleno: la sesión sigue en memoria, que es
    // mejor que romper la calculadora por no poder guardar.
  }
}

function emit() {
  writeLocal();
  subscribers.forEach((onChange) => onChange());
}

/**
 * Escribir en cada tecla mandaría una petición por dígito. Se agrupa y se
 * manda el perfil entero, que es lo que el `PUT` espera.
 */
let pending: ReturnType<typeof setTimeout> | null = null;

function schedulePush() {
  if (!synced) return;
  if (pending) clearTimeout(pending);
  pending = setTimeout(() => {
    pending = null;
    apiSaveBodyProfile(cache).catch(() => {
      // Un fallo de red no puede perder lo que la persona acaba de teclear:
      // sigue en el dispositivo y el próximo cambio lo reintenta.
    });
  }, 800);
}

function subscribe(onChange: () => void) {
  subscribers.add(onChange);
  return () => {
    subscribers.delete(onChange);
  };
}

export function patchProfile(patch: Partial<BodyProfile>) {
  cache = { ...cache, ...patch };
  emit();
  schedulePush();
}

/** Trae lo guardado en la cuenta y lo hace ganar sobre la copia del dispositivo. */
export function adoptRemoteProfile(raw: Partial<BodyProfile> | null) {
  cache = pick(raw);
  synced = true;
  emit();
}

export async function setProfileSync(on: boolean) {
  synced = on;
  emit();
  if (on) await apiSaveBodyProfile(cache);
  else await apiDeleteBodyProfile();
}

export function useProfile(): {
  profile: BodyProfile;
  synced: boolean;
  patch: (patch: Partial<BodyProfile>) => void;
} {
  const profile = useSyncExternalStore(
    subscribe,
    () => cache,
    () => EMPTY_PROFILE,
  );
  const isSynced = useSyncExternalStore(
    subscribe,
    () => synced,
    () => false,
  );
  return { profile, synced: isSynced, patch: patchProfile };
}
