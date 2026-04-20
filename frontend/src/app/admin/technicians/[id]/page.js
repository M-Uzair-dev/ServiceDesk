'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'

function StarRow({ stars }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width="12" height="12" viewBox="0 0 24 24"
          fill={stars >= n ? '#F59E0B' : 'none'}
          stroke={stars >= n ? '#F59E0B' : '#D1D5DB'}
          strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  )
}

export default function TechnicianDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [tech, setTech] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    apiFetch(`/admin/technicians/${id}`)
      .then((data) => {
        const t = data.technician || data
        const r = data.reviews || []
        setTech(t)
        setReviews(r)
        setForm({
          name: t.name || '',
          email: t.email || '',
          phoneNumber: t.phoneNumber || '',
          skills: Array.isArray(t.skills) ? t.skills.join(', ') : (t.skills || ''),
          experienceYears: t.experienceYears ?? '',
          status: t.status || 'ACTIVE',
          verified: t.verified || false,
          password: '',
        })
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [field]: val }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaveError(null)
    setSaving(true)
    try {
      const body = {
        name: form.name,
        email: form.email,
        status: form.status,
        verified: form.verified,
        ...(form.phoneNumber && { phoneNumber: form.phoneNumber }),
        ...(form.skills && { skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean) }),
        ...(form.experienceYears !== '' && { experienceYears: parseInt(form.experienceYears, 10) }),
        ...(form.password && { password: form.password }),
      }
      const updated = await apiFetch(`/admin/technicians/${id}`, { method: 'PUT', body: JSON.stringify(body) })
      setTech(updated.technician || updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete technician "${tech?.name}"? This cannot be undone.`)) return
    try {
      await apiFetch(`/admin/technicians/${id}`, { method: 'DELETE' })
      router.replace('/admin/technicians')
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return (
    <div className="p-8 pt-14 md:pt-8 flex justify-center"><div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" /></div>
  )
  if (error) return <div className="p-8 pt-14 md:pt-8 text-sm text-red-600">{error}</div>

  return (
    <div className="p-8 pt-14 md:pt-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/admin/technicians" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          ← Technicians
        </Link>
        <div className="flex items-center justify-between mt-3">
          <h1 className="text-2xl font-semibold text-gray-900">{tech?.name}</h1>
          <button onClick={handleDelete}
            className="px-3 py-1.5 text-xs border border-red-200 rounded hover:bg-red-50 text-red-600 transition-colors">
            Delete
          </button>
        </div>
      </div>

      {form && (
        <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-lg p-6 space-y-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-900">Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input required value={form.name} onChange={set('name')}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-gray-900 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input required type="email" value={form.email} onChange={set('email')}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-gray-900 transition-colors" />
            </div>
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
            <input value={form.skills} onChange={set('skills')} placeholder="Comma-separated"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-gray-900 transition-colors" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={set('status')}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-gray-900 transition-colors bg-white">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.verified} onChange={set('verified')}
                  className="w-4 h-4 rounded border-gray-300" />
                <span className="text-sm text-gray-700">Verified</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input type="password" value={form.password} onChange={set('password')} placeholder="Leave blank to keep current"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-gray-900 transition-colors" />
          </div>

          {saveError && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">{saveError}</p>}
          {saved && <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded px-3 py-2">Changes saved.</p>}

          <button type="submit" disabled={saving}
            className="px-5 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 disabled:opacity-50 transition-colors">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Reviews ({reviews.length})</h2>
        </div>
        {reviews.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-400">No reviews yet</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {reviews.map((r) => (
              <li key={r.id} className="px-5 py-4">
                <div className="flex items-center justify-between mb-1">
                  <StarRow stars={r.stars} />
                  <span className="text-xs text-gray-400">{r.client?.name}</span>
                </div>
                {r.feedback && <p className="text-sm text-gray-600 mt-1">{r.feedback}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
