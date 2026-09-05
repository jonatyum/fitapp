import type { Lang } from "../languages";

export type WorkoutKey =
  | "workoutTitle"
  | "freeWorkout"
  | "finish"
  | "discardConfirm"
  | "addSet"
  | "setCol"
  | "repsCol"
  | "weightCol"
  | "notesLabel"
  | "notesPlaceholder"
  | "emptyWorkout"
  | "elapsed"
  | "viewExercise";

export const workout: Record<Lang, Record<WorkoutKey, string>> = {
  en: {
    workoutTitle: "Workout",
    freeWorkout: "Free workout",
    finish: "Finish",
    discardConfirm: "Discard this workout?",
    addSet: "Add set",
    setCol: "Set",
    repsCol: "Reps",
    weightCol: "kg",
    notesLabel: "Notes",
    notesPlaceholder: "How did it go?",
    emptyWorkout: "Log at least one set before finishing.",
    elapsed: "Elapsed",
    viewExercise: "View exercise",
  },
  es: {
    workoutTitle: "Entrenamiento",
    freeWorkout: "Entrenamiento libre",
    finish: "Terminar",
    discardConfirm: "¿Descartar este entrenamiento?",
    addSet: "Añadir serie",
    setCol: "Serie",
    repsCol: "Reps",
    weightCol: "kg",
    notesLabel: "Notas",
    notesPlaceholder: "¿Cómo fue?",
    emptyWorkout: "Registra al menos una serie antes de terminar.",
    elapsed: "Tiempo",
    viewExercise: "Ver ejercicio",
  },
};
