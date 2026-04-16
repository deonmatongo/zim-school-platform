import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { StudentUpdateSchema } from '@/lib/validators/student'
import { getRouteContext, parseBody, apiSuccess, apiError, requireRole } from '@/lib/api-helpers'
import { devMock } from '@/lib/dev/mock-handler'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const mock = devMock(request, 'students/[id]:GET', params); if (mock) return mock
  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const admin = createAdminClient()

  // Parents: verify relationship
  if (ctx.role === 'parent') {
    const { data: link } = await admin
      .from('parent_student')
      .select('id')
      .eq('parent_id', ctx.userId)
      .eq('student_id', params.id)
      .single()
    if (!link) return apiError('Forbidden', 403)
  }

  const { data, error } = await admin
    .from('students')
    .select('*, classes(name, grades(name))')
    .eq('id', params.id)
    .eq('school_id', ctx.schoolId)
    .single()

  if (error) return apiError(error.code === 'PGRST116' ? 'Student not found' : error.message, error.code === 'PGRST116' ? 404 : 500)
  return apiSuccess(data)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const mock = devMock(request, 'students/[id]:PUT', params); if (mock) return mock
  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const roleCheck = requireRole(ctx.role, ['admin'])
  if (roleCheck) return roleCheck

  const parsed = await parseBody(request, StudentUpdateSchema)
  if ('response' in parsed) return parsed.response

  const admin = createAdminClient()

  const { data, error } = await admin
    .from('students')
    .update(parsed.data)
    .eq('id', params.id)
    .eq('school_id', ctx.schoolId)
    .select()
    .single()

  if (error) return apiError(error.message)
  return apiSuccess(data)
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const mock = devMock(request, 'students/[id]:DELETE', params); if (mock) return mock
  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const roleCheck = requireRole(ctx.role, ['admin'])
  if (roleCheck) return roleCheck

  const admin = createAdminClient()

  // Soft-delete
  const { data, error } = await admin
    .from('students')
    .update({ active: false })
    .eq('id', params.id)
    .eq('school_id', ctx.schoolId)
    .select()
    .single()

  if (error) return apiError(error.message)
  return apiSuccess(data)
}
