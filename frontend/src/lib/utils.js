export const STATUS_STYLES = {
  REQUESTED: 'bg-gray-100 text-gray-600',
  SCHEDULED: 'bg-blue-50 text-blue-700',
  ENROUTE: 'bg-amber-50 text-amber-700',
  IN_PROGRESS: 'bg-orange-50 text-orange-700',
  COMPLETED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-red-50 text-red-600',
}

export function statusLabel(status) {
  return (status || '').replace('_', ' ')
}

export function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function fmtDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function fmtCurrency(amount) {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}
