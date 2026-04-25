import Constants from 'expo-constants';

/**
 * Mobile app environment.
 *
 * apiBaseUrl is sourced from app.json `extra.apiBaseUrl` so we can
 * override per-build via EAS profile (development / staging /
 * production). Falls back to the dev backend at 127.0.0.1:8000 so a
 * fresh checkout works without env juggling.
 */
const extra = (Constants.expoConfig?.extra ?? {}) as { apiBaseUrl?: string };

export const env = {
  apiBaseUrl: extra.apiBaseUrl ?? 'http://127.0.0.1:8000',
  apiPrefix: '/api/v1',
  appVersion: (Constants.expoConfig?.version as string) ?? '0.1.0',
};

export const apiUrl = (path: string): string => {
  const base = env.apiBaseUrl.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${env.apiPrefix}${p}`;
};
