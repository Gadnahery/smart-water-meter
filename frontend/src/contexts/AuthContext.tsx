import { createContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Customer, Profile } from '@/types'

export interface RegisterInput {
  firstName: string
  lastName: string
  phone: string
  email: string
  password: string
}

export interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: Profile | null
  customer: Customer | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (input: RegisterInput) => Promise<{ error: string | null; needsConfirmation: boolean }>
  signOut: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<{ error: string | null }>
  updatePassword: (password: string) => Promise<{ error: string | null }>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

async function loadProfileAndCustomer(userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_id', userId)
    .maybeSingle()

  if (!profile) return { profile: null, customer: null }

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('profile_id', profile.id)
    .maybeSingle()

  return { profile, customer: customer ?? null }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function init() {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession()

      if (!active) return
      setSession(initialSession)

      if (initialSession?.user) {
        const { profile, customer } = await loadProfileAndCustomer(initialSession.user.id)
        if (!active) return
        setProfile(profile)
        setCustomer(customer)
      }
      if (active) setLoading(false)
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)
      if (newSession?.user) {
        const { profile, customer } = await loadProfileAndCustomer(newSession.user.id)
        setProfile(profile)
        setCustomer(customer)
      } else {
        setProfile(null)
        setCustomer(null)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  async function signUp({ firstName, lastName, phone, email, password }: RegisterInput) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName, phone },
      },
    })
    return { error: error?.message ?? null, needsConfirmation: !error && !data.session }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function requestPasswordReset(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error: error?.message ?? null }
  }

  async function updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password })
    return { error: error?.message ?? null }
  }

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    profile,
    customer,
    loading,
    signIn,
    signUp,
    signOut,
    requestPasswordReset,
    updatePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
