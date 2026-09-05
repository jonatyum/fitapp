import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useI18n } from "../../i18n/I18nContext";
import { Icon, type IconName } from "./Icon";

export type ToastVariant = "success" | "error" | "info" | "warning";

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

const ICON: Record<ToastVariant, IconName> = {
  success: "check-circle",
  error: "alert-circle",
  info: "info",
  warning: "alert-triangle",
};

interface ToastValue {
  /** Muestra un aviso. Los de error no se cierran solos. */
  toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastValue | null>(null);

const AUTO_CLOSE_MS = 5000;

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const { t } = useI18n();
  const paused = useRef(false);
  const remaining = useRef(AUTO_CLOSE_MS);

  useEffect(() => {
    // Un error se queda hasta que el usuario lo descarta.
    if (toast.variant === "error") return;

    let start = Date.now();
    let timer = window.setTimeout(onDismiss, remaining.current);

    const pause = () => {
      if (paused.current) return;
      paused.current = true;
      window.clearTimeout(timer);
      remaining.current -= Date.now() - start;
    };
    const resume = () => {
      if (!paused.current) return;
      paused.current = false;
      start = Date.now();
      timer = window.setTimeout(onDismiss, remaining.current);
    };

    const el = document.getElementById(`toast-${toast.id}`);
    el?.addEventListener("mouseenter", pause);
    el?.addEventListener("mouseleave", resume);
    el?.addEventListener("focusin", pause);
    el?.addEventListener("focusout", resume);

    return () => {
      window.clearTimeout(timer);
      el?.removeEventListener("mouseenter", pause);
      el?.removeEventListener("mouseleave", resume);
      el?.removeEventListener("focusin", pause);
      el?.removeEventListener("focusout", resume);
    };
  }, [toast.id, toast.variant, onDismiss]);

  return (
    <div className={`toast ${toast.variant}`} id={`toast-${toast.id}`}>
      <Icon name={ICON[toast.variant]} size={20} />
      <span className="toast-message">{toast.message}</span>
      <button
        type="button"
        className="btn icon ghost sm"
        onClick={onDismiss}
        aria-label={t("close")}
      >
        <Icon name="x" size={16} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback(
    (id: number) => setItems((list) => list.filter((x) => x.id !== id)),
    [],
  );

  const toast = useCallback((message: string, variant: ToastVariant = "info") => {
    setItems((list) => [...list, { id: nextId.current++, message, variant }]);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  const polite = items.filter((x) => x.variant !== "error");
  const assertive = items.filter((x) => x.variant === "error");

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Las dos regiones vivas existen siempre: una región creada a la vez que
          su contenido no se anuncia de forma fiable. */}
      <div className="toast-stack">
        <div role="status" aria-live="polite">
          {polite.map((x) => (
            <ToastItem key={x.id} toast={x} onDismiss={() => dismiss(x.id)} />
          ))}
        </div>
        <div role="alert" aria-live="assertive">
          {assertive.map((x) => (
            <ToastItem key={x.id} toast={x} onDismiss={() => dismiss(x.id)} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
