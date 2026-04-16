'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { feesApi, studentsApi } from '@/lib/api/client'
import { FormShell, FormCard } from '@/components/ui-custom/FormShell'
import { StatusBadge } from '@/components/ui-custom/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  CreditCard, Receipt, AlertCircle, CheckCircle2,
  CalendarDays, Landmark, ClipboardCheck, Loader2,
  ArrowUpRight, Clock,
} from 'lucide-react'

interface LedgerRow {
  id: string; amount_billed: number; amount_paid: number
  currency: string; due_date: string | null; overdue: boolean
  description?: string
  academic_years: { year: string; term: number } | null
}

interface Payment {
  id: string; amount: number; paid_at: string
  method: string; reference: string
}

interface PlanRequest {
  id: string; proposed_monthly: number; start_date: string
  reason: string; status: 'pending' | 'approved' | 'rejected'
  created_at: string; admin_note: string | null
}

const METHOD_LABELS: Record<string, string> = {
  bank_transfer: 'Bank Transfer',
  cash: 'Cash',
  ecocash: 'EcoCash',
  card: 'Card',
  cheque: 'Cheque',
}

export default function StudentFeesPage() {
  const { studentId } = useParams<{ studentId: string }>()
  const { user } = useAuth()
  const isParent = user?.role === 'parent'
  const backHref = isParent ? '/dashboard/fees' : '/dashboard/fees'

  const [student, setStudent] = useState<any>(null)
  const [ledger, setLedger] = useState<LedgerRow[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [planRequests, setPlanRequests] = useState<PlanRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [currentYear, setCurrentYear] = useState<any>(null)

  // Payment plan form
  const [planOpen, setPlanOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [planForm, setPlanForm] = useState({ proposed_monthly: '', start_date: '', reason: '' })

  useEffect(() => {
    Promise.all([
      studentsApi.get(studentId),
      feesApi.ledger(studentId),
      feesApi.payments({ student_id: studentId }),
      fetch(`/api/fees/payment-plan?student_id=${studentId}`).then(r => r.json()),
      fetch('/api/academic-years?current=true').then(r => r.json()),
    ]).then(([s, l, p, plans, ay]) => {
      setStudent((s as any).data)
      setLedger(((l as any).data as LedgerRow[]) ?? [])
      setPayments(((p as any).data as Payment[]) ?? [])
      setPlanRequests((plans.data as PlanRequest[]) ?? [])
      if (ay.data?.[0]) setCurrentYear(ay.data[0])
      setLoading(false)
    })
  }, [studentId])

  const totalBilled  = ledger.reduce((s, r) => s + Number(r.amount_billed), 0)
  const totalPaid    = ledger.reduce((s, r) => s + Number(r.amount_paid), 0)
  const balance      = totalBilled - totalPaid
  const pct          = totalBilled > 0 ? Math.min(100, Math.round((totalPaid / totalBilled) * 100)) : 0
  const outstanding  = ledger.filter(r => Number(r.amount_billed) - Number(r.amount_paid) > 0)
  const latestPlan   = planRequests[0] ?? null

  async function requestPlan(e: React.FormEvent) {
    e.preventDefault()
    if (!currentYear) { toast.error('No active academic year'); return }
    setSubmitting(true)
    const res = await fetch('/api/fees/payment-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: studentId,
        academic_year_id: currentYear.id,
        proposed_monthly: parseFloat(planForm.proposed_monthly),
        start_date: planForm.start_date,
        reason: planForm.reason,
      }),
    }).then(r => r.json())
    setSubmitting(false)
    if (res.error) { toast.error(res.error); return }
    toast.success('Payment plan request submitted')
    setPlanOpen(false)
    setPlanRequests([{ id: res.data.id, status: 'pending', proposed_monthly: parseFloat(planForm.proposed_monthly), start_date: planForm.start_date, reason: planForm.reason, created_at: new Date().toISOString(), admin_note: null }, ...planRequests])
  }

  if (loading) {
    return (
      <div className="space-y-5 max-w-2xl">
        <div className="h-8 w-48 bg-slate-100 rounded-lg animate-pulse" />
        <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    )
  }

  const s = student as any

  return (
    <FormShell
      back={{ href: backHref, label: isParent ? 'School Fees' : 'Fee Management' }}
      title={s ? `${s.first_name} ${s.last_name}` : 'Student'}
      description={s ? `${s.reg_number}${s.classes?.name ? ` · ${s.classes.name}` : ''}` : ''}
    >

      {/* Visual balance bar */}
      <FormCard>
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-slate-400 font-medium mb-0.5">Fee Balance</p>
              <div className="flex items-baseline gap-2">
                <p className={`text-3xl font-bold ${balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  ${balance.toFixed(2)}
                </p>
                {balance > 0 ? (
                  <span className="text-sm text-red-400 font-medium">outstanding</span>
                ) : (
                  <span className="flex items-center gap-1 text-sm text-emerald-500 font-medium">
                    <CheckCircle2 className="h-4 w-4" /> fully paid
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 mb-0.5">Collection</p>
              <p className="text-2xl font-bold text-slate-700">{pct}%</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Summary row */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-50">
            {[
              { label: 'Total Billed', value: `$${totalBilled.toFixed(2)}`, icon: <Landmark className="h-3.5 w-3.5 text-slate-400" />, color: 'text-slate-800' },
              { label: 'Amount Paid',  value: `$${totalPaid.toFixed(2)}`,   icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />, color: 'text-emerald-700' },
              { label: 'Balance Due',  value: `$${balance.toFixed(2)}`,     icon: <AlertCircle className="h-3.5 w-3.5 text-red-400" />, color: balance > 0 ? 'text-red-600' : 'text-emerald-600' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex items-center gap-1.5 mb-1">{item.icon}<p className="text-xs text-slate-400">{item.label}</p></div>
                <p className={`text-base font-bold ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </FormCard>

      {/* Outstanding Charges */}
      {outstanding.length > 0 && (
        <FormCard>
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-50">
            <div className="h-7 w-7 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertCircle className="h-3.5 w-3.5 text-red-500" />
            </div>
            <p className="text-sm font-bold text-slate-800">Outstanding Charges</p>
            <span className="ml-auto text-xs font-semibold text-red-500">${balance.toFixed(2)} due</span>
          </div>
          <div className="divide-y divide-slate-50">
            {outstanding.map(row => {
              const rowBalance = Number(row.amount_billed) - Number(row.amount_paid)
              const isOverdue = row.overdue || (row.due_date && row.due_date < new Date().toISOString().slice(0, 10))
              return (
                <div key={row.id} className="flex items-center gap-4 px-6 py-4">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${isOverdue ? 'bg-red-50' : 'bg-amber-50'}`}>
                    <Clock className={`h-3.5 w-3.5 ${isOverdue ? 'text-red-500' : 'text-amber-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                      {row.description ?? 'Tuition Fee'}
                      {row.academic_years && <span className="text-slate-400 font-normal"> — {row.academic_years.year} Term {row.academic_years.term}</span>}
                    </p>
                    {row.due_date && (
                      <p className={`text-xs mt-0.5 ${isOverdue ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
                        {isOverdue ? '⚠ Overdue — ' : 'Due '}
                        {new Date(row.due_date).toLocaleDateString('en-ZW', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                    {/* Partial progress */}
                    {Number(row.amount_paid) > 0 && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        ${Number(row.amount_paid).toFixed(2)} paid of ${Number(row.amount_billed).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-bold text-red-600">${rowBalance.toFixed(2)}</p>
                    <StatusBadge status={Number(row.amount_paid) > 0 ? 'partial' : 'unpaid'} className="mt-1" />
                  </div>
                </div>
              )
            })}
          </div>
          {isParent && (
            <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-50 flex items-center justify-between">
              <p className="text-xs text-slate-500">Need help clearing the balance?</p>
              <Dialog open={planOpen} onOpenChange={setPlanOpen}>
                <DialogTrigger render={<Button size="sm" variant="outline" />}>
                  <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                  {latestPlan?.status === 'pending' ? 'Plan Requested' : 'Request Payment Plan'}
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request a Payment Plan</DialogTitle>
                  </DialogHeader>
                  {latestPlan?.status === 'pending' ? (
                    <div className="mt-3 space-y-4">
                      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
                        <Clock className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-amber-800">Request Pending</p>
                          <p className="text-xs text-amber-600 mt-0.5">Your request is being reviewed by the school bursar. You will be notified once a decision is made.</p>
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-100 divide-y divide-slate-50 text-sm">
                        <div className="flex justify-between px-4 py-2.5"><span className="text-slate-500">Monthly amount</span><span className="font-semibold">${latestPlan.proposed_monthly}</span></div>
                        <div className="flex justify-between px-4 py-2.5"><span className="text-slate-500">Start date</span><span className="font-semibold">{new Date(latestPlan.start_date).toLocaleDateString('en-ZW', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
                        <div className="flex justify-between px-4 py-2.5"><span className="text-slate-500">Submitted</span><span className="font-semibold">{new Date(latestPlan.created_at).toLocaleDateString('en-ZW')}</span></div>
                      </div>
                    </div>
                  ) : latestPlan?.status === 'approved' ? (
                    <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-4 flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-emerald-800">Payment Plan Approved</p>
                        <p className="text-xs text-emerald-600 mt-1">${latestPlan.proposed_monthly}/month from {new Date(latestPlan.start_date).toLocaleDateString('en-ZW')}</p>
                        {latestPlan.admin_note && <p className="text-xs text-emerald-600 mt-1">{latestPlan.admin_note}</p>}
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={requestPlan} className="space-y-4 mt-3">
                      <p className="text-sm text-slate-500">
                        Submit a request to pay your outstanding balance in monthly instalments.
                        The school bursar will review and contact you.
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label>Monthly Amount (USD)</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                            <Input
                              type="number" min={1} step="0.01"
                              value={planForm.proposed_monthly}
                              onChange={e => setPlanForm(f => ({ ...f, proposed_monthly: e.target.value }))}
                              className="pl-6"
                              placeholder="e.g. 150"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label>First Payment Date</Label>
                          <Input
                            type="date"
                            value={planForm.start_date}
                            onChange={e => setPlanForm(f => ({ ...f, start_date: e.target.value }))}
                            min={new Date().toISOString().slice(0, 10)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Reason / Explanation</Label>
                        <textarea
                          value={planForm.reason}
                          onChange={e => setPlanForm(f => ({ ...f, reason: e.target.value }))}
                          rows={3}
                          placeholder="Briefly explain why you need a payment plan…"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                          required
                          minLength={10}
                        />
                      </div>
                      <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-700">
                        Your remaining balance is <strong>${balance.toFixed(2)}</strong>. At ${planForm.proposed_monthly || '—'}/month, this would take approximately{' '}
                        {planForm.proposed_monthly ? Math.ceil(balance / parseFloat(planForm.proposed_monthly)) : '—'} months to clear.
                      </div>
                      <div className="flex gap-3 pt-1">
                        <Button type="submit" disabled={submitting}>
                          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          <ArrowUpRight className="mr-1.5 h-3.5 w-3.5" /> Submit Request
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => setPlanOpen(false)}>Cancel</Button>
                      </div>
                    </form>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          )}
        </FormCard>
      )}

      {/* Payment History */}
      <FormCard>
        <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-50">
          <div className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Receipt className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <p className="text-sm font-bold text-slate-800">Payment History</p>
          <span className="ml-auto text-xs text-slate-400">{payments.length} payments · ${totalPaid.toFixed(2)} total</span>
        </div>
        {payments.length === 0 ? (
          <div className="py-12 text-center">
            <CreditCard className="h-6 w-6 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No payments recorded yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {payments.map(p => (
              <div key={p.id} className="flex items-center gap-4 px-6 py-3.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">
                    {METHOD_LABELS[p.method] ?? p.method}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(p.paid_at).toLocaleDateString('en-ZW', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {p.reference && <span className="font-mono ml-2 text-slate-300">· {p.reference}</span>}
                  </p>
                </div>
                <p className="text-base font-bold text-emerald-600 shrink-0">${Number(p.amount).toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </FormCard>

      {/* Payment plan status (if exists and not parent — admin view) */}
      {!isParent && planRequests.length > 0 && (
        <FormCard>
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-50">
            <div className="h-7 w-7 rounded-lg bg-violet-50 flex items-center justify-center">
              <ClipboardCheck className="h-3.5 w-3.5 text-violet-600" />
            </div>
            <p className="text-sm font-bold text-slate-800">Payment Plan Requests</p>
          </div>
          <div className="divide-y divide-slate-50">
            {planRequests.map(req => (
              <div key={req.id} className="flex items-center gap-4 px-6 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800">${req.proposed_monthly}/month</p>
                    <StatusBadge status={req.status} />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    From {new Date(req.start_date).toLocaleDateString('en-ZW')} · Submitted {new Date(req.created_at).toLocaleDateString('en-ZW')}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{req.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </FormCard>
      )}

    </FormShell>
  )
}
