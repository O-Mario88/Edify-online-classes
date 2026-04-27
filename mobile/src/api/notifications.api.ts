import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { api } from './client';

export interface NotificationListItem {
  id: number | string;
  channel: string;
  payload: Record<string, any>;
  status: string;
  read_at: string | null;
  created_at: string;
}

export interface NotificationsListPayload {
  unread_count: number;
  notifications: NotificationListItem[];
}

export const notificationsApi = {
  /**
   * POST /mobile/device-token/ — register the Expo push token. Server
   * upserts on (user, token) so calling on every cold start is safe.
   * Logout calls deleteToken(); see AuthProvider.logout.
   */
  registerToken(token: string) {
    return api.post('/mobile/device-token/', {
      token,
      platform: Platform.OS,
      app_version: (Constants.expoConfig?.version as string) ?? '',
    });
  },

  /** DELETE /mobile/device-token/?token=… — drop the token on logout.
   *  Token goes via query string since `api.delete` doesn't pass a
   *  body (and the server view reads from `query_params` as a fallback). */
  deleteToken(token: string) {
    return api.delete(`/mobile/device-token/?token=${encodeURIComponent(token)}`);
  },

  /** GET /mobile/notifications/ — recent in-app rows + unread_count. */
  list(params: { unread_only?: boolean; since?: string } = {}) {
    const qs = [
      params.unread_only ? 'unread_only=true' : null,
      params.since ? `since=${encodeURIComponent(params.since)}` : null,
    ].filter(Boolean).join('&');
    return api.get<NotificationsListPayload>(
      `/mobile/notifications/${qs ? `?${qs}` : ''}`,
    );
  },

  /** POST /mobile/notifications/mark-read/ — bulk mark-read. */
  markRead(ids: Array<number | string>) {
    return api.post<{ updated: number }>('/mobile/notifications/mark-read/', { ids });
  },
};
