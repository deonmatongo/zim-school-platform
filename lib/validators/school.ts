import { z } from 'zod'

export const SchoolCreateSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  logo_url: z.string().url().optional().nullable(),
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#1a5276'),
  accent_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#e67e22'),
  motto: z.string().max(300).optional().nullable(),
  district: z.string().max(100).optional().nullable(),
  province: z.string().max(100).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email().optional().nullable(),
  ecocash_number: z.string().max(20).optional().nullable(),
  zimswitch_account: z.string().max(50).optional().nullable(),
  currency: z.enum(['USD', 'ZIG']).default('USD'),
})

export const SchoolUpdateSchema = SchoolCreateSchema.partial()
