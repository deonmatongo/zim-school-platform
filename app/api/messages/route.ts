import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import { getRouteContext, parseBody, apiSuccess, apiError } from '@/lib/api-helpers'
import { devMock } from '@/lib/dev/mock-handler'

const SendMessageSchema = z.object({
  recipient_id: z.string().uuid(),
  student_id: z.string().uuid().optional().nullable(),
  thread_id: z.string().uuid().optional().nullable(),
  body: z.string().min(1).max(2000),
})

export async function GET(request: NextRequest) {
  const mock = devMock(request, 'messages:GET')
  if (mock) return mock

  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const { searchParams } = new URL(request.url)
  const threadId = searchParams.get('thread_id')

  const admin = createAdminClient()

  let query = admin
    .from('messages')
    .select('*, sender:user_profiles!sender_id(id, first_name, last_name, role), recipient:user_profiles!recipient_id(id, first_name, last_name, role), student:students(id, first_name, last_name)')
    .eq('school_id', ctx.schoolId)
    .or(`sender_id.eq.${ctx.userId},recipient_id.eq.${ctx.userId}`)
    .order('created_at', { ascending: true })

  if (threadId) query = (query as any).eq('thread_id', threadId)

  const { data, error } = await query
  if (error) return apiError(error.message)
  return apiSuccess(data)
}

export async function POST(request: NextRequest) {
  const mock = devMock(request, 'messages:POST')
  if (mock) return mock

  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const parsed = await parseBody(request, SendMessageSchema)
  if ('response' in parsed) return parsed.response

  const admin = createAdminClient()

  const { data, error } = await admin
    .from('messages')
    .insert({
      school_id: ctx.schoolId,
      sender_id: ctx.userId,
      ...parsed.data,
      thread_id: parsed.data.thread_id ?? crypto.randomUUID(),
    })
    .select()
    .single()

  if (error) return apiError(error.message)
  return apiSuccess(data, undefined, 201)
}
