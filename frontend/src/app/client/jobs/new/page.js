'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'

export default function NewJobPage() {
  const router = useRouter()
  const [form, setForm] = useState({ title: '', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const job = await apiFetch('/client/jobs', {
        method: 'POST',
        body: JSON.stringify({ title: form.title, description: form.description }),
      })
      const jobData = job.job || job
      router.replace(`/client/jobs/${jobData.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-8 pt-14 md:pt-8 max-w-xl">
      <div className="mb-8">
        <Link href="/client" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          ← My Jobs
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mt-3">Request Service</h1>
        <p className="text-sm text-gray-500 mt-1">Describe what you need and our team will reach out.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            required
            value={form.title}
            onChange={set('title')}
            placeholder="e.g. Fix leaking kitchen pipe"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-gray-900 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            value={form.description}
            onChange={set('description')}
            rows={4}
            placeholder="Describe the issue in detail — location, symptoms, urgency…"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-gray-900 transition-colors resize-none"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">{error}</p>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button type="submit" disabled={submitting}
            className="px-5 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 disabled:opacity-50 transition-colors">
            {submitting ? 'Submitting…' : 'Submit Request'}
          </button>
          <Link href="/client"
            className="px-4 py-2 text-sm border border-gray-200 rounded hover:bg-gray-50 text-gray-700 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
