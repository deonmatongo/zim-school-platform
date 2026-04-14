import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRouteContext, apiSuccess, apiError, requireRole } from '@/lib/api-helpers'
import { getStudentBalance } from '@/lib/services/fees'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const roleCheck = requireRole(ctx.role, ['admin', 'parent', 'teacher'])
  if (roleCheck) return roleCheck

  const studentId = params.id
  const { searchParams } = new URL(request.url)
  const academicYearId = searchParams.get('academic_year_id')

  const admin = createAdminClient()

  // Parents: verify relationship
  if (ctx.role === 'parent') {
    const { data: link } = await admin
      .from('parent_student')
      .select('id')
      .eq('parent_id', ctx.userId)
      .eq('student_id', studentId)
      .single()
    if (!link) return apiError('Forbidden', 403)
  }

  // Fetch student
  const { data: student } = await admin
    .from('students')
    .select('*, classes(name, grades(name))')
    .eq('id', studentId)
    .eq('school_id', ctx.schoolId)
    .single()

  if (!student) return apiError('Student not found', 404)

  // Resolve academic year
  let yearId = academicYearId
  if (!yearId) {
    const { data: currentYear } = await admin
      .from('academic_years')
      .select('id')
      .eq('school_id', ctx.schoolId)
      .eq('is_current', true)
      .single()
    yearId = currentYear?.id ?? null
  }

  if (!yearId) return apiError('No academic year found', 404)

  // Fetch marks
  const { data: marks } = await admin
    .from('marks')
    .select('*, assessments(title, type, max_marks, date, subject_id, subjects(name, code))')
    .eq('student_id', studentId)
    .eq('school_id', ctx.schoolId)

  // Fetch attendance
  const { data: attendanceRows } = await admin
    .from('attendance')
    .select('status, date, reason')
    .eq('student_id', studentId)
    .eq('school_id', ctx.schoolId)

  const attendanceCounts = (attendanceRows ?? []).reduce(
    (acc, row) => { acc[row.status] = (acc[row.status] ?? 0) + 1; return acc },
    {} as Record<string, number>
  )
  const totalDays = Object.values(attendanceCounts).reduce((s, v) => s + v, 0)
  const presentDays = (attendanceCounts['present'] ?? 0) + (attendanceCounts['late'] ?? 0)

  // Fees
  const feeBalance = await getStudentBalance(studentId, yearId)

  // Report card
  const { data: reportCard } = await admin
    .from('report_cards')
    .select('*')
    .eq('student_id', studentId)
    .eq('academic_year_id', yearId)
    .single()

  return apiSuccess({
    student,
    marks: marks ?? [],
    attendance: {
      ...attendanceCounts,
      total: totalDays,
      percentage: totalDays > 0 ? Math.round((presentDays / totalDays) * 100 * 10) / 10 : 0,
    },
    fees: feeBalance,
    reportCard: reportCard ?? null,
  })
}
