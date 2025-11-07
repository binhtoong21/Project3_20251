const base = import.meta.env.VITE_API_BASE || '/api';

function buildQuery(params = {}) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    usp.set(k, String(v));
  });
  const qs = usp.toString();
  return qs ? `?${qs}` : '';
}

export async function apiGet(path, params) {
  const res = await fetch(`${base}${path}${buildQuery(params)}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  if (!res.ok) throw new Error(`Request failed ${res.status}`);
  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body ?? {})
  });
  if (!res.ok) throw new Error(`Request failed ${res.status}`);
  return res.json();
}

export async function apiPut(path, body) {
  const res = await fetch(`${base}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body ?? {})
  });
  if (!res.ok) throw new Error(`Request failed ${res.status}`);
  return res.json();
}

export async function apiDelete(path) {
  const res = await fetch(`${base}${path}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  if (!res.ok && res.status !== 204) throw new Error(`Request failed ${res.status}`);
  try { return await res.json(); } catch { return null; }
}

export function buildQueryString(params) {
  return buildQuery(params);
}
