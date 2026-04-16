'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { Loader2, GraduationCap, Shield, BookOpen, Users, Eye, EyeOff, ChevronRight } from 'lucide-react'

const DEMO_CREDENTIALS = [
  {
    role: 'Admin',
    email: 'admin@stgeorges.dev',
    password: 'demo1234',
    description: 'Full access to all features',
    icon: Shield,
    gradient: 'from-blue-500 to-indigo-600',
    pill: 'bg-blue-100 text-blue-700',
    border: 'border-blue-200 hover:border-blue-400',
    iconBg: 'bg-blue-100 text-blue-600',
  },
  {
    role: 'Teacher',
    email: 'teacher@stgeorges.dev',
    password: 'demo1234',
    description: 'Classes, marks & attendance',
    icon: BookOpen,
    gradient: 'from-violet-500 to-purple-600',
    pill: 'bg-violet-100 text-violet-700',
    border: 'border-violet-200 hover:border-violet-400',
    iconBg: 'bg-violet-100 text-violet-600',
  },
  {
    role: 'Parent',
    email: 'parent@stgeorges.dev',
    password: 'demo1234',
    description: 'Child progress & announcements',
    icon: Users,
    gradient: 'from-emerald-500 to-teal-600',
    pill: 'bg-emerald-100 text-emerald-700',
    border: 'border-emerald-200 hover:border-emerald-400',
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
]

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [showPass, setShowPass] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }

    // In dev/mock mode, persist chosen role via cookie so middleware can set the right role header
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const roleMap: Record<string, string> = {
        'admin@stgeorges.dev':   'admin',
        'teacher@stgeorges.dev': 'teacher',
        'parent@stgeorges.dev':  'parent',
        'student@stgeorges.dev': 'student',
      }
      const role = roleMap[email.toLowerCase()] ?? 'admin'
      document.cookie = `dev_role=${role}; path=/; max-age=86400`
    }

    router.push('/dashboard')
    router.refresh()
  }

  function fillDemo(cred: typeof DEMO_CREDENTIALS[0]) {
    setEmail(cred.email)
    setPassword(cred.password)
    setError(null)
  }

  return (
    <div className="w-full max-w-4xl mx-auto grid lg:grid-cols-2 gap-6 items-start">

      {/* ── Left: Branding + demo cards ─────────────────────────── */}
      <div className="hidden lg:flex flex-col gap-6">
        {/* School brand */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-lg leading-tight">St George's College</p>
            <p className="text-slate-400 text-xs">School Management Portal</p>
          </div>
        </div>

        <div>
          <p className="text-slate-300 text-sm font-semibold mb-1">Manage everything in one place</p>
          <p className="text-slate-500 text-xs leading-relaxed">
            From attendance and marks to fees and announcements — the complete platform for Zimbabwe school administration.
          </p>
        </div>

        {/* Demo credential cards */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-slate-700" />
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Demo accounts</span>
            <div className="h-px flex-1 bg-slate-700" />
          </div>
          <div className="space-y-2.5">
            {DEMO_CREDENTIALS.map(cred => {
              const Icon = cred.icon
              const isActive = email === cred.email
              return (
                <button
                  key={cred.role}
                  type="button"
                  onClick={() => fillDemo(cred)}
                  className={`w-full text-left rounded-2xl border bg-slate-800/60 backdrop-blur-sm p-3.5 transition-all duration-200 group ${cred.border} ${isActive ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-blue-500' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-xl ${cred.iconBg} flex items-center justify-center shrink-0`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{cred.role}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cred.pill}`}>{cred.role}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{cred.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-300 shrink-0 transition-colors" />
                  </div>
                  <div className="mt-2.5 pl-12 flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="font-mono">{cred.email}</span>
                    <span>·</span>
                    <span className="font-mono">demo1234</span>
                  </div>
                </button>
              )
            })}
          </div>
          <p className="text-[11px] text-slate-600 mt-3 text-center">
            Click a card to auto-fill credentials
          </p>
        </div>
      </div>

      {/* ── Right: Sign-in form ──────────────────────────────────── */}
      <div className="bg-white rounded-3xl shadow-2xl shadow-black/30 p-8">
        {/* Mobile logo */}
        <div className="flex items-center gap-3 mb-7 lg:hidden">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-base leading-tight">St George's College</p>
            <p className="text-slate-400 text-xs">School Management Portal</p>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>
        <p className="text-sm text-slate-500 mb-7">Sign in to your school portal account</p>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
              <span className="mt-px">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email address</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@school.ac.zw"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="h-11 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</Label>
              <Link href="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-11 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-200 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-md shadow-blue-500/20 mt-2"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign in
          </Button>
        </form>

        {/* Mobile demo section */}
        <div className="mt-7 lg:hidden">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-slate-100" />
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Demo accounts</span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>
          <div className="space-y-2">
            {DEMO_CREDENTIALS.map(cred => {
              const Icon = cred.icon
              return (
                <button
                  key={cred.role}
                  type="button"
                  onClick={() => fillDemo(cred)}
                  className={`w-full flex items-center gap-3 text-left rounded-xl border p-3 bg-slate-50 transition-colors ${cred.border}`}
                >
                  <div className={`h-8 w-8 rounded-lg ${cred.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700">{cred.role}</p>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{cred.email}</p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                </button>
              )
            })}
          </div>
        </div>

        <p className="text-xs text-center text-slate-400 mt-6">
          Having trouble? Contact your school administrator.
        </p>
      </div>
    </div>
  )
}
