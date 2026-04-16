import { requireRole } from '@/lib/auth/getSession'
import { createClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/ui-custom/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui-custom/StatusBadge'
import { Users, BookMarked, ClipboardList, CalendarCheck } from 'lucide-react'
import Link from 'next/link'

export default async function TeacherDashboard() {
  const user = await requireRole(['teacher'])
  const supabase = createClient()

  const { data: assignments } = await supabase
    .from('teacher_assignments')
    .select('class_id, subject_id, classes(name), subjects(name, code)')
    .eq('teacher_id', user.id)

  const classIds = Array.from(new Set((assignments ?? []).map((a) => a.class_id)))

  const [
    { count: studentCount },
    { data: recentHomework },
    { data: recentAssessments },
  ] = await Promise.all([
    classIds.length > 0
      ? supabase.from('students').select('id', { count: 'exact', head: true }).in('class_id', classIds).eq('active', true)
      : Promise.resolve({ count: 0 }),
    supabase.from('homework').select('id, title, due_date, subjects(name)').eq('created_by', user.id)
      .order('due_date', { ascending: false }).limit(5),
    supabase.from('assessments').select('id, title, date, type, subjects(name), classes(name)').eq('created_by', user.id)
      .order('date', { ascending: false }).limit(5),
  ])

  type Assignment = { class_id: string; subject_id: string; classes: { name: string } | null; subjects: { name: string; code: string } | null }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Good morning, {user.firstName} 👋</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your classes and tasks for today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="My Classes" value={classIds.length} icon={Users} color="#1a5276" />
        <StatCard title="Students" value={studentCount ?? 0} icon={CalendarCheck} color="#8e44ad" />
        <StatCard title="Subjects" value={(assignments ?? []).length} icon={ClipboardList} color="#27ae60" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My class assignments */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">My Assignments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(assignments ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No class assignments yet.</p>
            )}
            {(assignments as unknown as Assignment[] ?? []).map((a, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <div>
                  <p className="text-sm font-medium">{a.classes?.name ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">{a.subjects?.name}</p>
                </div>
                <Link href={`/dashboard/marks?class_id=${a.class_id}&subject_id=${a.subject_id}`}
                  className="text-xs text-blue-600 hover:underline">Enter marks →</Link>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent homework */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Recent Homework</CardTitle>
              <Link href="/dashboard/homework" className="text-xs text-blue-600 hover:underline">View all</Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {(recentHomework ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No homework set yet.</p>
            )}
            {(recentHomework ?? []).map((h: any) => (
              <div key={h.id} className="flex items-start gap-3 p-2 rounded-lg">
                <BookMarked className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{h.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Due {new Date(h.due_date).toLocaleDateString('en-ZW')} · {h.subjects?.name}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
