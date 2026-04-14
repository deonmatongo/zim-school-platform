import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { BulkAttendanceSchema } from '@/lib/validators/attendance'
import { getRouteContext, parseBody, apiSuccess, apiError, requireRole } from '@/lib/api-helpers'
import { sendAbsenceAlert } from '@/lib/services/notifications'

export async function GET(request: NextRequest) {
  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const { searchParams } = new URL(request.url)
  const classId = searchParams.get('class_id')
  const studentId = searchParams.get('student_id')
  const date = searchParams.get('date')
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const admin = createAdminClient()

  let query = admin
    .from('attendance')
    .select('*, students(first_name, last_name, reg_number)')
    .eq('school_id', ctx.schoolId)
    .order('date', { ascending: false })

  if (classId) query = query.eq('class_id', classId)
  if (studentId) query = query.eq('student_id', studentId)
  if (date) query = query.eq('date', date)
  if (from) query = query.gte('date', from)
  if (to) query = query.lte('date', to)

  // Parents: only their children
  if (ctx.role === 'parent') {
    const { data: links } = await admin
      .from('parent_student')
      .select('student_id')
      .eq('parent_id', ctx.userId)
    const childIds = (links ?? []).map(l => l.student_id)
    if (childIds.length === 0) return apiSuccess([])
    query = query.in('student_id', childIds)
  }

  // Students: only own
  if (ctx.role === 'student') {
    const { data: student } = await admin
      .from('students')
      .select('id')
      .eq('user_id', ctx.userId)
      .single()
    if (!student) return apiError('Student profile not found', 404)
    query = query.eq('student_id', student.id)
  }

  const { data, error } = await query
  if (error) return apiError(error.message)
  return apiSuccess(data)
}

export async function POST(request: NextRequest) {
  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const roleCheck = requireRole(ctx.role, ['admin', 'teacher'])
  if (roleCheck) return roleCheck

  const parsed = await parseBody(request, BulkAttendanceSchema)
  if ('response' in parsed) return parsed.response

  const admin = createAdminClient()
  const { class_id, academic_year_id, date, records } = parsed.data

  // Teachers must be assigned to this class
  if (ctx.role === 'teacher') {
    const { data: assignments } = await admin
      .from('teacher_assignments')
      .select('id')
      .eq('teacher_id', ctx.userId)
      .eq('class_id', class_id)
    if (!assignments?.length) return apiError('You are not assigned to this class', 403)
  }

  const upserts = records.map(r => ({
    school_id: ctx.schoolId,
    student_id: r.student_id,
    class_id,
    academic_year_id,
    date,
    status: r.status,
    reason: r.reason ?? null,
    recorded_by: ctx.userId,
  }))

  const { data, error } = await admin
    .from('attendance')
    .upsert(upserts, { onConflict: 'student_id,date' })
    .select()

  if (error) return apiError(error.message)

  // Fire absence alerts in background (non-blocking)
  const absentIds = records
    .filter(r => r.status === 'absent')
    .map(r => r.student_id)

  for (const id of absentIds) {
    sendAbsenceAlert(id, date).catch(err => console.error('[Attendance] Absence alert failed:', err))
  }

  return apiSuccess(data, undefined, 201)
}
