import { requireSession } from '@/lib/auth/getSession'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { FormShell, FormCard, FormSection, FormDivider } from '@/components/ui-custom/FormShell'
import { BookMarked, Paperclip, Clock, Calendar } from 'lucide-react'

export default async function HomeworkDetailPage({ params }: { params: { id: string } }) {
  const user = await requireSession()
  const supabase = createClient()

  const { data: hw } = await supabase
    .from('homework')
    .select('*, subjects(name, code), classes(name), user_profiles(first_name, last_name)')
    .eq('id', params.id)
    .eq('school_id', user.schoolId)
    .single()

  if (!hw) notFound()

  const today = new Date().toISOString().slice(0, 10)
  const overdue = hw.due_date < today
  const daysUntil = Math.ceil((new Date(hw.due_date).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24))
  const subjectName = (hw.subjects as any)?.name
  const className = (hw.classes as any)?.name
  const teacher = (hw.user_profiles as any)

  return (
    <FormShell
      back={{ href: '/dashboard/homework', label: 'Homework' }}
      title={hw.title}
      description={[subjectName, className].filter(Boolean).join(' · ')}
    >
      <FormCard>
        {/* Subject / class identity strip */}
        <div className="px-6 py-4 flex items-center gap-4 border-b border-slate-50">
          <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <BookMarked className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{subjectName}</p>
            <p className="text-xs text-slate-400">{className}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${overdue ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
            <Clock className="h-3 w-3" />
            {overdue ? 'Overdue' : daysUntil === 0 ? 'Due today' : `${daysUntil}d left`}
          </span>
        </div>

        {/* Date strip */}
        <div className="px-6 py-4 grid grid-cols-2 gap-6 bg-slate-50/50 border-b border-slate-50">
          <div className="flex items-center gap-2.5">
            <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 font-medium">Set</p>
              <p className="text-sm font-semibold text-slate-700">{hw.set_date ? new Date(hw.set_date).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Clock className="h-4 w-4 text-slate-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 font-medium">Due</p>
              <p className={`text-sm font-semibold ${overdue ? 'text-red-600' : 'text-slate-700'}`}>
                {new Date(hw.due_date).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {hw.description && (
          <>
            <FormSection title="Instructions">
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{hw.description}</p>
            </FormSection>
            <FormDivider />
          </>
        )}

        {hw.attachment_url && (
          <>
            <FormSection title="Attachment">
              <a
                href={hw.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                <Paperclip className="h-4 w-4" /> Download attachment
              </a>
            </FormSection>
            <FormDivider />
          </>
        )}

        <div className="px-6 py-3 bg-slate-50/60">
          <p className="text-xs text-slate-400">
            Set by <span className="font-medium text-slate-600">{teacher?.first_name} {teacher?.last_name}</span>
          </p>
        </div>
      </FormCard>
    </FormShell>
  )
}
