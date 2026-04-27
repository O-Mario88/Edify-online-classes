import { api } from './client';

export type MatchLane = 'high_performer' | 'high_growth';

export interface MatchSignals {
  activity: number;
  academic: number;
  improvement: number;
  exam_readiness: number;
  project: number;
  teacher_feedback?: number;
}

export interface RecommendedStudentCard {
  student_id: number;
  class_level: string;
  region: string;
  country: string;
  curriculum: string;
  lane: MatchLane;
  lane_label: string;
  overall_readiness_score: number;
  average_score_pct: number;
  improvement_pct_6w: number;
  signals: MatchSignals;
}

export interface RecommendedStudentsResponse {
  institution_id: number;
  can_send_invitations: boolean;
  count: number;
  students: RecommendedStudentCard[];
}

export interface AnonymizedStudentSummary {
  visible: boolean;
  detail?: string;
  student_id?: number;
  class_level?: string;
  region?: string;
  country?: string;
  curriculum?: string;
  lane?: MatchLane;
  lane_label?: string;
  overall_readiness_score?: number;
  signals?: MatchSignals;
  gates?: { average_score_pct: number; improvement_pct_6w: number };
  reasons?: string[];
  badges?: { slug: string; title: string; description: string }[];
  preferences?: {
    open_to_scholarships: boolean;
    open_to_boarding: boolean;
    open_to_day: boolean;
    open_to_school_visit_invites: boolean;
    open_to_preview_class_invites: boolean;
    national_search_only: boolean;
  };
}

export interface MatchEligibilityState {
  verified: boolean;
  admission_open: boolean;
  activeness_score: number;
  minimum_activity_met: boolean;
  can_view_student_matches: boolean;
  can_send_invitations: boolean;
}

export interface MatchPipelineSummary {
  institution_id: number;
  eligibility: MatchEligibilityState;
  pipeline: {
    invitations_sent: number;
    invitations_accepted: number;
    invitations_declined: number;
    invitations_awaiting: number;
    passport_requests_pending: number;
    passport_requests_approved: number;
    applications_received: number;
  };
}

export interface RecommendedStudentsFilters {
  lane?: MatchLane;
  country?: string;
  region?: string;
  curriculum?: string;
  class_level?: string;
  scholarship_only?: boolean;
  limit?: number;
}

// ── Phase 9.5 — Scholarships ───────────────────────────────────────

export type ScholarshipKind =
  | 'academic'
  | 'financial_need'
  | 'exam_candidate'
  | 'boarding'
  | 'girl_child_stem'
  | 'orphan'
  | 'high_performer'
  | 'other';

export type ScholarshipAmountBand =
  | 'partial_25' | 'partial_50' | 'partial_75'
  | 'full' | 'stipend' | 'custom';

export interface ScholarshipOpportunity {
  id: number;
  institution_id: number;
  institution_name: string;
  title: string;
  description: string;
  kind: ScholarshipKind;
  amount_band: ScholarshipAmountBand;
  target_class_levels: string[];
  target_subjects: string[];
  deadline: string | null;
  active: boolean;
  seats_available: number;
  created_at: string;
  updated_at: string;
}

export interface CreateScholarshipPayload {
  title: string;
  description?: string;
  kind?: ScholarshipKind;
  amount_band?: ScholarshipAmountBand;
  target_class_levels?: string[];
  target_subjects?: string[];
  deadline?: string | null;
  seats_available?: number;
}

const buildQuery = (params: Record<string, string | number | boolean | undefined>): string => {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== false)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return parts.length ? `?${parts.join('&')}` : '';
};

export type InstitutionInvitationType =
  | 'apply'
  | 'interview'
  | 'entrance_assessment'
  | 'school_visit'
  | 'preview_class'
  | 'scholarship'
  | 'boarding_admission'
  | 'information_request';

export interface InstitutionInvitation {
  id: number;
  invitation_type: InstitutionInvitationType;
  message: string;
  why_interested: string[];
  requested_share_level: string;
  status: string;
  expires_at: string | null;
  created_at: string;
  responded_at: string | null;
  learner: {
    student_id: number;
    class_level: string;
    region: string;
    lane: string;
    overall_readiness_score: number;
  };
  parent_contact?: {
    parent_id: number;
    full_name: string;
    email: string;
    phone: string;
  };
}

export interface CreateInvitationPayload {
  student_id: number | string;
  invitation_type: InstitutionInvitationType;
  message?: string;
  why_interested?: string[];
  requested_share_level?: string;
}

export const institutionMatchApi = {
  /** GET /institution-match/recommended-students/ */
  recommendedStudents(filters: RecommendedStudentsFilters = {}) {
    const qs = buildQuery({ ...filters });
    return api.get<RecommendedStudentsResponse>(
      `/institution-match/recommended-students/${qs}`,
    );
  },

  /** GET /institution-match/student-summary/<id>/ */
  studentSummary(studentId: number | string) {
    return api.get<AnonymizedStudentSummary>(
      `/institution-match/student-summary/${studentId}/`,
    );
  },

  /** GET /institution-match/pipeline/ */
  pipeline() {
    return api.get<MatchPipelineSummary>('/institution-match/pipeline/');
  },

  /** GET /institution-match/invitations/ */
  listInvitations() {
    return api.get<{ count: number; invitations: InstitutionInvitation[] }>(
      '/institution-match/invitations/',
    );
  },

  /** POST /institution-match/invitations/ */
  createInvitation(payload: CreateInvitationPayload) {
    return api.post<{ ok: boolean; invitation: InstitutionInvitation; detail?: string }>(
      '/institution-match/invitations/',
      payload,
    );
  },

  /** POST /institution-match/passport-access-request/ */
  requestPassportAccess(payload: {
    student_id: number | string;
    requested_sections: string[];
    reason?: string;
  }) {
    return api.post<{ ok: boolean; request: any; detail?: string }>(
      '/institution-match/passport-access-request/',
      payload,
    );
  },

  /** GET /institution-match/scholarships/ */
  listScholarships() {
    return api.get<{ count: number; scholarships: ScholarshipOpportunity[] }>(
      '/institution-match/scholarships/',
    );
  },

  /** POST /institution-match/scholarships/ */
  createScholarship(payload: CreateScholarshipPayload) {
    return api.post<ScholarshipOpportunity>('/institution-match/scholarships/', payload);
  },

  /** PATCH /institution-match/scholarships/<id>/ */
  updateScholarship(id: number | string, payload: Partial<CreateScholarshipPayload> & { active?: boolean }) {
    return api.patch<ScholarshipOpportunity>(`/institution-match/scholarships/${id}/`, payload);
  },

  /** DELETE /institution-match/scholarships/<id>/ — soft-delete (sets active=false). */
  deleteScholarship(id: number | string) {
    return api.delete<{ ok: boolean }>(`/institution-match/scholarships/${id}/`);
  },

  /** GET /institution-match/tier/ — current plan tier + feature matrix + invitation quota. */
  getTier() {
    return api.get<TierResponse>('/institution-match/tier/');
  },
};

export type SchoolMatchTier = 'free' | 'pro' | 'premium';

export interface TierResponse {
  institution_id: number;
  tier: SchoolMatchTier;
  features: {
    view_recommended_students: boolean;
    send_invitations: boolean;
    request_passport_access: boolean;
    view_pipeline: boolean;
    manage_scholarships: boolean;
    advanced_filters: boolean;
    admission_analytics: boolean;
  };
  invitation_quota: {
    tier: SchoolMatchTier;
    used_this_month: number;
    limit: number | null;
    remaining: number | null;
    can_send: boolean;
  };
}
