'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

type UserProfile = {
  id: string
  email: string | null
  name: string | null
  role: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  userProfile: UserProfile | null
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, userProfile: null })

export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode
  initialUser: User | null
}) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [loading, setLoading] = useState(!initialUser)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch user profile (role) when user changes
  useEffect(() => {
    if (!user) {
      setUserProfile(null)
      return
    }
    const supabase = createClient()
    supabase
      .from('users')
      .select('id, email, name, role')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setUserProfile(data as UserProfile)
        }
      })
  }, [user])

  return (
    <AuthContext.Provider value={{ user, loading, userProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export function useUserRole() {
  const { userProfile } = useContext(AuthContext)
  return userProfile?.role ?? 'creator'
}
