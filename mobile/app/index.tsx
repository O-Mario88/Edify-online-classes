import { Redirect } from 'expo-router';
import { useAuth } from '@/auth/useAuth';
import { homeRouteForRole } from '@/auth/roleRouting';

/**
 * The literal '/' route. Bounces to the right home depending on auth
 * state. The RouteGuard in _layout.tsx already handles segment-level
 * redirects; this exists so opening the app at root never lingers on a
 * blank screen during the boot transition.
 */
export default function Index() {
  const { status, user } = useAuth();
  if (status === 'loading') return null;
  if (status === 'authenticated') {
    return <Redirect href={homeRouteForRole(user?.role) as any} />;
  }
  return <Redirect href="/(auth)/welcome" />;
}
