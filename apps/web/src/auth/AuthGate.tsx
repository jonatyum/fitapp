import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { GateView } from "../components/GateView";
import { useI18n } from "../i18n/I18nContext";
import { LogoMark } from "../components/ui/Logo";

/**
 * Mientras la sesión y la configuración se resuelven no se puede pintar ni la
 * app ni la puerta: quien vuelve con sesión vería un parpadeo de "beta
 * cerrada", y con la beta apagada sería al revés. El logo no afirma ninguna de
 * las dos cosas.
 */
function Splash() {
  const { t } = useI18n();
  return (
    <div className="splash" role="status" aria-busy="true">
      <LogoMark size={48} />
      <span className="sr-only">{t("loading")}</span>
    </div>
  );
}

/**
 * El interruptor de la beta. Con `closedBeta` apagado no hace nada y vuelve
 * intacto el camino sin cuenta del slice 2.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { ready, user, closedBeta } = useAuth();

  if (!ready) return <Splash />;
  if (closedBeta && !user) return <GateView />;
  return <>{children}</>;
}
