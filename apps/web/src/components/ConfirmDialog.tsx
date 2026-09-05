import { useI18n } from "../i18n/I18nContext";
import { Dialog } from "./ui/Dialog";

/**
 * Sustituto de window.confirm: los diálogos nativos no siguen el sistema de
 * diseño y algunos navegadores embebidos los suprimen.
 *
 * Destructivo, así que no se cierra al pulsar fuera: exige elegir.
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

  return (
    <Dialog
      title={message}
      onClose={onCancel}
      dismissible={false}
      footer={
        <>
          <button className="btn secondary" onClick={onCancel}>
            {t("cancel")}
          </button>
          <button className="btn danger" onClick={onConfirm}>
            {confirmLabel ?? t("delete")}
          </button>
        </>
      }
    />
  );
}
