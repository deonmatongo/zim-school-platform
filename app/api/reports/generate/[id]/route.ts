import { NextRequest } from 'next/server'
import { getRouteContext, apiSuccess, apiError, requireRole } from '@/lib/api-helpers'
import { generateReportCard } from '@/lib/services/reportCards'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const roleCheck = requireRole(ctx.role, ['admin'])
  if (roleCheck) return roleCheck

  const studentId = params.id
  const { searchParams } = new URL(request.url)
  let academicYearId = searchParams.get('academic_year_id')

  if (!academicYearId) {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const admin = createAdminClient()
    const { data: currentYear } = await admin
      .from('academic_years')
      .select('id')
      .eq('school_id', ctx.schoolId)
      .eq('is_current', true)
      .single()
    academicYearId = currentYear?.id ?? null
  }

  if (!academicYearId) return apiError('No current academic year found', 404)

  try {
    const reportCard = await generateReportCard(studentId, academicYearId)
    return apiSuccess(reportCard, undefined, 201)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Report generation failed'
    return apiError(msg)
  }
}
