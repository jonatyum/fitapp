import { useI18n } from "../i18n/I18nContext";
import type { UIKey } from "../i18n/ui";
import { navigate } from "../router";
import { PATHS } from "../routes";
import { markSeen, type PaywallTrigger } from "../paywall";
import { Dialog } from "./ui/Dialog";
import { Icon } from "./ui/Icon";

const COPY: Record<PaywallTrigger, { title: UIKey; text: UIKey }> = {
  sessions: { title: "paywallSessionsTitle", text: "paywallSessionsText" },
  plans: { title: "paywallPlansTitle", text: "paywallPlansText" },
  streak: { title: "paywallStreakTitle", text: "paywallStreakText" },
};

/**
 * La oferta de Pro, en el momento en que el usuario acaba de ver que la app le
 * sirve. Se marca como vista al cerrarse, sea cual sea la salida: insistir con
 * el mismo argumento es lo que convierte una oferta en una molestia.
 */
export function PaywallDialog({
  trigger,
  onClose,
}: {
  trigger: PaywallTrigger;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const copy = COPY[trigger];

  const close = () => {
    markSeen(trigger);
    onClose();
  };

  return (
    <Dialog
      title={t(copy.title)}
      onClose={close}
      footer={
        <>
          <button className="btn ghost" onClick={close}>
            {t("paywallLater")}
          </button>
          <button
            className="btn primary"
            onClick={() => {
              close();
              navigate(PATHS.billing);
            }}
          >
            {t("proSeePlans")}
          </button>
        </>
      }
    >
      <div className="paywall">
        <span className="badge accent">
          <Icon name="sparkle" size={12} />
          {t("planProName")}
        </span>
        <p>{t(copy.text)}</p>
      </div>
    </Dialog>
  );
}
