const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function headers(token) {
  return {
    'Authorization': `Bearer ${token}`,
  }
}

export async function apiSignup(email, password) {
  const res = await fetch(`${BASE}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error((await res.json()).detail || 'Signup failed')
  return res.json()
}

export async function apiLogin(email, password) {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error((await res.json()).detail || 'Login failed')
  return res.json()
}

export async function apiStartAudit(file, token) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${BASE}/audit/start`, {
    method: 'POST',
    headers: headers(token),
    body: form,
  })
  if (!res.ok) throw new Error((await res.json()).detail || 'Audit start failed')
  return res.json()
}

export async function apiSubmitAnswer(sessionId, answer, token) {
  const res = await fetch(`${BASE}/audit/${sessionId}/answer`, {
    method: 'POST',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ answer }),
  })
  if (!res.ok) throw new Error((await res.json()).detail || 'Answer submission failed')
  return res.json()
}

export async function apiReupload(sessionId, file, token) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${BASE}/audit/${sessionId}/reupload`, {
    method: 'POST',
    headers: headers(token),
    body: form,
  })
  if (!res.ok) throw new Error((await res.json()).detail || 'Reupload failed')
  return res.json()
}

export async function apiGetTranscript(sessionId, token) {
  const res = await fetch(`${BASE}/audit/${sessionId}/transcript`, {
    headers: headers(token),
  })
  if (!res.ok) throw new Error((await res.json()).detail || 'Transcript fetch failed')
  return res.json()
}