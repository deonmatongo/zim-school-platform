import { requireSession } from '@/lib/auth/getSession'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { AuthProvider } from '@/context/AuthContext'
import { Toaster } from '@/components/ui/sonner'
import type { ReactNode } from 'react'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireSession()

  // Fetch school branding (skip in dev bypass mode)
  let schoolName = 'St. George\'s College'
  let primaryColor = '#1a5276'
  if (process.env.DEV_BYPASS !== 'true') {
    const supabase = createClient()
    const { data: school } = await supabase
      .from('schools')
      .select('name, primary_color, accent_color, logo_url')
      .eq('id', user.schoolId)
      .single()
    schoolName = school?.name ?? 'ZimSchool'
    primaryColor = school?.primary_color ?? '#1a5276'
  }

  return (
    <AuthProvider initialUser={user}>
      <div className="flex h-screen overflow-hidden" style={{ background: '#f1f5f9' }}>
        <Sidebar schoolName={schoolName} primaryColor={primaryColor} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header schoolName={schoolName} primaryColor={primaryColor} />
          <main className="flex-1 overflow-y-auto p-5 lg:p-7">
            {children}
          </main>
        </div>
      </div>
      <Toaster richColors position="top-right" />
    </AuthProvider>
  )
}
