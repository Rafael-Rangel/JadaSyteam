'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';

export interface ActionMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  label?: string;
  align?: 'left' | 'right';
}

export default function ActionMenu({ items, label = 'Mais ações', align = 'right' }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center justify-center h-8 w-8 rounded-md text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 focus-ring"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <div
          role="menu"
          className={`absolute z-50 mt-1 min-w-[200px] rounded-md border border-neutral-200 bg-white shadow-md py-1 animate-scale-in ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {items.map((it) => (
            <button
              key={it.id}
              type="button"
              role="menuitem"
              disabled={it.disabled}
              onClick={() => {
                setOpen(false);
                it.onClick();
              }}
              className={`w-full text-left flex items-center gap-2 px-3 py-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                it.danger
                  ? 'text-danger-700 hover:bg-danger-50'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              {it.icon && <span className="shrink-0 w-4 h-4 flex items-center">{it.icon}</span>}
              <span className="truncate">{it.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
