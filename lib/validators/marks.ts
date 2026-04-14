import { z } from 'zod'

export const MarkEntrySchema = z.object({
  student_id: z.string().uuid(),
  raw_score: z.number().min(0).nullable(),
  teacher_comment: z.string().max(500).optional(),
})

export const BulkMarksSchema = z.object({
  assessment_id: z.string().uuid(),
  marks: z.array(MarkEntrySchema).min(1),
})

export const AssessmentCreateSchema = z.object({
  class_id: z.string().uuid(),
  subject_id: z.string().uuid(),
  academic_year_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  type: z.enum(['test', 'exam', 'class_assessment', 'practical', 'project']),
  max_marks: z.number().int().min(1).max(1000),
  date: z.string().date(),
})
