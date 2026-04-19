import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface AuthUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'parent'
}

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const DEMO_CREDENTIALS: Record<string, { password: string; user: AuthUser }> = {
  'parent@zimschools.dev': {
    password: 'demo1234',
    user: { id: 'dev-parent', firstName: 'Demo', lastName: 'Parent', email: 'parent@zimschools.dev', role: 'parent' },
  },
}

const AUTH_KEY = 'zimschool_auth_user'

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: false,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const signIn = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 400)) // brief UX delay

    const match = DEMO_CREDENTIALS[email.toLowerCase().trim()]
    if (!match) {
      setIsLoading(false)
      return { error: 'No account found with that email.' }
    }
    if (match.password !== password) {
      setIsLoading(false)
      return { error: 'Incorrect password. Use demo1234 for demo accounts.' }
    }

    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(match.user))
    setUser(match.user)
    setIsLoading(false)
    return { error: null }
  }, [])

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(AUTH_KEY)
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, isLoading, signIn, signOut }), [user, isLoading, signIn, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

export async function loadStoredUser(): Promise<AuthUser | null> {
  try {
    const raw = await AsyncStorage.getItem(AUTH_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
