import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../db.js";
import { requireAuth, userId } from "../auth.js";
import { FREE, PLANS, formatAmount, planByCode } from "./plans.js";
import { defaultProvider, providerById, providerSummary } from "./providers.js";
import { activateFromPayment, entitlementFor, newReference } from "./subscriptions.js";
import { WebhookVerificationError, isProviderId, type Charge } from "./types.js";

/**
 * How long a bank transfer stays claimable before the queue drops it.
 * An unset variable arrives as "" through docker-compose, and Number("") is 0 —
 * which would expire every payment the instant it is created.
 */
const PENDING_HOURS = (() => {
  const n = Number(process.env.PAYMENT_PENDING_HOURS);
  return Number.isFinite(n) && n > 0 ? n : 72;
})();

/**
 * There is no role column on User: admins are an env allow-list checked against
 * the signed-in account. Empty list = nobody is an admin, which is the right
 * default for a deploy that forgot to set it.
 */
const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
);

async function requireAdmin(req: FastifyRequest, reply: FastifyReply) {
  const user = await prisma.user.findUnique({
    where: { id: userId(req) },
    select: { email: true },
  });
  if (!user || !ADMIN_EMAILS.has(user.email.toLowerCase())) {
    return reply.code(403).send({ error: "forbidden" });
  }
}

/** What the payer says they did. The admin still checks it against the bank. */
interface Declaration {
  operation: string;
  paidOn: string | null;
  bank: string | null;
  declaredAt: string;
}

const declarationOf = (metadata: unknown): Declaration | null => {
  const d = (metadata as { declaration?: Declaration } | null)?.declaration;
  return d && typeof d.operation === "string" ? d : null;
};

/**
 * A payment nobody has settled yet. A declared transfer has no deadline: the
 * payer did their part and the queue is ours now, so it must not go stale
 * under them.
 */
const claimable = () => ({
  status: { in: ["pending", "review"] },
  OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
});

/** Rows are internal; this is what the web app is allowed to see. */
const publicPayment = (p: {
  reference: string;
  planCode: string;
  provider: string;
  status: string;
  amountCents: number;
  currency: string;
  metadata: unknown;
  createdAt: Date;
  expiresAt: Date | null;
  paidAt: Date | null;
}) => ({
  reference: p.reference,
  planCode: p.planCode,
  provider: p.provider,
  status: p.status,
  amountCents: p.amountCents,
  currency: p.currency,
  amountLabel: formatAmount(p.amountCents, p.currency),
  declaration: declarationOf(p.metadata),
  createdAt: p.createdAt.toISOString(),
  expiresAt: p.expiresAt?.toISOString() ?? null,
  paidAt: p.paidAt?.toISOString() ?? null,
});

export async function registerBilling(app: FastifyInstance) {
  const auth = { preHandler: requireAuth };
  const admin = { preHandler: [requireAuth, requireAdmin] };

  /** The catalog plus which ways to pay this deployment actually offers. */
  app.get("/billing/plans", async () => ({
    plans: PLANS.map((p) => ({
      ...p,
      amountLabel: formatAmount(p.priceCents, p.currency),
    })),
    providers: providerSummary(),
  }));

  app.get("/billing/subscription", auth, async (req) => {
    const uid = userId(req);
    const [entitlement, pending] = await Promise.all([
      entitlementFor(uid),
      prisma.payment.findFirst({
        where: { userId: uid, ...claimable() },
        orderBy: { createdAt: "desc" },
      }),
    ]);
    return { ...entitlement, pendingPayment: pending ? publicPayment(pending) : null };
  });

  /**
   * Open a charge for a plan. Reuses a live pending payment for the same plan
   * and provider instead of minting a second reference — otherwise a user who
   * reloads the page ends up with a transfer quoting a code we have forgotten.
   */
  app.post<{ Body: { planCode?: string; provider?: string } }>(
    "/billing/checkout",
    auth,
    async (req, reply) => {
      const planCode = req.body?.planCode ?? "";
      const plan = planByCode(planCode);
      if (!plan || plan.code === FREE) {
        return reply.code(400).send({ error: "invalid_plan" });
      }

      const requested = req.body?.provider;
      if (requested !== undefined && !isProviderId(requested)) {
        return reply.code(400).send({ error: "invalid_provider" });
      }
      const provider = requested ? providerById(requested) : defaultProvider();
      if (!provider) return reply.code(503).send({ error: "no_payment_provider" });
      if (!provider.enabled) return reply.code(503).send({ error: "provider_not_configured" });

      const uid = userId(req);
      const user = await prisma.user.findUnique({ where: { id: uid } });
      if (!user) return reply.code(401).send({ error: "unauthorized" });

      const existing = await prisma.payment.findFirst({
        where: { userId: uid, planCode: plan.code, provider: provider.id, ...claimable() },
        orderBy: { createdAt: "desc" },
      });

      const payment =
        existing ??
        (await prisma.payment.create({
          data: {
            userId: uid,
            planCode: plan.code,
            provider: provider.id,
            reference: newReference(),
            status: "pending",
            amountCents: plan.priceCents,
            currency: plan.currency,
            expiresAt: new Date(Date.now() + PENDING_HOURS * 60 * 60 * 1000),
          },
        }));

      let charge: Charge;
      try {
        charge = await provider.createCharge({
          user: { id: user.id, email: user.email, name: user.name },
          plan,
          reference: payment.reference,
        });
      } catch (err) {
        req.log.error({ err, provider: provider.id }, "createCharge failed");
        return reply.code(502).send({ error: "provider_error" });
      }

      // A hosted checkout hands back the id every later webhook is keyed on.
      if (charge.kind === "redirect" && charge.externalId !== payment.externalId) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { externalId: charge.externalId, metadata: { url: charge.url } },
        });
      }

      return reply.code(existing ? 200 : 201).send({
        payment: publicPayment(payment),
        charge,
      });
    },
  );

  app.get("/billing/payments", auth, async (req) => {
    const rows = await prisma.payment.findMany({
      where: { userId: userId(req) },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return rows.map(publicPayment);
  });

  /** Poll a single payment; asks the provider when it has an API of its own. */
  app.get<{ Params: { reference: string } }>(
    "/billing/payments/:reference",
    auth,
    async (req, reply) => {
      const payment = await prisma.payment.findFirst({
        where: { reference: req.params.reference, userId: userId(req) },
      });
      if (!payment) return reply.code(404).send({ error: "not_found" });

      const provider = providerById(payment.provider);
      if (provider?.enabled && payment.status === "pending") {
        const status = await provider
          .getChargeStatus({
            reference: payment.reference,
            externalId: payment.externalId,
            status: "pending",
          })
          .catch(() => "pending" as const);
        if (status === "paid") await activateFromPayment(payment.id);
        else if (status !== "pending") {
          await prisma.payment.updateMany({
            where: { id: payment.id, status: "pending" },
            data: { status },
          });
        }
      }

      const fresh = await prisma.payment.findUniqueOrThrow({ where: { id: payment.id } });
      return publicPayment(fresh);
    },
  );

  /**
   * "I already transferred". Stores the operation number the bank gave the
   * payer and moves the row to `review`.
   *
   * It deliberately does not mark anything paid: proof of payment is the bank
   * statement, not a number typed into a form. What this buys is that the
   * receipt stops travelling through WhatsApp and the payer can see that their
   * claim landed.
   */
  app.post<{
    Params: { reference: string };
    Body: { operation?: string; paidOn?: string; bank?: string };
  }>("/billing/payments/:reference/declare", auth, async (req, reply) => {
    const operation = (req.body?.operation ?? "").trim();
    if (operation.length < 3 || operation.length > 64) {
      return reply.code(400).send({ error: "invalid_operation" });
    }
    const paidOn = (req.body?.paidOn ?? "").trim();
    if (paidOn && !/^\d{4}-\d{2}-\d{2}$/.test(paidOn)) {
      return reply.code(400).send({ error: "invalid_paid_on" });
    }
    const bank = (req.body?.bank ?? "").trim().slice(0, 64);

    const payment = await prisma.payment.findFirst({
      where: { reference: req.params.reference, userId: userId(req) },
    });
    if (!payment) return reply.code(404).send({ error: "not_found" });
    if (payment.status !== "pending" && payment.status !== "review") {
      return reply.code(409).send({ error: "not_claimable" });
    }

    const previous =
      typeof payment.metadata === "object" && payment.metadata !== null && !Array.isArray(payment.metadata)
        ? payment.metadata
        : {};

    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "review",
        expiresAt: null,
        metadata: {
          ...previous,
          declaration: {
            operation,
            paidOn: paidOn || null,
            bank: bank || null,
            declaredAt: new Date().toISOString(),
          },
        },
      },
    });
    return publicPayment(updated);
  });

  // ── Webhooks ──────────────────────────────────────────────────────────────
  // Encapsulated so the raw-body parser applies here and nowhere else: a
  // signature has to be checked over the exact bytes received, and the global
  // JSON parser would have already thrown them away.
  await app.register(async (webhooks) => {
    webhooks.addContentTypeParser(
      "application/json",
      { parseAs: "buffer" },
      (_req, body, done) => done(null, body),
    );

    webhooks.post<{ Params: { provider: string } }>(
      "/billing/webhook/:provider",
      async (req, reply) => {
        const provider = providerById(req.params.provider);
        if (!provider?.enabled) return reply.code(404).send({ error: "unknown_provider" });

        let event;
        try {
          event = await provider.parseWebhook(req);
        } catch (err) {
          if (err instanceof WebhookVerificationError) {
            req.log.warn({ err, provider: provider.id }, "webhook rejected");
            return reply.code(400).send({ error: "bad_signature" });
          }
          throw err;
        }
        // 200 on anything we simply do not act on, so the provider stops retrying.
        if (!event) return { ok: true };

        const payment = await prisma.payment.findFirst({
          where: event.reference
            ? { reference: event.reference, provider: provider.id }
            : { externalId: event.externalId, provider: provider.id },
        });
        if (!payment) {
          req.log.warn({ event, provider: provider.id }, "webhook for unknown payment");
          return { ok: true };
        }

        if (event.status === "paid") {
          await activateFromPayment(payment.id);
        } else if (event.status !== "pending") {
          await prisma.payment.updateMany({
            where: { id: payment.id, status: "pending" },
            data: { status: event.status },
          });
        }
        return { ok: true };
      },
    );
  });

  // ── Admin: the manual-qr confirmation queue ───────────────────────────────

  app.get<{ Querystring: { status?: string } }>("/admin/payments", admin, async (req) => {
    // Default queue = everything still waiting on us, declared or not.
    const status = req.query.status;
    const rows = await prisma.payment.findMany({
      where: status ? { status } : { status: { in: ["pending", "review"] } },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { email: true, name: true } } },
    });
    return rows.map((p) => ({ ...publicPayment(p), user: p.user }));
  });

  /** Confirm a transfer that landed in the account and start the period. */
  app.post<{ Params: { reference: string } }>(
    "/admin/payments/:reference/confirm",
    admin,
    async (req, reply) => {
      const payment = await prisma.payment.findUnique({
        where: { reference: req.params.reference },
      });
      if (!payment) return reply.code(404).send({ error: "not_found" });

      const me = await prisma.user.findUniqueOrThrow({
        where: { id: userId(req) },
        select: { email: true },
      });
      const { activated } = await activateFromPayment(payment.id, { confirmedBy: me.email });
      if (!activated) return reply.code(409).send({ error: "not_pending" });

      const [fresh, entitlement] = await Promise.all([
        prisma.payment.findUniqueOrThrow({ where: { id: payment.id } }),
        entitlementFor(payment.userId),
      ]);
      return { payment: publicPayment(fresh), subscription: entitlement };
    },
  );

  app.post<{ Params: { reference: string } }>(
    "/admin/payments/:reference/reject",
    admin,
    async (req, reply) => {
      const { count } = await prisma.payment.updateMany({
        where: { reference: req.params.reference, status: { in: ["pending", "review"] } },
        data: { status: "failed" },
      });
      if (!count) return reply.code(409).send({ error: "not_pending" });
      return { ok: true };
    },
  );
}
