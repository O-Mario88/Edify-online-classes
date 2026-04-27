import { api } from './client';

export interface AppConfig {
  /** Floor — older clients see force-update. */
  min_supported_version: string;
  /** Latest published version on the stores. */
  latest_version: string;
  /** Hard gate. When true, every client below latest must update. */
  force_update: boolean;
  /** Soft gate. When true, the splash should show a maintenance card
   *  and disable login until cleared. */
  maintenance_mode: boolean;
  /** Map of feature-flag key → bool/string. */
  feature_flags: Record<string, boolean | string | number>;
  support_email: string;
  terms_url: string;
  privacy_url: string;
}

export const appConfigApi = {
  /**
   * GET /mobile/app-config/ — anonymous-safe.
   * Called from the splash before login so we can present the force-
   * update / maintenance gates before any token round-trip happens.
   */
  get() {
    return api.get<AppConfig>('/mobile/app-config/', { anonymous: true });
  },
};
