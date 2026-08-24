import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { api } from '../lib/api'
import { disconnectSocket } from '../lib/socket'

interface User { id: string; email?: string; avatar_url?: string }

interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
  customAvatar: string | null
  init: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  setUser: (user: User | null) => void
  setCustomAvatar: (url: string) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,
  customAvatar: localStorage.getItem('customAvatar'),

  init: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      api.setToken(session.access_token)
      const u = session.user
      set({
        user: {
          id: u.id,
          email: u.email,
          avatar_url: u.user_metadata?.avatar_url || u.user_metadata?.picture,
        },
        initialized: true,
      })
    } else {
      set({ initialized: true })
    }

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        api.setToken(session.access_token)
        const u = session.user
        set({
          user: {
            id: u.id,
            email: u.email,
            avatar_url: u.user_metadata?.avatar_url || u.user_metadata?.picture,
          },
        })
      } else {
        api.setToken(null)
        set({ user: null })
      }
    })
  },

  signInWithGoogle: async () => {
    set({ loading: true })
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) throw error
    set({ loading: false })
  },

  signOut: async () => {
    await supabase.auth.signOut()
    api.setToken(null)
    disconnectSocket()
    set({ user: null })
  },

  setUser: (user) => set({ user }),

  setCustomAvatar: (url: string) => {
    localStorage.setItem('customAvatar', url)
    set({ customAvatar: url })
  },
}))
