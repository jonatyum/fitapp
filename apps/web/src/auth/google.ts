// Minimal typings + loader for Google Identity Services.
// The script is only injected when the user actually opens the sign-in dialog,
// so visitors who never sign in are not exposed to it.

export interface GoogleCredentialResponse {
  credential: string;
}

interface IdConfiguration {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
}

interface ButtonOptions {
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "small" | "medium" | "large";
  text?: "signin_with" | "signup_with" | "continue_with";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: number;
  locale?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: IdConfiguration) => void;
          renderButton: (parent: HTMLElement, options: ButtonOptions) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

const SRC = "https://accounts.google.com/gsi/client";

let pending: Promise<void> | null = null;

/** Injects the GSI script once; resolves when window.google is usable. */
export function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!pending) {
    pending = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        pending = null; // allow a retry on the next attempt
        reject(new Error("google_script_failed"));
      };
      document.head.appendChild(script);
    });
  }
  return pending;
}

let initializedFor: string | null = null;
let handler: ((credential: string) => void) | null = null;

/**
 * Configures GSI once per client id — calling initialize repeatedly makes it
 * warn and keep only the last instance. The callback is routed through a
 * mutable handler so re-renders still reach the current one.
 */
export function initGoogle(clientId: string, onCredential: (credential: string) => void) {
  handler = onCredential;
  if (initializedFor === clientId || !window.google) return;
  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (res) => handler?.(res.credential),
    cancel_on_tap_outside: true,
  });
  initializedFor = clientId;
}

export type { ButtonOptions };
