export const getJson = async <T>(url: string): Promise<T | null> => {
  const res = await fetch(url).catch(() => null)
  if (!res || !res.ok) return null
  return res.json().catch(() => null)
}

export const patchJson = async <T>(url: string, body: unknown): Promise<T | null> => {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => null)
  if (!res || !res.ok) return null
  return res.json().catch(() => null)
}

export const postJson = async <T>(url: string, body: unknown): Promise<T | null> => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => null)
  if (!res || !res.ok) return null
  return res.json().catch(() => null)
}

export const deleteJson = async <T>(url: string): Promise<T | null> => {
  const res = await fetch(url, { method: 'DELETE' }).catch(() => null)
  if (!res || !res.ok) return null
  return res.json().catch(() => null)
}
