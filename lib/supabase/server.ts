import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'
import { createMockClient } from './mock'

const VALID_ROLES = ['admin', 'teacher', 'parent', 'student']

export function createClient() {
  // Skip real Supabase client for dev/demo mode (env var OR dev_role cookie)
  if (process.env.DEV_BYPASS === 'true') return createMockClient() as any
  try {
    const cookieStore = cookies()
    const devRole = cookieStore.get('dev_role')?.value
    if (devRole && VALID_ROLES.includes(devRole)) return createMockClient() as any

    return createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // setAll called from Server Component — safe to ignore
            }
          },
        },
      }
    )
  } catch {
    return createMockClient() as any
  }
}
