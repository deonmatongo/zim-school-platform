import type { Database } from './database'

// Convenience row types
export type School = Database['public']['Tables']['schools']['Row']
export type AcademicYear = Database['public']['Tables']['academic_years']['Row']
export type Grade = Database['public']['Tables']['grades']['Row']
export type Class = Database['public']['Tables']['classes']['Row']
export type Subject = Database['public']['Tables']['subjects']['Row']
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type Student = Database['public']['Tables']['students']['Row']
export type ParentStudent = Database['public']['Tables']['parent_student']['Row']
export type TeacherAssignment = Database['public']['Tables']['teacher_assignments']['Row']
export type Assessment = Database['public']['Tables']['assessments']['Row']
export type Mark = Database['public']['Tables']['marks']['Row']
export type Homework = Database['public']['Tables']['homework']['Row']
export type Attendance = Database['public']['Tables']['attendance']['Row']
export type FeeStructure = Database['public']['Tables']['fee_structures']['Row']
export type FeeLedger = Database['public']['Tables']['fee_ledger']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type Announcement = Database['public']['Tables']['announcements']['Row']
export type ReportCard = Database['public']['Tables']['report_cards']['Row']

// Standard API response envelope
export interface ApiResponse<T = unknown> {
  data: T | null
  error: string | null
  meta?: {
    total?: number
    page?: number
    pageSize?: number
    [key: string]: unknown
  }
}

// Request context injected by middleware
export interface RequestContext {
  schoolId: string
  userId: string
  role: UserProfile['role']
  school: School
}

// Bulk operations
export interface BulkMarkEntry {
  student_id: string
  raw_score: number | null
  teacher_comment?: string
}

export interface BulkAttendanceEntry {
  student_id: string
  status: Attendance['status']
  reason?: string
}

// Report types
export interface StudentReport {
  student: Student
  marks: Array<Mark & { assessment: Assessment; subject: Subject }>
  attendance: {
    present: number
    absent: number
    late: number
    excused: number
    total: number
    percentage: number
  }
  fees: {
    billed: number
    paid: number
    balance: number
    currency: string
  }
  reportCard: ReportCard | null
}

export interface ClassReport {
  class: Class
  studentCount: number
  averageScore: number
  subjectAverages: Array<{ subject: Subject; average: number; highest: number; lowest: number }>
  attendanceRate: number
  feeCollectionRate: number
}

// Fee summary
export interface FeeSummary {
  student: Student
  billed: number
  paid: number
  balance: number
  currency: string
  overdue: boolean
}
