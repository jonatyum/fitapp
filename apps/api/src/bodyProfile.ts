import type { FastifyInstance } from "fastify";
import { requireAuth, userId } from "./auth.js";
import { prisma } from "./db.js";

interface BodyProfileBody {
  sex?: string | null;
  age?: number | null;
  heightCm?: number | null;
  weightKg?: number | null;
  neckCm?: number | null;
  waistCm?: number | null;
  hipCm?: number | null;
  restingHr?: number | null;
  bodyFatPct?: number | null;
}

/**
 * Los rangos son los mismos que valida la web. Aquí se repiten porque el
 * cliente no es una garantía: un `PUT` a mano con una altura de 3 metros
 * dejaría el perfil envenenado para siempre.
 */
const RANGE = {
  age: [14, 100],
  heightCm: [120, 230],
  weightKg: [30, 300],
  neckCm: [20, 80],
  waistCm: [40, 200],
  hipCm: [50, 200],
  restingHr: [30, 110],
  bodyFatPct: [3, 70],
} as const;

type NumericField = keyof typeof RANGE;

const INTEGER_FIELDS: NumericField[] = ["age", "restingHr"];

function numeric(value: unknown, field: NumericField): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  const [min, max] = RANGE[field];
  if (value < min || value > max) return undefined;
  return INTEGER_FIELDS.includes(field) ? Math.round(value) : value;
}

/** Deja fuera lo que no se entiende en vez de rechazar el cuerpo entero. */
function sanitize(body: BodyProfileBody) {
  const sex = body.sex === "female" || body.sex === "male" ? body.sex : body.sex === null ? null : undefined;
  const fields = Object.fromEntries(
    (Object.keys(RANGE) as NumericField[])
      .map((field) => [field, numeric(body[field], field)])
      .filter(([, value]) => value !== undefined),
  );
  return sex === undefined ? fields : { ...fields, sex };
}

export function registerBodyProfile(app: FastifyInstance) {
  const auth = { preHandler: requireAuth };

  app.get("/me/body-profile", auth, async (req) => {
    const row = await prisma.bodyProfile.findUnique({ where: { userId: userId(req) } });
    return row ?? null;
  });

  /**
   * Un `upsert` y no un `patch`: el cliente manda el perfil entero, que es lo
   * que tiene en el dispositivo, y borrar un dato es mandarlo en `null`.
   */
  app.put<{ Body: BodyProfileBody }>("/me/body-profile", auth, async (req) => {
    const data = sanitize(req.body ?? {});
    const id = userId(req);
    return prisma.bodyProfile.upsert({
      where: { userId: id },
      create: { userId: id, ...data },
      update: data,
    });
  });

  app.delete("/me/body-profile", auth, async (req, reply) => {
    await prisma.bodyProfile.deleteMany({ where: { userId: userId(req) } });
    return reply.code(204).send();
  });
}
