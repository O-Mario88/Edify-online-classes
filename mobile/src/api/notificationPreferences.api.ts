import { api } from './client';

export type NotificationChannel = 'push' | 'email' | 'whatsapp' | 'sms';

export interface NotificationPreference {
  /** Stable backend key, e.g. "live_class_reminder", "assignment_due". */
  key: string;
  enabled: boolean;
  channels: NotificationChannel[];
}

export interface NotificationPreferencesPayload {
  preferences: NotificationPreference[];
  /** ISO datetime range when push is silenced. */
  quiet_hours?: { start: string; end: string } | null;
}

export const notificationPreferencesApi = {
  /**
   * GET /mobile/notification-preferences/ — backend endpoint TBD.
   * Returns a graceful default shape so the screen can render an
   * editable list before the server endpoint ships.
   */
  async fetch(): Promise<{ data: NotificationPreferencesPayload | null; error: any }> {
    const r = await api.get<NotificationPreferencesPayload>('/mobile/notification-preferences/');
    if (r.error || !r.data) {
      return { data: null, error: r.error };
    }
    return { data: r.data, error: null };
  },

  /**
   * POST /mobile/notification-preferences/ — backend endpoint TBD.
   * Sends the full payload (server treats POST as upsert). The mobile
   * client persists the pending state locally so toggling stays
   * responsive even when the endpoint isn't wired yet.
   */
  save(payload: NotificationPreferencesPayload) {
    return api.post<NotificationPreferencesPayload>('/mobile/notification-preferences/', payload);
  },
};
