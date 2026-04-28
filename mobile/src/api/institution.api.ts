import { api } from './client';

// ── Aggregator types (used once /mobile/institution-home/ ships) ─────

export interface InstitutionKpis {
  health_score: number;       // 0..100
  attendance: number;         // %
  teacher_delivery: number;   // % of classes delivered on time
  parent_engagement: number;  // % of parents active in last 7d
  risk_alerts: number;        // count
  applications_inbox: number; // count of new admission interest
}

export interface InstitutionHomeRiskAlert {
  id: number | string;
  kind: string;
  severity: 'critical' | 'warning' | 'info' | string;
  subject?: string;
  message: string;
  created_at: string | null;
}

export interface InstitutionHomeApplication {
  id: number | string;
  class_level: string;
  status: string;
  created_at: string | null;
}

export interface InstitutionHomePayload {
  user: {
    id: number;
    email: string;
    full_name: string;
    role: string;
  };
  institution: {
    id: number | string;
    name: string;
    student_count: number;
    teacher_count: number;
  };
  kpis: InstitutionKpis;
  risk_alerts?: InstitutionHomeRiskAlert[];
  recent_applications?: InstitutionHomeApplication[];
  fetched_at: string;
}

// ── Per-domain types (live today off existing endpoints) ─────────────

export interface InstitutionHealthSnapshot {
  health_score: number;
  trend: string;
  attendance_pct: number;
  delivery_consistency_pct: number;
  assessment_activity_pct: number;
  parent_reporting_pct: number;
  teacher_engagement_pct: number;
  active_risk_count: number;
  growth_index?: number;
}

export interface AttendanceSummary {
  date: string;
  total_learners: number;
  present: number;
  absent: number;
  late: number;
  attendance_pct: number;
}

export interface TeacherDeliveryRow {
  teacher_id: number | string;
  teacher_name: string;
  delivered: number;
  missed: number;
  feedback_count: number;
  engagement: 'active' | 'low' | 'missing' | string;
}

export interface ParentEngagementSummary {
  reports_sent: number;
  reports_opened: number;
  parent_messages: number;
  parent_actions_completed: number;
}

export interface RiskAlert {
  id: number | string;
  kind: string;
  severity: 'high' | 'medium' | 'low' | string;
  title: string;
  body: string;
  created_at: string;
}

export interface AdmissionInboxItem {
  id: number | string;
  applicant_name: string;
  status: string;
  submitted_at: string;
  passport_share_consent: boolean;
  match_score?: number;
}

export interface InstitutionReport {
  id: number | string;
  title: string;
  cadence: string;
  generated_at: string;
  url?: string;
}

const arr = <T,>(data: any): T[] => (Array.isArray(data) ? data : (data?.results || []));

const EMPTY_HEALTH: InstitutionHealthSnapshot = {
  health_score: 0,
  trend: 'stable',
  attendance_pct: 0,
  delivery_consistency_pct: 0,
  assessment_activity_pct: 0,
  parent_reporting_pct: 0,
  teacher_engagement_pct: 0,
  active_risk_count: 0,
};

export const institutionApi = {
  /**
   * GET /mobile/institution-home/ — single-call aggregator (TBD).
   * Until it ships, the home composes from per-domain methods below.
   */
  home() {
    return api.get<InstitutionHomePayload>('/mobile/institution-home/');
  },

  /**
   * GET /analytics/admin-dashboard/ — institution-level KPIs. Coerces
   * the response into our health snapshot, falling back to zeros so
   * the UI is always renderable.
   */
  async health(): Promise<{ data: InstitutionHealthSnapshot; error: any }> {
    const r = await api.get<any>('/analytics/admin-dashboard/');
    if (r.error || !r.data) return { data: EMPTY_HEALTH, error: r.error };
    const d = r.data as Record<string, any>;
    return {
      data: {
        health_score: d.health_score ?? d.platform_activeness_score ?? 0,
        trend: d.trend || 'stable',
        attendance_pct: d.attendance_pct ?? d.attendance_rate ?? 0,
        delivery_consistency_pct: d.delivery_consistency_pct ?? 0,
        assessment_activity_pct: d.assessment_activity_pct ?? 0,
        parent_reporting_pct: d.parent_reporting_pct ?? 0,
        teacher_engagement_pct: d.teacher_engagement_pct ?? 0,
        active_risk_count: d.active_risk_count ?? d.risk_count ?? 0,
        growth_index: d.growth_index,
      },
      error: null,
    };
  },

  async attendanceSummary(): Promise<{ data: AttendanceSummary[]; error: any }> {
    const r = await api.get<any>('/attendance/daily-register/?recent=true');
    if (r.error) return { data: [], error: r.error };
    return { data: arr<AttendanceSummary>(r.data), error: null };
  },

  async teacherDelivery(): Promise<{ data: TeacherDeliveryRow[]; error: any }> {
    // Not yet wired to a dedicated endpoint — empty state until ready.
    return { data: [], error: null };
  },

  async parentEngagement(): Promise<{ data: ParentEngagementSummary; error: any }> {
    return {
      data: {
        reports_sent: 0,
        reports_opened: 0,
        parent_messages: 0,
        parent_actions_completed: 0,
      },
      error: null,
    };
  },

  async riskAlerts(): Promise<{ data: RiskAlert[]; error: any }> {
    return { data: [], error: null };
  },

  async admissionInbox(): Promise<{ data: AdmissionInboxItem[]; error: any }> {
    const r = await api.get<any>('/admission-passport/applications/institution-inbox/');
    if (r.error) return { data: [], error: r.error };
    return { data: arr<AdmissionInboxItem>(r.data), error: null };
  },

  async reports(): Promise<{ data: InstitutionReport[]; error: any }> {
    return { data: [], error: null };
  },
};
