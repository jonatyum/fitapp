import { beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify, { type FastifyInstance } from "fastify";
import { OAuth2Client } from "google-auth-library";

import { prisma } from "./db.js";

// Both are read at module scope by auth.ts, so they have to be in place before
// it is imported — hence the dynamic import below.
process.env.JWT_SECRET = "test-secret";
process.env.GOOGLE_CLIENT_ID = "test-client-id";

const { registerAuth } = await import("./auth.js");

// ── in-memory stand-ins ─────────────────────────────────────────────────────

interface Row {
  id: string;
  email: string;
  name: string;
  passwordHash: string | null;
  googleId: string | null;
  avatarUrl: string | null;
}

let rows: Row[] = [];
let nextId = 1;

/** The slice of `prisma.user` that auth.ts actually calls. */
const userStore = {
  async findUnique({ where }: { where: Partial<Pick<Row, "id" | "email" | "googleId">> }) {
    const [[key, value]] = Object.entries(where);
    // A null googleId must never match a lookup by googleId, the way a unique
    // index behaves — otherwise every password account would look linked.
    if (value === undefined || value === null) return null;
    return rows.find((r) => r[key as keyof Row] === value) ?? null;
  },
  async create({ data }: { data: Partial<Row> }) {
    const row: Row = {
      id: `u${nextId++}`,
      email: data.email!,
      name: data.name!,
      passwordHash: data.passwordHash ?? null,
      googleId: data.googleId ?? null,
      avatarUrl: data.avatarUrl ?? null,
    };
    rows.push(row);
    return { ...row };
  },
  async update({ where, data }: { where: { id: string }; data: Partial<Row> }) {
    const row = rows.find((r) => r.id === where.id)!;
    Object.assign(row, data);
    return { ...row };
  },
};

/** Payload the stubbed Google verifier will return, or an error to throw. */
let googlePayload: Record<string, unknown> | null = null;
let googleThrows = false;

OAuth2Client.prototype.verifyIdToken = async () => {
  if (googleThrows) throw new Error("invalid token");
  return { getPayload: () => googlePayload } as never;
};

async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });
  await registerAuth(app);
  await app.ready();
  return app;
}

const post = (app: FastifyInstance, url: string, payload: unknown) =>
  app.inject({ method: "POST", url, payload: payload as object });

const REGISTER = { email: "Ana@Ejemplo.BO", password: "contrasena1", name: "Ana" };

beforeEach(() => {
  rows = [];
  nextId = 1;
  googlePayload = null;
  googleThrows = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (prisma as any).user = userStore;
});

// ── registration ────────────────────────────────────────────────────────────

describe("POST /auth/register", () => {
  it("creates an account and returns a session", async () => {
    const app = await buildApp();
    const res = await post(app, "/auth/register", REGISTER);
    assert.equal(res.statusCode, 200);

    const body = res.json();
    assert.ok(body.token, "debería devolver un token");
    assert.equal(body.user.name, "Ana");
    assert.equal(body.user.id, "u1");
  });

  it("normalises the email to lowercase so it cannot be registered twice", async () => {
    const app = await buildApp();
    await post(app, "/auth/register", REGISTER);
    assert.equal(rows[0].email, "ana@ejemplo.bo");

    const dup = await post(app, "/auth/register", { ...REGISTER, email: "ana@ejemplo.bo" });
    assert.equal(dup.statusCode, 409);
    assert.equal(dup.json().error, "email_taken");
    assert.equal(rows.length, 1);
  });

  it("never leaks the password hash", async () => {
    const app = await buildApp();
    const res = await post(app, "/auth/register", REGISTER);
    assert.ok(!("passwordHash" in res.json().user));
    assert.ok(!res.body.includes("$2"), "el hash de bcrypt no debe viajar al cliente");
  });

  it("stores the password hashed, never in clear", async () => {
    const app = await buildApp();
    await post(app, "/auth/register", REGISTER);
    assert.notEqual(rows[0].passwordHash, REGISTER.password);
    assert.match(rows[0].passwordHash!, /^\$2[aby]\$/);
  });

  it("rejects bad input before touching the database", async () => {
    const app = await buildApp();
    const cases: [Record<string, string>, string][] = [
      [{ ...REGISTER, email: "no-es-un-correo" }, "invalid_email"],
      [{ ...REGISTER, email: "sin@dominio" }, "invalid_email"],
      [{ ...REGISTER, password: "corta" }, "weak_password"],
      [{ ...REGISTER, name: "   " }, "missing_name"],
    ];
    for (const [payload, error] of cases) {
      const res = await post(app, "/auth/register", payload);
      assert.equal(res.statusCode, 400, `${error} debería dar 400`);
      assert.equal(res.json().error, error);
    }
    assert.equal(rows.length, 0, "no debería haber creado ninguna cuenta");
  });

  it("rejects a body with no fields at all", async () => {
    const app = await buildApp();
    const res = await post(app, "/auth/register", {});
    assert.equal(res.statusCode, 400);
  });
});

// ── login ───────────────────────────────────────────────────────────────────

describe("POST /auth/login", () => {
  it("returns a session for the right password", async () => {
    const app = await buildApp();
    await post(app, "/auth/register", REGISTER);

    const res = await post(app, "/auth/login", {
      email: "ana@ejemplo.bo",
      password: REGISTER.password,
    });
    assert.equal(res.statusCode, 200);
    assert.equal(res.json().user.email, "ana@ejemplo.bo");
  });

  it("accepts the email in any casing", async () => {
    const app = await buildApp();
    await post(app, "/auth/register", REGISTER);
    const res = await post(app, "/auth/login", {
      email: "  ANA@Ejemplo.bo  ",
      password: REGISTER.password,
    });
    assert.equal(res.statusCode, 200);
  });

  /**
   * The three ways to fail must be indistinguishable, or the endpoint becomes
   * an account-enumeration oracle: an attacker could tell a registered address
   * from an unknown one, and spot which accounts are Google-only.
   */
  it("answers identically for unknown email, wrong password and Google-only account", async () => {
    const app = await buildApp();
    await post(app, "/auth/register", REGISTER);
    // A Google-only account: exists, but has no password to compare against.
    await userStore.create({
      data: { email: "google@ejemplo.bo", name: "G", googleId: "g-1" },
    });

    const attempts = await Promise.all([
      post(app, "/auth/login", { email: "nadie@ejemplo.bo", password: "contrasena1" }),
      post(app, "/auth/login", { email: "ana@ejemplo.bo", password: "equivocada1" }),
      post(app, "/auth/login", { email: "google@ejemplo.bo", password: "contrasena1" }),
    ]);

    for (const res of attempts) assert.equal(res.statusCode, 401);
    const [a, b, c] = attempts.map((r) => r.body);
    assert.equal(a, b);
    assert.equal(b, c);
    assert.equal(JSON.parse(a).error, "bad_credentials");
  });

  it("rejects an empty password against a real account", async () => {
    const app = await buildApp();
    await post(app, "/auth/register", REGISTER);
    const res = await post(app, "/auth/login", { email: "ana@ejemplo.bo" });
    assert.equal(res.statusCode, 401);
  });
});

// ── Google sign-in ──────────────────────────────────────────────────────────

const GOOGLE_OK = {
  sub: "google-sub-1",
  email: "Ana@Ejemplo.BO",
  email_verified: true,
  name: "Ana G",
  picture: "https://example.test/a.png",
};

describe("POST /auth/google", () => {
  it("creates an account the first time", async () => {
    const app = await buildApp();
    googlePayload = GOOGLE_OK;

    const res = await post(app, "/auth/google", { credential: "tok" });
    assert.equal(res.statusCode, 200);
    assert.equal(res.json().user.email, "ana@ejemplo.bo");
    assert.equal(rows[0].googleId, "google-sub-1");
    assert.equal(rows[0].avatarUrl, GOOGLE_OK.picture);
    assert.equal(rows[0].passwordHash, null, "una cuenta de Google no tiene contraseña");
  });

  it("reuses the account on a second sign-in instead of duplicating it", async () => {
    const app = await buildApp();
    googlePayload = GOOGLE_OK;

    const first = await post(app, "/auth/google", { credential: "tok" });
    const second = await post(app, "/auth/google", { credential: "tok" });
    assert.equal(first.json().user.id, second.json().user.id);
    assert.equal(rows.length, 1);
  });

  it("links Google to an existing password account with the same email", async () => {
    const app = await buildApp();
    await post(app, "/auth/register", REGISTER);
    const passwordAccountId = rows[0].id;
    const hash = rows[0].passwordHash;

    googlePayload = GOOGLE_OK;
    const res = await post(app, "/auth/google", { credential: "tok" });

    assert.equal(res.statusCode, 200);
    assert.equal(rows.length, 1, "no debe crear un perfil duplicado");
    assert.equal(res.json().user.id, passwordAccountId);
    assert.equal(rows[0].googleId, "google-sub-1");
    assert.equal(rows[0].passwordHash, hash, "vincular no debe tocar la contraseña");
  });

  it("keeps an avatar the account already had", async () => {
    const app = await buildApp();
    await userStore.create({
      data: {
        email: "ana@ejemplo.bo",
        name: "Ana",
        passwordHash: "x",
        avatarUrl: "https://example.test/propio.png",
      },
    });

    googlePayload = GOOGLE_OK;
    await post(app, "/auth/google", { credential: "tok" });
    assert.equal(rows[0].avatarUrl, "https://example.test/propio.png");
  });

  it("adopts Google's avatar when the account had none", async () => {
    const app = await buildApp();
    await post(app, "/auth/register", REGISTER);
    googlePayload = GOOGLE_OK;
    await post(app, "/auth/google", { credential: "tok" });
    assert.equal(rows[0].avatarUrl, GOOGLE_OK.picture);
  });

  it("refuses an unverified Google address", async () => {
    const app = await buildApp();
    googlePayload = { ...GOOGLE_OK, email_verified: false };

    const res = await post(app, "/auth/google", { credential: "tok" });
    assert.equal(res.statusCode, 401);
    assert.equal(res.json().error, "google_email_unverified");
    assert.equal(rows.length, 0, "no debe crear cuenta a partir de un correo sin verificar");
  });

  it("refuses a token Google will not vouch for", async () => {
    const app = await buildApp();
    googleThrows = true;

    const res = await post(app, "/auth/google", { credential: "falso" });
    assert.equal(res.statusCode, 401);
    assert.equal(res.json().error, "bad_google_token");
    assert.equal(rows.length, 0);
  });

  it("requires a credential", async () => {
    const app = await buildApp();
    const res = await post(app, "/auth/google", {});
    assert.equal(res.statusCode, 400);
    assert.equal(res.json().error, "missing_credential");
  });

  it("falls back through the name fields Google may omit", async () => {
    const app = await buildApp();
    googlePayload = { ...GOOGLE_OK, name: undefined, given_name: "Ana" };
    await post(app, "/auth/google", { credential: "tok" });
    assert.equal(rows[0].name, "Ana");

    rows = [];
    googlePayload = { ...GOOGLE_OK, name: undefined, given_name: undefined };
    await post(app, "/auth/google", { credential: "tok" });
    assert.equal(rows[0].name, "ana", "sin nombre, usa la parte local del correo");
  });
});

// ── session ─────────────────────────────────────────────────────────────────

describe("GET /auth/me", () => {
  it("returns the signed-in user", async () => {
    const app = await buildApp();
    const { token } = (await post(app, "/auth/register", REGISTER)).json();

    const res = await app.inject({
      method: "GET",
      url: "/auth/me",
      headers: { authorization: `Bearer ${token}` },
    });
    assert.equal(res.statusCode, 200);
    assert.equal(res.json().email, "ana@ejemplo.bo");
    assert.ok(!("passwordHash" in res.json()));
  });

  it("rejects a missing, malformed or forged token", async () => {
    const app = await buildApp();
    for (const headers of [
      {},
      { authorization: "Bearer " },
      { authorization: "Bearer no.es.un.jwt" },
    ]) {
      const res = await app.inject({ method: "GET", url: "/auth/me", headers });
      assert.equal(res.statusCode, 401, `${JSON.stringify(headers)} debería dar 401`);
      assert.equal(res.json().error, "unauthorized");
    }
  });

  it("rejects a token whose user no longer exists", async () => {
    const app = await buildApp();
    const { token } = (await post(app, "/auth/register", REGISTER)).json();
    rows = [];

    const res = await app.inject({
      method: "GET",
      url: "/auth/me",
      headers: { authorization: `Bearer ${token}` },
    });
    assert.equal(res.statusCode, 401);
  });
});

describe("GET /auth/config", () => {
  it("advertises the Google client id the deployment is configured with", async () => {
    const app = await buildApp();
    const res = await app.inject({ method: "GET", url: "/auth/config" });
    assert.equal(res.statusCode, 200);
    assert.equal(res.json().googleClientId, "test-client-id");
  });
});
