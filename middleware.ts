import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'

const ADMIN_ONLY_PATTERNS = [
  /^\/api\/schools(\/.*)?$/,
  /^\/api\/fees\/payment/,
  /^\/api\/fees\/summary/,
  /^\/api\/notifications\/sms/,
  /^\/dashboard\/admin(\/.*)?$/,
]

const TEACHER_OR_ABOVE = [
  /^\/api\/marks/,
  /^\/api\/homework/,
  /^\/api\/attendance/,
  /^\/api\/assessments/,
  /^\/api\/announcements/,
]

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request })

  // ── Dev bypass (no Supabase credentials) ─────────────────────────────────
  if (process.env.DEV_BYPASS === 'true') {
    const schoolId = process.env.DEV_SCHOOL_ID ?? 'dev-school'
    const devRole = request.cookies.get('dev_role')?.value ?? 'admin'
    const validRoles = ['admin', 'teacher', 'parent', 'student']
    const role = validRoles.includes(devRole) ? devRole : 'admin'
    response.headers.set('x-user-role', role)
    response.headers.set('x-user-id', `dev-${role}`)
    response.headers.set('x-school-id', schoolId)
    return response
  }

  const supabase = createMiddlewareClient(request, response)

  // ── Tenant resolution ────────────────────────────────────────────────────
  const host = request.headers.get('host') ?? ''
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'localhost'
  const subdomain = host.replace(`.${appDomain}`, '').split(':')[0]

  // Attach school slug to request headers for downstream consumption
  if (subdomain && subdomain !== appDomain && !subdomain.includes('localhost')) {
    response.headers.set('x-school-slug', subdomain)
  }

  // ── Session check ────────────────────────────────────────────────────────
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const pathname = request.nextUrl.pathname
  const isApiRoute = pathname.startsWith('/api/')
  const isDashboard = pathname.startsWith('/dashboard/')
  const isProtected = isApiRoute || isDashboard
  const isAuthRoute = pathname.startsWith('/api/auth/')

  if (isAuthRoute) return response

  if (isProtected && !session) {
    if (isApiRoute) {
      return NextResponse.json({ data: null, error: 'Unauthorised' }, { status: 401 })
    }
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (!session) return response

  // ── Role resolution ──────────────────────────────────────────────────────
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, school_id')
    .eq('id', session.user.id)
    .single()

  if (!profile && isProtected) {
    return NextResponse.json({ data: null, error: 'User profile not found' }, { status: 403 })
  }

  const role = profile?.role ?? 'student'
  response.headers.set('x-user-role', role)
  response.headers.set('x-user-id', session.user.id)
  if (profile?.school_id) response.headers.set('x-school-id', profile.school_id)

  // ── Admin-only route guard ───────────────────────────────────────────────
  if (ADMIN_ONLY_PATTERNS.some(p => p.test(pathname)) && role !== 'admin') {
    if (isApiRoute) {
      return NextResponse.json({ data: null, error: 'Forbidden — admin only' }, { status: 403 })
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // ── Teacher-or-above write guard (POST/PUT/PATCH/DELETE) ─────────────────
  if (
    TEACHER_OR_ABOVE.some(p => p.test(pathname)) &&
    ['parent', 'student'].includes(role) &&
    ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)
  ) {
    return NextResponse.json({ data: null, error: 'Forbidden — insufficient role' }, { status: 403 })
  }

  return response
}

export const config = {
  matcher: ['/api/:path*', '/dashboard', '/dashboard/:path*'],
}
