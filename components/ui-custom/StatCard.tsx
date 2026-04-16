import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  color?: string
  trend?: { value: number; label: string }
  className?: string
}

export function StatCard({
  title, value, subtitle, icon: Icon, color = '#3b82f6', trend, className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'relative bg-white rounded-2xl p-5 shadow-sm border border-slate-100 overflow-hidden',
        className
      )}
    >
      {/* Accent top bar */}
      <div
        className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-slate-800 tabular-nums">{value}</p>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
          {trend && (
            <div className={cn(
              'inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full',
              trend.value >= 0
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-600'
            )}>
              <span>{trend.value >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="font-normal text-[10px]">{trend.label}</span>
            </div>
          )}
        </div>
        <div
          className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 shadow-inner"
          style={{ background: `${color}18` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
      </div>
    </div>
  )
}
