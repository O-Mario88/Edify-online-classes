import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TourRole } from '@/onboarding/tours';

const STORAGE_KEY = 'maple:onboarding-seen-roles';

interface OnboardingState {
  /** Roles the user has already completed the tour for, on this device. */
  seenRoles: Set<TourRole>;
  /** True until the persisted set has been hydrated from disk. */
  hydrated: boolean;
  hasSeen: (role: TourRole) => boolean;
  markSeen: (role: TourRole) => Promise<void>;
  reset: (role: TourRole) => Promise<void>;
  hydrate: () => Promise<void>;
}

const VALID_ROLES: TourRole[] = ['student', 'parent', 'teacher', 'institution_admin'];

const parseStored = (raw: string | null): Set<TourRole> => {
  if (!raw) return new Set();
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((r): r is TourRole => VALID_ROLES.includes(r)));
  } catch {
    return new Set();
  }
};

const persist = async (roles: Set<TourRole>) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...roles]));
  } catch {
    // best-effort; in-memory state still flips
  }
};

/**
 * Per-role onboarding-tour ledger. We track which roles have seen the
 * tour rather than a single boolean because the same device can host a
 * student account and a parent account in turn — each role gets its
 * tour once.
 */
export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  seenRoles: new Set(),
  hydrated: false,

  hasSeen(role) {
    return get().seenRoles.has(role);
  },

  async hydrate() {
    if (get().hydrated) return;
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      set({ seenRoles: parseStored(raw), hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  async markSeen(role) {
    const next = new Set(get().seenRoles);
    next.add(role);
    set({ seenRoles: next });
    await persist(next);
  },

  async reset(role) {
    const next = new Set(get().seenRoles);
    next.delete(role);
    set({ seenRoles: next });
    await persist(next);
  },
}));
