import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { BP, useMediaQuery } from "../useMediaQuery";
import { Dialog } from "./ui/Dialog";
import { Icon } from "./ui/Icon";

export function FilterDropdown({
  label,
  values,
  active,
  onSelect,
  translate,
  searchable = false,
}: {
  label: string;
  values?: string[];
  active: string;
  onSelect: (value: string) => void;
  translate: (value: string) => string;
  searchable?: boolean;
}) {
  const { t } = useI18n();
  const isDesktop = useMediaQuery(BP.md);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Sólo el menú anclado se cierra al pulsar fuera; la hoja lo gestiona Dialog.
  useEffect(() => {
    if (!open || !isDesktop) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, isDesktop]);

  const filtered = (values ?? []).filter((v) =>
    translate(v).toLowerCase().includes(query.toLowerCase()),
  );

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const options = (
    <>
      {searchable && (
        <input
          className="dropdown-search"
          type="search"
          placeholder={t("filterSearch")}
          aria-label={`${t("filterSearch")} ${label}`}
          value={query}
          autoFocus={isDesktop}
          onChange={(e) => setQuery(e.target.value)}
        />
      )}
      <div className="dropdown-options">
        {active && (
          <button
            className="dropdown-opt clear"
            onClick={() => {
              onSelect("");
              close();
            }}
          >
            <Icon name="x" size={16} />
            {label}
          </button>
        )}
        {filtered.map((v) => (
          <button
            key={v}
            className="dropdown-opt"
            aria-pressed={active === v}
            onClick={() => {
              onSelect(active === v ? "" : v);
              close();
            }}
          >
            {/* Seleccionado = fondo + peso + check. */}
            {active === v && <Icon name="check" size={16} />}
            {translate(v)}
          </button>
        ))}
        {filtered.length === 0 && <p className="status">{t("noResults")}</p>}
      </div>
    </>
  );

  return (
    <div className="dropdown" ref={ref}>
      <button
        className={`dropdown-trigger ${active ? "has-value" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>{active ? translate(active) : label}</span>
        <Icon name="chevron-down" size={16} />
      </button>

      {/* Un menú anclado de 280px sobre un disparador estrecho es incómodo en
          móvil: por debajo de 768 la lista se abre como hoja a pantalla completa. */}
      {open &&
        (isDesktop ? (
          <div className="dropdown-menu">{options}</div>
        ) : (
          <Dialog title={label} onClose={close}>
            <div className="dropdown-sheet">{options}</div>
          </Dialog>
        ))}
    </div>
  );
}
