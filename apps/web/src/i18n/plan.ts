import type { Lang } from "./languages";

// Vocabulary specific to the routine planner: goals, levels and day labels.
// Only English and Spanish are stored; English is also the per-key fallback.

type Row = Record<Lang, string>;

export type Goal = "strength" | "hypertrophy" | "endurance" | "fatloss";
export type Level = "beginner" | "intermediate" | "advanced";

export const GOALS: Goal[] = ["strength", "hypertrophy", "endurance", "fatloss"];
export const LEVELS: Level[] = ["beginner", "intermediate", "advanced"];

export const GOAL_NAME: Record<Goal, Row> = {
  strength: {
    en: "Strength", es: "Fuerza", },
  hypertrophy: {
    en: "Muscle mass", es: "Masa muscular", },
  endurance: {
    en: "Endurance", es: "Resistencia", },
  fatloss: {
    en: "Fat loss", es: "Pérdida de grasa", },
};

export const GOAL_DESC: Record<Goal, Row> = {
  strength: {
    en: "Heavy loads, 4–6 reps, long rests", es: "Cargas altas, 4–6 reps, descansos largos",
    },
  hypertrophy: {
    en: "Moderate loads, 8–12 reps", es: "Cargas moderadas, 8–12 reps",
    },
  endurance: {
    en: "Light loads, 15–20 reps, short rests", es: "Cargas ligeras, 15–20 reps, descansos cortos",
    },
  fatloss: {
    en: "High volume plus cardio finisher", es: "Volumen alto más remate de cardio",
    },
};

export const LEVEL_NAME: Record<Level, Row> = {
  beginner: {
    en: "Beginner", es: "Principiante", },
  intermediate: {
    en: "Intermediate", es: "Intermedio", },
  advanced: {
    en: "Advanced", es: "Avanzado", },
};

export const LEVEL_DESC: Record<Level, Row> = {
  beginner: {
    en: "Less than a year training · 5 exercises per day",
    es: "Menos de un año entrenando · 5 ejercicios por día",
    },
  intermediate: {
    en: "One to three years · 6 exercises per day",
    es: "De uno a tres años · 6 ejercicios por día",
    },
  advanced: {
    en: "Over three years · 8 exercises per day",
    es: "Más de tres años · 8 ejercicios por día",
    },
};

/** Day template labels produced by the generator. */
export const DAY_LABEL: Record<string, Row> = {
  "fullbody-a": {
    en: "Full body A", es: "Cuerpo completo A", },
  "fullbody-b": {
    en: "Full body B", es: "Cuerpo completo B", },
  "fullbody-c": {
    en: "Full body C", es: "Cuerpo completo C", },
  push: {
    en: "Push", es: "Empuje", },
  pull: {
    en: "Pull", es: "Tirón", },
  legs: {
    en: "Legs", es: "Pierna", },
  upper: {
    en: "Upper body", es: "Tren superior", },
  lower: {
    en: "Lower body", es: "Tren inferior", },
};

/** Split names, shown as a subtitle on the routine header. */
export const SPLIT_NAME: Record<string, Row> = {
  fullbody: {
    en: "Full body", es: "Cuerpo completo", },
  upperlower: {
    en: "Upper / Lower", es: "Torso / Pierna", },
  ppl: {
    en: "Push / Pull / Legs", es: "Empuje / Tirón / Pierna", },
  "ppl-ul": {
    en: "Push / Pull / Legs + Upper / Lower", es: "Empuje / Tirón / Pierna + Torso / Pierna",
    },
};

const pick = (table: Record<string, Row>, key: string, lang: Lang) =>
  table[key]?.[lang] ?? table[key]?.en ?? key;

export const tGoal = (g: string, lang: Lang) => pick(GOAL_NAME as Record<string, Row>, g, lang);
export const tGoalDesc = (g: string, lang: Lang) => pick(GOAL_DESC as Record<string, Row>, g, lang);
export const tLevel = (l: string, lang: Lang) => pick(LEVEL_NAME as Record<string, Row>, l, lang);
export const tLevelDesc = (l: string, lang: Lang) => pick(LEVEL_DESC as Record<string, Row>, l, lang);
export const tDayLabel = (l: string, lang: Lang) => pick(DAY_LABEL, l, lang);
export const tSplit = (s: string, lang: Lang) => pick(SPLIT_NAME, s, lang);
