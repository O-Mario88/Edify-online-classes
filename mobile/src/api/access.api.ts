import { api } from './client';

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

export const accessApi = {
  /** GET /pilot-payments/access/status/ — single source of truth for the
   *  paywall decision. The mobile useAccess hook polls this on every
   *  cold start + on every navigation back to a gated layout. */
  status() {
    return api.get<AccessStatus>('/pilot-payments/access/status/');
  },
};
