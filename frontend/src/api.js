const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

function getToken() {
  try { return localStorage.getItem('auth_token') || ''; } catch { return ''; }
}

export function setToken(token) {
  try { token ? localStorage.setItem('auth_token', token) : localStorage.removeItem('auth_token'); } catch {}
}

export async function api(path, opts = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    ...opts,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      setToken('');
    }
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data;
}

export const authApi = {
  async signup({ email, password, fullName }) {
    return api('/api/auth/signup', { method: 'POST', body: { email, password, fullName } });
  },
  async login({ email, password }) {
    return api('/api/auth/login', { method: 'POST', body: { email, password } });
  },
  async me() {
    return api('/api/auth/me');
  }
};
