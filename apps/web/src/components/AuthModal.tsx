import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../api";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import type { UIKey } from "../i18n/ui";
import { GoogleButton } from "./GoogleButton";

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
};

export function AuthModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const { login, register, loginWithGoogle, googleClientId } = useAuth();

  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<UIKey | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

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

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
        <form className="auth-form" onSubmit={submit}>
          <button type="button" className="modal-close" onClick={onClose} aria-label={t("close")}>
            ✕
          </button>

          <h2>{mode === "in" ? t("welcomeBack") : t("createAccount")}</h2>
          <p className="auth-lead">{t("authRequired")}</p>

          {googleClientId && (
            <>
              <GoogleButton
                clientId={googleClientId}
                mode={mode}
                onCredential={onCredential}
                onError={onGoogleError}
              />
              <div className="or-divider">
                <span>{t("orDivider")}</span>
              </div>
            </>
          )}

          {mode === "up" && (
            <label className="field">
              <span>{t("nameLabel")}</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </label>
          )}

          <label className="field">
            <span>{t("emailLabel")}</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className="field">
            <span>{t("passwordLabel")}</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "in" ? "current-password" : "new-password"}
              required
            />
            {mode === "up" && <small>{t("passwordHint")}</small>}
          </label>

          {error && <div className="form-error">{t(error)}</div>}

          <button className="btn primary block" disabled={busy}>
            {busy ? t("loading") : mode === "in" ? t("signIn") : t("signUp")}
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
        </form>
      </div>
    </div>
  );
}
