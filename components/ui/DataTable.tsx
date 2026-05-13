'use client';

import { ReactNode, useMemo } from 'react';
import EmptyState from './EmptyState';
import Skeleton from './Skeleton';
import { Inbox } from 'lucide-react';

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  render: (row: T, index: number) => ReactNode;
  align?: 'left' | 'right' | 'center';
  width?: string;
  className?: string;
  cellClassName?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  loading?: boolean;
  loadingRows?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  zebra?: boolean;
  stickyHeader?: boolean;
  density?: 'comfortable' | 'compact';
  className?: string;
  onRowClick?: (row: T, index: number) => void;
}

const alignClass = { left: 'text-left', right: 'text-right', center: 'text-center' } as const;

export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  loadingRows = 5,
  emptyTitle = 'Nada por aqui',
  emptyDescription = 'Nenhum registro para exibir.',
  emptyAction,
  zebra = false,
  stickyHeader = true,
  density = 'comfortable',
  className = '',
  onRowClick,
}: DataTableProps<T>) {
  const cellPad = density === 'compact' ? 'py-2 px-4' : 'py-3 px-4';

  const skeletonRows = useMemo(
    () =>
      Array.from({ length: loadingRows }).map((_, i) => (
        <tr key={`sk-${i}`} className="border-b border-neutral-100 last:border-b-0">
          {columns.map((col) => (
            <td key={col.key} className={`${cellPad} ${col.cellClassName ?? ''}`}>
              <Skeleton height={14} width={i % 2 === 0 ? '60%' : '40%'} />
            </td>
          ))}
        </tr>
      )),
    [columns, loadingRows, cellPad]
  );

  return (
    <div className={`surface overflow-hidden ${className}`}>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead
            className={`bg-neutral-50/80 ${
              stickyHeader ? 'sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-neutral-50/70' : ''
            }`}
          >
            <tr className="border-b border-neutral-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  style={col.width ? { width: col.width } : undefined}
                  className={`${cellPad} text-xs font-medium uppercase tracking-wider text-neutral-500 ${
                    alignClass[col.align ?? 'left']
                  } ${col.className ?? ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              skeletonRows
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <EmptyState
                    icon={<Inbox className="w-5 h-5" />}
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                  />
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={rowKey(row, i)}
                  onClick={onRowClick ? () => onRowClick(row, i) : undefined}
                  className={`border-b border-neutral-100 last:border-b-0 transition-colors ${
                    zebra ? 'odd:bg-white even:bg-neutral-50/50' : ''
                  } ${onRowClick ? 'cursor-pointer hover:bg-primary-50/40' : 'hover:bg-neutral-50'}`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`${cellPad} text-neutral-700 ${alignClass[col.align ?? 'left']} ${
                        col.cellClassName ?? ''
                      }`}
                    >
                      {col.render(row, i)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
