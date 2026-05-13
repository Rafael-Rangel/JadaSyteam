'use client';

import { ReactNode } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { BarChart3 } from 'lucide-react';
import {
  axisStyle,
  colorAt,
  gridStroke,
  tooltipContentStyle,
  tooltipItemStyle,
  tooltipLabelStyle,
} from './ChartTheme';

export interface BarSeries {
  key: string;
  label: string;
  color?: string;
}

interface BarChartCardProps {
  title: string;
  description?: string;
  data: Array<Record<string, string | number>>;
  series: BarSeries[];
  xKey: string;
  height?: number;
  loading?: boolean;
  actions?: ReactNode;
  layout?: 'vertical' | 'horizontal';
  formatValue?: (v: number) => string;
}

export default function BarChartCard({
  title,
  description,
  data,
  series,
  xKey,
  height = 280,
  loading = false,
  actions,
  layout = 'horizontal',
  formatValue,
}: BarChartCardProps) {
  const isEmpty = !loading && (!data || data.length === 0);

  return (
    <div className="card card-padding-md">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs text-neutral-500">{description}</p>
          )}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>

      {loading ? (
        <Skeleton height={height} rounded="lg" />
      ) : isEmpty ? (
        <EmptyState
          icon={<BarChart3 className="w-5 h-5" />}
          title="Sem dados"
          description="Quando houver registros, eles aparecerão aqui."
        />
      ) : (
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer>
            <BarChart
              data={data}
              layout={layout}
              margin={{ top: 6, right: 12, left: layout === 'vertical' ? 0 : -12, bottom: 0 }}
              barCategoryGap="30%"
            >
              <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={layout === 'vertical'} horizontal={layout === 'horizontal'} />
              {layout === 'horizontal' ? (
                <>
                  <XAxis dataKey={xKey} tick={axisStyle} axisLine={{ stroke: gridStroke }} tickLine={false} />
                  <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={36} allowDecimals={false} tickFormatter={formatValue} />
                </>
              ) : (
                <>
                  <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={formatValue} />
                  <YAxis type="category" dataKey={xKey} tick={axisStyle} axisLine={false} tickLine={false} width={120} />
                </>
              )}
              <Tooltip
                contentStyle={tooltipContentStyle}
                labelStyle={tooltipLabelStyle}
                itemStyle={tooltipItemStyle}
                cursor={{ fill: '#f1f5f9' }}
                formatter={
                  formatValue
                    ? (v) => (typeof v === 'number' ? formatValue(v) : String(v))
                    : undefined
                }
              />
              {series.length > 1 && (
                <Legend
                  wrapperStyle={{ fontSize: 12, color: '#475569', paddingTop: 8 }}
                  iconType="circle"
                  iconSize={8}
                />
              )}
              {series.map((s, i) => (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.label}
                  fill={s.color || colorAt(i)}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
