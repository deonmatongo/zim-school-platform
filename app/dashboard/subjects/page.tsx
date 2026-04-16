'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui-custom/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { subjectsApi } from '@/lib/api/client'
import { toast } from 'sonner'
import { Plus, Loader2, BookOpen } from 'lucide-react'

interface Subject {
  id: string
  name: string
  code: string | null
  description: string | null
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', code: '', description: '' })

  useEffect(() => {
    subjectsApi.list().then(r => {
      setSubjects((r.data as Subject[]) ?? [])
      setLoading(false)
    })
  }, [])

  async function create(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload: Record<string, string> = { name: form.name }
    if (form.code) payload.code = form.code
    if (form.description) payload.description = form.description
    const res = await subjectsApi.create(payload as any)
    setSaving(false)
    if (res.error) { toast.error(res.error); return }
    toast.success('Subject created')
    setDialogOpen(false)
    setForm({ name: '', code: '', description: '' })
    const refreshed = await subjectsApi.list()
    setSubjects((refreshed.data as Subject[]) ?? [])
  }

  const palettes = [
    { bar: 'bg-blue-500',    icon: 'bg-blue-100 text-blue-600',    code: 'bg-blue-50 text-blue-700 border-blue-100' },
    { bar: 'bg-violet-500',  icon: 'bg-violet-100 text-violet-600', code: 'bg-violet-50 text-violet-700 border-violet-100' },
    { bar: 'bg-emerald-500', icon: 'bg-emerald-100 text-emerald-600', code: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { bar: 'bg-amber-500',   icon: 'bg-amber-100 text-amber-600',   code: 'bg-amber-50 text-amber-700 border-amber-100' },
    { bar: 'bg-rose-500',    icon: 'bg-rose-100 text-rose-600',     code: 'bg-rose-50 text-rose-700 border-rose-100' },
    { bar: 'bg-cyan-500',    icon: 'bg-cyan-100 text-cyan-600',     code: 'bg-cyan-50 text-cyan-700 border-cyan-100' },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        title="Subjects"
        description="Manage subjects offered at your school."
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={<Button size="sm" />}>
              <Plus className="h-4 w-4 mr-1.5" /> New Subject
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Subject</DialogTitle>
              </DialogHeader>
              <form onSubmit={create} className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label>Subject name</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Mathematics" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Code</Label>
                  <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="e.g. MTH" />
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional" />
                </div>
                <div className="flex gap-3 pt-1">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <div className="py-20 text-center">
          <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No subjects yet</p>
          <p className="text-xs text-slate-400 mt-1">Add your first subject to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((s, idx) => {
            const p = palettes[idx % palettes.length]
            return (
              <div key={s.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className={`h-1.5 w-full ${p.bar}`} />
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-xl ${p.icon} flex items-center justify-center shrink-0`}>
                      <BookOpen className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm leading-tight">{s.name}</p>
                      {s.code && (
                        <span className={`inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full border font-mono tracking-wide ${p.code}`}>
                          {s.code}
                        </span>
                      )}
                    </div>
                  </div>
                  {s.description && (
                    <p className="text-xs text-slate-400 mt-3 leading-relaxed line-clamp-2">{s.description}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
