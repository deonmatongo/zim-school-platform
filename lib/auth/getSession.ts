import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers, cookies } from 'next/headers'
import type { Role } from './roles'

const SCHOOL_ID = process.env.DEV_SCHOOL_ID ?? 'dev-school'
const VALID_ROLES = ['admin', 'teacher', 'parent', 'student']

const DEV_USERS: Record<string, SessionUser> = {
  admin:   { id: 'dev-admin',   email: 'admin@zimschools.dev',   schoolId: SCHOOL_ID, role: 'admin',   firstName: 'Dev',       lastName: 'Admin',    avatarUrl: null },
  teacher: { id: 'teacher-1',   email: 'teacher@zimschools.dev', schoolId: SCHOOL_ID, role: 'teacher', firstName: 'Grace',     lastName: 'Mutasa',   avatarUrl: null },
  parent:  { id: 'dev-parent',  email: 'parent@zimschools.dev',  schoolId: SCHOOL_ID, role: 'parent',  firstName: 'Demo',      lastName: 'Parent',   avatarUrl: null },
  student: { id: 'stu-01',      email: 'student@zimschools.dev', schoolId: SCHOOL_ID, role: 'student', firstName: 'Takudzwa',  lastName: 'Moyo',     avatarUrl: null },
}

function getDevUser(): SessionUser {
  try {
    // 1st: try header set by middleware (most reliable when headers propagate)
    const headerRole = headers().get('x-user-role')
    if (headerRole && VALID_ROLES.includes(headerRole)) return DEV_USERS[headerRole]

    // 2nd: fall back to reading the cookie directly in the server component
    const cookieRole = cookies().get('dev_role')?.value
    if (cookieRole && VALID_ROLES.includes(cookieRole)) return DEV_USERS[cookieRole]
  } catch {
    // headers()/cookies() unavailable in this context — use default
  }
  return DEV_USERS.admin
}

export interface SessionUser {
  id: string
  email: string
  schoolId: string
  role: Role
  firstName: string
  lastName: string
  avatarUrl: string | null
}

export async function getSession(): Promise<SessionUser | null> {
  // Cookie-based dev mode — works regardless of env vars
  try {
    const cookieRole = cookies().get('dev_role')?.value
    if (cookieRole && VALID_ROLES.includes(cookieRole)) return DEV_USERS[cookieRole]
  } catch { /* ignore if cookies() unavailable */ }

  if (process.env.DEV_BYPASS === 'true') return getDevUser()
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, school_id, first_name, last_name, avatar_url')
    .eq('id', session.user.id)
    .single()

  if (!profile) return null

  return {
    id: session.user.id,
    email: session.user.email ?? '',
    schoolId: profile.school_id,
    role: profile.role as Role,
    firstName: profile.first_name,
    lastName: profile.last_name,
    avatarUrl: profile.avatar_url,
  }
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession()
  if (!session) redirect('/login')
  return session
}

export async function requireRole(allowed: Role[]): Promise<SessionUser> {
  const session = await requireSession()
  if (!allowed.includes(session.role)) redirect('/dashboard')
  return session
}
