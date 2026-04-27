import { api } from './client';

// ── Aggregator types (used once /mobile/teacher-home/ ships) ──────────

export interface TeacherKpis {
  classes_today: number;
  pending_reviews: number;
  student_questions: number;
  earnings_this_week: number;
  payout_pending: number;
  rating: number;
}

export interface TeacherTodayClass {
  id: number | string;
  title: string;
  subject: string;
  scheduled_start: string;
  duration_minutes: number;
  student_count: number;
  meeting_link: string;
}

export interface TeacherHomePayload {
  user: {
    id: number;
    email: string;
    full_name: string;
    role: string;
  };
  kpis: TeacherKpis;
  today_classes: TeacherTodayClass[];
  pending_reviews: number;
  unread_questions: number;
  fetched_at: string;
}

// ── Per-domain types (live today off existing per-app endpoints) ──────

export interface ReviewQueueItem {
  id: number | string;
  /** "essay" | "project" | "lab_attempt" | "exam_essay" | etc. */
  kind: string;
  title: string;
  student_name: string;
  subject?: string;
  submitted_at: string;
  priority?: 'normal' | 'urgent';
}

export interface SupportRequestSummary {
  id: number | string;
  question: string;
  subject?: string;
  student_name: string;
  status: string;
  created_at: string;
}

export interface AvailabilityRecord {
  id?: number | string;
  is_available: boolean;
  subjects?: string[];
  starts_at?: string | null;
  ends_at?: string | null;
}

export interface EarningsSummary {
  currency: string;
  this_month: number;
  pending_payout: number;
  paid_reviews: number;
  paid_classes: number;
  course_enrollments: number;
  payout_profile_status?: 'verified' | 'pending' | 'missing' | string;
}

export const teacherApi = {
  /**
   * GET /mobile/teacher-home/ — single-call aggregator for the teacher
   * dashboard. Endpoint TBD; until it ships the home composes from the
   * per-domain methods below.
   */
  home() {
    return api.get<TeacherHomePayload>('/mobile/teacher-home/');
  },

  /** GET /live-sessions/live-session/?mine=true — teacher's own classes. */
  async todayLiveSessions() {
    const { data, error } = await api.get<any>('/live-sessions/live-session/?mine=true');
    if (error) return { data: null, error };
    const items: TeacherTodayClass[] = Array.isArray(data) ? data : (data?.results || []);
    return { data: items, error: null };
  },

  /** GET /mentor-reviews/requests/teacher-queue/ */
  async reviewQueue() {
    const { data, error } = await api.get<any>('/mentor-reviews/requests/teacher-queue/');
    if (error) return { data: null, error };
    const items: ReviewQueueItem[] = Array.isArray(data) ? data : (data?.results || []);
    return { data: items, error: null };
  },

  reviewDetail(id: string | number) {
    return api.get<any>(`/mentor-reviews/requests/${id}/`);
  },

  acceptReview(id: string | number) {
    return api.post<any>(`/mentor-reviews/requests/${id}/accept/`, {});
  },

  respondReview(id: string | number, payload: { feedback: string; score?: number; rubric?: any }) {
    return api.post<any>(`/mentor-reviews/requests/${id}/respond/`, payload);
  },

  /** GET /standby-teachers/support-requests/teacher-queue/ */
  async supportInbox() {
    const { data, error } = await api.get<any>('/standby-teachers/support-requests/teacher-queue/');
    if (error) return { data: null, error };
    const items: SupportRequestSummary[] = Array.isArray(data) ? data : (data?.results || []);
    return { data: items, error: null };
  },

  acceptQuestion(id: string | number) {
    return api.post<any>(`/standby-teachers/support-requests/${id}/accept/`, {});
  },

  resolveQuestion(id: string | number, payload: { response: string }) {
    return api.post<any>(`/standby-teachers/support-requests/${id}/resolve/`, payload);
  },

  /** GET /standby-teachers/availability/ — list per-user, return latest. */
  async myAvailability() {
    const { data, error } = await api.get<any>('/standby-teachers/availability/');
    if (error) return { data: null, error };
    const items: AvailabilityRecord[] = Array.isArray(data) ? data : (data?.results || []);
    return { data: items[0] ?? null, error: null };
  },

  setAvailability(payload: AvailabilityRecord) {
    return api.post<AvailabilityRecord>('/standby-teachers/availability/', payload);
  },

  /**
   * Earnings — backend endpoint TBD. Returns a graceful empty shape so
   * the UI shows an honest "Earnings will appear here once you teach"
   * empty state until /mobile/teacher-earnings/ ships.
   */
  async earnings(): Promise<{ data: EarningsSummary | null; error: any }> {
    return {
      data: {
        currency: 'USD',
        this_month: 0,
        pending_payout: 0,
        paid_reviews: 0,
        paid_classes: 0,
        course_enrollments: 0,
        payout_profile_status: 'missing',
      },
      error: null,
    };
  },

  /** GET /marketplace/listings/?mine=true — teacher's own published lessons. */
  async myListings() {
    const { data, error } = await api.get<any>('/marketplace/listings/?mine=true');
    if (error) return { data: null, error };
    const items = Array.isArray(data) ? data : (data?.results || []);
    return { data: items as MarketplaceListing[], error: null };
  },

  /**
   * GET /assessments/submission/?status=needs_grading — submissions
   * waiting for the teacher to grade. The backend serializer should
   * filter to assessments owned by this teacher; we pass it through.
   */
  async pendingGrading() {
    const { data, error } = await api.get<any>('/assessments/submission/?status=needs_grading');
    if (error) return { data: null, error };
    const items = Array.isArray(data) ? data : (data?.results || []);
    return { data: items as PendingGrade[], error: null };
  },
};

export interface MarketplaceListing {
  id: number | string;
  title: string;
  subject?: string;
  price?: number;
  currency?: string;
  status?: 'draft' | 'published' | 'archived' | string;
  enrollment_count?: number;
  rating?: number;
  cover_url?: string;
}

export interface PendingGrade {
  id: number | string;
  assessment_title: string;
  student_name: string;
  submitted_at: string;
  question_count?: number;
  rubric_score?: number | null;
}
