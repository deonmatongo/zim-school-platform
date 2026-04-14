import { z } from 'zod'

export const AnnouncementCreateSchema = z.object({
  academic_year_id: z.string().uuid(),
  title: z.string().min(1).max(300),
  body: z.string().min(1).max(5000),
  audience: z.enum(['all', 'parents', 'students', 'teachers', 'class', 'grade']),
  target_class_id: z.string().uuid().optional().nullable(),
  target_grade_id: z.string().uuid().optional().nullable(),
  pinned: z.boolean().default(false),
  published: z.boolean().default(false),
  expires_at: z.string().datetime().optional().nullable(),
}).refine(
  data => {
    if (data.audience === 'class') return !!data.target_class_id
    if (data.audience === 'grade') return !!data.target_grade_id
    return true
  },
  { message: 'target_class_id required for class audience; target_grade_id required for grade audience' }
)

export const AnnouncementUpdateSchema = AnnouncementCreateSchema.partial()
