import { useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import { navigate } from "../router";
import { PATHS } from "../routes";
import { Icon } from "./ui/Icon";

/**
 * El avatar abre un menú, no cierra la sesión de un toque: cerrar sesión sin
 * confirmación al pulsar el propio avatar era una trampa fácil de disparar.
 * Administración no está aquí a propósito: se entra desde "Yo" y sólo con el
 * rol, que es lo acordado para una ruta oculta.
 */
export function AccountMenu() {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [broken, setBroken] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;
  const initial = user.name.slice(0, 1).toUpperCase();

  return (
    <div className="menu" ref={box}>
      <button
        type="button"
        className="btn icon ghost"
        onClick={() => setOpen((o) => !o)}
        aria-label={t("account")}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="avatar sm">
          {/* Una URL de Google caducada dejaba un hueco; ahora cae a la inicial. */}
          {user.avatarUrl && !broken ? (
            <img
              src={user.avatarUrl}
              alt=""
              referrerPolicy="no-referrer"
              onError={() => setBroken(true)}
            />
          ) : (
            initial
          )}
        </span>
      </button>

      {open && (
        <div className="menu-panel" role="menu">
          <div className="menu-header">
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
          <button
            type="button"
            className="menu-item"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              navigate(PATHS.settings);
            }}
          >
            <Icon name="settings" size={18} />
            {t("settingsTitle")}
          </button>
          <button
            type="button"
            className="menu-item"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              logout();
            }}
          >
            <Icon name="logout" size={18} />
            {t("signOut")}
          </button>
        </div>
      )}
    </div>
  );
}
