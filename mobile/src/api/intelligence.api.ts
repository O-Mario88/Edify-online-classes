import { api } from './client';

/** Long-term student growth profile (intelligence app's StudentPassport). */
export interface StudentPassportPayload {
  student?: { id: number; full_name: string; email: string };
  strongest_subjects: string[];
  weakest_subjects: string[];
  overall_gpa: number;
  total_lessons_attended: number;
  total_resources_completed: number;
  total_assessments_submitted: number;
  current_streak_days: number;
  longest_streak_days: number;
  badges: Array<{ id: number | string; name: string; earned_at?: string; category?: string }>;
  commendations: Array<{ message: string; from?: string; date?: string }>;
  interventions_completed: number;
  peer_support_given: number;
  peer_support_received: number;
  career_interests: string[];
  recommended_paths: string[];
  timeline: Array<{ kind: string; label: string; date?: string }>;
  updated_at?: string;
}

/** Mirror of intelligence.TeacherPassport for the teacher progress surface. */
export interface TeacherPassportPayload {
  teacher?: { id: number; full_name: string };
  total_lessons_delivered: number;
  total_classes_taught: number;
  total_resources_created: number;
  total_students_impacted: number;
  average_student_improvement: number;
  badges: Array<{ id: number | string; name: string }>;
  commendations: Array<{ message: string; from?: string; date?: string }>;
  challenge_wins: number;
}

/** School-health snapshot consumed by institution surfaces. */
export interface InstitutionHealthPayload {
  institution: { id: number | string; name: string };
  health_score: number;
  attendance_pct: number;
  teacher_delivery_pct: number;
  parent_engagement_pct: number;
  risk_alerts: Array<{
    id: number;
    kind: string;
    severity: 'info' | 'warning' | 'critical';
    subject?: string;
    message: string;
    created_at?: string;
  }>;
  computed_at?: string;
}

export interface StudyTask {
  id: number;
  type: 'revision' | 'assignment' | 'practice' | 'video' | 'reading' | 'intervention' | 'live_session' | 'project';
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'rescheduled';
  urgency: 'urgent' | 'normal' | 'optional';
  title: string;
  description?: string;
  estimated_minutes: number;
  actual_minutes?: number | null;
  scheduled_for?: string | null;
  subject?: string;
  topic?: string;
}

export interface StudyPlanPayload {
  id: number;
  week_start: string;
  week_end: string;
  total_estimated_minutes: number;
  completed_minutes: number;
  tasks?: StudyTask[];
}

const arr = <T,>(d: any): T[] => (Array.isArray(d) ? d : (d?.results || []));

export const intelligenceApi = {
  /** GET /intelligence/passport/student/ — current student's growth profile. */
  studentPassport() {
    return api.get<StudentPassportPayload>('/intelligence/passport/student/');
  },
  /** GET /intelligence/passport/teacher/ — current teacher's impact profile. */
  teacherPassport() {
    return api.get<TeacherPassportPayload>('/intelligence/passport/teacher/');
  },
  /** GET /intelligence/health/ — institution health snapshot for the admin's school. */
  institutionHealth() {
    return api.get<InstitutionHealthPayload>('/intelligence/health/');
  },
  /** GET /intelligence/study-plans/ — list weekly plans for the current student. */
  async studyPlans() {
    const r = await api.get<any>('/intelligence/study-plans/');
    return r.error ? { data: null, error: r.error } : { data: arr<StudyPlanPayload>(r.data), error: null };
  },
  /** GET /intelligence/study-plans/{id}/ — full plan with tasks. */
  studyPlan(id: number) {
    return api.get<StudyPlanPayload>(`/intelligence/study-plans/${id}/`);
  },
  /** POST /intelligence/study-plans/generate/ — fresh plan for this week. */
  generateStudyPlan() {
    return api.post<StudyPlanPayload>('/intelligence/study-plans/generate/', {});
  },
  /** GET /intelligence/study-plans/today/ — today's tasks. */
  async studyPlanToday() {
    const r = await api.get<any>('/intelligence/study-plans/today/');
    return r.error ? { data: null, error: r.error } : { data: arr<StudyTask>(r.data), error: null };
  },
  /** POST /intelligence/study-tasks/{id}/complete/ — mark a task done. */
  completeTask(id: number, actualMinutes?: number) {
    return api.post<StudyTask>(`/intelligence/study-tasks/${id}/complete/`, { actual_minutes: actualMinutes });
  },
};
