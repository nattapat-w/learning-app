"use client";

import { useEffect, useRef, useState } from "react";
import type { PostSort } from "../../lib/post-sort";
import { SORT_OPTIONS } from "../../lib/post-sort";

type SortDropdownProps = {
  value: PostSort;
  onChange: (sort: PostSort) => void;
};

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-d-divider bg-d-secondary px-4 py-2 text-xs font-bold text-d-header transition-colors hover:bg-[var(--background-modifier-hover)]"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {current.label}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="currentColor"
          aria-hidden
          className="text-d-muted"
        >
          <path d="M2.5 4.5L6 8l3.5-3.5H2.5z" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute left-0 top-[calc(100%+6px)] z-50 min-w-[180px] rounded-lg border border-d-divider bg-d-secondary py-1 shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
          role="listbox"
        >
          <div
            className="absolute -top-[5px] left-6 h-2.5 w-2.5 rotate-45 border-l border-t border-d-divider bg-d-secondary"
            aria-hidden
          />
          <p className="px-4 py-2 text-xs font-bold text-d-muted">Sort by:</p>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={opt.value === value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`block w-full px-4 py-2 text-left text-sm font-medium transition-colors ${
                opt.value === value
                  ? "bg-d-inset text-d-header"
                  : "text-d-normal hover:bg-[var(--background-modifier-hover)]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
