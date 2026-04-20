'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'

export default function NewTechnicianPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    skills: '',
    experienceYears: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const body = {
        name: form.name,
        email: form.email,
        password: form.password,
        ...(form.phoneNumber && { phoneNumber: form.phoneNumber }),
        ...(form.skills && { skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean) }),
        ...(form.experienceYears && { experienceYears: parseInt(form.experienceYears, 10) }),
      }
      await apiFetch('/admin/technicians', { method: 'POST', body: JSON.stringify(body) })
      router.replace('/admin/technicians')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-8 pt-14 md:pt-8 max-w-xl">
      <div className="mb-8">
        <Link href="/admin/technicians" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          ← Technicians
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mt-3">New Technician</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
            <input required value={form.name} onChange={set('name')}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-gray-900 transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
            <input required type="email" value={form.email} onChange={set('email')}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-gray-900 transition-colors" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
          <input required type="password" value={form.password} onChange={set('password')}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-gray-900 transition-colors" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input value={form.phoneNumber} onChange={set('phoneNumber')} type="tel"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-gray-900 transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
            <input value={form.experienceYears} onChange={set('experienceYears')} type="number" min="0"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-gray-900 transition-colors" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
          <input value={form.skills} onChange={set('skills')} placeholder="e.g. Plumbing, Electrical, HVAC"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-gray-900 transition-colors" />
          <p className="text-xs text-gray-400 mt-1">Comma-separated</p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">{error}</p>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button type="submit" disabled={submitting}
            className="px-5 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 disabled:opacity-50 transition-colors">
            {submitting ? 'Creating…' : 'Create Technician'}
          </button>
          <Link href="/admin/technicians"
            className="px-4 py-2 text-sm border border-gray-200 rounded hover:bg-gray-50 text-gray-700 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
