import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      // Remember-me check: if user chose NOT to be remembered and this is a new browser session,
      // clear the persisted session so they must log in again.
      const rememberMe = localStorage.getItem('tradepulse_remember_me')
      const sessionActive = sessionStorage.getItem('tradepulse_session_active')
      if (rememberMe === 'false' && !sessionActive) {
        await supabase.auth.signOut()
        localStorage.removeItem('tradepulse_user')
        setUser(null)
        setLoading(false)
        return
      }

      // Check active session from Supabase
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        localStorage.setItem('tradepulse_user', JSON.stringify(currentUser))
        sessionStorage.setItem('tradepulse_session_active', 'true')
      } else {
        localStorage.removeItem('tradepulse_user')
      }
      setLoading(false)
    }

    initAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        localStorage.setItem('tradepulse_user', JSON.stringify(currentUser))
        sessionStorage.setItem('tradepulse_session_active', 'true')
      } else {
        localStorage.removeItem('tradepulse_user')
        sessionStorage.removeItem('tradepulse_session_active')
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: window.location.origin,
      },
    })
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    localStorage.removeItem('tradepulse_user')
    sessionStorage.removeItem('tradepulse_session_active')
    // Keep tradepulse_remember_me so next visit knows preference, but don't force it
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
