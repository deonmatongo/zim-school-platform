import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { HomeworkCreateSchema } from '@/lib/validators/homework'
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
    .from('homework')
    .select('*, subjects(name, code), classes(name), user_profiles(first_name, last_name)')
    .eq('school_id', ctx.schoolId)
    .order('due_date', { ascending: false })

  if (classId) query = query.eq('class_id', classId)
  if (subjectId) query = query.eq('subject_id', subjectId)
  if (academicYearId) query = query.eq('academic_year_id', academicYearId)

  // Parents: filter to their children's classes
  if (ctx.role === 'parent') {
    const { data: links } = await admin
      .from('parent_student')
      .select('students(class_id)')
      .eq('parent_id', ctx.userId)
    const classIds = (links ?? [])
      .map(l => (l.students as unknown as { class_id: string | null } | null)?.class_id)
      .filter(Boolean) as string[]
    if (classIds.length === 0) return apiSuccess([])
    query = query.in('class_id', classIds)
  }

  // Students: filter to their own class
  if (ctx.role === 'student') {
    const { data: student } = await admin
      .from('students')
      .select('class_id')
      .eq('user_id', ctx.userId)
      .single()
    if (!student?.class_id) return apiSuccess([])
    query = query.eq('class_id', student.class_id)
  }

  const { data, error } = await query
  if (error) return apiError(error.message)
  return apiSuccess(data)
}

export async function POST(request: NextRequest) {
  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const roleCheck = requireRole(ctx.role, ['admin', 'teacher'])
  if (roleCheck) return roleCheck

  const parsed = await parseBody(request, HomeworkCreateSchema)
  if ('response' in parsed) return parsed.response

  const admin = createAdminClient()

  if (ctx.role === 'teacher') {
    const { data: assignment } = await admin
      .from('teacher_assignments')
      .select('id')
      .eq('teacher_id', ctx.userId)
      .eq('class_id', parsed.data.class_id)
      .eq('subject_id', parsed.data.subject_id)
      .single()
    if (!assignment) return apiError('You are not assigned to this class/subject', 403)
  }

  const { data, error } = await admin
    .from('homework')
    .insert({ ...parsed.data, school_id: ctx.schoolId, created_by: ctx.userId })
    .select()
    .single()

  if (error) return apiError(error.message)
  return apiSuccess(data, undefined, 201)
}
