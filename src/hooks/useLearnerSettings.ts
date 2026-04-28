import { useEffect, useState } from 'react';
import { apiGet, apiPatch } from '../lib/apiClient';

export interface LearnerSettings {
  low_data_mode: boolean;
  prefer_audio_lessons: boolean;
  allow_offline_downloads: boolean;
  whatsapp_optin: boolean;
  sms_optin: boolean;
  weekly_brief_delivery: 'email' | 'whatsapp' | 'sms';
  contact_phone: string;
  updated_at?: string;
}

const DEFAULT: LearnerSettings = {
  low_data_mode: false,
  prefer_audio_lessons: false,
  allow_offline_downloads: true,
  whatsapp_optin: false,
  sms_optin: false,
  weekly_brief_delivery: 'email',
  contact_phone: '',
};

/**
 * Per-learner progressive-enhancement settings.
 *
 * Components opt into the low-data / audio-first / offline-downloads
 * contracts by reading from this hook — the backend doesn't enforce
 * bandwidth, the UI adapts.
 *
 * Writes go through `update(patch)` — optimistic update to UI,
 * roundtrip to API; on error we roll back.
 */
export function useLearnerSettings() {
  const [settings, setSettings] = useState<LearnerSettings>(DEFAULT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await apiGet<LearnerSettings>('/learner-settings/');
      if (data) setSettings({ ...DEFAULT, ...data });
      setLoading(false);
    })();
  }, []);

  const update = async (patch: Partial<LearnerSettings>) => {
    const prev = settings;
    setSettings(s => ({ ...s, ...patch }));
    const { data, error } = await apiPatch<LearnerSettings>('/learner-settings/', patch);
    if (error) {
      setSettings(prev);
      throw error;
    }
    if (data) setSettings(s => ({ ...s, ...data }));
    return data;
  };

  return { settings, loading, update };
}

/**
 * Convenience: read the current low-data flag without the full settings
 * cost. Components that only need "should I skip autoplay?" can import
 * this and avoid a hook re-render on unrelated field changes.
 */
export function useLowDataMode(): boolean {
  const { settings } = useLearnerSettings();
  return settings.low_data_mode;
}
