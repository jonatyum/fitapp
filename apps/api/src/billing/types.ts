import type { FastifyRequest } from "fastify";

/** Providers compiled into the API. `Payment.provider` stores one of these. */
export const PROVIDER_IDS = ["manual-qr", "polar"] as const;
export type ProviderId = (typeof PROVIDER_IDS)[number];

/**
 * `review` is manual-qr only: the payer said they transferred and quoted the
 * operation number, and an admin has not checked the statement yet. It is
 * still unpaid — it only tells the queue (and the payer) that the ball is on
 * our side now.
 */
export const PAYMENT_STATUSES = ["pending", "review", "paid", "failed", "expired"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const isProviderId = (v: unknown): v is ProviderId =>
  PROVIDER_IDS.includes(v as ProviderId);

/** A plan as the catalog defines it, before it reaches the database. */
export interface PlanSpec {
  code: string;
  name: string;
  /** Cents of `currency`; Bs 49.00 is 4900. */
  priceCents: number;
  currency: string;
  /** Days one paid period lasts. 0 = never expires. */
  periodDays: number;
}

export interface CreateChargeInput {
  user: { id: string; email: string; name: string };
  plan: PlanSpec;
  /** Already stored on the Payment row; the provider must carry it through. */
  reference: string;
}

/** Everything the "pay by QR / bank transfer" screen renders. */
export interface ChargeInstructions {
  bankName: string;
  accountName: string;
  accountNumber: string;
  /** Absolute URL of the QR image, or null when none is configured. */
  qrImageUrl: string | null;
  /** Must appear in the transfer note — it is how the admin matches the payment. */
  reference: string;
  amountCents: number;
  currency: string;
  /** Where the payer sends the receipt (a WhatsApp number, an email). */
  contact: string;
}

/** What the web app has to do next to get the money in. */
export type Charge =
  | { kind: "instructions"; instructions: ChargeInstructions }
  | { kind: "redirect"; url: string; externalId: string };

/** The fields a provider needs to look a payment back up on its side. */
export interface PaymentRef {
  reference: string;
  externalId: string | null;
  /** What we currently believe; a provider with no API of its own echoes it. */
  status: PaymentStatus;
}

/** A verified, normalized inbound provider notification. */
export interface ProviderEvent {
  externalId: string;
  /** Set when the provider carries our reference back; preferred for matching. */
  reference?: string;
  status: PaymentStatus;
  amountCents?: number;
  currency?: string;
}

/** Thrown by `parseWebhook` when a payload fails signature verification. */
export class WebhookVerificationError extends Error {}

/**
 * A way to take money. Everything payment-specific lives behind this; the
 * routes, the subscription maths and the web app know nothing about any
 * particular processor.
 *
 * Note what is deliberately NOT here: activating and renewing a subscription.
 * That is identical whatever paid, so it lives once in `subscriptions.ts`
 * (`activateFromPayment`) instead of being reimplemented — and possibly
 * diverging — in every provider.
 */
export interface PaymentProvider {
  readonly id: ProviderId;

  /**
   * false = compiled in but not configured. `/billing/plans` hides it and
   * `/billing/checkout` refuses it, so a half-configured deploy fails at the
   * edge instead of halfway through a payment.
   */
  readonly enabled: boolean;

  /** Start a charge. The Payment row already exists, in `pending`. */
  createCharge(input: CreateChargeInput): Promise<Charge>;

  /** Authoritative re-read, for polling when no webhook ever arrived. */
  getChargeStatus(payment: PaymentRef): Promise<PaymentStatus>;

  /**
   * Verify and normalize a raw webhook. `req.body` is the unparsed Buffer, so
   * a signature can be checked over the exact bytes received.
   *
   * Returns null for deliveries we do not act on. Throws
   * `WebhookVerificationError` when the signature does not check out.
   */
  parseWebhook(req: FastifyRequest): Promise<ProviderEvent | null>;
}
