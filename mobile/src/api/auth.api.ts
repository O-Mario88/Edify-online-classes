import { api } from './client';
import type { PersistedUser } from '@/auth/tokenStorage';

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  access: string;
  refresh: string;
  email?: string;
  full_name?: string;
  role?: string;
  stage?: 'primary' | 'secondary';
}

interface RegisterPayload {
  email: string;
  full_name: string;
  password: string;
  country_code: string;
  role: 'student' | 'teacher' | 'institution' | 'admin';
  stage?: 'primary' | 'secondary';
}

export const authApi = {
  /** POST /auth/token/ — JWT login. Anonymous (no Authorization header). */
  login(payload: LoginPayload) {
    return api.post<LoginResponse>('/auth/token/', payload, { anonymous: true });
  },

  /** POST /auth/register/ — public signup. */
  register(payload: RegisterPayload) {
    return api.post<{ id: number; email: string }>('/auth/register/', payload, { anonymous: true });
  },

  /** Build the persisted user shape from a /token/ response. */
  toUser(resp: LoginResponse, fallbackEmail: string): PersistedUser {
    return {
      id: 0, // backend doesn't return id from /token/; refresh on next /me/ call
      email: resp.email || fallbackEmail,
      full_name: resp.full_name || fallbackEmail.split('@')[0],
      role: resp.role || 'student',
      stage: resp.stage,
    };
  },

  /** POST /auth/forgot-password/ — sends a reset link to the email. */
  forgotPassword(email: string) {
    return api.post<{ message: string }>(
      '/auth/forgot-password/',
      { email: email.trim() },
      { anonymous: true },
    );
  },

  /** POST /auth/activate/ — confirms an email-verification link.
   *  The activation email links to a deep-link `/(auth)/verify-email?uid=…&token=…`
   *  which extracts the params and POSTs them here. */
  activate(uid: string, token: string) {
    return api.post<{ message: string }>(
      '/auth/activate/',
      { uid, token },
      { anonymous: true },
    );
  },

  /** POST /auth/reset-password/ — backend endpoint TODO.
   *  The reset email currently links to the web app; we ship the
   *  mobile screen ready for when the API ships so the deep link
   *  works on day one. */
  resetPassword(payload: { uid: string; token: string; password: string }) {
    return api.post<{ message: string }>('/auth/reset-password/', payload, { anonymous: true });
  },
};
