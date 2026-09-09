import { beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify, { type FastifyInstance } from "fastify";
import { OAuth2Client } from "google-auth-library";

import { prisma } from "./db.js";

// `beta.ts` y `auth.ts` leen el entorno al importarse, así que la beta tiene
// que estar encendida antes. Es también la razón de que esto sea un archivo
// aparte: `auth.test.ts` corre en otro proceso con la beta apagada.
process.env.JWT_SECRET = "test-secret";
process.env.GOOGLE_CLIENT_ID = "test-client-id";
process.env.CLOSED_BETA = "1";
process.env.ALLOWED_EMAILS = "Invitada@Ejemplo.BO, otro@ejemplo.bo";

const { registerAuth } = await import("./auth.js");

interface Row {
  id: string;
  email: string;
  name: string;
  passwordHash: string | null;
  googleId: string | null;
  avatarUrl: string | null;
}

let rows: Row[] = [];

const userStore = {
  async findUnique({ where }: { where: Partial<Pick<Row, "id" | "email" | "googleId">> }) {
    const [[key, value]] = Object.entries(where);
    if (value === undefined || value === null) return null;
    return rows.find((r) => r[key as keyof Row] === value) ?? null;
  },
  async create({ data }: { data: Partial<Row> }) {
    const row: Row = {
      id: `u${rows.length + 1}`,
      email: data.email!,
      name: data.name!,
      passwordHash: data.passwordHash ?? null,
      googleId: data.googleId ?? null,
      avatarUrl: data.avatarUrl ?? null,
    };
    rows.push(row);
    return { ...row };
  },
};

let googlePayload: Record<string, unknown> | null = null;

OAuth2Client.prototype.verifyIdToken = async () =>
  ({ getPayload: () => googlePayload }) as never;

async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });
  await registerAuth(app);
  await app.ready();
  return app;
}

const post = (app: FastifyInstance, url: string, payload: unknown) =>
  app.inject({ method: "POST", url, payload: payload as object });

const googleUser = (email: string) => ({
  sub: "google-123",
  email,
  email_verified: true,
  name: "Ana",
});

beforeEach(() => {
  rows = [];
  googlePayload = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (prisma as any).user = userStore;
});

describe("closed beta", () => {
  it("lets an invited email in, whatever case it was written in", async () => {
    const app = await buildApp();
    googlePayload = googleUser("invitada@ejemplo.bo");

    const res = await post(app, "/auth/google", { credential: "x" });
    assert.equal(res.statusCode, 200);
    assert.ok(res.json().token);
  });

  it("turns away an email that is not on the list, without creating an account", async () => {
    const app = await buildApp();
    googlePayload = googleUser("nadie@ejemplo.bo");

    const res = await post(app, "/auth/google", { credential: "x" });
    assert.equal(res.statusCode, 403);
    assert.equal(res.json().error, "email_not_allowed");
    assert.equal(rows.length, 0, "no debería quedar una cuenta fantasma");
  });

  it("checks the list on every sign-in, not just when the account is created", async () => {
    const app = await buildApp();
    rows.push({
      id: "u1",
      email: "fuera@ejemplo.bo",
      name: "Ana",
      passwordHash: null,
      googleId: "google-123",
      avatarUrl: null,
    });
    googlePayload = googleUser("fuera@ejemplo.bo");

    const res = await post(app, "/auth/google", { credential: "x" });
    assert.equal(res.statusCode, 403);
  });

  it("closes the password endpoints, which would be a way around the list", async () => {
    const app = await buildApp();
    for (const [url, payload] of [
      ["/auth/register", { email: "a@b.bo", password: "contrasena1", name: "Ana" }],
      ["/auth/login", { email: "a@b.bo", password: "contrasena1" }],
    ] as const) {
      const res = await post(app, url, payload);
      assert.equal(res.statusCode, 403, `${url} debería dar 403`);
      assert.equal(res.json().error, "password_login_disabled");
    }
  });

  it("tells the client the beta is on and the password form is not", async () => {
    const app = await buildApp();
    const res = await app.inject({ method: "GET", url: "/auth/config" });
    assert.deepEqual(res.json(), {
      googleClientId: "test-client-id",
      closedBeta: true,
      passwordAuth: false,
    });
  });
});
