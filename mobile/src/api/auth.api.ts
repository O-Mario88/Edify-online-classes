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
};
