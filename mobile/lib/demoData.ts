// Demo data for the parent app — mirrors web seed-data

export const DEMO_SCHOOL = {
  name: 'Zimbabwe Schools',
  address: 'Harare, Zimbabwe',
  phone: '+263 242 123 456',
  email: 'admin@zimschools.ac.zw',
  primaryColor: '#1a5276',
}

export const DEMO_PARENT = {
  id: 'dev-parent',
  firstName: 'Demo',
  lastName: 'Parent',
  email: 'parent@zimschools.dev',
}

export interface Child {
  id: string
  firstName: string
  lastName: string
  regNumber: string
  className: string
  classId: string
  grade: string
  avatarInitials: string
  avatarColor: string
  attendancePct: number
  avgMarkPct: number | null
  feeBilled: number
  feePaid: number
  feeBalance: number
  feeStatus: 'paid' | 'partial' | 'unpaid'
}

export const DEMO_CHILDREN: Child[] = [
  {
    id: 'stu-01',
    firstName: 'Takudzwa',
    lastName: 'Moyo',
    regNumber: 'ZS-2025-001',
    className: 'Form 3A',
    classId: 'cls-3a',
    grade: 'Form 3',
    avatarInitials: 'TM',
    avatarColor: '#2980b9',
    attendancePct: 92,
    avgMarkPct: 74,
    feeBilled: 1200,
    feePaid: 600,
    feeBalance: 600,
    feeStatus: 'partial',
  },
  {
    id: 'stu-04',
    firstName: 'Simba',
    lastName: 'Moyo',
    regNumber: 'ZS-2025-004',
    className: 'Form 5A',
    classId: 'cls-5a',
    grade: 'Form 5',
    avatarInitials: 'SM',
    avatarColor: '#8e44ad',
    attendancePct: 98,
    avgMarkPct: 81,
    feeBilled: 1500,
    feePaid: 1500,
    feeBalance: 0,
    feeStatus: 'paid',
  },
]

export interface Mark {
  id: string
  subject: string
  title: string
  type: 'test' | 'exam' | 'class_assessment' | 'project' | 'practical'
  rawScore: number
  maxMarks: number
  date: string
  pct: number
  grade: string
}

export const DEMO_MARKS: Record<string, Mark[]> = {
  'stu-01': [
    { id: 'm1', subject: 'Mathematics',     title: 'Term 1 Test 1',        type: 'test',             rawScore: 68, maxMarks: 100, date: '2025-03-10', pct: 68, grade: 'B' },
    { id: 'm2', subject: 'English Language',title: 'Composition Assessment',type: 'class_assessment', rawScore: 38, maxMarks: 50,  date: '2025-03-12', pct: 76, grade: 'A' },
    { id: 'm3', subject: 'Combined Science', title: 'Biology Quiz',         type: 'test',             rawScore: 27, maxMarks: 40,  date: '2025-03-18', pct: 68, grade: 'B' },
    { id: 'm4', subject: 'Mathematics',     title: 'Algebra Assessment',    type: 'class_assessment', rawScore: 42, maxMarks: 50,  date: '2025-03-24', pct: 84, grade: 'A' },
    { id: 'm5', subject: 'Geography',       title: 'Map Reading Test',      type: 'test',             rawScore: 33, maxMarks: 50,  date: '2025-03-28', pct: 66, grade: 'B' },
    { id: 'm6', subject: 'History',         title: 'Essay: Colonial Era',   type: 'class_assessment', rawScore: 74, maxMarks: 100, date: '2025-04-02', pct: 74, grade: 'A' },
  ],
  'stu-04': [
    { id: 'm7', subject: 'Mathematics',     title: 'Term 1 Test 1',         type: 'test',             rawScore: 78, maxMarks: 100, date: '2025-03-10', pct: 78, grade: 'A' },
    { id: 'm8', subject: 'Accounts',        title: 'Trial Balance Test',    type: 'test',             rawScore: 44, maxMarks: 50,  date: '2025-03-14', pct: 88, grade: 'A' },
    { id: 'm9', subject: 'Business Studies','title': 'Market Research Quiz', type: 'class_assessment', rawScore: 36, maxMarks: 40,  date: '2025-03-20', pct: 90, grade: 'A' },
    { id: 'm10', subject: 'English Language','title': 'Comprehension Test', type: 'test',             rawScore: 70, maxMarks: 100, date: '2025-03-26', pct: 70, grade: 'B' },
    { id: 'm11', subject: 'Mathematics',    'title': 'Statistics Assessment',type: 'class_assessment', rawScore: 47, maxMarks: 50, date: '2025-04-01', pct: 94, grade: 'A' },
  ],
}

export interface AttendanceRecord {
  id: string
  date: string
  status: 'present' | 'absent' | 'late' | 'excused'
}

export const DEMO_ATTENDANCE: Record<string, AttendanceRecord[]> = {
  'stu-01': [
    { id: 'at1',  date: '2025-04-11', status: 'present' },
    { id: 'at2',  date: '2025-04-10', status: 'present' },
    { id: 'at3',  date: '2025-04-09', status: 'late' },
    { id: 'at4',  date: '2025-04-08', status: 'present' },
    { id: 'at5',  date: '2025-04-07', status: 'present' },
    { id: 'at6',  date: '2025-04-04', status: 'absent' },
    { id: 'at7',  date: '2025-04-03', status: 'present' },
    { id: 'at8',  date: '2025-04-02', status: 'present' },
    { id: 'at9',  date: '2025-04-01', status: 'present' },
    { id: 'at10', date: '2025-03-31', status: 'present' },
    { id: 'at11', date: '2025-03-28', status: 'excused' },
    { id: 'at12', date: '2025-03-27', status: 'present' },
  ],
  'stu-04': [
    { id: 'at13', date: '2025-04-11', status: 'present' },
    { id: 'at14', date: '2025-04-10', status: 'present' },
    { id: 'at15', date: '2025-04-09', status: 'present' },
    { id: 'at16', date: '2025-04-08', status: 'present' },
    { id: 'at17', date: '2025-04-07', status: 'present' },
    { id: 'at18', date: '2025-04-04', status: 'present' },
    { id: 'at19', date: '2025-04-03', status: 'present' },
    { id: 'at20', date: '2025-04-02', status: 'late' },
    { id: 'at21', date: '2025-04-01', status: 'present' },
    { id: 'at22', date: '2025-03-31', status: 'present' },
  ],
}

export interface HomeworkItem {
  id: string
  title: string
  subject: string
  className: string
  setDate: string
  dueDate: string
  description: string
}

export const DEMO_HOMEWORK: Record<string, HomeworkItem[]> = {
  'cls-3a': [
    { id: 'hw1', title: 'Algebra Worksheet 3',   subject: 'Mathematics',      className: 'Form 3A', setDate: '2025-04-07', dueDate: '2025-04-14', description: 'Complete exercises 3.1 – 3.5 on page 47.' },
    { id: 'hw2', title: 'Short Story Draft',      subject: 'English Language', className: 'Form 3A', setDate: '2025-04-08', dueDate: '2025-04-16', description: 'Write a 500-word short story set in Zimbabwe.' },
    { id: 'hw3', title: 'Map Reading Assignment', subject: 'Geography',        className: 'Form 3A', setDate: '2025-04-03', dueDate: '2025-04-10', description: 'Draw and label a map of your local area.' },
  ],
  'cls-5a': [
    { id: 'hw4', title: 'Balance Sheet Exercise', subject: 'Accounts',         className: 'Form 5A', setDate: '2025-04-09', dueDate: '2025-04-17', description: 'Prepare a full balance sheet from the given trial balance.' },
    { id: 'hw5', title: 'Business Report',        subject: 'Business Studies', className: 'Form 5A', setDate: '2025-04-08', dueDate: '2025-04-15', description: 'Write a 600-word market analysis report.' },
  ],
}

export interface FeeItem {
  id: string
  termLabel: string
  description: string
  amountBilled: number
  amountPaid: number
  dueDate: string
  status: 'paid' | 'partial' | 'overdue'
}

export const DEMO_FEES: Record<string, FeeItem[]> = {
  'stu-01': [
    { id: 'f1', termLabel: 'Term 1 2025', description: 'Tuition Fees',     amountBilled: 800,  amountPaid: 400,  dueDate: '2025-01-31', status: 'partial' },
    { id: 'f2', termLabel: 'Term 1 2025', description: 'Development Levy', amountBilled: 200,  amountPaid: 200,  dueDate: '2025-01-31', status: 'paid' },
    { id: 'f3', termLabel: 'Term 1 2025', description: 'Examination Fees', amountBilled: 200,  amountPaid: 0,    dueDate: '2025-03-01', status: 'overdue' },
  ],
  'stu-04': [
    { id: 'f4', termLabel: 'Term 1 2025', description: 'Tuition Fees',     amountBilled: 1000, amountPaid: 1000, dueDate: '2025-01-31', status: 'paid' },
    { id: 'f5', termLabel: 'Term 1 2025', description: 'Development Levy', amountBilled: 250,  amountPaid: 250,  dueDate: '2025-01-31', status: 'paid' },
    { id: 'f6', termLabel: 'Term 1 2025', description: 'Examination Fees', amountBilled: 250,  amountPaid: 250,  dueDate: '2025-03-01', status: 'paid' },
  ],
}

export interface Announcement {
  id: string
  title: string
  body: string
  audience: 'all' | 'parents' | 'students' | 'teachers'
  pinned: boolean
  createdAt: string
  author: string
}

export const DEMO_ANNOUNCEMENTS: Announcement[] = [
  { id: 'ann1', title: 'Term 1 Closing Date Changed',    body: 'Term 1 will now close on 11 April 2025 due to the public holiday on 10 April. All pupils should be collected by 1pm on closing day.',       audience: 'all',     pinned: true,  createdAt: '2025-04-01T08:00:00Z', author: 'Dev Admin' },
  { id: 'ann2', title: 'Parent-Teacher Meetings – 9 April', body: 'Parent-teacher meetings will be held on Wednesday 9 April from 1pm to 5pm in the school hall. Please bring your child\'s report card.',     audience: 'parents', pinned: false, createdAt: '2025-03-28T09:00:00Z', author: 'Dev Admin' },
  { id: 'ann3', title: 'Swimming Gala – 5 April',         body: 'The annual inter-house swimming gala will be held at the school pool on Saturday 5 April. All students are expected to attend and support their house.', audience: 'all',     pinned: false, createdAt: '2025-03-25T11:00:00Z', author: 'Grace Mutasa' },
  { id: 'ann4', title: 'Fee Payment Reminder',            body: 'Term 2 fees are due by 5 May 2025. Parents who require a payment plan should contact the bursar\'s office before 30 April. Late payments attract a 5% surcharge.', audience: 'parents', pinned: false, createdAt: '2025-03-20T07:30:00Z', author: 'Dev Admin' },
  { id: 'ann5', title: 'School Uniform Policy Update',    body: 'From Term 2, all students must wear the full school uniform including the blazer on Monday and Friday. No hoodies or non-regulation shoes are permitted.',  audience: 'all',     pinned: false, createdAt: '2025-03-15T10:00:00Z', author: 'Dev Admin' },
]

export interface Message {
  id: string
  senderId: string
  senderName: string
  senderRole: 'teacher' | 'parent' | 'admin'
  recipientId: string
  body: string
  createdAt: string
  read: boolean
}

export const DEMO_MESSAGES: Message[] = [
  { id: 'msg1', senderId: 'teacher-1', senderName: 'Grace Mutasa',  senderRole: 'teacher', recipientId: 'dev-parent', body: "Good morning. I wanted to let you know that Takudzwa has been doing well in Mathematics this term. His latest test score of 68% is a significant improvement. Keep encouraging him at home!", createdAt: '2025-04-09T08:30:00Z', read: true },
  { id: 'msg2', senderId: 'dev-parent', senderName: 'Demo Parent',  senderRole: 'parent',  recipientId: 'teacher-1', body: 'Thank you so much, Mrs Mutasa! We have been working through the exercises together in the evenings. Is there anything specific we should focus on for the upcoming exam?', createdAt: '2025-04-09T12:15:00Z', read: true },
  { id: 'msg3', senderId: 'teacher-1', senderName: 'Grace Mutasa',  senderRole: 'teacher', recipientId: 'dev-parent', body: 'Focus on Chapter 7 — Quadratic Equations — and the past exam paper I sent home last week. The exam will have 3 questions from that chapter.', createdAt: '2025-04-09T14:00:00Z', read: true },
  { id: 'msg4', senderId: 'teacher-2', senderName: 'Tendai Moyo',   senderRole: 'teacher', recipientId: 'dev-parent', body: "Hello, I'm Takudzwa's English teacher. His short story draft was submitted late. Please remind him that the final draft is due on 16 April.",                       createdAt: '2025-04-10T07:45:00Z', read: false },
  { id: 'msg5', senderId: 'dev-admin', senderName: 'School Admin',  senderRole: 'admin',   recipientId: 'dev-parent', body: 'This is a reminder that the second instalment of Term 1 fees (US$600) is now overdue. Please settle by 18 April to avoid disruption to your child\'s schooling.', createdAt: '2025-04-11T09:00:00Z', read: false },
]

export function gradeFromPct(pct: number): string {
  if (pct >= 75) return 'A'
  if (pct >= 60) return 'B'
  if (pct >= 50) return 'C'
  if (pct >= 40) return 'D'
  return 'U'
}

export function gradeColor(pct: number): string {
  if (pct >= 75) return '#10b981'
  if (pct >= 60) return '#3b82f6'
  if (pct >= 50) return '#f59e0b'
  return '#ef4444'
}
