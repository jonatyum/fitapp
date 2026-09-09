import type { Lang } from "../languages";

export type BillingKey =
  | "plansTitle"
  | "plansSubtitle"
  | "planFreeName"
  | "planProName"
  | "planPerMonth"
  | "planPerQuarter"
  | "planPerYear"
  | "planBillingPeriod"
  | "planPeriodMonth"
  | "planPeriodQuarter"
  | "planPeriodYear"
  | "planPerMonthEq"
  | "planSave"
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
  | "payDeclareCta"
  | "payDeclareTitle"
  | "payDeclareLead"
  | "payOperation"
  | "payOperationHint"
  | "payPaidOn"
  | "payBankOptional"
  | "payDeclareSend"
  | "payReview"
  | "payReviewHint"
  | "errOperation"
  | "errDeclare"
  | "payCopy"
  | "payCopied"
  | "payClose"
  | "payNoProvider"
  | "payError"
  | "proOnlyTitle"
  | "proOnlyText"
  | "proSeePlans"
  | "paywallLater"
  | "paywallSessionsTitle"
  | "paywallSessionsText"
  | "paywallPlansTitle"
  | "paywallPlansText"
  | "paywallStreakTitle"
  | "paywallStreakText";

export const billing: Record<Lang, Record<BillingKey, string>> = {
  en: {
    plansTitle: "Plans",
    plansSubtitle: "Train for free. Go Pro for the analytics.",
    planFreeName: "Free",
    planProName: "Pro",
    planPerMonth: "/month",
    planPerQuarter: "/quarter",
    planPerYear: "/year",
    planBillingPeriod: "Billing period",
    planPeriodMonth: "Monthly",
    planPeriodQuarter: "Quarterly",
    planPeriodYear: "Yearly",
    planPerMonthEq: "Works out at {amount}/month",
    planSave: "Save {n}%",
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
    payStep3: "3. Come back here and tap \"I already transferred\".",
    payBank: "Bank",
    payAccountName: "Account holder",
    payAccountNumber: "Account",
    payReference: "Reference",
    payAmount: "Amount",
    payContact: "Questions? Write to us",
    payPending: "Payment pending",
    payPendingHint: "Reference {ref} — transfer it and then tell us here.",
    payDeclareCta: "I already transferred",
    payDeclareTitle: "Confirm your transfer",
    payDeclareLead:
      "Give us the operation number your bank showed you. We check it against the account and turn Pro on.",
    payOperation: "Operation number",
    payOperationHint: "It is on the receipt your banking app gave you.",
    payPaidOn: "Date of the transfer",
    payBankOptional: "Bank (optional)",
    payDeclareSend: "Send receipt",
    payReview: "Receipt received",
    payReviewHint: "Operation {op}. We turn Pro on within 24 h.",
    errOperation: "Enter the operation number.",
    errDeclare: "We could not record your receipt. Check the number and try again.",
    payCopy: "Copy",
    payCopied: "Copied",
    payClose: "Done",
    payNoProvider: "No payment method is available right now.",
    payError: "The payment could not be started. Try again.",
    proOnlyTitle: "This is a Pro feature",
    proOnlyText: "The progress dashboard is part of the Pro plan. Your workouts keep being logged either way.",
    proSeePlans: "See plans",
    paywallLater: "Not now",
    paywallSessionsTitle: "Three workouts in. Want to see the shape of it?",
    paywallSessionsText:
      "Pro turns what you log into weekly volume, records and estimated 1RM. Your workouts keep being logged either way.",
    paywallPlansTitle: "Two plans already",
    paywallPlansText:
      "Pro shows you how each one is going: volume per week, records and estimated 1RM. What you log stays yours either way.",
    paywallStreakTitle: "Two weeks without missing one",
    paywallStreakText:
      "That is the hard part, and it is yours. Pro shows you what those weeks added up to.",
  },
  es: {
    plansTitle: "Planes",
    plansSubtitle: "Entrena gratis. Hazte Pro para ver tus estadísticas.",
    planFreeName: "Free",
    planProName: "Pro",
    planPerMonth: "/mes",
    planPerQuarter: "/trimestre",
    planPerYear: "/año",
    planBillingPeriod: "Periodo de pago",
    planPeriodMonth: "Mensual",
    planPeriodQuarter: "Trimestral",
    planPeriodYear: "Anual",
    planPerMonthEq: "Sale a {amount}/mes",
    planSave: "Ahorras {n}%",
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
    payStep3: "3. Vuelve aquí y pulsa «Ya transferí».",
    payBank: "Banco",
    payAccountName: "Titular",
    payAccountNumber: "Cuenta",
    payReference: "Referencia",
    payAmount: "Monto",
    payContact: "¿Dudas? Escríbenos a",
    payPending: "Pago pendiente",
    payPendingHint: "Referencia {ref} — transfiere y luego avísanos aquí.",
    payDeclareCta: "Ya transferí",
    payDeclareTitle: "Confirma tu transferencia",
    payDeclareLead:
      "Pon el número de operación que te dio tu banco. Lo verificamos contra la cuenta y activamos Pro.",
    payOperation: "Nº de operación",
    payOperationHint: "Está en el comprobante que te dio la app de tu banco.",
    payPaidOn: "Fecha de la transferencia",
    payBankOptional: "Banco (opcional)",
    payDeclareSend: "Enviar comprobante",
    payReview: "Comprobante recibido",
    payReviewHint: "Operación {op}. Activamos Pro en menos de 24 h.",
    errOperation: "Escribe el número de operación.",
    errDeclare: "No pudimos registrar tu comprobante. Revisa el número e inténtalo de nuevo.",
    payCopy: "Copiar",
    payCopied: "Copiado",
    payClose: "Listo",
    payNoProvider: "Ahora mismo no hay ningún medio de pago disponible.",
    payError: "No se pudo iniciar el pago. Inténtalo de nuevo.",
    proOnlyTitle: "Esta función es de Pro",
    proOnlyText: "El panel de progreso es parte del plan Pro. Tus entrenamientos se siguen registrando igual.",
    proSeePlans: "Ver planes",
    paywallLater: "Ahora no",
    paywallSessionsTitle: "Van tres entrenamientos. ¿Quieres ver la forma que tienen?",
    paywallSessionsText:
      "Pro convierte lo que registras en volumen semanal, récords y 1RM estimado. Tus entrenamientos se siguen guardando igual.",
    paywallPlansTitle: "Ya llevas dos planes",
    paywallPlansText:
      "Pro te enseña cómo va cada uno: volumen por semana, récords y 1RM estimado. Lo que registras sigue siendo tuyo, con Pro o sin él.",
    paywallStreakTitle: "Dos semanas sin fallar",
    paywallStreakText:
      "Esa es la parte difícil, y es tuya. Pro te enseña en qué se han convertido esas semanas.",
  },
};
