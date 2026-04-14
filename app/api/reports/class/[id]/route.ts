import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRouteContext, apiSuccess, apiError, requireRole } from '@/lib/api-helpers'
import { computeBalance } from '@/lib/utils/fees'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const roleCheck = requireRole(ctx.role, ['admin', 'teacher'])
  if (roleCheck) return roleCheck

  const classId = params.id
  const { searchParams } = new URL(request.url)
  const academicYearId = searchParams.get('academic_year_id')

  const admin = createAdminClient()

  // Fetch class
  const { data: classData } = await admin
    .from('classes')
    .select('*, grades(name)')
    .eq('id', classId)
    .eq('school_id', ctx.schoolId)
    .single()

  if (!classData) return apiError('Class not found', 404)

  // Fetch students
  const { data: students } = await admin
    .from('students')
    .select('id')
    .eq('class_id', classId)
    .eq('active', true)

  const studentIds = (students ?? []).map(s => s.id)
  const studentCount = studentIds.length

  if (studentCount === 0) {
    return apiSuccess({
      class: classData,
      studentCount: 0,
      averageScore: 0,
      subjectAverages: [],
      attendanceRate: 0,
      feeCollectionRate: 0,
    })
  }

  // Fetch assessments for this class
  let assessmentQuery = admin
    .from('assessments')
    .select('id, max_marks, subject_id, subjects(name, code)')
    .eq('class_id', classId)

  if (academicYearId) assessmentQuery = assessmentQuery.eq('academic_year_id', academicYearId)

  const { data: assessments } = await assessmentQuery

  // Fetch marks
  const assessmentIds = (assessments ?? []).map(a => a.id)
  let allMarks: Array<{ student_id: string; raw_score: number | null; assessment_id: string }> = []

  if (assessmentIds.length > 0) {
    const { data: marks } = await admin
      .from('marks')
      .select('student_id, raw_score, assessment_id')
      .in('assessment_id', assessmentIds)
      .in('student_id', studentIds)
    allMarks = marks ?? []
  }

  // Subject averages
  const subjectMap: Record<string, { name: string; code: string; scores: number[]; maxMarks: number }> = {}
  const maxByAssessment: Record<string, number> = {}
  const subjectByAssessment: Record<string, string> = {}
  const subjectMeta: Record<string, { name: string; code: string }> = {}

  for (const a of assessments ?? []) {
    maxByAssessment[a.id] = a.max_marks
    subjectByAssessment[a.id] = a.subject_id
    const subject = a.subjects as unknown as { name: string; code: string } | null
    if (subject) subjectMeta[a.subject_id] = subject
    if (!subjectMap[a.subject_id]) {
      subjectMap[a.subject_id] = { name: subject?.name ?? '', code: subject?.code ?? '', scores: [], maxMarks: a.max_marks }
    }
  }

  for (const mark of allMarks) {
    if (mark.raw_score === null) continue
    const subjectId = subjectByAssessment[mark.assessment_id]
    const maxMark = maxByAssessment[mark.assessment_id]
    if (!subjectMap[subjectId]) continue
    subjectMap[subjectId].scores.push((mark.raw_score / maxMark) * 100)
  }

  const subjectAverages = Object.entries(subjectMap).map(([subjectId, { name, code, scores }]) => ({
    subject: { id: subjectId, name, code },
    average: scores.length ? Math.round((scores.reduce((s, v) => s + v, 0) / scores.length) * 10) / 10 : 0,
    highest: scores.length ? Math.round(Math.max(...scores) * 10) / 10 : 0,
    lowest: scores.length ? Math.round(Math.min(...scores) * 10) / 10 : 0,
  }))

  const allScores = allMarks
    .filter(m => m.raw_score !== null)
    .map(m => (m.raw_score! / maxByAssessment[m.assessment_id]) * 100)

  const averageScore = allScores.length
    ? Math.round((allScores.reduce((s, v) => s + v, 0) / allScores.length) * 10) / 10
    : 0

  // Attendance rate
  const { data: attendanceRows } = await admin
    .from('attendance')
    .select('status')
    .in('student_id', studentIds)
    .eq('class_id', classId)

  const totalAttendance = attendanceRows?.length ?? 0
  const presentCount = (attendanceRows ?? []).filter(r => ['present', 'late'].includes(r.status)).length
  const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100 * 10) / 10 : 0

  // Fee collection rate
  const { data: ledger } = await admin
    .from('fee_ledger')
    .select('amount_billed, amount_paid')
    .in('student_id', studentIds)
    .eq('school_id', ctx.schoolId)

  const totalBilled = (ledger ?? []).reduce((s, r) => s + Number(r.amount_billed), 0)
  const totalPaid = (ledger ?? []).reduce((s, r) => s + Number(r.amount_paid), 0)
  const feeCollectionRate = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100 * 10) / 10 : 0

  return apiSuccess({
    class: classData,
    studentCount,
    averageScore,
    subjectAverages,
    attendanceRate,
    feeCollectionRate,
    meta: { totalBilled, totalPaid },
  })
}
