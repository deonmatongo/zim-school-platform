-- ============================================================
-- ZimSchool Platform — Initial Schema
-- Run this in Supabase SQL Editor (or via supabase db push)
-- ============================================================

-- ── Core tables ───────────────────────────────────────────────

CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#1a5276',
  accent_color TEXT DEFAULT '#e67e22',
  motto TEXT,
  district TEXT,
  province TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  ecocash_number TEXT,
  zimswitch_account TEXT,
  currency TEXT DEFAULT 'USD',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  term INTEGER NOT NULL CHECK (term IN (1,2,3)),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  grade_id UUID REFERENCES grades(id),
  academic_year_id UUID REFERENCES academic_years(id),
  name TEXT NOT NULL,
  homeroom_teacher_id UUID,
  capacity INTEGER DEFAULT 40,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  zimsec_code TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin','teacher','parent','student')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  sms_opt_in BOOLEAN DEFAULT true,
  avatar_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id),
  reg_number TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('M','F')),
  class_id UUID REFERENCES classes(id),
  boarding BOOLEAN DEFAULT false,
  medical_notes TEXT,
  photo_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(school_id, reg_number)
);

CREATE TABLE parent_student (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  relationship TEXT DEFAULT 'parent',
  is_primary BOOLEAN DEFAULT true,
  UNIQUE(parent_id, student_id)
);

CREATE TABLE teacher_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  academic_year_id UUID REFERENCES academic_years(id),
  UNIQUE(teacher_id, class_id, subject_id, academic_year_id)
);

CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id),
  subject_id UUID REFERENCES subjects(id),
  academic_year_id UUID REFERENCES academic_years(id),
  created_by UUID REFERENCES user_profiles(id),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('test','exam','class_assessment','practical','project')),
  max_marks INTEGER NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE marks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  raw_score NUMERIC(5,2),
  grade_letter TEXT,
  teacher_comment TEXT,
  entered_by UUID REFERENCES user_profiles(id),
  entered_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(assessment_id, student_id)
);

CREATE TABLE homework (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id),
  subject_id UUID REFERENCES subjects(id),
  academic_year_id UUID REFERENCES academic_years(id),
  created_by UUID REFERENCES user_profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  attachment_url TEXT,
  set_date DATE NOT NULL,
  due_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id),
  academic_year_id UUID REFERENCES academic_years(id),
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present','absent','late','excused')),
  reason TEXT,
  recorded_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, date)
);

CREATE TABLE fee_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  academic_year_id UUID REFERENCES academic_years(id),
  grade_id UUID REFERENCES grades(id),
  fee_type TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE fee_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  academic_year_id UUID REFERENCES academic_years(id),
  fee_type TEXT NOT NULL,
  amount_billed NUMERIC(10,2) NOT NULL,
  amount_paid NUMERIC(10,2) DEFAULT 0,
  due_date DATE,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  ledger_id UUID REFERENCES fee_ledger(id),
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT CHECK (payment_method IN ('ecocash','zimswitch','cash','bank_transfer','rtgs')),
  reference_number TEXT,
  receipt_number TEXT UNIQUE,
  payment_date DATE NOT NULL,
  recorded_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  created_by UUID REFERENCES user_profiles(id),
  academic_year_id UUID REFERENCES academic_years(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  audience TEXT NOT NULL CHECK (audience IN ('all','parents','students','teachers','class','grade')),
  target_class_id UUID REFERENCES classes(id),
  target_grade_id UUID REFERENCES grades(id),
  pinned BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE report_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  academic_year_id UUID REFERENCES academic_years(id),
  class_position INTEGER,
  total_students INTEGER,
  overall_average NUMERIC(5,2),
  head_comment TEXT,
  class_teacher_comment TEXT,
  pdf_url TEXT,
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, academic_year_id)
);

-- ── Deferred FK ───────────────────────────────────────────────

ALTER TABLE classes ADD CONSTRAINT classes_homeroom_teacher_fk
  FOREIGN KEY (homeroom_teacher_id) REFERENCES user_profiles(id);

-- ── Indexes ───────────────────────────────────────────────────

CREATE INDEX idx_students_school ON students(school_id);
CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_marks_assessment ON marks(assessment_id);
CREATE INDEX idx_marks_student ON marks(student_id);
CREATE INDEX idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX idx_fee_ledger_student ON fee_ledger(student_id);
CREATE INDEX idx_announcements_school ON announcements(school_id, published);
CREATE INDEX idx_teacher_assignments ON teacher_assignments(teacher_id);
CREATE INDEX idx_academic_years_school_current ON academic_years(school_id, is_current);
CREATE INDEX idx_payments_school ON payments(school_id);

-- ── Helper functions ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_user_school_id()
RETURNS UUID AS $$
  SELECT school_id FROM user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── Row Level Security ────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_student ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_cards ENABLE ROW LEVEL SECURITY;

-- ── schools ──────────────────────────────────────────────────
CREATE POLICY "schools_select" ON schools FOR SELECT
  USING (id = get_user_school_id());

CREATE POLICY "schools_admin_all" ON schools FOR ALL
  USING (id = get_user_school_id() AND get_user_role() = 'admin')
  WITH CHECK (id = get_user_school_id() AND get_user_role() = 'admin');

-- ── academic_years ───────────────────────────────────────────
CREATE POLICY "academic_years_select" ON academic_years FOR SELECT
  USING (school_id = get_user_school_id());

CREATE POLICY "academic_years_admin" ON academic_years FOR ALL
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin')
  WITH CHECK (school_id = get_user_school_id() AND get_user_role() = 'admin');

-- ── grades ───────────────────────────────────────────────────
CREATE POLICY "grades_select" ON grades FOR SELECT
  USING (school_id = get_user_school_id());

CREATE POLICY "grades_admin" ON grades FOR ALL
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin')
  WITH CHECK (school_id = get_user_school_id() AND get_user_role() = 'admin');

-- ── classes ──────────────────────────────────────────────────
CREATE POLICY "classes_select" ON classes FOR SELECT
  USING (school_id = get_user_school_id());

CREATE POLICY "classes_admin" ON classes FOR ALL
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin')
  WITH CHECK (school_id = get_user_school_id() AND get_user_role() = 'admin');

-- ── subjects ─────────────────────────────────────────────────
CREATE POLICY "subjects_select" ON subjects FOR SELECT
  USING (school_id = get_user_school_id());

CREATE POLICY "subjects_admin" ON subjects FOR ALL
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin')
  WITH CHECK (school_id = get_user_school_id() AND get_user_role() = 'admin');

-- ── user_profiles ────────────────────────────────────────────
CREATE POLICY "profiles_select_own_school" ON user_profiles FOR SELECT
  USING (school_id = get_user_school_id());

CREATE POLICY "profiles_select_own" ON user_profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "profiles_update_own" ON user_profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_admin" ON user_profiles FOR ALL
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin')
  WITH CHECK (school_id = get_user_school_id() AND get_user_role() = 'admin');

-- ── students ─────────────────────────────────────────────────
-- Admin/teacher: all students in school
CREATE POLICY "students_admin_teacher_select" ON students FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND get_user_role() IN ('admin', 'teacher')
  );

-- Parents: only their children
CREATE POLICY "students_parent_select" ON students FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND get_user_role() = 'parent'
    AND id IN (
      SELECT student_id FROM parent_student WHERE parent_id = auth.uid()
    )
  );

-- Students: own record only
CREATE POLICY "students_self_select" ON students FOR SELECT
  USING (user_id = auth.uid());

-- Admin write
CREATE POLICY "students_admin_write" ON students FOR ALL
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin')
  WITH CHECK (school_id = get_user_school_id() AND get_user_role() = 'admin');

-- ── parent_student ───────────────────────────────────────────
CREATE POLICY "parent_student_parent_select" ON parent_student FOR SELECT
  USING (parent_id = auth.uid());

CREATE POLICY "parent_student_admin" ON parent_student FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- ── teacher_assignments ──────────────────────────────────────
CREATE POLICY "teacher_assignments_select" ON teacher_assignments FOR SELECT
  USING (
    teacher_id = auth.uid()
    OR get_user_role() = 'admin'
  );

CREATE POLICY "teacher_assignments_admin" ON teacher_assignments FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- ── assessments ──────────────────────────────────────────────
CREATE POLICY "assessments_select" ON assessments FOR SELECT
  USING (school_id = get_user_school_id());

CREATE POLICY "assessments_teacher_write" ON assessments FOR INSERT
  WITH CHECK (
    school_id = get_user_school_id()
    AND get_user_role() IN ('admin', 'teacher')
    AND (
      get_user_role() = 'admin'
      OR EXISTS (
        SELECT 1 FROM teacher_assignments ta
        WHERE ta.teacher_id = auth.uid()
          AND ta.class_id = assessments.class_id
          AND ta.subject_id = assessments.subject_id
      )
    )
  );

CREATE POLICY "assessments_teacher_update" ON assessments FOR UPDATE
  USING (
    school_id = get_user_school_id()
    AND get_user_role() IN ('admin', 'teacher')
  );

CREATE POLICY "assessments_admin_delete" ON assessments FOR DELETE
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

-- ── marks ────────────────────────────────────────────────────
CREATE POLICY "marks_admin_teacher_select" ON marks FOR SELECT
  USING (school_id = get_user_school_id() AND get_user_role() IN ('admin', 'teacher'));

CREATE POLICY "marks_parent_select" ON marks FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND get_user_role() = 'parent'
    AND student_id IN (
      SELECT student_id FROM parent_student WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "marks_student_select" ON marks FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND get_user_role() = 'student'
    AND student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

CREATE POLICY "marks_teacher_write" ON marks FOR INSERT
  WITH CHECK (
    school_id = get_user_school_id()
    AND get_user_role() IN ('admin', 'teacher')
  );

CREATE POLICY "marks_teacher_update" ON marks FOR UPDATE
  USING (school_id = get_user_school_id() AND get_user_role() IN ('admin', 'teacher'));

-- ── homework ─────────────────────────────────────────────────
CREATE POLICY "homework_select" ON homework FOR SELECT
  USING (school_id = get_user_school_id());

CREATE POLICY "homework_teacher_write" ON homework FOR ALL
  USING (
    school_id = get_user_school_id()
    AND get_user_role() IN ('admin', 'teacher')
  )
  WITH CHECK (
    school_id = get_user_school_id()
    AND get_user_role() IN ('admin', 'teacher')
  );

-- ── attendance ───────────────────────────────────────────────
CREATE POLICY "attendance_admin_teacher_select" ON attendance FOR SELECT
  USING (school_id = get_user_school_id() AND get_user_role() IN ('admin', 'teacher'));

CREATE POLICY "attendance_parent_select" ON attendance FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND get_user_role() = 'parent'
    AND student_id IN (
      SELECT student_id FROM parent_student WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "attendance_student_select" ON attendance FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND get_user_role() = 'student'
    AND student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

CREATE POLICY "attendance_teacher_write" ON attendance FOR ALL
  USING (school_id = get_user_school_id() AND get_user_role() IN ('admin', 'teacher'))
  WITH CHECK (school_id = get_user_school_id() AND get_user_role() IN ('admin', 'teacher'));

-- ── fee_structures ───────────────────────────────────────────
CREATE POLICY "fee_structures_select" ON fee_structures FOR SELECT
  USING (school_id = get_user_school_id());

CREATE POLICY "fee_structures_admin" ON fee_structures FOR ALL
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin')
  WITH CHECK (school_id = get_user_school_id() AND get_user_role() = 'admin');

-- ── fee_ledger ───────────────────────────────────────────────
CREATE POLICY "fee_ledger_admin_teacher_select" ON fee_ledger FOR SELECT
  USING (school_id = get_user_school_id() AND get_user_role() IN ('admin', 'teacher'));

CREATE POLICY "fee_ledger_parent_select" ON fee_ledger FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND get_user_role() = 'parent'
    AND student_id IN (
      SELECT student_id FROM parent_student WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "fee_ledger_admin_write" ON fee_ledger FOR ALL
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin')
  WITH CHECK (school_id = get_user_school_id() AND get_user_role() = 'admin');

-- ── payments ─────────────────────────────────────────────────
CREATE POLICY "payments_admin_select" ON payments FOR SELECT
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "payments_admin_write" ON payments FOR ALL
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin')
  WITH CHECK (school_id = get_user_school_id() AND get_user_role() = 'admin');

-- ── announcements ────────────────────────────────────────────
CREATE POLICY "announcements_select_published" ON announcements FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND published = true
    AND (expires_at IS NULL OR expires_at > now())
  );

CREATE POLICY "announcements_admin_teacher_write" ON announcements FOR ALL
  USING (school_id = get_user_school_id() AND get_user_role() IN ('admin', 'teacher'))
  WITH CHECK (school_id = get_user_school_id() AND get_user_role() IN ('admin', 'teacher'));

-- ── report_cards ─────────────────────────────────────────────
CREATE POLICY "report_cards_admin_select" ON report_cards FOR SELECT
  USING (school_id = get_user_school_id() AND get_user_role() IN ('admin', 'teacher'));

CREATE POLICY "report_cards_parent_select" ON report_cards FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND get_user_role() = 'parent'
    AND student_id IN (
      SELECT student_id FROM parent_student WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "report_cards_student_select" ON report_cards FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND get_user_role() = 'student'
    AND student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

CREATE POLICY "report_cards_admin_write" ON report_cards FOR ALL
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin')
  WITH CHECK (school_id = get_user_school_id() AND get_user_role() = 'admin');
