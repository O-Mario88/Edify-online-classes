import { api } from './client';

// ── Shared lightweight shapes ────────────────────────────────────────

export interface PracticeLabSummary {
  id: number | string;
  title: string;
  subject: string;
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | string;
  duration_minutes?: number;
  steps_count?: number;
  badge_label?: string;
}

export interface PracticeLabAttempt {
  id: number | string;
  lab_id: number | string;
  status: 'in_progress' | 'completed' | 'failed' | string;
  score?: number;
  badge_earned?: boolean;
  started_at: string;
  completed_at?: string;
}

export interface MasteryTrack {
  id: number | string;
  title: string;
  subject: string;
  level?: string;
  modules_count?: number;
  description?: string;
}

export interface MasteryEnrollment {
  id: number | string;
  track_id: number | string;
  track_title: string;
  subject: string;
  progress_percent: number;
  next_item_title?: string;
  certificate_eligible?: boolean;
}

export interface MasteryProjectSummary {
  id: number | string;
  title: string;
  subject: string;
  rubric_summary?: string;
  due_at?: string | null;
}

export interface MasteryProjectSubmission {
  id: number | string;
  project_id: number | string;
  project_title: string;
  status: 'draft' | 'submitted' | 'reviewed' | 'revisions_requested' | string;
  score?: number | null;
  feedback?: string | null;
  updated_at: string;
}

export interface ExamSimulation {
  id: number | string;
  title: string;
  subject: string;
  level?: string;
  duration_minutes: number;
  questions_count?: number;
}

export interface ExamAttempt {
  id: number | string;
  exam_id: number | string;
  exam_title: string;
  subject: string;
  status: 'in_progress' | 'completed' | string;
  score?: number;
  band?: string;
  submitted_at?: string;
}

export interface MistakeEntry {
  id: number | string;
  question_text: string;
  subject: string;
  topic?: string;
  improved?: boolean;
  source_label?: string;
  recorded_at: string;
}

export interface ReadinessReport {
  subject: string;
  band: string;
  /** 0..100 */
  readiness_pct: number;
  weak_topics: string[];
  recommended_focus?: string;
}

export interface Credential {
  id: number | string;
  title: string;
  kind: 'badge' | 'certificate' | 'project' | string;
  issued_at: string;
  verify_code?: string;
  subject?: string;
  /** Public verify URL when one exists. */
  verify_url?: string;
}

export interface PassportSnapshot {
  badges: number;
  certificates: number;
  projects_reviewed: number;
  share_url?: string | null;
  is_public?: boolean;
  recent_entries: { kind: string; title: string; issued_at: string }[];
}

export interface StandbyTeacherCard {
  id: number | string;
  full_name: string;
  subjects: string[];
  bio?: string;
  /** "online" | "office_hours" | "offline" */
  status: string;
  rating?: number;
}

export interface MySupportRequest {
  id: number | string;
  question: string;
  subject?: string;
  status: 'open' | 'claimed' | 'answered' | string;
  created_at: string;
  response?: string;
}

export interface MyMentorReview {
  id: number | string;
  kind: string;
  title: string;
  subject?: string;
  status: 'pending' | 'in_review' | 'completed' | string;
  feedback?: string;
  score?: number;
  reviewed_at?: string;
}

// ── Per-domain API namespaces ────────────────────────────────────────

const arr = <T,>(data: any): T[] => (Array.isArray(data) ? data : (data?.results || []));

export const practiceLabsApi = {
  async list(): Promise<{ data: PracticeLabSummary[] | null; error: any }> {
    const r = await api.get<any>('/practice-labs/labs/');
    return r.error ? { data: null, error: r.error } : { data: arr<PracticeLabSummary>(r.data), error: null };
  },
  detail(id: number | string) {
    return api.get<any>(`/practice-labs/labs/${id}/`);
  },
  async myAttempts(): Promise<{ data: PracticeLabAttempt[] | null; error: any }> {
    const r = await api.get<any>('/practice-labs/attempts/my/');
    return r.error ? { data: null, error: r.error } : { data: arr<PracticeLabAttempt>(r.data), error: null };
  },
  start(labId: number | string) {
    return api.post<any>(`/practice-labs/labs/${labId}/start/`, {});
  },
  submit(attemptId: number | string) {
    return api.post<any>(`/practice-labs/attempts/${attemptId}/submit/`, {});
  },
};

export const masteryApi = {
  async tracks(): Promise<{ data: MasteryTrack[] | null; error: any }> {
    const r = await api.get<any>('/mastery/tracks/');
    return r.error ? { data: null, error: r.error } : { data: arr<MasteryTrack>(r.data), error: null };
  },
  async myTracks(): Promise<{ data: MasteryEnrollment[] | null; error: any }> {
    const r = await api.get<any>('/mastery/enrollments/my-tracks/');
    return r.error ? { data: null, error: r.error } : { data: arr<MasteryEnrollment>(r.data), error: null };
  },
  enroll(trackId: number | string) {
    return api.post<any>(`/mastery/tracks/${trackId}/enroll/`, {});
  },
};

export const masteryProjectsApi = {
  async list(): Promise<{ data: MasteryProjectSummary[] | null; error: any }> {
    const r = await api.get<any>('/mastery-projects/projects/');
    return r.error ? { data: null, error: r.error } : { data: arr<MasteryProjectSummary>(r.data), error: null };
  },
  async mySubmissions(): Promise<{ data: MasteryProjectSubmission[] | null; error: any }> {
    const r = await api.get<any>('/mastery-projects/submissions/my/');
    return r.error ? { data: null, error: r.error } : { data: arr<MasteryProjectSubmission>(r.data), error: null };
  },
  startSubmission(projectId: number | string) {
    return api.post<any>(`/mastery-projects/projects/${projectId}/start-submission/`, {});
  },
  submit(submissionId: number | string) {
    return api.post<any>(`/mastery-projects/submissions/${submissionId}/submit/`, {});
  },
};

export const examSimulatorApi = {
  async exams(): Promise<{ data: ExamSimulation[] | null; error: any }> {
    const r = await api.get<any>('/exam-simulator/exams/');
    return r.error ? { data: null, error: r.error } : { data: arr<ExamSimulation>(r.data), error: null };
  },
  async myAttempts(): Promise<{ data: ExamAttempt[] | null; error: any }> {
    const r = await api.get<any>('/exam-simulator/attempts/my/');
    return r.error ? { data: null, error: r.error } : { data: arr<ExamAttempt>(r.data), error: null };
  },
  async mistakes(): Promise<{ data: MistakeEntry[] | null; error: any }> {
    const r = await api.get<any>('/exam-simulator/mistake-notebook/');
    return r.error ? { data: null, error: r.error } : { data: arr<MistakeEntry>(r.data), error: null };
  },
  async readiness(): Promise<{ data: ReadinessReport[] | null; error: any }> {
    const r = await api.get<any>('/exam-simulator/readiness/');
    return r.error ? { data: null, error: r.error } : { data: arr<ReadinessReport>(r.data), error: null };
  },
  start(examId: number | string) {
    return api.post<any>(`/exam-simulator/exams/${examId}/start/`, {});
  },
  retryMistake(id: number | string) {
    return api.post<any>(`/exam-simulator/mistake-notebook/${id}/retry/`, {});
  },
};

export const passportApi = {
  myPassport() {
    return api.get<PassportSnapshot>('/passport/my/');
  },
  share(payload: { make_public?: boolean }) {
    return api.post<{ share_url: string }>('/passport/share/', payload);
  },
  stopSharing() {
    return api.post<any>('/passport/stop-sharing/', {});
  },
  async myCredentials(): Promise<{ data: Credential[] | null; error: any }> {
    const r = await api.get<any>('/passport/credentials/my/');
    return r.error ? { data: null, error: r.error } : { data: arr<Credential>(r.data), error: null };
  },
};

export const standbySupportApi = {
  async availableTeachers(): Promise<{ data: StandbyTeacherCard[] | null; error: any }> {
    const r = await api.get<any>('/standby-teachers/availability/available/');
    return r.error ? { data: null, error: r.error } : { data: arr<StandbyTeacherCard>(r.data), error: null };
  },
  async myRequests(): Promise<{ data: MySupportRequest[] | null; error: any }> {
    const r = await api.get<any>('/standby-teachers/support-requests/my/');
    return r.error ? { data: null, error: r.error } : { data: arr<MySupportRequest>(r.data), error: null };
  },
  ask(payload: { question: string; subject?: string }) {
    return api.post<MySupportRequest>('/standby-teachers/support-requests/', payload);
  },
};

export const mentorReviewsApi = {
  async myRequests(): Promise<{ data: MyMentorReview[] | null; error: any }> {
    const r = await api.get<any>('/mentor-reviews/requests/my-requests/');
    return r.error ? { data: null, error: r.error } : { data: arr<MyMentorReview>(r.data), error: null };
  },
};
