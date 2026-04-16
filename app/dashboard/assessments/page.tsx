'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui-custom/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { assessmentsApi, classesApi, subjectsApi } from '@/lib/api/client'
import { toast } from 'sonner'
import { Plus, Loader2, ClipboardList, ArrowRight, Calendar } from 'lucide-react'
import Link from 'next/link'

interface Assessment {
  id: string; title: string; type: string; max_marks: number; date: string
  classes: { name: string } | null
  subjects: { name: string } | null
  academic_years: { year: number; term: number } | null
}

const TYPE_PALETTE: Record<string, { badge: string; icon: string; bar: string }> = {
  test:             { badge: 'bg-blue-100 text-blue-700 border-blue-100',   icon: 'bg-blue-50 text-blue-600',   bar: 'bg-blue-500' },
  exam:             { badge: 'bg-red-100 text-red-700 border-red-100',      icon: 'bg-red-50 text-red-600',     bar: 'bg-red-500' },
  class_assessment: { badge: 'bg-emerald-100 text-emerald-700 border-emerald-100', icon: 'bg-emerald-50 text-emerald-600', bar: 'bg-emerald-500' },
  practical:        { badge: 'bg-violet-100 text-violet-700 border-violet-100', icon: 'bg-violet-50 text-violet-600', bar: 'bg-violet-500' },
  project:          { badge: 'bg-amber-100 text-amber-700 border-amber-100', icon: 'bg-amber-50 text-amber-600', bar: 'bg-amber-500' },
}

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([])
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '', type: 'test', class_id: '', subject_id: '', academic_year_id: '',
    max_marks: '100', date: new Date().toISOString().slice(0, 10),
  })

  useEffect(() => {
    Promise.all([
      assessmentsApi.list(),
      classesApi.list(),
      subjectsApi.list(),
    ]).then(([a, c, s]) => {
      setAssessments((a.data as Assessment[]) ?? [])
      setClasses((c.data as any[]) ?? [])
      setSubjects((s.data as any[]) ?? [])
      setLoading(false)
    })
    // Fetch current year
    fetch('/api/academic-years?current=true').then(r => r.json()).then(r => {
      if (r.data?.[0]) setForm(f => ({ ...f, academic_year_id: r.data[0].id }))
    }).catch(() => {})
  }, [])

  async function createAssessment(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await assessmentsApi.create({ ...form, max_marks: parseInt(form.max_marks) })
    setSaving(false)
    if (res.error) { toast.error(res.error); return }
    toast.success('Assessment created')
    setDialogOpen(false)
    const refreshed = await assessmentsApi.list()
    setAssessments((refreshed.data as Assessment[]) ?? [])
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Assessments"
        description="Manage tests, exams and other assessments."
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={<Button size="sm" />}>
              <Plus className="h-4 w-4 mr-1.5" /> New Assessment
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Assessment</DialogTitle>
              </DialogHeader>
              <form onSubmit={createAssessment} className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Mathematics Test 1" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Type</Label>
                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                      className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
                      {['test','exam','class_assessment','practical','project'].map(t => (
                        <option key={t} value={t}>{t.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Max Marks</Label>
                    <Input type="number" min={1} value={form.max_marks} onChange={e => setForm(f => ({ ...f, max_marks: e.target.value }))} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Class</Label>
                    <select value={form.class_id} onChange={e => setForm(f => ({ ...f, class_id: e.target.value }))}
                      className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" required>
                      <option value="">Select class…</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Subject</Label>
                    <select value={form.subject_id} onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))}
                      className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" required>
                      <option value="">Select subject…</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : assessments.length === 0 ? (
        <div className="py-20 text-center">
          <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No assessments yet</p>
          <p className="text-xs text-slate-400 mt-1">Create your first assessment to start entering marks.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-50">
            {assessments.map((a) => {
              const p = TYPE_PALETTE[a.type] ?? { badge: 'bg-slate-100 text-slate-600 border-slate-200', icon: 'bg-slate-50 text-slate-500', bar: 'bg-slate-400' }
              return (
                <div key={a.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors group">
                  <div className={`h-10 w-10 rounded-xl ${p.icon} flex items-center justify-center shrink-0`}>
                    <ClipboardList className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-slate-800 truncate">{a.title}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${p.badge}`}>
                        {a.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {a.subjects?.name} · {a.classes?.name}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
                    <Calendar className="h-3 w-3" />
                    {new Date(a.date).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short' })}
                  </div>
                  <div className="hidden sm:block text-xs text-slate-400 w-20 text-center shrink-0">
                    <span className="font-semibold text-slate-700">{a.max_marks}</span> marks
                  </div>
                  <Link
                    href={`/dashboard/marks?assessment_id=${a.id}`}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 shrink-0"
                  >
                    Enter marks <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
