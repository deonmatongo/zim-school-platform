'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui-custom/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { classesApi, gradesApi, teachersApi } from '@/lib/api/client'
import { toast } from 'sonner'
import { Plus, Loader2, Users, ArrowRight, GraduationCap } from 'lucide-react'
import Link from 'next/link'

interface ClassItem {
  id: string
  name: string
  capacity: number | null
  grades: { name: string; level: number } | null
  user_profiles: { first_name: string; last_name: string } | null
  academic_years: { year: string; term: number } | null
}

const PALETTES = [
  { bar: 'bg-blue-500',    icon: 'bg-blue-100 text-blue-600',     badge: 'bg-blue-50 text-blue-700 border-blue-100',    text: 'text-blue-700' },
  { bar: 'bg-violet-500',  icon: 'bg-violet-100 text-violet-600', badge: 'bg-violet-50 text-violet-700 border-violet-100', text: 'text-violet-700' },
  { bar: 'bg-emerald-500', icon: 'bg-emerald-100 text-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', text: 'text-emerald-700' },
  { bar: 'bg-amber-500',   icon: 'bg-amber-100 text-amber-600',   badge: 'bg-amber-50 text-amber-700 border-amber-100',   text: 'text-amber-700' },
  { bar: 'bg-rose-500',    icon: 'bg-rose-100 text-rose-600',     badge: 'bg-rose-50 text-rose-700 border-rose-100',     text: 'text-rose-700' },
  { bar: 'bg-cyan-500',    icon: 'bg-cyan-100 text-cyan-600',     badge: 'bg-cyan-50 text-cyan-700 border-cyan-100',     text: 'text-cyan-700' },
]

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [teachers, setTeachers] = useState<{ id: string; first_name: string; last_name: string }[]>([])
  const [grades, setGrades] = useState<{ id: string; name: string; level: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeGrade, setActiveGrade] = useState<string>('all')
  const [form, setForm] = useState({
    name: '', grade_id: '', academic_year_id: '',
    homeroom_teacher_id: '', capacity: '40',
  })

  useEffect(() => {
    Promise.all([
      classesApi.list(),
      teachersApi.list(),
      gradesApi.list(),
      fetch('/api/academic-years?current=true').then(r => r.json()),
    ]).then(([c, t, g, ay]) => {
      setClasses((c.data as ClassItem[]) ?? [])
      setTeachers((t.data as any[]) ?? [])
      setGrades((g.data as any[]) ?? [])
      const years = (ay.data as any[]) ?? []
      if (years[0]) setForm(f => ({ ...f, academic_year_id: years[0].id }))
      setLoading(false)
    })
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload: Record<string, unknown> = {
      name: form.name,
      grade_id: form.grade_id,
      academic_year_id: form.academic_year_id,
      capacity: parseInt(form.capacity),
    }
    if (form.homeroom_teacher_id) payload.homeroom_teacher_id = form.homeroom_teacher_id
    const res = await classesApi.create(payload)
    setSaving(false)
    if ((res as any).error) { toast.error((res as any).error); return }
    toast.success('Class created')
    setDialogOpen(false)
    setForm(f => ({ ...f, name: '', grade_id: '', homeroom_teacher_id: '' }))
    const refreshed = await classesApi.list()
    setClasses((refreshed.data as ClassItem[]) ?? [])
  }

  const uniqueGrades = Array.from(
    new Map(classes.filter(c => c.grades).map(c => [c.grades!.level, c.grades!])).entries()
  ).map(([, g]) => g).sort((a, b) => a.level - b.level)

  const filtered = activeGrade === 'all'
    ? classes
    : classes.filter(c => c.grades?.name === activeGrade)

  return (
    <div className="space-y-5">
      <PageHeader
        title="Classes"
        description="Manage all classes in your school."
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={<Button size="sm" />}>
              <Plus className="h-4 w-4 mr-1.5" /> New Class
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Class</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label>Class Name</Label>
                  <Input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Form 3A"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Grade</Label>
                    <select
                      value={form.grade_id}
                      onChange={e => setForm(f => ({ ...f, grade_id: e.target.value }))}
                      className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                      required
                    >
                      <option value="">Select grade…</option>
                      {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Capacity</Label>
                    <Input
                      type="number" min={1} max={200}
                      value={form.capacity}
                      onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Homeroom Teacher <span className="text-slate-400 font-normal">(optional)</span></Label>
                  <select
                    value={form.homeroom_teacher_id}
                    onChange={e => setForm(f => ({ ...f, homeroom_teacher_id: e.target.value }))}
                    className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">None</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                    ))}
                  </select>
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

      {/* Grade filter pills */}
      {!loading && uniqueGrades.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          {['all', ...uniqueGrades.map(g => g.name)].map(label => (
            <button
              key={label}
              onClick={() => setActiveGrade(label)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                activeGrade === label
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              {label === 'all' ? 'All Grades' : label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No classes yet</p>
          <p className="text-xs text-slate-400 mt-1">Create your first class to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c, idx) => {
            const p = PALETTES[idx % PALETTES.length]
            const teacher = c.user_profiles
            return (
              <Link key={c.id} href={`/dashboard/classes/${c.id}`}>
                <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer h-full">
                  <div className={`h-1.5 w-full ${p.bar}`} />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className={`h-11 w-11 rounded-xl ${p.icon} flex items-center justify-center shrink-0 font-bold text-base`}>
                        {c.name.replace(/[^A-Z0-9]/gi, '').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-base leading-tight">{c.name}</p>
                        {c.grades?.name && (
                          <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${p.badge}`}>
                            {c.grades.name}
                          </span>
                        )}
                      </div>
                      <ArrowRight className={`h-4 w-4 mt-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${p.text}`} />
                    </div>

                    <div className="flex items-center gap-4 mt-3">
                      {c.capacity && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          <span>Capacity <span className="font-semibold text-slate-700">{c.capacity}</span></span>
                        </div>
                      )}
                    </div>

                    {teacher && (
                      <p className="text-xs text-slate-400 truncate mt-2">
                        Homeroom: <span className="text-slate-600 font-medium">{teacher.first_name} {teacher.last_name}</span>
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
