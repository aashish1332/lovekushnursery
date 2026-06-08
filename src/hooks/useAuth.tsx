import { useState, useEffect, createContext, useContext, useCallback, ReactNode } from 'react'

interface User {
  id: string
  phone: string
  name: string | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  state: string | null
  pincode: string | null
  country: string | null
  profileComplete: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  loginWithPhone: (phone: string) => Promise<{ profileComplete: boolean; isNewUser: boolean }>
  logout: () => Promise<void>
  updateUser: (user: User) => void
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/user`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setUser(data.data)
          return
        }
      }
      setUser(null)
    } catch {
      setUser(null)
    }
  }, [])

  // Check session on mount
  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const loginWithPhone = useCallback(async (phone: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ phone }),
    })

    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Login failed')
    }

    setUser(data.data.user)
    return {
      profileComplete: data.data.user.profileComplete,
      isNewUser: data.data.isNewUser,
    }
  }, [])

  const logout = useCallback(async () => {
    await fetch(`${API_BASE}/api/auth/user/logout`, {
      method: 'POST',
      credentials: 'include',
    })
    setUser(null)
  }, [])

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, loginWithPhone, logout, updateUser, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? '' : 'http://localhost:3001')
