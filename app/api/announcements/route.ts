import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AnnouncementCreateSchema, AnnouncementUpdateSchema } from '@/lib/validators/announcement'
import { getRouteContext, parseBody, apiSuccess, apiError, requireRole } from '@/lib/api-helpers'
import { devMock } from '@/lib/dev/mock-handler'

export async function GET(request: NextRequest) {
  const mock = devMock(request, 'announcements:GET'); if (mock) return mock
  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const { searchParams } = new URL(request.url)
  const pinned = searchParams.get('pinned') === 'true'
  const academicYearId = searchParams.get('academic_year_id')

  const admin = createAdminClient()
  const now = new Date().toISOString()

  let query = admin
    .from('announcements')
    .select('*, user_profiles(first_name, last_name)')
    .eq('school_id', ctx.schoolId)
    .eq('published', true)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (pinned) query = query.eq('pinned', true)
  if (academicYearId) query = query.eq('academic_year_id', academicYearId)

  // Role-based audience filtering
  type AudienceValue = 'all' | 'parents' | 'students' | 'teachers' | 'class' | 'grade'
  const audienceFilters: AudienceValue[] = ['all']
  if (ctx.role === 'parent') audienceFilters.push('parents')
  if (ctx.role === 'student') audienceFilters.push('students')
  if (ctx.role === 'teacher') audienceFilters.push('teachers')
  // Admins see everything
  if (ctx.role !== 'admin') {
    query = query.in('audience', audienceFilters)
  }

  const { data, error } = await query
  if (error) return apiError(error.message)
  return apiSuccess(data)
}

export async function POST(request: NextRequest) {
  const mock = devMock(request, 'announcements:POST'); if (mock) return mock
  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const roleCheck = requireRole(ctx.role, ['admin', 'teacher'])
  if (roleCheck) return roleCheck

  const parsed = await parseBody(request, AnnouncementCreateSchema)
  if ('response' in parsed) return parsed.response

  const admin = createAdminClient()

  const { data, error } = await admin
    .from('announcements')
    .insert({ ...parsed.data, school_id: ctx.schoolId, created_by: ctx.userId })
    .select()
    .single()

  if (error) return apiError(error.message)
  return apiSuccess(data, undefined, 201)
}
