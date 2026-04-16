'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { reportsApi } from '@/lib/api/client'
import { toast } from 'sonner'
import { Loader2, Zap } from 'lucide-react'

export function GenerateReportButton({ academicYearId }: { academicYearId?: string }) {
  const [studentId, setStudentId] = useState('')
  const [loading, setLoading] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  async function generate() {
    if (!studentId.trim()) { toast.error('Enter a student ID'); return }
    if (!academicYearId) { toast.error('No active academic year'); return }
    setLoading(true)
    setPdfUrl(null)
    const res = await reportsApi.generate(studentId.trim(), academicYearId)
    setLoading(false)
    if (res.error) { toast.error(res.error); return }
    const data = res.data as any
    toast.success('Report card generated')
    if (data?.pdf_url) setPdfUrl(data.pdf_url)
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Enter a student ID to generate their term report card as a PDF.
        This calculates class positions and uploads to storage.
      </p>
      <div className="space-y-1.5">
        <Label htmlFor="sid">Student ID (UUID)</Label>
        <Input
          id="sid"
          value={studentId}
          onChange={e => setStudentId(e.target.value)}
          placeholder="e.g. st000001-0000-…"
        />
      </div>
      <Button onClick={generate} disabled={loading} className="w-full">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
        Generate Report Card
      </Button>
      {pdfUrl && (
        <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
          className="block text-center text-sm text-blue-600 hover:underline">
          Download PDF →
        </a>
      )}
    </div>
  )
}
