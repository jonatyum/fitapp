/**
 * Beta cerrada: la app entera queda detrás de una sesión de Google, y sólo
 * entran los correos invitados a mano.
 *
 * Es un interruptor, no un borrado. Con `CLOSED_BETA` apagado vuelve el camino
 * del slice 2 —plan completo sin cuenta en dos minutos— sin tocar una línea.
 */

export const CLOSED_BETA = /^(1|true|yes)$/i.test(process.env.CLOSED_BETA?.trim() ?? "");

/**
 * La lista de verificadores de Google Cloud no vale como autorización: pasar
 * la pantalla de consentimiento a "In production" es un botón de una consola,
 * sin PR ni revisión, y abriría el registro a cualquier cuenta de Google en el
 * mismo segundo. Google dice quién es alguien; quién entra lo decide Chamani.
 */
const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export const isAllowedEmail = (email: string) =>
  !CLOSED_BETA || ALLOWED_EMAILS.includes(email.trim().toLowerCase());

/**
 * Una beta cerrada sin lista no deja entrar a nadie, y una sin Google tampoco:
 * en ambos casos el despliegue está roto y es mejor que falle el arranque a
 * que sirva una puerta que no abre. Fuera de producción sólo se avisa, para no
 * romper el desarrollo local de quien no configura nada.
 */
export function assertBetaConfig(log: { warn: (msg: string) => void }) {
  if (!CLOSED_BETA) return;

  const problems: string[] = [];
  if (!process.env.GOOGLE_CLIENT_ID?.trim()) {
    problems.push("GOOGLE_CLIENT_ID is required when CLOSED_BETA is on (Google is the only way in)");
  }
  if (ALLOWED_EMAILS.length === 0) {
    problems.push("ALLOWED_EMAILS is empty: nobody would be able to sign in");
  }
  if (problems.length === 0) return;

  if (process.env.NODE_ENV === "production") throw new Error(problems.join("; "));
  for (const p of problems) log.warn(`[beta] ${p}`);
}
