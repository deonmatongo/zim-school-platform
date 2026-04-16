'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { marksApi, attendanceApi, homeworkApi, announcementsApi, studentsApi } from '@/lib/api/client'
import {
  TrendingUp, CalendarCheck, BookMarked, Megaphone,
  GraduationCap, ArrowRight, Clock, CheckCircle2, XCircle, AlertCircle,
} from 'lucide-react'
import Link from 'next/link'

interface Mark {
  id: string; raw_score: number
  assessments: { title: string; max_marks: number; date: string; type: string; subjects: { name: string } | null } | null
}
interface HomeworkItem {
  id: string; title: string; due_date: string; set_date: string
  subjects: { name: string } | null; classes: { name: string } | null
}
interface AttendanceRecord { id: string; date: string; status: string }
interface StudentProfile {
  id: string; first_name: string; last_name: string; reg_number: string
  class_id: string; classes: { name: string } | null
}

const GRADE_LETTER = (pct: number) => pct >= 75 ? 'A' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : pct >= 40 ? 'D' : 'U'
const GRADE_COLOR  = (pct: number) => pct >= 75 ? 'text-emerald-600' : pct >= 60 ? 'text-blue-600' : pct >= 40 ? 'text-amber-600' : 'text-red-500'
const GRADE_CHIP   = (pct: number) => pct >= 75 ? 'bg-emerald-100 text-emerald-700' : pct >= 60 ? 'bg-blue-100 text-blue-700' : pct >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'

const TYPE_DOT: Record<string, string> = {
  test: 'bg-blue-400', exam: 'bg-red-400',
  class_assessment: 'bg-emerald-400', practical: 'bg-violet-400', project: 'bg-amber-400',
}

const STATUS_ICON: Record<string, any> = {
  present: CheckCircle2, absent: XCircle, late: Clock, excused: AlertCircle,
}
const STATUS_COLOR: Record<string, string> = {
  present: 'text-emerald-600', absent: 'text-red-500', late: 'text-amber-600', excused: 'text-blue-600',
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const [profile, setProfile]           = useState<StudentProfile | null>(null)
  const [marks, setMarks]               = useState<Mark[]>([])
  const [homework, setHomework]         = useState<HomeworkItem[]>([])
  const [attendance, setAttendance]     = useState<AttendanceRecord[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading]           = useState(true)

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  useEffect(() => {
    if (!user) return
    Promise.all([
      studentsApi.get(user.id),
      announcementsApi.list({ limit: '4' }),
    ]).then(([profileRes, annRes]) => {
      const p = (profileRes.data as StudentProfile) ?? null
      setProfile(p)
      setAnnouncements((annRes.data as any[]) ?? [])

      if (p) {
        Promise.all([
          marksApi.list({ student_id: p.id }),
          attendanceApi.list({ student_id: p.id }),
          homeworkApi.list({ class_id: p.class_id }),
        ]).then(([m, att, hw]) => {
          setMarks((m.data as Mark[]) ?? [])
          setAttendance((att.data as AttendanceRecord[]) ?? [])
          setHomework((hw.data as HomeworkItem[]) ?? [])
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })
  }, [user?.id])

  if (loading) return (
    <div className="space-y-5">
      <div className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-3 gap-3">{[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">{[...Array(2)].map((_, i) => <div key={i} className="h-56 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
    </div>
  )

  const today = new Date().toISOString().slice(0, 10)
  const recentMarks = [...marks].sort((a, b) => (b.assessments?.date ?? '').localeCompare(a.assessments?.date ?? '')).slice(0, 5)
  const upcomingHw  = homework.filter(h => h.due_date >= today).slice(0, 4)
  const totalAtt    = attendance.length
  const presentAtt  = attendance.filter(r => r.status === 'present' || r.status === 'late').length
  const attPct      = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : null
  const avgPct      = marks.length
    ? Math.round(marks.reduce((s, m) => s + Math.round((m.raw_score / (m.assessments?.max_marks ?? 100)) * 100), 0) / marks.length)
    : null
  const recentAtt   = [...attendance].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)

  return (
    <div className="space-y-6">

      {/* Hero banner */}
      <div className="relative bg-gradient-to-br from-slate-800 via-slate-800 to-slate-700 rounded-2xl overflow-hidden px-6 py-5 shadow-sm">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 24px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 24px)' }} />
        <div className="relative">
          <p className="text-slate-400 text-xs font-medium">{greeting},</p>
          <h1 className="text-xl font-bold text-white mt-0.5">{user?.firstName} {user?.lastName}</h1>
          <p className="text-slate-400 text-xs mt-1">
            {profile?.classes?.name ?? '—'}{profile?.reg_number ? ` · ${profile.reg_number}` : ''}
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        {/* Academic average */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <p className="text-xs text-slate-400 font-medium truncate">Academic Avg</p>
          </div>
          {avgPct !== null ? (
            <>
              <p className={`text-2xl font-bold leading-none ${GRADE_COLOR(avgPct)}`}>{avgPct}%</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: `${avgPct}%` }} />
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${GRADE_CHIP(avgPct)}`}>
                  {GRADE_LETTER(avgPct)}
                </span>
              </div>
            </>
          ) : (
            <p className="text-2xl font-bold text-slate-300">—</p>
          )}
        </div>

        {/* Attendance */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
              <CalendarCheck className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <p className="text-xs text-slate-400 font-medium">Attendance</p>
          </div>
          {attPct !== null ? (
            <>
              <p className={`text-2xl font-bold leading-none ${attPct >= 90 ? 'text-emerald-600' : attPct >= 75 ? 'text-amber-600' : 'text-red-500'}`}>
                {attPct}%
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${attPct >= 90 ? 'bg-emerald-400' : attPct >= 75 ? 'bg-amber-400' : 'bg-red-400'}`}
                    style={{ width: `${attPct}%` }} />
                </div>
                <span className={`text-[10px] font-semibold ${attPct >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {attPct >= 90 ? 'Good' : attPct >= 75 ? 'Fair' : 'Low'}
                </span>
              </div>
            </>
          ) : (
            <p className="text-2xl font-bold text-slate-300">—</p>
          )}
        </div>

        {/* Pending homework */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-7 w-7 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
              <BookMarked className="h-3.5 w-3.5 text-amber-600" />
            </div>
            <p className="text-xs text-slate-400 font-medium">Homework Due</p>
          </div>
          <p className="text-2xl font-bold text-slate-800 leading-none">{upcomingHw.length}</p>
          <p className="text-xs text-slate-400 mt-2">upcoming assignments</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'My Marks',      href: '/dashboard/marks',      icon: GraduationCap, bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-100' },
          { label: 'Homework',      href: '/dashboard/homework',   icon: BookMarked,    bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-100' },
          { label: 'Attendance',    href: '/dashboard/attendance', icon: CalendarCheck, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
        ].map(({ label, href, icon: Icon, bg, text, border }) => (
          <Link key={href} href={href}
            className={`flex flex-col items-center gap-2 py-4 rounded-2xl border ${bg} ${border} hover:shadow-sm transition-all group`}>
            <div className={`h-9 w-9 rounded-xl ${bg} border ${border} flex items-center justify-center group-hover:scale-105 transition-transform`}>
              <Icon className={`h-[18px] w-[18px] ${text}`} />
            </div>
            <span className={`text-xs font-semibold ${text}`}>{label}</span>
          </Link>
        ))}
      </div>

      {/* Marks + Homework */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent Marks */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-50">
            <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <GraduationCap className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <p className="text-sm font-bold text-slate-800">Recent Marks</p>
            <Link href="/dashboard/marks" className="ml-auto text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
              All marks <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentMarks.length === 0 ? (
            <div className="py-10 text-center">
              <GraduationCap className="h-6 w-6 text-slate-200 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No marks recorded yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentMarks.map(m => {
                const pct = Math.round((m.raw_score / (m.assessments?.max_marks ?? 100)) * 100)
                const dot = TYPE_DOT[m.assessments?.type ?? ''] ?? 'bg-slate-300'
                return (
                  <div key={m.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/40 transition-colors">
                    <div className={`h-2 w-2 rounded-full shrink-0 ${dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{m.assessments?.title}</p>
                      <p className="text-[11px] text-slate-400">
                        {m.assessments?.subjects?.name}
                        {m.assessments?.date && ` · ${new Date(m.assessments.date).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short' })}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-bold tabular-nums ${GRADE_COLOR(pct)}`}>{m.raw_score}/{m.assessments?.max_marks}</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${GRADE_CHIP(pct)}`}>{GRADE_LETTER(pct)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Upcoming Homework */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-50">
            <div className="h-7 w-7 rounded-lg bg-amber-50 flex items-center justify-center">
              <BookMarked className="h-3.5 w-3.5 text-amber-600" />
            </div>
            <p className="text-sm font-bold text-slate-800">Upcoming Homework</p>
            <Link href="/dashboard/homework" className="ml-auto text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {upcomingHw.length === 0 ? (
            <div className="py-10 text-center">
              <BookMarked className="h-6 w-6 text-slate-200 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No upcoming homework.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {upcomingHw.map(h => {
                const daysLeft = Math.ceil((new Date(h.due_date).getTime() - new Date(today).getTime()) / 86400000)
                const urgent = daysLeft <= 2
                return (
                  <Link key={h.id} href={`/dashboard/homework/${h.id}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/40 transition-colors">
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${urgent ? 'bg-red-50' : 'bg-amber-50'}`}>
                      <Clock className={`h-3.5 w-3.5 ${urgent ? 'text-red-500' : 'text-amber-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{h.title}</p>
                      <p className="text-[11px] text-slate-400">{h.subjects?.name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-xs font-bold ${urgent ? 'text-red-500' : 'text-slate-600'}`}>
                        {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft}d`}
                      </p>
                      <p className="text-[10px] text-slate-400">{new Date(h.due_date).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Attendance + Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent Attendance */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-50">
            <div className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CalendarCheck className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <p className="text-sm font-bold text-slate-800">Recent Attendance</p>
            <Link href="/dashboard/attendance" className="ml-auto text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
              Full record <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentAtt.length === 0 ? (
            <div className="py-10 text-center">
              <CalendarCheck className="h-6 w-6 text-slate-200 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No attendance records yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentAtt.map(r => {
                const Icon = STATUS_ICON[r.status] ?? CheckCircle2
                const color = STATUS_COLOR[r.status] ?? 'text-slate-500'
                return (
                  <div key={r.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/40 transition-colors">
                    <Icon className={`h-4 w-4 shrink-0 ${color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700">
                        {new Date(r.date).toLocaleDateString('en-ZW', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold capitalize ${color}`}>{r.status}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-50">
            <div className="h-7 w-7 rounded-lg bg-amber-50 flex items-center justify-center">
              <Megaphone className="h-3.5 w-3.5 text-amber-600" />
            </div>
            <p className="text-sm font-bold text-slate-800">Announcements</p>
            <Link href="/dashboard/announcements" className="ml-auto text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {announcements.length === 0 ? (
            <div className="py-10 text-center">
              <Megaphone className="h-6 w-6 text-slate-200 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No announcements.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {announcements.map((a: any) => (
                <div key={a.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50/40 transition-colors">
                  <div className={`mt-0.5 h-6 w-6 rounded-lg flex items-center justify-center shrink-0 ${a.pinned ? 'bg-amber-50' : 'bg-slate-50'}`}>
                    <Megaphone className={`h-3 w-3 ${a.pinned ? 'text-amber-500' : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{a.title}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{a.body}</p>
                    <p className="text-[10px] text-slate-300 mt-0.5">
                      {new Date(a.created_at).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
