/**
 * Demo sample data for empty dashboard states.
 *
 * When a new account has no data yet, cards can opt into showing a
 * realistic preview ("Preview how your Weekly Child Progress Brief
 * will look once your child starts learning") instead of a bleak
 * empty message. Samples are clearly labeled as previews — never
 * conflated with real progress.
 *
 * Toggle via `useDemoMode()`; default OFF for real accounts that
 * already have data.
 */

export interface DemoSamples {
  weeklyBrief: {
    narrative: string;
    strongest: string;
    weakest: string;
    trend: string;
    focus: string;
  };
  teacherSupport: {
    projects_reviewed: number;
    questions_answered: number;
    live_classes_attended: number;
    most_recent_reviewer: string;
  };
  todaysPlan: Array<{
    title: string; task_type: string; subject_name: string; estimated_minutes: number;
  }>;
  examReadiness: Array<{
    exam_track: string; attempts: number; avg_pct: number; readiness_band: string;
  }>;
}

export const DEMO_SAMPLES: DemoSamples = {
  weeklyBrief: {
    narrative:
      "Asha completed 4 of 5 lessons this week, submitted her first Mastery Project, and scored 78% on a Maths quiz — strongest improvement since enrollment. Teacher Amos reviewed her speech project with 'Strong diction; work on tempo.'",
    strongest: 'Mathematics',
    weakest: 'Essay composition',
    trend: 'Up 8% vs last week',
    focus: 'Redraft the argumentative essay using the rubric feedback.',
  },
  teacherSupport: {
    projects_reviewed: 1,
    questions_answered: 2,
    live_classes_attended: 1,
    most_recent_reviewer: 'Teacher Amos',
  },
  todaysPlan: [
    { title: 'Watch: Fractions Made Simple', task_type: 'video', subject_name: 'Mathematics', estimated_minutes: 12 },
    { title: 'Complete: Fractions Practice Lab', task_type: 'practice', subject_name: 'Mathematics', estimated_minutes: 20 },
    { title: 'Submit: Family Budget Project draft', task_type: 'project', subject_name: 'Mathematics', estimated_minutes: 45 },
    { title: 'Attend: Live Mathematics Support at 4:00 PM', task_type: 'live_session', subject_name: 'Mathematics', estimated_minutes: 30 },
    { title: 'Revise: 10 questions from your Mistake Notebook', task_type: 'revision', subject_name: 'Mixed', estimated_minutes: 15 },
  ],
  examReadiness: [
    { exam_track: 'PLE', attempts: 3, avg_pct: 72, readiness_band: 'moderate' },
  ],
};


const DEMO_MODE_KEY = 'maple.demoMode';

export function isDemoModeOn(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(DEMO_MODE_KEY) === '1';
}

export function setDemoMode(on: boolean): void {
  if (typeof window === 'undefined') return;
  if (on) window.localStorage.setItem(DEMO_MODE_KEY, '1');
  else window.localStorage.removeItem(DEMO_MODE_KEY);
}
