import { requireRole } from '@/lib/auth/getSession'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { FormShell, FormCard } from '@/components/ui-custom/FormShell'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatusBadge } from '@/components/ui-custom/StatusBadge'
import { buttonVariants } from '@/components/ui/button'
import { Pencil, GraduationCap, Home } from 'lucide-react'
import Link from 'next/link'
import { computeBalance } from '@/lib/utils/fees'

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
  const user = await requireRole(['admin', 'teacher', 'parent'])
  const supabase = createClient()

  const { data: student } = await supabase
    .from('students')
    .select('*, classes(name, grades(name))')
    .eq('id', params.id)
    .eq('school_id', user.schoolId)
    .single()

  if (!student) notFound()

  const [
    { data: marks },
    { data: attendance },
    { data: ledger },
  ] = await Promise.all([
    supabase.from('marks').select('*, assessments(title, type, max_marks, date, subjects(name))').eq('student_id', params.id).order('entered_at', { ascending: false }),
    supabase.from('attendance').select('date, status, reason').eq('student_id', params.id).order('date', { ascending: false }).limit(30),
    supabase.from('fee_ledger').select('*').eq('student_id', params.id).eq('school_id', user.schoolId),
  ])

  const balance = computeBalance(ledger ?? [])
  const cls = student.classes as any
  const presentDays = (attendance ?? []).filter((a: any) => ['present', 'late'].includes(a.status)).length
  const totalDays = attendance?.length ?? 0
  const attendancePct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : null

  const initials = `${student.first_name[0]}${student.last_name[0]}`

  return (
    <FormShell
      back={{ href: '/dashboard/students', label: 'Students' }}
      title={`${student.first_name} ${student.last_name}`}
      description={student.reg_number}
      maxWidth="max-w-4xl"
      actions={
        user.role === 'admin' ? (
          <Link href={`/dashboard/students/${params.id}/edit`} className={buttonVariants({ variant: 'outline', size: 'sm' }) + ' rounded-xl h-9'}>
            <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
          </Link>
        ) : undefined
      }
    >
      {/* Hero profile card */}
      <FormCard>
        <div className="px-6 py-5 flex items-center gap-5">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl font-bold text-white shrink-0 shadow-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {cls?.name && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-0.5">
                  <GraduationCap className="h-3 w-3" />{cls.name}
                </span>
              )}
              {student.boarding && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-full px-2.5 py-0.5">
                  <Home className="h-3 w-3" />Boarding
                </span>
              )}
              <StatusBadge status={student.active ? 'active' : 'inactive'} />
            </div>
            <p className="text-xs text-slate-400 font-mono">{student.reg_number}</p>
          </div>
        </div>

        <div className="border-t border-slate-50 px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-5">
          {[
            { label: 'Gender', value: student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : '—' },
            { label: 'Date of Birth', value: student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString('en-ZW') : '—' },
            { label: 'Attendance', value: attendancePct !== null ? `${attendancePct}%` : '—', cls: attendancePct !== null ? (attendancePct >= 80 ? 'text-emerald-600' : 'text-red-500') : '' },
            { label: 'Fee Balance', value: `$${balance.balance.toFixed(2)}`, cls: balance.balance > 0 ? 'text-red-500' : 'text-emerald-600' },
          ].map(item => (
            <div key={item.label}>
              <p className="text-xs text-slate-400 font-medium mb-0.5">{item.label}</p>
              <p className={`text-sm font-semibold text-slate-800 ${item.cls ?? ''}`}>{item.value}</p>
            </div>
          ))}
        </div>
      </FormCard>

      {/* Tabs */}
      <Tabs defaultValue="marks">
        <TabsList className="bg-white border border-slate-100 rounded-xl p-1 shadow-sm">
          <TabsTrigger value="marks" className="rounded-lg text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm">Marks</TabsTrigger>
          <TabsTrigger value="attendance" className="rounded-lg text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm">Attendance</TabsTrigger>
          <TabsTrigger value="fees" className="rounded-lg text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm">Fees</TabsTrigger>
        </TabsList>

        <TabsContent value="marks" className="mt-4">
          <FormCard>
            {(marks ?? []).length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-10">No marks recorded yet.</p>
            ) : (
              <div className="divide-y divide-slate-50">
                {(marks ?? []).map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between px-6 py-3.5">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{m.assessments?.subjects?.name} — {m.assessments?.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 capitalize">{m.assessments?.type} · {new Date(m.assessments?.date).toLocaleDateString('en-ZW')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-700 font-mono">{m.raw_score}/{m.assessments?.max_marks}</span>
                      <StatusBadge status={m.grade_letter ?? 'U'} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </FormCard>
        </TabsContent>

        <TabsContent value="attendance" className="mt-4">
          <FormCard>
            {(attendance ?? []).length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-10">No attendance records.</p>
            ) : (
              <div className="divide-y divide-slate-50">
                {(attendance ?? []).map((a: any, i: number) => (
                  <div key={i} className="flex items-center justify-between px-6 py-3.5">
                    <p className="text-sm font-medium text-slate-700">{new Date(a.date).toLocaleDateString('en-ZW', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                    <div className="flex items-center gap-2">
                      {a.reason && <span className="text-xs text-slate-400">{a.reason}</span>}
                      <StatusBadge status={a.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </FormCard>
        </TabsContent>

        <TabsContent value="fees" className="mt-4 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Billed', value: `$${balance.billed.toFixed(2)}`, color: 'text-slate-800' },
              { label: 'Amount Paid',  value: `$${balance.paid.toFixed(2)}`,   color: 'text-emerald-600' },
              { label: 'Balance Due',  value: `$${balance.balance.toFixed(2)}`,color: balance.balance > 0 ? 'text-red-500' : 'text-emerald-600' },
            ].map(item => (
              <FormCard key={item.label}>
                <div className="px-5 py-4 text-center">
                  <p className="text-xs text-slate-400 font-medium">{item.label}</p>
                  <p className={`text-xl font-bold mt-1 ${item.color}`}>{item.value}</p>
                </div>
              </FormCard>
            ))}
          </div>
          <FormCard>
            {(ledger ?? []).length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-10">No fee entries.</p>
            ) : (
              <div className="divide-y divide-slate-50">
                {(ledger ?? []).map((l: any) => (
                  <div key={l.id} className="flex items-center justify-between px-6 py-3.5">
                    <div>
                      <p className="text-sm font-semibold text-slate-800 capitalize">{l.fee_type ?? 'Tuition'}</p>
                      {l.due_date && <p className="text-xs text-slate-400 mt-0.5">Due {new Date(l.due_date).toLocaleDateString('en-ZW')}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono text-slate-700">${Number(l.amount_paid).toFixed(2)} / ${Number(l.amount_billed).toFixed(2)}</p>
                      <StatusBadge status={Number(l.amount_paid) >= Number(l.amount_billed) ? 'paid' : Number(l.amount_paid) > 0 ? 'partial' : 'unpaid'} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </FormCard>
        </TabsContent>
      </Tabs>
    </FormShell>
  )
}
