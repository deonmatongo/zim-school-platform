import { z } from 'zod'

export const StudentCreateSchema = z.object({
  reg_number: z.string().min(1).max(50),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  date_of_birth: z.string().date().optional().nullable(),
  gender: z.enum(['M', 'F']).optional().nullable(),
  class_id: z.string().uuid().optional().nullable(),
  boarding: z.boolean().default(false),
  medical_notes: z.string().max(1000).optional().nullable(),
  photo_url: z.string().url().optional().nullable(),
  user_id: z.string().uuid().optional().nullable(),
})

export const StudentUpdateSchema = StudentCreateSchema.partial()
