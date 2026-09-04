import { createHmac, timingSafeEqual } from "node:crypto";
import type { FastifyRequest } from "fastify";
import {
  WebhookVerificationError,
  type Charge,
  type CreateChargeInput,
  type PaymentProvider,
  type PaymentRef,
  type PaymentStatus,
  type ProviderEvent,
} from "./types.js";

/**
 * Polar.sh — hosted checkout, kept ready but switched off.
 *
 * Polar is a Merchant of Record: it collects, handles tax and settles in USD,
 * so it is the escape hatch for card payments from outside Bolivia. It costs
 * nothing until it takes money, which keeps the "fixed cost 0" goal intact.
 *
 * Nothing here runs until all three variables below are set (see .env.example).
 *
 * ⚠️ The two HTTP calls are written from Polar's published API shape but have
 * never been executed against a live account. Verify them against the current
 * docs before flipping this on. The signature check below is
 * standard-webhooks and is exercised by the tests in the summary.
 */
const API = process.env.POLAR_API_URL?.trim() || "https://api.polar.sh";
const accessToken = process.env.POLAR_ACCESS_TOKEN?.trim() ?? "";
const webhookSecret = process.env.POLAR_WEBHOOK_SECRET?.trim() ?? "";
const proProductId = process.env.POLAR_PRODUCT_ID_PRO?.trim() ?? "";
/** Where Polar sends the browser back after a successful checkout. */
const successUrl = process.env.POLAR_SUCCESS_URL?.trim() ?? "";

/** Polar order/subscription states mapped onto ours. */
const STATUS: Record<string, PaymentStatus> = {
  paid: "paid",
  succeeded: "paid",
  active: "paid",
  pending: "pending",
  processing: "pending",
  failed: "failed",
  canceled: "failed",
  refunded: "failed",
};

/**
 * standard-webhooks: base64 HMAC-SHA256 over `${id}.${timestamp}.${body}`,
 * keyed with the base64-decoded secret. The header carries a space-separated
 * list of `v1,<sig>` so a secret can be rotated without downtime.
 */
function verify(req: FastifyRequest, raw: Buffer): void {
  const id = req.headers["webhook-id"];
  const timestamp = req.headers["webhook-timestamp"];
  const signature = req.headers["webhook-signature"];
  if (typeof id !== "string" || typeof timestamp !== "string" || typeof signature !== "string") {
    throw new WebhookVerificationError("missing webhook headers");
  }

  // Reject replays of an old, genuinely-signed delivery.
  const ageSec = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(ageSec) || ageSec > 300) {
    throw new WebhookVerificationError("stale webhook timestamp");
  }

  const key = Buffer.from(webhookSecret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key)
    .update(`${id}.${timestamp}.${raw.toString("utf8")}`)
    .digest();

  const ok = signature.split(" ").some((part) => {
    const got = Buffer.from(part.startsWith("v1,") ? part.slice(3) : part, "base64");
    return got.length === expected.length && timingSafeEqual(got, expected);
  });
  if (!ok) throw new WebhookVerificationError("bad webhook signature");
}

export const polarProvider: PaymentProvider = {
  id: "polar",

  enabled: Boolean(accessToken && webhookSecret && proProductId),

  async createCharge(input: CreateChargeInput): Promise<Charge> {
    const res = await fetch(`${API}/v1/checkouts/`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        product_id: proProductId,
        customer_email: input.user.email,
        success_url: successUrl || undefined,
        // Carried back on every webhook, so a delivery can be matched to the
        // Payment row without trusting the amount or the email.
        metadata: { reference: input.reference, userId: input.user.id },
      }),
    });
    if (!res.ok) {
      throw new Error(`polar checkout failed: ${res.status} ${await res.text()}`);
    }
    const body = (await res.json()) as { id: string; url: string };
    return { kind: "redirect", url: body.url, externalId: body.id };
  },

  async getChargeStatus(payment: PaymentRef): Promise<PaymentStatus> {
    if (!payment.externalId) return payment.status;
    const res = await fetch(`${API}/v1/checkouts/${payment.externalId}`, {
      headers: { authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return payment.status;
    const body = (await res.json()) as { status?: string };
    return STATUS[body.status ?? ""] ?? payment.status;
  },

  async parseWebhook(req: FastifyRequest): Promise<ProviderEvent | null> {
    const raw = req.body;
    if (!Buffer.isBuffer(raw)) throw new WebhookVerificationError("raw body missing");
    verify(req, raw);

    const event = JSON.parse(raw.toString("utf8")) as {
      type?: string;
      data?: {
        id?: string;
        status?: string;
        amount?: number;
        currency?: string;
        metadata?: { reference?: string };
      };
    };

    // Only order events move money; subscription lifecycle events are noise here.
    if (!event.type?.startsWith("order.")) return null;
    const data = event.data;
    if (!data?.id) return null;

    const status = STATUS[data.status ?? ""] ?? (event.type === "order.paid" ? "paid" : null);
    if (!status) return null;

    return {
      externalId: data.id,
      reference: data.metadata?.reference,
      status,
      amountCents: typeof data.amount === "number" ? data.amount : undefined,
      currency: data.currency?.toUpperCase(),
    };
  },
};
