'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiFetch, extractList } from '@/lib/api'
import { STATUS_STYLES, statusLabel, fmtDateTime } from '@/lib/utils'
import { useAuth } from '@/lib/auth'

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-semibold text-gray-900 tabular-nums">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function TechnicianOverview() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [isWorking, setIsWorking] = useState(false)

  useEffect(() => {
    Promise.all([
      apiFetch('/technician/stats'),
      apiFetch('/technician/jobs?limit=5'),
      apiFetch('/technician/me'),
    ])
      .then(([s, j, me]) => {
        setStats(s)
        setJobs(extractList(j).items.slice(0, 5))
        setIsWorking(!!(me.isWorking || (me.technician || me).isWorking))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="p-8 pt-14 md:pt-8 flex justify-center"><div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" /></div>
  )

  return (
    <div className="p-8 pt-14 md:pt-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.name}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
          isWorking ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isWorking ? 'bg-green-500' : 'bg-gray-400'}`} />
          {isWorking ? 'On a Job' : 'Available'}
        </span>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4 mb-8">
          <StatCard label="Total Jobs" value={stats.totalJobs ?? 0} />
          <StatCard label="Completed" value={stats.completedJobs ?? 0}
            sub={stats.completionRate != null ? `${stats.completionRate}% completion rate` : undefined} />
          <StatCard label="Avg Rating" value={stats.avgRating != null ? Number(stats.avgRating).toFixed(1) : '—'}
            sub={stats.totalReviews != null ? `${stats.totalReviews} reviews` : undefined} />
          <StatCard label="Hours Worked" value={stats.hoursWorked != null ? `${stats.hoursWorked}h` : '—'} />
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Upcoming Jobs</h2>
          <Link href="/technician/jobs" className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
            View all →
          </Link>
        </div>
        {jobs.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-gray-400">No assigned jobs</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 min-w-[150px]">Title</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 min-w-[120px]">Client</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 min-w-[100px]">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 min-w-[90px]">Scheduled</th>
                <th className="px-5 py-3 min-w-[60px]" />
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900">{job.title}</td>
                  <td className="px-5 py-3 text-gray-600">{job.client?.name || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[job.status] || 'bg-gray-100 text-gray-600'}`}>
                      {statusLabel(job.status)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{fmtDateTime(job.scheduledAt)}</td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/technician/jobs/${job.id}`}
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
    </div>
  )
}
