import { create } from 'zustand';

/**
 * Selected child for the parent tabs. All five parent screens read
 * from the same store so switching child on Home propagates to
 * Progress / Reports / Messages without each tab refetching its own
 * notion of "which child."
 *
 * Persistence is intentional-ly skipped — defaulting to the first
 * linked child on app launch is fine, and we don't want to remember
 * a stale child across logins.
 */
interface ParentState {
  selectedChildId: number | null;
  setSelectedChildId: (id: number | null) => void;
}

export const useParentStore = create<ParentState>((set) => ({
  selectedChildId: null,
  setSelectedChildId: (selectedChildId) => set({ selectedChildId }),
}));
