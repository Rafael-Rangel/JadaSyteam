'use client';

import { ReactNode, useMemo } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { PieChart as PieIcon } from 'lucide-react';
import {
  colorAt,
  tooltipContentStyle,
  tooltipItemStyle,
  tooltipLabelStyle,
} from './ChartTheme';

export interface DonutSlice {
  name: string;
  value: number;
  color?: string;
}

interface DonutChartCardProps {
  title: string;
  description?: string;
  data: DonutSlice[];
  height?: number;
  loading?: boolean;
  actions?: ReactNode;
  centerLabel?: string;
}

export default function DonutChartCard({
  title,
  description,
  data,
  height = 280,
  loading = false,
  actions,
  centerLabel,
}: DonutChartCardProps) {
  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);
  const isEmpty = !loading && (!data || data.length === 0 || total === 0);

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
          icon={<PieIcon className="w-5 h-5" />}
          title="Sem dados"
          description="Quando houver registros, eles aparecerão aqui."
        />
      ) : (
        <div className="relative" style={{ width: '100%', height }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="60%"
                outerRadius="85%"
                paddingAngle={2}
                stroke="#fff"
                strokeWidth={2}
              >
                {data.map((slice, i) => (
                  <Cell key={slice.name} fill={slice.color || colorAt(i)} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipContentStyle}
                labelStyle={tooltipLabelStyle}
                itemStyle={tooltipItemStyle}
              />
              {data.length > 2 && (
                <Legend
                  wrapperStyle={{ fontSize: 12, color: '#475569', paddingTop: 8 }}
                  iconType="circle"
                  iconSize={8}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
          {centerLabel && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                Total
              </span>
              <span className="text-2xl font-semibold text-neutral-900 tabular-nums">
                {centerLabel}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
