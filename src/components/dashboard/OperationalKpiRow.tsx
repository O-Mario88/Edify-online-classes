import React from 'react';
import { Card, CardContent } from '../ui/card';
import {
  OPERATIONAL_KPIS,
  kpiAccentClass,
  type OperationalKpiId,
} from '../../lib/kpiVocabulary';

interface OperationalKpiRowProps {
  /** Map of OperationalKpiId → numeric value pulled from the relevant
   *  dashboard endpoint. Missing keys render an em-dash placeholder. */
  values: Partial<Record<OperationalKpiId, number | string | null | undefined>>;
  /** Which KPIs to render, in order. */
  ids: OperationalKpiId[];
  /** Tailwind variant. 'glass' for the dark teacher dashboard theme. */
  variant?: 'light' | 'glass';
}

/**
 * Operational KPI strip — same shape and behaviour as LearnerKpiRow,
 * but for entities other than a learner (a teacher's workload, a
 * school's engagement, the platform's health).
 *
 * Why have two separate rows: the learner KPIs are deliberately
 * comparable across the student and parent dashboards. Operational
 * metrics describe different entities — forcing them into the same
 * vocabulary would be misleading. The shared rendering shell + the
 * shared metadata format means at least the *presentation* is
 * consistent (labels, thresholds, colour rules).
 */
export const OperationalKpiRow: React.FC<OperationalKpiRowProps> = ({ values, ids, variant = 'light' }) => {
  const cardCls =
    variant === 'glass'
      ? 'bg-white/5 border-white/10 backdrop-blur-md text-slate-100'
      : 'bg-white border-slate-200';
  const labelCls = variant === 'glass' ? 'text-slate-300' : 'text-slate-500';
  const subCls = variant === 'glass' ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {ids.map((id) => {
        const meta = OPERATIONAL_KPIS[id];
        const raw = values[id];
        const numeric = raw == null ? null : (typeof raw === 'number' ? raw : Number(raw));
        const display =
          raw == null
            ? '—'
            : (Number.isFinite(numeric) ? meta.format(numeric as number) : String(raw));
        const accent = variant === 'glass'
          ? (numeric != null && meta.warnBelow != null && numeric < meta.warnBelow ? 'text-rose-400' :
             numeric != null && meta.warnAbove != null && numeric > meta.warnAbove ? 'text-rose-400' :
             'text-white')
          : kpiAccentClass(id, numeric);
        return (
          <Card key={id} className={`shadow-sm ${cardCls}`} title={meta.description}>
            <CardContent className="p-5">
              <p className={`text-xs font-bold uppercase tracking-wider mb-1 cursor-help ${labelCls}`} title={meta.description}>
                {meta.label}
              </p>
              <p className={`text-3xl font-extrabold ${accent}`}>{display}</p>
              <p className={`text-[11px] mt-2 ${subCls}`}>{meta.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
