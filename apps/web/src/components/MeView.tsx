import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import type { UIKey } from "../i18n/ui";
import { navigate } from "../router";
import { PATHS } from "../routes";
import { Icon, type IconName } from "./ui/Icon";

/** Cuarta pestaña: identidad y los destinos que salieron de la barra. */
const LINKS: { view: "progress" | "billing"; label: UIKey; icon: IconName }[] = [
  { view: "progress", label: "navProgress", icon: "chart" },
  { view: "billing", label: "navPlans", icon: "credit-card" },
];

export function MeView({ onSignIn }: { onSignIn: () => void }) {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const [broken, setBroken] = useState(false);

  const links = (
    <ul className="linklist">
      {LINKS.map((l) => (
        <li key={l.view}>
          <button className="linkrow" onClick={() => navigate(PATHS[l.view])}>
            <Icon name={l.icon} size={20} />
            <span>{t(l.label)}</span>
            <Icon name="chevron-right" size={18} className="linkrow-go" />
          </button>
        </li>
      ))}
    </ul>
  );

  if (!user) {
    return (
      <div className="me">
        <h1 className="sr-only">{t("navMe")}</h1>
        <div className="empty first-use">
          <Icon name="user" size={48} className="empty-icon" />
          <h2>{t("saveProgressTitle")}</h2>
          <p>{t("saveProgressText")}</p>
          <button className="btn primary lg" onClick={onSignIn}>
            {t("signIn")}
          </button>
        </div>
        {links}
      </div>
    );
  }

  return (
    <div className="me">
      {/* Administración no es una pestaña ni sale en ningún menú: se entra
          desde aquí, y sólo si el rol lo permite. */}
      <header className="me-head">
        <span className="avatar lg">
          {user.avatarUrl && !broken ? (
            <img
              src={user.avatarUrl}
              alt=""
              referrerPolicy="no-referrer"
              onError={() => setBroken(true)}
            />
          ) : (
            user.name.slice(0, 1).toUpperCase()
          )}
        </span>
        <div>
          <h1>{user.name}</h1>
          <p className="hint">{user.email}</p>
        </div>
      </header>

      {links}

      <ul className="linklist">
        <li>
          <button className="linkrow" onClick={() => navigate(PATHS.settings)}>
            <Icon name="settings" size={20} />
            <span>{t("settingsTitle")}</span>
            <Icon name="chevron-right" size={18} className="linkrow-go" />
          </button>
        </li>
      </ul>

      {user.role === "admin" && (
        <ul className="linklist">
          <li>
            <button className="linkrow" onClick={() => navigate(PATHS.admin)}>
              <Icon name="shield" size={20} />
              <span>{t("adminTitle")}</span>
              <Icon name="chevron-right" size={18} className="linkrow-go" />
            </button>
          </li>
        </ul>
      )}

      <button className="btn secondary block" onClick={logout}>
        <Icon name="logout" size={18} />
        {t("signOut")}
      </button>
    </div>
  );
}
