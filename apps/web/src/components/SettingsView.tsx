import { useId, useState } from "react";
import { ApiError } from "../api";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import { LANGS } from "../i18n/languages";
import type { UIKey } from "../i18n/ui";
import { navigate } from "../router";
import { PATHS } from "../routes";
import { useTheme } from "../theme";
import type { User } from "../types";
import { Dialog } from "./ui/Dialog";
import { Icon } from "./ui/Icon";
import { Toggle } from "./ui/Toggle";
import { useToast } from "./ui/Toast";

const ERROR_KEY: Record<string, UIKey> = {
  missing_name: "errMissingName",
  name_too_long: "errNameTooLong",
  weak_password: "errWeakPassword",
  bad_password: "errBadPassword",
  confirm_mismatch: "errConfirmMismatch",
};

const errorKey = (err: unknown): UIKey =>
  (err instanceof ApiError ? ERROR_KEY[err.code] : undefined) ?? "errGeneric";

function FormError({ id, error }: { id: string; error: UIKey }) {
  const { t } = useI18n();
  return (
    <p className="form-error" id={id} role="alert">
      <Icon name="alert-circle" size={18} />
      {t(error)}
    </p>
  );
}

function ProfileSection({ user }: { user: User }) {
  const { t } = useI18n();
  const { updateName } = useAuth();
  const { toast } = useToast();
  const id = useId();

  const [name, setName] = useState(user.name);
  const [error, setError] = useState<UIKey | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await updateName(name.trim());
      toast(t("settingsProfileSaved"), "success");
    } catch (err) {
      setError(errorKey(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel">
      <h2 className="section-label">{t("settingsProfile")}</h2>

      <form className="settings-form" onSubmit={submit}>
        <div className="field">
          <label className="field-label" htmlFor={`${id}-name`}>
            {t("nameLabel")}
          </label>
          <input
            id={`${id}-name`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            maxLength={60}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-err` : undefined}
            required
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor={`${id}-email`}>
            {t("emailLabel")}
          </label>
          <input id={`${id}-email`} value={user.email} readOnly aria-describedby={`${id}-mail`} />
          <p className="field-help" id={`${id}-mail`}>
            {t("settingsEmailFixed")}
          </p>
        </div>

        {error && <FormError id={`${id}-err`} error={error} />}

        <div className="settings-actions">
          <button
            className={`btn primary${busy ? " loading" : ""}`}
            disabled={busy || name.trim() === user.name || name.trim() === ""}
          >
            {busy && <span className="btn-spinner" aria-hidden="true" />}
            <span>{t("save")}</span>
          </button>
        </div>
      </form>
    </section>
  );
}

function PreferencesSection() {
  const { t, lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();
  const id = useId();

  return (
    <section className="panel">
      <h2 className="section-label">{t("settingsPrefs")}</h2>

      <div className="settings-row">
        <span id={`${id}-lang`}>{t("language")}</span>
        <div className="viewswitch" role="group" aria-labelledby={`${id}-lang`}>
          {LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              className="switch-opt"
              aria-pressed={l.code === lang}
              onClick={() => setLang(l.code)}
            >
              {l.name}
            </button>
          ))}
        </div>
      </div>

      <Toggle
        block
        label={t("settingsDarkTheme")}
        checked={theme === "dark"}
        onChange={(on) => setTheme(on ? "dark" : "light")}
      />

      <p className="hint">{t("settingsPrefsHint")}</p>
    </section>
  );
}

function PasswordSection({ user }: { user: User }) {
  const { t } = useI18n();
  const { changePassword } = useAuth();
  const { toast } = useToast();
  const id = useId();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [error, setError] = useState<UIKey | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await changePassword({
        ...(user.hasPassword ? { currentPassword: current } : {}),
        newPassword: next,
      });
      setCurrent("");
      setNext("");
      toast(t("settingsPasswordSaved"), "success");
    } catch (err) {
      setError(errorKey(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel">
      <h2 className="section-label">{t("settingsSecurity")}</h2>

      <form className="settings-form" onSubmit={submit}>
        {user.hasPassword ? (
          <div className="field">
            <label className="field-label" htmlFor={`${id}-current`}>
              {t("settingsCurrentPassword")}
            </label>
            <input
              id={`${id}-current`}
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              autoComplete="current-password"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-err` : undefined}
              required
            />
          </div>
        ) : (
          <p className="hint">{t("settingsPasswordCreateHint")}</p>
        )}

        <div className="field">
          <label className="field-label" htmlFor={`${id}-next`}>
            {t("settingsNewPassword")}
          </label>
          <input
            id={`${id}-next`}
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
            aria-invalid={error ? true : undefined}
            aria-describedby={[`${id}-hint`, error ? `${id}-err` : null]
              .filter(Boolean)
              .join(" ")}
            required
          />
          <p className="field-help" id={`${id}-hint`}>
            {t("passwordHint")}
          </p>
        </div>

        {error && <FormError id={`${id}-err`} error={error} />}

        <div className="settings-actions">
          <button className={`btn primary${busy ? " loading" : ""}`} disabled={busy}>
            {busy && <span className="btn-spinner" aria-hidden="true" />}
            <span>
              {user.hasPassword ? t("settingsPasswordChange") : t("settingsPasswordCreate")}
            </span>
          </button>
        </div>
      </form>
    </section>
  );
}

/**
 * Borrar de verdad, no esconder. Lo que se conserva es el pago —sin nombre— y
 * eso se dice aquí, que es donde el usuario decide.
 */
function DeleteAccountDialog({ user, onClose }: { user: User; onClose: () => void }) {
  const { t } = useI18n();
  const { deleteAccount } = useAuth();
  const { toast } = useToast();
  const id = useId();

  const [value, setValue] = useState("");
  const [error, setError] = useState<UIKey | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await deleteAccount(user.hasPassword ? { password: value } : { confirm: value });
      navigate(PATHS.today);
      toast(t("settingsDeleted"), "info");
    } catch (err) {
      setError(errorKey(err));
      setBusy(false);
    }
  };

  return (
    <Dialog
      title={t("settingsDeleteTitle")}
      onClose={onClose}
      dismissible={false}
      footer={
        <>
          <button type="button" className="btn secondary" onClick={onClose} disabled={busy}>
            {t("cancel")}
          </button>
          <button
            type="submit"
            form={`${id}-form`}
            className={`btn danger${busy ? " loading" : ""}`}
            disabled={busy || value.trim() === ""}
          >
            {busy && <span className="btn-spinner" aria-hidden="true" />}
            <span>{t("settingsDeleteConfirm")}</span>
          </button>
        </>
      }
    >
      <form id={`${id}-form`} className="settings-form" onSubmit={submit}>
        <p>{t("settingsDeleteLead")}</p>
        <p className="hint">{t("settingsDeleteKeeps")}</p>

        <div className="field">
          <label className="field-label" htmlFor={`${id}-confirm`}>
            {user.hasPassword
              ? t("settingsDeleteByPassword")
              : t("settingsDeleteByEmail", { email: user.email })}
          </label>
          <input
            id={`${id}-confirm`}
            type={user.hasPassword ? "password" : "text"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoComplete={user.hasPassword ? "current-password" : "off"}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-err` : undefined}
            required
          />
        </div>

        {error && <FormError id={`${id}-err`} error={error} />}
      </form>
    </Dialog>
  );
}

export function SettingsView() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [confirming, setConfirming] = useState(false);

  // La guarda de App devuelve a "Yo" a quien no tenga sesión; esto sólo cubre
  // el fotograma que va entre el cierre de sesión y la redirección.
  if (!user) return null;

  return (
    <div className="settings">
      <h1>{t("settingsTitle")}</h1>

      <ProfileSection user={user} />
      <PreferencesSection />
      <PasswordSection user={user} />

      <section className="panel danger-zone">
        <h2 className="section-label">{t("settingsDangerTitle")}</h2>
        <p className="hint">{t("settingsDangerText")}</p>
        <div className="settings-actions">
          <button className="btn danger-ghost" onClick={() => setConfirming(true)}>
            <Icon name="trash" size={18} />
            {t("settingsDeleteCta")}
          </button>
        </div>
      </section>

      {confirming && <DeleteAccountDialog user={user} onClose={() => setConfirming(false)} />}
    </div>
  );
}
