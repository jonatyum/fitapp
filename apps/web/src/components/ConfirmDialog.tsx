import { useEffect } from "react";
import { useI18n } from "../i18n/I18nContext";

/**
 * In-app replacement for window.confirm — native dialogs don't match the
 * design system and are suppressed in some embedded browsers.
 */
export function ConfirmDialog({
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useI18n();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="overlay" onClick={onCancel}>
      <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="confirm">
          <p>{message}</p>
          <div className="confirm-actions">
            <button className="btn ghost" onClick={onCancel}>
              {t("cancel")}
            </button>
            <button className="btn danger" onClick={onConfirm} autoFocus>
              {confirmLabel ?? t("delete")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
