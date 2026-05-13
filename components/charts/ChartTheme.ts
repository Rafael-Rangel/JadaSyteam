export const chartColors = {
  primary: '#2563eb',
  accent: '#7c3aed',
  success: '#059669',
  warning: '#d97706',
  danger: '#dc2626',
  neutral: '#64748b',
  info: '#0284c7',
};

export const categoricalPalette: string[] = [
  chartColors.primary,
  chartColors.accent,
  chartColors.success,
  chartColors.warning,
  chartColors.danger,
  chartColors.neutral,
];

export const axisStyle = {
  fontSize: 11,
  fill: '#64748b',
  fontFamily: 'inherit',
};

export const gridStroke = '#e2e8f0';

export const tooltipContentStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  padding: '8px 12px',
  fontSize: 12,
  color: '#334155',
  boxShadow: '0 4px 6px -1px rgb(15 23 42 / 0.08), 0 2px 4px -2px rgb(15 23 42 / 0.06)',
};

export const tooltipLabelStyle: React.CSSProperties = {
  fontWeight: 600,
  color: '#0f172a',
  marginBottom: 4,
};

export const tooltipItemStyle: React.CSSProperties = {
  color: '#475569',
};

export function colorAt(index: number): string {
  return categoricalPalette[index % categoricalPalette.length];
}
