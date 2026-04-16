'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { PageHeader } from '@/components/ui-custom/PageHeader'
import { StatCard } from '@/components/ui-custom/StatCard'
import { FeesChartPanel } from '@/components/ui-custom/charts/FeesChartPanel'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  CreditCard, TrendingUp, AlertCircle, DollarSign, ChevronRight,
  Loader2, CheckCircle2, Clock, CalendarDays, ArrowUpRight,
  Receipt, Landmark,
} from 'lucide-react'
import Link from 'next/link'
import { parentApi, feesApi } from '@/lib/api/client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeeRow {
  id: string; first_name: string; last_name: string
  reg_number: string; classes: { name: string } | null
  billed: number; paid: number; balance: number
}

interface Child {
  student_id: string
  fee_balance: number; fee_billed: number; fee_paid: number; fee_status: string
  students: { id: string; first_name: string; last_name: string; reg_number: string; class_id: string; classes: { name: string } | null }
}

interface LedgerRow {
  id: string; amount_billed: number; amount_paid: number
  currency: string; due_date: string | null; overdue: boolean
  description?: string
  academic_years: { year: string; term: number } | null
}

interface Payment {
  id: string; amount: number; paid_at: string; method: string; reference: string
}

interface PlanRequest {
  id: string; proposed_monthly: number; start_date: string
  reason: string; status: 'pending' | 'approved' | 'rejected'
  created_at: string; admin_note: string | null
}

const METHOD_LABELS: Record<string, string> = {
  bank_transfer: 'Bank Transfer', cash: 'Cash',
  ecocash: 'EcoCash', card: 'Card', cheque: 'Cheque',
}

const STATUS_STYLES = {
  paid:    { pill: 'bg-emerald-100 text-emerald-700 border-emerald-100', bar: 'bg-emerald-500', label: 'Paid' },
  partial: { pill: 'bg-amber-100 text-amber-700 border-amber-100',       bar: 'bg-amber-400',   label: 'Partial' },
  unpaid:  { pill: 'bg-red-100 text-red-600 border-red-100',             bar: 'bg-red-400',     label: 'Unpaid' },
}

const AVATAR_GRADIENTS = [
  'from-blue-400 to-indigo-500', 'from-violet-400 to-purple-500',
  'from-emerald-400 to-teal-500', 'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-500',   'from-cyan-400 to-sky-500',
]

// ─── Parent view ──────────────────────────────────────────────────────────────

function ParentFeesView() {
  const [children, setChildren]     = useState<Child[]>([])
  const [activeIdx, setActiveIdx]   = useState(0)
  const [ledger, setLedger]         = useState<LedgerRow[]>([])
  const [payments, setPayments]     = useState<Payment[]>([])
  const [planRequests, setPlanRequests] = useState<PlanRequest[]>([])
  const [currentYear, setCurrentYear]  = useState<any>(null)
  const [loading, setLoading]       = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)

  // Payment plan dialog state
  const [planOpen, setPlanOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [planForm, setPlanForm] = useState({ proposed_monthly: '', start_date: '', reason: '' })

  useEffect(() => {
    Promise.all([
      parentApi.children(),
      fetch('/api/academic-years?current=true').then(r => r.json()),
    ]).then(([c, ay]) => {
      setChildren((c.data as Child[]) ?? [])
      if (ay.data?.[0]) setCurrentYear(ay.data[0])
      setLoading(false)
    })
  }, [])

  const active = children[activeIdx]

  useEffect(() => {
    if (!active) return
    setDetailLoading(true)
    const sid = active.students.id
    Promise.all([
      feesApi.ledger(sid),
      feesApi.payments({ student_id: sid }),
      fetch(`/api/fees/payment-plan?student_id=${sid}`).then(r => r.json()),
    ]).then(([l, p, plans]) => {
      setLedger(((l as any).data as LedgerRow[]) ?? [])
      setPayments(((p as any).data as Payment[]) ?? [])
      setPlanRequests((plans.data as PlanRequest[]) ?? [])
      setDetailLoading(false)
    })
  }, [activeIdx, active?.students.id])

  const totalBilled   = ledger.reduce((s, r) => s + Number(r.amount_billed), 0)
  const totalPaid     = ledger.reduce((s, r) => s + Number(r.amount_paid), 0)
  const balance       = totalBilled - totalPaid
  const pct           = totalBilled > 0 ? Math.min(100, Math.round((totalPaid / totalBilled) * 100)) : 0
  const outstanding   = ledger.filter(r => Number(r.amount_billed) - Number(r.amount_paid) > 0)
  const latestPlan    = planRequests[0] ?? null

  async function requestPlan(e: React.FormEvent) {
    e.preventDefault()
    if (!currentYear || !active) { toast.error('Missing data, please refresh'); return }
    setSubmitting(true)
    const res = await fetch('/api/fees/payment-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: active.students.id,
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
    setPlanRequests([{
      id: res.data?.id ?? 'new',
      status: 'pending',
      proposed_monthly: parseFloat(planForm.proposed_monthly),
      start_date: planForm.start_date,
      reason: planForm.reason,
      created_at: new Date().toISOString(),
      admin_note: null,
    }, ...planRequests])
    setPlanForm({ proposed_monthly: '', start_date: '', reason: '' })
  }

  if (loading) return (
    <div className="space-y-5">
      <div className="h-8 w-48 bg-slate-100 rounded-lg animate-pulse" />
      <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
      <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
    </div>
  )

  if (children.length === 0) return (
    <div className="py-20 text-center">
      <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
        <CreditCard className="h-6 w-6 text-slate-400" />
      </div>
      <p className="text-sm font-semibold text-slate-700">No children linked to your account</p>
      <p className="text-xs text-slate-400 mt-1">Contact the school administrator.</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader title="School Fees" description="View fee balances, payment history and request a payment plan." />

      {/* Child tabs */}
      {children.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {children.map((c, idx) => (
            <button key={c.student_id} onClick={() => setActiveIdx(idx)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
                activeIdx === idx ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${activeIdx === idx ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {c.students.first_name[0]}{c.students.last_name[0]}
              </div>
              {c.students.first_name} {c.students.last_name}
            </button>
          ))}
        </div>
      )}

      {active && (
        <>
          {/* Child identity pill */}
          <div className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-3">
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700 shrink-0">
              {active.students.first_name[0]}{active.students.last_name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800">{active.students.first_name} {active.students.last_name}</p>
              <p className="text-xs text-slate-400 font-mono">{active.students.reg_number} · {active.students.classes?.name ?? '—'}</p>
            </div>
            {detailLoading && <Loader2 className="h-4 w-4 animate-spin text-slate-300 shrink-0" />}
          </div>

          {/* Balance overview card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-slate-400 font-medium mb-0.5">Fee Balance</p>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-3xl font-bold ${balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      ${balance.toFixed(2)}
                    </p>
                    {balance > 0
                      ? <span className="text-sm text-red-400 font-medium">outstanding</span>
                      : <span className="flex items-center gap-1 text-sm text-emerald-500 font-medium"><CheckCircle2 className="h-4 w-4" /> fully paid</span>
                    }
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 mb-0.5">Paid</p>
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
          </div>

          {/* Outstanding charges */}
          {!detailLoading && outstanding.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-50">
                <div className="h-7 w-7 rounded-lg bg-red-50 flex items-center justify-center">
                  <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                </div>
                <p className="text-sm font-bold text-slate-800">Outstanding Charges</p>
                <span className="ml-auto text-xs font-semibold text-red-500">${balance.toFixed(2)} due</span>
              </div>
              <div className="divide-y divide-slate-50">
                {outstanding.map(row => {
                  const rowBal = Number(row.amount_billed) - Number(row.amount_paid)
                  const isOverdue = row.overdue || (row.due_date && row.due_date < new Date().toISOString().slice(0, 10))
                  return (
                    <div key={row.id} className="flex items-center gap-4 px-5 py-4">
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
                        {Number(row.amount_paid) > 0 && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            ${Number(row.amount_paid).toFixed(2)} paid of ${Number(row.amount_billed).toFixed(2)}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-base font-bold text-red-600">${rowBal.toFixed(2)}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${Number(row.amount_paid) > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>
                          {Number(row.amount_paid) > 0 ? 'Partial' : 'Unpaid'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Payment plan CTA */}
              <div className="px-5 py-4 bg-slate-50/60 border-t border-slate-50 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-700">Need help clearing the balance?</p>
                  <p className="text-xs text-slate-400 mt-0.5">Request a monthly payment plan — the bursar will review and respond.</p>
                </div>
                <Dialog open={planOpen} onOpenChange={setPlanOpen}>
                  <DialogTrigger render={
                    <Button size="sm" variant="outline" className="shrink-0"
                      disabled={latestPlan?.status === 'pending'}>
                      <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                      {latestPlan?.status === 'pending' ? 'Plan Requested' : 'Request Payment Plan'}
                    </Button>
                  } />
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request a Payment Plan</DialogTitle>
                    </DialogHeader>

                    {latestPlan?.status === 'pending' ? (
                      <div className="mt-3 space-y-4">
                        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
                          <Clock className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-amber-800">Request Pending Review</p>
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
                          <p className="text-xs text-emerald-600 mt-1">${latestPlan.proposed_monthly}/month starting {new Date(latestPlan.start_date).toLocaleDateString('en-ZW')}</p>
                          {latestPlan.admin_note && <p className="text-xs text-emerald-600 mt-1 italic">{latestPlan.admin_note}</p>}
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={requestPlan} className="space-y-4 mt-3">
                        <p className="text-sm text-slate-500">
                          Submit a request to pay the outstanding balance in monthly instalments. The school bursar will review and contact you.
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label>Monthly Amount (USD)</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                              <Input type="number" min={1} step="0.01" className="pl-6" placeholder="e.g. 150" required
                                value={planForm.proposed_monthly}
                                onChange={e => setPlanForm(f => ({ ...f, proposed_monthly: e.target.value }))} />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label>First Payment Date</Label>
                            <Input type="date" min={new Date().toISOString().slice(0, 10)} required
                              value={planForm.start_date}
                              onChange={e => setPlanForm(f => ({ ...f, start_date: e.target.value }))} />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label>Reason / Explanation</Label>
                          <textarea rows={3} required minLength={10}
                            placeholder="Briefly explain why you need a payment plan…"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                            value={planForm.reason}
                            onChange={e => setPlanForm(f => ({ ...f, reason: e.target.value }))} />
                        </div>
                        {planForm.proposed_monthly && balance > 0 && (
                          <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-700">
                            Remaining balance: <strong>${balance.toFixed(2)}</strong>. At ${planForm.proposed_monthly}/month this would take approximately{' '}
                            <strong>{Math.ceil(balance / parseFloat(planForm.proposed_monthly))} months</strong> to clear.
                          </div>
                        )}
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
            </div>
          )}

          {/* Fully paid banner */}
          {!detailLoading && balance === 0 && totalBilled > 0 && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">Fees Fully Paid</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  ${totalPaid.toFixed(2)} paid of ${totalBilled.toFixed(2)} billed — thank you!
                </p>
              </div>
            </div>
          )}

          {/* Payment history */}
          {!detailLoading && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-50">
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
                    <div key={p.id} className="flex items-center gap-4 px-5 py-3.5">
                      <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{METHOD_LABELS[p.method] ?? p.method}</p>
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
            </div>
          )}

          {/* Approved plan status */}
          {!detailLoading && latestPlan?.status === 'approved' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-emerald-800">Payment Plan Active</p>
                <p className="text-xs text-emerald-600 mt-1">${latestPlan.proposed_monthly}/month starting {new Date(latestPlan.start_date).toLocaleDateString('en-ZW')}</p>
                {latestPlan.admin_note && <p className="text-xs text-emerald-600 mt-1 italic">{latestPlan.admin_note}</p>}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Admin / Teacher view ─────────────────────────────────────────────────────

export default function FeesPage() {
  const { user } = useAuth()
  if (user?.role === 'parent') return <ParentFeesView />
  return <AdminFeesView />
}

function AdminFeesView() {
  const [rows, setRows] = useState<FeeRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/fees/summary')
      .then(r => r.json())
      .then(r => { setRows(r.data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const totalBilled    = rows.reduce((s, r) => s + r.billed, 0)
  const totalPaid      = rows.reduce((s, r) => s + r.paid, 0)
  const totalBalance   = totalBilled - totalPaid
  const collectionRate = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Management"
        description="Track student fee billing, payments and balances."
        action={
          <Link href="/dashboard/fees/payments" className={buttonVariants({ size: 'sm', variant: 'outline' })}>
            Payment History
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Billed"    value={`$${totalBilled.toLocaleString(undefined,{maximumFractionDigits:0})}`}  icon={DollarSign}   color="#3b82f6" subtitle="This academic year" />
        <StatCard title="Collected"       value={`$${totalPaid.toLocaleString(undefined,{maximumFractionDigits:0})}`}    icon={CreditCard}   color="#10b981" subtitle="Payments received" />
        <StatCard title="Outstanding"     value={`$${totalBalance.toLocaleString(undefined,{maximumFractionDigits:0})}`} icon={AlertCircle}  color={totalBalance > 0 ? '#ef4444' : '#10b981'} subtitle="Unpaid balance" />
        <StatCard title="Collection Rate" value={`${collectionRate}%`}                                                   icon={TrendingUp}
          color={collectionRate >= 80 ? '#10b981' : collectionRate >= 60 ? '#f59e0b' : '#ef4444'}
          subtitle="vs total billed" />
      </div>

      <FeesChartPanel rows={rows} totalBilled={totalBilled} totalPaid={totalPaid} collectionRate={collectionRate} />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Student Fee Summary</h3>
            <p className="text-xs text-slate-400 mt-0.5">{rows.length} students</p>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            {[
              { label: 'Paid',    dot: 'bg-emerald-500', count: rows.filter(r => r.balance <= 0).length },
              { label: 'Partial', dot: 'bg-amber-400',   count: rows.filter(r => r.balance > 0 && r.paid > 0).length },
              { label: 'Unpaid',  dot: 'bg-red-400',     count: rows.filter(r => r.paid === 0 && r.billed > 0).length },
            ].map(item => (
              <span key={item.label} className="hidden sm:flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${item.dot}`} />
                {item.count} {item.label}
              </span>
            ))}
          </div>
        </div>

        {loading && (
          <div className="py-16 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-slate-300" />
            <p className="text-sm text-slate-400">Loading fee records…</p>
          </div>
        )}

        {!loading && rows.length === 0 && (
          <div className="py-16 text-center">
            <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No fee records found</p>
          </div>
        )}

        {!loading && rows.length > 0 && (
          <div className="divide-y divide-slate-50">
            {rows.map((r, idx) => {
              const status = r.balance <= 0 ? 'paid' : r.paid > 0 ? 'partial' : 'unpaid'
              const st     = STATUS_STYLES[status]
              const pct    = r.billed > 0 ? Math.min(100, Math.round((r.paid / r.billed) * 100)) : 0
              const grad   = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length]
              return (
                <Link key={r.id} href={`/dashboard/fees/${r.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors group">
                  <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-[11px] font-bold text-white shrink-0`}>
                    {r.first_name[0]}{r.last_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                        {r.first_name} {r.last_name}
                      </p>
                      <span className={`hidden sm:inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full border shrink-0 ${st.pill}`}>
                        {st.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[11px] text-slate-400 font-mono">{r.reg_number}</p>
                      {r.classes?.name && <span className="text-[11px] text-slate-400">· {r.classes.name}</span>}
                    </div>
                  </div>
                  <div className="hidden sm:flex flex-col items-end gap-1.5 w-40 shrink-0">
                    <span className="text-xs text-slate-400 tabular-nums">
                      <span className="font-semibold text-slate-700">${r.paid.toLocaleString(undefined,{maximumFractionDigits:0})}</span>
                      {' '}/{' '}${r.billed.toLocaleString(undefined,{maximumFractionDigits:0})}
                    </span>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${st.bar} transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="text-right shrink-0 w-20">
                    <p className={`text-sm font-bold tabular-nums ${r.balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {r.balance > 0 ? `-$${r.balance.toFixed(0)}` : 'Clear'}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-400 shrink-0" />
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
