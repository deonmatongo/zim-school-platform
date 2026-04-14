import { createAdminClient } from '@/lib/supabase/admin'
import { calculateGradeLetter } from '@/lib/utils/grades'

/**
 * Calculate and store grade letters for all marks in an assessment.
 */
export async function recalculateAssessmentGrades(assessmentId: string): Promise<void> {
  const admin = createAdminClient()

  const { data: assessment } = await admin
    .from('assessments')
    .select('max_marks')
    .eq('id', assessmentId)
    .single()

  if (!assessment) return

  const { data: marks } = await admin
    .from('marks')
    .select('id, raw_score')
    .eq('assessment_id', assessmentId)

  if (!marks?.length) return

  const updates = marks
    .filter(m => m.raw_score !== null)
    .map(m => ({
      id: m.id,
      grade_letter: calculateGradeLetter(m.raw_score!, assessment.max_marks),
    }))

  for (const update of updates) {
    await admin.from('marks').update({ grade_letter: update.grade_letter }).eq('id', update.id)
  }
}

/**
 * Calculate each student's position in their class for a given academic year.
 * Returns array of { student_id, position, average }.
 */
export async function calculateClassPositions(
  classId: string,
  academicYearId: string
): Promise<Array<{ student_id: string; position: number; average: number }>> {
  const admin = createAdminClient()

  // Get all assessments for this class + year
  const { data: assessments } = await admin
    .from('assessments')
    .select('id, max_marks')
    .eq('class_id', classId)
    .eq('academic_year_id', academicYearId)

  if (!assessments?.length) return []

  const assessmentIds = assessments.map(a => a.id)
  const maxByAssessment = Object.fromEntries(assessments.map(a => [a.id, a.max_marks]))

  // Get all marks
  const { data: marks } = await admin
    .from('marks')
    .select('student_id, assessment_id, raw_score')
    .in('assessment_id', assessmentIds)

  if (!marks?.length) return []

  // Compute per-student average percentage
  const studentMap: Record<string, { totalPct: number; count: number }> = {}

  for (const mark of marks) {
    if (mark.raw_score === null) continue
    const maxMark = maxByAssessment[mark.assessment_id]
    const pct = (mark.raw_score / maxMark) * 100
    if (!studentMap[mark.student_id]) {
      studentMap[mark.student_id] = { totalPct: 0, count: 0 }
    }
    studentMap[mark.student_id].totalPct += pct
    studentMap[mark.student_id].count++
  }

  const ranked = Object.entries(studentMap)
    .map(([student_id, { totalPct, count }]) => ({
      student_id,
      average: Math.round((totalPct / count) * 100) / 100,
    }))
    .sort((a, b) => b.average - a.average)
    .map((entry, i) => ({ ...entry, position: i + 1 }))

  return ranked
}

/**
 * Compute a student's term average across all assessments in an academic year.
 */
export async function calculateTermAverage(
  studentId: string,
  academicYearId: string
): Promise<number> {
  const admin = createAdminClient()

  const { data: marks } = await admin
    .from('marks')
    .select('raw_score, assessment_id, assessments(max_marks)')
    .eq('student_id', studentId)

  if (!marks?.length) return 0

  let totalPct = 0
  let count = 0

  for (const mark of marks) {
    if (mark.raw_score === null) continue
    const assessment = mark.assessments as unknown as { max_marks: number } | null
    if (!assessment) continue
    totalPct += (mark.raw_score / assessment.max_marks) * 100
    count++
  }

  return count === 0 ? 0 : Math.round((totalPct / count) * 100) / 100
}
