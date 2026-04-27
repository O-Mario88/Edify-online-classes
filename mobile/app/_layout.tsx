import '../global.css';
import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/auth/AuthProvider';
import { useAuth } from '@/auth/useAuth';
import { homeRouteForRole } from '@/auth/roleRouting';
import { LaunchScreen } from '@/components/LaunchScreen';
import { AppGateScreen } from '@/components/AppGateScreen';
import { OfflineBanner } from '@/components/OfflineBanner';
import { useAppConfig } from '@/hooks/useAppConfig';
import { useNotificationRouting } from '@/notifications/notificationRouting';
import { useCountryStore } from '@/storage/countryStore';

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
  const appConfig = useAppConfig();
  // Wire push-notification taps into the navigator so a tap on a
  // "Live class starts in 10 minutes" banner opens /(student)/live.
  useNotificationRouting();
  // Hydrate the persisted country choice once on boot — runs in
  // parallel with the auth refresh so it doesn't add to splash time.
  useEffect(() => {
    void useCountryStore.getState().hydrate();
  }, []);

  useEffect(() => {
    if (status === 'loading' || appConfig.gate === 'loading') return;
    if (appConfig.gate === 'force_update' || appConfig.gate === 'maintenance') return;
    const inAuthGroup = segments[0] === '(auth)';
    if (status === 'unauthenticated' && !inAuthGroup) {
      router.replace('/(auth)/welcome');
    } else if (status === 'authenticated' && inAuthGroup) {
      router.replace(homeRouteForRole(user?.role) as any);
    }
  }, [status, segments, user?.role, router, appConfig.gate]);

  // Branded launch screen during the brief refresh-token + app-config
  // boot. Replaces the previous blank state so the user sees the
  // Maple mark + breathing animation rather than nothing.
  if (status === 'loading' || appConfig.gate === 'loading') {
    return <LaunchScreen />;
  }

  // Pre-auth gates — force-update and maintenance lock the user out
  // until they update or until we lift maintenance mode.
  if (appConfig.gate === 'force_update' || appConfig.gate === 'maintenance') {
    return (
      <AppGateScreen
        variant={appConfig.gate}
        supportEmail={appConfig.config?.support_email}
        latestVersion={appConfig.config?.latest_version}
      />
    );
  }

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
                <Stack.Screen name="(teacher)" />
                <Stack.Screen name="(institution)" />
              </Stack>
              <OfflineBanner />
            </RouteGuard>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
