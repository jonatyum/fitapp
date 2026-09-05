import { useCallback, useEffect, useState } from "react";
import { ApiError, apiBillingPlans, apiCheckout, apiSubscription } from "../api";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import type { UIKey } from "../i18n/ui";
import type { BillingCatalog, ChargeInstructions, Subscription } from "../types";
import { Icon } from "./ui/Icon";
import { useToast } from "./ui/Toast";

/** Feature bullets per plan; the catalog only carries prices. */
const FEATURES: Record<string, UIKey[]> = {
  free: ["planFreeF1", "planFreeF2", "planFreeF3"],
  pro: ["planProF1", "planProF2", "planProF3"],
};

/** Instrucciones de transferencia más el importe ya formateado por la API. */
interface Charge {
  instructions: ChargeInstructions;
  amountLabel: string;
}

function CopyField({ label, value }: { label: string; value: string }) {
  const { t } = useI18n();
  const { toast } = useToast();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast(`${label}: ${t("payCopied")}`, "success");
    } catch {
      // El portapapeles está bloqueado en orígenes inseguros; el valor está
      // a la vista de todos modos.
    }
  };

  return (
    <div className="pay-field">
      <span className="pay-field-label">{label}</span>
      <span className="pay-field-value">{value}</span>
      <button className="btn secondary sm" onClick={copy} aria-label={`${t("payCopy")} ${label}`}>
        <Icon name="check" size={16} />
        {t("payCopy")}
      </button>
    </div>
  );
}

function TransferInstructions({ charge }: { charge: Charge }) {
  const { t } = useI18n();
  const { instructions, amountLabel } = charge;

  return (
    <section className="panel pay-panel">
      <h2 className="section-label">{t("payTitle")}</h2>

      <ol className="pay-steps">
        <li>{t("payStep1", { amount: amountLabel })}</li>
        <li>{t("payStep2", { ref: instructions.reference })}</li>
        <li>{t("payStep3", { contact: instructions.contact })}</li>
      </ol>

      {instructions.qrImageUrl && (
        <img className="pay-qr" src={instructions.qrImageUrl} alt={t("payTitle")} />
      )}

      <div className="pay-fields">
        {instructions.bankName && <CopyField label={t("payBank")} value={instructions.bankName} />}
        {instructions.accountName && (
          <CopyField label={t("payAccountName")} value={instructions.accountName} />
        )}
        <CopyField label={t("payAccountNumber")} value={instructions.accountNumber} />
        <CopyField label={t("payReference")} value={instructions.reference} />
        <CopyField label={t("payAmount")} value={amountLabel} />
        <CopyField label={t("payContact")} value={instructions.contact} />
      </div>
    </section>
  );
}

export function PlansView({ onSignIn }: { onSignIn: () => void }) {
  const { t, lang } = useI18n();
  const { user } = useAuth();

  const [catalog, setCatalog] = useState<BillingCatalog | null>(null);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [charge, setCharge] = useState<Charge | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<UIKey | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, s] = await Promise.all([
        apiBillingPlans(),
        user ? apiSubscription() : Promise.resolve(null),
      ]);
      setCatalog(c);
      setSub(s);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const start = async (planCode: string) => {
    if (!user) return onSignIn();
    setError(null);
    setBusy(true);
    try {
      const result = await apiCheckout(planCode);
      // A hosted checkout takes over the tab; a transfer renders in place.
      if (result.charge.kind === "redirect") window.location.href = result.charge.url;
      else
        setCharge({
          instructions: result.charge.instructions,
          // El importe ya viene formateado por la API; no lo recalculamos.
          amountLabel: result.payment.amountLabel,
        });
      await load();
    } catch (err) {
      const code = err instanceof ApiError ? err.code : "";
      setError(
        code === "no_payment_provider" || code === "provider_not_configured"
          ? "payNoProvider"
          : "payError",
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading)
    return (
      <p className="status" role="status">
        {t("loading")}
      </p>
    );
  if (!catalog) return <p className="status error">{t("loadError")}</p>;

  const dateFmt = new Intl.DateTimeFormat(lang, { day: "numeric", month: "long", year: "numeric" });
  const fmtDate = (iso: string) => dateFmt.format(new Date(iso));
  const canPay = catalog.providers.some((p) => p.enabled);
  const pending = sub?.pendingPayment ?? null;

  return (
    <div className="plans">
      <header className="plans-head">
        <h1>{t("plansTitle")}</h1>
        <p>{t("plansSubtitle")}</p>
      </header>

      {sub?.isPro && (
        <div className="sub-banner active">
          <span className="badge accent">
            <Icon name="sparkle" size={12} />
            {t("subActive")}
          </span>
          {sub.expiresAt && <span>{t("subRenewsOn", { date: fmtDate(sub.expiresAt) })}</span>}
        </div>
      )}

      {sub?.status === "expired" && (
        <div className="sub-banner">
          <span className="badge warning">
            <span className="badge-dot" />
            {t("subExpired")}
          </span>
          {sub.expiresAt && <span>{t("subExpiredOn", { date: fmtDate(sub.expiresAt) })}</span>}
        </div>
      )}

      {pending && !charge && (
        <div className="sub-banner">
          <span className="badge info">
            <span className="badge-dot" />
            {t("payPending")}
          </span>
          <span>{t("payPendingHint", { ref: pending.reference })}</span>
        </div>
      )}

      {error && (
        <p className="form-error" role="alert">
          <Icon name="alert-circle" size={18} />
          {t(error)}
        </p>
      )}
      {!canPay && !error && <p className="status">{t("payNoProvider")}</p>}

      <div className="plan-grid">
        {catalog.plans.map((plan) => {
          const isCurrent = (sub?.isPro ? "pro" : "free") === plan.code;
          const isPro = plan.code === "pro";
          return (
            <section key={plan.code} className={`card panel plan-card${isPro ? " featured" : ""}`}>
              <h2 className="plan-name">{t(isPro ? "planProName" : "planFreeName")}</h2>
              <div className="plan-price">
                {plan.amountLabel}
                {plan.periodDays > 0 && <em>{t("planPerMonth")}</em>}
              </div>
              <ul className="plan-features">
                {(FEATURES[plan.code] ?? []).map((k) => (
                  <li key={k}>
                    <Icon name="check" size={16} />
                    {t(k)}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <p className="plan-current">{t("planCurrent")}</p>
              ) : (
                isPro && (
                  <button
                    className={`btn primary lg block${busy ? " loading" : ""}`}
                    disabled={busy || !canPay}
                    aria-busy={busy}
                    onClick={() => start(plan.code)}
                  >
                    {busy && <span className="btn-spinner" aria-hidden="true" />}
                    <span>{sub?.status === "expired" ? t("subRenew") : t("planChoose")}</span>
                  </button>
                )
              )}
            </section>
          );
        })}
      </div>

      {charge && (
        <>
          <TransferInstructions charge={charge} />
          <button className="btn secondary block" onClick={() => setCharge(null)}>
            {t("payClose")}
          </button>
        </>
      )}
    </div>
  );
}

/** Shown in place of a Pro-only screen when the API answers 402. */
export function ProOnly({ onSeePlans }: { onSeePlans: () => void }) {
  const { t } = useI18n();
  return (
    <div className="empty locked">
      <Icon name="lock" size={48} className="empty-icon" />
      <span className="badge brand">{t("planProName")}</span>
      <h2>{t("proOnlyTitle")}</h2>
      <p>{t("proOnlyText")}</p>
      <button className="btn primary lg" onClick={onSeePlans}>
        {t("proSeePlans")}
      </button>
    </div>
  );
}
