import type {
  Charge,
  CreateChargeInput,
  PaymentProvider,
  PaymentRef,
  PaymentStatus,
} from "./types.js";

/**
 * QR Simple / bank transfer, settled by hand.
 *
 * The dominant way to pay in Bolivia and the only one with zero commission and
 * zero fixed cost: the user transfers to the account below quoting the payment
 * reference, sends the receipt, and an admin confirms it through
 * `POST /admin/payments/:reference/confirm`. There is no third party, so this
 * provider owns no state — the Payment row is the whole truth.
 */
const account = {
  bankName: process.env.QR_BANK_NAME?.trim() ?? "",
  accountName: process.env.QR_ACCOUNT_NAME?.trim() ?? "",
  accountNumber: process.env.QR_ACCOUNT_NUMBER?.trim() ?? "",
  qrImageUrl: process.env.QR_IMAGE_URL?.trim() || null,
  contact: process.env.QR_CONTACT?.trim() ?? "",
};

export const manualQrProvider: PaymentProvider = {
  id: "manual-qr",

  // Fail closed: without an account number and a contact to send the receipt
  // to, the instructions screen would tell the user to pay into nothing.
  enabled: Boolean(account.accountNumber && account.contact),

  async createCharge(input: CreateChargeInput): Promise<Charge> {
    return {
      kind: "instructions",
      instructions: {
        ...account,
        reference: input.reference,
        amountCents: input.plan.priceCents,
        currency: input.plan.currency,
      },
    };
  },

  // Nothing to ask: an admin moves the row, so the stored status is authoritative.
  async getChargeStatus(payment: PaymentRef): Promise<PaymentStatus> {
    return payment.status;
  },

  // A bank transfer notifies nobody. Confirmation comes from the admin route.
  async parseWebhook() {
    return null;
  },
};
