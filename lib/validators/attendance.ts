import { z } from 'zod'

export const AttendanceEntrySchema = z.object({
  student_id: z.string().uuid(),
  status: z.enum(['present', 'absent', 'late', 'excused']),
  reason: z.string().max(500).optional(),
})

export const BulkAttendanceSchema = z.object({
  class_id: z.string().uuid(),
  academic_year_id: z.string().uuid(),
  date: z.string().date(),
  records: z.array(AttendanceEntrySchema).min(1),
})
