'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { PageHeader } from '@/components/ui-custom/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { calculateGradeLetter } from '@/lib/utils/grades'
import { assessmentsApi, marksApi, parentApi } from '@/lib/api/client'
import { toast } from 'sonner'
import { Loader2, Save, GraduationCap, TrendingUp } from 'lucide-react'

interface Student { id: string; first_name: string; last_name: string; reg_number: string }
interface Assessment { id: string; title: string; type: string; max_marks: number; date: string; class_id: string; subject_id: string; classes: { name: string } | null; subjects: { name: string } | null }

interface ChildMark {
  id: string; raw_score: number
  assessments: { title: string; max_marks: number; date: string; type: string; subjects: { name: string } | null } | null
}

interface Child {
  student_id: string
  students: { id: string; first_name: string; last_name: string; reg_number: string; class_id: string; classes: { name: string } | null }
}

const GRADE_COLOR = (pct: number) => pct >= 75 ? 'text-emerald-600' : pct >= 60 ? 'text-blue-600' : pct >= 50 ? 'text-cyan-600' : pct >= 40 ? 'text-amber-600' : 'text-red-500'
const GRADE_CHIP  = (pct: number) => pct >= 75 ? 'bg-emerald-100 text-emerald-700' : pct >= 60 ? 'bg-blue-100 text-blue-700' : pct >= 50 ? 'bg-cyan-100 text-cyan-700' : pct >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
const GRADE_LETTER = (pct: number) => pct >= 75 ? 'A' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : pct >= 40 ? 'D' : 'U'

// ── Parent view ────────────────────────────────────────────────────────────────
function ParentMarksView() {
  const [children, setChildren] = useState<Child[]>([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [marks, setMarks] = useState<ChildMark[]>([])
  const [loading, setLoading] = useState(true)
  const [marksLoading, setMarksLoading] = useState(false)

  useEffect(() => {
    parentApi.children().then(r => {
      setChildren((r.data as Child[]) ?? [])
      setLoading(false)
    })
  }, [])

  const active = children[activeIdx]

  useEffect(() => {
    if (!active) return
    setMarksLoading(true)
    marksApi.list({ student_id: active.students.id }).then(r => {
      setMarks((r.data as ChildMark[]) ?? [])
      setMarksLoading(false)
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
        <GraduationCap className="h-6 w-6 text-slate-400" />
      </div>
      <p className="text-sm font-semibold text-slate-700">No children linked</p>
      <p className="text-xs text-slate-400 mt-1">Contact the school administrator.</p>
    </div>
  )

  const sorted = [...marks].sort((a, b) => (b.assessments?.date ?? '').localeCompare(a.assessments?.date ?? ''))
  const avgPct = marks.length
    ? Math.round(marks.reduce((s, m) => s + Math.round((m.raw_score / (m.assessments?.max_marks ?? 100)) * 100), 0) / marks.length)
    : null

  const TYPE_PALETTE: Record<string, string> = {
    test: 'bg-blue-50 text-blue-600', exam: 'bg-red-50 text-red-600',
    class_assessment: 'bg-emerald-50 text-emerald-600', practical: 'bg-violet-50 text-violet-600',
    project: 'bg-amber-50 text-amber-600',
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Marks" description="View your child's assessment results." />

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
            {avgPct !== null && (
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
                  <p className={`text-lg font-bold ${GRADE_COLOR(avgPct)}`}>{avgPct}%</p>
                </div>
                <p className="text-xs text-slate-400">avg · Grade {GRADE_LETTER(avgPct)}</p>
              </div>
            )}
          </div>

          {/* Marks list */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-50 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-800">Assessment Results</p>
              <span className="text-xs text-slate-400">{marks.length} assessments</span>
            </div>
            {marksLoading ? (
              <div className="p-4 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />)}</div>
            ) : sorted.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400">No marks recorded yet.</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {sorted.map(m => {
                  const pct = Math.round((m.raw_score / (m.assessments?.max_marks ?? 100)) * 100)
                  const typeStyle = TYPE_PALETTE[m.assessments?.type ?? ''] ?? 'bg-slate-50 text-slate-500'
                  return (
                    <div key={m.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/40 transition-colors">
                      <div className={`h-9 w-9 rounded-xl ${typeStyle} flex items-center justify-center shrink-0`}>
                        <GraduationCap className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{m.assessments?.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {m.assessments?.subjects?.name}
                          {m.assessments?.date && ` · ${new Date(m.assessments.date).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className={`text-sm font-bold tabular-nums ${GRADE_COLOR(pct)}`}>{m.raw_score}/{m.assessments?.max_marks}</p>
                          <p className="text-[11px] text-slate-400">{pct}%</p>
                        </div>
                        <span className={`text-[11px] font-bold w-7 h-7 rounded-xl flex items-center justify-center ${GRADE_CHIP(pct)}`}>
                          {GRADE_LETTER(pct)}
                        </span>
                      </div>
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

// ── Student view ───────────────────────────────────────────────────────────────
function StudentMarksView() {
  const { user } = useAuth()
  const [marks, setMarks] = useState<ChildMark[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    marksApi.list({ student_id: user.id }).then(r => {
      setMarks((r.data as ChildMark[]) ?? [])
      setLoading(false)
    })
  }, [user?.id])

  if (loading) return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-slate-100 rounded-lg animate-pulse" />
      <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
    </div>
  )

  const sorted = [...marks].sort((a, b) => (b.assessments?.date ?? '').localeCompare(a.assessments?.date ?? ''))
  const avgPct = marks.length
    ? Math.round(marks.reduce((s, m) => s + Math.round((m.raw_score / (m.assessments?.max_marks ?? 100)) * 100), 0) / marks.length)
    : null

  const TYPE_PALETTE: Record<string, string> = {
    test: 'bg-blue-50 text-blue-600', exam: 'bg-red-50 text-red-600',
    class_assessment: 'bg-emerald-50 text-emerald-600', practical: 'bg-violet-50 text-violet-600',
    project: 'bg-amber-50 text-amber-600',
  }

  return (
    <div className="space-y-5">
      <PageHeader title="My Marks" description="Your assessment results for this term." />

      {/* Summary pill */}
      <div className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-3">
        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700 shrink-0">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800">{user?.firstName} {user?.lastName}</p>
        </div>
        {avgPct !== null && (
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
              <p className={`text-lg font-bold ${GRADE_COLOR(avgPct)}`}>{avgPct}%</p>
            </div>
            <p className="text-xs text-slate-400">avg · Grade {GRADE_LETTER(avgPct)}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-50 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-800">Assessment Results</p>
          <span className="text-xs text-slate-400">{marks.length} assessments</span>
        </div>
        {sorted.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">No marks recorded yet.</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {sorted.map(m => {
              const pct = Math.round((m.raw_score / (m.assessments?.max_marks ?? 100)) * 100)
              const typeStyle = TYPE_PALETTE[m.assessments?.type ?? ''] ?? 'bg-slate-50 text-slate-500'
              return (
                <div key={m.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/40 transition-colors">
                  <div className={`h-9 w-9 rounded-xl ${typeStyle} flex items-center justify-center shrink-0`}>
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{m.assessments?.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {m.assessments?.subjects?.name}
                      {m.assessments?.date && ` · ${new Date(m.assessments.date).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className={`text-sm font-bold tabular-nums ${GRADE_COLOR(pct)}`}>{m.raw_score}/{m.assessments?.max_marks}</p>
                      <p className="text-[11px] text-slate-400">{pct}%</p>
                    </div>
                    <span className={`text-[11px] font-bold w-7 h-7 rounded-xl flex items-center justify-center ${GRADE_CHIP(pct)}`}>
                      {GRADE_LETTER(pct)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Teacher/Admin view ─────────────────────────────────────────────────────────
export default function MarksPage() {
  const { user } = useAuth()
  if (user?.role === 'parent') return <ParentMarksView />
  if (user?.role === 'student') return <StudentMarksView />
  return <MarkEntryPage />
}

function MarkEntryPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [scores, setScores] = useState<Record<string, string>>({})
  const [comments, setComments] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    assessmentsApi.list().then(r => setAssessments((r.data as Assessment[]) ?? []))
  }, [])

  async function selectAssessment(assessment: Assessment) {
    setSelectedAssessment(assessment)
    setLoading(true)
    // Fetch students in that class
    const res = await fetch(`/api/students?class_id=${assessment.class_id}`)
    const json = await res.json()
    setStudents(json.data ?? [])

    // Fetch existing marks
    const marksRes = await marksApi.list({ assessment_id: assessment.id })
    const existing = (marksRes.data as any[]) ?? []
    const scoreMap: Record<string, string> = {}
    const commentMap: Record<string, string> = {}
    for (const m of existing) {
      scoreMap[m.student_id] = m.raw_score !== null ? String(m.raw_score) : ''
      commentMap[m.student_id] = m.teacher_comment ?? ''
    }
    setScores(scoreMap)
    setComments(commentMap)
    setLoading(false)
  }

  async function saveMarks() {
    if (!selectedAssessment) return
    setSaving(true)
    const marks = students.map(s => ({
      student_id: s.id,
      raw_score: scores[s.id] !== undefined && scores[s.id] !== '' ? parseFloat(scores[s.id]) : null,
      teacher_comment: comments[s.id] ?? undefined,
    }))
    const res = await marksApi.bulkUpsert({ assessment_id: selectedAssessment.id, marks })
    setSaving(false)
    if (res.error) { toast.error(res.error); return }
    toast.success('Marks saved successfully')
  }

  const TYPE_COLORS: Record<string, string> = {
    test: 'bg-blue-500', exam: 'bg-red-500', class_assessment: 'bg-emerald-500',
    practical: 'bg-violet-500', project: 'bg-amber-500',
  }

  const GRADE_COLORS: Record<string, string> = {
    A: 'bg-emerald-100 text-emerald-700', B: 'bg-blue-100 text-blue-700',
    C: 'bg-cyan-100 text-cyan-700', D: 'bg-amber-100 text-amber-700',
    E: 'bg-orange-100 text-orange-700', U: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Mark Entry" description="Select an assessment to enter or edit marks." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Assessment sidebar */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-50">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Assessments</p>
          </div>
          {assessments.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-slate-400">No assessments found.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {assessments.map(a => {
                const active = selectedAssessment?.id === a.id
                const barColor = TYPE_COLORS[a.type] ?? 'bg-slate-400'
                return (
                  <button
                    key={a.id}
                    onClick={() => selectAssessment(a)}
                    className={`w-full text-left px-4 py-3.5 transition-colors flex items-start gap-3 ${active ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                  >
                    <div className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${barColor}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${active ? 'text-blue-700' : 'text-slate-800'}`}>{a.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{a.classes?.name} · {a.subjects?.name}</p>
                      <p className="text-[11px] text-slate-400">{new Date(a.date).toLocaleDateString('en-ZW')} · {a.max_marks} marks</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Mark entry panel */}
        <div className="lg:col-span-2">
          {!selectedAssessment ? (
            <div className="flex flex-col items-center justify-center h-72 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <Save className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-600">Select an assessment</p>
              <p className="text-xs text-slate-400 mt-1">Choose from the list on the left to begin.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Panel header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                <div>
                  <p className="text-sm font-bold text-slate-800">{selectedAssessment.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedAssessment.classes?.name} · {selectedAssessment.subjects?.name} · Max: {selectedAssessment.max_marks} marks
                  </p>
                </div>
                <Button size="sm" onClick={saveMarks} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />}
                  Save
                </Button>
              </div>

              {loading && (
                <div className="py-12 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-slate-300" />
                  <p className="text-sm text-slate-400">Loading students…</p>
                </div>
              )}
              {!loading && students.length === 0 && (
                <div className="py-12 text-center text-sm text-slate-400">No students in this class.</div>
              )}
              {!loading && students.length > 0 && (
                <div className="divide-y divide-slate-50">
                  {students.map((s, i) => {
                    const score = scores[s.id]
                    const grade = score !== undefined && score !== '' && !isNaN(parseFloat(score))
                      ? calculateGradeLetter(parseFloat(score), selectedAssessment.max_marks)
                      : null
                    const pct = score !== '' && score !== undefined && !isNaN(parseFloat(score))
                      ? Math.round((parseFloat(score) / selectedAssessment.max_marks) * 100)
                      : null
                    return (
                      <div key={s.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/50 transition-colors">
                        <span className="w-5 text-xs text-slate-400 text-right shrink-0">{i + 1}</span>
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                          {s.first_name[0]}{s.last_name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{s.first_name} {s.last_name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{s.reg_number}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {pct !== null && (
                            <span className="text-[11px] text-slate-400 w-8 text-right">{pct}%</span>
                          )}
                          {grade && (
                            <span className={`text-[11px] font-bold w-7 h-7 rounded-lg flex items-center justify-center ${GRADE_COLORS[grade] ?? 'bg-slate-100 text-slate-600'}`}>
                              {grade}
                            </span>
                          )}
                          <Input
                            type="number"
                            min={0}
                            max={selectedAssessment.max_marks}
                            step={0.5}
                            value={scores[s.id] ?? ''}
                            onChange={e => setScores(prev => ({ ...prev, [s.id]: e.target.value }))}
                            className="w-20 h-8 text-sm text-center rounded-xl border-slate-200"
                            placeholder="—"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
