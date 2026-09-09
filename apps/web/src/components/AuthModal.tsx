import { useCallback, useId, useState } from "react";
import { ApiError } from "../api";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import type { UIKey } from "../i18n/ui";
import { GoogleButton } from "./GoogleButton";
import { Dialog } from "./ui/Dialog";
import { Icon } from "./ui/Icon";

/** API error codes mapped to the translated message shown under the form. */
const ERROR_KEY: Record<string, UIKey> = {
  invalid_email: "errInvalidEmail",
  weak_password: "errWeakPassword",
  missing_name: "errMissingName",
  email_taken: "errEmailTaken",
  bad_credentials: "errBadCredentials",
  bad_google_token: "errGoogle",
  google_email_unverified: "errGoogleUnverified",
  google_not_configured: "errGoogle",
  email_not_allowed: "errNotAllowed",
  password_login_disabled: "errPasswordDisabled",
};

export function AuthModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const { login, register, loginWithGoogle, googleClientId, passwordAuth } = useAuth();
  const id = useId();

  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<UIKey | null>(null);
  const [busy, setBusy] = useState(false);

  // Stable identities: GoogleButton re-renders its button when these change.
  const onCredential = useCallback(
    async (credential: string) => {
      setError(null);
      setBusy(true);
      try {
        await loginWithGoogle(credential);
        onClose();
      } catch (err) {
        const code = err instanceof ApiError ? err.code : "";
        setError(ERROR_KEY[code] ?? "errGoogle");
      } finally {
        setBusy(false);
      }
    },
    [loginWithGoogle, onClose],
  );

  const onGoogleError = useCallback(() => setError("errGoogle"), []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "in") await login(email, password);
      else await register(email, password, name);
      onClose();
    } catch (err) {
      const code = err instanceof ApiError ? err.code : "";
      setError(ERROR_KEY[code] ?? "errGeneric");
    } finally {
      setBusy(false);
    }
  };

  const invalid = error ? true : undefined;

  return (
    <Dialog title={mode === "in" ? t("welcomeBack") : t("createAccount")} onClose={onClose}>
      <form className="auth-form" onSubmit={submit}>
        <p className="auth-lead">{t("authRequired")}</p>

        {googleClientId && (
          <>
            <GoogleButton
              clientId={googleClientId}
              mode={mode}
              onCredential={onCredential}
              onError={onGoogleError}
            />
            {passwordAuth && (
              <div className="or-divider">
                <span>{t("orDivider")}</span>
              </div>
            )}
          </>
        )}

        {passwordAuth && (
          <>
            {mode === "up" && (
              <div className="field">
                <label className="field-label" htmlFor={`${id}-name`}>
                  {t("nameLabel")}
                </label>
                <input
                  id={`${id}-name`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  aria-invalid={invalid}
                  aria-describedby={error ? `${id}-err` : undefined}
                  required
                />
              </div>
            )}

            <div className="field">
              <label className="field-label" htmlFor={`${id}-email`}>
                {t("emailLabel")}
              </label>
              <input
                id={`${id}-email`}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                aria-invalid={invalid}
                aria-describedby={error ? `${id}-err` : undefined}
                required
              />
            </div>

            <div className="field">
              <label className="field-label" htmlFor={`${id}-password`}>
                {t("passwordLabel")}
              </label>
              <input
                id={`${id}-password`}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "in" ? "current-password" : "new-password"}
                aria-invalid={invalid}
                aria-describedby={
                  [mode === "up" ? `${id}-hint` : null, error ? `${id}-err` : null]
                    .filter(Boolean)
                    .join(" ") || undefined
                }
                required
              />
              {mode === "up" && (
                <p className="field-help" id={`${id}-hint`}>
                  {t("passwordHint")}
                </p>
              )}
            </div>
          </>
        )}

        {/* Nunca solo color: el error lleva icono y se anuncia. */}
        {error && (
          <p className="form-error" id={`${id}-err`} role="alert">
            <Icon name="alert-circle" size={18} />
            {t(error)}
          </p>
        )}

        {passwordAuth && (
          <>
            <button className={`btn primary lg block${busy ? " loading" : ""}`} disabled={busy}>
              {busy && <span className="btn-spinner" aria-hidden="true" />}
              <span>{mode === "in" ? t("signIn") : t("signUp")}</span>
            </button>

            <p className="auth-switch">
              {mode === "in" ? t("noAccount") : t("haveAccount")}{" "}
              <button
                type="button"
                className="linkish"
                onClick={() => {
                  setMode(mode === "in" ? "up" : "in");
                  setError(null);
                }}
              >
                {mode === "in" ? t("signUp") : t("signIn")}
              </button>
            </p>
          </>
        )}
      </form>
    </Dialog>
  );
}
