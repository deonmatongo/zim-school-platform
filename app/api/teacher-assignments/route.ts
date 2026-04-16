import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import { getRouteContext, parseBody, apiSuccess, apiError, requireRole } from '@/lib/api-helpers'
import { devMock } from '@/lib/dev/mock-handler'

const AssignSchema = z.object({
  teacher_id: z.string().uuid(),
  class_id: z.string().uuid(),
  subject_id: z.string().uuid(),
  academic_year_id: z.string().uuid(),
})

export async function GET(request: NextRequest) {
  const mock = devMock(request, 'teacher-assignments:GET')
  if (mock) return mock

  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)
  const roleCheck = requireRole(ctx.role, ['admin'])
  if (roleCheck) return roleCheck

  const { searchParams } = new URL(request.url)
  const classId = searchParams.get('class_id')
  const teacherId = searchParams.get('teacher_id')
  const academicYearId = searchParams.get('academic_year_id')

  const admin = createAdminClient()

  // Scope to school via class_id list
  const { data: schoolClasses } = await admin
    .from('classes')
    .select('id')
    .eq('school_id', ctx.schoolId)
  const schoolClassIds = (schoolClasses ?? []).map((c: any) => c.id)
  if (schoolClassIds.length === 0) return apiSuccess([])

  let query = admin
    .from('teacher_assignments')
    .select('id, teacher_id, class_id, subject_id, academic_year_id, user_profiles(id, first_name, last_name, email), classes(id, name), subjects(id, name, code), academic_years(id, year, term)')
    .in('class_id', schoolClassIds)

  if (classId) query = (query as any).eq('class_id', classId)
  if (teacherId) query = (query as any).eq('teacher_id', teacherId)
  if (academicYearId) query = (query as any).eq('academic_year_id', academicYearId)

  const { data, error } = await query
  if (error) return apiError(error.message)
  return apiSuccess(data)
}

export async function POST(request: NextRequest) {
  const mock = devMock(request, 'teacher-assignments:POST')
  if (mock) return mock

  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)
  const roleCheck = requireRole(ctx.role, ['admin'])
  if (roleCheck) return roleCheck

  const parsed = await parseBody(request, AssignSchema)
  if ('response' in parsed) return parsed.response

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('teacher_assignments')
    .insert(parsed.data)
    .select('id, teacher_id, class_id, subject_id, academic_year_id, user_profiles(id, first_name, last_name), classes(id, name), subjects(id, name, code)')
    .single()

  if (error) {
    if (error.code === '23505') return apiError('This teacher is already assigned to that subject in this class', 409)
    return apiError(error.message)
  }
  return apiSuccess(data, undefined, 201)
}
