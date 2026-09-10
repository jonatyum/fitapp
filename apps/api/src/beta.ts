/**
 * Beta cerrada: la app entera queda detrás de una sesión de Google, y sólo
 * entran los correos invitados.
 *
 * Es un interruptor, no un borrado. Con `CLOSED_BETA` apagado vuelve el camino
 * del slice 2 —plan completo sin cuenta en dos minutos— sin tocar una línea.
 */
import { prisma } from "./db.js";

export const CLOSED_BETA = /^(1|true|yes)$/i.test(process.env.CLOSED_BETA?.trim() ?? "");

/**
 * Semilla, no la lista. La lista vive en `allowed_emails` y se gestiona desde
 * el panel; esto es sólo lo que la rellena en cada arranque, igual que
 * `ADMIN_EMAILS` con los roles. Sin ella, una base nueva no dejaría entrar ni
 * a quien tiene que repartir los accesos.
 */
const SEED_ALLOWED = (process.env.ALLOWED_EMAILS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

/**
 * Siembra la lista con `ALLOWED_EMAILS` y con los administradores del entorno.
 * Nunca borra: quitar un acceso se hace desde el panel, y vaciar la variable
 * no puede dejar fuera a quien ya estaba.
 */
export async function seedAllowedEmails(adminEmails: string[]) {
  if (!CLOSED_BETA) return;

  // Quien administra tiene que poder entrar a repartir accesos, así que los
  // admins del entorno entran en la lista aunque nadie los invitara.
  const seed = [...new Set([...SEED_ALLOWED, ...adminEmails])];
  if (seed.length === 0) {
    console.log("[beta] no seed for the access list — the Google Cloud test-user list is the door");
    return;
  }

  const { count } = await prisma.allowedEmail.createMany({
    data: seed.map((email) => ({ email })),
    skipDuplicates: true,
  });
  console.log(`[beta] access list seeded: ${count} new of ${seed.length} address(es).`);
}

/**
 * Si este correo puede entrar hoy. Se consulta en cada acceso, no sólo al
 * crear la cuenta, así que retirar un acceso cierra la puerta en el siguiente.
 *
 * Dos salvavidas contra el bloqueo total, que es el fallo que dejaría el
 * producto inservible y sin nadie dentro capaz de arreglarlo:
 *  - un administrador entra siempre, esté o no en la lista;
 *  - una lista vacía no cierra la puerta, deja mandar a la lista de
 *    verificadores de Google Cloud, que es como arrancó la beta.
 */
export async function isAllowedEmail(email: string): Promise<boolean> {
  if (!CLOSED_BETA) return true;
  const value = normalizeEmail(email);

  const [invited, user] = await Promise.all([
    prisma.allowedEmail.findUnique({ where: { email: value } }),
    prisma.user.findUnique({ where: { email: value }, select: { role: true } }),
  ]);
  if (invited || user?.role === "admin") return true;

  return (await prisma.allowedEmail.count()) === 0;
}

/**
 * Una beta cerrada sin Google no deja entrar a nadie: el despliegue está roto
 * y es mejor que falle el arranque a que sirva una puerta que no abre. Fuera
 * de producción sólo se avisa, para no romper el desarrollo local de quien no
 * configura nada.
 */
export function assertBetaConfig(log: { warn: (msg: string) => void }) {
  if (!CLOSED_BETA) return;
  if (process.env.GOOGLE_CLIENT_ID?.trim()) return;

  const problem = "GOOGLE_CLIENT_ID is required when CLOSED_BETA is on (Google is the only way in)";
  if (process.env.NODE_ENV === "production") throw new Error(problem);
  log.warn(`[beta] ${problem}`);
}
