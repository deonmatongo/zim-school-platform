import { z } from 'zod'

export const HomeworkCreateSchema = z.object({
  class_id: z.string().uuid(),
  subject_id: z.string().uuid(),
  academic_year_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  attachment_url: z.string().url().optional().nullable(),
  set_date: z.string().date(),
  due_date: z.string().date(),
}).refine(data => data.due_date >= data.set_date, {
  message: 'Due date must be on or after set date',
  path: ['due_date'],
})

export const HomeworkUpdateSchema = HomeworkCreateSchema.partial()
