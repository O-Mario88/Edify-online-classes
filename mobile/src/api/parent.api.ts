import { api } from './client';
import type { TodayPayload, StudentKpis } from './student.api';

export interface ParentChild {
  id: number;
  email: string;
  name: string;
  stage?: 'primary' | 'secondary' | null;
  relationship?: string;
  unread_count: number;
}

export interface SubjectRow {
  subject: string;
  completion: number;
  avg_score: number;
  weak_topics: number;
  confidence: 'High' | 'Medium' | 'Low' | string;
  last_activity: string;
}

export interface WeeklyBrief {
  strongest_subject: string;
  weakest_topic: string;
  attendance: number;
  lessons_completed: number;
  assessment_trend: string;
  recommended_focus: string;
  narrative: string;
}

export interface PassportSummary {
  badges: number;
  certificates: number;
  projects_reviewed: number;
}

export interface TeacherSupportSummary {
  questions_answered: number;
  pending_requests: number;
}

export interface SelectedChild {
  id: number;
  name: string;
  email: string;
  stage: 'primary' | 'secondary';
  kpis: StudentKpis;
  weekly_brief: WeeklyBrief;
  subjects: SubjectRow[];
  passport: PassportSummary;
  teacher_support: TeacherSupportSummary;
}

export interface ParentHomePayload {
  parent: { id: number; email: string; full_name: string; role: string };
  children: ParentChild[];
  selected_child: SelectedChild | null;
  today: TodayPayload;
  fetched_at: string;
}

export const parentApi = {
  /** GET /mobile/parent-home/?child_id=<id> */
  home(childId?: number | string) {
    const qs = childId ? `?child_id=${encodeURIComponent(String(childId))}` : '';
    return api.get<ParentHomePayload>(`/mobile/parent-home/${qs}`);
  },
};
