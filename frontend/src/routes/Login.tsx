import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../stores/authStore'
import { Rocket } from 'lucide-react'

export function Login() {
  const navigate = useNavigate()
  const { signInWithGoogle, user, initialized, loading } = useAuthStore()

  useEffect(() => {
    if (initialized && user) navigate('/dashboard')
  }, [initialized, user, navigate])

  return (
    <div className="h-screen flex overflow-hidden bg-black">
      {/* Left - Cube image */}
      <div className="hidden lg:flex lg:w-[55%] items-center justify-center bg-black">
        <img src="/glases.jpg" alt="" className="max-w-full max-h-full object-contain" />
      </div>

      {/* Right - Auth */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 bg-black">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/bookmark.png" alt="Journal Deployer" className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-brand-red mb-2">Welcome</h2>
          <p className="text-gray-400 text-sm mb-8">Sign in to your deployment hub</p>

          <button onClick={signInWithGoogle} disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-white text-gray-800 font-medium hover:bg-gray-100 hover:shadow-md transition-all duration-200 shadow-sm disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-500">Secured by Supabase</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <p className="text-xs text-gray-500">
            By signing in, you agree to our terms of service
          </p>
        </motion.div>
      </div>
    </div>
  )
}
