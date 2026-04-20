'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'
import { STATUS_STYLES, statusLabel, fmtDateTime, fmtCurrency } from '@/lib/utils'

function StarPicker({ value, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="focus:outline-none">
          <svg width="20" height="20" viewBox="0 0 24 24"
            fill={value >= n ? '#F59E0B' : 'none'}
            stroke={value >= n ? '#F59E0B' : '#D1D5DB'}
            strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  )
}

export default function ClientJobDetailPage() {
  const { id } = useParams()

  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [review, setReview] = useState({ stars: 0, feedback: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState(null)

  const loadJob = () => apiFetch(`/client/jobs/${id}`).then((data) => setJob(data.job || data))

  useEffect(() => {
    loadJob()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleCancel = async () => {
    if (!confirm('Cancel this service request?')) return
    setCancelling(true)
    try {
      await apiFetch(`/client/jobs/${id}/cancel`, { method: 'PUT' })
      await loadJob()
    } catch (err) {
      alert(err.message)
    } finally {
      setCancelling(false)
    }
  }

  const handleReview = async (e) => {
    e.preventDefault()
    if (review.stars === 0) { setReviewError('Please select a star rating'); return }
    setReviewError(null)
    setSubmittingReview(true)
    try {
      await apiFetch(`/client/jobs/${id}/review`, {
        method: 'POST',
        body: JSON.stringify({ stars: review.stars, feedback: review.feedback }),
      })
      await loadJob()
    } catch (err) {
      setReviewError(err.message)
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) return <div className="p-8 pt-14 md:pt-8 flex justify-center"><div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" /></div>
  if (error) return <div className="p-8 pt-14 md:pt-8 text-sm text-red-600">{error}</div>

  const canCancel = ['REQUESTED', 'SCHEDULED'].includes(job?.status)
  const canReview = job?.status === 'COMPLETED' && !job?.review
  const notes = job?.notes || []

  return (
    <div className="p-8 pt-14 md:pt-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/client" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          ← My Jobs
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
          {canCancel && (
            <button onClick={handleCancel} disabled={cancelling}
              className="px-3 py-1.5 text-xs border border-red-200 rounded hover:bg-red-50 text-red-600 disabled:opacity-50 transition-colors">
              {cancelling ? 'Cancelling…' : 'Cancel Request'}
            </button>
          )}
        </div>
      </div>

      {job?.description && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-5">
          <p className="text-xs text-gray-500 mb-1">Description</p>
          <p className="text-sm text-gray-700">{job.description}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Technician</p>
          {job?.technician ? (
            <>
              <p className="text-sm font-medium text-gray-900">{job.technician.name}</p>
              <p className="text-xs text-gray-500">{job.technician.email}</p>
              {job.technician.phoneNumber && <p className="text-xs text-gray-500">{job.technician.phoneNumber}</p>}
            </>
          ) : (
            <p className="text-sm text-gray-400">Not yet assigned</p>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Scheduled</p>
          <p className="text-sm font-medium text-gray-900">{fmtDateTime(job?.scheduledAt)}</p>
          <p className="text-xs text-gray-500 mt-1">Cost: {fmtCurrency(job?.cost)}</p>
        </div>
      </div>

      {notes.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-5">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">Notes from technician</h2>
          </div>
          <ul className="divide-y divide-gray-100">
            {notes.map((n, i) => (
              <li key={n.id || i} className="px-5 py-3">
                <p className="text-sm text-gray-700">{n.note || n.text || n.content}</p>
                <p className="text-xs text-gray-400 mt-1">{fmtDateTime(n.createdAt)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {job?.review && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Your Review</h2>
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <svg key={n} width="16" height="16" viewBox="0 0 24 24"
                fill={job.review.stars >= n ? '#F59E0B' : 'none'}
                stroke={job.review.stars >= n ? '#F59E0B' : '#D1D5DB'} strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
          </div>
          {job.review.feedback && <p className="text-sm text-gray-600">{job.review.feedback}</p>}
        </div>
      )}

      {canReview && (
        <form onSubmit={handleReview} className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Leave a Review</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating <span className="text-red-500">*</span></label>
              <StarPicker value={review.stars} onChange={(n) => setReview((r) => ({ ...r, stars: n }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
              <textarea
                value={review.feedback}
                onChange={(e) => setReview((r) => ({ ...r, feedback: e.target.value }))}
                rows={3}
                placeholder="Share your experience…"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-gray-900 transition-colors resize-none"
              />
            </div>
          </div>
          {reviewError && <p className="text-sm text-red-600 mt-2">{reviewError}</p>}
          <button type="submit" disabled={submittingReview}
            className="mt-4 px-5 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 disabled:opacity-50 transition-colors">
            {submittingReview ? 'Submitting…' : 'Submit Review'}
          </button>
        </form>
      )}
    </div>
  )
}
