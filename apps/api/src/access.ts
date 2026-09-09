import type { FastifyInstance } from "fastify";
import { requireAuth } from "./auth.js";
import { CLOSED_BETA } from "./beta.js";

/**
 * Lo único que responde sin sesión con la beta cerrada.
 *
 * `/media/*` se queda fuera a propósito: un `<img src>` no manda cabecera
 * `Authorization`, así que cerrarlo dejaría el catálogo entero sin imágenes.
 * Protegerlo de verdad pediría un token efímero en la query, que es trabajo
 * para cuando la licencia del dataset importe.
 *
 * El webhook de cobro tampoco puede llevar JWT —lo llama el proveedor, no un
 * navegador—: su guarda es la firma HMAC que ya comprueba.
 */
const PUBLIC_ROUTES = new Set([
  "/health",
  "/auth/config",
  "/auth/google",
  "/auth/register",
  "/auth/login",
  "/billing/webhook/:provider",
  "/media/*",
]);

/**
 * Cierra la API entera y deja pasar sólo lo de arriba.
 *
 * Va por hook global y no ruta a ruta porque el fallo que importa es el de
 * omisión: con `preHandler` en cada ruta, la que se añada mañana nace abierta
 * y nadie se entera —es justo como `/exercises` y `/billing/plans` acabaron
 * siendo públicas—, mientras que aquí nace cerrada y falla con un 401 ruidoso
 * en desarrollo.
 *
 * Tiene que registrarse antes que las rutas: en Fastify un hook de instancia
 * sólo alcanza a lo declarado después de él. Y después de CORS, cuyo propio
 * hook contesta el preflight antes de llegar aquí.
 */
export function registerAccessGuard(app: FastifyInstance) {
  if (!CLOSED_BETA) return;

  app.addHook("onRequest", async (req, reply) => {
    if (req.method === "OPTIONS") return;

    // El patrón declarado ("/exercises/:id"), no la URL pedida: comparar contra
    // `req.url` dejaría que un id con la forma adecuada se colara por la lista.
    const route = req.routeOptions?.url;
    if (route && PUBLIC_ROUTES.has(route)) return;

    return requireAuth(req, reply);
  });
}
