'use client';

import { ReactNode } from 'react';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  count?: number;
  icon?: ReactNode;
}

interface TabsProps<T extends string = string> {
  items: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
}

export default function Tabs<T extends string = string>({
  items,
  value,
  onChange,
  className = '',
}: TabsProps<T>) {
  return (
    <div role="tablist" className={`flex items-end gap-6 border-b border-neutral-200 ${className}`}>
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={`group inline-flex items-center gap-2 -mb-px pb-3 pt-1 border-b-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:text-primary-700 ${
              active
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300'
            }`}
          >
            {item.icon && <span className="shrink-0">{item.icon}</span>}
            <span>{item.label}</span>
            {typeof item.count === 'number' && (
              <span
                className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-medium tabular-nums ${
                  active
                    ? 'bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-200'
                    : 'bg-neutral-100 text-neutral-600 ring-1 ring-inset ring-neutral-200'
                }`}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
