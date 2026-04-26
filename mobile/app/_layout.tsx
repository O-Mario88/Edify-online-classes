import '../global.css';
import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/auth/AuthProvider';
import { useAuth } from '@/auth/useAuth';
import { homeRouteForRole } from '@/auth/roleRouting';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

/**
 * Root layout. Three jobs:
 *   1. Provide React Query + safe-area + gesture-handler at the top.
 *   2. Mount AuthProvider so the boot path (refresh-token → access-token)
 *      runs before any screen tries to call the API.
 *   3. Run the route guard: send unauthenticated users to /(auth)/welcome,
 *      send authenticated users to their role's home route.
 *
 * Loading state shows nothing — the splash screen is still in front of
 * us during the brief refresh-token round-trip, so we don't need a
 * fallback. If that round-trip becomes slow we can add a loading view.
 */

const RouteGuard: React.FC<React.PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const segments = useSegments();
  const { status, user } = useAuth();

  useEffect(() => {
    if (status === 'loading') return;
    const inAuthGroup = segments[0] === '(auth)';
    if (status === 'unauthenticated' && !inAuthGroup) {
      router.replace('/(auth)/welcome');
    } else if (status === 'authenticated' && inAuthGroup) {
      router.replace(homeRouteForRole(user?.role) as any);
    }
  }, [status, segments, user?.role, router]);

  return <>{children}</>;
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RouteGuard>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(student)" />
                <Stack.Screen name="(parent)" />
              </Stack>
            </RouteGuard>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
