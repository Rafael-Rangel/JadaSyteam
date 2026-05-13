'use client';

import { ReactNode } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { Activity } from 'lucide-react';
import {
  axisStyle,
  colorAt,
  gridStroke,
  tooltipContentStyle,
  tooltipItemStyle,
  tooltipLabelStyle,
} from './ChartTheme';

export interface LineSeries {
  key: string;
  label: string;
  color?: string;
}

interface LineChartCardProps {
  title: string;
  description?: string;
  data: Array<Record<string, string | number>>;
  series: LineSeries[];
  xKey: string;
  height?: number;
  loading?: boolean;
  actions?: ReactNode;
}

export default function LineChartCard({
  title,
  description,
  data,
  series,
  xKey,
  height = 280,
  loading = false,
  actions,
}: LineChartCardProps) {
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
          icon={<Activity className="w-5 h-5" />}
          title="Sem dados no período"
          description="Quando houver registros, eles aparecerão aqui."
        />
      ) : (
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 6, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey={xKey}
                tick={axisStyle}
                axisLine={{ stroke: gridStroke }}
                tickLine={false}
              />
              <YAxis
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
                width={36}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={tooltipContentStyle}
                labelStyle={tooltipLabelStyle}
                itemStyle={tooltipItemStyle}
                cursor={{ stroke: gridStroke, strokeWidth: 1 }}
              />
              {series.length > 1 && (
                <Legend
                  wrapperStyle={{ fontSize: 12, color: '#475569', paddingTop: 8 }}
                  iconType="circle"
                  iconSize={8}
                />
              )}
              {series.map((s, i) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={s.color || colorAt(i)}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
