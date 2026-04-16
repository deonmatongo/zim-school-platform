import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import { getRouteContext, parseBody, apiSuccess, apiError } from '@/lib/api-helpers'
import { devMock } from '@/lib/dev/mock-handler'

const PlanRequestSchema = z.object({
  student_id: z.string().uuid(),
  academic_year_id: z.string().uuid(),
  proposed_monthly: z.number().positive(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().min(10).max(1000),
})

export async function GET(request: NextRequest) {
  const mock = devMock(request, 'fees/payment-plan:GET')
  if (mock) return mock

  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get('student_id')

  const admin = createAdminClient()
  let query = admin
    .from('payment_plan_requests')
    .select('*')
    .eq('school_id', ctx.schoolId)
    .order('created_at', { ascending: false })

  if (studentId) query = (query as any).eq('student_id', studentId)

  const { data, error } = await query
  if (error) return apiError(error.message)
  return apiSuccess(data)
}

export async function POST(request: NextRequest) {
  const mock = devMock(request, 'fees/payment-plan:POST')
  if (mock) return mock

  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const parsed = await parseBody(request, PlanRequestSchema)
  if ('response' in parsed) return parsed.response

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('payment_plan_requests')
    .insert({ ...parsed.data, school_id: ctx.schoolId, parent_id: ctx.userId, status: 'pending' })
    .select()
    .single()

  if (error) return apiError(error.message)
  return apiSuccess(data, undefined, 201)
}
