'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiFetch, extractList } from '@/lib/api'
import { STATUS_STYLES, statusLabel, fmtDateTime, fmtCurrency } from '@/lib/utils'

export default function AdminJobDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [job, setJob] = useState(null)
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [noteText, setNoteText] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [schedule, setSchedule] = useState({ technicianId: '', scheduledAt: '', cost: '' })
  const [scheduling, setScheduling] = useState(false)
  const [scheduleError, setScheduleError] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  const loadJob = async () => {
    const data = await apiFetch(`/admin/jobs/${id}`)
    const j = data.job || data
    setJob(j)
    return j
  }

  useEffect(() => {
    Promise.all([
      apiFetch(`/admin/jobs/${id}`),
      apiFetch('/admin/technicians?limit=100'),
    ])
      .then(([jobData, techData]) => {
        setJob(jobData.job || jobData)
        setTechnicians(extractList(techData).items)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleSchedule = async (e) => {
    e.preventDefault()
    setScheduleError(null)
    setScheduling(true)
    try {
      await apiFetch(`/admin/jobs/${id}/schedule`, {
        method: 'PUT',
        body: JSON.stringify({
          technicianId: schedule.technicianId,
          scheduledAt: new Date(schedule.scheduledAt).toISOString(),
          cost: parseFloat(schedule.cost),
        }),
      })
      await loadJob()
    } catch (err) {
      setScheduleError(err.message)
    } finally {
      setScheduling(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Cancel this job? This will notify the client and technician.')) return
    setCancelling(true)
    try {
      await apiFetch(`/admin/jobs/${id}/cancel`, { method: 'PUT' })
      await loadJob()
    } catch (err) {
      alert(err.message)
    } finally {
      setCancelling(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Permanently delete this job? This cannot be undone.')) return
    try {
      await apiFetch(`/admin/jobs/${id}`, { method: 'DELETE' })
      router.replace('/admin/jobs')
    } catch (err) {
      alert(err.message)
    }
  }

  const handleAddNote = async (e) => {
    e.preventDefault()
    if (!noteText.trim()) return
    setAddingNote(true)
    try {
      await apiFetch(`/admin/jobs/${id}/notes`, {
        method: 'POST',
        body: JSON.stringify({ note: noteText }),
      })
      setNoteText('')
      const updated = await apiFetch(`/admin/jobs/${id}`)
      setJob(updated.job || updated)
    } catch (err) {
      alert(err.message)
    } finally {
      setAddingNote(false)
    }
  }

  if (loading) return <div className="p-8 pt-14 md:pt-8 flex justify-center"><div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" /></div>
  if (error) return <div className="p-8 pt-14 md:pt-8 text-sm text-red-600">{error}</div>

  const notes = job?.notes || []
  const canCancel = job?.status && !['COMPLETED', 'CANCELLED'].includes(job.status)

  return (
    <div className="p-8 pt-14 md:pt-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/admin/jobs" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          ← Jobs
        </Link>
        <div className="flex items-start justify-between mt-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{job?.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[job?.status] || 'bg-gray-100 text-gray-600'}`}>
                {statusLabel(job?.status)}
              </span>
              <span className="text-sm text-gray-500">{fmtDateTime(job?.createdAt)}</span>
            </div>
          </div>
          <button onClick={handleDelete}
            className="px-3 py-1.5 text-xs border border-red-200 rounded hover:bg-red-50 text-red-600 transition-colors">
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Client</p>
          <p className="text-sm font-medium text-gray-900">{job?.client?.name || '—'}</p>
          <p className="text-xs text-gray-500">{job?.client?.email}</p>
          {job?.client?.address && <p className="text-xs text-gray-500 mt-0.5">{job.client.address}</p>}
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Technician</p>
          <p className="text-sm font-medium text-gray-900">{job?.technician?.name || 'Unassigned'}</p>
          <p className="text-xs text-gray-500">{job?.technician?.email}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Scheduled</p>
          <p className="text-sm font-medium text-gray-900">{fmtDateTime(job?.scheduledAt)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Cost</p>
          <p className="text-sm font-medium text-gray-900">{fmtCurrency(job?.cost)}</p>
        </div>
      </div>

      {job?.description && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
          <p className="text-xs text-gray-500 mb-2">Description</p>
          <p className="text-sm text-gray-700">{job.description}</p>
        </div>
      )}

      {job?.status === 'REQUESTED' && (
        <form onSubmit={handleSchedule} className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Schedule Job</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign Technician <span className="text-red-500">*</span></label>
              <select required value={schedule.technicianId} onChange={(e) => setSchedule((s) => ({ ...s, technicianId: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-gray-900 transition-colors bg-white">
                <option value="">Select technician…</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date & Time <span className="text-red-500">*</span></label>
                <input required type="datetime-local" value={schedule.scheduledAt}
                  onChange={(e) => setSchedule((s) => ({ ...s, scheduledAt: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-gray-900 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost (USD) <span className="text-red-500">*</span></label>
                <input required type="number" min="0" step="0.01" value={schedule.cost}
                  onChange={(e) => setSchedule((s) => ({ ...s, cost: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-gray-900 transition-colors"
                  placeholder="0.00" />
              </div>
            </div>
          </div>
          {scheduleError && <p className="text-sm text-red-600 mt-3">{scheduleError}</p>}
          <button type="submit" disabled={scheduling}
            className="mt-4 px-5 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 disabled:opacity-50 transition-colors">
            {scheduling ? 'Scheduling…' : 'Schedule Job'}
          </button>
        </form>
      )}

      {canCancel && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Actions</h2>
          <button onClick={handleCancel} disabled={cancelling}
            className="px-4 py-2 border border-red-200 text-red-600 text-sm font-medium rounded hover:bg-red-50 disabled:opacity-50 transition-colors">
            {cancelling ? 'Cancelling…' : 'Cancel Job'}
          </button>
          <p className="text-xs text-gray-400 mt-2">This will notify the client and technician via email.</p>
        </div>
      )}

      {job?.review && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Client Review</h2>
          <div className="flex items-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <svg key={n} width="14" height="14" viewBox="0 0 24 24"
                fill={job.review.stars >= n ? '#F59E0B' : 'none'}
                stroke={job.review.stars >= n ? '#F59E0B' : '#D1D5DB'} strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
            <span className="text-sm text-gray-600">{job.review.stars}/5</span>
          </div>
          {job.review.feedback && <p className="text-sm text-gray-600">{job.review.feedback}</p>}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Notes ({notes.length})</h2>
        </div>
        {notes.length > 0 && (
          <ul className="divide-y divide-gray-100">
            {notes.map((n, i) => (
              <li key={n.id || i} className="px-5 py-3">
                <p className="text-sm text-gray-700">{n.note || n.text || n.content}</p>
                <p className="text-xs text-gray-400 mt-1">{fmtDateTime(n.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={handleAddNote} className="p-5 border-t border-gray-100">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={2}
            placeholder="Add a note…"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-gray-900 transition-colors resize-none"
          />
          <button type="submit" disabled={addingNote || !noteText.trim()}
            className="mt-2 px-4 py-1.5 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 disabled:opacity-50 transition-colors">
            {addingNote ? 'Adding…' : 'Add Note'}
          </button>
        </form>
      </div>
    </div>
  )
}
