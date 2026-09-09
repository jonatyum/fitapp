import type { Lang } from "./languages";
import { admin, type AdminKey } from "./ui/admin";
import { auth, type AuthKey } from "./ui/auth";
import { billing, type BillingKey } from "./ui/billing";
import { catalog, type CatalogKey } from "./ui/catalog";
import { common, type CommonKey } from "./ui/common";
import { progress, type ProgressKey } from "./ui/progress";
import { routine, type RoutineKey } from "./ui/routine";
import { settings, type SettingsKey } from "./ui/settings";
import { today, type TodayKey } from "./ui/today";
import { workout, type WorkoutKey } from "./ui/workout";

/**
 * Cadenas de interfaz, compuestas por dominio. Usa {n} como marcador de
 * interpolación.
 *
 * Cada módulo se declara como `Record<Lang, Record<XKey, string>>`, que es lo
 * que obliga a `tsc` a exigir la traducción en los dos idiomas: si falta una,
 * el build falla. El troceado conserva esa propiedad; sólo evita que un único
 * archivo crezca sin control.
 */
export type UIKey =
  | CommonKey
  | CatalogKey
  | AuthKey
  | RoutineKey
  | WorkoutKey
  | ProgressKey
  | BillingKey
  | TodayKey
  | SettingsKey
  | AdminKey;

export const UI: Record<Lang, Record<UIKey, string>> = {
  en: {
    ...common.en,
    ...catalog.en,
    ...auth.en,
    ...routine.en,
    ...workout.en,
    ...progress.en,
    ...billing.en,
    ...today.en,
    ...settings.en,
    ...admin.en,
  },
  es: {
    ...common.es,
    ...catalog.es,
    ...auth.es,
    ...routine.es,
    ...workout.es,
    ...progress.es,
    ...billing.es,
    ...today.es,
    ...settings.es,
    ...admin.es,
  },
};
