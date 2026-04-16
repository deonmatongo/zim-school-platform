/**
 * Comprehensive dummy data for dev/simulation mode (DEV_BYPASS=true)
 * Mirrors the exact shapes returned by every Supabase query in the platform.
 */

export const SCHOOL_ID = 'dev-school'
export const ACADEMIC_YEAR_ID = 'ay-2025-term1'
export const USER_ID = 'dev-user'

// ── Academic Year ────────────────────────────────────────────────────────────

export const academicYears = [
  {
    id: ACADEMIC_YEAR_ID,
    school_id: SCHOOL_ID,
    year: '2025',
    term: 1,
    start_date: '2025-01-20',
    end_date: '2025-04-11',
    is_current: true,
  },
  {
    id: 'ay-2024-term3',
    school_id: SCHOOL_ID,
    year: '2024',
    term: 3,
    start_date: '2024-09-02',
    end_date: '2024-11-29',
    is_current: false,
  },
]

// ── Grades ───────────────────────────────────────────────────────────────────

export const grades = [
  { id: 'grade-form1', name: 'Form 1', level: 1 },
  { id: 'grade-form2', name: 'Form 2', level: 2 },
  { id: 'grade-form3', name: 'Form 3', level: 3 },
  { id: 'grade-form4', name: 'Form 4', level: 4 },
  { id: 'grade-form5', name: 'Form 5', level: 5 },
  { id: 'grade-form6l', name: 'Lower 6', level: 6 },
]

// ── Subjects ─────────────────────────────────────────────────────────────────

export const subjects = [
  { id: 'subj-math',   school_id: SCHOOL_ID, name: 'Mathematics',       code: 'MATH' },
  { id: 'subj-eng',    school_id: SCHOOL_ID, name: 'English Language',   code: 'ENG' },
  { id: 'subj-sci',    school_id: SCHOOL_ID, name: 'Combined Science',   code: 'SCI' },
  { id: 'subj-hist',   school_id: SCHOOL_ID, name: 'History',            code: 'HIST' },
  { id: 'subj-geo',    school_id: SCHOOL_ID, name: 'Geography',          code: 'GEO' },
  { id: 'subj-shona',  school_id: SCHOOL_ID, name: 'Shona',              code: 'SHONA' },
  { id: 'subj-acc',    school_id: SCHOOL_ID, name: 'Accounts',           code: 'ACC' },
  { id: 'subj-biz',    school_id: SCHOOL_ID, name: 'Business Studies',   code: 'BIZ' },
  { id: 'subj-ict',    school_id: SCHOOL_ID, name: 'Computer Science',   code: 'ICT' },
  { id: 'subj-art',    school_id: SCHOOL_ID, name: 'Art & Design',       code: 'ART' },
]

// ── Teachers ─────────────────────────────────────────────────────────────────

export const teachers = [
  { id: 'teacher-1', school_id: SCHOOL_ID, role: 'teacher', first_name: 'Grace',    last_name: 'Mutasa',    email: 'g.mutasa@stgeorges.dev',   active: true, avatar_url: null },
  { id: 'teacher-2', school_id: SCHOOL_ID, role: 'teacher', first_name: 'Tendai',   last_name: 'Moyo',      email: 't.moyo@stgeorges.dev',     active: true, avatar_url: null },
  { id: 'teacher-3', school_id: SCHOOL_ID, role: 'teacher', first_name: 'Rudo',     last_name: 'Chikwanda', email: 'r.chikwanda@stgeorges.dev', active: true, avatar_url: null },
  { id: 'teacher-4', school_id: SCHOOL_ID, role: 'teacher', first_name: 'Farai',    last_name: 'Nzira',     email: 'f.nzira@stgeorges.dev',    active: true, avatar_url: null },
  { id: 'teacher-5', school_id: SCHOOL_ID, role: 'teacher', first_name: 'Blessing', last_name: 'Mhike',     email: 'b.mhike@stgeorges.dev',    active: true, avatar_url: null },
]

// ── Classes ───────────────────────────────────────────────────────────────────

export const classes = [
  { id: 'cls-3a', school_id: SCHOOL_ID, name: 'Form 3A', grade_id: 'grade-form3', academic_year_id: ACADEMIC_YEAR_ID, capacity: 35, homeroom_teacher_id: 'teacher-1', grades: { name: 'Form 3', level: 3 }, academic_years: { year: '2025', term: 1 }, user_profiles: { first_name: 'Grace', last_name: 'Mutasa' } },
  { id: 'cls-3b', school_id: SCHOOL_ID, name: 'Form 3B', grade_id: 'grade-form3', academic_year_id: ACADEMIC_YEAR_ID, capacity: 35, homeroom_teacher_id: 'teacher-2', grades: { name: 'Form 3', level: 3 }, academic_years: { year: '2025', term: 1 }, user_profiles: { first_name: 'Tendai', last_name: 'Moyo' } },
  { id: 'cls-2a', school_id: SCHOOL_ID, name: 'Form 2A', grade_id: 'grade-form2', academic_year_id: ACADEMIC_YEAR_ID, capacity: 38, homeroom_teacher_id: 'teacher-3', grades: { name: 'Form 2', level: 2 }, academic_years: { year: '2025', term: 1 }, user_profiles: { first_name: 'Rudo', last_name: 'Chikwanda' } },
  { id: 'cls-1b', school_id: SCHOOL_ID, name: 'Form 1B', grade_id: 'grade-form1', academic_year_id: ACADEMIC_YEAR_ID, capacity: 40, homeroom_teacher_id: 'teacher-4', grades: { name: 'Form 1', level: 1 }, academic_years: { year: '2025', term: 1 }, user_profiles: { first_name: 'Farai', last_name: 'Nzira' } },
  { id: 'cls-4a', school_id: SCHOOL_ID, name: 'Form 4A', grade_id: 'grade-form4', academic_year_id: ACADEMIC_YEAR_ID, capacity: 32, homeroom_teacher_id: 'teacher-5', grades: { name: 'Form 4', level: 4 }, academic_years: { year: '2025', term: 1 }, user_profiles: { first_name: 'Blessing', last_name: 'Mhike' } },
]

// ── Students ─────────────────────────────────────────────────────────────────

const STUDENT_SEED = [
  // Form 3A
  { id: 'stu-01', reg: 'SGC2024-0142', first: 'Takudzwa', last: 'Moyo',     gender: 'M', class_id: 'cls-3a', boarding: false, fee_status: 'partial',  attendance_pct: 96 },
  { id: 'stu-02', reg: 'SGC2024-0015', first: 'Blessing',  last: 'Chiremba', gender: 'M', class_id: 'cls-3a', boarding: true,  fee_status: 'cleared',  attendance_pct: 100 },
  { id: 'stu-03', reg: 'SGC2024-0023', first: 'Tatenda',   last: 'Mhike',    gender: 'M', class_id: 'cls-3a', boarding: false, fee_status: 'overdue',  attendance_pct: 94 },
  { id: 'stu-04', reg: 'SGC2024-0031', first: 'Nyasha',    last: 'Gumbo',    gender: 'F', class_id: 'cls-3a', boarding: true,  fee_status: 'cleared',  attendance_pct: 98 },
  { id: 'stu-05', reg: 'SGC2024-0052', first: 'Ruvimbo',   last: 'Ncube',    gender: 'F', class_id: 'cls-3a', boarding: false, fee_status: 'cleared',  attendance_pct: 97 },
  { id: 'stu-06', reg: 'SGC2024-0063', first: 'Simba',     last: 'Dube',     gender: 'M', class_id: 'cls-3a', boarding: true,  fee_status: 'partial',  attendance_pct: 91 },
  // Form 3B
  { id: 'stu-07', reg: 'SGC2024-0078', first: 'Mazvita',   last: 'Zvobgo',   gender: 'F', class_id: 'cls-3b', boarding: false, fee_status: 'cleared',  attendance_pct: 99 },
  { id: 'stu-08', reg: 'SGC2024-0084', first: 'Tapiwa',    last: 'Choto',    gender: 'M', class_id: 'cls-3b', boarding: false, fee_status: 'overdue',  attendance_pct: 87 },
  { id: 'stu-09', reg: 'SGC2024-0091', first: 'Chipo',     last: 'Mupfumi',  gender: 'F', class_id: 'cls-3b', boarding: true,  fee_status: 'cleared',  attendance_pct: 100 },
  // Form 2A
  { id: 'stu-10', reg: 'SGC2024-0047', first: 'Rudo',      last: 'Makoni',   gender: 'F', class_id: 'cls-2a', boarding: false, fee_status: 'partial',  attendance_pct: 92 },
  { id: 'stu-11', reg: 'SGC2024-0055', first: 'Tafadzwa',  last: 'Zenda',    gender: 'M', class_id: 'cls-2a', boarding: false, fee_status: 'cleared',  attendance_pct: 100 },
  { id: 'stu-12', reg: 'SGC2024-0061', first: 'Farai',     last: 'Chiuta',   gender: 'F', class_id: 'cls-2a', boarding: true,  fee_status: 'cleared',  attendance_pct: 95 },
  { id: 'stu-13', reg: 'SGC2024-0072', first: 'Kudakwashe', last: 'Mupondi', gender: 'M', class_id: 'cls-2a', boarding: false, fee_status: 'partial',  attendance_pct: 89 },
  // Form 1B
  { id: 'stu-14', reg: 'SGC2025-0089', first: 'Chiedza',   last: 'Moyo',     gender: 'F', class_id: 'cls-1b', boarding: false, fee_status: 'partial',  attendance_pct: 98 },
  { id: 'stu-15', reg: 'SGC2025-0093', first: 'Panashe',   last: 'Sibanda',  gender: 'M', class_id: 'cls-1b', boarding: true,  fee_status: 'cleared',  attendance_pct: 96 },
  { id: 'stu-16', reg: 'SGC2025-0101', first: 'Anesu',     last: 'Chirewa',  gender: 'F', class_id: 'cls-1b', boarding: false, fee_status: 'cleared',  attendance_pct: 93 },
  // Form 4A
  { id: 'stu-17', reg: 'SGC2023-0034', first: 'Tinashe',   last: 'Mutindi',  gender: 'M', class_id: 'cls-4a', boarding: true,  fee_status: 'cleared',  attendance_pct: 97 },
  { id: 'stu-18', reg: 'SGC2023-0041', first: 'Shamiso',   last: 'Banda',    gender: 'F', class_id: 'cls-4a', boarding: false, fee_status: 'overdue',  attendance_pct: 83 },
  { id: 'stu-19', reg: 'SGC2023-0049', first: 'Munashe',   last: 'Madondo',  gender: 'M', class_id: 'cls-4a', boarding: true,  fee_status: 'cleared',  attendance_pct: 100 },
  { id: 'stu-20', reg: 'SGC2023-0058', first: 'Yeukai',    last: 'Chigwanda',gender: 'F', class_id: 'cls-4a', boarding: false, fee_status: 'partial',  attendance_pct: 91 },
]

const classMap: Record<string, typeof classes[0]> = Object.fromEntries(classes.map(c => [c.id, c]))

export const students = STUDENT_SEED.map(s => ({
  id: s.id,
  school_id: SCHOOL_ID,
  reg_number: s.reg,
  first_name: s.first,
  last_name: s.last,
  gender: s.gender,
  boarding: s.boarding,
  active: true,
  class_id: s.class_id,
  fee_status: s.fee_status,
  attendance_pct: s.attendance_pct,
  parent_contact: `+263 7${Math.floor(Math.random() * 9)} ${String(Math.floor(Math.random() * 900) + 100).padStart(3,'0')} ${Math.floor(Math.random() * 9000) + 1000}`,
  created_at: `2025-01-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}T08:00:00Z`,
  classes: classMap[s.class_id] ? { id: s.class_id, name: classMap[s.class_id].name, grades: classMap[s.class_id].grades } : null,
}))

// ── Assessments ──────────────────────────────────────────────────────────────

export const assessments = [
  { id: 'asmnt-1', school_id: SCHOOL_ID, class_id: 'cls-3a', subject_id: 'subj-math', academic_year_id: ACADEMIC_YEAR_ID, title: 'Mathematics Test 1',   type: 'test',   max_marks: 100, date: '2025-02-14', subjects: { name: 'Mathematics', code: 'MATH' } },
  { id: 'asmnt-2', school_id: SCHOOL_ID, class_id: 'cls-3a', subject_id: 'subj-eng',  academic_year_id: ACADEMIC_YEAR_ID, title: 'English Composition',    type: 'exam',   max_marks: 100, date: '2025-02-21', subjects: { name: 'English Language', code: 'ENG' } },
  { id: 'asmnt-3', school_id: SCHOOL_ID, class_id: 'cls-3a', subject_id: 'subj-sci',  academic_year_id: ACADEMIC_YEAR_ID, title: 'Science Practical',      type: 'project', max_marks: 50, date: '2025-03-05', subjects: { name: 'Combined Science', code: 'SCI' } },
  { id: 'asmnt-4', school_id: SCHOOL_ID, class_id: 'cls-3b', subject_id: 'subj-math', academic_year_id: ACADEMIC_YEAR_ID, title: 'Mathematics Test 1',   type: 'test',   max_marks: 100, date: '2025-02-14', subjects: { name: 'Mathematics', code: 'MATH' } },
  { id: 'asmnt-5', school_id: SCHOOL_ID, class_id: 'cls-2a', subject_id: 'subj-acc',  academic_year_id: ACADEMIC_YEAR_ID, title: 'Accounts Mid-Term',       type: 'exam',   max_marks: 100, date: '2025-03-10', subjects: { name: 'Accounts', code: 'ACC' } },
  { id: 'asmnt-6', school_id: SCHOOL_ID, class_id: 'cls-4a', subject_id: 'subj-hist', academic_year_id: ACADEMIC_YEAR_ID, title: 'History Essay',           type: 'assignment', max_marks: 50, date: '2025-02-28', subjects: { name: 'History', code: 'HIST' } },
]

// ── Marks ────────────────────────────────────────────────────────────────────

const gradeFor = (raw: number, max: number) => {
  const pct = (raw / max) * 100
  if (pct >= 75) return 'A'
  if (pct >= 60) return 'B'
  if (pct >= 50) return 'C'
  if (pct >= 40) return 'D'
  if (pct >= 30) return 'E'
  return 'U'
}

const markSeeds: [string, string, number][] = [
  ['asmnt-1','stu-01',78], ['asmnt-1','stu-02',91], ['asmnt-1','stu-03',55], ['asmnt-1','stu-04',83],
  ['asmnt-1','stu-05',76], ['asmnt-1','stu-06',62], ['asmnt-2','stu-01',65], ['asmnt-2','stu-02',88],
  ['asmnt-2','stu-03',71], ['asmnt-2','stu-04',79], ['asmnt-2','stu-05',84], ['asmnt-2','stu-06',58],
  ['asmnt-3','stu-01',42], ['asmnt-3','stu-02',48], ['asmnt-3','stu-03',35], ['asmnt-3','stu-04',46],
  ['asmnt-4','stu-07',80], ['asmnt-4','stu-08',53], ['asmnt-4','stu-09',93],
  ['asmnt-5','stu-10',61], ['asmnt-5','stu-11',74], ['asmnt-5','stu-12',88], ['asmnt-5','stu-13',49],
  ['asmnt-6','stu-17',39], ['asmnt-6','stu-18',45], ['asmnt-6','stu-19',47], ['asmnt-6','stu-20',36],
]

const assessmentMap = Object.fromEntries(assessments.map(a => [a.id, a]))

export const marks = markSeeds.map(([assessment_id, student_id, raw_score], idx) => {
  const asmnt = assessmentMap[assessment_id]
  return {
    id: `mark-${idx + 1}`,
    school_id: SCHOOL_ID,
    assessment_id,
    student_id,
    raw_score,
    grade_letter: gradeFor(raw_score, asmnt.max_marks),
    teacher_comment: raw_score >= 75 ? 'Excellent work' : raw_score >= 50 ? 'Good effort' : 'Needs improvement',
    entered_by: 'teacher-1',
    entered_at: '2025-03-15T10:00:00Z',
    assessments: {
      title: asmnt.title,
      type: asmnt.type,
      max_marks: asmnt.max_marks,
      date: asmnt.date,
      subjects: asmnt.subjects,
    },
  }
})

// ── Attendance ───────────────────────────────────────────────────────────────

const RECENT_DATES = ['2025-04-07','2025-04-08','2025-04-09','2025-04-10','2025-04-11']
const STATUSES = ['present','present','present','present','late','absent'] as const

export const attendance = RECENT_DATES.flatMap((date, di) =>
  students.filter(s => s.class_id === 'cls-3a').map((s, si) => ({
    id: `att-${di}-${si}`,
    school_id: SCHOOL_ID,
    student_id: s.id,
    class_id: s.class_id,
    academic_year_id: ACADEMIC_YEAR_ID,
    date,
    status: STATUSES[(di + si) % STATUSES.length],
    reason: null,
    recorded_by: 'teacher-1',
    students: { first_name: s.first_name, last_name: s.last_name, reg_number: s.reg_number },
  }))
)

// ── Homework ─────────────────────────────────────────────────────────────────

export const homework = [
  { id: 'hw-1', school_id: SCHOOL_ID, class_id: 'cls-3a', subject_id: 'subj-math', academic_year_id: ACADEMIC_YEAR_ID, title: 'Algebra Worksheet 3', description: 'Complete exercises 3.1 – 3.5 on page 47.', set_date: '2025-04-07', due_date: '2025-04-14', set_by: 'teacher-1', created_at: '2025-04-07T09:00:00Z', subjects: { name: 'Mathematics', code: 'MATH' }, classes: { name: 'Form 3A' }, user_profiles: { first_name: 'Grace', last_name: 'Mutasa' } },
  { id: 'hw-2', school_id: SCHOOL_ID, class_id: 'cls-3a', subject_id: 'subj-eng',  academic_year_id: ACADEMIC_YEAR_ID, title: 'Short Story Draft',     description: 'Write a 500-word short story set in Zimbabwe.', set_date: '2025-04-08', due_date: '2025-04-16', set_by: 'teacher-1', created_at: '2025-04-08T11:00:00Z', subjects: { name: 'English Language', code: 'ENG' }, classes: { name: 'Form 3A' }, user_profiles: { first_name: 'Grace', last_name: 'Mutasa' } },
  { id: 'hw-3', school_id: SCHOOL_ID, class_id: 'cls-3b', subject_id: 'subj-sci',  academic_year_id: ACADEMIC_YEAR_ID, title: 'Lab Report: Osmosis',    description: 'Write up the osmosis lab in full PEAS format.', set_date: '2025-04-08', due_date: '2025-04-15', set_by: 'teacher-2', created_at: '2025-04-08T14:00:00Z', subjects: { name: 'Combined Science', code: 'SCI' }, classes: { name: 'Form 3B' }, user_profiles: { first_name: 'Tendai', last_name: 'Moyo' } },
  { id: 'hw-4', school_id: SCHOOL_ID, class_id: 'cls-2a', subject_id: 'subj-acc',  academic_year_id: ACADEMIC_YEAR_ID, title: 'Trial Balance Exercise', description: 'Prepare a trial balance from the given ledger accounts.', set_date: '2025-04-09', due_date: '2025-04-17', set_by: 'teacher-3', created_at: '2025-04-09T08:00:00Z', subjects: { name: 'Accounts', code: 'ACC' }, classes: { name: 'Form 2A' }, user_profiles: { first_name: 'Rudo', last_name: 'Chikwanda' } },
  { id: 'hw-5', school_id: SCHOOL_ID, class_id: 'cls-4a', subject_id: 'subj-hist', academic_year_id: ACADEMIC_YEAR_ID, title: 'Cold War Essay Plan',    description: 'Outline your argument on the causes of the Cold War.', set_date: '2025-04-09', due_date: '2025-04-18', set_by: 'teacher-5', created_at: '2025-04-09T10:00:00Z', subjects: { name: 'History', code: 'HIST' }, classes: { name: 'Form 4A' }, user_profiles: { first_name: 'Blessing', last_name: 'Mhike' } },
]

// ── Announcements ────────────────────────────────────────────────────────────

export const announcements = [
  { id: 'ann-1', school_id: SCHOOL_ID, title: 'Term 1 Closing Date Changed',           body: 'Term 1 will now close on 11 April 2025 due to public holidays.', audience: 'all',      pinned: true,  published: true, created_by: USER_ID, created_at: '2025-04-01T08:00:00Z', expires_at: null, user_profiles: { first_name: 'Dev', last_name: 'Admin' } },
  { id: 'ann-2', school_id: SCHOOL_ID, title: 'Parent-Teacher Meetings – 9 April',      body: 'Meetings will be held from 13:00–17:00 in the school hall.', audience: 'parents',   pinned: false, published: true, created_by: USER_ID, created_at: '2025-03-28T09:00:00Z', expires_at: null, user_profiles: { first_name: 'Dev', last_name: 'Admin' } },
  { id: 'ann-3', school_id: SCHOOL_ID, title: 'Swimming Gala – 5 April',                body: 'The annual swimming gala will be held at the school pool. All students must attend.', audience: 'all', pinned: false, published: true, created_by: 'teacher-1', created_at: '2025-03-25T11:00:00Z', expires_at: null, user_profiles: { first_name: 'Grace', last_name: 'Mutasa' } },
  { id: 'ann-4', school_id: SCHOOL_ID, title: 'Staff Briefing – Department Heads Only', body: 'Mandatory briefing on new timetable structure for Term 2.', audience: 'teachers',  pinned: false, published: true, created_by: USER_ID, created_at: '2025-03-20T07:30:00Z', expires_at: null, user_profiles: { first_name: 'Dev', last_name: 'Admin' } },
  { id: 'ann-5', school_id: SCHOOL_ID, title: 'Fee Payment Reminder',                   body: 'Term 1 fees are due by 31 January. Please contact the bursar for payment plans.', audience: 'parents', pinned: false, published: true, created_by: USER_ID, created_at: '2025-01-10T08:00:00Z', expires_at: null, user_profiles: { first_name: 'Dev', last_name: 'Admin' } },
]

// ── Fee Ledger ────────────────────────────────────────────────────────────────

const FEE_SCHEDULE: Record<string, { billed: number; paid: number }> = {
  'stu-01': { billed: 1200, paid: 600 },
  'stu-02': { billed: 1200, paid: 1200 },
  'stu-03': { billed: 1200, paid: 200 },
  'stu-04': { billed: 1500, paid: 1500 },
  'stu-05': { billed: 1200, paid: 1200 },
  'stu-06': { billed: 1500, paid: 750 },
  'stu-07': { billed: 1200, paid: 1200 },
  'stu-08': { billed: 1200, paid: 0 },
  'stu-09': { billed: 1500, paid: 1500 },
  'stu-10': { billed: 1200, paid: 600 },
  'stu-11': { billed: 1200, paid: 1200 },
  'stu-12': { billed: 1500, paid: 1500 },
  'stu-13': { billed: 1200, paid: 600 },
  'stu-14': { billed: 1200, paid: 500 },
  'stu-15': { billed: 1500, paid: 1500 },
  'stu-16': { billed: 1200, paid: 1200 },
  'stu-17': { billed: 1500, paid: 1500 },
  'stu-18': { billed: 1200, paid: 0 },
  'stu-19': { billed: 1500, paid: 1500 },
  'stu-20': { billed: 1200, paid: 600 },
}

export const feeLedger = students.map(s => {
  const sched = FEE_SCHEDULE[s.id] ?? { billed: 1200, paid: 1200 }
  return {
    id: `ledger-${s.id}`,
    school_id: SCHOOL_ID,
    student_id: s.id,
    academic_year_id: ACADEMIC_YEAR_ID,
    amount_billed: sched.billed,
    amount_paid: sched.paid,
    currency: 'USD',
    due_date: '2025-01-31',
    overdue: sched.paid < sched.billed && new Date() > new Date('2025-01-31'),
  }
})

export const feePayments = students.flatMap(s => {
  const sched = FEE_SCHEDULE[s.id] ?? { billed: 1200, paid: 0 }
  if (sched.paid === 0) return []
  const months = ['2025-01', '2025-02', '2025-03']
  const perPayment = Math.round(sched.paid / 2)
  return months.slice(0, 2).map((m, i) => ({
    id: `pay-${s.id}-${i}`,
    school_id: SCHOOL_ID,
    student_id: s.id,
    academic_year_id: ACADEMIC_YEAR_ID,
    amount: i === 0 ? perPayment : sched.paid - perPayment,
    paid_at: `${m}-${i === 0 ? '15' : '28'}T10:00:00Z`,
    method: i === 0 ? 'bank_transfer' : 'cash',
    reference: `REF-${s.id.toUpperCase()}-${i + 1}`,
    recorded_by: USER_ID,
  }))
})

// ── Fee Summary (for /api/fees/summary) ─────────────────────────────────────

export const feeSummary = students.map(s => {
  const sched = FEE_SCHEDULE[s.id] ?? { billed: 1200, paid: 1200 }
  const cls = classMap[s.class_id]
  return {
    id: s.id,
    first_name: s.first_name,
    last_name: s.last_name,
    reg_number: s.reg_number,
    classes: cls ? { name: cls.name } : null,
    billed: sched.billed,
    paid: sched.paid,
    balance: sched.billed - sched.paid,
  }
})

// ── Payment Plan Requests ─────────────────────────────────────────────────────

export const paymentPlanRequests = [
  {
    id: 'ppr-1',
    school_id: SCHOOL_ID,
    student_id: 'stu-01',
    parent_id: 'dev-parent',
    academic_year_id: ACADEMIC_YEAR_ID,
    proposed_monthly: 200,
    start_date: '2025-05-01',
    reason: 'Experiencing temporary financial difficulty. I can commit to $200 per month over 3 months to clear the balance.',
    status: 'pending' as const,
    created_at: '2025-04-10T09:00:00Z',
    reviewed_at: null,
    admin_note: null,
  },
]

// ── Report Cards ─────────────────────────────────────────────────────────────

export const reportCards = [
  { id: 'rpt-1', school_id: SCHOOL_ID, student_id: 'stu-02', academic_year_id: ACADEMIC_YEAR_ID, overall_average: 89.3, class_position: 1, total_students: 6, generated_at: '2025-04-05T10:00:00Z', pdf_url: '/reports/stu-02.pdf', students: { first_name: 'Blessing', last_name: 'Chiremba', reg_number: 'SGC2024-0015' } },
  { id: 'rpt-2', school_id: SCHOOL_ID, student_id: 'stu-04', academic_year_id: ACADEMIC_YEAR_ID, overall_average: 80.1, class_position: 2, total_students: 6, generated_at: '2025-04-05T10:05:00Z', pdf_url: '/reports/stu-04.pdf', students: { first_name: 'Nyasha', last_name: 'Gumbo', reg_number: 'SGC2024-0031' } },
  { id: 'rpt-3', school_id: SCHOOL_ID, student_id: 'stu-01', academic_year_id: ACADEMIC_YEAR_ID, overall_average: 71.5, class_position: 3, total_students: 6, generated_at: '2025-04-05T10:10:00Z', pdf_url: '/reports/stu-01.pdf', students: { first_name: 'Takudzwa', last_name: 'Moyo', reg_number: 'SGC2024-0142' } },
]

// ── Parent-Student Links ──────────────────────────────────────────────────────

export const parentStudentLinks = [
  {
    id: 'psl-1', parent_id: 'dev-parent', student_id: 'stu-01',
    students: { id: 'stu-01', first_name: 'Takudzwa', last_name: 'Moyo', reg_number: 'SGC2024-0142', class_id: 'cls-3a', classes: { name: 'Form 3A', grades: { name: 'Form 3' } } },
  },
  {
    id: 'psl-2', parent_id: 'dev-parent', student_id: 'stu-14',
    students: { id: 'stu-14', first_name: 'Chiedza', last_name: 'Moyo', reg_number: 'SGC2025-0089', class_id: 'cls-1b', classes: { name: 'Form 1B', grades: { name: 'Form 1' } } },
  },
]

// ── Direct Messages ────────────────────────────────────────────────────────────

export const devMessages = [
  {
    id: 'msg-1', school_id: SCHOOL_ID, thread_id: 'thread-1',
    sender_id: 'dev-parent', recipient_id: 'teacher-1', student_id: 'stu-01',
    body: "Good morning Ms Mutasa, I wanted to enquire about Takudzwa's performance in Mathematics. He seems to be struggling with algebra recently. Could we arrange a meeting to discuss his progress?",
    read_at: '2025-04-08T09:30:00Z', created_at: '2025-04-08T07:15:00Z',
    sender: { id: 'dev-parent', first_name: 'Demo', last_name: 'Parent', role: 'parent' },
    recipient: { id: 'teacher-1', first_name: 'Grace', last_name: 'Mutasa', role: 'teacher' },
    student: { id: 'stu-01', first_name: 'Takudzwa', last_name: 'Moyo' },
  },
  {
    id: 'msg-2', school_id: SCHOOL_ID, thread_id: 'thread-1',
    sender_id: 'teacher-1', recipient_id: 'dev-parent', student_id: 'stu-01',
    body: "Good morning! Thank you for reaching out. Takudzwa is indeed finding the algebra unit challenging but he is making steady progress. I would be happy to meet. How does Wednesday at 3pm work for you?",
    read_at: '2025-04-10T09:00:00Z', created_at: '2025-04-08T09:30:00Z',
    sender: { id: 'teacher-1', first_name: 'Grace', last_name: 'Mutasa', role: 'teacher' },
    recipient: { id: 'dev-parent', first_name: 'Demo', last_name: 'Parent', role: 'parent' },
    student: { id: 'stu-01', first_name: 'Takudzwa', last_name: 'Moyo' },
  },
  {
    id: 'msg-3', school_id: SCHOOL_ID, thread_id: 'thread-1',
    sender_id: 'dev-parent', recipient_id: 'teacher-1', student_id: 'stu-01',
    body: "Wednesday at 3pm works perfectly. Thank you Ms Mutasa, I really appreciate your dedication to the students.",
    read_at: '2025-04-10T09:30:00Z', created_at: '2025-04-09T08:00:00Z',
    sender: { id: 'dev-parent', first_name: 'Demo', last_name: 'Parent', role: 'parent' },
    recipient: { id: 'teacher-1', first_name: 'Grace', last_name: 'Mutasa', role: 'teacher' },
    student: { id: 'stu-01', first_name: 'Takudzwa', last_name: 'Moyo' },
  },
  {
    id: 'msg-4', school_id: SCHOOL_ID, thread_id: 'thread-2',
    sender_id: 'dev-parent', recipient_id: 'teacher-4', student_id: 'stu-14',
    body: "Good afternoon Mr Nzira, Chiedza was unwell last week and may have missed the English homework deadline. Could you please advise on what still needs to be submitted?",
    read_at: null, created_at: '2025-04-10T14:00:00Z',
    sender: { id: 'dev-parent', first_name: 'Demo', last_name: 'Parent', role: 'parent' },
    recipient: { id: 'teacher-4', first_name: 'Farai', last_name: 'Nzira', role: 'teacher' },
    student: { id: 'stu-14', first_name: 'Chiedza', last_name: 'Moyo' },
  },
  {
    id: 'msg-5', school_id: SCHOOL_ID, thread_id: 'thread-2',
    sender_id: 'teacher-4', recipient_id: 'dev-parent', student_id: 'stu-14',
    body: "Good afternoon. I hope Chiedza is feeling better. She needs to submit the short story draft — the new deadline is this Friday. Please remind her to bring it to class.",
    read_at: null, created_at: '2025-04-11T08:30:00Z',
    sender: { id: 'teacher-4', first_name: 'Farai', last_name: 'Nzira', role: 'teacher' },
    recipient: { id: 'dev-parent', first_name: 'Demo', last_name: 'Parent', role: 'parent' },
    student: { id: 'stu-14', first_name: 'Chiedza', last_name: 'Moyo' },
  },
]

// ── Teacher Assignments ───────────────────────────────────────────────────────

export const teacherAssignments = [
  { id: 'ta-1', class_id: 'cls-3a', subject_id: 'subj-math', teacher_id: 'teacher-1', subjects: { name: 'Mathematics',     code: 'MATH'  }, user_profiles: { first_name: 'Grace',    last_name: 'Mutasa'    } },
  { id: 'ta-2', class_id: 'cls-3a', subject_id: 'subj-eng',  teacher_id: 'teacher-2', subjects: { name: 'English Language', code: 'ENG'   }, user_profiles: { first_name: 'Tendai',   last_name: 'Moyo'      } },
  { id: 'ta-3', class_id: 'cls-3a', subject_id: 'subj-sci',  teacher_id: 'teacher-3', subjects: { name: 'Combined Science', code: 'SCI'   }, user_profiles: { first_name: 'Rudo',     last_name: 'Chikwanda' } },
  { id: 'ta-4', class_id: 'cls-3b', subject_id: 'subj-math', teacher_id: 'teacher-1', subjects: { name: 'Mathematics',     code: 'MATH'  }, user_profiles: { first_name: 'Grace',    last_name: 'Mutasa'    } },
  { id: 'ta-5', class_id: 'cls-3b', subject_id: 'subj-sci',  teacher_id: 'teacher-3', subjects: { name: 'Combined Science', code: 'SCI'   }, user_profiles: { first_name: 'Rudo',     last_name: 'Chikwanda' } },
  { id: 'ta-6', class_id: 'cls-3b', subject_id: 'subj-eng',  teacher_id: 'teacher-2', subjects: { name: 'English Language', code: 'ENG'   }, user_profiles: { first_name: 'Tendai',   last_name: 'Moyo'      } },
  { id: 'ta-7', class_id: 'cls-2a', subject_id: 'subj-acc',  teacher_id: 'teacher-3', subjects: { name: 'Accounts',        code: 'ACC'   }, user_profiles: { first_name: 'Rudo',     last_name: 'Chikwanda' } },
  { id: 'ta-8', class_id: 'cls-2a', subject_id: 'subj-math', teacher_id: 'teacher-1', subjects: { name: 'Mathematics',     code: 'MATH'  }, user_profiles: { first_name: 'Grace',    last_name: 'Mutasa'    } },
  { id: 'ta-9', class_id: 'cls-1b', subject_id: 'subj-eng',  teacher_id: 'teacher-4', subjects: { name: 'English Language', code: 'ENG'   }, user_profiles: { first_name: 'Farai',    last_name: 'Nzira'     } },
  { id: 'ta-10',class_id: 'cls-1b', subject_id: 'subj-math', teacher_id: 'teacher-1', subjects: { name: 'Mathematics',     code: 'MATH'  }, user_profiles: { first_name: 'Grace',    last_name: 'Mutasa'    } },
  { id: 'ta-11',class_id: 'cls-4a', subject_id: 'subj-hist', teacher_id: 'teacher-5', subjects: { name: 'History',         code: 'HIST'  }, user_profiles: { first_name: 'Blessing', last_name: 'Mhike'     } },
  { id: 'ta-12',class_id: 'cls-4a', subject_id: 'subj-math', teacher_id: 'teacher-1', subjects: { name: 'Mathematics',     code: 'MATH'  }, user_profiles: { first_name: 'Grace',    last_name: 'Mutasa'    } },
]

// ── School ───────────────────────────────────────────────────────────────────

export const school = {
  id: SCHOOL_ID,
  name: "St. George's College",
  slug: 'stgeorges',
  primary_color: '#1a5276',
  accent_color: '#2980b9',
  logo_url: null,
  address: 'Harare, Zimbabwe',
  phone: '+263 242 123 456',
  email: 'admin@stgeorges.ac.zw',
  term: 1,
  created_at: '2024-01-01T00:00:00Z',
}
