'use client'

import { useState, useEffect, useMemo } from 'react'
import { PageHeader } from '@/components/ui-custom/PageHeader'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { teacherAssignmentsApi, classesApi, teachersApi, subjectsApi, gradesApi } from '@/lib/api/client'
import {
  Plus, Trash2, Loader2, UserCheck, BookOpen, School,
  ChevronDown, ChevronRight, AlertCircle, Users,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Assignment {
  id: string
  teacher_id: string
  class_id: string
  subject_id: string
  academic_year_id: string
  user_profiles: { id: string; first_name: string; last_name: string; email: string }
  classes: { id: string; name: string } | null
  subjects: { id: string; name: string; code: string } | null
  academic_years: { id: string; year: string; term: number } | null
}

interface ClassRow {
  id: string; name: string; grade_id: string; homeroom_teacher_id: string | null
  grades: { name: string } | null
  user_profiles: { first_name: string; last_name: string } | null
}

interface Teacher { id: string; first_name: string; last_name: string; email: string }
interface Subject { id: string; name: string; code: string }

const SUBJECT_COLORS = [
  'bg-blue-50 text-blue-700 border-blue-100',
  'bg-violet-50 text-violet-700 border-violet-100',
  'bg-emerald-50 text-emerald-700 border-emerald-100',
  'bg-amber-50 text-amber-700 border-amber-100',
  'bg-rose-50 text-rose-700 border-rose-100',
  'bg-cyan-50 text-cyan-700 border-cyan-100',
  'bg-orange-50 text-orange-700 border-orange-100',
  'bg-teal-50 text-teal-700 border-teal-100',
  'bg-purple-50 text-purple-700 border-purple-100',
  'bg-indigo-50 text-indigo-700 border-indigo-100',
]

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [classes, setClasses]         = useState<ClassRow[]>([])
  const [teachers, setTeachers]       = useState<Teacher[]>([])
  const [subjects, setSubjects]       = useState<Subject[]>([])
  const [academicYear, setAcademicYear] = useState<{ id: string; year: string; term: number } | null>(null)
  const [loading, setLoading]         = useState(true)
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set())

  // Dialog state
  const [dialogOpen, setDialogOpen]   = useState(false)
  const [preselectedClass, setPreselectedClass] = useState<string>('')
  const [formClass, setFormClass]     = useState('')
  const [formTeacher, setFormTeacher] = useState('')
  const [formSubject, setFormSubject] = useState('')
  const [saving, setSaving]           = useState(false)
  const [removingId, setRemovingId]   = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      teacherAssignmentsApi.list(),
      classesApi.list(),
      teachersApi.list(),
      subjectsApi.list(),
      fetch('/api/academic-years?current=true').then(r => r.json()),
    ]).then(([a, c, t, s, ay]) => {
      setAssignments((a.data as Assignment[]) ?? [])
      setClasses((c.data as ClassRow[]) ?? [])
      setTeachers((t.data as Teacher[]) ?? [])
      setSubjects((s.data as Subject[]) ?? [])
      if (ay.data?.[0]) setAcademicYear(ay.data[0])
      // Expand all classes by default
      setExpandedClasses(new Set((c.data as ClassRow[] ?? []).map(cls => cls.id)))
      setLoading(false)
    })
  }, [])

  // Subjects already assigned for a given class
  const assignedSubjectIds = useMemo(() => {
    const map: Record<string, Set<string>> = {}
    for (const a of assignments) {
      if (!map[a.class_id]) map[a.class_id] = new Set()
      map[a.class_id].add(a.subject_id)
    }
    return map
  }, [assignments])

  // Unassigned subjects for the currently selected class in the dialog
  const availableSubjects = useMemo(() => {
    if (!formClass) return subjects
    const taken = assignedSubjectIds[formClass] ?? new Set()
    return subjects.filter(s => !taken.has(s.id))
  }, [formClass, subjects, assignedSubjectIds])

  function openDialogForClass(classId: string) {
    setPreselectedClass(classId)
    setFormClass(classId)
    setFormTeacher('')
    setFormSubject('')
    setDialogOpen(true)
  }

  function openDialogGlobal() {
    setPreselectedClass('')
    setFormClass('')
    setFormTeacher('')
    setFormSubject('')
    setDialogOpen(true)
  }

  async function saveAssignment(e: React.FormEvent) {
    e.preventDefault()
    if (!formClass || !formTeacher || !formSubject || !academicYear) {
      toast.error('Please fill in all fields')
      return
    }
    setSaving(true)
    const res = await teacherAssignmentsApi.assign({
      teacher_id: formTeacher,
      class_id: formClass,
      subject_id: formSubject,
      academic_year_id: academicYear.id,
    })
    setSaving(false)
    if (res.error) { toast.error(res.error); return }

    // Build enriched object from local lookup data for instant UI update
    const teacher = teachers.find(t => t.id === formTeacher)!
    const cls     = classes.find(c => c.id === formClass)!
    const subject = subjects.find(s => s.id === formSubject)!
    const newAssignment: Assignment = {
      id: (res.data as any)?.id ?? `ta-new-${Date.now()}`,
      teacher_id: formTeacher,
      class_id: formClass,
      subject_id: formSubject,
      academic_year_id: academicYear.id,
      user_profiles: { id: formTeacher, first_name: teacher.first_name, last_name: teacher.last_name, email: teacher.email },
      classes: { id: cls.id, name: cls.name },
      subjects: { id: subject.id, name: subject.name, code: subject.code },
      academic_years: { id: academicYear.id, year: academicYear.year, term: academicYear.term },
    }
    toast.success('Teacher assigned successfully')
    setAssignments(prev => [...prev, newAssignment])
    setDialogOpen(false)
  }

  async function removeAssignment(id: string) {
    setRemovingId(id)
    const res = await teacherAssignmentsApi.remove(id)
    setRemovingId(null)
    if (res.error) { toast.error(res.error); return }
    setAssignments(prev => prev.filter(a => a.id !== id))
    toast.success('Assignment removed')
  }

  function toggleClass(classId: string) {
    setExpandedClasses(prev => {
      const next = new Set(prev)
      if (next.has(classId)) next.delete(classId)
      else next.add(classId)
      return next
    })
  }

  // ── Stats ─────────────────────────────────────────────────────────────────

  const classesWithGaps = classes.filter(cls => {
    const assigned = (assignedSubjectIds[cls.id]?.size ?? 0)
    return assigned < subjects.length
  }).length

  const totalSlots = classes.length * subjects.length
  const filled = assignments.length
  const coveragePct = totalSlots > 0 ? Math.round((filled / totalSlots) * 100) : 0

  if (loading) return (
    <div className="space-y-5">
      <div className="h-10 w-64 bg-slate-100 rounded-xl animate-pulse" />
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />)}
      </div>
      {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-slate-100 rounded-2xl animate-pulse" />)}
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teacher Assignments"
        description="Manage which teachers are assigned to which subjects and classes."
        action={
          <Button size="sm" onClick={openDialogGlobal}>
            <Plus className="h-4 w-4 mr-1.5" /> Assign Teacher
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <UserCheck className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <p className="text-xs text-slate-400 font-medium">Total Assignments</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">{filled}</p>
          <p className="text-xs text-slate-400 mt-1">across {classes.length} classes</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-7 w-7 rounded-lg bg-amber-50 flex items-center justify-center">
              <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
            </div>
            <p className="text-xs text-slate-400 font-medium">Classes with Gaps</p>
          </div>
          <p className={`text-2xl font-bold ${classesWithGaps > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{classesWithGaps}</p>
          <p className="text-xs text-slate-400 mt-1">{classesWithGaps === 0 ? 'All classes fully covered' : 'have unassigned subjects'}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center">
              <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <p className="text-xs text-slate-400 font-medium">Subject Coverage</p>
          </div>
          <p className={`text-2xl font-bold ${coveragePct >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>{coveragePct}%</p>
          <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${coveragePct >= 80 ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: `${coveragePct}%` }} />
          </div>
        </div>
      </div>

      {/* Class cards */}
      <div className="space-y-3">
        {classes.map(cls => {
          const classAssignments = assignments.filter(a => a.class_id === cls.id)
          const unassigned = subjects.filter(s => !classAssignments.some(a => a.subject_id === s.id))
          const expanded = expandedClasses.has(cls.id)

          return (
            <div key={cls.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Class header */}
              <button
                onClick={() => toggleClass(cls.id)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors text-left"
              >
                <div className="h-9 w-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                  <School className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-slate-800">{cls.name}</p>
                    {cls.grades?.name && (
                      <span className="text-xs text-slate-400 font-medium">{cls.grades.name}</span>
                    )}
                    {cls.user_profiles && (
                      <span className="text-xs text-slate-400">
                        · Homeroom: {cls.user_profiles.first_name} {cls.user_profiles.last_name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-emerald-600 font-medium">{classAssignments.length} assigned</span>
                    {unassigned.length > 0 && (
                      <span className="text-xs text-amber-600 font-medium">{unassigned.length} unassigned</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={e => { e.stopPropagation(); openDialogForClass(cls.id) }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    <Plus className="h-3 w-3" /> Assign
                  </button>
                  {expanded ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                </div>
              </button>

              {/* Assignment list */}
              {expanded && (
                <div className="border-t border-slate-50">
                  {classAssignments.length === 0 ? (
                    <div className="px-5 py-6 text-center">
                      <Users className="h-6 w-6 text-slate-200 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">No teachers assigned to this class yet.</p>
                      <button
                        onClick={() => openDialogForClass(cls.id)}
                        className="mt-2 text-xs text-blue-600 font-semibold hover:underline"
                      >
                        Assign the first teacher →
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {classAssignments.map((a, idx) => {
                        const chipColor = SUBJECT_COLORS[idx % SUBJECT_COLORS.length]
                        return (
                          <div key={a.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50/40 transition-colors">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${chipColor} shrink-0 min-w-[56px] text-center`}>
                              {a.subjects?.code ?? '—'}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800">{a.subjects?.name ?? '—'}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700 shrink-0">
                                {a.user_profiles?.first_name?.[0]}{a.user_profiles?.last_name?.[0]}
                              </div>
                              <div className="hidden sm:block text-right">
                                <p className="text-xs font-semibold text-slate-700">
                                  {a.user_profiles?.first_name} {a.user_profiles?.last_name}
                                </p>
                                <p className="text-[11px] text-slate-400">{a.user_profiles?.email}</p>
                              </div>
                              <button
                                onClick={() => removeAssignment(a.id)}
                                disabled={removingId === a.id}
                                className="ml-2 h-7 w-7 flex items-center justify-center rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 text-red-500 transition-colors disabled:opacity-50"
                                title="Remove assignment"
                              >
                                {removingId === a.id
                                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  : <Trash2 className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Unassigned subjects hint */}
                  {unassigned.length > 0 && classAssignments.length > 0 && (
                    <div className="px-5 py-3 bg-amber-50/50 border-t border-amber-50 flex items-center gap-2">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <p className="text-xs text-amber-700">
                        <span className="font-semibold">Unassigned:</span>{' '}
                        {unassigned.map(s => s.name).join(', ')}
                      </p>
                      <button
                        onClick={() => openDialogForClass(cls.id)}
                        className="ml-auto text-xs font-semibold text-amber-700 underline underline-offset-2 shrink-0"
                      >
                        Fill gap
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Teacher summary panel */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-indigo-50 flex items-center justify-center">
            <UserCheck className="h-3.5 w-3.5 text-indigo-600" />
          </div>
          <p className="text-sm font-bold text-slate-800">Teacher Workload Overview</p>
        </div>
        <div className="divide-y divide-slate-50">
          {teachers.map(t => {
            const teacherAssigns = assignments.filter(a => a.teacher_id === t.id)
            const classNames = Array.from(new Set(teacherAssigns.map(a => a.classes?.name).filter((n): n is string => !!n)))
            return (
              <div key={t.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/40 transition-colors">
                <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">
                  {t.first_name[0]}{t.last_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{t.first_name} {t.last_name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{t.email}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-slate-700">{teacherAssigns.length} <span className="text-xs font-normal text-slate-400">slots</span></p>
                  <p className="text-[11px] text-slate-400">{classNames.join(', ') || 'No classes'}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Assign dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Teacher to Class</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveAssignment} className="space-y-4 mt-2">
            <p className="text-sm text-slate-500">
              Choose a class, subject, and teacher. Each subject in a class can have one assigned teacher.
            </p>

            <div className="space-y-1.5">
              <Label>Class</Label>
              <select
                required
                value={formClass}
                onChange={e => { setFormClass(e.target.value); setFormSubject('') }}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select class…</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Subject</Label>
              <select
                required
                value={formSubject}
                onChange={e => setFormSubject(e.target.value)}
                disabled={!formClass}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
              >
                <option value="">Select subject…</option>
                {availableSubjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
              {formClass && availableSubjects.length === 0 && (
                <p className="text-xs text-amber-600">All subjects are already assigned in this class.</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Teacher</Label>
              <select
                required
                value={formTeacher}
                onChange={e => setFormTeacher(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select teacher…</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                ))}
              </select>
            </div>

            {academicYear && (
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2.5 text-xs text-slate-500">
                <span>Academic Year:</span>
                <span className="font-semibold text-slate-700">{academicYear.year} Term {academicYear.term}</span>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={saving || availableSubjects.length === 0 && !!formClass}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
                <UserCheck className="h-4 w-4 mr-1.5" /> Assign Teacher
              </Button>
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
