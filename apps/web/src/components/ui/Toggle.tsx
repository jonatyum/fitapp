import { useId, type ReactNode } from "react";

/**
 * Interruptor de dos estados. Por dentro es un checkbox de verdad —oculto, no
 * simulado con divs—, así que el lector de pantalla lo anuncia como tal y el
 * teclado lo activa con espacio sin reimplementar nada.
 */
export function Toggle({
  label,
  checked,
  onChange,
  disabled = false,
  block = false,
  describedBy,
}: {
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Ocupa todo el ancho, con la etiqueta a un lado y el interruptor al otro. */
  block?: boolean;
  describedBy?: string;
}) {
  const id = useId();

  return (
    <label className={`toggle${block ? " block" : ""}`} htmlFor={id}>
      <span className="toggle-label">{label}</span>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        aria-describedby={describedBy}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="toggle-track" aria-hidden="true">
        <span className="toggle-thumb" />
      </span>
    </label>
  );
}
