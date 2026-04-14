import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { SchoolCreateSchema, SchoolUpdateSchema } from '@/lib/validators/school'
import { getRouteContext, parseBody, apiSuccess, apiError, requireRole } from '@/lib/api-helpers'

// GET all schools — superadmin only (no school_id filter)
export async function GET(request: NextRequest) {
  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const roleCheck = requireRole(ctx.role, ['admin'])
  if (roleCheck) return roleCheck

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('schools')
    .select('*')
    .order('name', { ascending: true })

  if (error) return apiError(error.message)
  return apiSuccess(data)
}

export async function POST(request: NextRequest) {
  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const roleCheck = requireRole(ctx.role, ['admin'])
  if (roleCheck) return roleCheck

  const parsed = await parseBody(request, SchoolCreateSchema)
  if ('response' in parsed) return parsed.response

  const admin = createAdminClient()

  const { data, error } = await admin
    .from('schools')
    .insert(parsed.data)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return apiError('School slug already taken', 409)
    return apiError(error.message)
  }

  return apiSuccess(data, undefined, 201)
}
