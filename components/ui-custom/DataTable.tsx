'use client'

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export interface Column<T> {
  key: string
  header: string
  cell: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (row: T) => void
  rowKey: (row: T) => string
}

export function DataTable<T>({
  columns, data, loading, emptyMessage = 'No data found.', onRowClick, rowKey,
}: DataTableProps<T>) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-100">
            {columns.map(col => (
              <TableHead
                key={col.key}
                className={cn(
                  'text-[11px] font-semibold text-slate-500 uppercase tracking-wider py-3',
                  col.className
                )}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && (
            Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i} className="border-b border-slate-50">
                {columns.map(col => (
                  <TableCell key={col.key} className={cn('py-3.5', col.className)}>
                    <Skeleton className="h-4 w-full rounded-lg" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
          {!loading && data.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length} className="py-16 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <span className="text-slate-400 text-lg">—</span>
                  </div>
                  <p className="text-sm text-slate-400 font-medium">{emptyMessage}</p>
                </div>
              </TableCell>
            </TableRow>
          )}
          {!loading && data.map((row, idx) => (
            <TableRow
              key={rowKey(row)}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'border-b border-slate-50 transition-colors',
                onRowClick && 'cursor-pointer hover:bg-blue-50/40',
                !onRowClick && 'hover:bg-slate-50/60'
              )}
            >
              {columns.map(col => (
                <TableCell key={col.key} className={cn('text-sm text-slate-700 py-3.5', col.className)}>
                  {col.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
