import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRouteContext, apiSuccess, apiError } from '@/lib/api-helpers'
import { devMock } from '@/lib/dev/mock-handler'

export async function GET(request: NextRequest) {
  const mock = devMock(request, 'grades:GET')
  if (mock) return mock

  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('grades')
    .select('id, name, level')
    .order('level')

  if (error) return apiError(error.message)
  return apiSuccess(data)
}
