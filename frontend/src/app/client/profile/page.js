'use client'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'

export default function ClientProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    apiFetch('/client/me')
      .then((data) => {
        const p = data.client || data
        setProfile(p)
        setForm({
          name: p.name || '',
          phoneNumber: p.phoneNumber || '',
          address: p.address || '',
          notificationsEnabled: p.notificationsEnabled !== false,
          password: '',
        })
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

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
        notificationsEnabled: form.notificationsEnabled,
        ...(form.phoneNumber && { phoneNumber: form.phoneNumber }),
        address: form.address || null,
        ...(form.password && { password: form.password }),
      }
      const updated = await apiFetch('/client/me', { method: 'PUT', body: JSON.stringify(body) })
      setProfile(updated.client || updated)
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

  return (
    <div className="p-8 pt-14 md:pt-8 max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">{profile?.email}</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input value={form.address} onChange={set('address')} placeholder="Street, City"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-gray-900 transition-colors" />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-700">Email Notifications</p>
              <p className="text-xs text-gray-500 mt-0.5">Receive updates about your service requests</p>
            </div>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, notificationsEnabled: !f.notificationsEnabled }))}
              className={`relative w-10 h-5 rounded-full transition-colors focus:outline-none ${
                form.notificationsEnabled ? 'bg-black' : 'bg-gray-200'
              }`}
              role="switch"
              aria-checked={form.notificationsEnabled}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                form.notificationsEnabled ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
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
