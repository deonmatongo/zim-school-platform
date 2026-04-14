import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRouteContext, apiSuccess, apiError, requireRole } from '@/lib/api-helpers'
import { computeBalance } from '@/lib/utils/fees'

export async function GET(request: NextRequest) {
  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const roleCheck = requireRole(ctx.role, ['admin'])
  if (roleCheck) return roleCheck

  const { searchParams } = new URL(request.url)
  const classId = searchParams.get('class_id')
  const academicYearId = searchParams.get('academic_year_id')

  if (!academicYearId) return apiError('academic_year_id is required', 400)

  const admin = createAdminClient()

  // Get students
  let studentsQuery = admin
    .from('students')
    .select('id, first_name, last_name, reg_number, class_id')
    .eq('school_id', ctx.schoolId)
    .eq('active', true)

  if (classId) studentsQuery = studentsQuery.eq('class_id', classId)

  const { data: students, error: studentErr } = await studentsQuery
  if (studentErr) return apiError(studentErr.message)
  if (!students?.length) return apiSuccess([])

  const studentIds = students.map(s => s.id)

  const { data: ledgerRows, error: ledgerErr } = await admin
    .from('fee_ledger')
    .select('*')
    .in('student_id', studentIds)
    .eq('school_id', ctx.schoolId)
    .eq('academic_year_id', academicYearId)

  if (ledgerErr) return apiError(ledgerErr.message)

  // Group ledger by student
  const byStudent: Record<string, typeof ledgerRows> = {}
  for (const row of ledgerRows ?? []) {
    if (!byStudent[row.student_id]) byStudent[row.student_id] = []
    byStudent[row.student_id].push(row)
  }

  const summary = students.map(student => {
    const rows = byStudent[student.id] ?? []
    const balance = computeBalance(rows)
    return {
      student: { id: student.id, first_name: student.first_name, last_name: student.last_name, reg_number: student.reg_number, class_id: student.class_id },
      billed: balance.billed,
      paid: balance.paid,
      balance: balance.balance,
      overdue: balance.overdue,
      currency: balance.currency,
    }
  })

  const totalBilled = summary.reduce((s, r) => s + r.billed, 0)
  const totalPaid = summary.reduce((s, r) => s + r.paid, 0)
  const overdueCount = summary.filter(r => r.overdue).length

  return apiSuccess(summary, {
    totalBilled,
    totalPaid,
    totalBalance: totalBilled - totalPaid,
    overdueCount,
    currency: ledgerRows?.[0]?.currency ?? 'USD',
  })
}
