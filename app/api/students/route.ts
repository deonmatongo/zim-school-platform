import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { StudentCreateSchema } from '@/lib/validators/student'
import { getRouteContext, parseBody, apiSuccess, apiError, requireRole } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const admin = createAdminClient()
  const { searchParams } = new URL(request.url)
  const classId = searchParams.get('class_id')
  const page = Number(searchParams.get('page') ?? 1)
  const pageSize = Math.min(Number(searchParams.get('page_size') ?? 50), 200)
  const from = (page - 1) * pageSize

  let query = admin
    .from('students')
    .select('*, classes(name)', { count: 'exact' })
    .eq('school_id', ctx.schoolId)
    .eq('active', true)
    .order('last_name', { ascending: true })
    .range(from, from + pageSize - 1)

  if (classId) query = query.eq('class_id', classId)

  // Parents can only see their own children
  if (ctx.role === 'parent') {
    const { data: links } = await admin
      .from('parent_student')
      .select('student_id')
      .eq('parent_id', ctx.userId)
    const childIds = (links ?? []).map(l => l.student_id)
    if (childIds.length === 0) return apiSuccess([], { total: 0 })
    query = query.in('id', childIds)
  }

  // Teachers can only see students in their assigned classes
  if (ctx.role === 'teacher') {
    const { data: assignments } = await admin
      .from('teacher_assignments')
      .select('class_id')
      .eq('teacher_id', ctx.userId)
    const classIds = Array.from(new Set((assignments ?? []).map(a => a.class_id)))
    if (classIds.length === 0) return apiSuccess([], { total: 0 })
    query = query.in('class_id', classIds)
  }

  const { data, error, count } = await query

  if (error) return apiError(error.message)
  return apiSuccess(data, { total: count ?? 0, page, pageSize })
}

export async function POST(request: NextRequest) {
  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const roleCheck = requireRole(ctx.role, ['admin'])
  if (roleCheck) return roleCheck

  const parsed = await parseBody(request, StudentCreateSchema)
  if ('response' in parsed) return parsed.response

  const admin = createAdminClient()

  const { data, error } = await admin
    .from('students')
    .insert({ ...parsed.data, school_id: ctx.schoolId })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return apiError('Registration number already exists for this school', 409)
    return apiError(error.message)
  }

  return apiSuccess(data, undefined, 201)
}
