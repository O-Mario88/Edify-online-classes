import React, { useEffect } from 'react';
import { useAuthStore } from './authStore';
import { tokenStorage } from './tokenStorage';
import { api } from '@/api/client';
import { authApi } from '@/api/auth.api';

/**
 * Boots the auth state on app start:
 *
 *   1. Reads any persisted refresh token from SecureStore.
 *   2. Calls /auth/token/refresh/ to mint a fresh access token.
 *   3. Hydrates the persisted user record into the store.
 *   4. Flips status to 'authenticated' or 'unauthenticated'.
 *
 * Route guards in app/_layout.tsx watch the status and redirect.
 */

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setUser = useAuthStore((s) => s.setUser);
  const setStatus = useAuthStore((s) => s.setStatus);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const refresh = await tokenStorage.getRefreshToken();
      if (!refresh) {
        if (!cancelled) setStatus('unauthenticated');
        return;
      }

      // Try to mint a fresh access token. We don't use api.request() here
      // because the wrapper would try to refresh again on a 401 — chicken
      // and egg. Direct fetch keeps the boot path simple.
      const { data } = await api.post<{ access?: string }>(
        '/auth/token/refresh/',
        { refresh },
        { anonymous: true },
      );
      if (cancelled) return;
      if (!data?.access) {
        await tokenStorage.clearAll();
        setStatus('unauthenticated');
        return;
      }

      setAccessToken(data.access);
      const cachedUser = await tokenStorage.getUser();
      if (cachedUser) setUser(cachedUser);
      setStatus('authenticated');
    })();
    return () => {
      cancelled = true;
    };
  }, [setAccessToken, setUser, setStatus]);

  return <>{children}</>;
};

/**
 * Login flow: hits /auth/token/, persists refresh + user, sets access in
 * memory, flips status to authenticated. Returns a friendly error
 * message when the credentials are wrong.
 */
export async function loginWithCredentials(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await authApi.login({ email: email.trim(), password });
  if (error || !data?.access || !data.refresh) {
    return {
      ok: false,
      error: error?.status === 401
        ? 'Email or password is incorrect.'
        : error?.message || 'Could not sign you in. Please try again.',
    };
  }

  const user = authApi.toUser(data, email);
  await tokenStorage.saveRefreshToken(data.refresh);
  await tokenStorage.saveUser(user);

  const store = useAuthStore.getState();
  store.setAccessToken(data.access);
  store.setUser(user);
  store.setStatus('authenticated');
  return { ok: true };
}

export async function logout(): Promise<void> {
  await tokenStorage.clearAll();
  useAuthStore.getState().reset();
}
