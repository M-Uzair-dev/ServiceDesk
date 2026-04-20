'use client'
import { useState, useEffect } from 'react'
import { apiFetch, extractList } from '@/lib/api'
import { fmtDate } from '@/lib/utils'

function StarRow({ stars }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width="14" height="14" viewBox="0 0 24 24"
          fill={stars >= n ? '#F59E0B' : 'none'}
          stroke={stars >= n ? '#F59E0B' : '#D1D5DB'}
          strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  )
}

export default function TechnicianReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [avgRating, setAvgRating] = useState(null)

  useEffect(() => {
    apiFetch('/technician/reviews')
      .then((data) => {
        const list = extractList(data).items
        setReviews(list)
        if (list.length > 0) {
          const avg = list.reduce((sum, r) => sum + (r.stars || 0), 0) / list.length
          setAvgRating(avg.toFixed(1))
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-8 pt-14 md:pt-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Reviews</h1>
        {avgRating && (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <svg key={n} width="16" height="16" viewBox="0 0 24 24"
                  fill={parseFloat(avgRating) >= n ? '#F59E0B' : 'none'}
                  stroke={parseFloat(avgRating) >= n ? '#F59E0B' : '#D1D5DB'}
                  strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            <span className="text-sm font-medium text-gray-700">{avgRating}</span>
            <span className="text-sm text-gray-400">({reviews.length} reviews)</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" /></div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : reviews.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-sm text-gray-400">No reviews yet</p>
          <p className="text-xs text-gray-300 mt-1">Reviews appear here once clients rate completed jobs</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r, i) => (
            <div key={r.id || i} className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-start justify-between">
                <div>
                  <StarRow stars={r.stars} />
                  {r.feedback && <p className="text-sm text-gray-700 mt-2">{r.feedback}</p>}
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <p className="text-xs font-medium text-gray-600">{r.client?.name || r.job?.client?.name || '—'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{fmtDate(r.createdAt)}</p>
                </div>
              </div>
              {r.job?.title && (
                <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100">
                  Job: {r.job.title}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
