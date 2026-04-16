import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { PaymentCreateSchema } from '@/lib/validators/fees'
import { getRouteContext, parseBody, apiSuccess, apiError, requireRole } from '@/lib/api-helpers'
import { generateReceiptNumber, applyPaymentToLedger } from '@/lib/services/fees'
import { devMock } from '@/lib/dev/mock-handler'

export async function POST(request: NextRequest) {
  const mock = devMock(request, 'fees/payment:POST'); if (mock) return mock
  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const roleCheck = requireRole(ctx.role, ['admin'])
  if (roleCheck) return roleCheck

  const parsed = await parseBody(request, PaymentCreateSchema)
  if ('response' in parsed) return parsed.response

  const admin = createAdminClient()

  // Verify ledger row belongs to this school
  const { data: ledger } = await admin
    .from('fee_ledger')
    .select('id, amount_billed, amount_paid, student_id')
    .eq('id', parsed.data.ledger_id)
    .eq('school_id', ctx.schoolId)
    .single()

  if (!ledger) return apiError('Ledger entry not found', 404)

  const receiptNumber = await generateReceiptNumber(ctx.schoolId)

  // Record payment
  const { data: payment, error } = await admin
    .from('payments')
    .insert({
      ...parsed.data,
      school_id: ctx.schoolId,
      receipt_number: receiptNumber,
      recorded_by: ctx.userId,
    })
    .select()
    .single()

  if (error) return apiError(error.message)

  // Update ledger amount_paid
  await applyPaymentToLedger(parsed.data.ledger_id, parsed.data.amount)

  return apiSuccess(payment, undefined, 201)
}

export async function GET(request: NextRequest) {
  const mock = devMock(request, 'fees/payment:GET'); if (mock) return mock
  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const roleCheck = requireRole(ctx.role, ['admin'])
  if (roleCheck) return roleCheck

  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get('student_id')
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const admin = createAdminClient()

  let query = admin
    .from('payments')
    .select('*, students(first_name, last_name, reg_number), user_profiles(first_name, last_name)')
    .eq('school_id', ctx.schoolId)
    .order('payment_date', { ascending: false })

  if (studentId) query = query.eq('student_id', studentId)
  if (from) query = query.gte('payment_date', from)
  if (to) query = query.lte('payment_date', to)

  const { data, error } = await query
  if (error) return apiError(error.message)
  return apiSuccess(data)
}
