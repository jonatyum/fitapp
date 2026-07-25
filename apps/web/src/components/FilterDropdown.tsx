import { useEffect, useRef, useState } from "react";

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
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const filtered = (values ?? []).filter((v) =>
    translate(v).toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="dropdown" ref={ref}>
      <button
        className={`dropdown-trigger ${active ? "has-value" : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{active ? translate(active) : label}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="dropdown-menu">
          {searchable && (
            <input
              className="dropdown-search"
              placeholder="…"
              value={query}
              autoFocus
              onChange={(e) => setQuery(e.target.value)}
            />
          )}
          <div className="dropdown-options">
            {active && (
              <button
                className="dropdown-opt clear"
                onClick={() => {
                  onSelect("");
                  setOpen(false);
                }}
              >
                ✕ {label}
              </button>
            )}
            {filtered.map((v) => (
              <button
                key={v}
                className={`dropdown-opt ${active === v ? "active" : ""}`}
                onClick={() => {
                  onSelect(active === v ? "" : v);
                  setOpen(false);
                }}
              >
                {translate(v)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
