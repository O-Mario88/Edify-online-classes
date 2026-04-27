import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_COUNTRY, type CountryCode } from '@/config/countries';

const STORAGE_KEY = 'maple:country';

interface CountryState {
  /** ISO-2 country code currently in effect. */
  code: CountryCode;
  /** True until the persisted choice has been hydrated from disk. */
  hydrated: boolean;
  setCode: (code: CountryCode) => Promise<void>;
  hydrate: () => Promise<void>;
}

/**
 * Persisted country preference. Lives in AsyncStorage (not SecureStore)
 * because the choice isn't sensitive — it just decides which currency
 * + curriculum labels we render. Hydration is a one-shot async at app
 * boot so initial paint can show the default while we read.
 */
export const useCountryStore = create<CountryState>((set, get) => ({
  code: DEFAULT_COUNTRY,
  hydrated: false,

  async hydrate() {
    if (get().hydrated) return;
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw === 'UG' || raw === 'KE') {
        set({ code: raw, hydrated: true });
        return;
      }
    } catch {
      // ignore — fall through to default
    }
    set({ hydrated: true });
  },

  async setCode(code) {
    set({ code });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, code);
    } catch {
      // best-effort; the in-memory state still flips
    }
  },
}));

/** Convenience read — returns the current code without subscribing the
 *  caller to changes. Use the hook inside React components instead. */
export const getCountryCode = (): CountryCode => useCountryStore.getState().code;
