import type { FastifyInstance } from "fastify";
import { prisma } from "./db.js";
import { requireAuth, userId } from "./auth.js";
import { isRole, requireAdmin } from "./roles.js";
import { entitlementOf } from "./billing/subscriptions.js";

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
}
