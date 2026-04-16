/**
 * Dev mock handler — returns dummy data for every API route when DEV_BYPASS=true.
 * Import `devMock` in each route and call it first; if it returns a Response, return that immediately.
 */
import { NextRequest, NextResponse } from 'next/server'
import {
  academicYears, assessments, attendance, announcements,
  classes, devMessages, feeLedger, feePayments, feeSummary, grades, homework,
  marks, parentStudentLinks, paymentPlanRequests, reportCards, school, students, subjects,
  teacherAssignments, teachers,
  ACADEMIC_YEAR_ID, SCHOOL_ID,
} from './seed-data'

// Enriched teacher assignments for DEV use
const devTeacherAssignments = teacherAssignments.map(a => ({
  ...a,
  user_profiles: { id: a.teacher_id, first_name: a.user_profiles.first_name, last_name: a.user_profiles.last_name, email: `${a.user_profiles.first_name.toLowerCase()}@zimschools.dev` },
  classes: classes.find(c => c.id === a.class_id) ? { id: a.class_id, name: classes.find(c => c.id === a.class_id)!.name } : null,
  subjects: { id: a.subject_id, name: a.subjects.name, code: a.subjects.code },
  academic_years: { id: ACADEMIC_YEAR_ID, year: '2025', term: 1 },
}))

function ok(data: unknown, meta?: Record<string, unknown>, status = 200) {
  return NextResponse.json({ data, error: null, meta }, { status })
}

function notFound(msg = 'Not found') {
  return NextResponse.json({ data: null, error: msg }, { status: 404 })
}

/** Call at the top of each API route GET/POST handler. Returns a Response or null (= continue normally). */
export function devMock(request: NextRequest, routeKey: string, params?: Record<string, string>): NextResponse | null {
  if (process.env.DEV_BYPASS !== 'true') return null

  const url = new URL(request.url)
  const sp = url.searchParams

  switch (routeKey) {

    // ── Academic Years ──────────────────────────────────────────────────────
    case 'academic-years:GET': {
      const currentOnly = sp.get('current') === 'true'
      return ok(currentOnly ? academicYears.filter(y => y.is_current) : academicYears)
    }
    case 'academic-years:POST':
      return ok({ id: `ay-new-${Date.now()}` }, undefined, 201)

    // ── Students ────────────────────────────────────────────────────────────
    case 'students:GET': {
      const classId = sp.get('class_id')
      const result = classId ? students.filter(s => s.class_id === classId) : students
      return ok(result, { total: result.length, page: 1, pageSize: 50 })
    }
    case 'students:POST':
      return ok({ id: `stu-new-${Date.now()}` }, undefined, 201)

    case 'students/[id]:GET': {
      const s = students.find(s => s.id === params?.id)
      return s ? ok(s) : notFound('Student not found')
    }
    case 'students/[id]:PUT':
      return ok({ id: params?.id, updated: true })
    case 'students/[id]:DELETE':
      return ok({ deleted: true })

    // ── Grades ──────────────────────────────────────────────────────────────
    case 'grades:GET':
      return ok(grades)

    // ── Classes ─────────────────────────────────────────────────────────────
    case 'classes:GET': {
      const ayId = sp.get('academic_year_id')
      const gradeId = sp.get('grade_id')
      let result = classes
      if (ayId) result = result.filter(c => c.academic_year_id === ayId)
      if (gradeId) result = result.filter(c => c.grade_id === gradeId)
      return ok(result)
    }
    case 'classes:POST':
      return ok({ id: `cls-new-${Date.now()}` }, undefined, 201)

    case 'classes/[id]:GET': {
      const cls = classes.find(c => c.id === params?.id)
      if (!cls) return notFound('Class not found')
      const classStudents = students.filter(s => s.class_id === params?.id)
      const classAssignments = teacherAssignments.filter(a => a.class_id === params?.id)
      const classAssessments = assessments.filter(a => a.class_id === params?.id)
      const aIds = new Set(classAssessments.map(a => a.id))
      const classMarks = marks.filter(m => aIds.has(m.assessment_id))
      return ok({ class: cls, students: classStudents, assignments: classAssignments, assessments: classAssessments, marks: classMarks })
    }

    // ── Subjects ────────────────────────────────────────────────────────────
    case 'subjects:GET':
      return ok(subjects)
    case 'subjects:POST':
      return ok({ id: `subj-new-${Date.now()}` }, undefined, 201)

    // ── Teachers ────────────────────────────────────────────────────────────
    case 'teachers:GET':
      return ok(teachers)

    // ── Assessments ─────────────────────────────────────────────────────────
    case 'assessments:GET': {
      const classId = sp.get('class_id')
      const subjectId = sp.get('subject_id')
      let result = assessments
      if (classId) result = result.filter(a => a.class_id === classId)
      if (subjectId) result = result.filter(a => a.subject_id === subjectId)
      return ok(result)
    }
    case 'assessments:POST':
      return ok({ id: `asmnt-new-${Date.now()}` }, undefined, 201)

    // ── Marks ────────────────────────────────────────────────────────────────
    case 'marks:GET': {
      const studentId = sp.get('student_id')
      const assessmentId = sp.get('assessment_id')
      const classId = sp.get('class_id')
      let result = marks
      if (studentId) result = result.filter(m => m.student_id === studentId)
      if (assessmentId) result = result.filter(m => m.assessment_id === assessmentId)
      if (classId) {
        const aIds = assessments.filter(a => a.class_id === classId).map(a => a.id)
        result = result.filter(m => aIds.includes(m.assessment_id))
      }
      return ok(result)
    }
    case 'marks:POST':
      return ok([], undefined, 201)

    // ── Attendance ───────────────────────────────────────────────────────────
    case 'attendance:GET': {
      const classId = sp.get('class_id')
      const studentId = sp.get('student_id')
      const date = sp.get('date')
      const from = sp.get('from')
      const to = sp.get('to')
      let result = attendance
      if (classId) result = result.filter(a => a.class_id === classId)
      if (studentId) result = result.filter(a => a.student_id === studentId)
      if (date) result = result.filter(a => a.date === date)
      if (from) result = result.filter(a => a.date >= from)
      if (to) result = result.filter(a => a.date <= to)
      return ok(result)
    }
    case 'attendance:POST':
      return ok([], undefined, 201)

    // ── Homework ─────────────────────────────────────────────────────────────
    case 'homework:GET': {
      const classId = sp.get('class_id')
      const result = classId ? homework.filter(h => h.class_id === classId) : homework
      return ok(result)
    }
    case 'homework:POST':
      return ok({ id: `hw-new-${Date.now()}` }, undefined, 201)

    // ── Announcements ────────────────────────────────────────────────────────
    case 'announcements:GET': {
      const role = request.headers.get('x-user-role') ?? 'admin'
      if (role === 'admin') return ok(announcements)
      const allowed = ['all']
      if (role === 'parent')  allowed.push('parents')
      if (role === 'student') allowed.push('students')
      if (role === 'teacher') allowed.push('teachers')
      return ok(announcements.filter(a => allowed.includes(a.audience)))
    }
    case 'announcements:POST':
      return ok({ id: `ann-new-${Date.now()}` }, undefined, 201)

    // ── Fees ─────────────────────────────────────────────────────────────────
    case 'fees:GET': {
      const studentId = sp.get('student_id')
      const result = studentId ? feeLedger.filter(l => l.student_id === studentId) : feeLedger
      return ok(result)
    }
    case 'fees/summary:GET': {
      const classId = sp.get('class_id')
      let result = feeSummary
      if (classId) {
        const studentIdsInClass = students.filter(s => s.class_id === classId).map(s => s.id)
        result = result.filter(r => studentIdsInClass.includes(r.id))
      }
      const totalBilled = result.reduce((s, r) => s + r.billed, 0)
      const totalPaid = result.reduce((s, r) => s + r.paid, 0)
      return ok(result, { totalBilled, totalPaid, totalBalance: totalBilled - totalPaid, overdueCount: result.filter(r => r.balance > 0).length, currency: 'USD' })
    }
    case 'fees/payment:GET': {
      const studentId = sp.get('student_id')
      const result = studentId ? feePayments.filter(p => p.student_id === studentId) : feePayments
      return ok(result)
    }

    case 'fees/payment-plan:GET': {
      const studentId = sp.get('student_id')
      const result = studentId ? paymentPlanRequests.filter(p => p.student_id === studentId) : paymentPlanRequests
      return ok(result)
    }
    case 'fees/payment-plan:POST':
      return ok({ id: `ppr-new-${Date.now()}`, status: 'pending', created_at: new Date().toISOString() }, undefined, 201)
    case 'fees/payment:POST':
      return ok({ id: `pay-new-${Date.now()}` }, undefined, 201)

    // ── Reports ───────────────────────────────────────────────────────────────
    case 'reports/student/[id]:GET': {
      const rpt = reportCards.find(r => r.student_id === params?.id)
      return rpt ? ok(rpt) : notFound('Report not found')
    }
    case 'reports/class/[id]:GET': {
      const classStudents = students.filter(s => s.class_id === params?.id)
      const result = classStudents.map(s => {
        const studentMarks = marks.filter(m => m.student_id === s.id)
        const avg = studentMarks.length ? studentMarks.reduce((sum, m) => sum + (m.raw_score / m.assessments.max_marks) * 100, 0) / studentMarks.length : 0
        return { student: s, marks: studentMarks, average: Math.round(avg * 10) / 10 }
      })
      return ok(result)
    }
    case 'reports/generate/[id]:POST':
      return ok({ student_id: params?.id, pdf_url: `/reports/${params?.id}.pdf`, generated_at: new Date().toISOString() }, undefined, 201)

    // ── Messages ─────────────────────────────────────────────────────────────
    case 'messages:GET': {
      const userId = request.headers.get('x-user-id') ?? 'dev-parent'
      const threadId = sp.get('thread_id')
      let result = devMessages.filter(m => m.sender_id === userId || m.recipient_id === userId)
      if (threadId) result = result.filter(m => m.thread_id === threadId)
      return ok(result)
    }
    case 'messages:POST': {
      const userId = request.headers.get('x-user-id') ?? 'dev-parent'
      return ok({ id: `msg-new-${Date.now()}`, sender_id: userId, created_at: new Date().toISOString() }, undefined, 201)
    }

    // ── Parent Children ───────────────────────────────────────────────────────
    case 'parent/children:GET': {
      const userId = request.headers.get('x-user-id') ?? 'dev-parent'
      const links = parentStudentLinks.filter(l => l.parent_id === userId)
      // Enrich each child with their fee balance and latest marks
      const enriched = links.map(link => {
        const child = link.students
        const childFees = feeLedger.filter(f => f.student_id === child.id)
        const totalBilled = childFees.reduce((s, f) => s + f.amount_billed, 0)
        const totalPaid = childFees.reduce((s, f) => s + f.amount_paid, 0)
        const childMarks = marks.filter(m => m.student_id === child.id)
        const avgPct = childMarks.length
          ? Math.round(childMarks.reduce((s, m) => s + (m.raw_score / m.assessments.max_marks) * 100, 0) / childMarks.length)
          : null
        const studentData = students.find(s => s.id === child.id)
        return {
          ...link,
          fee_balance: totalBilled - totalPaid,
          fee_billed: totalBilled,
          fee_paid: totalPaid,
          avg_mark_pct: avgPct,
          attendance_pct: studentData?.attendance_pct ?? null,
          fee_status: studentData?.fee_status ?? 'unpaid',
        }
      })
      return ok(enriched)
    }

    // ── Teacher Assignments ───────────────────────────────────────────────────
    case 'teacher-assignments:GET': {
      const classId   = sp.get('class_id')
      const teacherId = sp.get('teacher_id')
      let result = devTeacherAssignments
      if (classId)   result = result.filter(a => a.class_id === classId)
      if (teacherId) result = result.filter(a => a.teacher_id === teacherId)
      return ok(result)
    }
    case 'teacher-assignments:POST':
      // Body is read async — return a placeholder; the page adds rich data client-side
      return ok({ id: `ta-new-${Date.now()}` }, undefined, 201)
    case 'teacher-assignments/[id]:DELETE':
      return ok({ deleted: true })

    // ── Schools ──────────────────────────────────────────────────────────────
    case 'schools:GET':
      return ok([school])
    case 'schools/[id]:GET':
      return ok(school)
    case 'schools/[id]:PUT':
      return ok({ ...school, updated: true })

    // ── Notifications ────────────────────────────────────────────────────────
    case 'notifications/sms:POST':
      return ok({ sent: true, message: '[DEV] SMS not sent in simulation mode' })

    default:
      return null
  }
}

