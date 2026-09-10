import type { FastifyInstance } from "fastify";
import { prisma } from "./db.js";
import { requireAuth, userId } from "./auth.js";
import { isRole, requireAdmin } from "./roles.js";
import { CLOSED_BETA, normalizeEmail } from "./beta.js";
import { entitlementOf } from "./billing/subscriptions.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  subscription: { planCode: string; status: string; startedAt: Date; expiresAt: Date | null } | null;
  _count: { routines: number; sessions: number };
}

/**
 * Lo que el panel ve de una cuenta. Ni el hash de la contraseña ni el id de
 * Google salen de aquí: administrar pagos no es motivo para exponer
 * credenciales.
 */
const publicAdminUser = (u: UserRow) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  role: u.role,
  createdAt: u.createdAt.toISOString(),
  entitlement: entitlementOf(u.subscription),
  routines: u._count.routines,
  sessions: u._count.sessions,
});

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  subscription: { select: { planCode: true, status: true, startedAt: true, expiresAt: true } },
  _count: { select: { routines: true, sessions: true } },
} as const;

export function registerAdmin(app: FastifyInstance) {
  const admin = { preHandler: [requireAuth, requireAdmin] };

  app.get<{ Querystring: { q?: string; limit?: string } }>("/admin/users", admin, async (req) => {
    const q = (req.query.q ?? "").trim();
    const take = Math.min(Number(req.query.limit) || 25, 100);

    const users = await prisma.user.findMany({
      where: q
        ? {
            OR: [
              { email: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      take,
      select: userSelect,
    });
    return users.map(publicAdminUser);
  });

  /**
   * Ascender o degradar. Nadie puede cambiar su propio rol: además de ser el
   * error más fácil de cometer, es lo que garantiza que nunca se llegue a cero
   * administradores — quien ejecuta el cambio siempre sigue siéndolo. Quedarse
   * sin ninguno sólo se arreglaría volviendo a desplegar con ADMIN_EMAILS.
   */
  app.patch<{ Params: { id: string }; Body: { role?: string } }>(
    "/admin/users/:id/role",
    admin,
    async (req, reply) => {
      const role = req.body?.role;
      if (!isRole(role)) return reply.code(400).send({ error: "invalid_role" });

      const actor = userId(req);
      if (req.params.id === actor) {
        return reply.code(409).send({ error: "cannot_change_own_role" });
      }

      const target = await prisma.user.findUnique({
        where: { id: req.params.id },
        select: { id: true, role: true },
      });
      if (!target) return reply.code(404).send({ error: "not_found" });

      const updated = await prisma.user.update({
        where: { id: target.id },
        data: { role },
        select: userSelect,
      });
      // El rastro de quién cambió qué vive en el log; no hay tabla de auditoría.
      req.log.info({ actor, target: target.id, from: target.role, to: role }, "role changed");
      return publicAdminUser(updated);
    },
  );

  // ── Accesos de la beta cerrada ──────────────────────────────────────────

  /**
   * La lista de invitados, con la cuenta ya creada si la hay. El panel enseña
   * quién entró y quién sigue sin aparecer, que es lo que dice si una
   * invitación sirvió de algo.
   */
  app.get("/admin/invites", admin, async () => {
    const invites = await prisma.allowedEmail.findMany({ orderBy: { createdAt: "desc" } });
    const users = await prisma.user.findMany({
      where: { email: { in: invites.map((i) => i.email) } },
      select: { email: true, name: true, createdAt: true },
    });
    const byEmail = new Map(users.map((u) => [u.email, u]));

    return {
      closedBeta: CLOSED_BETA,
      invites: invites.map((i) => ({
        email: i.email,
        invitedBy: i.invitedBy,
        createdAt: i.createdAt.toISOString(),
        signedUp: byEmail.get(i.email)?.createdAt.toISOString() ?? null,
        name: byEmail.get(i.email)?.name ?? null,
      })),
    };
  });

  app.post<{ Body: { email?: string } }>("/admin/invites", admin, async (req, reply) => {
    const email = normalizeEmail(req.body?.email ?? "");
    if (!EMAIL_RE.test(email)) return reply.code(400).send({ error: "invalid_email" });

    const exists = await prisma.allowedEmail.findUnique({ where: { email } });
    if (exists) return reply.code(409).send({ error: "already_invited" });

    const actor = await prisma.user.findUnique({
      where: { id: userId(req) },
      select: { email: true },
    });
    const invite = await prisma.allowedEmail.create({
      data: { email, invitedBy: actor?.email ?? null },
    });
    req.log.info({ actor: actor?.email, email }, "access granted");

    return reply.code(201).send({
      email: invite.email,
      invitedBy: invite.invitedBy,
      createdAt: invite.createdAt.toISOString(),
      signedUp: null,
      name: null,
    });
  });

  /**
   * Retirar un acceso no borra la cuenta ni sus datos: cierra la puerta en el
   * siguiente inicio de sesión. Un token ya emitido dura hasta 30 días.
   *
   * Nadie puede retirarse el suyo, por el mismo motivo que nadie puede
   * cambiarse el rol: es el error más fácil de cometer y el más caro.
   */
  app.delete<{ Params: { email: string } }>(
    "/admin/invites/:email",
    admin,
    async (req, reply) => {
      const email = normalizeEmail(decodeURIComponent(req.params.email));
      const actor = await prisma.user.findUnique({
        where: { id: userId(req) },
        select: { email: true },
      });
      if (actor?.email === email) {
        return reply.code(409).send({ error: "cannot_revoke_own_access" });
      }

      const deleted = await prisma.allowedEmail.deleteMany({ where: { email } });
      if (deleted.count === 0) return reply.code(404).send({ error: "not_found" });

      req.log.info({ actor: actor?.email, email }, "access revoked");
      return reply.code(204).send();
    },
  );
}
