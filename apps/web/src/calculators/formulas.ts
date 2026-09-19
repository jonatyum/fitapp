/**
 * Las fórmulas, sin React y sin traducción: son lo único de la calculadora
 * que se puede comprobar con un número a la izquierda y otro a la derecha.
 */

export type Sex = "female" | "male";

/**
 * Los límites de cada entrada, en un solo sitio: el campo pinta el error y el
 * resultado decide si puede calcular leyendo esto mismo, así que no pueden
 * discrepar y enseñar un número junto a «escribe un valor entre 30 y 300».
 */
export const RANGE = {
  age: [14, 100],
  height: [120, 230],
  weight: [30, 300],
  neck: [20, 80],
  waist: [40, 200],
  hip: [50, 200],
  restingHr: [30, 110],
  reps: [1, 15],
  load: [1, 500],
  kcal: [800, 6000],
} as const;

export type NumericFieldId = keyof typeof RANGE;

export const inRange = (value: number | null, id: NumericFieldId): value is number =>
  value !== null && value >= RANGE[id][0] && value <= RANGE[id][1];

export const bmi = (weightKg: number, heightCm: number): number =>
  weightKg / (heightCm / 100) ** 2;

export type BmiBand = "under" | "normal" | "over" | "obese";

export const bmiBand = (value: number): BmiBand =>
  value < 18.5 ? "under" : value < 25 ? "normal" : value < 30 ? "over" : "obese";

/**
 * El peso que corresponde a un IMC de 18,5 a 24,9 con esa altura. La cifra es
 * la del "peso ideal" de toda la vida; la diferencia es que así no se le dice
 * a nadie que su cuerpo está mal.
 */
export const healthyWeightRange = (heightCm: number): [number, number] => {
  const m2 = (heightCm / 100) ** 2;
  return [18.5 * m2, 24.9 * m2];
};

/**
 * Mifflin-St Jeor. Harris-Benedict se ajustó en 1919 y sobreestima cerca de un
 * 5%; ésta es la que menos se equivoca sin pedir datos que nadie tiene.
 */
export const bmrMifflin = (
  sex: Sex,
  weightKg: number,
  heightCm: number,
  age: number,
): number => 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === "male" ? 5 : -161);

/** Katch-McArdle: mejor que Mifflin, pero sólo si ya se conoce la grasa corporal. */
export const bmrKatch = (weightKg: number, bodyFatPct: number): number =>
  370 + 21.6 * (weightKg * (1 - bodyFatPct / 100));

export const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
  veryHigh: 1.9,
} as const;

export type ActivityId = keyof typeof ACTIVITY_FACTORS;

export const tdee = (bmrValue: number, activity: ActivityId): number =>
  bmrValue * ACTIVITY_FACTORS[activity];

/**
 * Suelo calórico por sexo. La app nunca propone un número por debajo: un
 * déficit agresivo es consejo médico, y aquí no hay quien lo supervise.
 */
export const KCAL_FLOOR: Record<Sex, number> = { female: 1200, male: 1500 };

export type GoalId = "lose" | "maintain" | "gain";

export const GOAL_FACTORS: Record<GoalId, number> = {
  lose: 0.8,
  maintain: 1,
  gain: 1.1,
};

/** Devuelve las kcal del objetivo y si el suelo tuvo que morder. */
export function goalKcal(
  maintenance: number,
  goal: GoalId,
  sex: Sex,
): { kcal: number; floored: boolean } {
  const target = maintenance * GOAL_FACTORS[goal];
  const floor = KCAL_FLOOR[sex];
  return target < floor ? { kcal: floor, floored: true } : { kcal: target, floored: false };
}

/**
 * Marina de EE. UU., versión métrica. Se descartó Deurenberg porque parte del
 * IMC: dos personas con el mismo IMC darían el mismo porcentaje, que es justo
 * lo que este dato tiene que poder distinguir.
 */
export function bodyFatNavy(
  sex: Sex,
  heightCm: number,
  neckCm: number,
  waistCm: number,
  hipCm: number,
): number | null {
  const log = Math.log10;
  if (sex === "male") {
    if (waistCm - neckCm <= 0) return null;
    return 495 / (1.0324 - 0.19077 * log(waistCm - neckCm) + 0.15456 * log(heightCm)) - 450;
  }
  if (waistCm + hipCm - neckCm <= 0) return null;
  return 495 / (1.29579 - 0.35004 * log(waistCm + hipCm - neckCm) + 0.221 * log(heightCm)) - 450;
}

export type FatBand = "essential" | "athlete" | "fit" | "average" | "high";

/** Bandas por sexo: los mismos números significan cosas distintas. */
export function bodyFatBand(sex: Sex, pct: number): FatBand {
  const cuts = sex === "male" ? [6, 14, 18, 25] : [14, 21, 25, 32];
  if (pct < cuts[0]) return "essential";
  if (pct < cuts[1]) return "athlete";
  if (pct < cuts[2]) return "fit";
  if (pct < cuts[3]) return "average";
  return "high";
}

/**
 * Epley, la misma de `apps/api/src/sessions.ts`. No es una preferencia: si
 * aquí se usara Brzycki, el mismo set daría dos números distintos en dos
 * pantallas de la misma app.
 */
export const oneRepMax = (weight: number, reps: number): number => weight * (1 + reps / 30);

/** Los porcentajes con los que se programa de verdad, redondeados a 2,5 kg. */
export const RM_PERCENTS = [95, 90, 85, 80, 75, 70, 65, 60] as const;

export const roundToPlate = (kg: number): number => Math.round(kg / 2.5) * 2.5;

export interface Macros {
  proteinG: number;
  fatG: number;
  carbG: number;
  proteinKcal: number;
  fatKcal: number;
  carbKcal: number;
}

/**
 * Proteína 1,8 g/kg (el rango útil va de 1,6 a 2,2) y grasa 0,9 g/kg con suelo
 * del 20 % de las calorías, que es lo que protege la parte hormonal. El resto
 * son carbohidratos.
 */
export function macros(kcal: number, weightKg: number): Macros {
  const proteinG = 1.8 * weightKg;
  const fatG = Math.max(0.9 * weightKg, (kcal * 0.2) / 9);
  const proteinKcal = proteinG * 4;
  const fatKcal = fatG * 9;
  const carbG = Math.max(0, (kcal - proteinKcal - fatKcal) / 4);
  return { proteinG, fatG, carbG, proteinKcal, fatKcal, carbKcal: carbG * 4 };
}

/**
 * Tanaka. 220−edad arrastra un error estándar de 10-12 lpm y sesga a la baja
 * en mayores; ésta se comporta mejor en todo el rango de edad.
 */
export const hrMax = (age: number): number => 208 - 0.7 * age;

export const HR_ZONES = [
  { id: "z1", from: 0.5, to: 0.6 },
  { id: "z2", from: 0.6, to: 0.7 },
  { id: "z3", from: 0.7, to: 0.8 },
  { id: "z4", from: 0.8, to: 0.9 },
  { id: "z5", from: 0.9, to: 1 },
] as const;

export type ZoneId = (typeof HR_ZONES)[number]["id"];

/**
 * Con frecuencia en reposo se usa Karvonen, que parte de ella y por eso
 * recoge la aclimatación de quien vive en altura; sin ella, porcentaje puro
 * de la máxima.
 */
export function hrZones(age: number, restingHr: number | null) {
  const max = hrMax(age);
  return HR_ZONES.map((zone) => ({
    id: zone.id,
    from: Math.round(restingHr === null ? max * zone.from : restingHr + (max - restingHr) * zone.from),
    to: Math.round(restingHr === null ? max * zone.to : restingHr + (max - restingHr) * zone.to),
  }));
}
