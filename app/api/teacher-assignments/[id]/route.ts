import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRouteContext, apiSuccess, apiError, requireRole } from '@/lib/api-helpers'
import { devMock } from '@/lib/dev/mock-handler'

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const mock = devMock(request, 'teacher-assignments/[id]:DELETE', { id: params.id })
  if (mock) return mock

  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)
  const roleCheck = requireRole(ctx.role, ['admin'])
  if (roleCheck) return roleCheck

  const admin = createAdminClient()
  const { error } = await admin
    .from('teacher_assignments')
    .delete()
    .eq('id', params.id)

  if (error) return apiError(error.message)
  return apiSuccess({ deleted: true })
}
