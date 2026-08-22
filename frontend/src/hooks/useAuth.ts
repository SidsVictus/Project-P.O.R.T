import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export function useAuth(requireAuth = true) {
  const { user, initialized, signInWithGoogle, signOut } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (initialized && requireAuth && !user) {
      navigate('/login')
    }
  }, [initialized, requireAuth, user, navigate])

  return { user, initialized, loading: useAuthStore((s) => s.loading), signInWithGoogle, signOut }
}
