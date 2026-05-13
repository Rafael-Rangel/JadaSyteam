import { ReactNode } from 'react';

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent' | 'primary' | 'outline';

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  icon?: ReactNode;
  className?: string;
  title?: string;
}

const toneClass: Record<Tone, string> = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info',
  neutral: 'badge-neutral',
  accent: 'badge-accent',
  primary: 'badge-primary',
  outline: 'badge-outline',
};

export default function Badge({
  children,
  tone = 'neutral',
  icon,
  className = '',
  title,
}: BadgeProps) {
  return (
    <span className={`badge ${toneClass[tone]} ${className}`} title={title}>
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </span>
  );
}
