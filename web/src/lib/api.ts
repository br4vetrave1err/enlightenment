export const API_URL = import.meta.env.VITE_API_URL || '';

let refreshPromise: Promise<boolean> | null = null;

async function refreshToken(): Promise<boolean> {
  const refreshTokenValue = localStorage.getItem('refresh_token');
  if (!refreshTokenValue) return false;

  try {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshTokenValue }),
    });

    if (response.ok) {
      const { access_token, refresh_token } = await response.json();
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      return true;
    }
    
    // If refresh failed (e.g. invalid token), clear session
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/auth/login';
    return false;
  } catch {
    return false;
  }
}

async function handleTokenRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = refreshToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  let token = localStorage.getItem('access_token');

  let response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 401) {
    const refreshed = await handleTokenRefresh();
    if (refreshed) {
      token = localStorage.getItem('access_token');
      response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          ...options.headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
      });
    } else {
      throw new Error('Unauthorized');
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail?.message || error?.error?.message || `Request failed with status ${response.status}`);
  }

  return response;
}
