import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Construction, FileText, AlertTriangle } from 'lucide-react';
import { apiGet, API_BASE_URL } from '../lib/apiClient';

interface ProjectSubmission {
  id: number | string;
  project: {
    id: number | string;
    slug: string;
    title: string;
    subject?: { name?: string };
    topic?: { name?: string };
  };
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'revision_requested' | string;
  submitted_at: string | null;
  reviewed_at: string | null;
  artifacts?: Array<{ id: number | string }>;
  reviews?: Array<{ id: number | string; score: number | string; feedback?: string; status: string }>;
}

const STATUS_TINT: Record<string, string> = {
  draft:              'bg-slate-100 text-slate-700 border-slate-200',
  submitted:          'bg-indigo-50 text-indigo-700 border-indigo-200',
  under_review:       'bg-amber-50 text-amber-800 border-amber-200',
  revision_requested: 'bg-amber-50 text-amber-800 border-amber-200',
  approved:           'bg-emerald-50 text-emerald-800 border-emerald-200',
};

const STATUS_LABEL: Record<string, string> = {
  draft:              'Draft',
  submitted:          'Submitted',
  under_review:       'Under review',
  revision_requested: 'Revision requested',
  approved:           'Approved',
};

/**
 * Mastery projects — student's project submissions across the project
 * library. Backed by /api/v1/mastery-projects/submissions/my/. The
 * project library + artifact upload flow lives in the Lesson Studio
 * for now; this page is the read view.
 */
const ProjectsPage: React.FC = () => {
  const [items, setItems] = useState<ProjectSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await apiGet<any>(`${API_BASE_URL}/api/v1/mastery-projects/submissions/my/`);
      if (cancelled) return;
      if (r.error) {
        setError(r.error.message);
      } else {
        const arr = Array.isArray(r.data) ? r.data : ((r.data as any)?.results || []);
        setItems(arr as ProjectSubmission[]);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const counts = {
    inFlight: items.filter((s) => ['draft', 'submitted', 'under_review', 'revision_requested'].includes(s.status)).length,
    approved: items.filter((s) => s.status === 'approved').length,
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Mastery projects</p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Your project work</h1>
        <p className="mt-2 text-slate-600">
          {counts.inFlight} in flight · {counts.approved} approved. Each submission ships with rubric feedback.
        </p>
      </header>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-4">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-rose-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <Construction className="w-8 h-8 text-amber-500 mx-auto" />
          <h2 className="mt-3 text-lg font-bold text-slate-900">No project submissions yet</h2>
          <p className="mt-1 text-sm text-slate-600 max-w-sm mx-auto">
            When a teacher assigns a project, your draft will appear here. The web Lesson Studio has the project library.
          </p>
          <Link
            to="/dashboard/student"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Back to dashboard
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((s) => <SubmissionRow key={String(s.id)} submission={s} />)}
        </div>
      )}
    </div>
  );
};

const SubmissionRow: React.FC<{ submission: ProjectSubmission }> = ({ submission }) => {
  const tintClass = STATUS_TINT[submission.status] || STATUS_TINT.draft;
  const label = STATUS_LABEL[submission.status] || submission.status;
  const review = submission.reviews?.[submission.reviews.length - 1];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-amber-700" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {submission.project?.title || 'Untitled project'}
            </p>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border whitespace-nowrap ${tintClass}`}>
              {label}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 truncate">
            {submission.project?.subject?.name || ''}
            {submission.project?.topic?.name ? ` · ${submission.project.topic.name}` : ''}
          </p>
          {(submission.artifacts?.length ?? 0) > 0 && (
            <p className="mt-2 text-xs text-slate-500">
              {submission.artifacts!.length} artifact{submission.artifacts!.length === 1 ? '' : 's'} attached
            </p>
          )}
          {review && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Reviewer feedback · score {review.score}
              </p>
              {review.feedback && (
                <p className="mt-1 text-xs text-slate-700 line-clamp-3">{review.feedback}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
