import { z } from 'zod'

export const PaymentCreateSchema = z.object({
  student_id: z.string().uuid(),
  ledger_id: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.enum(['USD', 'ZIG']).default('USD'),
  payment_method: z.enum(['ecocash', 'zimswitch', 'cash', 'bank_transfer', 'rtgs']),
  reference_number: z.string().max(100).optional().nullable(),
  payment_date: z.string().date(),
})

export const FeeLedgerCreateSchema = z.object({
  student_id: z.string().uuid(),
  academic_year_id: z.string().uuid(),
  fee_type: z.string().min(1).max(100),
  amount_billed: z.number().positive(),
  currency: z.enum(['USD', 'ZIG']).default('USD'),
  due_date: z.string().date().optional().nullable(),
})

export const FeeStructureCreateSchema = z.object({
  academic_year_id: z.string().uuid(),
  grade_id: z.string().uuid(),
  fee_type: z.string().min(1).max(100),
  amount: z.number().positive(),
  currency: z.enum(['USD', 'ZIG']).default('USD'),
})
