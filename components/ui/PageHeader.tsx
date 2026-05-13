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
      <div className="min-w-0 flex-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="breadcrumb" className="mb-2 flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
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
        <h1 className="text-balance text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-neutral-500 sm:text-[15px]">{description}</p>
        )}
        {children}
      </div>
      {actions && (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          {actions}
        </div>
      )}
    </div>
  );
}
