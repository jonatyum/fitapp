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
  | "errGoogleUnverified";

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
  },
};
