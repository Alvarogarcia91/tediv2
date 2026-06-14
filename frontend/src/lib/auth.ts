const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export async function getCsrfToken(): Promise<void> {
  await fetch(`${API_URL}/api/auth/csrf/`, {
    method: 'GET',
    credentials: 'include',
  });
}

export async function login(username: string, password: string): Promise<any> {
  // Always fetch CSRF first to ensure the cookie is present
  await getCsrfToken();
  const csrfToken = getCookie('csrftoken') || '';

  const res = await fetch(`${API_URL}/api/auth/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken,
    },
    body: JSON.stringify({ username, password }),
    credentials: 'include',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to login');
  }

  return res.json();
}

export async function logout(): Promise<void> {
  const csrfToken = getCookie('csrftoken') || '';
  const res = await fetch(`${API_URL}/api/auth/logout/`, {
    method: 'POST',
    headers: {
      'X-CSRFToken': csrfToken,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to logout');
  }
}

export async function getCurrentUser(): Promise<any> {
  const res = await fetch(`${API_URL}/api/auth/me/`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Not authenticated');
  }

  return res.json();
}
