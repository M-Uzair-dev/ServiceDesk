'use client'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'

export default function TechnicianProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    apiFetch('/technician/me')
      .then((data) => {
        const p = data.technician || data
        setProfile(p)
        setForm({
          name: p.name || '',
          phoneNumber: p.phoneNumber || '',
          skills: Array.isArray(p.skills) ? p.skills.join(', ') : (p.skills || ''),
          password: '',
        })
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaveError(null)
    setSaving(true)
    try {
      const body = {
        name: form.name,
        ...(form.phoneNumber && { phoneNumber: form.phoneNumber }),
        ...(form.skills && { skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean) }),
        ...(form.password && { password: form.password }),
      }
      const updated = await apiFetch('/technician/me', { method: 'PUT', body: JSON.stringify(body) })
      setProfile(updated.technician || updated)
      setSaved(true)
      setForm((f) => ({ ...f, password: '' }))
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 pt-14 md:pt-8 flex justify-center"><div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" /></div>
  if (error) return <div className="p-8 pt-14 md:pt-8 text-sm text-red-600">{error}</div>

  const p = profile || {}

  return (
    <div className="p-8 pt-14 md:pt-8 max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">{p.email}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Experience</p>
          <p className="text-sm font-medium text-gray-900">
            {p.experienceYears != null ? `${p.experienceYears} years` : '—'}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Status</p>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
              p.isWorking ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${p.isWorking ? 'bg-green-500' : 'bg-gray-400'}`} />
              {p.isWorking ? 'On a Job' : 'Available'}
            </span>
            {p.verified && (
              <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                Verified
              </span>
            )}
          </div>
        </div>
      </div>

      {form && (
        <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input required value={form.name} onChange={set('name')}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-gray-900 transition-colors" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input value={form.phoneNumber} onChange={set('phoneNumber')} type="tel"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-gray-900 transition-colors" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
            <input value={form.skills} onChange={set('skills')} placeholder="e.g. Plumbing, Electrical, HVAC"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-gray-900 transition-colors" />
            <p className="text-xs text-gray-400 mt-1">Comma-separated</p>
          </div>

          <div className="border-t border-gray-100 pt-4">
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
    </div>
  )
}
