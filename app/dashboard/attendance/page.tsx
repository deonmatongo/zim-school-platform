'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { PageHeader } from '@/components/ui-custom/PageHeader'
import { Button } from '@/components/ui/button'
import { attendanceApi, parentApi } from '@/lib/api/client'
import { toast } from 'sonner'
import { Loader2, Save, CalendarCheck, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react'

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'

interface Student { id: string; first_name: string; last_name: string; reg_number: string }

interface AttendanceRecord {
  id: string; date: string; status: AttendanceStatus
  classes?: { name: string } | null
}

interface Child {
  student_id: string
  students: { id: string; first_name: string; last_name: string; reg_number: string; class_id: string; classes: { name: string } | null }
}

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; icon: any; bg: string; text: string; border: string }> = {
  present: { label: 'Present', icon: CheckCircle2, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
  absent:  { label: 'Absent',  icon: XCircle,      bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-100' },
  late:    { label: 'Late',    icon: Clock,         bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-100' },
  excused: { label: 'Excused', icon: AlertCircle,   bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-100' },
}

// ── Parent read-only view ──────────────────────────────────────────────────────
function ParentAttendanceView() {
  const [children, setChildren] = useState<Child[]>([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [recordsLoading, setRecordsLoading] = useState(false)

  useEffect(() => {
    parentApi.children().then(r => {
      setChildren((r.data as Child[]) ?? [])
      setLoading(false)
    })
  }, [])

  const active = children[activeIdx]

  useEffect(() => {
    if (!active) return
    setRecordsLoading(true)
    attendanceApi.list({ student_id: active.students.id }).then(r => {
      setRecords((r.data as AttendanceRecord[]) ?? [])
      setRecordsLoading(false)
    })
  }, [activeIdx, active?.students.id])

  if (loading) return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-slate-100 rounded-lg animate-pulse" />
      <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
    </div>
  )

  if (children.length === 0) return (
    <div className="py-20 text-center">
      <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
        <CalendarCheck className="h-6 w-6 text-slate-400" />
      </div>
      <p className="text-sm font-semibold text-slate-700">No children linked</p>
      <p className="text-xs text-slate-400 mt-1">Contact the school administrator.</p>
    </div>
  )

  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date))
  const total = records.length
  const presentCount = records.filter(r => r.status === 'present' || r.status === 'late').length
  const absentCount  = records.filter(r => r.status === 'absent').length
  const pct = total > 0 ? Math.round((presentCount / total) * 100) : null

  return (
    <div className="space-y-5">
      <PageHeader title="Attendance" description="View your child's attendance record." />

      {/* Child selector */}
      {children.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {children.map((c, idx) => (
            <button key={c.student_id} onClick={() => setActiveIdx(idx)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
                activeIdx === idx ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${activeIdx === idx ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {c.students.first_name[0]}{c.students.last_name[0]}
              </div>
              {c.students.first_name} {c.students.last_name}
            </button>
          ))}
        </div>
      )}

      {active && (
        <>
          {/* Child pill */}
          <div className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-3">
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700 shrink-0">
              {active.students.first_name[0]}{active.students.last_name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800">{active.students.first_name} {active.students.last_name}</p>
              <p className="text-xs text-slate-400 font-mono">{active.students.reg_number} · {active.students.classes?.name ?? '—'}</p>
            </div>
            {pct !== null && (
              <div className="text-right shrink-0">
                <p className={`text-lg font-bold ${pct >= 90 ? 'text-emerald-600' : pct >= 75 ? 'text-amber-600' : 'text-red-500'}`}>{pct}%</p>
                <p className="text-xs text-slate-400">attendance</p>
              </div>
            )}
          </div>

          {/* Summary pills */}
          {total > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {([
                { count: records.filter(r => r.status === 'present').length, ...STATUS_CONFIG.present },
                { count: absentCount,  ...STATUS_CONFIG.absent },
                { count: records.filter(r => r.status === 'late').length,    ...STATUS_CONFIG.late },
                { count: records.filter(r => r.status === 'excused').length, ...STATUS_CONFIG.excused },
              ]).map(item => (
                <div key={item.label} className={`${item.bg} border ${item.border} rounded-2xl p-3 text-center`}>
                  <p className={`text-2xl font-bold ${item.text}`}>{item.count}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Attendance list */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-50 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-800">Attendance History</p>
              <span className="text-xs text-slate-400">{total} records</span>
            </div>
            {recordsLoading ? (
              <div className="p-4 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-slate-50 rounded-xl animate-pulse" />)}</div>
            ) : sorted.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400">No attendance records yet.</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {sorted.map(r => {
                  const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.present
                  const Icon = cfg.icon
                  return (
                    <div key={r.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50/40 transition-colors">
                      <div className={`h-8 w-8 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`h-3.5 w-3.5 ${cfg.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700">
                          {new Date(r.date).toLocaleDateString('en-ZW', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        {cfg.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ── Student read-only view ─────────────────────────────────────────────────────
function StudentAttendanceView() {
  const { user } = useAuth()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    attendanceApi.list({ student_id: user.id }).then(r => {
      setRecords((r.data as AttendanceRecord[]) ?? [])
      setLoading(false)
    })
  }, [user?.id])

  if (loading) return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-slate-100 rounded-lg animate-pulse" />
      <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
    </div>
  )

  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date))
  const total = records.length
  const presentCount = records.filter(r => r.status === 'present' || r.status === 'late').length
  const absentCount  = records.filter(r => r.status === 'absent').length
  const pct = total > 0 ? Math.round((presentCount / total) * 100) : null

  return (
    <div className="space-y-5">
      <PageHeader title="My Attendance" description="Your daily attendance record for this term." />

      {/* Summary pill */}
      <div className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-3">
        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700 shrink-0">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800">{user?.firstName} {user?.lastName}</p>
        </div>
        {pct !== null && (
          <div className="text-right shrink-0">
            <p className={`text-lg font-bold ${pct >= 90 ? 'text-emerald-600' : pct >= 75 ? 'text-amber-600' : 'text-red-500'}`}>{pct}%</p>
            <p className="text-xs text-slate-400">attendance</p>
          </div>
        )}
      </div>

      {total > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {([
            { count: records.filter(r => r.status === 'present').length, ...STATUS_CONFIG.present },
            { count: absentCount, ...STATUS_CONFIG.absent },
            { count: records.filter(r => r.status === 'late').length, ...STATUS_CONFIG.late },
            { count: records.filter(r => r.status === 'excused').length, ...STATUS_CONFIG.excused },
          ]).map(item => (
            <div key={item.label} className={`${item.bg} border ${item.border} rounded-2xl p-3 text-center`}>
              <p className={`text-2xl font-bold ${item.text}`}>{item.count}</p>
              <p className="text-xs text-slate-500 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-50 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-800">Attendance History</p>
          <span className="text-xs text-slate-400">{total} records</span>
        </div>
        {sorted.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">No attendance records yet.</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {sorted.map(r => {
              const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.present
              const Icon = cfg.icon
              return (
                <div key={r.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50/40 transition-colors">
                  <div className={`h-8 w-8 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`h-3.5 w-3.5 ${cfg.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700">
                      {new Date(r.date).toLocaleDateString('en-ZW', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                    {cfg.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Teacher/Admin register view ────────────────────────────────────────────────
export default function AttendancePage() {
  const { user } = useAuth()
  if (user?.role === 'parent') return <ParentAttendanceView />
  if (user?.role === 'student') return <StudentAttendanceView />
  return <AttendanceRegister />
}

function AttendanceRegister() {
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([])
  const [academicYears, setAcademicYears] = useState<{ id: string; year: number; term: number }[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [students, setStudents] = useState<Student[]>([])
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/classes').then(r => r.json()).then(r => {
      setClasses(r.data ?? [])
      if (r.data?.[0]) setSelectedClass(r.data[0].id)
    })
    fetch('/api/academic-years').then(r => r.json()).then(r => {
      setAcademicYears(r.data ?? [])
      const current = r.data?.find((y: any) => y.is_current)
      if (current) setSelectedYear(current.id)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedClass) return
    setLoading(true)
    fetch(`/api/students?class_id=${selectedClass}`).then(r => r.json()).then(r => {
      const studs = r.data ?? []
      setStudents(studs)
      // Load existing attendance for this date
      fetch(`/api/attendance?class_id=${selectedClass}&date=${date}`).then(ar => ar.json()).then(ar => {
        const existing: Record<string, AttendanceStatus> = {}
        for (const record of (ar.data ?? [])) {
          existing[record.student_id] = record.status
        }
        // Default all to present if no record
        const defaults: Record<string, AttendanceStatus> = {}
        for (const s of studs) {
          defaults[s.id] = existing[s.id] ?? 'present'
        }
        setStatuses(defaults)
        setLoading(false)
      })
    })
  }, [selectedClass, date])

  function setStatus(studentId: string, status: AttendanceStatus) {
    setStatuses(prev => ({ ...prev, [studentId]: status }))
  }

  async function saveAttendance() {
    if (!selectedClass || !selectedYear) {
      toast.error('Please select a class and academic year')
      return
    }
    setSaving(true)
    const records = students.map(s => ({ student_id: s.id, status: statuses[s.id] ?? 'present' }))
    const res = await attendanceApi.bulkUpsert({ class_id: selectedClass, academic_year_id: selectedYear, date, records })
    setSaving(false)
    if (res.error) { toast.error(res.error); return }
    toast.success('Attendance saved')
  }

  const statusButtons: { value: AttendanceStatus; label: string; color: string }[] = [
    { value: 'present', label: 'P', color: 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200' },
    { value: 'absent',  label: 'A', color: 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200' },
    { value: 'late',    label: 'L', color: 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200' },
    { value: 'excused', label: 'E', color: 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200' },
  ]

  const counts = Object.values(statuses)
  const presentCount = counts.filter(s => s === 'present').length
  const absentCount = counts.filter(s => s === 'absent').length

  const attendancePct = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0

  return (
    <div className="space-y-5">
      <PageHeader
        title="Attendance Register"
        description="Mark and save daily class attendance."
        action={
          <Button size="sm" onClick={saveAttendance} disabled={saving || students.length === 0}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />}
            Save Register
          </Button>
        }
      />

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <label className="text-xs font-semibold text-slate-500 shrink-0">Class</label>
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="flex-1 h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Select class…</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 shrink-0">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      {/* Summary pills */}
      {students.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Present', count: presentCount, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
            { label: 'Absent',  count: absentCount,  bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-100' },
            { label: 'Late',    count: Object.values(statuses).filter(s => s === 'late').length,    bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-100' },
            { label: 'Excused', count: Object.values(statuses).filter(s => s === 'excused').length, bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-100' },
          ].map(item => (
            <div key={item.label} className={`${item.bg} border ${item.border} rounded-2xl p-3 text-center`}>
              <p className={`text-2xl font-bold ${item.text}`}>{item.count}</p>
              <p className="text-xs text-slate-500 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-4 text-xs text-slate-500">
        {statusButtons.map(b => (
          <span key={b.value} className="flex items-center gap-1.5">
            <span className={`inline-flex h-6 w-6 items-center justify-center rounded-lg font-bold text-xs border ${b.color}`}>{b.label}</span>
            <span className="capitalize">{b.value}</span>
          </span>
        ))}
      </div>

      {/* Register */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading && (
          <div className="py-12 text-center text-sm text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-slate-300" />
            Loading students…
          </div>
        )}
        {!loading && students.length === 0 && (
          <div className="py-16 text-center">
            <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <CalendarCheck className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Select a class to start</p>
            <p className="text-xs text-slate-400 mt-1">Choose a class and date above to take attendance.</p>
          </div>
        )}
        {!loading && students.length > 0 && (
          <>
            {/* Progress bar */}
            <div className="px-5 py-3 border-b border-slate-50 flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${attendancePct}%` }} />
              </div>
              <span className="text-xs font-semibold text-slate-600 shrink-0">{attendancePct}% present</span>
            </div>
            <div className="divide-y divide-slate-50">
              {students.map((s, i) => (
                <div key={s.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/50 transition-colors">
                  <span className="w-6 text-xs text-slate-400 text-right shrink-0">{i + 1}</span>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                    {s.first_name[0]}{s.last_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{s.first_name} {s.last_name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{s.reg_number}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {statusButtons.map(btn => (
                      <button
                        key={btn.value}
                        onClick={() => setStatus(s.id, btn.value)}
                        className={`h-8 w-8 rounded-xl text-xs font-bold border transition-all ${
                          statuses[s.id] === btn.value
                            ? `${btn.color} shadow-sm ring-2 ring-offset-1 ring-current`
                            : 'border-slate-200 bg-white text-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
