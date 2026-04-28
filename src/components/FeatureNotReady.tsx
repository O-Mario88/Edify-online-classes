import React from 'react';
import { Link } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';

/**
 * Honest placeholder for a page whose backend isn't wired yet.
 *
 * Used in place of pages that used to render convincing mock data —
 * an empty state that lies is worse than one that says "this isn't ready."
 * See docs/audit/FIX_PLAN.md §3.3.
 */
interface Props {
  title: string;
  summary: string;
  backTo?: string;
  backLabel?: string;
}

export const FeatureNotReady: React.FC<Props> = ({
  title,
  summary,
  backTo = '/dashboard/student',
  backLabel = 'Back to dashboard',
}) => (
  <div className="min-h-[60vh] flex items-center justify-center p-6">
    <div className="max-w-md w-full text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
        <Construction className="w-6 h-6 text-amber-600" />
      </div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-2">{title}</h1>
      <p className="text-slate-600 mb-6">{summary}</p>
      <Link
        to={backTo}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        {backLabel}
      </Link>
    </div>
  </div>
);
