import { useCallback } from 'react';

export type LockReason = 'no_subscription' | 'expired' | 'pending_approval' | null;

export interface AccessStatus {
  has_active_access: boolean;
  active_plans: string[];
  expires_at: string | null;
  days_remaining: number | null;
  scope: 'personal' | 'institution' | 'staff' | null;
  institution: { id: number | string | null; name: string; plan_active: boolean } | null;
  lock_reason: LockReason;
  pending_request: { id: string; plan: string; created_at: string } | null;
}

const ALWAYS_OPEN: AccessStatus = {
  has_active_access: true,
  active_plans: ['open_access'],
  expires_at: null,
  days_remaining: null,
  scope: 'personal',
  institution: null,
  lock_reason: null,
  pending_request: null,
};

/**
 * Paywall removed — every caller now sees an unlocked, active state.
 * `refresh()` is kept as a no-op so existing callers compile, but no
 * network call is made and no lock can ever be set.
 */
export const useAccess = () => {
  const refresh = useCallback(async () => {
    /* paywall disabled — nothing to refresh */
  }, []);
  return { status: ALWAYS_OPEN, loading: false, error: null, refresh };
};
