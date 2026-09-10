import { useCallback, useState } from "react";
import { ApiError } from "../api";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import type { UIKey } from "../i18n/ui";
import { GoogleButton } from "./GoogleButton";
import { LanguageMenu } from "./LanguageMenu";
import { Dialog } from "./ui/Dialog";
import { Icon } from "./ui/Icon";
import { LogoMark, Wordmark } from "./ui/Logo";
import { useTheme } from "../theme";

const ERROR_KEY: Record<string, UIKey> = {
  email_not_allowed: "errNotAllowed",
  bad_google_token: "errGoogle",
  google_email_unverified: "errGoogleUnverified",
  google_not_configured: "errGoogle",
};

/** Sin número configurado no hay botón: mejor sin salida que con una rota. */
const WHATSAPP = import.meta.env.VITE_INVITE_WHATSAPP?.trim() || "";

const FEATURES: {
  icon: "calendar" | "check-circle" | "flame";
  label: UIKey;
}[] = [
  { icon: "calendar", label: "gateFeaturePlan" },
  { icon: "check-circle", label: "gateFeatureLog" },
  { icon: "flame", label: "gateFeatureStreak" },
];

/**
 * La puerta de la beta cerrada: lo único que se pinta sin sesión mientras
 * `closedBeta` esté encendido.
 *
 * No es una ruta, es un estado del shell, y por eso conserva la URL: quien
 * abra /exercises desde un WhatsApp aterriza en Ejercicios al entrar, sin que
 * haga falta guardar a dónde iba.
 */
export function GateView() {
  const { t } = useI18n();
  const { theme, toggle } = useTheme();
  const { loginWithGoogle, googleClientId } = useAuth();

  const [error, setError] = useState<UIKey | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  const onCredential = useCallback(
    async (credential: string) => {
      setError(null);
      try {
        await loginWithGoogle(credential);
      } catch (err) {
        const code = err instanceof ApiError ? err.code : "";
        setError(ERROR_KEY[code] ?? "errGoogle");
      }
    },
    [loginWithGoogle],
  );

  const onGoogleError = useCallback(() => setError("errGoogle"), []);

  return (
    <div className="gate">
      <div className="gate-tools">
        <LanguageMenu />
        <button
          type="button"
          className="btn icon ghost"
          onClick={toggle}
          aria-label={t(theme === "dark" ? "themeToLight" : "themeToDark")}
        >
          <Icon name={theme === "dark" ? "sun" : "moon"} />
        </button>
      </div>

      <main className="gate-main">
        <span className="gate-brand">
          <LogoMark size={48} />
          <Wordmark />
        </span>

        <span className="gate-badge">
          <Icon name="lock" size={14} />
          {t("gateBadge")}
        </span>

        <h1 className="gate-title">{t("gateTitle")}</h1>
        <p className="gate-lead">{t("gateSubtitle")}</p>

        <div className="gate-cta">
          {googleClientId && (
            <GoogleButton
              clientId={googleClientId}
              mode="in"
              onCredential={onCredential}
              onError={onGoogleError}
            />
          )}
        </div>

        {error && (
          <p className="form-error" role="alert">
            <Icon name="alert-circle" size={16} />
            {t(error)}
          </p>
        )}

        <p className="gate-hint">{t("gateAccountHint")}</p>

        <button
          type="button"
          className="gate-help"
          onClick={() => setHelpOpen(true)}
        >
          {t("gateCantSignIn")}
        </button>

        <ul className="gate-features">
          {FEATURES.map((f) => (
            <li key={f.label}>
              <Icon name={f.icon} size={18} />
              {t(f.label)}
            </li>
          ))}
        </ul>

        <p className="gate-note">
          {t("gateDataNote")}{" "}
          {/* Página estática, fuera del router: tiene que poder leerse sin
              haber entrado, que es justo lo que la puerta impide. */}
          <a href="/privacy.html">{t("privacyLink")}</a>
        </p>
      </main>

      {helpOpen && (
        <Dialog title={t("noInviteTitle")} onClose={() => setHelpOpen(false)}>
          <p>{t("noInviteLead")}</p>
          <p>{t("noInviteBlocked")}</p>
          <p>{t("noInviteAccounts")}</p>
          {WHATSAPP && (
            <>
              <a
                className="btn primary lg block"
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(t("noInviteMessage"))}`}
                target="_blank"
                rel="noopener"
              >
                {t("noInviteAsk")}
              </a>
              <p className="gate-note">{t("noInviteAskHint")}</p>
            </>
          )}
        </Dialog>
      )}
    </div>
  );
}
