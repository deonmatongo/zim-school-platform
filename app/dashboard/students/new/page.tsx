'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FormShell, FormCard, FormSection, FormDivider } from '@/components/ui-custom/FormShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { studentsApi, classesApi } from '@/lib/api/client'
import { toast } from 'sonner'
import { Loader2, UserPlus } from 'lucide-react'

const SELECT_CLS = 'w-full h-10 rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors'

export default function NewStudentPage() {
  const router = useRouter()
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    reg_number: '',
    date_of_birth: '',
    gender: 'M',
    class_id: '',
    boarding: false,
    national_id: '',
    parent_name: '',
    parent_phone: '',
    parent_email: '',
  })

  useEffect(() => {
    classesApi.list().then(r => setClasses((r.data as any[]) ?? []))
  }, [])

  const field = (key: keyof typeof form) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value })),
  })

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload: Record<string, unknown> = { ...form }
    if (!payload.class_id) delete payload.class_id
    if (!payload.national_id) delete payload.national_id
    if (!payload.date_of_birth) delete payload.date_of_birth

    const res = await studentsApi.create(payload as any)
    setSaving(false)
    if (res.error) { toast.error(res.error); return }
    toast.success('Student enrolled successfully')
    router.push('/dashboard/students')
  }

  return (
    <FormShell
      back={{ href: '/dashboard/students', label: 'Students' }}
      title="Enrol New Student"
      description="Register a new student in the school system."
    >
      <form onSubmit={submit}>
        <FormCard>
          <FormSection title="Student Details">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">First name</Label>
                  <Input {...field('first_name')} required className="h-10 rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-500/20" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Last name</Label>
                  <Input {...field('last_name')} required className="h-10 rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-500/20" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Registration number</Label>
                  <Input {...field('reg_number')} placeholder="e.g. SGC2026-001" required className="h-10 rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-500/20 font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">National ID <span className="normal-case font-normal text-slate-400">(optional)</span></Label>
                  <Input {...field('national_id')} placeholder="63-123456A78" className="h-10 rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-500/20 font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Date of birth</Label>
                  <Input type="date" {...field('date_of_birth')} className="h-10 rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-500/20" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Gender</Label>
                  <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} className={SELECT_CLS}>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Class</Label>
                  <select value={form.class_id} onChange={e => setForm(f => ({ ...f, class_id: e.target.value }))} className={SELECT_CLS}>
                    <option value="">— unassigned —</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer select-none group">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="boarder"
                    checked={form.boarding}
                    onChange={e => setForm(f => ({ ...f, boarding: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="h-5 w-5 rounded-md border-2 border-slate-300 peer-checked:border-blue-500 peer-checked:bg-blue-500 transition-colors flex items-center justify-center">
                    {form.boarding && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                </div>
                <span className="text-sm font-medium text-slate-700">Boarding student</span>
              </label>
            </div>
          </FormSection>

          <FormDivider />

          <FormSection title="Parent / Guardian">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Full name</Label>
                <Input {...field('parent_name')} placeholder="e.g. Taurai Moyo" className="h-10 rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-500/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone</Label>
                  <Input {...field('parent_phone')} placeholder="+263771234567" className="h-10 rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-500/20 font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</Label>
                  <Input type="email" {...field('parent_email')} placeholder="parent@example.com" className="h-10 rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-500/20" />
                </div>
              </div>
            </div>
          </FormSection>

          <FormDivider />

          <div className="px-6 py-4 bg-slate-50/60 flex items-center gap-3">
            <Button type="submit" disabled={saving} className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Enrol Student
            </Button>
            <button type="button" onClick={() => router.back()} className="h-10 px-5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors">
              Cancel
            </button>
          </div>
        </FormCard>
      </form>
    </FormShell>
  )
}
