import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fastifyJwt from "@fastify/jwt";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "./db.js";
import { CLOSED_BETA, isAllowedEmail } from "./beta.js";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: string };
    user: { sub: string };
  }
}

/** Preflight hook for routes that need a signed-in user. */
export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify();
  } catch {
    return reply.code(401).send({ error: "unauthorized" });
  }
}

/** The authenticated user's id (only valid inside a requireAuth-guarded route). */
export const userId = (req: FastifyRequest) => req.user.sub;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** El nombre se enseña en cabeceras y saludos: sin tope, una vista se rompe. */
const NAME_MAX = 60;

// Google sign-in is optional: without GOOGLE_CLIENT_ID the endpoint is disabled
// and the web app hides the button.
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID?.trim() || null;
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

interface PublicUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  passwordHash: string | null;
}

/** Published in this repository, so it can only ever sign local sessions. */
const DEV_JWT_SECRET = "dev-secret-change-me";

/**
 * A deployment that loses JWT_SECRET used to come up signing with the value
 * above — which anyone can read here, and therefore use to mint a token for
 * any account. In production that is a boot failure now: the container exits
 * and the deploy is marked failed instead of quietly serving forgeable
 * sessions. `Dockerfile.render` is what sets NODE_ENV=production.
 */
function jwtSecret(app: FastifyInstance): string {
  const secret = process.env.JWT_SECRET?.trim() ?? "";

  if (process.env.NODE_ENV !== "production") {
    if (!secret) {
      app.log.warn("JWT_SECRET is unset: signing with the public development secret");
    }
    return secret || DEV_JWT_SECRET;
  }

  if (!secret) throw new Error("JWT_SECRET is required in production");
  if (secret === DEV_JWT_SECRET) {
    throw new Error("JWT_SECRET is the development secret published in the repository");
  }
  if (secret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters in production");
  }
  return secret;
}

export async function registerAuth(app: FastifyInstance) {
  await app.register(fastifyJwt, {
    secret: jwtSecret(app),
    sign: { expiresIn: "30d" },
  });

  const publicUser = (u: PublicUser) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    avatarUrl: u.avatarUrl,
    // Pista para la interfaz: decide si se enseña la entrada de administración.
    // La autorización de verdad la hace el servidor leyendo la columna.
    role: u.role,
    // Una cuenta creada con Google no tiene contraseña: los ajustes ofrecen
    // crearla en vez de pedir la actual, que no existe.
    hasPassword: u.passwordHash !== null,
  });

  const session = (u: PublicUser) => ({
    token: app.jwt.sign({ sub: u.id }),
    user: publicUser(u),
  });

  /**
   * What sign-in methods this deployment offers. Es también el interruptor de
   * la beta: el cliente lo lee al arrancar, así que abrir o cerrar el grifo no
   * pide reconstruir ni volver a desplegar el web.
   */
  app.get("/auth/config", async () => ({
    googleClientId: GOOGLE_CLIENT_ID,
    closedBeta: CLOSED_BETA,
    passwordAuth: !CLOSED_BETA,
  }));

  app.post<{ Body: { email?: string; password?: string; name?: string } }>(
    "/auth/register",
    async (req, reply) => {
      if (CLOSED_BETA) return reply.code(403).send({ error: "password_login_disabled" });

      const email = (req.body?.email ?? "").trim().toLowerCase();
      const password = req.body?.password ?? "";
      const name = (req.body?.name ?? "").trim();

      if (!EMAIL_RE.test(email)) return reply.code(400).send({ error: "invalid_email" });
      if (password.length < 8) return reply.code(400).send({ error: "weak_password" });
      if (!name) return reply.code(400).send({ error: "missing_name" });

      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists) return reply.code(409).send({ error: "email_taken" });

      const user = await prisma.user.create({
        data: { email, name, passwordHash: await bcrypt.hash(password, 10) },
      });
      return session(user);
    },
  );

  app.post<{ Body: { email?: string; password?: string } }>(
    "/auth/login",
    async (req, reply) => {
      if (CLOSED_BETA) return reply.code(403).send({ error: "password_login_disabled" });

      const email = (req.body?.email ?? "").trim().toLowerCase();
      const password = req.body?.password ?? "";

      const user = await prisma.user.findUnique({ where: { email } });
      // Same response for unknown email, Google-only account and wrong password.
      if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
        return reply.code(401).send({ error: "bad_credentials" });
      }
      return session(user);
    },
  );

  /**
   * Sign in with the ID token issued by Google Identity Services in the browser.
   * The token is verified against Google's public keys, so no client secret and
   * no redirect round-trip are involved.
   */
  app.post<{ Body: { credential?: string } }>("/auth/google", async (req, reply) => {
    if (!googleClient) return reply.code(503).send({ error: "google_not_configured" });

    const credential = req.body?.credential;
    if (!credential) return reply.code(400).send({ error: "missing_credential" });

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID!,
      });
      payload = ticket.getPayload();
    } catch (err) {
      req.log.warn({ err }, "google id token rejected");
      return reply.code(401).send({ error: "bad_google_token" });
    }

    // An unverified address must never be trusted — it is what account linking
    // below is keyed on.
    if (!payload?.sub || !payload.email || !payload.email_verified) {
      return reply.code(401).send({ error: "google_email_unverified" });
    }

    const googleId = payload.sub;
    const email = payload.email.toLowerCase();

    // Se comprueba en cada entrada, no sólo al crear la cuenta: así quitar a
    // alguien de ALLOWED_EMAILS le cierra la puerta en el siguiente acceso.
    if (!(await isAllowedEmail(email))) {
      req.log.info({ email }, "sign-in rejected: not on the closed-beta list");
      return reply.code(403).send({ error: "email_not_allowed" });
    }

    const avatarUrl = payload.picture ?? null;
    const name = payload.name || payload.given_name || email.split("@")[0];

    let user = await prisma.user.findUnique({ where: { googleId } });

    if (!user) {
      const byEmail = await prisma.user.findUnique({ where: { email } });
      user = byEmail
        ? // Google vouched for this address, so attaching it to the existing
          // password account is safe and avoids a duplicate profile.
          await prisma.user.update({
            where: { id: byEmail.id },
            data: { googleId, avatarUrl: byEmail.avatarUrl ?? avatarUrl },
          })
        : await prisma.user.create({ data: { email, name, googleId, avatarUrl } });
    }

    return session(user);
  });

  app.get("/auth/me", { preHandler: requireAuth }, async (req, reply) => {
    const user = await prisma.user.findUnique({ where: { id: userId(req) } });
    if (!user) return reply.code(401).send({ error: "unauthorized" });
    return publicUser(user);
  });

  /**
   * El nombre es lo único editable del perfil: cambiar el correo exige
   * verificarlo, y sin envío de correo no hay manera de hacerlo bien.
   */
  app.patch<{ Body: { name?: string } }>(
    "/auth/me",
    { preHandler: requireAuth },
    async (req, reply) => {
      const name = (req.body?.name ?? "").trim();
      if (!name) return reply.code(400).send({ error: "missing_name" });
      if (name.length > NAME_MAX) return reply.code(400).send({ error: "name_too_long" });

      const user = await prisma.user.update({ where: { id: userId(req) }, data: { name } });
      return publicUser(user);
    },
  );

  app.post<{ Body: { currentPassword?: string; newPassword?: string } }>(
    "/auth/password",
    { preHandler: requireAuth },
    async (req, reply) => {
      // Con la beta cerrada, la contraseña no abre ninguna puerta: crearla o
      // cambiarla sería fabricar una credencial muerta.
      if (CLOSED_BETA) return reply.code(403).send({ error: "password_login_disabled" });

      const user = await prisma.user.findUnique({ where: { id: userId(req) } });
      if (!user) return reply.code(401).send({ error: "unauthorized" });

      const newPassword = req.body?.newPassword ?? "";
      if (newPassword.length < 8) return reply.code(400).send({ error: "weak_password" });

      // Una cuenta de Google no tiene contraseña que pedir: aquí se crea la
      // primera, y quien la crea ya ha demostrado ser el dueño de la sesión.
      if (user.passwordHash) {
        const current = req.body?.currentPassword ?? "";
        if (!(await bcrypt.compare(current, user.passwordHash))) {
          return reply.code(401).send({ error: "bad_password" });
        }
      }

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: await bcrypt.hash(newPassword, 10) },
      });
      return publicUser(updated);
    },
  );

  /**
   * Borrado de cuenta. Los planes, las sesiones y la suscripción caen con ella
   * en cascada; los pagos no: su FK quedó anulable en el slice 4 justamente
   * para que el rastro contable sobreviva a la cuenta que lo generó.
   *
   * Los tokens ya emitidos duran 30 días y no se revocan, pero dejan de servir
   * solos: cada ruta autenticada busca al usuario y ya no está.
   */
  app.delete<{ Body: { password?: string; confirm?: string } }>(
    "/auth/account",
    { preHandler: requireAuth },
    async (req, reply) => {
      const user = await prisma.user.findUnique({ where: { id: userId(req) } });
      if (!user) return reply.code(401).send({ error: "unauthorized" });

      // El slice 5 exige la contraseña siempre que exista. Con la beta cerrada
      // se entra sólo por Google, así que quien tenga una de antes puede no
      // recordarla: ahí lo que demuestra intención es escribir el correo.
      if (user.passwordHash && !CLOSED_BETA) {
        const password = req.body?.password ?? "";
        if (!(await bcrypt.compare(password, user.passwordHash))) {
          return reply.code(401).send({ error: "bad_password" });
        }
      } else if ((req.body?.confirm ?? "").trim().toLowerCase() !== user.email) {
        // Sin contraseña que comprobar, lo que demuestra intención es escribir
        // la dirección de la cuenta.
        return reply.code(400).send({ error: "confirm_mismatch" });
      }

      await prisma.user.delete({ where: { id: user.id } });
      req.log.info({ account: user.id }, "account deleted");
      return reply.code(204).send();
    },
  );
}
