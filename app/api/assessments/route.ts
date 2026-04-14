import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AssessmentCreateSchema } from '@/lib/validators/marks'
import { getRouteContext, parseBody, apiSuccess, apiError, requireRole } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const { searchParams } = new URL(request.url)
  const classId = searchParams.get('class_id')
  const subjectId = searchParams.get('subject_id')
  const academicYearId = searchParams.get('academic_year_id')

  const admin = createAdminClient()

  let query = admin
    .from('assessments')
    .select('*, classes(name), subjects(name, code), academic_years(year, term)')
    .eq('school_id', ctx.schoolId)
    .order('date', { ascending: false })

  if (classId) query = query.eq('class_id', classId)
  if (subjectId) query = query.eq('subject_id', subjectId)
  if (academicYearId) query = query.eq('academic_year_id', academicYearId)

  const { data, error } = await query
  if (error) return apiError(error.message)
  return apiSuccess(data)
}

export async function POST(request: NextRequest) {
  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const roleCheck = requireRole(ctx.role, ['admin', 'teacher'])
  if (roleCheck) return roleCheck

  const parsed = await parseBody(request, AssessmentCreateSchema)
  if ('response' in parsed) return parsed.response

  const admin = createAdminClient()

  // Teachers must be assigned to this class + subject
  if (ctx.role === 'teacher') {
    const { data: assignment } = await admin
      .from('teacher_assignments')
      .select('id')
      .eq('teacher_id', ctx.userId)
      .eq('class_id', parsed.data.class_id)
      .eq('subject_id', parsed.data.subject_id)
      .eq('academic_year_id', parsed.data.academic_year_id)
      .single()

    if (!assignment) return apiError('You are not assigned to this class/subject', 403)
  }

  const { data, error } = await admin
    .from('assessments')
    .insert({ ...parsed.data, school_id: ctx.schoolId, created_by: ctx.userId })
    .select()
    .single()

  if (error) return apiError(error.message)
  return apiSuccess(data, undefined, 201)
}
