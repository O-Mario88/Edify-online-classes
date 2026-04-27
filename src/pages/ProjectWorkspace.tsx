import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Star, AlertTriangle } from 'lucide-react';
import { apiGet, API_BASE_URL } from '../lib/apiClient';

interface ProjectArtifact {
  id: number | string;
  kind?: string;
  name?: string;
  file_url?: string;
  text?: string;
}

interface ProjectReview {
  id: number | string;
  reviewer?: { full_name?: string; email?: string };
  rubric_scores?: Record<string, number>;
  score: number | string;
  feedback?: string;
  strengths?: string;
  improvements?: string;
  next_steps?: string;
  status: string;
  created_at?: string;
}

interface ProjectSubmissionDetail {
  id: number | string;
  project: {
    id: number | string;
    slug: string;
    title: string;
    description?: string;
    subject?: { name?: string };
    topic?: { name?: string };
  };
  status: string;
  submitted_at: string | null;
  reviewed_at: string | null;
  artifacts?: ProjectArtifact[];
  reviews?: ProjectReview[];
  revision_count?: number;
}

/**
 * Per-project workspace — read view of a single submission, the
 * artifacts attached to it, and any reviewer feedback. Backed by
 * /api/v1/mastery-projects/submissions/{id}/.
 */
const ProjectWorkspace: React.FC = () => {
  const params = useParams<{ projectId?: string; submissionId?: string }>();
  const id = params.submissionId || params.projectId;
  const [data, setData] = useState<ProjectSubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      const r = await apiGet<ProjectSubmissionDetail>(
        `${API_BASE_URL}/api/v1/mastery-projects/submissions/${id}/`,
      );
      if (cancelled) return;
      if (r.error) setError(r.error.message);
      else setData(r.data);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (!id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-slate-600">No project id provided.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link
        to="/projects"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" /> Back to projects
      </Link>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-4">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-rose-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          <div className="h-24 rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-32 rounded-xl bg-slate-100 animate-pulse" />
        </div>
      ) : !data ? null : (
        <>
          <header className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {data.project?.subject?.name || 'Project'}
              {data.project?.topic?.name ? ` · ${data.project.topic.name}` : ''}
            </p>
            <h1 className="mt-1 text-3xl font-extrabold text-slate-900">
              {data.project?.title || 'Untitled project'}
            </h1>
            {data.project?.description && (
              <p className="mt-3 text-slate-600 leading-relaxed">{data.project.description}</p>
            )}
          </header>

          <section className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Artifacts</h2>
            {(data.artifacts?.length ?? 0) === 0 ? (
              <p className="text-sm text-slate-600">No artifacts attached yet.</p>
            ) : (
              <div className="space-y-2">
                {data.artifacts!.map((a) => <ArtifactRow key={String(a.id)} artifact={a} />)}
              </div>
            )}
          </section>

          {(data.reviews?.length ?? 0) > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Reviewer feedback</h2>
              <div className="space-y-3">
                {data.reviews!.map((r) => <ReviewBlock key={String(r.id)} review={r} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

const ArtifactRow: React.FC<{ artifact: ProjectArtifact }> = ({ artifact }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-3">
    <FileText className="w-5 h-5 text-slate-400 flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-slate-900 truncate">
        {artifact.name || artifact.kind || 'Artifact'}
      </p>
      {artifact.text && (
        <p className="mt-1 text-xs text-slate-600 line-clamp-2">{artifact.text}</p>
      )}
    </div>
    {artifact.file_url && (
      <a
        href={artifact.file_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900"
      >
        Open
      </a>
    )}
  </div>
);

const ReviewBlock: React.FC<{ review: ProjectReview }> = ({ review }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4">
    <div className="flex items-center gap-2 mb-2">
      <Star className="w-4 h-4 text-amber-500" />
      <p className="text-sm font-bold text-slate-900">Score: {review.score}</p>
      <span className="text-xs text-slate-500 ml-auto">{review.status}</span>
    </div>
    {review.feedback && (
      <p className="text-sm text-slate-700 leading-relaxed">{review.feedback}</p>
    )}
    {review.strengths && (
      <div className="mt-3">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Strengths</p>
        <p className="mt-1 text-sm text-slate-700">{review.strengths}</p>
      </div>
    )}
    {review.improvements && (
      <div className="mt-3">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Improvements</p>
        <p className="mt-1 text-sm text-slate-700">{review.improvements}</p>
      </div>
    )}
    {review.next_steps && (
      <div className="mt-3">
        <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">Next steps</p>
        <p className="mt-1 text-sm text-slate-700">{review.next_steps}</p>
      </div>
    )}
  </div>
);

export default ProjectWorkspace;
