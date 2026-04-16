import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface BackLinkProps {
  href: string
  label: string
}

interface FormShellProps {
  back?: BackLinkProps
  title: string
  description?: string
  badge?: ReactNode
  actions?: ReactNode
  children: ReactNode
  maxWidth?: string
}

/** Top-level page wrapper: back link → title row → content */
export function FormShell({ back, title, description, badge, actions, children, maxWidth = 'max-w-2xl' }: FormShellProps) {
  return (
    <div className={cn('space-y-6', maxWidth)}>
      {back && (
        <Link
          href={back.href}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors group"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm group-hover:border-slate-300 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
          </span>
          {back.label}
        </Link>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h1>
            {badge}
          </div>
          {description && <p className="text-sm text-slate-500">{description}</p>}
        </div>
        {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
      </div>

      {children}
    </div>
  )
}

interface FormCardProps {
  children: ReactNode
  className?: string
}

/** White card used throughout form and detail pages */
export function FormCard({ children, className }: FormCardProps) {
  return (
    <div className={cn('bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden', className)}>
      {children}
    </div>
  )
}

interface FormSectionProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
}

/** Section inside a FormCard — optional title row then content */
export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn('px-6 py-5', className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{title}</p>}
          {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

/** Divider between FormSections */
export function FormDivider() {
  return <div className="border-t border-slate-50" />
}

/** Stat pill used in detail pages */
interface StatPillProps {
  label: string
  value: string
  valueClass?: string
}

export function StatPill({ label, value, valueClass }: StatPillProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs text-slate-400 font-medium">{label}</p>
      <p className={cn('text-sm font-semibold text-slate-800', valueClass)}>{value}</p>
    </div>
  )
}
