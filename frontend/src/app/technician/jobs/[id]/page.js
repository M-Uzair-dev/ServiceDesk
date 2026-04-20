'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'
import { STATUS_STYLES, statusLabel, fmtDateTime, fmtCurrency } from '@/lib/utils'

const ADVANCE_LABELS = {
  SCHEDULED: 'Set En Route',
  ENROUTE: 'Mark In Progress',
  IN_PROGRESS: 'Mark Completed',
}

export default function TechnicianJobDetailPage() {
  const { id } = useParams()

  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [advancing, setAdvancing] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [addingNote, setAddingNote] = useState(false)

  const loadJob = () =>
    apiFetch(`/technician/jobs/${id}`).then((data) => setJob(data.job || data))

  useEffect(() => {
    loadJob()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleAdvance = async () => {
    setAdvancing(true)
    try {
      await apiFetch(`/technician/jobs/${id}/advance`, { method: 'PUT' })
      await loadJob()
    } catch (err) {
      alert(err.message)
    } finally {
      setAdvancing(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Cancel this job?')) return
    setCancelling(true)
    try {
      await apiFetch(`/technician/jobs/${id}/cancel`, { method: 'PUT' })
      await loadJob()
    } catch (err) {
      alert(err.message)
    } finally {
      setCancelling(false)
    }
  }

  const handleAddNote = async (e) => {
    e.preventDefault()
    if (!noteText.trim()) return
    setAddingNote(true)
    try {
      await apiFetch(`/technician/jobs/${id}/notes`, {
        method: 'POST',
        body: JSON.stringify({ note: noteText }),
      })
      setNoteText('')
      await loadJob()
    } catch (err) {
      alert(err.message)
    } finally {
      setAddingNote(false)
    }
  }

  if (loading) return <div className="p-8 pt-14 md:pt-8 flex justify-center"><div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" /></div>
  if (error) return <div className="p-8 pt-14 md:pt-8 text-sm text-red-600">{error}</div>

  const notes = job?.notes || []
  const canAdvance = !!ADVANCE_LABELS[job?.status]
  const canCancel = !['COMPLETED', 'CANCELLED'].includes(job?.status)

  return (
    <div className="p-8 pt-14 md:pt-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/technician/jobs" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          ← My Jobs
        </Link>
        <div className="flex items-start justify-between mt-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{job?.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[job?.status] || 'bg-gray-100 text-gray-600'}`}>
                {statusLabel(job?.status)}
              </span>
              <span className="text-sm text-gray-500">{fmtDateTime(job?.scheduledAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canAdvance && (
              <button onClick={handleAdvance} disabled={advancing}
                className="px-4 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 disabled:opacity-50 transition-colors">
                {advancing ? 'Updating…' : ADVANCE_LABELS[job?.status]}
              </button>
            )}
            {canCancel && (
              <button onClick={handleCancel} disabled={cancelling}
                className="px-3 py-2 border border-red-200 text-red-600 text-sm rounded hover:bg-red-50 disabled:opacity-50 transition-colors">
                {cancelling ? '…' : 'Cancel'}
              </button>
            )}
          </div>
        </div>
      </div>

      {job?.description && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-5">
          <p className="text-xs text-gray-500 mb-1">Description</p>
          <p className="text-sm text-gray-700">{job.description}</p>
        </div>
      )}

      {job?.client?.address && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 flex items-start gap-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <div>
            <p className="text-xs font-medium text-amber-700 mb-0.5">Job Location</p>
            <p className="text-sm font-medium text-amber-900">{job.client.address}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Client</p>
          <p className="text-sm font-medium text-gray-900">{job?.client?.name || '—'}</p>
          {job?.client?.email && <p className="text-xs text-gray-500">{job.client.email}</p>}
          {job?.client?.phoneNumber && <p className="text-xs text-gray-500">{job.client.phoneNumber}</p>}
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Job Details</p>
          <p className="text-sm font-medium text-gray-900">{fmtCurrency(job?.cost)}</p>
          <p className="text-xs text-gray-500 mt-0.5">{fmtDateTime(job?.scheduledAt)}</p>
        </div>
      </div>

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
            placeholder="Add a note about this job…"
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
