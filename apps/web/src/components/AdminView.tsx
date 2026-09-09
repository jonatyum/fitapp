import { useCallback, useEffect, useState } from "react";
import {
  ApiError,
  apiAdminPayments,
  apiAdminUsers,
  apiConfirmPayment,
  apiRejectPayment,
  apiSetUserRole,
} from "../api";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import type { UIKey } from "../i18n/ui";
import type { AdminPayment, AdminUser } from "../types";
import { ConfirmDialog } from "./ConfirmDialog";
import { Icon } from "./ui/Icon";
import { useToast } from "./ui/Toast";

/** Insignia por estado del pago. Nunca sólo color: cada una lleva su palabra. */
const STATUS_BADGE: Record<string, string> = {
  pending: "info",
  review: "warning",
  paid: "success",
  failed: "danger",
  expired: "neutral",
};

const STATUS_LABEL: Record<string, UIKey> = {
  pending: "adminStatusPending",
  review: "adminStatusReview",
  paid: "adminStatusPaid",
  failed: "adminStatusFailed",
  expired: "adminStatusExpired",
};

/** Los códigos del catálogo no se enseñan crudos: son plazos de un producto. */
const PLAN_PERIOD: Record<string, UIKey> = {
  pro: "planPeriodMonth",
  "pro-quarter": "planPeriodQuarter",
  "pro-year": "planPeriodYear",
};

/** Confirmar o rechazar mueve dinero: las dos piden confirmación explícita. */
type Pending =
  | { kind: "confirm"; payment: AdminPayment }
  | { kind: "reject"; payment: AdminPayment }
  | { kind: "role"; user: AdminUser; role: string };

export function AdminView() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const { toast } = useToast();

  const [tab, setTab] = useState<"payments" | "users">("payments");
  const [onlyQueue, setOnlyQueue] = useState(true);
  const [q, setQ] = useState("");
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      if (tab === "payments") {
        setPayments(await apiAdminPayments({ q, ...(onlyQueue ? {} : { status: "paid" }) }));
      } else {
        setUsers(await apiAdminUsers(q));
      }
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [tab, q, onlyQueue]);

  // La búsqueda escribe letra a letra; se espera a que la persona pare.
  useEffect(() => {
    const timer = setTimeout(load, q ? 260 : 0);
    return () => clearTimeout(timer);
  }, [load, q]);

  const run = async (action: Pending) => {
    setPending(null);
    try {
      if (action.kind === "confirm") {
        await apiConfirmPayment(action.payment.reference);
        toast(t("adminConfirmed", { ref: action.payment.reference }), "success");
      } else if (action.kind === "reject") {
        await apiRejectPayment(action.payment.reference);
        toast(t("adminRejected", { ref: action.payment.reference }), "info");
      } else {
        const updated = await apiSetUserRole(action.user.id, action.role);
        toast(
          t("adminRoleChanged", {
            name: updated.name,
            role: t(updated.role === "admin" ? "adminRoleAdmin" : "adminRoleClient"),
          }),
          "success",
        );
      }
      await load();
    } catch (err) {
      const code = err instanceof ApiError ? err.code : "";
      toast(code === "cannot_change_own_role" ? t("adminSelfRole") : t("errGeneric"), "error");
    }
  };

  const dateFmt = new Intl.DateTimeFormat(lang, { day: "numeric", month: "short", year: "numeric" });
  const fmtDate = (iso: string) => dateFmt.format(new Date(iso));
  const planLabel = (code: string) =>
    PLAN_PERIOD[code] ? `${t("planProName")} ${t(PLAN_PERIOD[code]).toLowerCase()}` : t("planFreeName");

  const ask = (p: Pending) => {
    if (p.kind === "confirm") return t("adminConfirmAsk", { ref: p.payment.reference });
    if (p.kind === "reject") return t("adminRejectAsk", { ref: p.payment.reference });
    return t(p.role === "admin" ? "adminMakeAdminAsk" : "adminRemoveAdminAsk", {
      name: p.user.name,
    });
  };

  return (
    <div className="admin">
      <h1>{t("adminTitle")}</h1>

      <div className="viewswitch" role="group" aria-label={t("adminTitle")}>
        <button
          className="switch-opt"
          aria-pressed={tab === "payments"}
          onClick={() => setTab("payments")}
        >
          <Icon name="credit-card" size={16} />
          {t("adminPayments")}
        </button>
        <button
          className="switch-opt"
          aria-pressed={tab === "users"}
          onClick={() => setTab("users")}
        >
          <Icon name="user" size={16} />
          {t("adminUsers")}
        </button>
      </div>

      <div className="admin-tools">
        <div className="field grow">
          <label className="field-label sr-only" htmlFor="admin-q">
            {t(tab === "payments" ? "adminSearchPayments" : "adminSearchUsers")}
          </label>
          <input
            id="admin-q"
            type="search"
            value={q}
            placeholder={t(tab === "payments" ? "adminSearchPayments" : "adminSearchUsers")}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        {tab === "payments" && (
          <button
            className="chip"
            aria-pressed={onlyQueue}
            onClick={() => setOnlyQueue((v) => !v)}
          >
            {onlyQueue ? <Icon name="check" size={14} /> : null}
            {t("adminQueue")}
          </button>
        )}
      </div>

      {failed && <p className="status error">{t("loadError")}</p>}
      {loading && !failed && (
        <p className="status" role="status">
          {t("loading")}
        </p>
      )}

      {!loading && !failed && tab === "payments" && (
        <ul className="adminlist">
          {payments.length === 0 && <li className="status">{t("adminNoPayments")}</li>}
          {payments.map((p) => (
            <li key={p.reference} className="adminrow">
              <div className="adminrow-head">
                <strong className="t-num">{p.reference}</strong>
                <span className={`badge ${STATUS_BADGE[p.status] ?? "neutral"}`}>
                  {t(STATUS_LABEL[p.status] ?? "adminStatusPending")}
                </span>
                <span className="adminrow-amount t-num">{p.amountLabel}</span>
              </div>
              <p className="hint">
                {p.user?.email ?? t("adminDeletedUser")} · {planLabel(p.planCode)} ·{" "}
                {fmtDate(p.createdAt)}
              </p>
              <p className="hint">
                {p.declaration
                  ? t("adminDeclared", {
                      op: p.declaration.operation,
                      date: p.declaration.paidOn
                        ? fmtDate(p.declaration.paidOn)
                        : fmtDate(p.declaration.declaredAt),
                    })
                  : t("adminNotDeclared")}
              </p>
              {(p.status === "pending" || p.status === "review") && (
                <div className="adminrow-actions">
                  <button
                    className="btn danger-ghost"
                    onClick={() => setPending({ kind: "reject", payment: p })}
                  >
                    {t("adminReject")}
                  </button>
                  <button
                    className="btn primary"
                    onClick={() => setPending({ kind: "confirm", payment: p })}
                  >
                    <Icon name="check" size={18} />
                    {t("adminConfirm")}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {!loading && !failed && tab === "users" && (
        <ul className="adminlist">
          {users.length === 0 && <li className="status">{t("adminNoUsers")}</li>}
          {users.map((u) => {
            const isAdmin = u.role === "admin";
            const self = u.id === user?.id;
            return (
              <li key={u.id} className="adminrow">
                <div className="adminrow-head">
                  <strong>{u.name}</strong>
                  {isAdmin && <span className="badge brand">{t("adminRoleAdmin")}</span>}
                  {u.entitlement.isPro && (
                    <span className="badge accent">
                      <Icon name="sparkle" size={12} />
                      {t("planProName")}
                    </span>
                  )}
                </div>
                <p className="hint">{u.email}</p>
                <p className="hint">
                  {t("adminCounts", { plans: u.routines, sessions: u.sessions })} ·{" "}
                  {fmtDate(u.createdAt)}
                </p>
                {!self && (
                  <div className="adminrow-actions">
                    <button
                      className={`btn ${isAdmin ? "danger-ghost" : "secondary"}`}
                      onClick={() =>
                        setPending({ kind: "role", user: u, role: isAdmin ? "client" : "admin" })
                      }
                    >
                      <Icon name="shield" size={18} />
                      {t(isAdmin ? "adminRemoveAdmin" : "adminMakeAdmin")}
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {pending && (
        <ConfirmDialog
          message={ask(pending)}
          confirmLabel={
            pending.kind === "confirm"
              ? t("adminConfirm")
              : pending.kind === "reject"
                ? t("adminReject")
                : t(pending.role === "admin" ? "adminMakeAdmin" : "adminRemoveAdmin")
          }
          onConfirm={() => run(pending)}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  );
}
