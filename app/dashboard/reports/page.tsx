import { requireRole } from '@/lib/auth/getSession'
import { createClient } from '@/lib/supabase/server'
import { classes as devClasses, academicYears as devAcademicYears, reportCards as devReportCards } from '@/lib/dev/seed-data'
import { PageHeader } from '@/components/ui-custom/PageHeader'
import { buttonVariants } from '@/components/ui/button'
import { BarChart3, GraduationCap, Users, FileDown, BookOpen, Trophy } from 'lucide-react'
import Link from 'next/link'
import { GenerateReportButton } from './GenerateReportButton'

export default async function ReportsPage() {
  const user = await requireRole(['admin', 'teacher'])

  let classes: any[]
  let currentYear: any
  let recentReports: any[]

  if (process.env.DEV_BYPASS === 'true') {
    classes = devClasses
    currentYear = devAcademicYears.find(y => y.is_current) ?? devAcademicYears[0]
    recentReports = devReportCards
  } else {
    const supabase = createClient()
    const [
      { data: cls },
      { data: cy },
      { data: rr },
    ] = await Promise.all([
      supabase.from('classes').select('id, name, grades(name)').eq('school_id', user.schoolId).order('name'),
      supabase.from('academic_years').select('id, year, term').eq('school_id', user.schoolId).eq('is_current', true).single(),
      supabase.from('report_cards').select('*, students(first_name, last_name, reg_number)').eq('school_id', user.schoolId)
        .not('pdf_url', 'is', null).order('generated_at', { ascending: false }).limit(10),
    ])
    classes = cls ?? []
    currentYear = cy
    recentReports = rr ?? []
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description={currentYear ? `${currentYear.year} — Term ${currentYear.term}` : 'No active academic year'}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Class reports */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-50">
            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Class Performance Reports</h3>
              <p className="text-xs text-slate-400 mt-0.5">View analytics per class</p>
            </div>
          </div>
          <div className="p-3 space-y-1">
            {(classes ?? []).length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">No classes found.</p>
            )}
            {(classes ?? []).map((c: any) => (
              <div key={c.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <BookOpen className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.grades?.name}</p>
                  </div>
                </div>
                <Link
                  href={`/api/reports/class/${c.id}${currentYear ? `?academic_year_id=${currentYear.id}` : ''}`}
                  target="_blank"
                  className={buttonVariants({ size: 'sm', variant: 'outline' })}
                >
                  <BarChart3 className="h-3.5 w-3.5 mr-1.5" /> View
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Generate individual report cards */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-50">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
              <GraduationCap className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Generate Report Cards</h3>
              <p className="text-xs text-slate-400 mt-0.5">Produce student PDF reports</p>
            </div>
          </div>
          <div className="p-5">
            {user.role === 'admin' ? (
              <GenerateReportButton academicYearId={currentYear?.id} />
            ) : (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-sm text-slate-400">Report card generation is admin-only.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent generated reports */}
      {(recentReports ?? []).length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-50">
            <div className="h-8 w-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
              <Trophy className="h-4 w-4 text-violet-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Recently Generated Report Cards</h3>
          </div>
          <div className="p-3 space-y-1">
            {(recentReports ?? []).map((r: any) => (
              <div key={r.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-700 shrink-0">
                    {r.students?.first_name?.[0]}{r.students?.last_name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{r.students?.first_name} {r.students?.last_name}</p>
                    <p className="text-xs text-slate-400 font-mono">
                      {r.students?.reg_number}
                      {r.overall_average != null && <span className="ml-2 not-italic text-slate-500">Avg: <span className="font-semibold">{r.overall_average.toFixed(1)}%</span></span>}
                      {r.class_position != null && <span className="ml-2 not-italic text-slate-500">Pos: <span className="font-semibold">{r.class_position}/{r.total_students}</span></span>}
                    </p>
                  </div>
                </div>
                {r.pdf_url && (
                  <a href={r.pdf_url} target="_blank" rel="noopener noreferrer"
                    className={buttonVariants({ size: 'sm', variant: 'outline' })}>
                    <FileDown className="h-3.5 w-3.5 mr-1.5" /> PDF
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
