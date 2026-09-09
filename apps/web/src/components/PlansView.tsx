import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ApiError,
  apiBillingPlans,
  apiCheckout,
  apiDeclarePayment,
  apiSubscription,
} from "../api";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import type { UIKey } from "../i18n/ui";
import type { BillingCatalog, ChargeInstructions, Payment, Plan, Subscription } from "../types";
import { Dialog } from "./ui/Dialog";
import { Icon } from "./ui/Icon";
import { useToast } from "./ui/Toast";

/** Feature bullets per tier; the catalog only carries prices. */
const FEATURES: Record<"free" | "pro", UIKey[]> = {
  free: ["planFreeF1", "planFreeF2", "planFreeF3"],
  pro: ["planProF1", "planProF2", "planProF3"],
};

/** El plan libre es el único sin periodo; todo lo demás es Pro. */
const isProPlan = (plan: Plan) => plan.periodDays > 0;

const PERIOD_LABEL: Record<number, UIKey> = {
  30: "planPeriodMonth",
  90: "planPeriodQuarter",
  365: "planPeriodYear",
};

const PER_PERIOD: Record<number, UIKey> = {
  30: "planPerMonth",
  90: "planPerQuarter",
  365: "planPerYear",
};

/**
 * Sólo para el equivalente mensual, que no es un plan y por tanto no viene
 * formateado por la API. Redondeado a bolivianos enteros: es una comparación,
 * no un importe a pagar.
 */
const perMonth = (plan: Plan) =>
  `${plan.currency === "BOB" ? "Bs" : plan.currency} ${Math.round(
    plan.priceCents / 100 / (plan.periodDays / 30),
  )}`;

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
        <li>{t("payStep3")}</li>
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
        {instructions.contact && (
          <CopyField label={t("payContact")} value={instructions.contact} />
        )}
      </div>
    </section>
  );
}

/**
 * "Ya transferí". El comprobante que da el banco es un número de operación, y
 * eso es lo que se pide: la prueba de que el dinero entró es el extracto, no
 * un formulario, así que esto no activa nada — pone el pago en revisión.
 */
function DeclareDialog({
  payment,
  onDeclared,
  onClose,
}: {
  payment: Payment;
  onDeclared: (payment: Payment) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const id = "declare";

  const [operation, setOperation] = useState("");
  const [paidOn, setPaidOn] = useState(() => new Date().toISOString().slice(0, 10));
  const [bank, setBank] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<UIKey | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operation.trim()) {
      setError("errOperation");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      onDeclared(
        await apiDeclarePayment(payment.reference, {
          operation: operation.trim(),
          paidOn,
          bank: bank.trim(),
        }),
      );
    } catch {
      setError("errDeclare");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog title={t("payDeclareTitle")} onClose={onClose}>
      <form className="auth-form" onSubmit={submit}>
        <p className="auth-lead">{t("payDeclareLead")}</p>

        <div className="field">
          <label className="field-label" htmlFor={`${id}-op`}>
            {t("payOperation")}
          </label>
          <input
            id={`${id}-op`}
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
            inputMode="numeric"
            aria-invalid={error === "errOperation" ? true : undefined}
            aria-describedby={`${id}-hint`}
            required
          />
          <p className="field-help" id={`${id}-hint`}>
            {t("payOperationHint")}
          </p>
        </div>

        <div className="field">
          <label className="field-label" htmlFor={`${id}-date`}>
            {t("payPaidOn")}
          </label>
          <input
            id={`${id}-date`}
            type="date"
            value={paidOn}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setPaidOn(e.target.value)}
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor={`${id}-bank`}>
            {t("payBankOptional")}
          </label>
          <input id={`${id}-bank`} value={bank} onChange={(e) => setBank(e.target.value)} />
        </div>

        {error && (
          <p className="form-error" role="alert">
            <Icon name="alert-circle" size={18} />
            {t(error)}
          </p>
        )}

        <button className={`btn primary lg block${busy ? " loading" : ""}`} disabled={busy}>
          {busy && <span className="btn-spinner" aria-hidden="true" />}
          <span>{t("payDeclareSend")}</span>
        </button>
      </form>
    </Dialog>
  );
}

export function PlansView({ onSignIn }: { onSignIn: () => void }) {
  const { t, lang } = useI18n();
  const { user } = useAuth();

  const [catalog, setCatalog] = useState<BillingCatalog | null>(null);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [charge, setCharge] = useState<Charge | null>(null);
  const [declaring, setDeclaring] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<UIKey | null>(null);
  /** código del plan Pro elegido: mensual, trimestral o anual */
  const [period, setPeriod] = useState("pro");

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

  const free = catalog?.plans.find((p) => !isProPlan(p)) ?? null;
  const proPlans = useMemo(
    () => (catalog?.plans ?? []).filter(isProPlan).sort((a, b) => a.periodDays - b.periodDays),
    [catalog],
  );
  const pro = proPlans.find((p) => p.code === period) ?? proPlans[0] ?? null;

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
      <>
        <h1 className="sr-only">{t("plansTitle")}</h1>
        <p className="status" role="status">
          {t("loading")}
        </p>
      </>
    );
  if (!catalog || !pro || !free)
    return (
      <>
        <h1 className="sr-only">{t("plansTitle")}</h1>
        <p className="status error">{t("loadError")}</p>
      </>
    );

  const dateFmt = new Intl.DateTimeFormat(lang, { day: "numeric", month: "long", year: "numeric" });
  const fmtDate = (iso: string) => dateFmt.format(new Date(iso));
  const canPay = catalog.providers.some((p) => p.enabled);
  const pending = sub?.pendingPayment ?? null;

  const monthly = proPlans[0];
  const saving = Math.round(
    (1 - pro.priceCents / pro.periodDays / (monthly.priceCents / monthly.periodDays)) * 100,
  );

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

      {pending && pending.status === "review" && (
        <div className="sub-banner">
          <span className="badge success">
            <Icon name="check-circle" size={12} />
            {t("payReview")}
          </span>
          <span>{t("payReviewHint", { op: pending.declaration?.operation ?? "" })}</span>
        </div>
      )}

      {pending && pending.status === "pending" && (
        <div className="sub-banner">
          <span className="badge info">
            <span className="badge-dot" />
            {t("payPending")}
          </span>
          <span>{t("payPendingHint", { ref: pending.reference })}</span>
          <div className="sub-banner-actions">
            {!charge && (
              <button
                className="btn secondary"
                onClick={() => start(pending.planCode)}
                disabled={busy}
              >
                {t("payTitle")}
              </button>
            )}
            <button className="btn primary" onClick={() => setDeclaring(pending)}>
              {t("payDeclareCta")}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="form-error" role="alert">
          <Icon name="alert-circle" size={18} />
          {t(error)}
        </p>
      )}
      {!canPay && !error && <p className="status">{t("payNoProvider")}</p>}

      {/* Un solo producto comprado por distintos plazos: se elige el plazo, no
          el plan. */}
      <div className="viewswitch plan-periods" role="group" aria-label={t("planBillingPeriod")}>
        {proPlans.map((p) => (
          <button
            key={p.code}
            className="switch-opt"
            aria-pressed={p.code === pro.code}
            onClick={() => setPeriod(p.code)}
          >
            {t(PERIOD_LABEL[p.periodDays] ?? "planPeriodMonth")}
          </button>
        ))}
      </div>

      <div className="plan-grid">
        <section className="card panel plan-card">
          <h2 className="plan-name">{t("planFreeName")}</h2>
          <div className="plan-price">{free.amountLabel}</div>
          <ul className="plan-features">
            {FEATURES.free.map((k) => (
              <li key={k}>
                <Icon name="check" size={16} />
                {t(k)}
              </li>
            ))}
          </ul>
          {!sub?.isPro && <p className="plan-current">{t("planCurrent")}</p>}
        </section>

        <section className="card panel plan-card featured">
          <h2 className="plan-name">
            {t("planProName")}
            {/* El oro está reservado a racha y logros; un descuento no es un logro. */}
            {saving > 0 && <span className="badge success">{t("planSave", { n: saving })}</span>}
          </h2>
          <div className="plan-price">
            {pro.amountLabel}
            <em>{t(PER_PERIOD[pro.periodDays] ?? "planPerMonth")}</em>
          </div>
          {pro.periodDays > 30 && (
            <p className="hint">{t("planPerMonthEq", { amount: perMonth(pro) })}</p>
          )}
          <ul className="plan-features">
            {FEATURES.pro.map((k) => (
              <li key={k}>
                <Icon name="check" size={16} />
                {t(k)}
              </li>
            ))}
          </ul>
          <button
            className={`btn primary lg block${busy ? " loading" : ""}`}
            disabled={busy || !canPay}
            aria-busy={busy}
            onClick={() => start(pro.code)}
          >
            {busy && <span className="btn-spinner" aria-hidden="true" />}
            <span>{sub?.isPro || sub?.status === "expired" ? t("subRenew") : t("planChoose")}</span>
          </button>
        </section>
      </div>

      {charge && (
        <>
          <TransferInstructions charge={charge} />
          <div className="preview-actions">
            <button className="btn secondary" onClick={() => setCharge(null)}>
              {t("payClose")}
            </button>
            {pending && pending.status === "pending" && (
              <button className="btn primary" onClick={() => setDeclaring(pending)}>
                {t("payDeclareCta")}
              </button>
            )}
          </div>
        </>
      )}

      {declaring && (
        <DeclareDialog
          payment={declaring}
          onClose={() => setDeclaring(null)}
          onDeclared={async () => {
            setDeclaring(null);
            setCharge(null);
            await load();
          }}
        />
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
