import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { BulkMarksSchema, AssessmentCreateSchema } from '@/lib/validators/marks'
import { calculateGradeLetter } from '@/lib/utils/grades'
import { getRouteContext, parseBody, apiSuccess, apiError, requireRole } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get('student_id')
  const classId = searchParams.get('class_id')
  const assessmentId = searchParams.get('assessment_id')
  const academicYearId = searchParams.get('academic_year_id')

  const admin = createAdminClient()

  // Parents: only own children
  if (ctx.role === 'parent') {
    if (!studentId) return apiError('student_id required for parent role', 400)
    const { data: link } = await admin
      .from('parent_student')
      .select('id')
      .eq('parent_id', ctx.userId)
      .eq('student_id', studentId)
      .single()
    if (!link) return apiError('Forbidden', 403)
  }

  // Students: only own marks
  if (ctx.role === 'student') {
    const { data: profile } = await admin
      .from('students')
      .select('id')
      .eq('user_id', ctx.userId)
      .single()
    if (!profile) return apiError('Student profile not found', 404)
    if (studentId && studentId !== profile.id) return apiError('Forbidden', 403)
  }

  let query = admin
    .from('marks')
    .select('*, assessments(title, type, max_marks, date, subjects(name, code))')
    .eq('school_id', ctx.schoolId)

  if (studentId) query = query.eq('student_id', studentId)
  if (assessmentId) query = query.eq('assessment_id', assessmentId)

  if (classId) {
    // Get assessments for class
    const { data: assessments } = await admin
      .from('assessments')
      .select('id')
      .eq('class_id', classId)
    const ids = (assessments ?? []).map(a => a.id)
    if (ids.length === 0) return apiSuccess([])
    query = query.in('assessment_id', ids)
  }

  const { data, error } = await query.order('entered_at', { ascending: false })

  if (error) return apiError(error.message)
  return apiSuccess(data)
}

export async function POST(request: NextRequest) {
  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const roleCheck = requireRole(ctx.role, ['admin', 'teacher'])
  if (roleCheck) return roleCheck

  const parsed = await parseBody(request, BulkMarksSchema)
  if ('response' in parsed) return parsed.response

  const admin = createAdminClient()
  const { assessment_id, marks } = parsed.data

  // Fetch assessment to validate teacher assignment + get max_marks
  const { data: assessment } = await admin
    .from('assessments')
    .select('id, max_marks, class_id, subject_id, academic_year_id, school_id')
    .eq('id', assessment_id)
    .eq('school_id', ctx.schoolId)
    .single()

  if (!assessment) return apiError('Assessment not found', 404)

  // Teachers must be assigned to this class + subject
  if (ctx.role === 'teacher') {
    const { data: assignment } = await admin
      .from('teacher_assignments')
      .select('id')
      .eq('teacher_id', ctx.userId)
      .eq('class_id', assessment.class_id)
      .eq('subject_id', assessment.subject_id)
      .eq('academic_year_id', assessment.academic_year_id)
      .single()

    if (!assignment) return apiError('You are not assigned to this class/subject', 403)
  }

  // Validate scores don't exceed max_marks
  for (const mark of marks) {
    if (mark.raw_score !== null && mark.raw_score > assessment.max_marks) {
      return apiError(`Score ${mark.raw_score} exceeds max marks ${assessment.max_marks}`, 422)
    }
  }

  const upserts = marks.map(mark => ({
    assessment_id,
    student_id: mark.student_id,
    school_id: ctx.schoolId,
    raw_score: mark.raw_score,
    grade_letter: mark.raw_score !== null
      ? calculateGradeLetter(mark.raw_score, assessment.max_marks)
      : null,
    teacher_comment: mark.teacher_comment ?? null,
    entered_by: ctx.userId,
    entered_at: new Date().toISOString(),
  }))

  const { data, error } = await admin
    .from('marks')
    .upsert(upserts, { onConflict: 'assessment_id,student_id' })
    .select()

  if (error) return apiError(error.message)
  return apiSuccess(data, undefined, 201)
}
