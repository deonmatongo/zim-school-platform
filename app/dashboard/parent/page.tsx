'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { parentApi, marksApi, homeworkApi, announcementsApi, messagesApi } from '@/lib/api/client'
import { formatMoney } from '@/lib/utils/fees'

// ── Dummy data (remove or set false when API is live) ─────────────────────────
const USE_DUMMY = true

const DUMMY_CHILDREN: Child[] = [
  {
    id: 'c1', parent_id: 'p1', student_id: 's1',
    fee_balance: 120, fee_billed: 400, fee_paid: 280, fee_status: 'partial',
    avg_mark_pct: 72, attendance_pct: 91,
    students: {
      id: 's1', first_name: 'Takudzwa', last_name: 'Moyo',
      reg_number: 'STU/2024/0041', class_id: 'cls1',
      classes: { name: 'Form 2A', grades: { name: 'Form 2' } },
    },
  },
  {
    id: 'c2', parent_id: 'p1', student_id: 's2',
    fee_balance: 0, fee_billed: 400, fee_paid: 400, fee_status: 'paid',
    avg_mark_pct: 85, attendance_pct: 97,
    students: {
      id: 's2', first_name: 'Simba', last_name: 'Moyo',
      reg_number: 'STU/2024/0087', class_id: 'cls2',
      classes: { name: 'Form 3B', grades: { name: 'Form 3' } },
    },
  },
]

const DUMMY_MARKS: Mark[] = [
  { id: 'm1', raw_score: 74, assessments: { title: 'Mid-Term Maths Test', max_marks: 100, date: '2026-04-10', type: 'test', subjects: { name: 'Mathematics' } } },
  { id: 'm2', raw_score: 58, assessments: { title: 'English Essay', max_marks: 80, date: '2026-04-08', type: 'class_assessment', subjects: { name: 'English Language' } } },
  { id: 'm3', raw_score: 42, assessments: { title: 'Science Practical', max_marks: 60, date: '2026-04-05', type: 'practical', subjects: { name: 'Integrated Science' } } },
  { id: 'm4', raw_score: 88, assessments: { title: 'History Quiz', max_marks: 100, date: '2026-04-03', type: 'test', subjects: { name: 'History' } } },
  { id: 'm5', raw_score: 65, assessments: { title: 'Geography Map Work', max_marks: 80, date: '2026-03-28', type: 'project', subjects: { name: 'Geography' } } },
]

const DUMMY_HOMEWORK: HomeworkItem[] = [
  { id: 'h1', title: 'Algebra: Quadratic Equations (Ex 7.4)', due_date: '2026-04-17', set_date: '2026-04-14', subjects: { name: 'Mathematics' }, classes: { name: 'Form 2A' } },
  { id: 'h2', title: 'Write a persuasive essay (500 words)', due_date: '2026-04-18', set_date: '2026-04-14', subjects: { name: 'English Language' }, classes: { name: 'Form 2A' } },
  { id: 'h3', title: 'Read Chapter 6 – The Cell', due_date: '2026-04-21', set_date: '2026-04-15', subjects: { name: 'Integrated Science' }, classes: { name: 'Form 2A' } },
  { id: 'h4', title: 'Draw and label a map of Southern Africa', due_date: '2026-04-24', set_date: '2026-04-15', subjects: { name: 'Geography' }, classes: { name: 'Form 2A' } },
]

const DUMMY_ANNOUNCEMENTS = [
  { id: 'a1', title: 'Term 2 Fee Deadline – 25 April', body: 'All outstanding Term 2 fees must be settled by 25 April 2026. Late payments attract a 5% surcharge.', pinned: true, created_at: '2026-04-12T08:00:00Z' },
  { id: 'a2', title: 'Inter-Schools Sports Day – 3 May', body: "Zimbabwe Schools will host the annual inter-schools athletics day. Parents are welcome to attend.", pinned: false, created_at: '2026-04-10T10:30:00Z' },
  { id: 'a3', title: 'Parent-Teacher Meetings – 30 April', body: 'Bookings for the mid-term parent-teacher meetings are now open. Please contact the school office to reserve a slot.', pinned: false, created_at: '2026-04-09T09:00:00Z' },
  { id: 'a4', title: 'School Closure – 18 April (Good Friday)', body: 'The school will be closed on Friday 18 April 2026 in observance of Good Friday.', pinned: false, created_at: '2026-04-07T07:00:00Z' },
]

const DUMMY_MESSAGES: Message[] = [
  {
    id: 'msg1', thread_id: 't1', body: 'Good morning. Takudzwa has been struggling with the algebra unit. I would recommend extra practice over the holiday.', created_at: '2026-04-14T11:20:00Z', read_at: null,
    sender: { id: 'tc1', first_name: 'Mr', last_name: 'Chikwanda', role: 'teacher' },
    recipient: { id: 'p1', first_name: 'Grace', last_name: 'Moyo', role: 'parent' },
    student: { id: 's1', first_name: 'Takudzwa', last_name: 'Moyo' },
  },
  {
    id: 'msg2', thread_id: 't2', body: "Simba's science project submission is outstanding. Please remind him it is due this Friday.", created_at: '2026-04-13T09:05:00Z', read_at: '2026-04-13T14:00:00Z',
    sender: { id: 'tc2', first_name: 'Mrs', last_name: 'Nyamudeza', role: 'teacher' },
    recipient: { id: 'p1', first_name: 'Grace', last_name: 'Moyo', role: 'parent' },
    student: { id: 's2', first_name: 'Simba', last_name: 'Moyo' },
  },
]

interface ReportCard {
  id: string; student_id: string; academic_year: string; term: number
  overall_average: number | null; class_position: number | null; total_students: number | null
  pdf_url: string | null; generated_at: string | null
}

const DUMMY_REPORT_CARDS: ReportCard[] = [
  // Simba has a report from last year's end-of-year
  {
    id: 'rc1', student_id: 's2', academic_year: '2025', term: 3,
    overall_average: 81.4, class_position: 4, total_students: 32,
    pdf_url: '#', generated_at: '2025-11-30T10:00:00Z',
  },
  // Takudzwa has no report yet (current year in progress)
]
// ─────────────────────────────────────────────────────────────────────────────
import {
  TrendingUp, CalendarCheck, CreditCard, BookMarked,
  Megaphone, MessageCircle, ArrowRight, ChevronRight,
  GraduationCap, AlertCircle, CheckCircle2, Clock,
  FileText, User, FileDown, Award, Lock,
} from 'lucide-react'
import Link from 'next/link'

interface Child {
  id: string; parent_id: string; student_id: string
  fee_balance: number; fee_billed: number; fee_paid: number
  avg_mark_pct: number | null; attendance_pct: number | null; fee_status: string
  students: {
    id: string; first_name: string; last_name: string
    reg_number: string; class_id: string
    classes: { name: string; grades?: { name: string } } | null
  }
}

interface Mark {
  id: string; raw_score: number
  assessments: { title: string; max_marks: number; date: string; type: string; subjects: { name: string } | null } | null
}

interface HomeworkItem {
  id: string; title: string; due_date: string; set_date: string
  subjects: { name: string } | null; classes: { name: string } | null
}

interface Message {
  id: string; thread_id: string; body: string; created_at: string; read_at: string | null
  sender: { id: string; first_name: string; last_name: string; role: string }
  recipient: { id: string; first_name: string; last_name: string; role: string }
  student: { id: string; first_name: string; last_name: string } | null
}

const GRADE_LETTER = (pct: number) => pct >= 75 ? 'A' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : pct >= 40 ? 'D' : 'U'
const GRADE_COLOR  = (pct: number) => pct >= 75 ? 'text-emerald-600' : pct >= 60 ? 'text-blue-600' : pct >= 40 ? 'text-amber-600' : 'text-red-500'
const GRADE_CHIP   = (pct: number) => pct >= 75 ? 'bg-emerald-100 text-emerald-700' : pct >= 60 ? 'bg-blue-100 text-blue-700' : pct >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'

const TYPE_DOT: Record<string, string> = {
  test: 'bg-blue-400', exam: 'bg-red-400',
  class_assessment: 'bg-emerald-400', practical: 'bg-violet-400', project: 'bg-amber-400',
}

export default function ParentDashboard() {
  const { user } = useAuth()
  const [children, setChildren]       = useState<Child[]>([])
  const [activeChildIdx, setActiveChildIdx] = useState(0)
  const [marks, setMarks]             = useState<Mark[]>([])
  const [homework, setHomework]       = useState<HomeworkItem[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [messages, setMessages]       = useState<Message[]>([])
  const [reportCards, setReportCards] = useState<ReportCard[]>([])
  const [loading, setLoading]         = useState(true)
  const [childLoading, setChildLoading] = useState(false)

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  useEffect(() => {
    if (USE_DUMMY) {
      setChildren(DUMMY_CHILDREN)
      setAnnouncements(DUMMY_ANNOUNCEMENTS)
      setMessages(DUMMY_MESSAGES)
      setReportCards(DUMMY_REPORT_CARDS)
      setLoading(false)
      return
    }
    Promise.all([
      parentApi.children(),
      announcementsApi.list({ limit: '5' }),
      messagesApi.list(),
    ]).then(([c, a, m]) => {
      setChildren((c.data as Child[]) ?? [])
      setAnnouncements((a.data as any[]) ?? [])
      setMessages((m.data as Message[]) ?? [])
    }).catch(() => {
      // swallow errors — show empty state rather than an infinite skeleton
    }).finally(() => {
      setLoading(false)
    })
  }, [])

  const activeChild = children[activeChildIdx]

  useEffect(() => {
    if (!activeChild) return
    if (USE_DUMMY) {
      setMarks(DUMMY_MARKS)
      setHomework(DUMMY_HOMEWORK)
      return
    }
    setChildLoading(true)
    Promise.all([
      marksApi.list({ student_id: activeChild.students.id }),
      homeworkApi.list({ class_id: activeChild.students.class_id }),
    ]).then(([m, h]) => {
      setMarks((m.data as Mark[]) ?? [])
      setHomework((h.data as HomeworkItem[]) ?? [])
    }).catch(() => {
      setMarks([])
      setHomework([])
    }).finally(() => {
      setChildLoading(false)
    })
  }, [activeChildIdx, activeChild?.students.id])

  const totalUnread = messages.reduce((acc, msg) => {
    if (!msg.read_at && msg.sender.role !== 'parent') return acc + 1
    return acc
  }, 0)

  const threadPreviews = Object.values(
    messages.reduce<Record<string, { thread_id: string; other: Message['sender'] | Message['recipient']; student: Message['student']; lastMsg: Message; unread: number }>>((acc, msg) => {
      if (!acc[msg.thread_id]) {
        const other = msg.sender.role === 'parent' ? msg.recipient : msg.sender
        acc[msg.thread_id] = { thread_id: msg.thread_id, other, student: msg.student, lastMsg: msg, unread: 0 }
      } else {
        acc[msg.thread_id].lastMsg = msg
      }
      if (!msg.read_at && msg.sender.role !== 'parent') acc[msg.thread_id].unread++
      return acc
    }, {})
  )

  const today       = new Date().toISOString().slice(0, 10)
  const upcomingHw  = homework.filter(h => h.due_date >= today).slice(0, 4)
  const recentMarks = [...marks].sort((a, b) =>
    (b.assessments?.date ?? '').localeCompare(a.assessments?.date ?? '')
  ).slice(0, 5)

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) return (
    <div className="space-y-5">
      <div className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
      <div className="flex gap-2">{[...Array(2)].map((_, i) => <div key={i} className="h-9 w-36 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      <div className="grid grid-cols-3 gap-3">{[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">{[...Array(2)].map((_, i) => <div key={i} className="h-56 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
    </div>
  )

  // ── No children ───────────────────────────────────────────────────────────
  if (children.length === 0) return (
    <div className="py-24 text-center">
      <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
        <GraduationCap className="h-7 w-7 text-slate-400" />
      </div>
      <p className="text-sm font-semibold text-slate-700">No children linked to your account</p>
      <p className="text-xs text-slate-400 mt-1">Please contact the school administrator.</p>
    </div>
  )

  const s = activeChild?.students

  return (
    <div className="space-y-6">

      {/* ── Hero banner ──────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-slate-800 via-slate-800 to-slate-700 rounded-2xl overflow-hidden px-6 py-5 shadow-sm">
        {/* subtle grid texture */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 24px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 24px)' }} />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-slate-400 text-xs font-medium">{greeting},</p>
            <h1 className="text-xl font-bold text-white mt-0.5">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {children.length === 1
                ? `Monitoring ${s?.first_name} ${s?.last_name} · ${s?.classes?.name ?? '—'}`
                : `${children.length} children enrolled`}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {totalUnread > 0 && (
              <Link href="/dashboard/messages"
                className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 transition-colors text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                <MessageCircle className="h-3.5 w-3.5" />
                {totalUnread} unread
              </Link>
            )}
            <Link href="/dashboard/messages"
              className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-white" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Child selector (multi-child) ─────────────────────────────────── */}
      {children.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {children.map((child, idx) => (
            <button key={child.student_id} onClick={() => setActiveChildIdx(idx)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
                activeChildIdx === idx
                  ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${activeChildIdx === idx ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {child.students.first_name[0]}{child.students.last_name[0]}
              </div>
              {child.students.first_name} {child.students.last_name}
            </button>
          ))}
        </div>
      )}

      {activeChild && s && (
        <>
          {/* ── Child identity card ────────────────────────────────────────── */}
          <div className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-sm">
              {s.first_name[0]}{s.last_name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 text-base">{s.first_name} {s.last_name}</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-xs text-slate-400 font-mono">{s.reg_number}</span>
                <span className="text-slate-200">·</span>
                <span className="text-xs font-medium text-slate-500">{s.classes?.name ?? '—'}</span>
                {s.classes?.grades?.name && (
                  <>
                    <span className="text-slate-200">·</span>
                    <span className="text-xs text-slate-400">{s.classes.grades.name}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/dashboard/reports`}
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-600 border border-slate-200 hover:border-slate-300 bg-white px-3 py-1.5 rounded-xl transition-colors">
                <FileText className="h-3.5 w-3.5" /> Report
              </Link>
              <Link href={`/dashboard/students/${s.id}`}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 border border-blue-100 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors">
                <User className="h-3.5 w-3.5" /> Profile <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* ── Stat cards ─────────────────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-3">

            {/* Academic average */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <p className="text-xs text-slate-400 font-medium truncate">Academic Avg</p>
              </div>
              {activeChild.avg_mark_pct !== null ? (
                <>
                  <p className={`text-2xl font-bold leading-none ${GRADE_COLOR(activeChild.avg_mark_pct)}`}>
                    {activeChild.avg_mark_pct}%
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400 rounded-full" style={{ width: `${activeChild.avg_mark_pct}%` }} />
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${GRADE_CHIP(activeChild.avg_mark_pct)}`}>
                      {GRADE_LETTER(activeChild.avg_mark_pct)}
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
              {activeChild.attendance_pct !== null ? (
                <>
                  <p className={`text-2xl font-bold leading-none ${(activeChild.attendance_pct) >= 90 ? 'text-emerald-600' : activeChild.attendance_pct >= 75 ? 'text-amber-600' : 'text-red-500'}`}>
                    {activeChild.attendance_pct}%
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${activeChild.attendance_pct >= 90 ? 'bg-emerald-400' : activeChild.attendance_pct >= 75 ? 'bg-amber-400' : 'bg-red-400'}`}
                        style={{ width: `${activeChild.attendance_pct}%` }} />
                    </div>
                    <span className={`text-[10px] font-semibold ${activeChild.attendance_pct >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {activeChild.attendance_pct >= 90 ? 'Good' : activeChild.attendance_pct >= 75 ? 'Fair' : 'Low'}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-2xl font-bold text-slate-300">—</p>
              )}
            </div>

            {/* Fee balance */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${activeChild.fee_balance > 0 ? 'bg-red-50' : 'bg-emerald-50'}`}>
                  {activeChild.fee_balance > 0
                    ? <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                    : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                </div>
                <p className="text-xs text-slate-400 font-medium">Fee Balance</p>
              </div>
              <p className={`text-2xl font-bold leading-none ${activeChild.fee_balance > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                {formatMoney(activeChild.fee_balance, 'USD')}
              </p>
              <div className="mt-2">
                {activeChild.fee_balance > 0 ? (
                  <Link href="/dashboard/fees"
                    className="text-[10px] font-semibold text-red-500 hover:underline">
                    View & pay →
                  </Link>
                ) : (
                  <p className="text-[10px] text-emerald-600 font-semibold">Fully paid ✓</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Quick actions ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Marks',      href: '/dashboard/marks',      icon: GraduationCap, bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-100' },
              { label: 'Homework',   href: '/dashboard/homework',   icon: BookMarked,    bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-100' },
              { label: 'Attendance', href: '/dashboard/attendance', icon: CalendarCheck, bg: 'bg-emerald-50',text: 'text-emerald-700',border: 'border-emerald-100' },
              { label: 'Fees',       href: '/dashboard/fees',       icon: CreditCard,    bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-100' },
            ].map(({ label, href, icon: Icon, bg, text, border }) => (
              <Link key={href} href={href}
                className={`flex flex-col items-center gap-2 py-4 rounded-2xl border ${bg} ${border} hover:shadow-sm transition-all group`}>
                <div className={`h-9 w-9 rounded-xl ${bg} border ${border} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                  <Icon className={`h-4.5 w-4.5 h-[18px] w-[18px] ${text}`} />
                </div>
                <span className={`text-xs font-semibold ${text}`}>{label}</span>
              </Link>
            ))}
          </div>

          {/* ── Marks + Homework ──────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Recent Marks */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-50">
                <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center">
                  <GraduationCap className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <p className="text-sm font-bold text-slate-800">Recent Marks</p>
                <Link href="/dashboard/marks"
                  className="ml-auto text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
                  All marks <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              {childLoading ? (
                <div className="p-4 space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-11 bg-slate-50 rounded-xl animate-pulse" />)}</div>
              ) : recentMarks.length === 0 ? (
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
                <Link href="/dashboard/homework"
                  className="ml-auto text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              {childLoading ? (
                <div className="p-4 space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-11 bg-slate-50 rounded-xl animate-pulse" />)}</div>
              ) : upcomingHw.length === 0 ? (
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
                      <div key={h.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/40 transition-colors">
                        <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${urgent ? 'bg-red-50' : 'bg-amber-50'}`}>
                          <Clock className={`h-3.5 w-3.5 ${urgent ? 'text-red-500' : 'text-amber-500'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">{h.title}</p>
                          <p className="text-[11px] text-slate-400">{h.subjects?.name} · {h.classes?.name}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-xs font-bold ${urgent ? 'text-red-500' : 'text-slate-600'}`}>
                            {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft}d`}
                          </p>
                          <p className="text-[10px] text-slate-400">{new Date(h.due_date).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short' })}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Fee alert banner ──────────────────────────────────────────── */}
          {activeChild.fee_balance > 0 && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-100 px-5 py-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <CreditCard className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800">Outstanding School Fees</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {s.first_name} has a balance of{' '}
                  <span className="font-semibold text-red-600">{formatMoney(activeChild.fee_balance, 'USD')}</span>
                  {' '}of {formatMoney(activeChild.fee_billed, 'USD')} billed.
                </p>
              </div>
              <Link href="/dashboard/fees"
                className="shrink-0 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm shadow-red-200">
                View Fees
              </Link>
            </div>
          )}
        </>
      )}

      {/* ── Messages + Announcements ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Messages */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-50">
            <div className="h-7 w-7 rounded-lg bg-violet-50 flex items-center justify-center">
              <MessageCircle className="h-3.5 w-3.5 text-violet-600" />
            </div>
            <p className="text-sm font-bold text-slate-800">Messages</p>
            {totalUnread > 0 && (
              <span className="h-5 min-w-5 px-1.5 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center">
                {totalUnread}
              </span>
            )}
            <Link href="/dashboard/messages"
              className="ml-auto text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {threadPreviews.length === 0 ? (
            <div className="py-10 text-center">
              <MessageCircle className="h-6 w-6 text-slate-200 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No messages yet.</p>
              <Link href="/dashboard/messages"
                className="text-xs text-blue-600 hover:underline mt-1.5 inline-block font-medium">
                Message a teacher →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {threadPreviews.slice(0, 3).map(thread => (
                <Link key={thread.thread_id} href={`/dashboard/messages?thread=${thread.thread_id}`}
                  className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                  <div className="relative shrink-0 mt-0.5">
                    <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-700">
                      {thread.other.first_name[0]}{thread.other.last_name[0]}
                    </div>
                    {thread.unread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-blue-500 border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-semibold ${thread.unread > 0 ? 'text-slate-900' : 'text-slate-700'}`}>
                        {thread.other.first_name} {thread.other.last_name}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(thread.lastMsg.created_at).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    {thread.student && (
                      <p className="text-[10px] text-slate-400">re: {thread.student.first_name} {thread.student.last_name}</p>
                    )}
                    <p className={`text-xs line-clamp-1 mt-0.5 ${thread.unread > 0 ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                      {thread.lastMsg.body}
                    </p>
                  </div>
                </Link>
              ))}
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
            <Link href="/dashboard/announcements"
              className="ml-auto text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
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
              {announcements.slice(0, 4).map((a: any) => (
                <div key={a.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50/40 transition-colors">
                  <div className={`mt-0.5 h-6 w-6 rounded-lg flex items-center justify-center shrink-0 ${a.pinned ? 'bg-amber-50' : 'bg-slate-50'}`}>
                    <Megaphone className={`h-3 w-3 ${a.pinned ? 'text-amber-500' : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-slate-800 truncate">{a.title}</p>
                      {a.pinned && (
                        <span className="shrink-0 text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                          Pinned
                        </span>
                      )}
                    </div>
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

      {/* ── Report Cards ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-50">
          <div className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Award className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Report Cards</p>
            <p className="text-xs text-slate-400">End-of-year academic reports</p>
          </div>
        </div>

        <div className="divide-y divide-slate-50">
          {children.map(child => {
            const card = reportCards.find(r => r.student_id === child.student_id)
            const name = `${child.students.first_name} ${child.students.last_name}`
            const initials = `${child.students.first_name[0]}${child.students.last_name[0]}`
            return (
              <div key={child.student_id} className="flex items-center gap-4 px-5 py-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{name}</p>
                  <p className="text-xs text-slate-400">{child.students.classes?.name ?? '—'}</p>
                </div>
                {card ? (
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-semibold text-slate-700">
                        {card.academic_year} · Term {card.term}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {card.overall_average != null && `Avg ${card.overall_average.toFixed(1)}%`}
                        {card.class_position != null && ` · Pos ${card.class_position}/${card.total_students}`}
                      </p>
                    </div>
                    {card.pdf_url && card.pdf_url !== '#' ? (
                      <a href={card.pdf_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm">
                        <FileDown className="h-3.5 w-3.5" /> Download PDF
                      </a>
                    ) : (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-100">
                        <FileDown className="h-3.5 w-3.5" /> Download PDF
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-400 text-xs font-medium rounded-xl border border-slate-100">
                      <Lock className="h-3 w-3" /> Not yet available
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {children.length === 0 && (
            <div className="py-10 text-center">
              <Award className="h-6 w-6 text-slate-200 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No report cards available.</p>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50">
          <p className="text-[11px] text-slate-400">
            Report cards are released at the end of each academic term once results are finalised by the school.
            Contact the school office if you have questions.
          </p>
        </div>
      </div>

    </div>
  )
}
