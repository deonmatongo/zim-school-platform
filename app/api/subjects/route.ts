import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import { getRouteContext, parseBody, apiSuccess, apiError, requireRole } from '@/lib/api-helpers'
import { devMock } from '@/lib/dev/mock-handler'

const SubjectCreateSchema = z.object({
  name: z.string().min(1).max(150),
  code: z.string().min(1).max(10).toUpperCase(),
  zimsec_code: z.string().max(20).optional().nullable(),
})

export async function GET(request: NextRequest) {
  const mock = devMock(request, 'subjects:GET'); if (mock) return mock
  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const admin = createAdminClient()

  const { data, error } = await admin
    .from('subjects')
    .select('*')
    .eq('school_id', ctx.schoolId)
    .order('name', { ascending: true })

  if (error) return apiError(error.message)
  return apiSuccess(data)
}

export async function POST(request: NextRequest) {
  const mock = devMock(request, 'subjects:POST'); if (mock) return mock
  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const roleCheck = requireRole(ctx.role, ['admin'])
  if (roleCheck) return roleCheck

  const parsed = await parseBody(request, SubjectCreateSchema)
  if ('response' in parsed) return parsed.response

  const admin = createAdminClient()

  const { data, error } = await admin
    .from('subjects')
    .insert({ ...parsed.data, school_id: ctx.schoolId })
    .select()
    .single()

  if (error) return apiError(error.message)
  return apiSuccess(data, undefined, 201)
}
