import { create } from 'zustand';
import type { PersistedUser } from './tokenStorage';

/**
 * Single source of truth for auth state. Purposely minimal — anything
 * that needs persistence goes through tokenStorage; this store only
 * holds the in-memory access token + the hydrated user.
 *
 * Why no `persist` middleware: the access token must never touch the
 * filesystem, and the refresh token / user record live in SecureStore
 * for at-rest encryption.
 */

export type AuthStatus = 'loading' | 'unauthenticated' | 'authenticated';

interface AuthState {
  status: AuthStatus;
  accessToken: string | null;
  user: PersistedUser | null;

  setAccessToken: (token: string | null) => void;
  setUser: (user: PersistedUser | null) => void;
  setStatus: (status: AuthStatus) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  accessToken: null,
  user: null,

  setAccessToken: (accessToken) => set({ accessToken }),
  setUser: (user) => set({ user }),
  setStatus: (status) => set({ status }),
  reset: () => set({ status: 'unauthenticated', accessToken: null, user: null }),
}));
