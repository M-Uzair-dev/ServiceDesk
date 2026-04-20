'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'
import { STATUS_STYLES, statusLabel, fmtDate } from '@/lib/utils'

export default function ClientDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [client, setClient] = useState(null)
  const [recentJobs, setRecentJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    apiFetch(`/admin/clients/${id}`)
      .then((data) => {
        const c = data.client || data
        const jobs = data.recentJobs || []
        setClient(c)
        setRecentJobs(jobs)
        setForm({
          name: c.name || '',
          email: c.email || '',
          phoneNumber: c.phoneNumber || '',
          address: c.address || '',
          password: '',
        })
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaveError(null)
    setSaving(true)
    try {
      const body = {
        name: form.name,
        email: form.email,
        ...(form.phoneNumber && { phoneNumber: form.phoneNumber }),
        address: form.address || null,
        ...(form.password && { password: form.password }),
      }
      const updated = await apiFetch(`/admin/clients/${id}`, { method: 'PUT', body: JSON.stringify(body) })
      setClient(updated.client || updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete client "${client?.name}"? This cannot be undone.`)) return
    try {
      await apiFetch(`/admin/clients/${id}`, { method: 'DELETE' })
      router.replace('/admin/clients')
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <div className="p-8 flex justify-center"><div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" /></div>
  if (error) return <div className="p-8 text-sm text-red-600">{error}</div>

  return (
    <div className="p-8 pt-14 md:pt-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/admin/clients" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          ← Clients
        </Link>
        <div className="flex items-center justify-between mt-3">
          <h1 className="text-2xl font-semibold text-gray-900">{client?.name}</h1>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input value={form.phoneNumber} onChange={set('phoneNumber')} type="tel"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-gray-900 transition-colors" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input value={form.address} onChange={set('address')} placeholder="Street, City"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-gray-900 transition-colors" />
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
          <h2 className="text-sm font-semibold text-gray-900">Recent Jobs</h2>
        </div>
        {recentJobs.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-400">No jobs found</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[360px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 min-w-[150px]">Title</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 min-w-[100px]">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 min-w-[90px]">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentJobs.map((job) => (
                <tr key={job.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900">
                    <Link href={`/admin/jobs/${job.id}`} className="hover:underline">{job.title}</Link>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[job.status] || 'bg-gray-100 text-gray-600'}`}>
                      {statusLabel(job.status)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{fmtDate(job.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  )
}
