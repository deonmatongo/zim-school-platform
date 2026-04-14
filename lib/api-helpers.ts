import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { UserProfile, School } from '@/types/api'
import type { ApiResponse } from '@/types/api'
import type { ZodSchema } from 'zod'

export interface RouteContext {
  userId: string
  role: UserProfile['role']
  schoolId: string
  school: School
}

/**
 * Extract and validate route context from request headers (set by middleware).
 */
export function getRouteContext(request: NextRequest): RouteContext | null {
  const userId = request.headers.get('x-user-id')
  const role = request.headers.get('x-user-role') as UserProfile['role'] | null
  const schoolId = request.headers.get('x-school-id')

  if (!userId || !role || !schoolId) return null

  return { userId, role, schoolId, school: {} as School }
}

/**
 * Resolve school_id from subdomain slug header (fallback to x-school-id).
 */
export async function resolveSchoolId(request: NextRequest): Promise<string | null> {
  const fromHeader = request.headers.get('x-school-id')
  if (fromHeader) return fromHeader

  const slug = request.headers.get('x-school-slug')
  if (!slug) return null

  const admin = createAdminClient()
  const { data } = await admin.from('schools').select('id').eq('slug', slug).single()
  return data?.id ?? null
}

/**
 * Parse and validate request body with a Zod schema.
 * Returns parsed data or throws a 400 JSON response.
 */
export async function parseBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<{ data: T } | { response: NextResponse }> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return { response: apiError('Invalid JSON body', 400) }
  }

  const result = schema.safeParse(body)
  if (!result.success) {
    return {
      response: apiError(
        result.error.issues.map(e => `${String(e.path.join('.'))}: ${e.message}`).join('; '),
        422
      ),
    }
  }

  return { data: result.data }
}

/**
 * Standard success response.
 */
export function apiSuccess<T>(data: T, meta?: ApiResponse['meta'], status = 200): NextResponse {
  return NextResponse.json({ data, error: null, meta } satisfies ApiResponse<T>, { status })
}

/**
 * Standard error response.
 */
export function apiError(message: string, status = 500): NextResponse {
  return NextResponse.json({ data: null, error: message, meta: undefined } satisfies ApiResponse, { status })
}

/**
 * Role check — returns 403 response if user role not in allowed list.
 */
export function requireRole(
  role: UserProfile['role'],
  allowed: UserProfile['role'][]
): NextResponse | null {
  if (!allowed.includes(role)) {
    return apiError('Forbidden — insufficient role', 403)
  }
  return null
}
