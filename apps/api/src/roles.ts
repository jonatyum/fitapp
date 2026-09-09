import type { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "./db.js";
import { userId } from "./auth.js";

export const ROLES = ["client", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const isRole = (v: unknown): v is Role => ROLES.includes(v as Role);

/**
 * Correos que arrancan como admin. Dejó de ser la guarda —eso es la columna
 * `role`— y pasó a ser sólo la semilla: una base nueva no tiene a nadie capaz
 * de ascender a nadie, así que el primer admin tiene que venir del entorno.
 * Lista vacía = nadie, que es el default correcto para un deploy que la olvidó.
 */
const BOOTSTRAP_ADMINS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

/**
 * Asciende a los correos de `ADMIN_EMAILS`. Nunca degrada: quitar el rol se
 * hace desde el panel, y borrar la variable no puede dejar el sistema sin
 * administradores por accidente.
 */
export async function seedAdmins() {
  if (BOOTSTRAP_ADMINS.length === 0) {
    console.log("[seed] ADMIN_EMAILS is empty — no admin was promoted.");
    return;
  }
  const { count } = await prisma.user.updateMany({
    where: { email: { in: BOOTSTRAP_ADMINS }, role: { not: "admin" } },
    data: { role: "admin" },
  });
  console.log(`[seed] ${count} account(s) promoted to admin from ADMIN_EMAILS.`);
}

/**
 * El rol se lee de la base en cada petición, no del token. Con `expiresIn:
 * "30d"` y sin revocación, meterlo en el JWT significaría que degradar a un
 * admin le deja el rol hasta que su token caduque.
 */
export async function roleOf(uid: string): Promise<Role> {
  const user = await prisma.user.findUnique({ where: { id: uid }, select: { role: true } });
  return isRole(user?.role) ? user.role : "client";
}

/** Runs after `requireAuth`, which is what puts the user on the request. */
export async function requireAdmin(req: FastifyRequest, reply: FastifyReply) {
  if ((await roleOf(userId(req))) !== "admin") {
    return reply.code(403).send({ error: "forbidden" });
  }
}
