import { useAuthStore } from './authStore';

/**
 * Sugar for screens that just need to read auth state. Re-exports the
 * Zustand selectors so consumers don't have to import the whole store.
 */
export const useAuth = () => {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  return { status, user, isAuthed: status === 'authenticated' };
};
