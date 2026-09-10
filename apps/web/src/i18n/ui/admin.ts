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
  | "adminAccess"
  | "adminAccessLead"
  | "adminAccessOpen"
  | "adminInviteLabel"
  | "adminInvitePlaceholder"
  | "adminInviteAdd"
  | "adminInviteAdded"
  | "adminNoInvites"
  | "adminInvitePending"
  | "adminInviteJoined"
  | "adminInviteBySeed"
  | "adminInviteBy"
  | "adminRevoke"
  | "adminRevokeAsk"
  | "adminRevoked"
  | "adminSelfRevoke"
  | "adminAlreadyInvited"
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
    adminAccess: "Access",
    adminAccessLead: "Only these addresses can sign in while the beta is closed.",
    adminAccessOpen: "The beta is off: anyone with a Google account can sign in, list or no list.",
    adminInviteLabel: "Email to invite",
    adminInvitePlaceholder: "name@gmail.com",
    adminInviteAdd: "Give access",
    adminInviteAdded: "{email} can now sign in.",
    adminNoInvites: "Nobody has been invited yet.",
    adminInvitePending: "Not signed in yet",
    adminInviteJoined: "Signed in {date}",
    adminInviteBySeed: "From the environment",
    adminInviteBy: "Invited by {email}",
    adminRevoke: "Revoke",
    adminRevokeAsk: "Revoke access for {email}? Their data stays; they just cannot sign in again.",
    adminRevoked: "{email} can no longer sign in.",
    adminSelfRevoke: "You cannot revoke your own access.",
    adminAlreadyInvited: "That address already has access.",
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
    adminAccess: "Accesos",
    adminAccessLead: "Solo estos correos pueden entrar mientras la beta esté cerrada.",
    adminAccessOpen: "La beta está apagada: entra cualquiera con cuenta de Google, haya lista o no.",
    adminInviteLabel: "Correo a invitar",
    adminInvitePlaceholder: "nombre@gmail.com",
    adminInviteAdd: "Dar acceso",
    adminInviteAdded: "{email} ya puede entrar.",
    adminNoInvites: "Todavía no has invitado a nadie.",
    adminInvitePending: "Aún no ha entrado",
    adminInviteJoined: "Entró el {date}",
    adminInviteBySeed: "Desde el entorno",
    adminInviteBy: "Invitado por {email}",
    adminRevoke: "Quitar",
    adminRevokeAsk: "¿Quitar el acceso a {email}? Sus datos siguen ahí; simplemente no podrá volver a entrar.",
    adminRevoked: "{email} ya no puede entrar.",
    adminSelfRevoke: "No puedes quitarte tu propio acceso.",
    adminAlreadyInvited: "Ese correo ya tiene acceso.",
    adminSelfRole: "No puedes cambiar tu propio rol.",
    adminCounts: "{plans} planes · {sessions} entrenamientos",
    adminStatusPending: "Esperando transferencia",
    adminStatusReview: "Comprobante enviado",
    adminStatusPaid: "Cobrado",
    adminStatusFailed: "Rechazado",
    adminStatusExpired: "Caducado",
  },
};
