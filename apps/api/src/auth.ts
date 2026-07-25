import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fastifyJwt from "@fastify/jwt";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "./db.js";

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

// Google sign-in is optional: without GOOGLE_CLIENT_ID the endpoint is disabled
// and the web app hides the button.
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID?.trim() || null;
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

interface PublicUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

export async function registerAuth(app: FastifyInstance) {
  await app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET ?? "dev-secret-change-me",
    sign: { expiresIn: "30d" },
  });

  const publicUser = (u: PublicUser) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    avatarUrl: u.avatarUrl,
  });

  const session = (u: PublicUser) => ({
    token: app.jwt.sign({ sub: u.id }),
    user: publicUser(u),
  });

  /** What sign-in methods this deployment offers. */
  app.get("/auth/config", async () => ({ googleClientId: GOOGLE_CLIENT_ID }));

  app.post<{ Body: { email?: string; password?: string; name?: string } }>(
    "/auth/register",
    async (req, reply) => {
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
}
