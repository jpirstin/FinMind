import { getToken, clearToken } from '../lib/auth';

const baseURL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:8000';

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export async function api<T = any>(path: string, opts: { method?: HttpMethod; body?: any; headers?: Record<string, string> } = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${baseURL}${path}`, {
    method: opts.method || 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    credentials: 'include',
  });

  if (res.status === 401) {
    clearToken();
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const text = await res.text();
    let msg = text;
    try {
      const obj = JSON.parse(text);
      msg = obj.error || JSON.stringify(obj);
    } catch {}
    throw new Error(msg || `HTTP ${res.status}`);
  }

  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    return (await res.json()) as T;
  }
  return (await res.text()) as unknown as T;
}
