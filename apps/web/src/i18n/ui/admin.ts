import type { Lang } from "../languages";

export type AdminKey =
  | "adminTitle"
  | "adminPayments"
  | "adminUsers"
  | "adminSearchPayments"
  | "adminSearchUsers"
  | "adminNoPayments"
  | "adminNoUsers"
  | "adminQueue"
  | "adminAll"
  | "adminConfirm"
  | "adminReject"
  | "adminConfirmAsk"
  | "adminRejectAsk"
  | "adminConfirmed"
  | "adminRejected"
  | "adminDeclared"
  | "adminNotDeclared"
  | "adminDeletedUser"
  | "adminRoleAdmin"
  | "adminRoleClient"
  | "adminMakeAdmin"
  | "adminRemoveAdmin"
  | "adminMakeAdminAsk"
  | "adminRemoveAdminAsk"
  | "adminRoleChanged"
  | "adminSelfRole"
  | "adminCounts"
  | "adminStatusPending"
  | "adminStatusReview"
  | "adminStatusPaid"
  | "adminStatusFailed"
  | "adminStatusExpired";

export const admin: Record<Lang, Record<AdminKey, string>> = {
  en: {
    adminTitle: "Administration",
    adminPayments: "Payments",
    adminUsers: "Accounts",
    adminSearchPayments: "Reference or email",
    adminSearchUsers: "Name or email",
    adminNoPayments: "Nothing waiting.",
    adminNoUsers: "No account matches.",
    adminQueue: "Waiting",
    adminAll: "All",
    adminConfirm: "Confirm",
    adminReject: "Reject",
    adminConfirmAsk: "Confirm {ref}? Only do this with the transfer in front of you.",
    adminRejectAsk: "Reject {ref}? The payer will have to start again.",
    adminConfirmed: "{ref} confirmed. Pro is active.",
    adminRejected: "{ref} rejected.",
    adminDeclared: "Operation {op} · {date}",
    adminNotDeclared: "No receipt sent yet",
    adminDeletedUser: "Deleted account",
    adminRoleAdmin: "Admin",
    adminRoleClient: "Client",
    adminMakeAdmin: "Make admin",
    adminRemoveAdmin: "Remove admin",
    adminMakeAdminAsk: "Give {name} full access to payments and accounts?",
    adminRemoveAdminAsk: "Take admin access away from {name}?",
    adminRoleChanged: "{name} is now {role}.",
    adminSelfRole: "You cannot change your own role.",
    adminCounts: "{plans} plans · {sessions} workouts",
    adminStatusPending: "Awaiting transfer",
    adminStatusReview: "Receipt sent",
    adminStatusPaid: "Paid",
    adminStatusFailed: "Rejected",
    adminStatusExpired: "Expired",
  },
  es: {
    adminTitle: "Administración",
    adminPayments: "Pagos",
    adminUsers: "Cuentas",
    adminSearchPayments: "Referencia o correo",
    adminSearchUsers: "Nombre o correo",
    adminNoPayments: "No hay nada esperando.",
    adminNoUsers: "Ninguna cuenta coincide.",
    adminQueue: "En espera",
    adminAll: "Todos",
    adminConfirm: "Confirmar",
    adminReject: "Rechazar",
    adminConfirmAsk: "¿Confirmar {ref}? Hazlo solo con la transferencia delante.",
    adminRejectAsk: "¿Rechazar {ref}? Quien pagó tendrá que empezar de nuevo.",
    adminConfirmed: "{ref} confirmado. Pro está activo.",
    adminRejected: "{ref} rechazado.",
    adminDeclared: "Operación {op} · {date}",
    adminNotDeclared: "Todavía no envió comprobante",
    adminDeletedUser: "Cuenta borrada",
    adminRoleAdmin: "Admin",
    adminRoleClient: "Cliente",
    adminMakeAdmin: "Hacer admin",
    adminRemoveAdmin: "Quitar admin",
    adminMakeAdminAsk: "¿Dar a {name} acceso completo a pagos y cuentas?",
    adminRemoveAdminAsk: "¿Quitarle a {name} el acceso de administración?",
    adminRoleChanged: "{name} ahora es {role}.",
    adminSelfRole: "No puedes cambiar tu propio rol.",
    adminCounts: "{plans} planes · {sessions} entrenamientos",
    adminStatusPending: "Esperando transferencia",
    adminStatusReview: "Comprobante enviado",
    adminStatusPaid: "Cobrado",
    adminStatusFailed: "Rechazado",
    adminStatusExpired: "Caducado",
  },
};
