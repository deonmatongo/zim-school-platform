import type { FeeLedger } from '@/types/api'

export interface FeeBalance {
  billed: number
  paid: number
  balance: number
  currency: string
  overdue: boolean
}

/**
 * Compute running balance from a list of ledger rows for a single student.
 */
export function computeBalance(ledgerRows: FeeLedger[]): FeeBalance {
  const currency = ledgerRows[0]?.currency ?? 'USD'
  const billed = ledgerRows.reduce((s, r) => s + Number(r.amount_billed), 0)
  const paid = ledgerRows.reduce((s, r) => s + Number(r.amount_paid), 0)
  const balance = billed - paid
  const today = new Date().toISOString().slice(0, 10)
  const overdue = ledgerRows.some(r => r.due_date && r.due_date < today && (Number(r.amount_billed) - Number(r.amount_paid)) > 0)

  return { billed, paid, balance, currency, overdue }
}

/**
 * Format a monetary value with currency symbol.
 */
export function formatMoney(amount: number, currency: string): string {
  if (currency === 'USD') return `$${amount.toFixed(2)}`
  if (currency === 'ZIG') return `ZiG ${amount.toFixed(2)}`
  return `${currency} ${amount.toFixed(2)}`
}
