import { requireRole } from '@/lib/auth/getSession'
import { createClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/ui-custom/StatCard'
import { AdminChartsRow } from '@/components/ui-custom/charts/AdminChartsRow'
import {
  Users, GraduationCap, CreditCard, Megaphone, TrendingUp, AlertCircle,
  School, BookMarked, Plus, UserPlus, CalendarCheck, ChevronRight,
  Clock, Pin, CheckCircle2, XCircle, ArrowUpRight,
} from 'lucide-react'
import Link from 'next/link'
import {
  students as devStudents, teachers as devTeachers, feeLedger as devLedger,
  feePayments as devPayments, announcements as devAnnouncements, classes as devClasses,
  homework as devHomework, attendance as devAttendance,
} from '@/lib/dev/seed-data'

export default async function AdminDashboard() {
  const user = await requireRole(['admin'])

  let studentCount: number
  let teacherCount: number
  let classCount: number
  let ledger: { amount_billed: unknown; amount_paid: unknown }[]
  let recentAnnouncements: { id: string; title: string; audience: string; created_at: string; pinned: boolean }[]
  let recentStudents: { id: string; first_name: string; last_name: string; reg_number: string; class_id?: string }[]
  let monthlyPayments: { amount: unknown; paid_at: string }[]
  let upcomingHomework: { id: string; title: string; due_date: string; subjects: { name: string } | null; classes: { name: string } | null }[]
  let attendanceToday: { status: string }[]
  let classFeeRows: { id: string; name: string; billed: number; paid: number }[]

  if (user.schoolId === 'dev-school') {
    studentCount = devStudents.length
    teacherCount = devTeachers.length
    classCount = devClasses.length
    ledger = devLedger
    recentAnnouncements = devAnnouncements.slice(0, 5) as any
    recentStudents = [...devStudents].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5)
    monthlyPayments = devPayments.map(p => ({ amount: p.amount, paid_at: p.paid_at }))
    const today = new Date().toISOString().slice(0, 10)
    upcomingHomework = devHomework
      .filter(h => h.due_date >= today)
      .sort((a, b) => a.due_date.localeCompare(b.due_date))
      .slice(0, 4) as any
    attendanceToday = devAttendance.filter(a => a.date === devAttendance[0]?.date)
    classFeeRows = devClasses.map(cls => {
      const stuIds = devStudents.filter(s => s.class_id === cls.id).map(s => s.id)
      const rows = devLedger.filter(l => stuIds.includes(l.student_id))
      return {
        id: cls.id,
        name: cls.name,
        billed: rows.reduce((s, r) => s + Number(r.amount_billed), 0),
        paid: rows.reduce((s, r) => s + Number(r.amount_paid), 0),
      }
    })
  } else {
    const supabase = createClient()
    const [
      { count: sc }, { count: tc }, { count: cc },
      { data: lg }, { data: ra }, { data: rs }, { data: mp },
      { data: hw }, { data: att }, { data: cls },
    ] = await Promise.all([
      supabase.from('students').select('id', { count: 'exact', head: true }).eq('school_id', user.schoolId).eq('active', true),
      supabase.from('user_profiles').select('id', { count: 'exact', head: true }).eq('school_id', user.schoolId).eq('role', 'teacher').eq('active', true),
      supabase.from('classes').select('id', { count: 'exact', head: true }).eq('school_id', user.schoolId),
      supabase.from('fee_ledger').select('amount_billed, amount_paid').eq('school_id', user.schoolId),
      supabase.from('announcements').select('id, title, audience, created_at, pinned').eq('school_id', user.schoolId).eq('published', true).order('pinned', { ascending: false }).order('created_at', { ascending: false }).limit(5),
      supabase.from('students').select('id, first_name, last_name, reg_number, class_id, created_at').eq('school_id', user.schoolId).order('created_at', { ascending: false }).limit(5),
      supabase.from('fee_payments').select('amount, paid_at').eq('school_id', user.schoolId).gte('paid_at', new Date(new Date().getFullYear(), 0, 1).toISOString()),
      supabase.from('homework').select('id, title, due_date, subjects(name), classes(name)').eq('school_id', user.schoolId).gte('due_date', new Date().toISOString().slice(0,10)).order('due_date').limit(4),
      supabase.from('attendance').select('status').eq('school_id', user.schoolId).eq('date', new Date().toISOString().slice(0,10)),
      supabase.from('classes').select('id, name, fee_ledger(amount_billed, amount_paid)').eq('school_id', user.schoolId).order('name'),
    ])
    studentCount = sc ?? 0
    teacherCount = tc ?? 0
    classCount = cc ?? 0
    ledger = (lg ?? []) as any
    recentAnnouncements = (ra ?? []) as any
    recentStudents = (rs ?? []) as any
    monthlyPayments = (mp ?? []) as any
    upcomingHomework = (hw ?? []) as any
    attendanceToday = (att ?? []) as any
    classFeeRows = (cls ?? []).map((c: any) => ({
      id: c.id, name: c.name,
      billed: (c.fee_ledger ?? []).reduce((s: number, r: any) => s + Number(r.amount_billed), 0),
      paid: (c.fee_ledger ?? []).reduce((s: number, r: any) => s + Number(r.amount_paid), 0),
    }))
  }

  const totalBilled = ledger.reduce((s, r) => s + Number(r.amount_billed), 0)
  const totalPaid   = ledger.reduce((s, r) => s + Number(r.amount_paid), 0)
  const collectionRate = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0
  const outstanding = totalBilled - totalPaid

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const now = new Date()
  const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const collected = monthlyPayments.filter((p: any) => p.paid_at?.startsWith(key)).reduce((s, p: any) => s + Number(p.amount), 0)
    return { month: MONTHS[d.getMonth()], billed: Math.round(totalBilled / 6), collected: Math.round(collected) }
  })

  const presentToday = attendanceToday.filter(a => ['present','late'].includes(a.status)).length
  const absentToday  = attendanceToday.filter(a => a.status === 'absent').length
  const attendancePct = attendanceToday.length > 0 ? Math.round((presentToday / attendanceToday.length) * 100) : null

  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const audienceColors: Record<string, string> = {
    all: 'bg-slate-100 text-slate-600',
    parents: 'bg-green-100 text-green-700',
    students: 'bg-blue-100 text-blue-700',
    teachers: 'bg-violet-100 text-violet-700',
  }

  const quickActions = [
    { label: 'Enrol Student',     href: '/dashboard/students/new',      icon: UserPlus,      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100' },
    { label: 'New Announcement',  href: '/dashboard/announcements/new', icon: Megaphone,     color: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100' },
    { label: 'Take Attendance',   href: '/dashboard/attendance',        icon: CalendarCheck, color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100' },
    { label: 'Add Homework',      href: '/dashboard/homework/new',      icon: BookMarked,    color: 'bg-violet-50 text-violet-700 hover:bg-violet-100 border-violet-100' },
    { label: 'View Fees',         href: '/dashboard/fees',              icon: CreditCard,    color: 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-100' },
    { label: 'Manage Classes',    href: '/dashboard/classes',           icon: School,        color: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-100' },
  ]

  return (
    <div className="space-y-6">

      {/* ── Hero header ─────────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 px-6 py-7 shadow-lg">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 10% 90%, #8b5cf6 0%, transparent 40%)' }} />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-slate-400 text-sm font-medium">{greeting},</p>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">{user.firstName} {user.lastName} 👋</h1>
            <p className="text-slate-400 text-sm mt-1.5">Here's what's happening at your school today.</p>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium">{now.toLocaleDateString('en-ZW', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            </div>
            {attendancePct !== null && (
              <p className="text-xs text-slate-400">Today's attendance: <span className="font-semibold text-emerald-400">{attendancePct}%</span></p>
            )}
          </div>
        </div>
      </div>

      {/* ── KPI row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard title="Total Students"   value={studentCount} icon={Users}          color="#3b82f6" subtitle="Active enrolments" />
        <StatCard title="Teaching Staff"   value={teacherCount} icon={GraduationCap}  color="#8b5cf6" subtitle="Active teachers" />
        <StatCard title="Classes"          value={classCount}   icon={School}         color="#06b6d4" subtitle="Across all grades" />
        <StatCard title="Fees Collected"   value={`$${totalPaid.toLocaleString(undefined,{maximumFractionDigits:0})}`} icon={CreditCard} color="#10b981" subtitle={`of $${totalBilled.toLocaleString(undefined,{maximumFractionDigits:0})} billed`} />
        <StatCard title="Outstanding Fees" value={`$${outstanding.toLocaleString(undefined,{maximumFractionDigits:0})}`} icon={AlertCircle}
          color={outstanding > 0 ? '#ef4444' : '#10b981'} subtitle="Unpaid balance" />
        <StatCard title="Collection Rate"  value={`${collectionRate}%`} icon={TrendingUp}
          color={collectionRate >= 80 ? '#10b981' : collectionRate >= 60 ? '#f59e0b' : '#ef4444'}
          subtitle="This academic year"
          trend={collectionRate >= 80 ? { value: collectionRate - 75, label: 'vs target' } : undefined} />
      </div>

      {/* ── Quick actions ────────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          {quickActions.map(({ label, href, icon: Icon, color }) => (
            <Link key={href} href={href}
              className={`flex flex-col items-center gap-2 px-3 py-4 rounded-2xl border text-center text-xs font-semibold transition-all hover:scale-[1.03] active:scale-100 ${color}`}>
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Charts ──────────────────────────────────────────────────── */}
      <AdminChartsRow
        collectionRate={collectionRate}
        totalBilled={totalBilled}
        totalPaid={totalPaid}
        monthlyTrend={monthlyTrend}
      />

      {/* ── Bottom 3-col grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recently enrolled */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users className="h-3 w-3 text-blue-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Recently Enrolled</h3>
            </div>
            <Link href="/dashboard/students" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5">All <ArrowUpRight className="h-3 w-3" /></Link>
          </div>
          <div className="p-2 space-y-0.5">
            {recentStudents.length === 0 && <p className="text-sm text-slate-400 text-center py-8">No students yet</p>}
            {recentStudents.map(s => (
              <Link key={s.id} href={`/dashboard/students/${s.id}`}
                className="flex items-center gap-3 hover:bg-slate-50 rounded-xl px-3 py-2.5 transition-colors group">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                  {s.first_name[0]}{s.last_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-700 transition-colors">{s.first_name} {s.last_name}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{s.reg_number}</p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-400 shrink-0" />
              </Link>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-slate-50">
            <Link href="/dashboard/students/new" className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700">
              <Plus className="h-3.5 w-3.5" /> Enrol new student
            </Link>
          </div>
        </div>

        {/* Recent announcements */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-amber-50 flex items-center justify-center">
                <Megaphone className="h-3 w-3 text-amber-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Announcements</h3>
            </div>
            <Link href="/dashboard/announcements" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5">All <ArrowUpRight className="h-3 w-3" /></Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentAnnouncements.length === 0 && <p className="text-sm text-slate-400 text-center py-8">No announcements</p>}
            {recentAnnouncements.map(a => (
              <div key={a.id} className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50/60 transition-colors">
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${(a as any).pinned ? 'bg-amber-100' : 'bg-slate-100'}`}>
                  {(a as any).pinned
                    ? <Pin className="h-3 w-3 text-amber-500" />
                    : <Megaphone className="h-3 w-3 text-slate-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate leading-snug">{a.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${audienceColors[a.audience] ?? 'bg-slate-100 text-slate-600'}`}>{a.audience}</span>
                    <span className="text-[10px] text-slate-400">{new Date(a.created_at).toLocaleDateString('en-ZW', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-slate-50">
            <Link href="/dashboard/announcements/new" className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700">
              <Plus className="h-3.5 w-3.5" /> New announcement
            </Link>
          </div>
        </div>

        {/* Upcoming homework */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-violet-50 flex items-center justify-center">
                <BookMarked className="h-3 w-3 text-violet-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Upcoming Homework</h3>
            </div>
            <Link href="/dashboard/homework" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5">All <ArrowUpRight className="h-3 w-3" /></Link>
          </div>
          <div className="divide-y divide-slate-50">
            {upcomingHomework.length === 0 && <p className="text-sm text-slate-400 text-center py-8">No upcoming homework</p>}
            {upcomingHomework.map(h => {
              const today = now.toISOString().slice(0,10)
              const daysLeft = Math.ceil((new Date(h.due_date).getTime() - new Date(today).getTime()) / 86400000)
              const urgent = daysLeft <= 2
              return (
                <Link key={h.id} href={`/dashboard/homework/${h.id}`}
                  className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50/60 transition-colors group">
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${urgent ? 'bg-red-50' : 'bg-violet-50'}`}>
                    <Clock className={`h-3 w-3 ${urgent ? 'text-red-500' : 'text-violet-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate leading-snug group-hover:text-violet-700 transition-colors">{h.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{(h.subjects as any)?.name} · {(h.classes as any)?.name}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 mt-0.5 ${urgent ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                    {daysLeft === 0 ? 'today' : `${daysLeft}d`}
                  </span>
                </Link>
              )
            })}
          </div>
          <div className="px-5 py-3 border-t border-slate-50">
            <Link href="/dashboard/homework/new" className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700">
              <Plus className="h-3.5 w-3.5" /> Assign homework
            </Link>
          </div>
        </div>
      </div>

      {/* ── Fee breakdown by class ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CreditCard className="h-3 w-3 text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Fee Collection by Class</h3>
          </div>
          <Link href="/dashboard/fees" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5">Full report <ArrowUpRight className="h-3 w-3" /></Link>
        </div>
        <div className="divide-y divide-slate-50">
          {classFeeRows.filter(r => r.billed > 0).map(row => {
            const rate = Math.round((row.paid / row.billed) * 100)
            return (
              <div key={row.id} className="flex items-center gap-4 px-5 py-3">
                <p className="text-sm font-semibold text-slate-800 w-24 shrink-0">{row.name}</p>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${rate >= 80 ? 'bg-emerald-500' : rate >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                    style={{ width: `${rate}%` }}
                  />
                </div>
                <div className="text-right w-28 shrink-0">
                  <span className="text-xs font-bold text-slate-700 tabular-nums">${row.paid.toLocaleString(undefined,{maximumFractionDigits:0})}</span>
                  <span className="text-[10px] text-slate-400"> / ${row.billed.toLocaleString(undefined,{maximumFractionDigits:0})}</span>
                </div>
                <span className={`text-xs font-bold w-10 text-right shrink-0 ${rate >= 80 ? 'text-emerald-600' : rate >= 50 ? 'text-amber-600' : 'text-red-500'}`}>{rate}%</span>
              </div>
            )
          })}
          {classFeeRows.filter(r => r.billed > 0).length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">No fee data yet</p>
          )}
        </div>
      </div>

      {/* ── Attendance snapshot ───────────────────────────────────────── */}
      {attendanceToday.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-6 w-6 rounded-lg bg-cyan-50 flex items-center justify-center">
              <CalendarCheck className="h-3 w-3 text-cyan-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Today's Attendance Snapshot</h3>
            <span className="ml-auto text-xs text-slate-400">{now.toLocaleDateString('en-ZW', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Present', count: presentToday, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Absent',  count: absentToday,  icon: XCircle,      color: 'text-red-500',     bg: 'bg-red-50' },
              { label: 'Total',   count: attendanceToday.length, icon: Users, color: 'text-slate-700', bg: 'bg-slate-100' },
            ].map(item => (
              <div key={item.label} className={`${item.bg} rounded-xl px-4 py-3 flex items-center gap-3`}>
                <item.icon className={`h-5 w-5 ${item.color} shrink-0`} />
                <div>
                  <p className={`text-xl font-bold ${item.color}`}>{item.count}</p>
                  <p className="text-xs text-slate-500">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${attendancePct ?? 0}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-1.5 text-right">{attendancePct ?? 0}% present today</p>
        </div>
      )}

      {/* ── Fee alert ────────────────────────────────────────────────── */}
      {collectionRate < 70 && totalBilled > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 flex items-start gap-4">
          <div className="h-9 w-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <AlertCircle className="h-[18px] w-[18px] text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-900">Fee collection below target</p>
            <p className="text-sm text-amber-700 mt-0.5">
              {collectionRate}% collected — ${outstanding.toFixed(2)} outstanding.{' '}
              <Link href="/dashboard/fees" className="font-semibold underline underline-offset-2">View fee summary →</Link>
            </p>
          </div>
        </div>
      )}

    </div>
  )
}
