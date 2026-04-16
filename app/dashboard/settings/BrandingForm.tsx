'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, Save, Palette, Globe, FileText, Image, ToggleLeft, ToggleRight } from 'lucide-react'

interface Branding {
  logo_url: string
  favicon_url: string
  school_type: string
  website_url: string
  facebook_url: string
  whatsapp_number: string
  reg_number: string
  primary_color: string
  accent_color: string
  dark_color: string
  font_family: string
  navbar_style: string
  show_motto_on_docs: boolean
  doc_header_text: string
  report_card_footer: string
  watermark_text: string
}

const DEFAULTS: Branding = {
  logo_url: '', favicon_url: '', school_type: 'secondary',
  website_url: '', facebook_url: '', whatsapp_number: '', reg_number: '',
  primary_color: '#1a5276', accent_color: '#e67e22', dark_color: '#1a252f',
  font_family: 'inter', navbar_style: 'dark', show_motto_on_docs: true,
  doc_header_text: '', report_card_footer: '', watermark_text: '',
}

const labelCls = 'text-xs font-semibold text-slate-500 uppercase tracking-wide'
const inputCls = 'h-10 rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-500/20'
const selectCls = 'w-full h-10 rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors'

function SectionHeading({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 pt-2 pb-1">
      <div className="h-6 w-6 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
        <Icon className="h-3.5 w-3.5 text-slate-500" />
      </div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
    </div>
  )
}

export function BrandingForm() {
  const [form, setForm] = useState<Branding>(DEFAULTS)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetch('/api/branding')
      .then(r => r.json())
      .then(json => { if (json.data) setForm({ ...DEFAULTS, ...json.data }) })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/branding', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const json = await res.json()
    setLoading(false)
    if (json.error) { toast.error(json.error); return }
    toast.success('Branding saved to file')
  }

  const field = (key: keyof Branding) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value })),
  })

  if (fetching) return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-slate-50 rounded-xl animate-pulse" />)}
    </div>
  )

  return (
    <form onSubmit={save} className="space-y-5">

      {/* ── Identity ──────────────────────────────────────────────────────── */}
      <SectionHeading icon={Image} label="Identity" />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className={labelCls}>School type</Label>
          <select {...field('school_type')} className={selectCls}>
            <option value="primary">Primary School</option>
            <option value="secondary">Secondary School</option>
            <option value="combined">Combined (Primary + Secondary)</option>
            <option value="college">College</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className={labelCls}>MoPSE Registration No.</Label>
          <Input {...field('reg_number')} placeholder="e.g. 4124" className={inputCls + ' font-mono'} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className={labelCls}>Logo URL</Label>
        <Input {...field('logo_url')} placeholder="https://cdn.school.ac.zw/logo.png" className={inputCls} />
        <p className="text-[11px] text-slate-400">Appears on report cards, receipts, and the navigation bar. Paste a hosted image URL.</p>
      </div>

      <div className="space-y-1.5">
        <Label className={labelCls}>Favicon URL</Label>
        <Input {...field('favicon_url')} placeholder="https://cdn.school.ac.zw/favicon.ico" className={inputCls} />
        <p className="text-[11px] text-slate-400">Shown in the browser tab. Recommended: 32×32 .ico or .png.</p>
      </div>

      {/* Logo preview */}
      {form.logo_url && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={form.logo_url} alt="Logo preview" className="h-12 w-auto object-contain rounded" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <p className="text-xs text-slate-400">Logo preview</p>
        </div>
      )}

      {/* ── Colours & Fonts ───────────────────────────────────────────────── */}
      <SectionHeading icon={Palette} label="Colours & Fonts" />

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className={labelCls}>Primary colour</Label>
          <div className="flex items-center gap-2">
            <input type="color" {...field('primary_color')} className="h-10 w-10 rounded-xl border border-slate-200 cursor-pointer shrink-0" />
            <Input {...field('primary_color')} className={inputCls + ' font-mono text-xs flex-1'} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className={labelCls}>Accent colour</Label>
          <div className="flex items-center gap-2">
            <input type="color" {...field('accent_color')} className="h-10 w-10 rounded-xl border border-slate-200 cursor-pointer shrink-0" />
            <Input {...field('accent_color')} className={inputCls + ' font-mono text-xs flex-1'} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className={labelCls}>Dark colour</Label>
          <div className="flex items-center gap-2">
            <input type="color" {...field('dark_color')} className="h-10 w-10 rounded-xl border border-slate-200 cursor-pointer shrink-0" />
            <Input {...field('dark_color')} className={inputCls + ' font-mono text-xs flex-1'} />
          </div>
        </div>
      </div>

      {/* Colour preview strip */}
      <div className="flex rounded-xl overflow-hidden h-8 border border-slate-100">
        <div className="flex-1" style={{ backgroundColor: form.primary_color }} title="Primary" />
        <div className="flex-1" style={{ backgroundColor: form.accent_color }} title="Accent" />
        <div className="flex-1" style={{ backgroundColor: form.dark_color }} title="Dark" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className={labelCls}>Font family</Label>
          <select {...field('font_family')} className={selectCls}>
            <option value="inter">Inter (default)</option>
            <option value="poppins">Poppins</option>
            <option value="roboto">Roboto</option>
            <option value="lato">Lato</option>
            <option value="merriweather">Merriweather (serif)</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className={labelCls}>Navbar style</Label>
          <select {...field('navbar_style')} className={selectCls}>
            <option value="dark">Dark (default)</option>
            <option value="light">Light</option>
            <option value="primary">Use primary colour</option>
          </select>
        </div>
      </div>

      {/* ── Contact & Social ──────────────────────────────────────────────── */}
      <SectionHeading icon={Globe} label="Contact & Social" />

      <div className="space-y-1.5">
        <Label className={labelCls}>School website</Label>
        <Input {...field('website_url')} placeholder="https://www.school.ac.zw" className={inputCls} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className={labelCls}>Facebook page URL</Label>
          <Input {...field('facebook_url')} placeholder="https://facebook.com/…" className={inputCls} />
        </div>
        <div className="space-y-1.5">
          <Label className={labelCls}>WhatsApp number</Label>
          <Input {...field('whatsapp_number')} placeholder="+263771234567" className={inputCls + ' font-mono'} />
          <p className="text-[11px] text-slate-400">Used for the WhatsApp contact button shown to parents.</p>
        </div>
      </div>

      {/* ── Document settings ─────────────────────────────────────────────── */}
      <SectionHeading icon={FileText} label="Document Branding" />

      <div className="space-y-1.5">
        <Label className={labelCls}>Document header text</Label>
        <Input {...field('doc_header_text')} placeholder="e.g. Ministry of Primary & Secondary Education Registered" className={inputCls} />
        <p className="text-[11px] text-slate-400">Printed below the school name on report cards, receipts, and letters.</p>
      </div>

      <div className="space-y-1.5">
        <Label className={labelCls}>Report card footer</Label>
        <Textarea {...field('report_card_footer')} rows={2}
          placeholder="e.g. This report card is an official document. Any alterations render it void."
          className="rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-500/20 resize-none text-sm" />
      </div>

      <div className="space-y-1.5">
        <Label className={labelCls}>Watermark text</Label>
        <Input {...field('watermark_text')} placeholder="e.g. CONFIDENTIAL" className={inputCls} />
        <p className="text-[11px] text-slate-400">Shown as a faint diagonal watermark on generated PDFs. Leave blank to disable.</p>
      </div>

      <button
        type="button"
        onClick={() => setForm(f => ({ ...f, show_motto_on_docs: !f.show_motto_on_docs }))}
        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-left"
      >
        {form.show_motto_on_docs
          ? <ToggleRight className="h-5 w-5 text-blue-500 shrink-0" />
          : <ToggleLeft className="h-5 w-5 text-slate-300 shrink-0" />}
        <div>
          <p className="text-sm font-semibold text-slate-800">Show motto on documents</p>
          <p className="text-xs text-slate-400">Print the school motto under the school name on reports and receipts.</p>
        </div>
      </button>

      <div className="pt-2">
        <Button type="submit" disabled={loading}
          className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save branding
        </Button>
      </div>
    </form>
  )
}
