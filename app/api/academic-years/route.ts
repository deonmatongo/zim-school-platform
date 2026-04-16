import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRouteContext, apiSuccess, apiError, requireRole } from '@/lib/api-helpers'
import { devMock } from '@/lib/dev/mock-handler'

export async function GET(request: NextRequest) {
  const mock = devMock(request, 'academic-years:GET'); if (mock) return mock
  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const { searchParams } = new URL(request.url)
  const currentOnly = searchParams.get('current') === 'true'

  const admin = createAdminClient()
  let query = admin
    .from('academic_years')
    .select('*')
    .eq('school_id', ctx.schoolId)
    .order('year', { ascending: false })
    .order('term', { ascending: false })

  if (currentOnly) {
    query = query.eq('is_current', true)
  }

  const { data, error } = await query

  if (error) return apiError(error.message)
  return apiSuccess(data)
}

export async function POST(request: NextRequest) {
  const mock = devMock(request, 'academic-years:POST'); if (mock) return mock
  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const roleCheck = requireRole(ctx.role, ['admin'])
  if (roleCheck) return roleCheck

  const body = await request.json()
  const { year, term, start_date, end_date, is_current } = body

  if (!year || !term || !start_date || !end_date) {
    return apiError('year, term, start_date, end_date are required', 400)
  }

  const admin = createAdminClient()

  // If setting as current, unset others first
  if (is_current) {
    await admin
      .from('academic_years')
      .update({ is_current: false })
      .eq('school_id', ctx.schoolId)
  }

  const { data, error } = await admin
    .from('academic_years')
    .insert({ school_id: ctx.schoolId, year, term, start_date, end_date, is_current: !!is_current })
    .select()
    .single()

  if (error) return apiError(error.message)
  return apiSuccess(data, undefined, 201)
}
