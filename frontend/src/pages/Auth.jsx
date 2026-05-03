import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiLogin, apiSignup } from '../api'

export default function Auth() {
  const [params]   = useSearchParams()
  const [mode, setMode] = useState(params.get('mode') === 'signup' ? 'signup' : 'login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login, isAuthed }     = useAuth()
  const navigate = useNavigate()

  useEffect(() => { if (isAuthed) navigate('/audit') }, [isAuthed])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'signup') {
        await apiSignup(email, password)
        setMode('login')
        setError('Account created. Sign in to begin.')
      } else {
        const data = await apiLogin(email, password)
        // Supabase returns session.access_token
        const token = data?.session?.access_token || data?.access_token
        const user  = data?.user || data?.session?.user
        if (!token) throw new Error('No token received. Check credentials.')
        login(token, user)
        navigate('/audit')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-void px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <button onClick={() => navigate('/')} className="block mb-10">
          <span className="font-serif text-2xl text-ember tracking-widest">ICARUS</span>
        </button>

        <h2 className="font-serif text-3xl text-bone mb-1">
          {mode === 'login' ? 'Welcome back.' : 'Begin your flight.'}
        </h2>
        <p className="font-mono text-xs text-mist mb-8 tracking-wide">
          {mode === 'login' ? 'Sign in to continue your audit.' : 'Create an account. Free to start.'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="font-mono text-xs text-mist tracking-widest uppercase block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-ash border border-smoke text-bone font-mono text-sm px-4 py-3 focus:outline-none focus:border-ember transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="font-mono text-xs text-mist tracking-widest uppercase block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-ash border border-smoke text-bone font-mono text-sm px-4 py-3 focus:outline-none focus:border-ember transition-colors"
              placeholder="••••••••"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{   opacity: 0, height: 0 }}
                className={`font-mono text-xs px-3 py-2 border ${
                  error.includes('created')
                    ? 'border-feather text-feather'
                    : 'border-wax text-wax'
                }`}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-ember text-void font-mono text-xs tracking-widest uppercase font-medium hover:bg-bone transition-all duration-300 disabled:opacity-50 mt-2"
          >
            {loading ? 'One moment...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="font-mono text-xs text-mist mt-6 text-center">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
            className="text-ember hover:text-bone transition-colors underline underline-offset-2"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </motion.div>
    </div>
  )
}