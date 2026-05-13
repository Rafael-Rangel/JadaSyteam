import { ReactNode } from 'react';

interface Crumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: Crumb[];
  children?: ReactNode;
}

export default function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  children,
}: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="breadcrumb" className="mb-2 flex items-center gap-1.5 text-xs text-neutral-500">
            {breadcrumbs.map((c, i) => (
              <span key={`${c.label}-${i}`} className="flex items-center gap-1.5">
                {c.href ? (
                  <a href={c.href} className="hover:text-neutral-700">
                    {c.label}
                  </a>
                ) : (
                  <span className="text-neutral-700">{c.label}</span>
                )}
                {i < breadcrumbs.length - 1 && <span className="text-neutral-300">/</span>}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-neutral-500 max-w-2xl">{description}</p>
        )}
        {children}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
