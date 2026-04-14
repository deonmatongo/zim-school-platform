import { z } from 'zod'

export const SmsSchema = z.object({
  to: z.array(z.string().min(1)).min(1),
  message: z.string().min(1).max(160),
})

export const FeeReminderSchema = z.object({
  student_id: z.string().uuid(),
})

export const AbsenceAlertSchema = z.object({
  student_id: z.string().uuid(),
  date: z.string().date(),
})

export const BulkSmsSchema = z.object({
  announcement_id: z.string().uuid(),
})
