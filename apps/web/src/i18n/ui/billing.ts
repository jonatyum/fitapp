import type { Lang } from "../languages";

export type BillingKey =
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

export const billing: Record<Lang, Record<BillingKey, string>> = {
  en: {
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
  },
  es: {
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
  },
};
