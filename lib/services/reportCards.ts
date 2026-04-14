import { createAdminClient } from '@/lib/supabase/admin'
import { generateReportCardPdf } from '@/lib/utils/pdf'
import { calculateClassPositions, calculateTermAverage } from './grades'
import { getStudentBalance } from './fees'
import type { ReportCard } from '@/types/api'

const admin = createAdminClient()

/**
 * Generate a full report card for a student, persist it to DB, and return the record.
 */
export async function generateReportCard(
  studentId: string,
  academicYearId: string
): Promise<ReportCard> {
  // Fetch student
  const { data: student, error: studentErr } = await admin
    .from('students')
    .select('*, classes(name, school_id)')
    .eq('id', studentId)
    .single()

  if (studentErr || !student) throw new Error(`Student ${studentId} not found`)

  const classData = student.classes as unknown as { name: string; school_id: string } | null
  const schoolId = classData?.school_id ?? student.school_id
  const className = classData?.name ?? ''

  // Fetch school + academic year
  const [{ data: school }, { data: academicYear }] = await Promise.all([
    admin.from('schools').select('*').eq('id', schoolId).single(),
    admin.from('academic_years').select('*').eq('id', academicYearId).single(),
  ])

  if (!school || !academicYear) throw new Error('School or academic year not found')

  // Fetch assessments + marks
  const { data: marks } = await admin
    .from('marks')
    .select('*, assessments(title, max_marks, subject_id, subjects(name))')
    .eq('student_id', studentId)
    .not('raw_score', 'is', null)

  const markRows = (marks ?? []).map(m => {
    const assessment = m.assessments as unknown as {
      title: string
      max_marks: number
      subjects: { name: string } | null
    } | null
    return {
      subject: assessment?.subjects?.name ?? 'Unknown',
      score: m.raw_score ?? 0,
      maxScore: assessment?.max_marks ?? 100,
      gradeLetter: m.grade_letter ?? '-',
      comment: m.teacher_comment ?? '',
    }
  })

  // Attendance stats
  const { data: attendanceRows } = await admin
    .from('attendance')
    .select('status')
    .eq('student_id', studentId)

  const attendanceCounts = (attendanceRows ?? []).reduce(
    (acc, row) => {
      acc[row.status] = (acc[row.status] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const totalDays = Object.values(attendanceCounts).reduce((s, v) => s + v, 0)
  const presentDays = (attendanceCounts['present'] ?? 0) + (attendanceCounts['late'] ?? 0)
  const attendancePercent = totalDays > 0 ? (presentDays / totalDays) * 100 : 0

  // Class positions
  const positions = await calculateClassPositions(student.class_id!, academicYearId)
  const myPosition = positions.find(p => p.student_id === studentId)

  // Overall average
  const overallAverage = await calculateTermAverage(studentId, academicYearId)

  // Existing report card or create
  const existing = await admin
    .from('report_cards')
    .select('*')
    .eq('student_id', studentId)
    .eq('academic_year_id', academicYearId)
    .single()

  const reportCardInsert = {
    school_id: schoolId,
    student_id: studentId,
    academic_year_id: academicYearId,
    class_position: myPosition?.position ?? null,
    total_students: positions.length,
    overall_average: overallAverage,
    generated_at: new Date().toISOString(),
  }

  const reportCardUpdate = {
    class_position: myPosition?.position ?? null,
    total_students: positions.length,
    overall_average: overallAverage,
    generated_at: new Date().toISOString(),
  }

  let reportCard: ReportCard

  if (existing.data) {
    const { data: updated } = await admin
      .from('report_cards')
      .update(reportCardUpdate)
      .eq('id', existing.data.id)
      .select()
      .single()
    reportCard = updated!
  } else {
    const { data: created } = await admin
      .from('report_cards')
      .insert(reportCardInsert)
      .select()
      .single()
    reportCard = created!
  }

  // Generate PDF
  const pdfBuffer = await generateReportCardPdf({
    school,
    student,
    academicYear,
    reportCard,
    markRows,
    className,
    attendancePercent,
  })

  // Upload PDF
  const pdfUrl = await uploadReportCard(schoolId, studentId, pdfBuffer)

  // Persist PDF URL
  const { data: final } = await admin
    .from('report_cards')
    .update({ pdf_url: pdfUrl })
    .eq('id', reportCard.id)
    .select()
    .single()

  return final!
}

/**
 * Upload a report card PDF to Supabase Storage and return the public URL.
 */
export async function uploadReportCard(
  schoolId: string,
  studentId: string,
  buffer: Buffer
): Promise<string> {
  const path = `report-cards/${schoolId}/${studentId}/${Date.now()}.pdf`

  const { error } = await admin.storage
    .from('school-files')
    .upload(path, buffer, {
      contentType: 'application/pdf',
      upsert: true,
    })

  if (error) throw new Error(`Storage upload failed: ${error.message}`)

  const { data: urlData } = admin.storage.from('school-files').getPublicUrl(path)
  return urlData.publicUrl
}
