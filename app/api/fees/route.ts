import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { FeeLedgerCreateSchema } from '@/lib/validators/fees'
import { getRouteContext, parseBody, apiSuccess, apiError, requireRole } from '@/lib/api-helpers'
import { computeBalance } from '@/lib/utils/fees'
import { devMock } from '@/lib/dev/mock-handler'

export async function GET(request: NextRequest) {
  const mock = devMock(request, 'fees:GET'); if (mock) return mock
  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get('student_id')
  const academicYearId = searchParams.get('academic_year_id')

  if (!studentId) return apiError('student_id is required', 400)

  const admin = createAdminClient()

  // Parents: only their children
  if (ctx.role === 'parent') {
    const { data: link } = await admin
      .from('parent_student')
      .select('id')
      .eq('parent_id', ctx.userId)
      .eq('student_id', studentId)
      .single()
    if (!link) return apiError('Forbidden', 403)
  }

  let query = admin
    .from('fee_ledger')
    .select('*')
    .eq('school_id', ctx.schoolId)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })

  if (academicYearId) query = query.eq('academic_year_id', academicYearId)

  const { data: rows, error } = await query
  if (error) return apiError(error.message)

  const balance = computeBalance(rows ?? [])

  return apiSuccess({ ledger: rows, balance })
}

export async function POST(request: NextRequest) {
  const mock = devMock(request, 'fees:POST'); if (mock) return mock
  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const roleCheck = requireRole(ctx.role, ['admin'])
  if (roleCheck) return roleCheck

  const parsed = await parseBody(request, FeeLedgerCreateSchema)
  if ('response' in parsed) return parsed.response

  const admin = createAdminClient()

  const { data, error } = await admin
    .from('fee_ledger')
    .insert({ ...parsed.data, school_id: ctx.schoolId })
    .select()
    .single()

  if (error) return apiError(error.message)
  return apiSuccess(data, undefined, 201)
}
