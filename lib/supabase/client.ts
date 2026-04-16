import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'
import { createMockClient } from './mock'

export function createClient() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL === '' || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return createMockClient() as any
  }
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
