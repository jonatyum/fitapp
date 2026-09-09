import { randomInt } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../db.js";
import { userId } from "../auth.js";
import { FREE, isProPlan, planByCode } from "./plans.js";

/** No I/O/0/1: a reference gets read out loud over the phone and WhatsApp. */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Short, unambiguous code the payer quotes in the transfer note. */
export const newReference = () =>
  `FIT-${Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("")}`;

export interface Entitlement {
  planCode: string;
  /** active | expired | cancelled | none (never subscribed) */
  status: string;
  isPro: boolean;
  startedAt: string | null;
  expiresAt: string | null;
}

const FREE_ENTITLEMENT: Entitlement = {
  planCode: FREE,
  status: "none",
  isPro: false,
  startedAt: null,
  expiresAt: null,
};

/**
 * What a user is currently allowed to do. No subscription row means free, so
 * accounts that existed before billing need no backfill.
 *
 * Expiry is evaluated on read rather than by a cron: on the free tier of Render
 * there is nothing to run a scheduler, and a stale `status` column would be a
 * silent way to hand out Pro for free.
 */
export async function entitlementFor(uid: string): Promise<Entitlement> {
  const sub = await prisma.subscription.findUnique({ where: { userId: uid } });
  if (!sub) return FREE_ENTITLEMENT;

  const expired = sub.expiresAt !== null && sub.expiresAt.getTime() <= Date.now();
  const status = sub.status === "active" && expired ? "expired" : sub.status;

  return {
    planCode: status === "active" ? sub.planCode : FREE,
    status,
    isPro: status === "active" && isProPlan(sub.planCode),
    startedAt: sub.startedAt.toISOString(),
    expiresAt: sub.expiresAt?.toISOString() ?? null,
  };
}

/**
 * Mark a payment paid and start or extend the subscription, atomically.
 *
 * Idempotent by construction: the status is moved with a conditional update
 * that only matches a row still waiting to be paid, so a redelivered webhook
 * or a double-clicked admin button changes nothing the second time and cannot
 * grant two periods.
 *
 * Renewal stacks from whichever is later — now, or the end of the period
 * already paid for — so paying early never burns the remaining days.
 */
export async function activateFromPayment(
  paymentId: string,
  opts: { confirmedBy?: string } = {},
): Promise<{ activated: boolean }> {
  return prisma.$transaction(async (tx) => {
    const { count } = await tx.payment.updateMany({
      where: { id: paymentId, status: { in: ["pending", "review"] } },
      data: { status: "paid", paidAt: new Date(), confirmedBy: opts.confirmedBy ?? null },
    });
    if (count === 0) return { activated: false };

    const payment = await tx.payment.findUniqueOrThrow({ where: { id: paymentId } });
    const plan = planByCode(payment.planCode);
    if (!plan) throw new Error(`unknown plan on payment ${payment.reference}`);

    const current = await tx.subscription.findUnique({ where: { userId: payment.userId } });
    const now = new Date();
    // Any Pro length stacks on any other: paying for a year while a month is
    // still running has to add to it, not throw the paid days away.
    const runningUntil =
      current?.expiresAt &&
      current.expiresAt > now &&
      isProPlan(current.planCode) &&
      isProPlan(payment.planCode)
        ? current.expiresAt
        : null;
    const base = runningUntil ?? now;
    const expiresAt =
      plan.periodDays > 0
        ? new Date(base.getTime() + plan.periodDays * 24 * 60 * 60 * 1000)
        : null;

    await tx.subscription.upsert({
      where: { userId: payment.userId },
      create: {
        userId: payment.userId,
        planCode: payment.planCode,
        status: "active",
        provider: payment.provider,
        startedAt: now,
        expiresAt,
      },
      update: {
        planCode: payment.planCode,
        status: "active",
        provider: payment.provider,
        expiresAt,
      },
    });

    return { activated: true };
  });
}

/**
 * Route guard for Pro-only endpoints. Runs after `requireAuth`, which is what
 * puts the user on the request:
 *
 *     app.get("/stats", { preHandler: [requireAuth, requirePro] }, ...)
 *
 * 402 rather than 403: the client can fix this by paying, and the web app keys
 * its upgrade prompt off that distinction.
 */
export async function requirePro(req: FastifyRequest, reply: FastifyReply) {
  const entitlement = await entitlementFor(userId(req));
  if (!entitlement.isPro) {
    return reply.code(402).send({ error: "pro_required", plan: entitlement.planCode });
  }
}
