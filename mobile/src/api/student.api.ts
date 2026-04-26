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

export type TodayTaskType =
  | 'lesson'
  | 'note'
  | 'video'
  | 'assessment'
  | 'practice_lab'
  | 'mastery_project'
  | 'live_class'
  | 'exam_practice'
  | 'teacher_support'
  | 'mistake_notebook_revision'
  | 'custom'
  | string;

export interface TodayTask {
  id: string;
  title: string;
  type: TodayTaskType;
  subject: string;
  duration_minutes: number;
  completed: boolean;
}

export interface UpcomingAssignment {
  id: number | string;
  assessment_id: number | string;
  title: string;
  subject: string;
  topic: string;
  type: string;
  max_score: number;
  close_at: string;
}

export interface RecentLesson {
  id: number | string;
  title: string;
  subject: string;
  class_name: string;
  duration_label: string;
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
  today_tasks: TodayTask[];
  kpis: StudentKpis;
  next_live_session: NextLiveSession | null;
  upcoming_assignments: UpcomingAssignment[];
  recent_lessons: RecentLesson[];
  access: { tier: 'free' | 'institutional' | 'premium'; plan: string | null; expires_at: string | null };
  fetched_at: string;
}

export const studentApi = {
  /**
   * GET /mobile/student-home/
   * Single-call aggregator. Powers Home / Learn / Live / Tasks tabs on
   * cold start so a 3G phone is one round-trip, not five.
   */
  home() {
    return api.get<StudentHomePayload>('/mobile/student-home/');
  },

  /** GET /live-sessions/live-session/ — full upcoming live class list. */
  liveSessions() {
    return api.get<any[]>('/live-sessions/live-session/');
  },
};
