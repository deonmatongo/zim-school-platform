import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRouteContext, apiSuccess, apiError, requireRole } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const roleCheck = requireRole(ctx.role, ['admin'])
  if (roleCheck) return roleCheck

  const body = await request.json()
  const { email, password, first_name, last_name, role } = body

  if (!email || !password || !first_name || !last_name || !role) {
    return apiError('email, password, first_name, last_name, role are required', 400)
  }

  const allowedRoles = ['admin', 'teacher', 'parent']
  if (!allowedRoles.includes(role)) {
    return apiError('Invalid role', 400)
  }

  const admin = createAdminClient()

  // Create auth user
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    if (authError.message.includes('already registered')) return apiError('Email already in use', 409)
    return apiError(authError.message)
  }

  const userId = authData.user.id

  // Create user_profiles row
  const { error: profileError } = await admin
    .from('user_profiles')
    .insert({
      id: userId,
      school_id: ctx.schoolId,
      role,
      first_name,
      last_name,
      active: true,
    })

  if (profileError) {
    // Rollback auth user on failure
    await admin.auth.admin.deleteUser(userId)
    return apiError(profileError.message)
  }

  return apiSuccess({ id: userId, email, role }, undefined, 201)
}
