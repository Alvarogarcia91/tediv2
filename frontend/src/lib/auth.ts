const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const NETWORK_ERROR_MSG =
  'No se puede conectar con el servidor (backend caído o sin red). ' +
  'Asegúrate de que Docker Desktop y los contenedores estén corriendo.';

function wrapNetworkError(err: unknown): never {
  if (err instanceof TypeError && (err.message === 'Failed to fetch' || err.message.includes('fetch'))) {
    throw new Error(NETWORK_ERROR_MSG);
  }
  throw err;
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export async function getCsrfToken(): Promise<void> {
  try {
    await fetch(`${API_URL}/api/auth/csrf/`, {
      method: 'GET',
      credentials: 'include',
    });
  } catch (err) {
    wrapNetworkError(err);
  }
}

export async function login(username: string, password: string): Promise<any> {
  try {
    await getCsrfToken();
  } catch (err) {
    wrapNetworkError(err);
  }
  const csrfToken = getCookie('csrftoken') || '';

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    });
  } catch (err) {
    wrapNetworkError(err);
    throw err; // unreachable, satisfies TypeScript
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Error ${res.status}: Credenciales incorrectas.`);
  }

  return res.json();
}

export async function logout(): Promise<void> {
  const csrfToken = getCookie('csrftoken') || '';
  try {
    const res = await fetch(`${API_URL}/api/auth/logout/`, {
      method: 'POST',
      headers: { 'X-CSRFToken': csrfToken },
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Error al cerrar sesión.');
  } catch (err) {
    wrapNetworkError(err);
  }
}

export async function getCurrentUser(): Promise<any> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/auth/me/`, {
      method: 'GET',
      credentials: 'include',
    });
  } catch (err) {
    wrapNetworkError(err);
    throw err;
  }

  if (!res.ok) throw new Error('Not authenticated');
  return res.json();
}
