import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import type { Role } from './roles'

const SCHOOL_ID = process.env.DEV_SCHOOL_ID ?? 'dev-school'

const DEV_USERS: Record<string, SessionUser> = {
  admin:   { id: 'dev-admin',   email: 'admin@zimschools.dev',   schoolId: SCHOOL_ID, role: 'admin',   firstName: 'Dev',       lastName: 'Admin'   },
  teacher: { id: 'teacher-1',   email: 'teacher@zimschools.dev', schoolId: SCHOOL_ID, role: 'teacher', firstName: 'Grace',     lastName: 'Mutasa'  },
  parent:  { id: 'dev-parent',  email: 'parent@zimschools.dev',  schoolId: SCHOOL_ID, role: 'parent',  firstName: 'Demo',      lastName: 'Parent'  },
  student: { id: 'stu-01',      email: 'student@zimschools.dev', schoolId: SCHOOL_ID, role: 'student', firstName: 'Takudzwa',  lastName: 'Moyo'    },
}

function getDevUser(): SessionUser {
  try {
    const role = headers().get('x-user-role') ?? 'admin'
    return DEV_USERS[role] ?? DEV_USERS.admin
  } catch {
    return DEV_USERS.admin
  }
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
