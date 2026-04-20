'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiFetch, extractList } from '@/lib/api'
import { STATUS_STYLES, statusLabel, fmtDate } from '@/lib/utils'
import { useAuth } from '@/lib/auth'

export default function ClientDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState({ items: [], totalPages: 1 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = (p = 1) => {
    setLoading(true)
    apiFetch(`/client/jobs?page=${p}&limit=20`)
      .then((res) => { setData(extractList(res)); setPage(p) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(1) }, [])

  return (
    <div className="p-8 pt-14 md:pt-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Jobs</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.name}</p>
        </div>
        <Link
          href="/client/jobs/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Request Service
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" /></div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-600">{error}</div>
        ) : data.items.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-sm mb-3">No service requests yet</p>
            <Link href="/client/jobs/new"
              className="inline-flex items-center gap-1 px-4 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors">
              Request your first service →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[580px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 min-w-[150px]">Title</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 min-w-[100px]">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 min-w-[120px]">Technician</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 min-w-[90px]">Scheduled</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 min-w-[90px]">Date</th>
                <th className="px-5 py-3 min-w-[60px]" />
              </tr>
            </thead>
            <tbody>
              {data.items.map((job) => (
                <tr key={job.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900">{job.title}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[job.status] || 'bg-gray-100 text-gray-600'}`}>
                      {statusLabel(job.status)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{job.technician?.name || '—'}</td>
                  <td className="px-5 py-3 text-gray-500">{fmtDate(job.scheduledAt)}</td>
                  <td className="px-5 py-3 text-gray-500">{fmtDate(job.createdAt)}</td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/client/jobs/${job.id}`}
                      className="px-3 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50 transition-colors text-gray-700">
                      View
                    </Link>
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
