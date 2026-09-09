import type { Lang } from "../languages";

export type SettingsKey =
  | "settingsTitle"
  | "settingsProfile"
  | "settingsEmailFixed"
  | "settingsProfileSaved"
  | "settingsPrefs"
  | "settingsPrefsHint"
  | "settingsDarkTheme"
  | "settingsSecurity"
  | "settingsPasswordChange"
  | "settingsPasswordCreate"
  | "settingsPasswordCreateHint"
  | "settingsCurrentPassword"
  | "settingsNewPassword"
  | "settingsPasswordSaved"
  | "settingsDangerTitle"
  | "settingsDangerText"
  | "settingsDeleteCta"
  | "settingsDeleteTitle"
  | "settingsDeleteLead"
  | "settingsDeleteKeeps"
  | "settingsDeleteByPassword"
  | "settingsDeleteByEmail"
  | "settingsDeleteConfirm"
  | "settingsDeleted"
  | "errNameTooLong"
  | "errBadPassword"
  | "errConfirmMismatch";

export const settings: Record<Lang, Record<SettingsKey, string>> = {
  en: {
    settingsTitle: "Settings",
    settingsProfile: "Profile",
    settingsEmailFixed: "Your email address can't be changed yet.",
    settingsProfileSaved: "Profile updated",
    settingsPrefs: "Preferences",
    settingsPrefsHint: "Language and theme are kept on this device only.",
    settingsDarkTheme: "Dark theme",
    settingsSecurity: "Security",
    settingsPasswordChange: "Change password",
    settingsPasswordCreate: "Create a password",
    settingsPasswordCreateHint:
      "You signed in with Google. Add a password and you can also sign in without it.",
    settingsCurrentPassword: "Current password",
    settingsNewPassword: "New password",
    settingsPasswordSaved: "Password updated",
    settingsDangerTitle: "Delete account",
    settingsDangerText:
      "Deletes your account, your plans and your workout history. It cannot be undone.",
    settingsDeleteCta: "Delete my account",
    settingsDeleteTitle: "Delete your account?",
    settingsDeleteLead:
      "Your plans, your logged workouts and your streak go with it. There is no way back.",
    settingsDeleteKeeps: "Payments already made are kept as accounting records, with no name on them.",
    settingsDeleteByPassword: "Enter your password to confirm",
    settingsDeleteByEmail: "Type {email} to confirm",
    settingsDeleteConfirm: "Delete for good",
    settingsDeleted: "Your account is gone. Take care.",
    errNameTooLong: "That name is too long (60 characters max)",
    errBadPassword: "That password is not correct",
    errConfirmMismatch: "That doesn't match your email address",
  },
  es: {
    settingsTitle: "Ajustes",
    settingsProfile: "Perfil",
    settingsEmailFixed: "Por ahora el correo no se puede cambiar.",
    settingsProfileSaved: "Perfil actualizado",
    settingsPrefs: "Preferencias",
    settingsPrefsHint: "El idioma y el tema se guardan solo en este dispositivo.",
    settingsDarkTheme: "Tema oscuro",
    settingsSecurity: "Seguridad",
    settingsPasswordChange: "Cambiar contraseña",
    settingsPasswordCreate: "Crear contraseña",
    settingsPasswordCreateHint:
      "Entraste con Google. Si pones una contraseña, también podrás entrar sin él.",
    settingsCurrentPassword: "Contraseña actual",
    settingsNewPassword: "Contraseña nueva",
    settingsPasswordSaved: "Contraseña actualizada",
    settingsDangerTitle: "Eliminar cuenta",
    settingsDangerText:
      "Borra tu cuenta, tus planes y tu historial de entrenamientos. No se puede deshacer.",
    settingsDeleteCta: "Eliminar mi cuenta",
    settingsDeleteTitle: "¿Eliminar tu cuenta?",
    settingsDeleteLead:
      "Se van con ella tus planes, los entrenamientos que registraste y tu racha. No hay vuelta atrás.",
    settingsDeleteKeeps: "Los pagos ya hechos se conservan como registro contable, sin tu nombre.",
    settingsDeleteByPassword: "Escribe tu contraseña para confirmar",
    settingsDeleteByEmail: "Escribe {email} para confirmar",
    settingsDeleteConfirm: "Eliminar definitivamente",
    settingsDeleted: "Tu cuenta ya no existe. Cuídate.",
    errNameTooLong: "Ese nombre es demasiado largo (60 caracteres como máximo)",
    errBadPassword: "Esa contraseña no es correcta",
    errConfirmMismatch: "Eso no coincide con tu correo",
  },
};
