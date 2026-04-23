import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { GraduationCap, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { apiClient } from '../../lib/apiClient';

/**
 * TeacherGradingPanel
 *
 * Lists the teacher's assignments, expands to show each submission,
 * and lets the teacher record a grade inline. POSTs to
 * /api/v1/grading/records/ which the backend gates to teachers only.
 *
 * Frontend half of Phase 4.3 (grading loop). Closes the teacher-
 * sees-submissions side so a teacher can drive the full loop in
 * the UI without hitting the Django admin.
 */

interface Assessment {
  id: number;
  title: string;
  instructions: string;
  max_score: string | number;
}

interface Submission {
  id: number;
  assessment: number;
  student: number;
  status: string;
  answers_data: { essay?: string; [k: string]: unknown };
}

interface Grade {
  id: number;
  submission: number;
  score: string | number;
  teacher_feedback: string | null;
}

const unwrap = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object' && 'results' in (payload as object)) {
    return ((payload as { results: T[] }).results) ?? [];
  }
  return [];
};

export const TeacherGradingPanel: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [scoreDrafts, setScoreDrafts] = useState<Record<number, string>>({});
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, sRes, gRes] = await Promise.all([
        apiClient.get('/assessments/assessment/'),
        apiClient.get('/assessments/submission/'),
        apiClient.get('/grading/records/'),
      ]);
      setAssessments(unwrap<Assessment>(aRes.data));
      setSubmissions(unwrap<Submission>(sRes.data));
      setGrades(unwrap<Grade>(gRes.data));
    } catch (err) {
      console.error('Failed to load grading data', err);
      toast.error('Could not load assignments and submissions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const saveGrade = async (submissionId: number) => {
    const scoreRaw = scoreDrafts[submissionId];
    const feedback = feedbackDrafts[submissionId] ?? '';
    const score = Number(scoreRaw);
    if (!Number.isFinite(score) || score < 0) {
      toast.error('Enter a valid score (0 or more).');
      return;
    }
    setSavingId(submissionId);
    try {
      const { error } = await apiClient.post('/grading/records/', {
        submission: submissionId,
        score: score.toFixed(2),
        teacher_feedback: feedback,
      });
      if (error) throw error;
      toast.success('Grade saved.');
      setScoreDrafts((d) => ({ ...d, [submissionId]: '' }));
      setFeedbackDrafts((d) => ({ ...d, [submissionId]: '' }));
      fetchAll();
    } catch (err) {
      console.error('Grade save failed', err);
      toast.error('Could not save grade. Note: teachers only.');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return <div className="p-6 text-sm text-slate-500">Loading submissions…</div>;
  }

  if (assessments.length === 0) {
    return (
      <div className="p-6 border border-dashed border-slate-300 rounded-xl text-sm text-slate-500 bg-slate-50">
        You haven't published any assignments yet. Use "Publish an assignment" above to start.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {assessments.map((a) => {
        const aSubs = submissions.filter((s) => s.assessment === a.id);
        const expanded = expandedId === a.id;
        return (
          <div key={a.id} className="border border-slate-200 rounded-xl bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandedId(expanded ? null : a.id)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-slate-900">{a.title}</span>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {aSubs.length} submission{aSubs.length === 1 ? '' : 's'}
                </span>
              </div>
              {expanded ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {expanded && (
              <div className="border-t border-slate-100 divide-y divide-slate-100">
                {aSubs.length === 0 && (
                  <p className="p-5 text-sm text-slate-500">No submissions yet.</p>
                )}
                {aSubs.map((s) => {
                  const existing = grades.find((g) => g.submission === s.id);
                  return (
                    <div key={s.id} className="p-5">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                        Submission #{s.id} · student {s.student}
                      </p>
                      <p className="text-sm text-slate-800 whitespace-pre-wrap bg-slate-50 border border-slate-200 rounded-md p-3 mb-3">
                        {(s.answers_data?.essay as string | undefined) || '(empty)'}
                      </p>

                      {existing ? (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3 text-sm text-emerald-900">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Graded</span>
                            <span className="font-bold">
                              {existing.score} / {a.max_score}
                            </span>
                          </div>
                          {existing.teacher_feedback && (
                            <p className="mt-1 whitespace-pre-wrap">{existing.teacher_feedback}</p>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-2 items-start">
                          <input
                            type="number"
                            placeholder="Score"
                            min="0"
                            max={Number(a.max_score) || 100}
                            value={scoreDrafts[s.id] ?? ''}
                            onChange={(e) =>
                              setScoreDrafts((d) => ({ ...d, [s.id]: e.target.value }))
                            }
                            className="w-24 border border-slate-300 rounded-md px-3 py-2 text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Feedback (optional)"
                            value={feedbackDrafts[s.id] ?? ''}
                            onChange={(e) =>
                              setFeedbackDrafts((d) => ({ ...d, [s.id]: e.target.value }))
                            }
                            className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm"
                          />
                          <Button onClick={() => saveGrade(s.id)} disabled={savingId === s.id}>
                            <Check className="w-4 h-4 mr-2" />
                            {savingId === s.id ? 'Saving…' : 'Save grade'}
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
