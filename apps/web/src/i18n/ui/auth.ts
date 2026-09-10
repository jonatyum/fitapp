import type { Lang } from "../languages";

export type AuthKey =
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
  | "saveProgressTitle"
  | "saveProgressText"
  | "errInvalidEmail"
  | "errWeakPassword"
  | "errMissingName"
  | "errEmailTaken"
  | "errBadCredentials"
  | "orDivider"
  | "errGoogle"
  | "errGoogleUnverified"
  | "errNotAllowed"
  | "errPasswordDisabled"
  | "gateBadge"
  | "gateTitle"
  | "gateSubtitle"
  | "gateAccountHint"
  | "gateCantSignIn"
  | "gateFeaturePlan"
  | "gateFeatureLog"
  | "gateFeatureStreak"
  | "gateDataNote"
  | "noInviteTitle"
  | "noInviteLead"
  | "noInviteBlocked"
  | "noInviteAccounts"
  | "noInviteAsk"
  | "noInviteAskHint"
  | "noInviteMessage"
  | "privacyLink";

export const auth: Record<Lang, Record<AuthKey, string>> = {
  en: {
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
    saveProgressTitle: "Keep your progress",
    saveProgressText: "Create an account to save your plans and your workout history.",
    authRequired: "Sign in to build routines and log your workouts.",
    errInvalidEmail: "That email doesn't look valid",
    errWeakPassword: "Password must be at least 8 characters",
    errMissingName: "Enter your name",
    errEmailTaken: "That email is already registered",
    errBadCredentials: "Wrong email or password",
    orDivider: "or",
    errGoogle: "Google sign-in failed. Try again.",
    errGoogleUnverified: "That Google account has no verified email address.",
    errNotAllowed: "That email doesn't have an invite yet.",
    errPasswordDisabled: "Chamani is invite-only right now. Sign in with Google.",
    gateBadge: "Invite-only beta",
    gateTitle: "Your training plan, week by week",
    gateSubtitle:
      "Chamani builds your routine around the equipment you have, logs your sets and shows you how you're progressing.",
    gateAccountHint: "Sign in with the email we invited.",
    gateCantSignIn: "I can't get in",
    gateFeaturePlan: "A weekly plan with whatever equipment you have",
    gateFeatureLog: "Log sets, reps and weight",
    gateFeatureStreak: "Your streak and your progress, week by week",
    gateDataNote: "We only store your name and your Google email.",
    noInviteTitle: "You don't have an invite yet",
    noInviteLead:
      "Nothing is broken and there's nothing wrong with your account. Chamani is in closed testing and, for now, only the emails we've invited one by one can get in.",
    noInviteBlocked:
      "If Google showed you an \"access blocked\" screen, that's the same thing: that email isn't on the list yet.",
    noInviteAccounts:
      "Using more than one Google account? Make sure you're signing in with the one we invited.",
    noInviteAsk: "Ask for an invite on WhatsApp",
    noInviteAskHint: "Tell us your Google email. We add accounts by hand, so it can take a day.",
    noInviteMessage: "Hi, I'd like to try Chamani. My Google email is:",
    privacyLink: "Privacy policy",
  },
  es: {
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
    saveProgressTitle: "Guarda tu progreso",
    saveProgressText: "Crea una cuenta para guardar tus planes y tu historial de entrenamientos.",
    authRequired: "Inicia sesión para crear rutinas y registrar tus entrenamientos.",
    errInvalidEmail: "Ese correo no parece válido",
    errWeakPassword: "La contraseña debe tener al menos 8 caracteres",
    errMissingName: "Escribe tu nombre",
    errEmailTaken: "Ese correo ya está registrado",
    errBadCredentials: "Correo o contraseña incorrectos",
    orDivider: "o",
    errGoogle: "No se pudo iniciar sesión con Google. Inténtalo de nuevo.",
    errGoogleUnverified: "Esa cuenta de Google no tiene un correo verificado.",
    errNotAllowed: "Ese correo aún no tiene invitación.",
    errPasswordDisabled: "Chamani está por invitación. Entra con Google.",
    gateBadge: "Beta por invitación",
    gateTitle: "Tu plan de entrenamiento, semana a semana",
    gateSubtitle:
      "Chamani arma tu rutina con el equipo que tienes, registra tus series y te enseña cómo avanzas.",
    gateAccountHint: "Entra con el correo con el que te invitamos.",
    gateCantSignIn: "No puedo entrar",
    gateFeaturePlan: "Un plan semanal con el equipo que tengas",
    gateFeatureLog: "Registra series, repeticiones y peso",
    gateFeatureStreak: "Tu racha y tu progreso, semana a semana",
    gateDataNote: "Solo guardamos tu nombre y tu correo de Google.",
    noInviteTitle: "Todavía no tienes invitación",
    noInviteLead:
      "No es un fallo tuyo ni de tu cuenta. Chamani está en pruebas cerradas y por ahora solo entran los correos que hemos invitado uno a uno.",
    noInviteBlocked:
      "Si Google te mostró una pantalla de «acceso bloqueado», es lo mismo: ese correo aún no está en la lista.",
    noInviteAccounts:
      "¿Usas varias cuentas de Google? Comprueba que entras con la que te invitamos.",
    noInviteAsk: "Pedir invitación por WhatsApp",
    noInviteAskHint:
      "Dinos tu correo de Google. Damos de alta a mano, así que puede tardar un día.",
    noInviteMessage: "Hola, quiero probar Chamani. Mi correo de Google es:",
    privacyLink: "Política de privacidad",
  },
};
