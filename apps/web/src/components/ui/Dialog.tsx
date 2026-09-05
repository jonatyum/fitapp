import { useCallback, useEffect, useId, useRef, type ReactNode } from "react";
import { useI18n } from "../../i18n/I18nContext";
import { Icon } from "./Icon";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Diálogo accesible, único para toda la app: `.sheet` en móvil y `.modal`
 * centrado a partir de 768px (lo decide el CSS, el DOM es el mismo).
 *
 * Cubre lo que las tres implementaciones anteriores no hacían: role/aria-modal,
 * trampa de foco, foco inicial y devolución del foco al disparador.
 */
export function Dialog({
  title,
  children,
  footer,
  onClose,
  /** false en los destructivos: exigen una acción explícita, no un clic fuera. */
  dismissible = true,
  wide = false,
  labelledBy,
}: {
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  dismissible?: boolean;
  wide?: boolean;
  labelledBy?: string;
}) {
  const { t } = useI18n();
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const autoId = useId();
  const titleId = labelledBy ?? `${autoId}-title`;

  const focusables = useCallback(
    () => Array.from(panel.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []),
    [],
  );

  // Recuerda quién abrió el diálogo y le devuelve el foco al cerrarse.
  useEffect(() => {
    opener.current = document.activeElement as HTMLElement | null;
    const first = focusables()[0] ?? panel.current;
    first?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      opener.current?.focus?.();
    };
  }, [focusables]);

  // Escape cierra siempre; Tab queda atrapado dentro del panel.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const items = focusables();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!panel.current?.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [focusables, onClose]);

  return (
    <div
      className="overlay"
      onMouseDown={(e) => {
        if (dismissible && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`modal${wide ? " wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={panel}
        tabIndex={-1}
      >
        <div className="sheet-grabber" aria-hidden="true" />

        <div className="modal-header">
          {title ? (
            <h2 className="modal-title" id={titleId}>
              {title}
            </h2>
          ) : (
            <span className="sr-only" id={titleId}>
              {t("close")}
            </span>
          )}
          <button
            type="button"
            className="btn icon ghost modal-close"
            onClick={onClose}
            aria-label={t("close")}
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        {children && <div className="modal-body">{children}</div>}

        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
