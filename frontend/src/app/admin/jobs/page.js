'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiFetch, extractList } from '@/lib/api'
import { STATUS_STYLES, statusLabel, fmtDate, fmtCurrency } from '@/lib/utils'

const STATUS_TABS = ['ALL', 'REQUESTED', 'SCHEDULED', 'ENROUTE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

export default function AdminJobsPage() {
  const [data, setData] = useState({ items: [], totalPages: 1 })
  const [page, setPage] = useState(1)
  const [activeStatus, setActiveStatus] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = (p = 1, status = activeStatus) => {
    setLoading(true)
    const qs = status !== 'ALL' ? `?status=${status}&page=${p}&limit=20` : `?page=${p}&limit=20`
    apiFetch(`/admin/jobs${qs}`)
      .then((res) => { setData(extractList(res)); setPage(p) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(1, activeStatus) }, [activeStatus])

  const handleDelete = async (id) => {
    if (!confirm('Delete this job? This cannot be undone.')) return
    try {
      await apiFetch(`/admin/jobs/${id}`, { method: 'DELETE' })
      load(page)
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div className="p-8 pt-14 md:pt-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Jobs</h1>
      </div>

      <div className="flex gap-1 mb-5 border-b border-gray-200">
        {STATUS_TABS.map((s) => (
          <button key={s} onClick={() => setActiveStatus(s)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeStatus === s ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {s === 'ALL' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" /></div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-600">{error}</div>
        ) : data.items.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">No jobs found</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 min-w-[150px]">Title</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 min-w-[120px]">Client</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 min-w-[120px]">Technician</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 min-w-[100px]">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 min-w-[80px]">Cost</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 min-w-[90px]">Date</th>
                <th className="px-5 py-3 min-w-[100px]" />
              </tr>
            </thead>
            <tbody>
              {data.items.map((job) => (
                <tr key={job.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900">
                    <Link href={`/admin/jobs/${job.id}`} className="hover:underline">{job.title}</Link>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{job.client?.name || '—'}</td>
                  <td className="px-5 py-3 text-gray-600">{job.technician?.name || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[job.status] || 'bg-gray-100 text-gray-600'}`}>
                      {statusLabel(job.status)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600 tabular-nums">{fmtCurrency(job.cost)}</td>
                  <td className="px-5 py-3 text-gray-500">{fmtDate(job.createdAt)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link href={`/admin/jobs/${job.id}`}
                        className="px-3 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50 transition-colors text-gray-700">
                        View
                      </Link>
                      <button onClick={() => handleDelete(job.id)}
                        className="px-3 py-1 text-xs border border-red-200 rounded hover:bg-red-50 transition-colors text-red-600">
                        Delete
                      </button>
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
