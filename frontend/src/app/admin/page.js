'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'
import { STATUS_STYLES, statusLabel, fmtDate, fmtCurrency } from '@/lib/utils'

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-semibold text-gray-900 tabular-nums">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function Badge({ status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-600'}`}>
      {statusLabel(status)}
    </span>
  )
}

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    apiFetch('/admin/dashboard')
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="p-8 pt-14 md:pt-8 flex items-center justify-center min-h-64">
      <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="p-8 pt-14 md:pt-8">
      <p className="text-red-600 text-sm">Failed to load dashboard: {error}</p>
    </div>
  )

  const jobs = data?.jobsByStatus || {}
  const recentJobs = data?.recentJobs || []
  const topTechs = data?.topTechnicians || []

  return (
    <div className="p-8 pt-14 md:pt-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your service operations</p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4 mb-8">
        <StatCard label="Total Clients" value={data?.totalClients ?? 0} />
        <StatCard label="Technicians" value={data?.totalTechnicians ?? 0} />
        <StatCard label="Total Jobs" value={data?.totalJobs ?? 0} />
        <StatCard label="Total Revenue" value={fmtCurrency(data?.totalRevenue ?? 0)} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Requested', key: 'REQUESTED' },
          { label: 'Scheduled', key: 'SCHEDULED' },
          { label: 'Completed', key: 'COMPLETED' },
        ].map(({ label, key }) => (
          <div key={key} className="bg-white border border-gray-200 rounded-lg p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-semibold text-gray-900 tabular-nums mt-0.5">{jobs[key] ?? 0}</p>
            </div>
            <Badge status={key} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Recent Jobs</h2>
            <Link href="/admin/jobs" className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
              View all →
            </Link>
          </div>
          {recentJobs.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400">No jobs yet</div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 min-w-[150px]">Title</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 min-w-[120px]">Client</th>
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
                    <td className="px-5 py-3 text-gray-600">{job.client?.name || '—'}</td>
                    <td className="px-5 py-3"><Badge status={job.status} /></td>
                    <td className="px-5 py-3 text-gray-500">{fmtDate(job.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">Top Technicians</h2>
          </div>
          {topTechs.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400">No technicians yet</div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {topTechs.map((tech, i) => (
                <li key={tech.id || i} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tech.name}</p>
                    <p className="text-xs text-gray-500">{tech.completedJobs ?? 0} jobs</p>
                  </div>
                  {tech.avgRating != null && (
                    <div className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      <span className="text-xs text-gray-600 tabular-nums">{Number(tech.avgRating).toFixed(1)}</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
