import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRouteContext, apiSuccess, apiError } from '@/lib/api-helpers'
import { devMock } from '@/lib/dev/mock-handler'

export async function GET(request: NextRequest) {
  const mock = devMock(request, 'parent/children:GET')
  if (mock) return mock

  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const admin = createAdminClient()

  const { data: links, error } = await admin
    .from('parent_student')
    .select('*, students(id, first_name, last_name, reg_number, class_id, attendance_pct, fee_status, classes(name, grades(name)))')
    .eq('parent_id', ctx.userId)

  if (error) return apiError(error.message)

  // Enrich with fee balance and average marks
  const enriched = await Promise.all((links ?? []).map(async (link: any) => {
    const child = link.students
    if (!child) return link

    const [{ data: fees }, { data: childMarks }] = await Promise.all([
      admin.from('fee_ledger').select('amount_billed, amount_paid').eq('student_id', child.id),
      admin.from('marks').select('raw_score, assessments(max_marks)').eq('student_id', child.id),
    ])

    const totalBilled = (fees ?? []).reduce((s: number, f: any) => s + Number(f.amount_billed), 0)
    const totalPaid = (fees ?? []).reduce((s: number, f: any) => s + Number(f.amount_paid), 0)
    const avgPct = (childMarks ?? []).length
      ? Math.round((childMarks ?? []).reduce((s: number, m: any) => s + (m.raw_score / m.assessments.max_marks) * 100, 0) / (childMarks ?? []).length)
      : null

    return {
      ...link,
      fee_balance: totalBilled - totalPaid,
      fee_billed: totalBilled,
      fee_paid: totalPaid,
      avg_mark_pct: avgPct,
    }
  }))

  return apiSuccess(enriched)
}
