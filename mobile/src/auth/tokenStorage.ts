import * as SecureStore from 'expo-secure-store';

/**
 * Token persistence. We store the refresh token in SecureStore (Keychain
 * on iOS, EncryptedSharedPreferences on Android). The short-lived access
 * token lives in memory only — we never persist it to disk so a stolen
 * file can't be replayed.
 */

const REFRESH_KEY = 'maple.auth.refresh';
const USER_KEY = 'maple.auth.user';
const PUSH_TOKEN_KEY = 'maple.auth.push_token';

export interface PersistedUser {
  id: number;
  email: string;
  full_name: string;
  role: string;
  stage?: 'primary' | 'secondary';
}

export const tokenStorage = {
  async saveRefreshToken(refresh: string): Promise<void> {
    await SecureStore.setItemAsync(REFRESH_KEY, refresh);
  },

  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_KEY);
  },

  async clearRefreshToken(): Promise<void> {
    await SecureStore.deleteItemAsync(REFRESH_KEY).catch(() => {});
  },

  async saveUser(user: PersistedUser): Promise<void> {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  },

  async getUser(): Promise<PersistedUser | null> {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as PersistedUser;
    } catch {
      return null;
    }
  },

  async clearUser(): Promise<void> {
    await SecureStore.deleteItemAsync(USER_KEY).catch(() => {});
  },

  async savePushToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(PUSH_TOKEN_KEY, token);
  },

  async getPushToken(): Promise<string | null> {
    return SecureStore.getItemAsync(PUSH_TOKEN_KEY);
  },

  async clearPushToken(): Promise<void> {
    await SecureStore.deleteItemAsync(PUSH_TOKEN_KEY).catch(() => {});
  },

  async clearAll(): Promise<void> {
    await Promise.all([this.clearRefreshToken(), this.clearUser(), this.clearPushToken()]);
  },
};
