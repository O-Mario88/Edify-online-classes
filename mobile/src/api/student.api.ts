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

  /** GET /live-sessions/live-session/ — full upcoming live class list.
   *
   * DRF paginates this endpoint by default ({count, next, previous,
   * results}). We unwrap to a plain array on the client so the Live
   * tab keeps its simple `RawSession[]` shape regardless of whether
   * pagination is on, off, or returns a bare list. */
  async liveSessions() {
    const { data, error } = await api.get<any>('/live-sessions/live-session/');
    if (error) return { data: null, error };
    const items: any[] = Array.isArray(data) ? data : (data?.results || []);
    return { data: items, error: null };
  },

  /** GET /mobile/lesson/<id>/ — single-payload lesson detail. */
  lesson(id: number | string) {
    return api.get<LessonDetailPayload>(`/mobile/lesson/${id}/`);
  },

  /** POST /mobile/lesson/<id>/mark-attended/ — idempotent attendance. */
  markLessonAttended(id: number | string, durationMinutes = 0) {
    return api.post(`/mobile/lesson/${id}/mark-attended/`, { duration_minutes: durationMinutes });
  },

  /** GET /assessments/assessment/<id>/ — assessment + nested questions. */
  assessment(id: number | string) {
    return api.get<AssessmentDetailPayload>(`/assessments/assessment/${id}/`);
  },

  /** POST /assessments/submission/ — backend auto-grades MCQ. */
  submitAssessment(assessmentId: number | string, answers: Record<string, string>) {
    return api.post<AssessmentSubmissionResponse>('/assessments/submission/', {
      assessment: assessmentId,
      answers_data: answers,
    });
  },
};

export interface LessonNoteBlock {
  id: number;
  content_blocks: Record<string, unknown>;
  updated_at: string | null;
}

export interface LessonRecordingItem {
  id: number;
  url: string;
  duration_seconds: number;
}

export interface LessonDetailPayload {
  id: number;
  title: string;
  class_name: string;
  subject: string;
  topic: string;
  access_mode: string;
  scheduled_at: string | null;
  published_at: string | null;
  notes: LessonNoteBlock[];
  recordings: LessonRecordingItem[];
  attendance: { status: string; duration_minutes: number; recorded_at: string | null } | null;
}

export type QuestionType = 'mcq' | 'short_answer' | 'essay';

export interface AssessmentQuestion {
  id: number;
  type: QuestionType;
  content: string;
  marks: number;
  order: number;
  options: string[];
}

export interface AssessmentDetailPayload {
  id: number;
  title: string;
  instructions: string;
  type: string;
  max_score: number;
  is_published: boolean;
  questions: AssessmentQuestion[];
}

export interface AssessmentSubmissionResponse {
  id: number;
  status: 'draft' | 'submitted' | 'graded';
  total_score: number | string | null;
  submitted_at: string | null;
}
