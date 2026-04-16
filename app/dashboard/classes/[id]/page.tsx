'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { classesApi } from '@/lib/api/client'
import { FormShell, FormCard } from '@/components/ui-custom/FormShell'
import { StatusBadge } from '@/components/ui-custom/StatusBadge'
import {
  Users, BookOpen, GraduationCap, ClipboardList,
  TrendingUp, Calendar, BarChart2, ChevronRight, Search,
} from 'lucide-react'
import Link from 'next/link'

type Tab = 'overview' | 'students' | 'assessments'

interface ClassDetail {
  class: {
    id: string; name: string; capacity: number | null
    grades: { name: string; level: number } | null
    user_profiles: { first_name: string; last_name: string } | null
    academic_years: { year: string; term: number } | null
  }
  students: {
    id: string; first_name: string; last_name: string
    reg_number: string; gender: string; boarding: boolean
    active: boolean; fee_status: string; attendance_pct: number
  }[]
  assignments: {
    id: string; subject_id: string
    subjects: { name: string; code: string } | null
    user_profiles: { first_name: string; last_name: string } | null
  }[]
  assessments: {
    id: string; title: string; type: string; max_marks: number; date: string
    subjects: { name: string; code: string } | null
  }[]
  marks: {
    assessment_id: string; raw_score: number
    assessments: { max_marks: number } | null
  }[]
}

const TYPE_COLORS: Record<string, string> = {
  test:             'bg-blue-50 text-blue-700 border-blue-100',
  exam:             'bg-red-50 text-red-700 border-red-100',
  class_assessment: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  practical:        'bg-violet-50 text-violet-700 border-violet-100',
  project:          'bg-amber-50 text-amber-700 border-amber-100',
  assignment:       'bg-sky-50 text-sky-700 border-sky-100',
}

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700', 'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700', 'bg-cyan-100 text-cyan-700',
]

export default function ClassDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<ClassDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('overview')
  const [search, setSearch] = useState('')

  useEffect(() => {
    classesApi.get(id).then(res => {
      if ((res as any).data) setData((res as any).data as ClassDetail)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="space-y-5 max-w-5xl">
        <div className="h-8 w-48 bg-slate-100 rounded-lg animate-pulse" />
        <div className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-slate-500">Class not found.</p>
        <Link href="/dashboard/classes" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
          Back to Classes
        </Link>
      </div>
    )
  }

  const { class: cls, students, assignments, assessments, marks } = data

  const activeStudents = students.filter(s => s.active)
  const enrolled = activeStudents.length

  const avgAttendance = enrolled
    ? Math.round(activeStudents.reduce((s, st) => s + (st.attendance_pct ?? 0), 0) / enrolled)
    : 0

  const feeCleared = enrolled
    ? Math.round((activeStudents.filter(s => s.fee_status === 'cleared').length / enrolled) * 100)
    : 0

  // Per-assessment avg marks
  const marksByAssessment = marks.reduce<Record<string, number[]>>((acc, m) => {
    if (!acc[m.assessment_id]) acc[m.assessment_id] = []
    const maxMarks = m.assessments?.max_marks ?? 100
    acc[m.assessment_id].push((m.raw_score / maxMarks) * 100)
    return acc
  }, {})

  const assessmentsWithAvg = assessments.map(a => {
    const pcts = marksByAssessment[a.id] ?? []
    const avg = pcts.length ? Math.round(pcts.reduce((s, p) => s + p, 0) / pcts.length) : null
    return { ...a, avg, marksCount: pcts.length }
  })

  const filteredStudents = search
    ? activeStudents.filter(s =>
        `${s.first_name} ${s.last_name} ${s.reg_number}`.toLowerCase().includes(search.toLowerCase())
      )
    : activeStudents

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview',    label: 'Overview',    icon: <BarChart2 className="h-3.5 w-3.5" /> },
    { key: 'students',    label: `Students (${enrolled})`,   icon: <Users className="h-3.5 w-3.5" /> },
    { key: 'assessments', label: `Assessments (${assessments.length})`, icon: <ClipboardList className="h-3.5 w-3.5" /> },
  ]

  return (
    <FormShell
      back={{ href: '/dashboard/classes', label: 'Classes' }}
      title={cls.name}
      description={cls.grades?.name ?? ''}
      maxWidth="max-w-5xl"
    >
      {/* Info strip */}
      <FormCard>
        <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-6 divide-x divide-slate-50">
          {[
            { label: 'Grade',       value: cls.grades?.name ?? '—',     icon: <GraduationCap className="h-4 w-4 text-blue-400" /> },
            { label: 'Homeroom',    value: cls.user_profiles ? `${cls.user_profiles.first_name} ${cls.user_profiles.last_name}` : '—', icon: <Users className="h-4 w-4 text-violet-400" /> },
            { label: 'Enrolled',    value: `${enrolled}${cls.capacity ? ` / ${cls.capacity}` : ''}`, icon: <Users className="h-4 w-4 text-emerald-400" /> },
            { label: 'Term',        value: cls.academic_years ? `${cls.academic_years.year} — T${cls.academic_years.term}` : '—', icon: <Calendar className="h-4 w-4 text-amber-400" /> },
          ].map(item => (
            <div key={item.label} className="px-0 sm:px-4 first:pl-0">
              <div className="flex items-center gap-1.5 mb-1">
                {item.icon}
                <p className="text-xs text-slate-400 font-medium">{item.label}</p>
              </div>
              <p className="text-sm font-semibold text-slate-800">{item.value}</p>
            </div>
          ))}
        </div>
      </FormCard>

      {/* Quick stat pills */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Avg Attendance', value: `${avgAttendance}%`, color: avgAttendance >= 90 ? 'text-emerald-600' : avgAttendance >= 75 ? 'text-amber-600' : 'text-red-600', bg: 'bg-white', bar: avgAttendance },
          { label: 'Fees Cleared',   value: `${feeCleared}%`,   color: feeCleared >= 80 ? 'text-emerald-600' : feeCleared >= 50 ? 'text-amber-600' : 'text-red-600',       bg: 'bg-white', bar: feeCleared },
          { label: 'Subjects',       value: `${assignments.length}`, color: 'text-slate-800', bg: 'bg-white', bar: null },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} rounded-2xl border border-slate-100 shadow-sm p-4`}>
            <p className="text-xs text-slate-400 font-medium mb-1">{stat.label}</p>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            {stat.bar !== null && (
              <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${stat.bar >= 90 ? 'bg-emerald-400' : stat.bar >= 60 ? 'bg-amber-400' : 'bg-red-400'}`}
                  style={{ width: `${Math.min(100, stat.bar)}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              tab === t.key
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ─────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Subject assignments */}
          <FormCard>
            <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-50">
              <div className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <p className="text-sm font-bold text-slate-800">Subject Teachers</p>
              <span className="ml-auto text-xs text-slate-400">{assignments.length} subjects</span>
            </div>
            {assignments.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-10">No teacher assignments yet.</p>
            ) : (
              <div className="divide-y divide-slate-50">
                {assignments.map(a => (
                  <div key={a.id} className="flex items-center gap-3 px-6 py-3">
                    <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-slate-500">{a.subjects?.code}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{a.subjects?.name}</p>
                      <p className="text-xs text-slate-400">{a.user_profiles?.first_name} {a.user_profiles?.last_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </FormCard>

          {/* Assessment performance */}
          <FormCard>
            <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-50">
              <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <p className="text-sm font-bold text-slate-800">Recent Assessments</p>
              <span className="ml-auto text-xs text-slate-400">{assessments.length} total</span>
            </div>
            {assessmentsWithAvg.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-10">No assessments yet.</p>
            ) : (
              <div className="divide-y divide-slate-50">
                {assessmentsWithAvg.slice(0, 5).map(a => (
                  <div key={a.id} className="px-6 py-3">
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{a.title}</p>
                        <p className="text-xs text-slate-400">{a.subjects?.name}</p>
                      </div>
                      <div className="text-right shrink-0">
                        {a.avg !== null ? (
                          <span className={`text-sm font-bold ${a.avg >= 60 ? 'text-emerald-600' : a.avg >= 40 ? 'text-amber-600' : 'text-red-500'}`}>
                            {a.avg}%
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">No marks</span>
                        )}
                      </div>
                    </div>
                    {a.avg !== null && (
                      <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${a.avg >= 60 ? 'bg-emerald-400' : a.avg >= 40 ? 'bg-amber-400' : 'bg-red-400'}`}
                          style={{ width: `${a.avg}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </FormCard>
        </div>
      )}

      {/* ── Students Tab ─────────────────────────────────────────────────── */}
      {tab === 'students' && (
        <FormCard>
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-50">
            <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <p className="text-sm font-bold text-slate-800">Student Roster</p>
            <span className="ml-auto text-xs font-semibold text-slate-400">{enrolled} enrolled</span>
          </div>
          <div className="px-6 py-3 border-b border-slate-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search students…"
                className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white transition-colors"
              />
            </div>
          </div>
          {filteredStudents.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10">No students found.</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {filteredStudents.map((s, idx) => {
                const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length]
                const attColor = (s.attendance_pct ?? 0) >= 90 ? 'bg-emerald-400' : (s.attendance_pct ?? 0) >= 75 ? 'bg-amber-400' : 'bg-red-400'
                return (
                  <div key={s.id} className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50/60 transition-colors group">
                    <div className={`h-8 w-8 rounded-full ${avatarColor} flex items-center justify-center text-xs font-bold shrink-0`}>
                      {s.first_name[0]}{s.last_name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/students/${s.id}`}
                          className="text-sm font-semibold text-slate-800 hover:text-blue-600 transition-colors truncate"
                        >
                          {s.last_name}, {s.first_name}
                        </Link>
                        {s.boarding && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
                            Boarding
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-mono">{s.reg_number}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 shrink-0">
                      {/* Attendance */}
                      <div className="text-right w-16">
                        <p className="text-xs font-semibold text-slate-700">{s.attendance_pct ?? '—'}%</p>
                        <div className="mt-0.5 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${attColor} rounded-full`} style={{ width: `${s.attendance_pct ?? 0}%` }} />
                        </div>
                      </div>
                      <StatusBadge status={s.fee_status ?? 'unpaid'} />
                    </div>
                    <Link
                      href={`/dashboard/students/${s.id}`}
                      className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    >
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </FormCard>
      )}

      {/* ── Assessments Tab ──────────────────────────────────────────────── */}
      {tab === 'assessments' && (
        <FormCard>
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-50">
            <div className="h-7 w-7 rounded-lg bg-violet-50 flex items-center justify-center">
              <ClipboardList className="h-3.5 w-3.5 text-violet-600" />
            </div>
            <p className="text-sm font-bold text-slate-800">Assessments</p>
            <span className="ml-auto text-xs text-slate-400">{assessments.length} total</span>
          </div>
          {assessmentsWithAvg.length === 0 ? (
            <div className="py-16 text-center">
              <ClipboardList className="h-8 w-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No assessments for this class yet.</p>
              <Link href="/dashboard/assessments" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                Go to Assessments →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {assessmentsWithAvg.map(a => {
                const typeColor = TYPE_COLORS[a.type] ?? 'bg-slate-50 text-slate-600 border-slate-100'
                return (
                  <div key={a.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-slate-800 truncate">{a.title}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${typeColor}`}>
                          {a.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {a.subjects?.name} · {new Date(a.date).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' })} · {a.max_marks} marks
                      </p>
                    </div>
                    <div className="hidden sm:block text-right shrink-0 w-24">
                      {a.avg !== null ? (
                        <>
                          <p className={`text-sm font-bold ${a.avg >= 60 ? 'text-emerald-600' : a.avg >= 40 ? 'text-amber-600' : 'text-red-500'}`}>
                            {a.avg}% avg
                          </p>
                          <p className="text-xs text-slate-400">{a.marksCount} entered</p>
                        </>
                      ) : (
                        <p className="text-xs text-slate-400">No marks</p>
                      )}
                    </div>
                    <Link
                      href={`/dashboard/marks?assessment_id=${a.id}`}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 shrink-0"
                    >
                      Marks →
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </FormCard>
      )}
    </FormShell>
  )
}
