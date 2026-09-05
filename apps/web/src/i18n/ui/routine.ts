import type { Lang } from "../languages";

export type RoutineKey =
  | "newRoutine"
  | "wizGoal"
  | "wizDays"
  | "wizLevel"
  | "wizEquipment"
  | "equipmentHint"
  | "selectAll"
  | "clearSel"
  | "generateRoutine"
  | "generating"
  | "regenerate"
  | "saveRoutine"
  | "routineNameLabel"
  | "routineNamePlaceholder"
  | "daysValue"
  | "myRoutine"
  | "noRoutineTitle"
  | "noRoutineText"
  | "makeActive"
  | "activeBadge"
  | "otherRoutines"
  | "deleteConfirm"
  | "dayN"
  | "restN"
  | "startWorkout"
  | "exercisesN"
  | "perWeek"
  | "swapAction"
  | "swapAria"
  | "swapTitle"
  | "swapCurrent"
  | "swapFits"
  | "swapNeedsKit"
  | "swapNeedsKitHint"
  | "swapEmpty"
  | "swapFailed"
  | "swapDuplicate"
  | "swapDone"
  | "wizPlace"
  | "placeHome"
  | "placeHomeDesc"
  | "placeGym"
  | "placeGymDesc"
  | "equipmentHintHome";

export const routine: Record<Lang, Record<RoutineKey, string>> = {
  en: {
    newRoutine: "New routine",
    wizGoal: "What's your goal?",
    wizDays: "How many days a week?",
    wizLevel: "What's your level?",
    wizEquipment: "What equipment do you have?",
    equipmentHint: "Leave everything unchecked to use the full catalog.",
    selectAll: "Select all",
    clearSel: "Clear selection",
    generateRoutine: "Generate routine",
    generating: "Building your plan…",
    regenerate: "Generate again",
    saveRoutine: "Save routine",
    routineNameLabel: "Routine name",
    routineNamePlaceholder: "e.g. Autumn block",
    daysValue: "{n} days",
    myRoutine: "My routine",
    noRoutineTitle: "You don't have a routine yet",
    noRoutineText: "Answer four questions and we'll build a plan from the 1,324 exercises in the catalog.",
    makeActive: "Make active",
    activeBadge: "Active",
    otherRoutines: "Other routines",
    deleteConfirm: "Delete this permanently?",
    dayN: "Day {n}",
    restN: "{n}s rest",
    startWorkout: "Start workout",
    exercisesN: "{n} exercises",
    perWeek: "{n} days/week",
    wizPlace: "Where do you train?",
    placeHome: "At home",
    placeHomeDesc: "Body weight, bands and dumbbells — nothing you don't own",
    placeGym: "At the gym",
    placeGymDesc: "Barbells, machines and cables available",
    equipmentHintHome: "Tick only what you actually have. Nothing ticked = the whole home kit.",
    swapAction: "Swap exercise",
    swapAria: "Swap {name} for another exercise",
    swapTitle: "Swap exercise",
    swapCurrent: "Right now:",
    swapFits: "With your kit",
    swapNeedsKit: "Needs other equipment",
    swapNeedsKitHint: "You can still pick these, but you will need gear your plan does not assume.",
    swapEmpty: "We found no other exercise for this slot.",
    swapFailed: "We could not load the alternatives. Try again.",
    swapDuplicate: "That exercise is already in this day. Pick a different one.",
    swapDone: "Exercise swapped.",
  },
  es: {
    newRoutine: "Nueva rutina",
    wizGoal: "¿Cuál es tu objetivo?",
    wizDays: "¿Cuántos días entrenas a la semana?",
    wizLevel: "¿Cuál es tu nivel?",
    wizEquipment: "¿Qué equipo tienes?",
    equipmentHint: "Marca lo que tengas a mano. Sin marcar nada usamos el catálogo completo.",
    selectAll: "Seleccionar todo",
    clearSel: "Quitar selección",
    generateRoutine: "Generar rutina",
    generating: "Armando tu plan…",
    regenerate: "Generar otra",
    saveRoutine: "Guardar rutina",
    routineNameLabel: "Nombre de la rutina",
    routineNamePlaceholder: "p. ej. Bloque de otoño",
    daysValue: "{n} días",
    myRoutine: "Mi rutina",
    noRoutineTitle: "Todavía no tienes una rutina",
    noRoutineText: "Responde unas preguntas y te armamos un plan, entrenes en casa o en el gimnasio.",
    makeActive: "Activar",
    activeBadge: "Activa",
    otherRoutines: "Otras rutinas",
    deleteConfirm: "¿Eliminar esto para siempre?",
    dayN: "Día {n}",
    restN: "{n}s de descanso",
    startWorkout: "Entrenar",
    exercisesN: "{n} ejercicios",
    perWeek: "{n} días/semana",
    wizPlace: "¿Dónde entrenas?",
    placeHome: "En casa",
    placeHomeDesc: "Peso corporal, ligas y mancuernas — nada que no tengas",
    placeGym: "En el gimnasio",
    placeGymDesc: "Con barras, máquinas y poleas disponibles",
    equipmentHintHome: "Marca solo lo que tengas de verdad. Sin marcar nada usamos todo el kit de casa.",
    swapAction: "Cambiar ejercicio",
    swapAria: "Cambiar {name} por otro ejercicio",
    swapTitle: "Cambiar ejercicio",
    swapCurrent: "Ahora mismo:",
    swapFits: "Con tu equipo",
    swapNeedsKit: "Necesita otro equipo",
    swapNeedsKitHint: "Puedes elegirlos igual, pero necesitas material que tu plan no da por hecho.",
    swapEmpty: "No encontramos otro ejercicio para este hueco.",
    swapFailed: "No pudimos cargar las alternativas. Vuelve a intentar.",
    swapDuplicate: "Ese ejercicio ya está en este día. Elige otro.",
    swapDone: "Ejercicio cambiado.",
  },
};
