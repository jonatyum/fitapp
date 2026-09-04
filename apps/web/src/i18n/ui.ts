import type { Lang } from "./languages";

// UI chrome strings. Use {n} as a placeholder for interpolation.
export type UIKey =
  // catalog / chrome
  | "tagline"
  | "searchPlaceholder"
  | "bodyPart"
  | "equipment"
  | "target"
  | "filters"
  | "clearAll"
  | "results"
  | "noResults"
  | "loading"
  | "steps"
  | "targetLabel"
  | "secondaryLabel"
  | "equipmentLabel"
  | "bodyPartLabel"
  | "close"
  | "language"
  | "theme"
  // common actions
  | "cancel"
  | "save"
  | "delete"
  | "back"
  | "next"
  // navigation
  | "navCatalog"
  | "navMap"
  | "navRoutine"
  | "navProgress"
  // auth
  | "signIn"
  | "signUp"
  | "signOut"
  | "emailLabel"
  | "passwordLabel"
  | "nameLabel"
  | "passwordHint"
  | "welcomeBack"
  | "createAccount"
  | "noAccount"
  | "haveAccount"
  | "authRequired"
  | "errInvalidEmail"
  | "errWeakPassword"
  | "errMissingName"
  | "errEmailTaken"
  | "errBadCredentials"
  | "errGeneric"
  | "orDivider"
  | "errGoogle"
  | "errGoogleUnverified"
  // routine wizard
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
  // routine view
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
  // workout logger
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
  | "viewExercise"
  // progress
  | "progress"
  | "statSessions"
  | "statVolume"
  | "statSets"
  | "statStreak"
  | "weeklyVolume"
  | "topExercises"
  | "personalRecords"
  | "historyTitle"
  | "noSessionsTitle"
  | "noSessionsText"
  | "est1rm"
  | "setsN"
  // train at home
  | "tagHome"
  | "tagBodyweight"
  | "wizPlace"
  | "placeHome"
  | "placeHomeDesc"
  | "placeGym"
  | "placeGymDesc"
  | "equipmentHintHome"
  // subscriptions
  | "navPlans"
  | "plansTitle"
  | "plansSubtitle"
  | "planFreeName"
  | "planProName"
  | "planPerMonth"
  | "planCurrent"
  | "planChoose"
  | "planFreeF1"
  | "planFreeF2"
  | "planFreeF3"
  | "planProF1"
  | "planProF2"
  | "planProF3"
  | "subActive"
  | "subExpired"
  | "subRenewsOn"
  | "subExpiredOn"
  | "subRenew"
  | "payTitle"
  | "payStep1"
  | "payStep2"
  | "payStep3"
  | "payBank"
  | "payAccountName"
  | "payAccountNumber"
  | "payReference"
  | "payAmount"
  | "payContact"
  | "payPending"
  | "payPendingHint"
  | "payCopy"
  | "payCopied"
  | "payClose"
  | "payNoProvider"
  | "payError"
  | "proOnlyTitle"
  | "proOnlyText"
  | "proSeePlans";

export const UI: Record<Lang, Record<UIKey, string>> = {
  en: {
    tagline: "Exercise Library",
    searchPlaceholder: "Search exercises…",
    bodyPart: "Body part",
    equipment: "Equipment",
    target: "Target muscle",
    filters: "Filters",
    clearAll: "Clear",
    results: "{n} exercises",
    noResults: "No exercises found",
    loading: "Loading…",
    steps: "Step-by-step",
    targetLabel: "Target",
    secondaryLabel: "Secondary muscles",
    equipmentLabel: "Equipment",
    bodyPartLabel: "Body part",
    close: "Close",
    language: "Language",
    theme: "Theme",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    back: "Back",
    next: "Next",
    navCatalog: "Catalog",
    navMap: "Muscle map",
    navRoutine: "Routine",
    navProgress: "Progress",
    signIn: "Sign in",
    signUp: "Sign up",
    signOut: "Sign out",
    emailLabel: "Email",
    passwordLabel: "Password",
    nameLabel: "Name",
    passwordHint: "At least 8 characters",
    welcomeBack: "Welcome back",
    createAccount: "Create your account",
    noAccount: "No account yet?",
    haveAccount: "Already have an account?",
    authRequired: "Sign in to build routines and log your workouts.",
    errInvalidEmail: "That email doesn't look valid",
    errWeakPassword: "Password must be at least 8 characters",
    errMissingName: "Enter your name",
    errEmailTaken: "That email is already registered",
    errBadCredentials: "Wrong email or password",
    errGeneric: "Something went wrong. Try again.",
    orDivider: "or",
    errGoogle: "Google sign-in failed. Try again.",
    errGoogleUnverified: "That Google account has no verified email address.",
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
    progress: "Progress",
    statSessions: "Workouts",
    statVolume: "Total volume",
    statSets: "Sets",
    statStreak: "Week streak",
    weeklyVolume: "Volume per week",
    topExercises: "Most trained",
    personalRecords: "Personal records",
    historyTitle: "History",
    noSessionsTitle: "Nothing logged yet",
    noSessionsText: "Finish a workout and your stats will show up here.",
    est1rm: "est. 1RM",
    setsN: "{n} sets",

    // subscriptions
    navPlans: "Plans",
    plansTitle: "Plans",
    plansSubtitle: "Train for free. Go Pro for the analytics.",
    planFreeName: "Free",
    planProName: "Pro",
    planPerMonth: "/month",
    planCurrent: "Current plan",
    planChoose: "Go Pro",
    planFreeF1: "Full exercise library and muscle map",
    planFreeF2: "Routine generator",
    planFreeF3: "Workout logging and history",
    planProF1: "Everything in Free",
    planProF2: "Progress dashboard: weekly volume and streak",
    planProF3: "Personal records and estimated 1RM",
    subActive: "Pro active",
    subExpired: "Your Pro plan expired",
    subRenewsOn: "Valid until {date}",
    subExpiredOn: "Expired on {date}",
    subRenew: "Renew",
    payTitle: "Pay by QR or transfer",
    payStep1: "1. Transfer {amount} to the account below.",
    payStep2: "2. Put the reference {ref} in the transfer note.",
    payStep3: "3. Send the receipt to {contact}. We activate Pro within 24 h.",
    payBank: "Bank",
    payAccountName: "Account holder",
    payAccountNumber: "Account",
    payReference: "Reference",
    payAmount: "Amount",
    payContact: "Send the receipt to",
    payPending: "Payment pending",
    payPendingHint: "Reference {ref} — we are checking your transfer.",
    payCopy: "Copy",
    payCopied: "Copied",
    payClose: "Done",
    payNoProvider: "No payment method is available right now.",
    payError: "The payment could not be started. Try again.",
    proOnlyTitle: "This is a Pro feature",
    proOnlyText: "The progress dashboard is part of the Pro plan. Your workouts keep being logged either way.",
    proSeePlans: "See plans",
    // train at home
    tagHome: "At home",
    tagBodyweight: "No gym",
    wizPlace: "Where do you train?",
    placeHome: "At home",
    placeHomeDesc: "Body weight, bands and dumbbells — nothing you don't own",
    placeGym: "At the gym",
    placeGymDesc: "Barbells, machines and cables available",
    equipmentHintHome: "Tick only what you actually have. Nothing ticked = the whole home kit.",
  },
  es: {
    tagline: "Biblioteca de ejercicios",
    searchPlaceholder: "Buscar ejercicios…",
    bodyPart: "Parte del cuerpo",
    equipment: "Equipo",
    target: "Músculo objetivo",
    filters: "Filtros",
    clearAll: "Limpiar",
    results: "{n} ejercicios",
    noResults: "No se encontraron ejercicios",
    loading: "Cargando…",
    steps: "Paso a paso",
    targetLabel: "Objetivo",
    secondaryLabel: "Músculos secundarios",
    equipmentLabel: "Equipo",
    bodyPartLabel: "Parte del cuerpo",
    close: "Cerrar",
    language: "Idioma",
    theme: "Tema",
    cancel: "Cancelar",
    save: "Guardar",
    delete: "Eliminar",
    back: "Atrás",
    next: "Siguiente",
    navCatalog: "Catálogo",
    navMap: "Mapa muscular",
    navRoutine: "Rutina",
    navProgress: "Progreso",
    signIn: "Iniciar sesión",
    signUp: "Crear cuenta",
    signOut: "Cerrar sesión",
    emailLabel: "Correo",
    passwordLabel: "Contraseña",
    nameLabel: "Nombre",
    passwordHint: "Mínimo 8 caracteres",
    welcomeBack: "Bienvenido de nuevo",
    createAccount: "Crea tu cuenta",
    noAccount: "¿Aún no tienes cuenta?",
    haveAccount: "¿Ya tienes cuenta?",
    authRequired: "Inicia sesión para crear rutinas y registrar tus entrenamientos.",
    errInvalidEmail: "Ese correo no parece válido",
    errWeakPassword: "La contraseña debe tener al menos 8 caracteres",
    errMissingName: "Escribe tu nombre",
    errEmailTaken: "Ese correo ya está registrado",
    errBadCredentials: "Correo o contraseña incorrectos",
    errGeneric: "Algo salió mal. Inténtalo de nuevo.",
    orDivider: "o",
    errGoogle: "No se pudo iniciar sesión con Google. Inténtalo de nuevo.",
    errGoogleUnverified: "Esa cuenta de Google no tiene un correo verificado.",
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
    progress: "Progreso",
    statSessions: "Entrenamientos",
    statVolume: "Volumen total",
    statSets: "Series",
    statStreak: "Racha (semanas)",
    weeklyVolume: "Volumen por semana",
    topExercises: "Más entrenados",
    personalRecords: "Récords personales",
    historyTitle: "Historial",
    noSessionsTitle: "Aún no has registrado nada",
    noSessionsText: "Termina un entrenamiento y tus estadísticas aparecerán aquí.",
    est1rm: "1RM est.",
    setsN: "{n} series",

    // subscriptions
    navPlans: "Planes",
    plansTitle: "Planes",
    plansSubtitle: "Entrena gratis. Hazte Pro para ver tus estadísticas.",
    planFreeName: "Free",
    planProName: "Pro",
    planPerMonth: "/mes",
    planCurrent: "Plan actual",
    planChoose: "Pasar a Pro",
    planFreeF1: "Catálogo completo de ejercicios y mapa muscular",
    planFreeF2: "Generador de rutinas",
    planFreeF3: "Registro de entrenamientos e historial",
    planProF1: "Todo lo de Free",
    planProF2: "Panel de progreso: volumen semanal y racha",
    planProF3: "Récords personales y 1RM estimado",
    subActive: "Pro activo",
    subExpired: "Tu plan Pro venció",
    subRenewsOn: "Válido hasta el {date}",
    subExpiredOn: "Venció el {date}",
    subRenew: "Renovar",
    payTitle: "Paga con QR Simple o transferencia",
    payStep1: "1. Transfiere {amount} a la cuenta de abajo.",
    payStep2: "2. Pon la referencia {ref} en el detalle de la transferencia.",
    payStep3: "3. Envía el comprobante a {contact}. Activamos Pro en menos de 24 h.",
    payBank: "Banco",
    payAccountName: "Titular",
    payAccountNumber: "Cuenta",
    payReference: "Referencia",
    payAmount: "Monto",
    payContact: "Envía el comprobante a",
    payPending: "Pago pendiente",
    payPendingHint: "Referencia {ref} — estamos verificando tu transferencia.",
    payCopy: "Copiar",
    payCopied: "Copiado",
    payClose: "Listo",
    payNoProvider: "Ahora mismo no hay ningún medio de pago disponible.",
    payError: "No se pudo iniciar el pago. Inténtalo de nuevo.",
    proOnlyTitle: "Esta función es de Pro",
    proOnlyText: "El panel de progreso es parte del plan Pro. Tus entrenamientos se siguen registrando igual.",
    proSeePlans: "Ver planes",
    // train at home
    tagHome: "En casa",
    tagBodyweight: "Sin equipo",
    wizPlace: "¿Dónde entrenas?",
    placeHome: "En casa",
    placeHomeDesc: "Peso corporal, ligas y mancuernas — nada que no tengas",
    placeGym: "En el gimnasio",
    placeGymDesc: "Con barras, máquinas y poleas disponibles",
    equipmentHintHome: "Marca solo lo que tengas de verdad. Sin marcar nada usamos todo el kit de casa.",
  },
};
