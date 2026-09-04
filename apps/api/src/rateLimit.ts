import type { FastifyInstance } from "fastify";
import rateLimit from "@fastify/rate-limit";

/**
 * Endpoints where an attacker can guess credentials or spam account creation.
 * They get a much tighter budget than the rest of the API.
 */
const AUTH_ROUTES = new Set(["/auth/login", "/auth/register", "/auth/google"]);

/** Static media (/media/*): one page of exercises pulls dozens of images. */
const MEDIA_PREFIX = "/media/";

/** Provider callbacks: they retry on failure and must not share a user bucket. */
const WEBHOOK_PREFIX = "/billing/webhook/";

const positiveInt = (value: string | undefined, fallback: number) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : fallback;
};

const windowOf = (value: string | undefined, fallback: string) => {
  const raw = value?.trim();
  return raw ? raw : fallback;
};

export async function registerRateLimit(app: FastifyInstance) {
  const globalLimit = {
    max: positiveInt(process.env.RATE_LIMIT_MAX, 300),
    timeWindow: windowOf(process.env.RATE_LIMIT_WINDOW, "1 minute"),
  };
  const authLimit = {
    max: positiveInt(process.env.AUTH_RATE_LIMIT_MAX, 8),
    timeWindow: windowOf(process.env.AUTH_RATE_LIMIT_WINDOW, "1 minute"),
  };
  const mediaLimit = {
    max: positiveInt(process.env.MEDIA_RATE_LIMIT_MAX, 1000),
    timeWindow: windowOf(process.env.MEDIA_RATE_LIMIT_WINDOW, "1 minute"),
  };
  const webhookLimit = {
    max: positiveInt(process.env.WEBHOOK_RATE_LIMIT_MAX, 120),
    timeWindow: windowOf(process.env.WEBHOOK_RATE_LIMIT_WINDOW, "1 minute"),
  };

  // Per-route limits are picked up by the plugin's own `onRoute` hook, which
  // reads `config.rateLimit`. onRoute hooks run in registration order, so this
  // one has to be added *before* the plugin is registered.
  app.addHook("onRoute", (route) => {
    if (route.config?.rateLimit !== undefined) return;
    const url = route.url;

    if (AUTH_ROUTES.has(url)) {
      route.config = { ...route.config, rateLimit: authLimit };
    } else if (url.startsWith(MEDIA_PREFIX)) {
      route.config = { ...route.config, rateLimit: mediaLimit };
    } else if (url.startsWith(WEBHOOK_PREFIX)) {
      route.config = { ...route.config, rateLimit: webhookLimit };
    } else if (url === "/health") {
      // Platform health checks poll this constantly; never throttle it.
      route.config = { ...route.config, rateLimit: false };
    }
  });

  await app.register(rateLimit, {
    global: true,
    ...globalLimit,
    // Same `{ error }` shape the rest of the API uses.
    errorResponseBuilder: (_req, context) => ({
      statusCode: 429,
      error: "rate_limited",
      message: `Too many requests, retry in ${context.after}.`,
    }),
  });

  app.log.info(
    { global: globalLimit, auth: authLimit, media: mediaLimit, webhook: webhookLimit },
    "rate limiting enabled",
  );
}

/**
 * Behind a reverse proxy (Render, a CDN) every request arrives from the proxy's
 * IP, which would make the per-IP limits one shared bucket. Setting this makes
 * Fastify derive `req.ip` from X-Forwarded-For instead.
 *
 * TRUST_PROXY: unset/"false" = off, "true" = trust the whole chain, anything
 * else = a comma-separated allow-list of trusted proxy IPs/CIDRs (or a
 * proxy-addr alias such as "loopback" / "uniquelocal").
 *
 * A hop count is deliberately not supported: Fastify fails closed on a numeric
 * `trustProxy` (it cannot validate the immediate peer), so accepting one here
 * would silently turn proxy trust off.
 */
export function trustProxyOption(): boolean | string {
  const raw = process.env.TRUST_PROXY?.trim();
  if (!raw || raw === "false") return false;
  if (raw === "true") return true;
  return raw;
}
