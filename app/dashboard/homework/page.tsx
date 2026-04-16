import { requireSession } from '@/lib/auth/getSession'
import { createClient } from '@/lib/supabase/server'
import { homework as devHomework, parentStudentLinks as devLinks, students as devStudents } from '@/lib/dev/seed-data'
import { PageHeader } from '@/components/ui-custom/PageHeader'
import { buttonVariants } from '@/components/ui/button'
import { BookMarked, Plus, Clock } from 'lucide-react'
import Link from 'next/link'
import { EmptyState } from '@/components/ui-custom/EmptyState'

export default async function HomeworkPage() {
  const user = await requireSession()
  const today = new Date().toISOString().slice(0, 10)
  const isParent = user.role === 'parent'
  const canCreate = ['admin', 'teacher'].includes(user.role)

  let homework: any[]
  let childrenMeta: { id: string; first_name: string; last_name: string; class_id: string; classes: { name: string } | null }[] = []

  if (process.env.DEV_BYPASS === 'true') {
    if (isParent) {
      const links = devLinks.filter(l => l.parent_id === user.id)
      childrenMeta = links.map(l => ({
        id: l.students.id,
        first_name: l.students.first_name,
        last_name: l.students.last_name,
        class_id: l.students.class_id,
        classes: l.students.classes as any,
      }))
      const classIds = new Set(childrenMeta.map(c => c.class_id))
      homework = devHomework.filter(h => classIds.has(h.class_id)).sort((a, b) => a.due_date.localeCompare(b.due_date))
    } else if (user.role === 'student') {
      const studentRecord = devStudents.find(s => s.id === user.id)
      if (studentRecord) {
        homework = devHomework.filter(h => h.class_id === studentRecord.class_id).sort((a, b) => a.due_date.localeCompare(b.due_date))
      } else {
        homework = []
      }
    } else {
      homework = [...devHomework].sort((a, b) => a.due_date.localeCompare(b.due_date))
    }
  } else {
    const supabase = createClient()
    if (isParent) {
      const { data: links } = await supabase
        .from('parent_student_links')
        .select('students(id, first_name, last_name, class_id, classes(name))')
        .eq('parent_id', user.id)
      childrenMeta = (links ?? []).map((l: any) => l.students).filter(Boolean)
      const classIds = childrenMeta.map(c => c.class_id).filter(Boolean)
      const { data } = classIds.length > 0
        ? await supabase.from('homework').select('*, subjects(name), classes(name)').eq('school_id', user.schoolId).in('class_id', classIds).order('due_date')
        : { data: [] }
      homework = data ?? []
    } else if (user.role === 'student') {
      const { data: studentRecord } = await supabase
        .from('students').select('class_id').eq('user_id', user.id).single()
      if (studentRecord?.class_id) {
        const { data } = await supabase
          .from('homework')
          .select('*, subjects(name), classes(name)')
          .eq('school_id', user.schoolId)
          .eq('class_id', studentRecord.class_id)
          .order('due_date')
        homework = data ?? []
      } else {
        homework = []
      }
    } else {
      let query = supabase
        .from('homework')
        .select('*, subjects(name, code), classes(name), user_profiles(first_name, last_name)')
        .eq('school_id', user.schoolId)
        .order('due_date', { ascending: true })
      if (user.role === 'teacher') query = query.eq('created_by', user.id)
      const { data } = await query
      homework = data ?? []
    }
  }

  const upcoming = homework.filter(h => h.due_date >= today)
  const past     = homework.filter(h => h.due_date < today)

  function HomeworkCard({ h }: { h: any }) {
    const overdue  = h.due_date < today
    const daysLeft = Math.ceil((new Date(h.due_date).getTime() - new Date(today).getTime()) / 86400000)
    return (
      <Link href={`/dashboard/homework/${h.id}`}>
        <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer">
          <div className={`h-1 w-full ${overdue ? 'bg-red-400' : daysLeft <= 2 ? 'bg-amber-400' : 'bg-violet-400'}`} />
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${overdue ? 'bg-red-50' : daysLeft <= 2 ? 'bg-amber-50' : 'bg-violet-50'}`}>
                <BookMarked className={`h-4 w-4 ${overdue ? 'text-red-500' : daysLeft <= 2 ? 'text-amber-500' : 'text-violet-500'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-violet-700 transition-colors">{h.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{h.subjects?.name} · {h.classes?.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">Set: {new Date(h.set_date).toLocaleDateString('en-ZW')}</p>
              </div>
              <div className="shrink-0 text-right">
                <div className={`flex items-center gap-1 text-xs font-semibold ${overdue ? 'text-red-600' : daysLeft <= 2 ? 'text-amber-600' : 'text-slate-500'}`}>
                  <Clock className="h-3 w-3" />
                  {overdue ? 'Overdue' : daysLeft === 0 ? 'Today' : `${daysLeft}d`}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{new Date(h.due_date).toLocaleDateString('en-ZW')}</p>
              </div>
            </div>
            {h.description && <p className="text-xs text-slate-400 mt-2.5 line-clamp-2 pl-12">{h.description}</p>}
          </div>
        </div>
      </Link>
    )
  }

  const pageDesc = isParent
    ? childrenMeta.length > 0
      ? `Showing homework for ${childrenMeta.map(c => c.first_name).join(' & ')}`
      : 'Homework assigned to your children'
    : user.role === 'student'
    ? `${upcoming.length} upcoming, ${past.length} past`
    : `${upcoming.length} upcoming, ${past.length} past`

  return (
    <div className="space-y-6">
      <PageHeader
        title="Homework"
        description={pageDesc}
        action={canCreate && (
          <Link href="/dashboard/homework/new" className={buttonVariants({ size: 'sm' })}>
            <Plus className="h-4 w-4 mr-1.5" /> New Assignment
          </Link>
        )}
      />

      {/* Parent child pills */}
      {isParent && childrenMeta.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {childrenMeta.map(c => (
            <span key={c.id} className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1 text-xs font-semibold text-slate-600">
              <span className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[9px] font-bold">{c.first_name[0]}{c.last_name[0]}</span>
              {c.first_name} · {c.classes?.name ?? '—'}
            </span>
          ))}
        </div>
      )}

      {upcoming.length === 0 && past.length === 0 && (
        <EmptyState
          icon={BookMarked}
          title="No homework yet"
          description={canCreate ? 'Create your first homework assignment.' : 'No homework has been assigned to your children.'}
          action={canCreate && (
            <Link href="/dashboard/homework/new" className={buttonVariants({ size: 'sm' })}>Create assignment</Link>
          )}
        />
      )}

      {upcoming.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Upcoming</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {upcoming.map(h => <HomeworkCard key={h.id} h={h} />)}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Past</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 opacity-60">
            {past.map(h => <HomeworkCard key={h.id} h={h} />)}
          </div>
        </div>
      )}
    </div>
  )
}
