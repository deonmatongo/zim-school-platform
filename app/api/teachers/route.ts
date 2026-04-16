import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRouteContext, apiSuccess, apiError, requireRole } from '@/lib/api-helpers'
import { devMock } from '@/lib/dev/mock-handler'

export async function GET(request: NextRequest) {
  const mock = devMock(request, 'teachers:GET'); if (mock) return mock
  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const roleCheck = requireRole(ctx.role, ['admin'])
  if (roleCheck) return roleCheck

  const admin = createAdminClient()

  const { data, error } = await admin
    .from('user_profiles')
    .select('*, teacher_assignments(class_id, subject_id, academic_year_id, classes(name), subjects(name, code))')
    .eq('school_id', ctx.schoolId)
    .eq('role', 'teacher')
    .eq('active', true)
    .order('last_name', { ascending: true })

  if (error) return apiError(error.message)
  return apiSuccess(data)
}
