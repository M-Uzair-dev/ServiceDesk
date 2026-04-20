const BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api'

let _access = null
let _refresh = null
let _pending = null

export function setTokens(access, refresh) {
  _access = access
  _refresh = refresh
  if (typeof window !== 'undefined' && refresh) {
    sessionStorage.setItem('_rt', refresh)
  }
}

export function clearTokens() {
  _access = null
  _refresh = null
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('_rt')
    sessionStorage.removeItem('_user')
  }
}

export function getStoredRefreshToken() {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem('_rt')
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null
  try {
    const u = sessionStorage.getItem('_user')
    return u ? JSON.parse(u) : null
  } catch {
    return null
  }
}

export function persistUser(user) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('_user', JSON.stringify(user))
  }
}

async function silentRefresh() {
  const rt = _refresh || getStoredRefreshToken()
  if (!rt) throw new Error('No refresh token')

  const res = await fetch(`${BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: rt }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error('Refresh failed')

  const payload = json.data ?? json
  setTokens(payload.accessToken, payload.refreshToken)
  return payload.accessToken
}

export async function apiFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(_access ? { Authorization: `Bearer ${_access}` } : {}),
    ...options.headers,
  }

  let res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (res.status === 401 && (_refresh || getStoredRefreshToken())) {
    try {
      if (!_pending) {
        _pending = silentRefresh().finally(() => { _pending = null })
      }
      const newToken = await _pending
      const retryHeaders = { ...headers, Authorization: `Bearer ${newToken}` }
      res = await fetch(`${BASE}${path}`, { ...options, headers: retryHeaders })
    } catch {
      clearTokens()
      if (typeof window !== 'undefined') window.location.href = '/login'
      throw new Error('Session expired')
    }
  }

  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Request failed')
  // Paginated list responses: data is an array with total/page/limit at top level
  if (Array.isArray(json.data)) return json
  return json.data !== undefined ? json.data : json
}

export function extractList(res) {
  if (Array.isArray(res)) return { items: res, total: res.length, page: 1, totalPages: 1 }
  if (Array.isArray(res?.data)) {
    const total = res.total ?? res.data.length
    const limit = res.limit ?? 20
    return { items: res.data, total, page: res.page ?? 1, totalPages: Math.ceil(total / limit) }
  }
  if (res?.items) return res
  return { items: [], total: 0, page: 1, totalPages: 1 }
}
