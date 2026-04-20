'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'

const ROLES = [
  { id: 'admin', label: 'Admin' },
  { id: 'client', label: 'Client' },
  { id: 'technician', label: 'Technician' },
]

const ROLE_REDIRECTS = {
  ADMIN: '/admin',
  CLIENT: '/client',
  TECHNICIAN: '/technician',
}

export default function LoginPage() {
  const { user, loading, login } = useAuth()
  const router = useRouter()

  const [role, setRole] = useState('client')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!loading && user) {
      router.replace(ROLE_REDIRECTS[user.role] || '/login')
    }
  }, [user, loading, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const loggedUser = await login(role, email, password)
      router.replace(ROLE_REDIRECTS[loggedUser.role] || '/login')
    } catch (err) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-black rounded-lg mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">ServiceDesk</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex border border-gray-200 rounded mb-5 p-0.5 gap-0.5">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => { setRole(r.id); setError(null) }}
                className={`flex-1 py-1.5 text-sm font-medium rounded transition-colors ${
                  role === r.id ? 'bg-black text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-gray-900 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-gray-900 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Access is granted by your administrator.
        </p>
      </div>
    </div>
  )
}
