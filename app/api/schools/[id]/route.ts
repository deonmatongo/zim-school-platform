import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { SchoolUpdateSchema } from '@/lib/validators/school'
import { getRouteContext, parseBody, apiSuccess, apiError, requireRole } from '@/lib/api-helpers'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  // Allow any authenticated user of that school
  if (ctx.schoolId !== params.id) return apiError('Forbidden', 403)

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('schools')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) return apiError(error.message)
  return apiSuccess(data)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const roleCheck = requireRole(ctx.role, ['admin'])
  if (roleCheck) return roleCheck

  if (ctx.schoolId !== params.id) return apiError('Forbidden', 403)

  const parsed = await parseBody(request, SchoolUpdateSchema)
  if ('response' in parsed) return parsed.response

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('schools')
    .update(parsed.data)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return apiError(error.message)
  return apiSuccess(data)
}
