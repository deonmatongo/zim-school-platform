import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import { getRouteContext, parseBody, apiSuccess, apiError, requireRole } from '@/lib/api-helpers'

const ClassCreateSchema = z.object({
  grade_id: z.string().uuid(),
  academic_year_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  homeroom_teacher_id: z.string().uuid().optional().nullable(),
  capacity: z.number().int().min(1).max(200).default(40),
})

export async function GET(request: NextRequest) {
  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const { searchParams } = new URL(request.url)
  const academicYearId = searchParams.get('academic_year_id')
  const gradeId = searchParams.get('grade_id')

  const admin = createAdminClient()

  let query = admin
    .from('classes')
    .select('*, grades(name, level), academic_years(year, term), user_profiles(first_name, last_name)')
    .eq('school_id', ctx.schoolId)
    .order('name', { ascending: true })

  if (academicYearId) query = query.eq('academic_year_id', academicYearId)
  if (gradeId) query = query.eq('grade_id', gradeId)

  const { data, error } = await query
  if (error) return apiError(error.message)
  return apiSuccess(data)
}

export async function POST(request: NextRequest) {
  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const roleCheck = requireRole(ctx.role, ['admin'])
  if (roleCheck) return roleCheck

  const parsed = await parseBody(request, ClassCreateSchema)
  if ('response' in parsed) return parsed.response

  const admin = createAdminClient()

  const { data, error } = await admin
    .from('classes')
    .insert({ ...parsed.data, school_id: ctx.schoolId })
    .select()
    .single()

  if (error) return apiError(error.message)
  return apiSuccess(data, undefined, 201)
}
