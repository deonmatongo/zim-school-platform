'use client'

import { createContext, useContext, useCallback, useMemo, useRef, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Role } from '@/lib/auth/roles'

interface AuthUser {
  id: string
  email: string
  schoolId: string
  role: Role
  firstName: string
  lastName: string
  avatarUrl: string | null
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: false,
  signOut: async () => {},
})

export function AuthProvider({ children, initialUser }: { children: ReactNode; initialUser: AuthUser | null }) {
  const [user, setUser] = useState<AuthUser | null>(initialUser)
  // Stable client ref — never recreated between renders
  const supabaseRef = useRef(createClient())

  const signOut = useCallback(async () => {
    await supabaseRef.current.auth.signOut()
    setUser(null)
    window.location.href = '/login'
  }, [])

  // Memoize context value so consumers only re-render when user/signOut actually changes
  const value = useMemo(
    () => ({ user, loading: false, signOut }),
    [user, signOut]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
