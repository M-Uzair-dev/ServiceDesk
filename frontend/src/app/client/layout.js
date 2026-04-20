'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'

const NAV = [
  { href: '/client', label: 'My Jobs', icon: 'briefcase', exact: true },
  { href: '/client/jobs/new', label: 'Request Service', icon: 'plus', exact: true },
  { href: '/client/profile', label: 'Profile', icon: 'user' },
]

export default function ClientLayout({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== 'CLIENT')) {
      router.replace('/login')
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar navItems={NAV} />
      <main className="flex-1 md:ml-60 min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  )
}
