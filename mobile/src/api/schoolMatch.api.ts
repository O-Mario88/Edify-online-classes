import { api } from './client';

// ── Types ───────────────────────────────────────────────────────────

export interface InstitutionCard {
  id: number | string;
  name: string;
  /** Town / district. */
  location?: string;
  /** "primary" | "secondary" | "mixed" — life-stage offering. */
  stage?: string;
  /** Short positioning line shown under the name. */
  tagline?: string;
  /** Logo / cover photo URL when available. */
  cover_image?: string | null;
  /** Recommendation score 0..100, when this entry comes from /recommendations/. */
  match_score?: number;
  /** Reason strings explaining why we recommended this school. */
  match_reasons?: string[];
  fees_band?: string;
  pass_rate?: number;
}

export interface InstitutionDetail extends InstitutionCard {
  about?: string;
  facilities?: string[];
  programmes?: string[];
  contact_email?: string;
  contact_phone?: string;
  website?: string | null;
  /** True if the institution is currently accepting applications. */
  accepting_applications?: boolean;
}

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'reviewing'
  | 'shortlisted'
  | 'admitted'
  | 'waitlisted'
  | 'declined'
  | string;

export interface AdmissionApplication {
  id: number | string;
  institution: number | string;
  institution_name: string;
  status: ApplicationStatus;
  submitted_at?: string | null;
  /** Free-text decision/reviewer note set by the institution. */
  institution_note?: string;
  /** True when the parent has consented to share the Passport with the school. */
  passport_share_consent?: boolean;
  created_at: string;
  updated_at: string;
}

// ── Phase 9.1: Opportunity preferences ──────────────────────────────

export type VisibilityStatus = 'private' | 'recommended_only' | 'open_to_contact';
export type ShareLevel = 'anonymous_summary' | 'academic_summary' | 'passport_summary' | 'full_passport';
export type StudyModePreference = 'day' | 'boarding' | 'any';

export interface OpportunityPreferences {
  student_id: number;
  parent_id: number | null;
  parent_approved: boolean;
  visibility_status: VisibilityStatus;
  open_to_institution_contact: boolean;
  open_to_scholarships: boolean;
  open_to_boarding: boolean;
  open_to_day: boolean;
  open_to_school_visit_invites: boolean;
  open_to_preview_class_invites: boolean;
  national_search_only: boolean;
  preferred_countries: string[];
  preferred_regions: string[];
  preferred_curriculum: string;
  preferred_entry_level: string;
  preferred_entry_term: string;
  preferred_study_mode: StudyModePreference;
  share_level: ShareLevel;
  is_discoverable: boolean;
  updated_at: string | null;
}

const arr = <T,>(data: any): T[] => (Array.isArray(data) ? data : (data?.results || []));

export const schoolMatchApi = {
  /** GET /institution-discovery/institutions/recommendations/ — top 10. */
  async recommendations() {
    const r = await api.get<any>('/institution-discovery/institutions/recommendations/');
    return r.error ? { data: null, error: r.error } : { data: arr<InstitutionCard>(r.data), error: null };
  },

  /** GET /institution-discovery/institutions/ — full directory. */
  async list() {
    const r = await api.get<any>('/institution-discovery/institutions/');
    return r.error ? { data: null, error: r.error } : { data: arr<InstitutionCard>(r.data), error: null };
  },

  /** GET /institution-discovery/institutions/<id>/ */
  detail(id: string | number) {
    return api.get<InstitutionDetail>(`/institution-discovery/institutions/${id}/`);
  },

  /** GET /admission-passport/applications/my/ — student/parent side. */
  async myApplications() {
    const r = await api.get<any>('/admission-passport/applications/my/');
    return r.error ? { data: null, error: r.error } : { data: arr<AdmissionApplication>(r.data), error: null };
  },

  /** POST /admission-passport/applications/ — start a draft. */
  startApplication(institutionId: number | string, payload: Record<string, any> = {}) {
    return api.post<AdmissionApplication>('/admission-passport/applications/', {
      institution: institutionId,
      ...payload,
    });
  },

  /** POST /admission-passport/applications/<id>/submit/ */
  submitApplication(id: number | string, payload: { passport_share_consent?: boolean } = {}) {
    return api.post<AdmissionApplication>(`/admission-passport/applications/${id}/submit/`, payload);
  },

  /** GET /school-match/preferences/ — opt-in state for the school match
   *  marketplace. Pass `studentId` when a parent is acting on a child's
   *  preferences (we look the link up server-side). */
  getPreferences(studentId?: number | string) {
    const qs = studentId ? `?student_id=${encodeURIComponent(String(studentId))}` : '';
    return api.get<OpportunityPreferences>(`/school-match/preferences/${qs}`);
  },

  /** POST /school-match/preferences/ — upsert. Server allows only
   *  parents to write; student-self writes return 403 by design. */
  setPreferences(payload: Partial<OpportunityPreferences> & { student_id?: number | string }) {
    return api.post<OpportunityPreferences>('/school-match/preferences/', payload);
  },

  // ── Invitations (parent side) ──────────────────────────────────

  listInvitations() {
    return api.get<{ count: number; invitations: ParentInvitation[] }>(
      '/school-match/invitations/',
    );
  },
  invitationDetail(id: number | string) {
    return api.get<ParentInvitation>(`/school-match/invitations/${id}/`);
  },
  acceptInvitation(id: number | string) {
    return api.post<{ ok: boolean; invitation: ParentInvitation }>(
      `/school-match/invitations/${id}/accept/`, {},
    );
  },
  declineInvitation(id: number | string, reason: string = '') {
    return api.post<{ ok: boolean; invitation: ParentInvitation }>(
      `/school-match/invitations/${id}/decline/`, { reason },
    );
  },

  // ── Passport access requests (parent side) ─────────────────────

  listPassportRequests() {
    return api.get<{ count: number; requests: ParentPassportAccessRequest[] }>(
      '/school-match/passport-access/',
    );
  },
  approvePassportRequest(id: number | string) {
    return api.post<{ ok: boolean; request: ParentPassportAccessRequest }>(
      `/school-match/passport-access/${id}/approve/`, {},
    );
  },
  declinePassportRequest(id: number | string) {
    return api.post<{ ok: boolean; request: ParentPassportAccessRequest }>(
      `/school-match/passport-access/${id}/decline/`, {},
    );
  },
};

// ── Phase 9.4 types ────────────────────────────────────────────────

export type InvitationType =
  | 'apply'
  | 'interview'
  | 'entrance_assessment'
  | 'school_visit'
  | 'preview_class'
  | 'scholarship'
  | 'boarding_admission'
  | 'passport_access_request'
  | 'information_request';

export type InvitationStatus =
  | 'sent'
  | 'viewed'
  | 'accepted'
  | 'declined'
  | 'expired'
  | 'application_started'
  | 'application_submitted'
  | 'interview_scheduled'
  | 'offer_made'
  | 'enrolled';

export interface InvitationInstitution {
  id: number;
  name: string;
  location: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
}

export interface ParentInvitation {
  id: number;
  invitation_type: InvitationType;
  message: string;
  why_interested: string[];
  requested_share_level: ShareLevel;
  status: InvitationStatus;
  expires_at: string | null;
  created_at: string;
  responded_at: string | null;
  institution: InvitationInstitution;
}

export type PassportRequestStatus = 'pending' | 'approved' | 'declined' | 'expired' | 'revoked';

export interface ParentPassportAccessRequest {
  id: number;
  institution: InvitationInstitution;
  requested_sections: string[];
  reason: string;
  status: PassportRequestStatus;
  created_at: string;
  approved_at: string | null;
  expires_at: string | null;
}
