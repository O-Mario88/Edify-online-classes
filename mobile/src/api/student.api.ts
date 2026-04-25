import { api } from './client';

export interface TodayPayload {
  kind: string;
  severity: 'warning' | 'info' | 'healthy' | string;
  title: string;
  message: string;
  action_label: string;
  action_link: string;
}

export interface StudentKpis {
  overall_progress: number;
  attendance: number;
  exam_readiness: number;
  overdue_work: number;
  assessments_completed: number;
}

export interface NextLiveSession {
  id: number | string;
  title: string;
  subject: string;
  scheduled_start: string;
  duration_minutes: number;
  meeting_link: string;
}

export interface StudentHomePayload {
  user: {
    id: number;
    email: string;
    full_name: string;
    role: string;
    stage: 'primary' | 'secondary';
  };
  today: TodayPayload;
  kpis: StudentKpis;
  next_live_session: NextLiveSession | null;
  access: { tier: 'free' | 'institutional' | 'premium'; plan: string | null; expires_at: string | null };
  fetched_at: string;
}

export const studentApi = {
  /**
   * GET /mobile/student-home/
   * Single-call aggregator. Powers the entire student home screen so a
   * cold start on a 3G phone is one round-trip, not five.
   */
  home() {
    return api.get<StudentHomePayload>('/mobile/student-home/');
  },
};
