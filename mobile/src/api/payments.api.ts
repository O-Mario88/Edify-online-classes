import { api } from './client';

export type PlanKey =
  | 'free'
  | 'learner_plus'
  | 'parent_premium'
  | 'teacher_pro'
  | 'school_os'
  | 'school_os_plus';

export type UpgradeStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type PaymentMethod = 'mtn_momo' | 'airtel_money' | 'mpesa' | 'cash' | 'other';

export interface PremiumAccess {
  id: number | string;
  plan: PlanKey;
  granted_at: string;
  expires_at: string | null;
  is_active: boolean;
}

export interface UpgradeRequestDto {
  id: string;
  requester: number;
  requester_name?: string;
  plan: PlanKey;
  contact_phone: string;
  preferred_method: PaymentMethod | '';
  note: string;
  status: UpgradeStatus;
  admin_note?: string;
  reviewed_at: string | null;
  created_at: string;
}

const arr = <T,>(data: any): T[] => (Array.isArray(data) ? data : (data?.results || []));

export const paymentsApi = {
  /** GET /pilot-payments/premium-access/ — active plans for the user. */
  async myPremiumAccess() {
    const r = await api.get<any>('/pilot-payments/premium-access/');
    return r.error ? { data: null, error: r.error } : { data: arr<PremiumAccess>(r.data), error: null };
  },

  /** GET /pilot-payments/upgrade-requests/ — every request the user has filed. */
  async myUpgradeRequests() {
    const r = await api.get<any>('/pilot-payments/upgrade-requests/');
    return r.error ? { data: null, error: r.error } : { data: arr<UpgradeRequestDto>(r.data), error: null };
  },

  /** POST /pilot-payments/upgrade-requests/ — request an upgrade. */
  requestUpgrade(payload: {
    plan: PlanKey;
    contact_phone: string;
    preferred_method: PaymentMethod | '';
    note?: string;
  }) {
    return api.post<UpgradeRequestDto>('/pilot-payments/upgrade-requests/', payload);
  },
};
