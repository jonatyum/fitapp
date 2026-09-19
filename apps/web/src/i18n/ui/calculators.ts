import type { Lang } from "../languages";

export type CalculatorsKey =
  | "navCalculators"
  | "calculatorsTitle"
  | "calculatorsLead"
  | "calcDisclaimer"
  | "calcWhatIs"
  | "calcHelpFor"
  | "calcResultEmpty"
  | "calcUnitKcal"
  | "calcUnitKcalDay"
  | "calcHealthyRange"
  | "calcMinorTitle"
  | "calcMinorText"
  | "calcKcalFloor"
  | "calcMaintenance"
  | "calcBmiValue"
  | "calcAtRest"
  | "calcBodyFatValue"
  | "calcMacrosFor"
  | "calcEstimated1rm"
  | "calcHrMax"
  | "calcUsesBodyFat"
  | "calcBmrFloorNote"
  | "errCalcRange"
  | "calcYourData"
  | "calcSyncLabel"
  | "calcSyncHint"
  | "calcSyncFailed"
  | "calcNoData"
  | "calcWaistNeck"
  | "calcFatMass"
  | "calcLeanMass"
  | "calcSaveToBmr"
  | "calcSavedToBmr"
  | "calcUnitPct"
  | "calcUnitKg"
  | "calcUnitYears"
  | "calcUnitBpm"
  | "calcUnitGram"
  | "calcRmTable"
  | "calcRmHighReps"
  | "calcRmSeeProgress"
  | "calcZoneKarvonen"
  | "calcZoneMaxOnly";

export const calculators: Record<Lang, Record<CalculatorsKey, string>> = {
  en: {
    navCalculators: "Calculators",
    calculatorsTitle: "Calculators",
    calculatorsLead: "Work out the numbers your training runs on.",
    calcDisclaimer:
      "These tools give estimates to orient you. They do not replace a doctor or a dietitian, and they diagnose nothing.",
    calcWhatIs: "What is this?",
    calcHelpFor: "About {field}",
    calcResultEmpty: "Complete the fields and the result appears here.",
    calcUnitKcal: "kcal",
    calcUnitKcalDay: "kcal/day",
    calcHealthyRange: "The range 18.5–24.9 means {min}–{max} kg at your height.",
    calcMinorTitle: "Under 18",
    calcMinorText:
      "Below 18, BMI is read against percentiles for age and sex, not against the adult bands. The number above is right; the interpretation belongs to a health professional.",
    calcKcalFloor: "We stop here: eating less than this needs supervision.",
    calcMaintenance: "Maintenance",
    calcBmiValue: "Your BMI",
    calcAtRest: "At complete rest",
    calcBodyFatValue: "Body fat",
    calcMacrosFor: "Split from your daily calories",
    calcEstimated1rm: "Estimated 1RM",
    calcHrMax: "Maximum heart rate",
    calcUsesBodyFat: "Using your body-fat percentage, so this is more accurate.",
    calcBmrFloorNote: "Never eat below this figure.",
    errCalcRange: "Enter a value between {min} and {max}.",
    calcYourData: "Your data",
    calcSyncLabel: "Save to my account",
    calcSyncHint: "Off, your data never leaves this device and is lost if you change phone.",
    calcSyncFailed: "Could not change that. Your data is safe on this device.",
    calcNoData: "Nothing filled in yet.",
    calcWaistNeck: "Your waist has to be larger than your neck. Check both measurements.",
    calcFatMass: "Fat mass",
    calcLeanMass: "Lean mass",
    calcSaveToBmr: "Use this in BMR and TDEE",
    calcSavedToBmr: "Saved. BMR and TDEE now use it.",
    calcUnitPct: "%",
    calcUnitKg: "kg",
    calcUnitYears: "years",
    calcUnitBpm: "bpm",
    calcUnitGram: "g",
    calcRmTable: "What to train with",
    calcRmHighReps: "Above 10 reps the estimate drifts: endurance takes over from strength.",
    calcRmSeeProgress: "Your 1RM for every exercise comes out of your logged workouts.",
    calcZoneKarvonen: "Zones by Karvonen, from your resting rate.",
    calcZoneMaxOnly: "Zones as a percentage of your maximum. Add your resting rate to sharpen them.",
  },
  es: {
    navCalculators: "Calculadoras",
    calculatorsTitle: "Calculadoras",
    calculatorsLead: "Saca los números con los que funciona tu entrenamiento.",
    calcDisclaimer:
      "Estas herramientas dan estimaciones para orientarte. No sustituyen a un médico ni a un nutricionista, y no diagnostican nada.",
    calcWhatIs: "¿Qué es esto?",
    calcHelpFor: "Sobre {field}",
    calcResultEmpty: "Completa los campos y el resultado aparece aquí.",
    calcUnitKcal: "kcal",
    calcUnitKcalDay: "kcal/día",
    calcHealthyRange: "El rango 18,5–24,9 son {min}–{max} kg con tu altura.",
    calcMinorTitle: "Menores de 18",
    calcMinorText:
      "Por debajo de 18 años el IMC se lee con percentiles de edad y sexo, no con las bandas de adulto. El número de arriba es correcto; la interpretación le toca a un profesional de salud.",
    calcKcalFloor: "Aquí paramos: comer menos que esto necesita supervisión.",
    calcMaintenance: "Mantenimiento",
    calcBmiValue: "Tu IMC",
    calcAtRest: "En reposo absoluto",
    calcBodyFatValue: "Grasa corporal",
    calcMacrosFor: "Reparto de tus calorías del día",
    calcEstimated1rm: "1RM estimado",
    calcHrMax: "Frecuencia cardiaca máxima",
    calcUsesBodyFat: "Usamos tu porcentaje de grasa, así que esto afina más.",
    calcBmrFloorNote: "Nunca comas por debajo de esta cifra.",
    errCalcRange: "Escribe un valor entre {min} y {max}.",
    calcYourData: "Tus datos",
    calcSyncLabel: "Guardar en mi cuenta",
    calcSyncHint: "Apagado, tus datos no salen de este dispositivo y se pierden si cambias de teléfono.",
    calcSyncFailed: "No se pudo cambiar. Tus datos siguen a salvo en este dispositivo.",
    calcNoData: "Todavía no has completado nada.",
    calcWaistNeck: "Tu cintura tiene que ser mayor que tu cuello. Revisa las dos medidas.",
    calcFatMass: "Masa grasa",
    calcLeanMass: "Masa magra",
    calcSaveToBmr: "Usar esto en TMB y TDEE",
    calcSavedToBmr: "Guardado. La TMB y el TDEE ya lo usan.",
    calcUnitPct: "%",
    calcUnitKg: "kg",
    calcUnitYears: "años",
    calcUnitBpm: "lpm",
    calcUnitGram: "g",
    calcRmTable: "Con qué entrenar",
    calcRmHighReps: "Por encima de 10 repeticiones la estimación se va: manda la resistencia, no la fuerza.",
    calcRmSeeProgress: "Tus 1RM de todos los ejercicios salen solos de los entrenamientos que registras.",
    calcZoneKarvonen: "Zonas por Karvonen, desde tu frecuencia en reposo.",
    calcZoneMaxOnly: "Zonas como porcentaje de tu máxima. Añade tu frecuencia en reposo para afinarlas.",
  },
};
