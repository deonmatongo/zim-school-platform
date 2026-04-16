import { z } from 'zod'

const HomeworkBaseSchema = z.object({
  class_id: z.string().uuid(),
  subject_id: z.string().uuid(),
  academic_year_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  attachment_url: z.string().url().optional().nullable(),
  set_date: z.string().date(),
  due_date: z.string().date(),
})

const dateRefine = (data: Partial<z.infer<typeof HomeworkBaseSchema>>) =>
  !data.due_date || !data.set_date || data.due_date >= data.set_date

export const HomeworkCreateSchema = HomeworkBaseSchema.refine(dateRefine, {
  message: 'Due date must be on or after set date',
  path: ['due_date'],
})
export const HomeworkUpdateSchema = HomeworkBaseSchema.partial().refine(dateRefine, {
  message: 'Due date must be on or after set date',
  path: ['due_date'],
})
