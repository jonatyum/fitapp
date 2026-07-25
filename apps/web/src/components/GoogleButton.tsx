import { useEffect, useRef } from "react";
import { initGoogle, loadGoogleScript } from "../auth/google";
import { useI18n } from "../i18n/I18nContext";

/** Google renders its own button, so it needs an explicit pixel width. */
const clampWidth = (w: number) => Math.min(400, Math.max(200, Math.round(w)));

export function GoogleButton({
  clientId,
  mode,
  onCredential,
  onError,
}: {
  clientId: string;
  mode: "in" | "up";
  /** stable reference — the button is re-rendered whenever this changes */
  onCredential: (credential: string) => void;
  onError: () => void;
}) {
  const { lang } = useI18n();
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        const el = host.current;
        if (cancelled || !el || !window.google) return;

        initGoogle(clientId, onCredential);

        el.innerHTML = ""; // renderButton appends, so clear on re-render
        window.google.accounts.id.renderButton(el, {
          // The toggle writes data-theme on <html>; useTheme isn't shared state.
          theme:
            document.documentElement.getAttribute("data-theme") === "dark"
              ? "filled_black"
              : "outline",
          size: "large",
          shape: "pill",
          logo_alignment: "center",
          text: mode === "up" ? "signup_with" : "signin_with",
          width: clampWidth(el.getBoundingClientRect().width || 300),
          locale: lang,
        });
      })
      .catch(() => {
        if (!cancelled) onError();
      });

    return () => {
      cancelled = true;
    };
  }, [clientId, mode, lang, onCredential, onError]);

  return <div className="gbtn" ref={host} />;
}
