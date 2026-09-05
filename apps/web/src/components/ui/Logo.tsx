/**
 * "El escalón andino": pirámide escalonada simétrica que lee como montaña
 * (Illimani), motivo escalonado del aguayo y gráfica de progreso.
 * Esquinas vivas a propósito: sin `rx`.
 */
export function LogoMark({ size = 24, ...rest }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d="M2 27 V22 H7 V17 H11 V12 H14 V5 H18 V12 H21 V17 H25 V22 H30 V27 Z" />
    </svg>
  );
}

/**
 * Wordmark. El punto de la `i` final es un cuadrado sólido de marca, así que
 * la letra se escribe con la i sin punto (U+0131) y el cuadrado se dibuja.
 */
export function Wordmark() {
  return (
    <span className="brand-word">
      chaman
      <span className="brand-i" aria-hidden="true">
        {"ı"}
      </span>
      <span className="sr-only">i</span>
    </span>
  );
}

/** Lockup completo: marca 24 + wordmark. Visible en todos los anchos. */
export function Logo() {
  return (
    <span className="brand">
      <LogoMark className="brand-logo" size={24} />
      <Wordmark />
    </span>
  );
}
