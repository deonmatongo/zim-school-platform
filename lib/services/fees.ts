import { createAdminClient } from '@/lib/supabase/admin'
import { computeBalance } from '@/lib/utils/fees'
import type { FeeBalance } from '@/lib/utils/fees'
import type { Student } from '@/types/api'

/**
 * Get fee balance for a single student in an academic year.
 */
export async function getStudentBalance(
  studentId: string,
  academicYearId: string
): Promise<FeeBalance> {
  const admin = createAdminClient()

  const { data: rows } = await admin
    .from('fee_ledger')
    .select('*')
    .eq('student_id', studentId)
    .eq('academic_year_id', academicYearId)

  return computeBalance(rows ?? [])
}

/**
 * Return all students with an outstanding balance (balance > 0) for a school + academic year.
 */
export async function getOverdueStudents(
  schoolId: string,
  academicYearId: string
): Promise<Array<Student & { balance: FeeBalance }>> {
  const admin = createAdminClient()

  const { data: ledger } = await admin
    .from('fee_ledger')
    .select('*, students(*)')
    .eq('school_id', schoolId)
    .eq('academic_year_id', academicYearId)

  if (!ledger?.length) return []

  // Group ledger rows by student
  const byStudent: Record<string, typeof ledger> = {}
  for (const row of ledger) {
    if (!byStudent[row.student_id]) byStudent[row.student_id] = []
    byStudent[row.student_id].push(row)
  }

  const results: Array<Student & { balance: FeeBalance }> = []

  for (const [, rows] of Object.entries(byStudent)) {
    const balance = computeBalance(rows)
    if (balance.balance > 0) {
      const student = (rows[0] as unknown as { students: Student }).students
      results.push({ ...student, balance })
    }
  }

  return results
}

/**
 * Generate a unique receipt number in the format SGC/YYYY/NNNN.
 * Uses the school's slug prefix (first 3 uppercase chars).
 */
export async function generateReceiptNumber(schoolId: string): Promise<string> {
  const admin = createAdminClient()

  const { data: school } = await admin
    .from('schools')
    .select('slug')
    .eq('id', schoolId)
    .single()

  const prefix = (school?.slug ?? 'SCH').slice(0, 3).toUpperCase()
  const year = new Date().getFullYear()

  // Count existing receipts this year for this school
  const { count } = await admin
    .from('payments')
    .select('id', { count: 'exact', head: true })
    .eq('school_id', schoolId)
    .gte('created_at', `${year}-01-01`)

  const sequence = String((count ?? 0) + 1).padStart(4, '0')
  return `${prefix}/${year}/${sequence}`
}

/**
 * Apply a payment to a ledger row — update amount_paid.
 */
export async function applyPaymentToLedger(
  ledgerId: string,
  amount: number
): Promise<void> {
  const admin = createAdminClient()

  const { data: ledger } = await admin
    .from('fee_ledger')
    .select('amount_paid')
    .eq('id', ledgerId)
    .single()

  if (!ledger) throw new Error(`Ledger row ${ledgerId} not found`)

  const newPaid = Number(ledger.amount_paid) + amount

  await admin
    .from('fee_ledger')
    .update({ amount_paid: newPaid })
    .eq('id', ledgerId)
}
