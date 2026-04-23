import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ClipboardList, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import { apiClient } from '../../lib/apiClient';

/**
 * StudentAssignmentsPanel
 *
 * Lists the assignments a student can see, lets them submit a text answer,
 * and shows any grade+feedback the teacher has recorded.
 *
 * Uses three endpoints:
 *   GET  /api/v1/assessments/assessment/  (published-only for students)
 *   POST /api/v1/assessments/submission/   (auto-associates with the student)
 *   GET  /api/v1/grading/records/          (student-scoped to their own)
 *
 * Intentionally simple: no rich text, no file attachments. Just the
 * text-answer path that closes the Phase 4.3 loop end-to-end.
 */

interface Assessment {
  id: number;
  title: string;
  instructions: string;
  type: string;
  max_score: string | number;
  is_published: boolean;
}

interface Submission {
  id: number;
  assessment: number;
  status: string;
  answers_data: { essay?: string; [k: string]: unknown };
  total_score: string | number | null;
}

interface Grade {
  id: number;
  submission: number;
  score: string | number;
  teacher_feedback: string | null;
}

export const StudentAssignmentsPanel: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerDrafts, setAnswerDrafts] = useState<Record<number, string>>({});
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, sRes, gRes] = await Promise.all([
        apiClient.get<{ results: Assessment[] } | Assessment[]>('/assessments/assessment/'),
        apiClient.get<{ results: Submission[] } | Submission[]>('/assessments/submission/'),
        apiClient.get<{ results: Grade[] } | Grade[]>('/grading/records/'),
      ]);
      const unwrap = <T,>(payload: unknown): T[] => {
        if (Array.isArray(payload)) return payload as T[];
        if (payload && typeof payload === 'object' && 'results' in (payload as object)) {
          return ((payload as { results: T[] }).results) ?? [];
        }
        return [];
      };
      setAssessments(unwrap<Assessment>(aRes.data));
      setSubmissions(unwrap<Submission>(sRes.data));
      setGrades(unwrap<Grade>(gRes.data));
    } catch (err) {
      console.error('Failed to load assignments', err);
      toast.error('Could not load assignments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const submitAnswer = async (assessmentId: number) => {
    const text = (answerDrafts[assessmentId] ?? '').trim();
    if (!text) {
      toast.error('Write something before submitting.');
      return;
    }
    setSubmittingId(assessmentId);
    try {
      const { error } = await apiClient.post('/assessments/submission/', {
        assessment: assessmentId,
        answers_data: { essay: text },
        status: 'submitted',
      });
      if (error) throw error;
      toast.success('Answer submitted. Your teacher will grade it soon.');
      setAnswerDrafts((d) => ({ ...d, [assessmentId]: '' }));
      fetchAll();
    } catch (err) {
      console.error('Submit failed', err);
      toast.error('Could not submit. Please try again.');
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-sm text-slate-500">Loading assignments…</div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="p-6 border border-dashed border-slate-300 rounded-xl text-sm text-slate-500 bg-slate-50">
        No assignments have been published to you yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {assessments.map((a) => {
        const mySubmission = submissions.find((s) => s.assessment === a.id);
        const myGrade = mySubmission
          ? grades.find((g) => g.submission === mySubmission.id)
          : undefined;
        return (
          <div key={a.id} className="border border-slate-200 rounded-xl p-5 bg-white">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-indigo-600" />
                  {a.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Out of {a.max_score}</p>
              </div>
              {myGrade && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Graded
                </span>
              )}
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-wrap mb-4">{a.instructions}</p>

            {mySubmission ? (
              <div className="bg-slate-50 border border-slate-200 rounded-md p-3 mb-3">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Your submission</p>
                <p className="text-sm text-slate-800 whitespace-pre-wrap">
                  {(mySubmission.answers_data?.essay as string | undefined) || '(empty)'}
                </p>
              </div>
            ) : (
              <>
                <label className="block text-xs font-medium text-slate-600 mb-1">Your answer</label>
                <textarea
                  value={answerDrafts[a.id] ?? ''}
                  onChange={(e) =>
                    setAnswerDrafts((d) => ({ ...d, [a.id]: e.target.value }))
                  }
                  className="w-full border border-slate-300 rounded-md px-3 py-2 mb-3 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Write your response here..."
                />
                <div className="flex justify-end">
                  <Button
                    onClick={() => submitAnswer(a.id)}
                    disabled={submittingId === a.id}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {submittingId === a.id ? 'Submitting…' : 'Submit'}
                  </Button>
                </div>
              </>
            )}

            {myGrade && (
              <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-md p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-emerald-700 uppercase tracking-wider">Teacher grade</p>
                  <p className="text-lg font-bold text-emerald-900">
                    {myGrade.score} / {a.max_score}
                  </p>
                </div>
                {myGrade.teacher_feedback && (
                  <p className="text-sm text-emerald-900 whitespace-pre-wrap">
                    {myGrade.teacher_feedback}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
