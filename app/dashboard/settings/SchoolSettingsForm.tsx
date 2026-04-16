'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'

interface School {
  id: string; name: string; slug: string; motto: string | null; district: string | null
  province: string | null; address: string | null; phone: string | null; email: string | null
  ecocash_number: string | null; primary_color: string; accent_color: string; currency: string
}

export function SchoolSettingsForm({ school }: { school: School | null }) {
  const [form, setForm] = useState({
    name: school?.name ?? '',
    motto: school?.motto ?? '',
    district: school?.district ?? '',
    province: school?.province ?? '',
    address: school?.address ?? '',
    phone: school?.phone ?? '',
    email: school?.email ?? '',
    ecocash_number: school?.ecocash_number ?? '',
    primary_color: school?.primary_color ?? '#1a5276',
    accent_color: school?.accent_color ?? '#e67e22',
    currency: school?.currency ?? 'USD',
  })
  const [loading, setLoading] = useState(false)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch(`/api/schools/${school?.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const json = await res.json()
    setLoading(false)
    if (json.error) { toast.error(json.error); return }
    toast.success('Settings saved')
  }

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value })),
  })

  const inputCls = 'h-10 rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-500/20'
  const selectCls = 'w-full h-10 rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors'
  const labelCls = 'text-xs font-semibold text-slate-500 uppercase tracking-wide'

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="space-y-1.5">
        <Label className={labelCls}>School name</Label>
        <Input {...field('name')} required className={inputCls} />
      </div>

      <div className="space-y-1.5">
        <Label className={labelCls}>Motto</Label>
        <Input {...field('motto')} placeholder="e.g. Courage and Integrity" className={inputCls} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className={labelCls}>District</Label>
          <Input {...field('district')} placeholder="Harare" className={inputCls} />
        </div>
        <div className="space-y-1.5">
          <Label className={labelCls}>Province</Label>
          <Input {...field('province')} placeholder="Harare Province" className={inputCls} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className={labelCls}>Address</Label>
        <Textarea {...field('address')} rows={2} placeholder="Full school address" className="rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-500/20 resize-none" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className={labelCls}>Phone</Label>
          <Input {...field('phone')} placeholder="+263242…" className={inputCls + ' font-mono'} />
        </div>
        <div className="space-y-1.5">
          <Label className={labelCls}>Email</Label>
          <Input type="email" {...field('email')} placeholder="admin@school.ac.zw" className={inputCls} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className={labelCls}>EcoCash merchant number</Label>
        <Input {...field('ecocash_number')} placeholder="263771234567" className={inputCls + ' font-mono'} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className={labelCls}>Primary colour</Label>
          <div className="flex items-center gap-2">
            <input type="color" {...field('primary_color')} className="h-10 w-10 rounded-xl border border-slate-200 cursor-pointer" />
            <Input {...field('primary_color')} className={inputCls + ' font-mono text-xs flex-1'} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className={labelCls}>Accent colour</Label>
          <div className="flex items-center gap-2">
            <input type="color" {...field('accent_color')} className="h-10 w-10 rounded-xl border border-slate-200 cursor-pointer" />
            <Input {...field('accent_color')} className={inputCls + ' font-mono text-xs flex-1'} />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className={labelCls}>Currency</Label>
        <select {...field('currency')} className={selectCls}>
          <option value="USD">USD — US Dollar</option>
          <option value="ZIG">ZIG — Zimbabwe Gold</option>
        </select>
      </div>

      <div className="pt-2">
        <Button type="submit" disabled={loading} className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save changes
        </Button>
      </div>
    </form>
  )
}
