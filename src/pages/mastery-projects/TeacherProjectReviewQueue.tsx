import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, FolderKanban, CheckCircle2, AlertCircle, RefreshCcw, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { apiGet, apiPost } from '../../lib/apiClient';
import { toast } from 'sonner';

interface Artifact {
  id: string;
  artifact_type: string;
  text_content?: string;
  file?: string;
  external_url?: string;
  caption?: string;
}

interface Submission {
  id: string;
  status: string;
  student_name: string;
  submitted_at?: string;
  description?: string;
  artifacts: Artifact[];
  project: { title: string; rubric?: Array<{ criterion: string; description?: string; max_points: number }> };
}

export const TeacherProjectReviewQueue: React.FC = () => {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await apiGet<Submission[]>('/mastery-projects/submissions/review-queue/');
    if (error) {
      toast.error("You don't have access to the review queue.");
      navigate('/dashboard/teacher');
      return;
    }
    if (Array.isArray(data)) setQueue(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <div className="flex items-center gap-3">
          <FolderKanban className="w-7 h-7 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mentor Studio — Project Review Queue</h1>
            <p className="text-sm text-slate-600">Score with the rubric, leave strengths + improvements, then approve or request a revision.</p>
          </div>
        </div>

        {queue.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-900">Queue is clear.</h3>
            <p className="text-sm text-slate-600 mt-1">You'll see new project submissions here the moment they land.</p>
          </div>
        ) : (
          queue.map(sub => (
            <SubmissionReviewCard key={sub.id} sub={sub} onReviewed={load} />
          ))
        )}
      </div>
    </div>
  );
};

const SubmissionReviewCard: React.FC<{ sub: Submission; onReviewed: () => void }> = ({ sub, onReviewed }) => {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  const rubric = sub.project.rubric || [];
  const totalMax = rubric.reduce((sum, r) => sum + (r.max_points || 0), 0);
  const totalAwarded = Object.values(scores).reduce((s, v) => s + Number(v || 0), 0);

  const submitReview = async (status: 'passed' | 'needs_revision') => {
    setSaving(true);
    const { error } = await apiPost(`/mastery-projects/submissions/${sub.id}/review/`, {
      rubric_scores: scores,
      feedback, strengths, improvements, next_steps: nextSteps,
      status,
    });
    setSaving(false);
    if (error) {
      toast.error('Could not save the review.');
      return;
    }
    toast.success(status === 'passed' ? 'Project approved — passport updated.' : 'Revision requested.');
    onReviewed();
  };

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-base">{sub.project.title}</CardTitle>
          <p className="text-xs text-slate-500 mt-1">From {sub.student_name}</p>
        </div>
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100">{sub.status}</Badge>
      </CardHeader>
      <CardContent className="space-y-5">
        {sub.description && (
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700">{sub.description}</div>
        )}
        {sub.artifacts.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Artifacts</p>
            {sub.artifacts.map(a => (
              <div key={a.id} className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="text-[10px]">{a.artifact_type}</Badge>
                {a.text_content && <span className="text-slate-700">{a.text_content.slice(0, 160)}{a.text_content.length > 160 ? '…' : ''}</span>}
                {a.external_url && <a className="text-blue-600 underline" href={a.external_url} target="_blank" rel="noreferrer">Open link</a>}
                {a.file && <a className="text-blue-600 underline" href={a.file} target="_blank" rel="noreferrer">View file</a>}
              </div>
            ))}
          </div>
        )}

        {rubric.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Rubric</p>
            <div className="space-y-2">
              {rubric.map((r, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg border border-slate-100">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{r.criterion}</p>
                    {r.description && <p className="text-xs text-slate-500">{r.description}</p>}
                  </div>
                  <Input
                    type="number" min={0} max={r.max_points}
                    value={scores[r.criterion] ?? ''}
                    onChange={e => setScores(s => ({ ...s, [r.criterion]: Math.min(r.max_points, Number(e.target.value || 0)) }))}
                    className="w-16"
                  />
                  <span className="text-xs text-slate-500 w-16 text-right">/ {r.max_points}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-right mt-1 font-semibold text-indigo-700">{totalAwarded}/{totalMax}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">Strengths</label>
            <Textarea rows={2} value={strengths} onChange={e => setStrengths(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">Improvements</label>
            <Textarea rows={2} value={improvements} onChange={e => setImprovements(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700 mb-1 block">Next steps</label>
          <Textarea rows={2} value={nextSteps} onChange={e => setNextSteps(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700 mb-1 block">Overall feedback</label>
          <Textarea rows={2} value={feedback} onChange={e => setFeedback(e.target.value)} />
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => submitReview('needs_revision')} disabled={saving}>
            <RefreshCcw className="w-4 h-4 mr-1" /> Request revision
          </Button>
          <Button onClick={() => submitReview('passed')} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
            <Send className="w-4 h-4 mr-1" /> Approve
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeacherProjectReviewQueue;
