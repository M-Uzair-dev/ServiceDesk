'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard', exact: true },
  { href: '/admin/technicians', label: 'Technicians', icon: 'wrench' },
  { href: '/admin/clients', label: 'Clients', icon: 'users' },
  { href: '/admin/jobs', label: 'Jobs', icon: 'briefcase' },
]

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
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
