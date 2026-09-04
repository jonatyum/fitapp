import { useCallback, useEffect, useState } from "react";
import { ApiError, apiBillingPlans, apiCheckout, apiSubscription } from "../api";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import type { UIKey } from "../i18n/ui";
import type { BillingCatalog, ChargeInstructions, Subscription } from "../types";

/** Feature bullets per plan; the catalog only carries prices. */
const FEATURES: Record<string, UIKey[]> = {
  free: ["planFreeF1", "planFreeF2", "planFreeF3"],
  pro: ["planProF1", "planProF2", "planProF3"],
};

/** Copy button that confirms in place instead of opening a toast. */
function CopyField({ label, value }: { label: string; value: string }) {
  const { t } = useI18n();
  const [done, setDone] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch {
      // Clipboard is blocked on insecure origins; the value is on screen anyway.
    }
  };

  return (
    <div className="pay-field">
      <span className="pay-field-label">{label}</span>
      <span className="pay-field-value">{value}</span>
      <button className="btn ghost small" onClick={copy}>
        {done ? t("payCopied") : t("payCopy")}
      </button>
    </div>
  );
}

function TransferInstructions({ instructions }: { instructions: ChargeInstructions }) {
  const { t } = useI18n();
  const amount = `${instructions.currency === "BOB" ? "Bs" : instructions.currency} ${(
    instructions.amountCents / 100
  ).toFixed(2)}`;

  return (
    <section className="panel pay-panel">
      <div className="section-label">{t("payTitle")}</div>

      <ol className="pay-steps">
        <li>{t("payStep1", { amount })}</li>
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
        <CopyField label={t("payAmount")} value={amount} />
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
  const [instructions, setInstructions] = useState<ChargeInstructions | null>(null);
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
      const { charge } = await apiCheckout(planCode);
      // A hosted checkout takes over the tab; a transfer renders in place.
      if (charge.kind === "redirect") window.location.href = charge.url;
      else setInstructions(charge.instructions);
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

  if (loading) return <div className="status">{t("loading")}</div>;
  if (!catalog) return <div className="status">{t("errGeneric")}</div>;

  const dateFmt = new Intl.DateTimeFormat(lang, { day: "numeric", month: "long", year: "numeric" });
  const fmtDate = (iso: string) => dateFmt.format(new Date(iso));
  const canPay = catalog.providers.some((p) => p.enabled);
  const pending = sub?.pendingPayment ?? null;

  return (
    <div className="plans">
      <header className="plans-head">
        <h2>{t("plansTitle")}</h2>
        <p>{t("plansSubtitle")}</p>
      </header>

      {sub?.isPro && (
        <div className="sub-banner active">
          <span className="badge accent">{t("subActive")}</span>
          {sub.expiresAt && <span>{t("subRenewsOn", { date: fmtDate(sub.expiresAt) })}</span>}
        </div>
      )}

      {sub?.status === "expired" && (
        <div className="sub-banner">
          <span className="badge soft">{t("subExpired")}</span>
          {sub.expiresAt && <span>{t("subExpiredOn", { date: fmtDate(sub.expiresAt) })}</span>}
        </div>
      )}

      {pending && !instructions && (
        <div className="sub-banner">
          <span className="badge soft">{t("payPending")}</span>
          <span>{t("payPendingHint", { ref: pending.reference })}</span>
        </div>
      )}

      {error && <div className="status error">{t(error)}</div>}
      {!canPay && !error && <div className="status">{t("payNoProvider")}</div>}

      <div className="plan-grid">
        {catalog.plans.map((plan) => {
          const isCurrent = (sub?.isPro ? "pro" : "free") === plan.code;
          const isPro = plan.code === "pro";
          return (
            <section key={plan.code} className={`panel plan-card${isPro ? " featured" : ""}`}>
              <div className="plan-name">{t(isPro ? "planProName" : "planFreeName")}</div>
              <div className="plan-price">
                {plan.amountLabel}
                {plan.periodDays > 0 && <em>{t("planPerMonth")}</em>}
              </div>
              <ul className="plan-features">
                {(FEATURES[plan.code] ?? []).map((k) => (
                  <li key={k}>{t(k)}</li>
                ))}
              </ul>
              {isCurrent ? (
                <div className="plan-current">{t("planCurrent")}</div>
              ) : (
                isPro && (
                  <button
                    className="btn primary block"
                    disabled={busy || !canPay}
                    onClick={() => start(plan.code)}
                  >
                    {sub?.status === "expired" ? t("subRenew") : t("planChoose")}
                  </button>
                )
              )}
            </section>
          );
        })}
      </div>

      {instructions && (
        <>
          <TransferInstructions instructions={instructions} />
          <button className="btn ghost block" onClick={() => setInstructions(null)}>
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
    <div className="empty">
      <div className="empty-icon">🔒</div>
      <h2>{t("proOnlyTitle")}</h2>
      <p>{t("proOnlyText")}</p>
      <button className="btn primary" onClick={onSeePlans}>
        {t("proSeePlans")}
      </button>
    </div>
  );
}
