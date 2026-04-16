import { cn } from '@/lib/utils'

type StatusVariant =
  | 'present' | 'absent' | 'late' | 'excused'
  | 'paid' | 'partial' | 'unpaid' | 'overdue'
  | 'cleared' | 'Cleared' | 'Partial' | 'Overdue'
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'U'
  | 'active' | 'inactive'

const variantConfig: Record<string, { bg: string; text: string; dot: string }> = {
  present:  { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  absent:   { bg: 'bg-red-50',     text: 'text-red-600',     dot: 'bg-red-500' },
  late:     { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500' },
  excused:  { bg: 'bg-sky-50',     text: 'text-sky-700',     dot: 'bg-sky-500' },
  paid:     { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  cleared:  { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  Cleared:  { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  partial:  { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400' },
  Partial:  { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400' },
  unpaid:   { bg: 'bg-red-50',     text: 'text-red-600',     dot: 'bg-red-500' },
  overdue:  { bg: 'bg-red-100',    text: 'text-red-700',     dot: 'bg-red-600' },
  Overdue:  { bg: 'bg-red-100',    text: 'text-red-700',     dot: 'bg-red-600' },
  active:   { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  inactive: { bg: 'bg-slate-100',  text: 'text-slate-500',   dot: 'bg-slate-400' },
  A: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  B: { bg: 'bg-sky-50',     text: 'text-sky-700',     dot: 'bg-sky-500' },
  C: { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400' },
  D: { bg: 'bg-orange-50',  text: 'text-orange-700',  dot: 'bg-orange-500' },
  E: { bg: 'bg-red-50',     text: 'text-red-600',     dot: 'bg-red-500' },
  U: { bg: 'bg-slate-100',  text: 'text-slate-500',   dot: 'bg-slate-400' },
}

interface StatusBadgeProps {
  status: StatusVariant | string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const cfg = variantConfig[status] ?? { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize',
        cfg.bg, cfg.text, className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', cfg.dot)} />
      {status}
    </span>
  )
}
