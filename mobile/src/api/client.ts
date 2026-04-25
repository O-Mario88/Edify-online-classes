import { apiUrl } from '@/config/env';
import { tokenStorage } from '@/auth/tokenStorage';
import { useAuthStore } from '@/auth/authStore';

/**
 * Tiny fetch wrapper.
 *
 * - Reads the access token from the in-memory auth store on every call.
 * - On a 401 it tries one refresh against /auth/token/refresh/ using the
 *   stored refresh token. If that succeeds we update the store and
 *   replay the request once. If it fails we wipe the session and let
 *   the route guard kick the user back to /login.
 * - Never throws on non-2xx — returns { data, error } so screens can
 *   render error states without try/catch boilerplate.
 */

export interface ApiResult<T> {
  data: T | null;
  error: ApiError | null;
}

export interface ApiError {
  status: number;
  message: string;
  detail?: unknown;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  // When true, skip the Authorization header even if a token is present.
  // Used by /auth/token/ and /mobile/app-config/ which must work pre-login.
  anonymous?: boolean;
  // Internal flag — we set this on a retried request after a refresh so
  // we don't loop forever if the refreshed token also gets 401.
  _retried?: boolean;
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = await tokenStorage.getRefreshToken();
  if (!refresh) return null;

  const res = await fetch(apiUrl('/auth/token/refresh/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { access?: string };
  if (!json.access) return null;
  useAuthStore.getState().setAccessToken(json.access);
  return json.access;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResult<T>> {
  const { method = 'GET', body, headers = {}, anonymous = false, _retried = false } = options;

  const accessToken = useAuthStore.getState().accessToken;
  const finalHeaders: Record<string, string> = {
    'Accept': 'application/json',
    ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
    ...headers,
  };
  if (!anonymous && accessToken) {
    finalHeaders.Authorization = `Bearer ${accessToken}`;
  }

  let res: Response;
  try {
    res = await fetch(apiUrl(path), {
      method,
      headers: finalHeaders,
      body: body
        ? (body instanceof FormData ? body : JSON.stringify(body))
        : undefined,
    });
  } catch (err) {
    return {
      data: null,
      error: { status: 0, message: 'Network error. Check your connection.' },
    };
  }

  if (res.status === 401 && !anonymous && !_retried) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiRequest<T>(path, { ...options, _retried: true });
    }
    // Refresh failed — wipe session and surface 401 so route guards
    // bounce the user back to /login.
    await tokenStorage.clearAll();
    useAuthStore.getState().reset();
  }

  let payload: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!res.ok) {
    const detail = (payload as { detail?: string })?.detail;
    return {
      data: null,
      error: {
        status: res.status,
        message: typeof detail === 'string' ? detail : `Request failed (${res.status})`,
        detail: payload,
      },
    };
  }

  return { data: (payload as T) ?? null, error: null };
}

export const api = {
  get:    <T>(p: string, opts?: Omit<RequestOptions, 'method' | 'body'>) => apiRequest<T>(p, { ...opts, method: 'GET' }),
  post:   <T>(p: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) => apiRequest<T>(p, { ...opts, method: 'POST', body }),
  patch:  <T>(p: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) => apiRequest<T>(p, { ...opts, method: 'PATCH', body }),
  delete: <T>(p: string, opts?: Omit<RequestOptions, 'method' | 'body'>) => apiRequest<T>(p, { ...opts, method: 'DELETE' }),
};
