import { useState } from "react";
import { guideInvite, markGuideSeen } from "../guide";
import { useI18n } from "../i18n/I18nContext";
import { navigate } from "../router";
import { PATHS } from "../routes";
import { Icon } from "./ui/Icon";

/**
 * La invitación al recorrido, en Hoy. Se descarta y no vuelve.
 *
 * Va debajo del héroe y nunca encima: el minuto que tiene el usuario recién
 * llegado es para armar su plan, que es donde está el valor. Esto es una
 * oferta, no una puerta.
 */
export function GuideInvite() {
  const { t } = useI18n();
  const [kind, setKind] = useState(guideInvite);

  if (!kind) return null;

  const dismiss = () => {
    markGuideSeen();
    setKind(null);
  };

  return (
    <section className="card guide-invite">
      <h2 className="guide-invite-title">
        <Icon name="book" size={18} />
        {t(kind === "first" ? "guideInviteTitle" : "guideUpdatedTitle")}
      </h2>
      <p>{t(kind === "first" ? "guideInviteText" : "guideUpdatedText")}</p>
      <div className="guide-invite-actions">
        <button
          className="btn primary"
          onClick={() => {
            markGuideSeen();
            navigate(PATHS.guide);
          }}
        >
          {t("guideInviteCta")}
        </button>
        <button className="btn ghost" onClick={dismiss}>
          {t("guideInviteDismiss")}
        </button>
      </div>
    </section>
  );
}
