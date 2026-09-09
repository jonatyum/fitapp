/**
 * Beta cerrada: la app entera queda detrás de una sesión de Google, y sólo
 * entran los correos invitados a mano.
 *
 * Es un interruptor, no un borrado. Con `CLOSED_BETA` apagado vuelve el camino
 * del slice 2 —plan completo sin cuenta en dos minutos— sin tocar una línea.
 */

export const CLOSED_BETA = /^(1|true|yes)$/i.test(process.env.CLOSED_BETA?.trim() ?? "");

/**
 * Segunda puerta, opcional. Vacía —el default— manda la lista de verificadores
 * de Google Cloud y sólo ella: es un único sitio que mantener, que es como se
 * decidió llevar la beta.
 *
 * Rellenarla añade un cerrojo que Google no puede abrir por su cuenta. Importa
 * porque pasar la pantalla de consentimiento a "In production" es un botón de
 * una consola, sin PR ni revisión, y abriría el registro a cualquier cuenta de
 * Google en el mismo segundo.
 */
const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export const isAllowedEmail = (email: string) =>
  !CLOSED_BETA ||
  ALLOWED_EMAILS.length === 0 ||
  ALLOWED_EMAILS.includes(email.trim().toLowerCase());

/**
 * Una beta cerrada sin Google no deja entrar a nadie: el despliegue está roto
 * y es mejor que falle el arranque a que sirva una puerta que no abre. Fuera
 * de producción sólo se avisa, para no romper el desarrollo local de quien no
 * configura nada.
 */
export function assertBetaConfig(log: { warn: (msg: string) => void }) {
  if (!CLOSED_BETA) return;

  if (ALLOWED_EMAILS.length === 0) {
    // Queda dicho en el arranque porque es la diferencia entre estar cerrado y
    // creerlo: publicar la pantalla de consentimiento abriría el registro sin
    // tocar este despliegue.
    log.warn("[beta] ALLOWED_EMAILS is empty: the Google Cloud test-user list is the only door");
  }
  if (process.env.GOOGLE_CLIENT_ID?.trim()) return;

  const problem = "GOOGLE_CLIENT_ID is required when CLOSED_BETA is on (Google is the only way in)";
  if (process.env.NODE_ENV === "production") throw new Error(problem);
  log.warn(`[beta] ${problem}`);
}
