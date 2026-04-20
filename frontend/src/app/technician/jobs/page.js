'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiFetch, extractList } from '@/lib/api'
import { STATUS_STYLES, statusLabel, fmtDateTime } from '@/lib/utils'

const ADVANCE_LABELS = {
  SCHEDULED: 'Set En Route',
  ENROUTE: 'Mark In Progress',
  IN_PROGRESS: 'Mark Completed',
}

export default function TechnicianJobsPage() {
  const [data, setData] = useState({ items: [], totalPages: 1 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [advancing, setAdvancing] = useState(null)

  const load = (p = 1) => {
    setLoading(true)
    apiFetch(`/technician/jobs?page=${p}&limit=20`)
      .then((res) => { setData(extractList(res)); setPage(p) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(1) }, [])

  const handleAdvance = async (id) => {
    setAdvancing(id)
    try {
      await apiFetch(`/technician/jobs/${id}/advance`, { method: 'PUT' })
      load(page)
    } catch (err) {
      alert(err.message)
    } finally {
      setAdvancing(null)
    }
  }

  const handleCancel = async (id) => {
    if (!confirm('Cancel this job?')) return
    try {
      await apiFetch(`/technician/jobs/${id}/cancel`, { method: 'PUT' })
      load(page)
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="p-8 pt-14 md:pt-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">My Jobs</h1>
        <p className="text-sm text-gray-500 mt-1">Assigned service jobs ordered by schedule</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" /></div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-600">{error}</div>
        ) : data.items.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">No jobs assigned</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 min-w-[150px]">Title</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 min-w-[120px]">Client</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 min-w-[100px]">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 min-w-[100px]">Scheduled</th>
                <th className="px-5 py-3 min-w-[130px]" />
              </tr>
            </thead>
            <tbody>
              {data.items.map((job) => (
                <tr key={job.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900">
                    <Link href={`/technician/jobs/${job.id}`} className="hover:underline">{job.title}</Link>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{job.client?.name || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[job.status] || 'bg-gray-100 text-gray-600'}`}>
                      {statusLabel(job.status)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{fmtDateTime(job.scheduledAt)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      {ADVANCE_LABELS[job.status] && (
                        <button
                          onClick={() => handleAdvance(job.id)}
                          disabled={advancing === job.id}
                          className="px-3 py-1 text-xs bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
                        >
                          {advancing === job.id ? '…' : ADVANCE_LABELS[job.status]}
                        </button>
                      )}
                      {!['COMPLETED', 'CANCELLED'].includes(job.status) && (
                        <button
                          onClick={() => handleCancel(job.id)}
                          className="px-3 py-1 text-xs border border-red-200 rounded hover:bg-red-50 text-red-600 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                      <Link href={`/technician/jobs/${job.id}`}
                        className="px-3 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50 transition-colors text-gray-700">
                        Details
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">Page {page} of {data.totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => load(page - 1)} disabled={page <= 1}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Previous
            </button>
            <button onClick={() => load(page + 1)} disabled={page >= data.totalPages}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
