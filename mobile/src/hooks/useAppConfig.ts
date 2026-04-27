import { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import { appConfigApi, type AppConfig } from '@/api/appConfig.api';

export type AppConfigGate = 'ok' | 'force_update' | 'maintenance' | 'loading' | 'failed';

interface State {
  config: AppConfig | null;
  gate: AppConfigGate;
  /** Set when the fetch fails or returns nothing — splash shows a
   *  silent retry, never a hard error (the app should still work). */
  error: string | null;
}

const isVersionBelow = (current: string, floor: string): boolean => {
  const a = current.split('.').map((p) => parseInt(p, 10) || 0);
  const b = floor.split('.').map((p) => parseInt(p, 10) || 0);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] || 0;
    const y = b[i] || 0;
    if (x < y) return true;
    if (x > y) return false;
  }
  return false;
};

/**
 * Fetches /mobile/app-config/ once on mount and computes which gate
 * the splash should show. The gates are:
 *
 *   loading       — splash is still showing the spinner.
 *   maintenance   — backend says we're in maintenance mode.
 *   force_update  — current app version < min_supported_version.
 *   failed        — fetch errored. Treated as 'ok' so a backend hiccup
 *                   never locks the app, but logged for observability.
 *   ok            — proceed to auth flow.
 */
export const useAppConfig = (): State => {
  const [state, setState] = useState<State>({ config: null, gate: 'loading', error: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await appConfigApi.get();
      if (cancelled) return;
      if (error || !data) {
        setState({ config: null, gate: 'failed', error: error?.message || 'config unavailable' });
        return;
      }

      const currentVersion = (Constants.expoConfig?.version as string) ?? '0.0.0';

      if (data.maintenance_mode) {
        setState({ config: data, gate: 'maintenance', error: null });
        return;
      }
      if (data.force_update && isVersionBelow(currentVersion, data.min_supported_version)) {
        setState({ config: data, gate: 'force_update', error: null });
        return;
      }
      setState({ config: data, gate: 'ok', error: null });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
};
