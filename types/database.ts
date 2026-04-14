// ⚠️  This is a hand-crafted placeholder.
// Replace by running:
//   npx supabase gen types typescript --project-id <your-project-id> > types/database.ts
//
// The Supabase JS client infers its insert/update types from this file.
// The format below matches what `supabase gen types` produces in SDK v2.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      schools: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          primary_color: string
          accent_color: string
          motto: string | null
          district: string | null
          province: string | null
          address: string | null
          phone: string | null
          email: string | null
          ecocash_number: string | null
          zimswitch_account: string | null
          currency: string
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          primary_color?: string
          accent_color?: string
          motto?: string | null
          district?: string | null
          province?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          ecocash_number?: string | null
          zimswitch_account?: string | null
          currency?: string
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          primary_color?: string
          accent_color?: string
          motto?: string | null
          district?: string | null
          province?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          ecocash_number?: string | null
          zimswitch_account?: string | null
          currency?: string
          active?: boolean
        }
        Relationships: []
      }
      academic_years: {
        Row: {
          id: string
          school_id: string
          year: number
          term: number
          start_date: string
          end_date: string
          is_current: boolean
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          year: number
          term: number
          start_date: string
          end_date: string
          is_current?: boolean
          created_at?: string
        }
        Update: {
          school_id?: string
          year?: number
          term?: number
          start_date?: string
          end_date?: string
          is_current?: boolean
        }
        Relationships: [
          { foreignKeyName: 'academic_years_school_id_fkey'; columns: ['school_id']; referencedRelation: 'schools'; referencedColumns: ['id'] }
        ]
      }
      grades: {
        Row: {
          id: string
          school_id: string
          name: string
          level: number
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          name: string
          level: number
          created_at?: string
        }
        Update: {
          school_id?: string
          name?: string
          level?: number
        }
        Relationships: [
          { foreignKeyName: 'grades_school_id_fkey'; columns: ['school_id']; referencedRelation: 'schools'; referencedColumns: ['id'] }
        ]
      }
      classes: {
        Row: {
          id: string
          school_id: string
          grade_id: string
          academic_year_id: string
          name: string
          homeroom_teacher_id: string | null
          capacity: number
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          grade_id: string
          academic_year_id: string
          name: string
          homeroom_teacher_id?: string | null
          capacity?: number
          created_at?: string
        }
        Update: {
          school_id?: string
          grade_id?: string
          academic_year_id?: string
          name?: string
          homeroom_teacher_id?: string | null
          capacity?: number
        }
        Relationships: [
          { foreignKeyName: 'classes_school_id_fkey'; columns: ['school_id']; referencedRelation: 'schools'; referencedColumns: ['id'] }
        ]
      }
      subjects: {
        Row: {
          id: string
          school_id: string
          name: string
          code: string
          zimsec_code: string | null
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          name: string
          code: string
          zimsec_code?: string | null
          created_at?: string
        }
        Update: {
          school_id?: string
          name?: string
          code?: string
          zimsec_code?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          id: string
          school_id: string
          role: 'admin' | 'teacher' | 'parent' | 'student'
          first_name: string
          last_name: string
          phone: string | null
          sms_opt_in: boolean
          avatar_url: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id: string
          school_id: string
          role: 'admin' | 'teacher' | 'parent' | 'student'
          first_name: string
          last_name: string
          phone?: string | null
          sms_opt_in?: boolean
          avatar_url?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          school_id?: string
          role?: 'admin' | 'teacher' | 'parent' | 'student'
          first_name?: string
          last_name?: string
          phone?: string | null
          sms_opt_in?: boolean
          avatar_url?: string | null
          active?: boolean
        }
        Relationships: []
      }
      students: {
        Row: {
          id: string
          school_id: string
          user_id: string | null
          reg_number: string
          first_name: string
          last_name: string
          date_of_birth: string | null
          gender: 'M' | 'F' | null
          class_id: string | null
          boarding: boolean
          medical_notes: string | null
          photo_url: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          user_id?: string | null
          reg_number: string
          first_name: string
          last_name: string
          date_of_birth?: string | null
          gender?: 'M' | 'F' | null
          class_id?: string | null
          boarding?: boolean
          medical_notes?: string | null
          photo_url?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          school_id?: string
          user_id?: string | null
          reg_number?: string
          first_name?: string
          last_name?: string
          date_of_birth?: string | null
          gender?: 'M' | 'F' | null
          class_id?: string | null
          boarding?: boolean
          medical_notes?: string | null
          photo_url?: string | null
          active?: boolean
        }
        Relationships: []
      }
      parent_student: {
        Row: {
          id: string
          parent_id: string
          student_id: string
          relationship: string
          is_primary: boolean
        }
        Insert: {
          id?: string
          parent_id: string
          student_id: string
          relationship?: string
          is_primary?: boolean
        }
        Update: {
          parent_id?: string
          student_id?: string
          relationship?: string
          is_primary?: boolean
        }
        Relationships: []
      }
      teacher_assignments: {
        Row: {
          id: string
          teacher_id: string
          class_id: string
          subject_id: string
          academic_year_id: string
        }
        Insert: {
          id?: string
          teacher_id: string
          class_id: string
          subject_id: string
          academic_year_id: string
        }
        Update: {
          teacher_id?: string
          class_id?: string
          subject_id?: string
          academic_year_id?: string
        }
        Relationships: []
      }
      assessments: {
        Row: {
          id: string
          school_id: string
          class_id: string
          subject_id: string
          academic_year_id: string
          created_by: string
          title: string
          type: 'test' | 'exam' | 'class_assessment' | 'practical' | 'project'
          max_marks: number
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          class_id: string
          subject_id: string
          academic_year_id: string
          created_by: string
          title: string
          type: 'test' | 'exam' | 'class_assessment' | 'practical' | 'project'
          max_marks: number
          date: string
          created_at?: string
        }
        Update: {
          school_id?: string
          class_id?: string
          subject_id?: string
          academic_year_id?: string
          created_by?: string
          title?: string
          type?: 'test' | 'exam' | 'class_assessment' | 'practical' | 'project'
          max_marks?: number
          date?: string
        }
        Relationships: []
      }
      marks: {
        Row: {
          id: string
          assessment_id: string
          student_id: string
          school_id: string
          raw_score: number | null
          grade_letter: string | null
          teacher_comment: string | null
          entered_by: string
          entered_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          student_id: string
          school_id: string
          raw_score?: number | null
          grade_letter?: string | null
          teacher_comment?: string | null
          entered_by: string
          entered_at?: string
        }
        Update: {
          raw_score?: number | null
          grade_letter?: string | null
          teacher_comment?: string | null
          entered_by?: string
          entered_at?: string
        }
        Relationships: []
      }
      homework: {
        Row: {
          id: string
          school_id: string
          class_id: string
          subject_id: string
          academic_year_id: string
          created_by: string
          title: string
          description: string | null
          attachment_url: string | null
          set_date: string
          due_date: string
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          class_id: string
          subject_id: string
          academic_year_id: string
          created_by: string
          title: string
          description?: string | null
          attachment_url?: string | null
          set_date: string
          due_date: string
          created_at?: string
        }
        Update: {
          class_id?: string
          subject_id?: string
          title?: string
          description?: string | null
          attachment_url?: string | null
          set_date?: string
          due_date?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          id: string
          school_id: string
          student_id: string
          class_id: string
          academic_year_id: string
          date: string
          status: 'present' | 'absent' | 'late' | 'excused'
          reason: string | null
          recorded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          student_id: string
          class_id: string
          academic_year_id: string
          date: string
          status: 'present' | 'absent' | 'late' | 'excused'
          reason?: string | null
          recorded_by: string
          created_at?: string
        }
        Update: {
          status?: 'present' | 'absent' | 'late' | 'excused'
          reason?: string | null
          recorded_by?: string
        }
        Relationships: []
      }
      fee_structures: {
        Row: {
          id: string
          school_id: string
          academic_year_id: string
          grade_id: string
          fee_type: string
          amount: number
          currency: string
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          academic_year_id: string
          grade_id: string
          fee_type: string
          amount: number
          currency?: string
          created_at?: string
        }
        Update: {
          fee_type?: string
          amount?: number
          currency?: string
        }
        Relationships: []
      }
      fee_ledger: {
        Row: {
          id: string
          school_id: string
          student_id: string
          academic_year_id: string
          fee_type: string
          amount_billed: number
          amount_paid: number
          due_date: string | null
          currency: string
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          student_id: string
          academic_year_id: string
          fee_type: string
          amount_billed: number
          amount_paid?: number
          due_date?: string | null
          currency?: string
          created_at?: string
        }
        Update: {
          fee_type?: string
          amount_billed?: number
          amount_paid?: number
          due_date?: string | null
          currency?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          school_id: string
          student_id: string
          ledger_id: string
          amount: number
          currency: string
          payment_method: 'ecocash' | 'zimswitch' | 'cash' | 'bank_transfer' | 'rtgs'
          reference_number: string | null
          receipt_number: string
          payment_date: string
          recorded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          student_id: string
          ledger_id: string
          amount: number
          currency?: string
          payment_method: 'ecocash' | 'zimswitch' | 'cash' | 'bank_transfer' | 'rtgs'
          reference_number?: string | null
          receipt_number: string
          payment_date: string
          recorded_by: string
          created_at?: string
        }
        Update: {
          amount?: number
          payment_method?: 'ecocash' | 'zimswitch' | 'cash' | 'bank_transfer' | 'rtgs'
          reference_number?: string | null
          payment_date?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          id: string
          school_id: string
          created_by: string
          academic_year_id: string
          title: string
          body: string
          audience: 'all' | 'parents' | 'students' | 'teachers' | 'class' | 'grade'
          target_class_id: string | null
          target_grade_id: string | null
          pinned: boolean
          published: boolean
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          created_by: string
          academic_year_id: string
          title: string
          body: string
          audience: 'all' | 'parents' | 'students' | 'teachers' | 'class' | 'grade'
          target_class_id?: string | null
          target_grade_id?: string | null
          pinned?: boolean
          published?: boolean
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          title?: string
          body?: string
          audience?: 'all' | 'parents' | 'students' | 'teachers' | 'class' | 'grade'
          target_class_id?: string | null
          target_grade_id?: string | null
          pinned?: boolean
          published?: boolean
          expires_at?: string | null
        }
        Relationships: []
      }
      report_cards: {
        Row: {
          id: string
          school_id: string
          student_id: string
          academic_year_id: string
          class_position: number | null
          total_students: number | null
          overall_average: number | null
          head_comment: string | null
          class_teacher_comment: string | null
          pdf_url: string | null
          generated_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          student_id: string
          academic_year_id: string
          class_position?: number | null
          total_students?: number | null
          overall_average?: number | null
          head_comment?: string | null
          class_teacher_comment?: string | null
          pdf_url?: string | null
          generated_at?: string | null
          created_at?: string
        }
        Update: {
          class_position?: number | null
          total_students?: number | null
          overall_average?: number | null
          head_comment?: string | null
          class_teacher_comment?: string | null
          pdf_url?: string | null
          generated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      get_user_school_id: {
        Args: Record<string, never>
        Returns: string
      }
      get_user_role: {
        Args: Record<string, never>
        Returns: string
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
