'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FormShell, FormCard, FormSection, FormDivider } from '@/components/ui-custom/FormShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { announcementsApi } from '@/lib/api/client'
import { toast } from 'sonner'
import { Loader2, Send } from 'lucide-react'

const SELECT_CLS = 'w-full h-10 rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors'

export default function NewAnnouncementPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    body: '',
    audience: 'all',
    pinned: false,
    published: true,
    academic_year_id: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.body.trim()) {
      toast.error('Title and body are required')
      return
    }
    setLoading(true)

    const yearRes = await fetch('/api/academic-years?current=true')
    const yearJson = await yearRes.json()
    const yearId = yearJson.data?.[0]?.id

    if (!yearId) {
      toast.error('No current academic year found. Please set one up in Settings.')
      setLoading(false)
      return
    }

    const res = await announcementsApi.create({ ...form, academic_year_id: yearId })
    setLoading(false)
    if (res.error) { toast.error(res.error); return }
    toast.success('Announcement created')
    router.push('/dashboard/announcements')
  }

  return (
    <FormShell
      back={{ href: '/dashboard/announcements', label: 'Announcements' }}
      title="New Announcement"
      description="Broadcast a message to your school community."
    >
      <form onSubmit={handleSubmit}>
        <FormCard>
          <FormSection title="Content">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</Label>
                <Input
                  placeholder="e.g. Sports Day — 28 March"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  required
                  className="h-10 rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Message</Label>
                <Textarea
                  placeholder="Write your announcement here…"
                  rows={5}
                  value={form.body}
                  onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                  required
                  className="rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-500/20 resize-none"
                />
              </div>
            </div>
          </FormSection>

          <FormDivider />

          <FormSection title="Settings">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Audience</Label>
                <select
                  value={form.audience}
                  onChange={e => setForm(f => ({ ...f, audience: e.target.value }))}
                  className={SELECT_CLS}
                >
                  <option value="all">Everyone</option>
                  <option value="parents">Parents only</option>
                  <option value="students">Students only</option>
                  <option value="teachers">Teachers only</option>
                </select>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <div className="relative">
                    <input type="checkbox" checked={form.pinned} onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))} className="sr-only peer" />
                    <div className="h-5 w-5 rounded-md border-2 border-slate-300 peer-checked:border-blue-500 peer-checked:bg-blue-500 transition-colors flex items-center justify-center">
                      {form.pinned && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-700">Pin to top</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <div className="relative">
                    <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} className="sr-only peer" />
                    <div className="h-5 w-5 rounded-md border-2 border-slate-300 peer-checked:border-blue-500 peer-checked:bg-blue-500 transition-colors flex items-center justify-center">
                      {form.published && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-700">Publish immediately</span>
                </label>
              </div>
            </div>
          </FormSection>

          <FormDivider />

          <div className="px-6 py-4 bg-slate-50/60 flex items-center gap-3">
            <Button type="submit" disabled={loading} className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              {form.published ? 'Publish' : 'Save Draft'}
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
