'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui-custom/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { feesApi } from '@/lib/api/client'
import { buttonVariants } from '@/components/ui/button'
import { toast } from 'sonner'
import { Plus, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Payment {
  id: string
  amount: number
  method: string
  payment_date: string
  receipt_number: string | null
  notes: string | null
  students: { first_name: string; last_name: string; reg_number: string } | null
}

const METHOD_LABELS: Record<string, string> = {
  cash: 'Cash',
  ecocash: 'EcoCash',
  zimswitch: 'ZimSwitch',
  bank_transfer: 'Bank Transfer',
  rtgs: 'RTGS',
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    student_id: '',
    amount: '',
    method: 'cash',
    payment_date: new Date().toISOString().slice(0, 10),
    notes: '',
  })

  useEffect(() => {
    fetch('/api/fees/payment')
      .then(r => r.json())
      .then(r => {
        setPayments(r.data ?? [])
        setLoading(false)
      })
  }, [])

  async function recordPayment(e: React.FormEvent) {
    e.preventDefault()
    if (!form.student_id.trim()) { toast.error('Student ID required'); return }
    setSaving(true)
    const res = await feesApi.recordPayment({
      student_id: form.student_id.trim(),
      amount: parseFloat(form.amount),
      method: form.method,
      payment_date: form.payment_date,
      notes: form.notes || undefined,
    } as any)
    setSaving(false)
    if (res.error) { toast.error(res.error); return }
    toast.success('Payment recorded')
    setDialogOpen(false)
    setForm({ student_id: '', amount: '', method: 'cash', payment_date: new Date().toISOString().slice(0, 10), notes: '' })
    const refreshed = await fetch('/api/fees/payment').then(r => r.json())
    setPayments(refreshed.data ?? [])
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Payment History"
        description="All fee payments recorded."
        action={
          <div className="flex gap-2">
            <Link href="/dashboard/fees" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Fee Overview
            </Link>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger render={<Button size="sm" />}>
                <Plus className="h-4 w-4 mr-1.5" /> Record Payment
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Payment</DialogTitle>
                </DialogHeader>
                <form onSubmit={recordPayment} className="space-y-4 mt-2">
                  <div className="space-y-1.5">
                    <Label>Student ID (UUID)</Label>
                    <Input
                      value={form.student_id}
                      onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))}
                      placeholder="student UUID"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Amount (USD)</Label>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={form.amount}
                        onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Method</Label>
                      <select
                        value={form.method}
                        onChange={e => setForm(f => ({ ...f, method: e.target.value }))}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                      >
                        {Object.entries(METHOD_LABELS).map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={form.payment_date}
                      onChange={e => setForm(f => ({ ...f, payment_date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Notes</Label>
                    <Input
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder="Optional"
                    />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <Button type="submit" disabled={saving}>
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Record
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="divide-y">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 flex items-center justify-between">
                  <div className="space-y-1.5">
                    <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          ) : payments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-10 text-center">No payments recorded yet.</p>
          ) : (
            <div className="divide-y">
              {payments.map(p => (
                <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium">
                      {p.students ? `${p.students.first_name} ${p.students.last_name}` : 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.students?.reg_number} · {METHOD_LABELS[p.method] ?? p.method} · {new Date(p.payment_date).toLocaleDateString('en-ZW')}
                    </p>
                    {p.notes && <p className="text-xs text-muted-foreground">{p.notes}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-700">${Number(p.amount).toFixed(2)}</p>
                    {p.receipt_number && (
                      <p className="text-xs font-mono text-muted-foreground">{p.receipt_number}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
