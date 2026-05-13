import { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface KPIStatProps {
  label: string;
  value: string | number;
  hint?: string;
  delta?: { value: string; trend: 'up' | 'down' | 'flat' };
  icon?: ReactNode;
  loading?: boolean;
}

export default function KPIStat({ label, value, hint, delta, icon, loading }: KPIStatProps) {
  return (
    <div className="card card-padding-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            {label}
          </p>
          {loading ? (
            <div className="mt-3 h-8 w-24 skeleton" />
          ) : (
            <p className="mt-2 text-[28px] leading-9 font-semibold text-neutral-900 tabular-nums">
              {value}
            </p>
          )}
          {hint && !loading && (
            <p className="mt-1 text-xs text-neutral-500">{hint}</p>
          )}
        </div>
        {icon && (
          <div className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            {icon}
          </div>
        )}
      </div>
      {delta && !loading && (
        <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium">
          {delta.trend === 'up' && (
            <span className="inline-flex items-center gap-1 text-success-700">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {delta.value}
            </span>
          )}
          {delta.trend === 'down' && (
            <span className="inline-flex items-center gap-1 text-danger-700">
              <ArrowDownRight className="w-3.5 h-3.5" />
              {delta.value}
            </span>
          )}
          {delta.trend === 'flat' && (
            <span className="text-neutral-500">{delta.value}</span>
          )}
        </div>
      )}
    </div>
  );
}
