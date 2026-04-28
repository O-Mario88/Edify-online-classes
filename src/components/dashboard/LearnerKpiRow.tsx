import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import {
  LEARNER_KPIS,
  readLearnerKpi,
  kpiAccentClass,
  type LearnerKpiId,
} from '../../lib/kpiVocabulary';

interface LearnerKpiRowProps {
  /** Whatever shape the dashboard endpoint returned for `.kpis`. */
  kpis: any | null;
  /** Which KPIs to render, in order. Defaults to the canonical 4-up. */
  ids?: LearnerKpiId[];
}

/**
 * Renders the canonical learner KPI strip — same labels, same thresholds,
 * same colours — regardless of whether the data came from
 * /analytics/student-dashboard/ or /analytics/parent-dashboard/.
 *
 * The audit's "no KPI consistency" finding was that a parent watching
 * their child's "readiness score" couldn't sanity-check it against
 * what the student sees because the labels and computations differed.
 * This component (paired with kpiVocabulary.ts) closes that gap for
 * the learner-about-the-learner metrics. Operational metrics on the
 * teacher/institution/platform dashboards stay distinct on purpose.
 */
export const LearnerKpiRow: React.FC<LearnerKpiRowProps> = ({
  kpis,
  ids = ['overall_progress', 'attendance', 'exam_readiness', 'overdue_work'],
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {ids.map((id) => {
        const meta = LEARNER_KPIS[id];
        const raw = readLearnerKpi(kpis, id);
        const display = raw != null ? meta.format(raw) : '—';
        const accent = kpiAccentClass(id, raw);
        const showProgress = (id === 'overall_progress' || id === 'attendance') && raw != null;
        return (
          <Card key={id} className="shadow-sm" title={meta.description}>
            <CardContent className="p-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 cursor-help" title={meta.description}>
                {meta.label}
              </p>
              <p className={`text-3xl font-extrabold ${accent}`}>{display}</p>
              {showProgress && raw != null && (
                <Progress value={Math.max(0, Math.min(100, raw))} className="h-1.5 mt-2" />
              )}
              <p className="text-[11px] text-slate-500 mt-2">{meta.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
