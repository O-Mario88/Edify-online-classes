/**
 * Canonical KPI vocabulary shared across the learner-centric dashboards
 * (Student and Parent). Each dashboard previously named the same number
 * differently — "classProgress" vs "overallProgress", "missedTasks" vs
 * "overdueTasks", "avgPerformance" vs "readinessScore" — so a parent
 * checking on their child couldn't sanity-check the value against what
 * the student sees. This module is the single source of truth for:
 *
 * 1. The metric label (e.g. "Overall progress")
 * 2. A short description ("Lessons + assessments completed this term")
 * 3. Threshold colour rules (low/healthy)
 * 4. A reader function that pulls the metric out of either dashboard's
 *    KPI payload regardless of which key the backend used.
 *
 * Intentionally narrow scope: only learner-about-the-learner metrics.
 * Teacher / Institution / Platform metrics describe different entities
 * and should NOT be forced into this shape.
 */

export type LearnerKpiId =
  | 'overall_progress'
  | 'attendance'
  | 'exam_readiness'
  | 'overdue_work'
  | 'assessments_completed';

export interface LearnerKpiMeta {
  id: LearnerKpiId;
  label: string;
  description: string;
  /** Format the raw number for display. */
  format: (n: number) => string;
  /** "higher" → colour green when high; "lower" → green when low (e.g. overdue). */
  goodDirection: 'higher' | 'lower';
  /** Threshold below which a "higher is better" KPI turns rose. */
  warnBelow?: number;
  /** Threshold above which a "lower is better" KPI turns rose. */
  warnAbove?: number;
}

export const LEARNER_KPIS: Record<LearnerKpiId, LearnerKpiMeta> = {
  overall_progress: {
    id: 'overall_progress',
    label: 'Overall progress',
    description: 'Lessons + assessments completed this term.',
    format: (n) => `${Math.round(n)}%`,
    goodDirection: 'higher',
    warnBelow: 50,
  },
  attendance: {
    id: 'attendance',
    label: 'Attendance',
    description: 'Live classes attended this term.',
    format: (n) => `${Math.round(n)}%`,
    goodDirection: 'higher',
    warnBelow: 75,
  },
  exam_readiness: {
    id: 'exam_readiness',
    label: 'Exam readiness',
    description: 'Higher is better. Below 60 is at risk.',
    format: (n) => `${Math.round(n)}`,
    goodDirection: 'higher',
    warnBelow: 60,
  },
  overdue_work: {
    id: 'overdue_work',
    label: 'Overdue work',
    description: 'Assignments past their due date.',
    format: (n) => `${Math.round(n)}`,
    goodDirection: 'lower',
    warnAbove: 0,
  },
  assessments_completed: {
    id: 'assessments_completed',
    label: 'Assessments completed',
    description: 'Quizzes, tests, and projects scored this term.',
    format: (n) => `${Math.round(n)}`,
    goodDirection: 'higher',
  },
};

/**
 * Pull a learner KPI value out of either dashboard's `kpis` shape.
 * StudentDashboard returns:
 *   { overallProgress, attendance, readinessScore, overdueTasks, assessmentsCompleted, ... }
 * ParentDashboard returns:
 *   { classProgress, attendance, avgPerformance / readinessScore, missedTasks, alertLevel, ... }
 *
 * This function maps both into the canonical vocabulary so the same
 * tile renders identical numbers regardless of which endpoint fed it.
 */
export function readLearnerKpi(kpis: any | null | undefined, id: LearnerKpiId): number | null {
  if (!kpis) return null;
  const get = (k: string): number | null => {
    const v = kpis[k];
    if (v == null) return null;
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : null;
  };
  switch (id) {
    case 'overall_progress':
      return get('overallProgress') ?? get('classProgress') ?? get('overall_progress') ?? get('progress');
    case 'attendance':
      return get('attendance') ?? get('avgAttendance') ?? get('attendance_pct');
    case 'exam_readiness':
      return get('readinessScore') ?? get('avgPerformance') ?? get('exam_readiness');
    case 'overdue_work':
      return get('overdueTasks') ?? get('missedTasks') ?? get('overdue');
    case 'assessments_completed':
      return get('assessmentsCompleted') ?? get('assessments_completed');
  }
}

/** Return the Tailwind text-colour class to apply to a value of `id`. */
export function kpiAccentClass(id: LearnerKpiId, value: number | null): string {
  const meta = LEARNER_KPIS[id];
  if (!meta || value == null) return 'text-slate-800';
  if (meta.goodDirection === 'higher' && meta.warnBelow != null) {
    return value < meta.warnBelow ? 'text-rose-600' : 'text-emerald-700';
  }
  if (meta.goodDirection === 'lower' && meta.warnAbove != null) {
    return value > meta.warnAbove ? 'text-rose-600' : 'text-emerald-700';
  }
  return 'text-slate-800';
}
