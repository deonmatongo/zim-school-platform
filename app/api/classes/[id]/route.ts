import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRouteContext, apiSuccess, apiError } from '@/lib/api-helpers'
import { devMock } from '@/lib/dev/mock-handler'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const mock = devMock(request, 'classes/[id]:GET', { id: params.id })
  if (mock) return mock

  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const admin = createAdminClient()

  const [{ data: cls }, { data: classStudents }, { data: assignments }, { data: classAssessments }] = await Promise.all([
    admin
      .from('classes')
      .select('*, grades(name, level), academic_years(year, term), user_profiles!homeroom_teacher_id(first_name, last_name)')
      .eq('id', params.id)
      .eq('school_id', ctx.schoolId)
      .single(),
    admin
      .from('students')
      .select('id, first_name, last_name, reg_number, gender, boarding, active, fee_status, attendance_pct')
      .eq('class_id', params.id)
      .eq('school_id', ctx.schoolId)
      .order('last_name'),
    admin
      .from('teacher_assignments')
      .select('*, subjects(name, code), user_profiles(first_name, last_name)')
      .eq('class_id', params.id),
    admin
      .from('assessments')
      .select('*, subjects(name, code)')
      .eq('class_id', params.id)
      .eq('school_id', ctx.schoolId)
      .order('date', { ascending: false }),
  ])

  if (!cls) return apiError('Class not found', 404)

  const aIds = (classAssessments ?? []).map((a: any) => a.id)
  let classMarks: any[] = []
  if (aIds.length) {
    const { data: m } = await admin
      .from('marks')
      .select('assessment_id, raw_score, assessments(max_marks)')
      .in('assessment_id', aIds)
    classMarks = m ?? []
  }

  return apiSuccess({
    class: cls,
    students: classStudents ?? [],
    assignments: assignments ?? [],
    assessments: classAssessments ?? [],
    marks: classMarks,
  })
}
