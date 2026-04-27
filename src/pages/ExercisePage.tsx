import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, FileText } from 'lucide-react';
import { apiGet, API_BASE_URL } from '../lib/apiClient';

interface Question {
  id: number;
  prompt: string;
  question_type?: string;
  marks?: number;
  options?: Array<{ id: number; label: string }>;
}

interface AssessmentDetail {
  id: number;
  title: string;
  subject?: { name?: string };
  topic?: { name?: string };
  total_marks?: number;
  duration_minutes?: number;
  instructions?: string;
  questions?: Question[];
}

/**
 * Assessment runner — read view of a published assessment with its
 * questions and instructions. Submission is captured on the dashboard
 * "My assignments" panel (covered by Playwright e2e); this page is the
 * standalone landing for an assessment URL.
 */
export const ExercisePage: React.FC = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const [data, setData] = useState<AssessmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!exerciseId) return;
    let cancelled = false;
    (async () => {
      const r = await apiGet<AssessmentDetail>(
        `${API_BASE_URL}/api/v1/assessments/assessment/${exerciseId}/`,
      );
      if (cancelled) return;
      if (r.error) setError(r.error.message);
      else setData(r.data);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [exerciseId]);

  if (!exerciseId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-slate-600">No assessment id provided.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link
        to="/dashboard/student"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
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
              {data.subject?.name || 'Assessment'}
              {data.topic?.name ? ` · ${data.topic.name}` : ''}
            </p>
            <h1 className="mt-1 text-3xl font-extrabold text-slate-900">{data.title}</h1>
            <div className="mt-3 flex items-center gap-4 text-sm text-slate-600">
              {typeof data.total_marks === 'number' && <span>{data.total_marks} marks</span>}
              {typeof data.duration_minutes === 'number' && <span>{data.duration_minutes} min</span>}
              {typeof data.questions?.length === 'number' && <span>{data.questions.length} questions</span>}
            </div>
            {data.instructions && (
              <p className="mt-4 text-slate-700 leading-relaxed">{data.instructions}</p>
            )}
          </header>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Questions</h2>
            {(data.questions?.length ?? 0) === 0 ? (
              <p className="text-sm text-slate-600">No questions published yet.</p>
            ) : (
              <ol className="space-y-3 list-decimal list-inside">
                {data.questions!.map((q) => (
                  <li key={q.id} className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-sm text-slate-900 leading-relaxed">{q.prompt}</p>
                    {typeof q.marks === 'number' && (
                      <p className="mt-1 text-xs text-slate-500">{q.marks} mark{q.marks === 1 ? '' : 's'}</p>
                    )}
                    {(q.options?.length ?? 0) > 0 && (
                      <ul className="mt-3 space-y-1">
                        {q.options!.map((opt) => (
                          <li key={opt.id} className="text-sm text-slate-700">• {opt.label}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </section>

          <p className="mt-8 text-sm text-slate-600 inline-flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Submit your answer from the "My assignments" panel on the Student Dashboard.
          </p>
        </>
      )}
    </div>
  );
};

export default ExercisePage;
