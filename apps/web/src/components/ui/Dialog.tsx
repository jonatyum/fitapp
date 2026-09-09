import { useCallback, useEffect, useId, useRef, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "../../i18n/I18nContext";
import { Icon } from "./Icon";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const DRAG_START_PX = 8;
const DRAG_CLOSE_PX = 88;
const DRAG_CLOSE_SPEED = 0.5;
const DRAG_CLOSE_MS = 180;
const DRAG_RETURN_MS = 200;
const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";

const isSheet = () => !window.matchMedia("(min-width: 768px)").matches;
const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Arrastrar la hoja hacia abajo la cierra, que es lo que espera cualquiera que
 * vea el tirador. Solo en móvil: a partir de 768px el diálogo es un modal
 * centrado y el gesto no significa nada.
 *
 * El arrastre no empieza si el dedo cae sobre un `.modal-body` ya desplazado:
 * ahí el gesto es del scroll, no de la hoja.
 */
function useSheetDrag(panel: RefObject<HTMLDivElement>, onClose: () => void, enabled: boolean) {
  const drag = useRef<{ id: number; startY: number; startAt: number; dy: number; active: boolean } | null>(null);

  const settle = useCallback((transform: string, ms: number) => {
    const el = panel.current;
    if (!el) return;
    el.style.transition = `transform ${ms}ms ${EASE_OUT}`;
    el.style.transform = transform;
    window.setTimeout(() => {
      if (!panel.current || drag.current) return;
      panel.current.style.transition = "";
      panel.current.style.transform = "";
    }, ms);
  }, [panel]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled || drag.current || !isSheet()) return;
    const from = e.target instanceof Element ? e.target.closest<HTMLElement>(".modal-body") : null;
    if (from && from.scrollTop > 0) return;
    drag.current = { id: e.pointerId, startY: e.clientY, startAt: e.timeStamp, dy: 0, active: false };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    const el = panel.current;
    if (!state || !el || e.pointerId !== state.id) return;

    state.dy = Math.max(0, e.clientY - state.startY);
    if (!state.active) {
      if (state.dy < DRAG_START_PX) return;
      state.active = true;
      el.setPointerCapture(e.pointerId);
      el.style.transition = "none";
      el.style.userSelect = "none";
    }
    el.style.transform = `translateY(${state.dy}px)`;
  };

  const end = (e: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    const el = panel.current;
    if (!state || e.pointerId !== state.id) return;
    drag.current = null;
    if (!state.active || !el) return;

    el.style.userSelect = "";
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);

    const speed = state.dy / Math.max(1, e.timeStamp - state.startAt);
    const closing = state.dy > DRAG_CLOSE_PX || (speed > DRAG_CLOSE_SPEED && state.dy > DRAG_START_PX * 3);
    if (!closing) {
      settle("translateY(0)", DRAG_RETURN_MS);
      return;
    }
    if (prefersReducedMotion()) {
      onClose();
      return;
    }
    settle("translateY(100%)", DRAG_CLOSE_MS);
    window.setTimeout(onClose, DRAG_CLOSE_MS);
  };

  const onPointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    drag.current = null;
    if (!state?.active || !panel.current) return;
    panel.current.style.userSelect = "";
    if (panel.current.hasPointerCapture(e.pointerId)) panel.current.releasePointerCapture(e.pointerId);
    settle("translateY(0)", DRAG_RETURN_MS);
  };

  return { onPointerDown, onPointerMove, onPointerUp: end, onPointerCancel };
}

/**
 * Diálogo accesible, único para toda la app: `.sheet` en móvil y `.modal`
 * centrado a partir de 768px (lo decide el CSS, el DOM es el mismo).
 *
 * Cubre lo que las tres implementaciones anteriores no hacían: role/aria-modal,
 * trampa de foco, foco inicial y devolución del foco al disparador.
 *
 * Va por portal a `body` porque `position: fixed` deja de referirse al viewport
 * dentro de un ancestro con `backdrop-filter` (o `transform`, o `filter`): la
 * `.filterbar` lo tiene, y la hoja de los desplegables se salía por arriba.
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
  const dragHandlers = useSheetDrag(panel, onClose, dismissible);

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

  return createPortal(
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
        {...dragHandlers}
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
    </div>,
    document.body,
  );
}
