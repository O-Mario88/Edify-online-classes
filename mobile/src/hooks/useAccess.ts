import type { AccessStatus } from '@/api/access.api';

/**
 * Paywall removed — the hook always reports an active, open scope so
 * `PaywallGate` and any callers that branch on `has_active_access`
 * unconditionally render through to the protected children.
 */
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

export const useAccess = () => ({
  status: ALWAYS_OPEN,
  loading: false,
  error: null,
  refetch: async () => {
    /* paywall disabled — nothing to refresh */
  },
});
