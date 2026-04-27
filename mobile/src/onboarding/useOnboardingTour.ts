import { useCallback, useEffect, useState } from 'react';
import { useOnboardingStore } from '@/storage/onboardingStore';
import type { TourRole } from './tours';

interface UseOnboardingTourResult {
  /** Role to show in the tour modal, or null when nothing should fire. */
  role: TourRole | null;
  /** Mark the role seen and dismiss the modal. */
  dismiss: () => void;
  /** Reset and re-trigger the tour for the current role (for "Replay tour"). */
  replay: () => Promise<void>;
}

/**
 * Drives the onboarding tour for one role. Pass the role of the current
 * surface (e.g. 'student' on the student home) and the hook will:
 *
 *   1. Hydrate the seen-roles ledger from AsyncStorage on first mount.
 *   2. Surface the role in the returned `role` slot only on first ever
 *      visit for that role on this device.
 *   3. Mark the role seen as soon as the user dismisses or finishes.
 *
 * The `replay()` call is the escape hatch for the "Show me again"
 * affordance on the profile screen — it resets the ledger entry and
 * re-opens the tour without waiting for a navigation cycle.
 */
export const useOnboardingTour = (currentRole: TourRole): UseOnboardingTourResult => {
  const hydrated = useOnboardingStore((s) => s.hydrated);
  const seen = useOnboardingStore((s) => s.seenRoles.has(currentRole));
  const hydrate = useOnboardingStore((s) => s.hydrate);
  const markSeen = useOnboardingStore((s) => s.markSeen);
  const reset = useOnboardingStore((s) => s.reset);

  const [active, setActive] = useState(false);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    if (!seen) setActive(true);
  }, [hydrated, seen]);

  const dismiss = useCallback(() => {
    setActive(false);
    void markSeen(currentRole);
  }, [markSeen, currentRole]);

  const replay = useCallback(async () => {
    await reset(currentRole);
    setActive(true);
  }, [reset, currentRole]);

  return {
    role: active ? currentRole : null,
    dismiss,
    replay,
  };
};
