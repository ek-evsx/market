const API_BASE =
  process.env.CHAT_API_BASE_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}/api`
    : `http://localhost:${process.env.PORT || 3001}/api`)

// Tool executors call the app's own existing REST endpoints (same auth, same
// validation, same DB access) instead of duplicating any business logic.
export async function loopbackFetch(path, { method = 'GET', token, body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    return { error: true, status: res.status, message: data?.error || 'Request failed' }
  }

  return data
}
