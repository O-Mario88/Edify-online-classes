import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Lightbulb, CheckCircle2, XCircle, Wrench, Trophy, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { apiGet, apiPost } from '../../lib/apiClient';
import { toast } from 'sonner';

interface Step {
  id: string;
  order: number;
  step_type: 'instruction' | 'question' | 'reflection' | 'upload' | 'short_answer' | 'mcq';
  prompt: string;
  hint?: string;
  options?: string[];
  points: number;
}

interface Lab {
  id: string;
  slug: string;
  title: string;
  description?: string;
  instructions?: string;
  badge_label?: string;
  pass_threshold_pct: number;
  steps: Step[];
}

interface Attempt {
  id: string;
  status: string;
  score_pct: string | number;
  badge_earned: boolean;
  feedback: string;
}

export const PracticeLabPlayer: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [lab, setLab] = useState<Lab | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [idx, setIdx] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [responses, setResponses] = useState<Record<string, { text: string; selected: string; verdict?: boolean | null; feedback?: string }>>({});
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState<Attempt | null>(null);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data, error } = await apiGet<Lab>(`/practice-labs/labs/${slug}/`);
      if (error || !data) {
        toast.error('Lab not found');
        navigate('/mastery');
        return;
      }
      setLab(data);
      const startRes = await apiPost<Attempt>(`/practice-labs/labs/${slug}/start/`, {});
      if (startRes.data) setAttempt(startRes.data);
    })();
  }, [slug, navigate]);

  if (!lab || !attempt) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  }

  if (finished) {
    const passed = finished.badge_earned;
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="max-w-xl w-full">
          <CardContent className="p-8 text-center space-y-4">
            {passed ? (
              <Trophy className="w-14 h-14 text-amber-500 mx-auto" />
            ) : (
              <Wrench className="w-14 h-14 text-slate-500 mx-auto" />
            )}
            <h1 className="text-2xl font-bold text-slate-900">
              {passed ? `You earned the ${lab.badge_label || lab.title} badge!` : 'Close — retry to pass'}
            </h1>
            <p className="text-slate-700">{finished.feedback}</p>
            <p className="text-3xl font-bold text-indigo-700">{Number(finished.score_pct).toFixed(0)}%</p>
            <div className="flex gap-3 justify-center pt-3">
              <Button variant="outline" onClick={() => navigate('/mastery')}>Back to Mastery Studio</Button>
              {!passed && (
                <Button onClick={() => window.location.reload()} className="bg-indigo-600 hover:bg-indigo-700">Retry lab</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const step = lab.steps[idx];
  const current = responses[step.id] || { text: '', selected: '' };
  const progress = ((idx + 1) / lab.steps.length) * 100;

  const handleSubmitStep = async () => {
    setSubmitting(true);
    const { data } = await apiPost<{ is_correct: boolean | null; feedback: string }>(
      `/practice-labs/attempts/${attempt.id}/submit-step/`,
      { step_id: step.id, response_text: current.text, selected_option: current.selected },
    );
    if (data) {
      setResponses(prev => ({ ...prev, [step.id]: { ...current, verdict: data.is_correct, feedback: data.feedback } }));
    }
    setSubmitting(false);
  };

  const handleNext = () => {
    if (idx < lab.steps.length - 1) {
      setIdx(idx + 1);
      setShowHint(false);
    } else {
      finalize();
    }
  };

  const finalize = async () => {
    setSubmitting(true);
    const { data } = await apiPost<Attempt>(`/practice-labs/attempts/${attempt.id}/submit/`, {});
    if (data) setFinished(data);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <button onClick={() => navigate(-1)} className="text-sm text-slate-500 flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> Exit lab
        </button>
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>{lab.title}</span>
              <span>Step {idx + 1} of {lab.steps.length}</span>
            </div>
            <Progress value={progress} className="h-1.5" />
            <CardTitle className="text-lg">{step.prompt}</CardTitle>
            <Badge variant="outline" className="w-fit">{step.step_type.replace('_', ' ')}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {step.step_type === 'mcq' && (step.options?.length ? (
              <RadioGroup value={current.selected} onValueChange={(v: string) => setResponses(p => ({ ...p, [step.id]: { ...current, selected: v } }))}>
                {step.options.map((opt, i) => (
                  <Label key={i} htmlFor={`s-${step.id}-${i}`}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${current.selected === opt ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'}`}>
                    <RadioGroupItem value={opt} id={`s-${step.id}-${i}`} />
                    <span className="text-sm">{opt}</span>
                  </Label>
                ))}
              </RadioGroup>
            ) : null)}

            {(step.step_type === 'short_answer' || step.step_type === 'question' || step.step_type === 'reflection') && (
              <Textarea
                rows={3}
                value={current.text}
                onChange={e => setResponses(p => ({ ...p, [step.id]: { ...current, text: e.target.value } }))}
                placeholder="Type your answer…"
              />
            )}

            {step.step_type === 'instruction' && (
              <p className="text-sm text-slate-700">Read the prompt above, then click Next when ready.</p>
            )}

            {step.hint && (
              <div>
                <button onClick={() => setShowHint(s => !s)} className="text-sm font-semibold text-amber-700 inline-flex items-center gap-1">
                  <Lightbulb className="w-4 h-4" /> {showHint ? 'Hide hint' : 'Show hint'}
                </button>
                {showHint && <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg p-3 mt-2">{step.hint}</p>}
              </div>
            )}

            {current.verdict !== undefined && current.verdict !== null && (
              <div className={`text-sm p-3 rounded-lg border flex items-start gap-2 ${current.verdict ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
                {current.verdict ? <CheckCircle2 className="w-4 h-4 mt-0.5" /> : <XCircle className="w-4 h-4 mt-0.5" />}
                <span>{current.feedback}</span>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0}>Back</Button>
              {current.verdict === undefined ? (
                <Button onClick={handleSubmitStep} disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700">
                  Check <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleNext} disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700">
                  {idx < lab.steps.length - 1 ? 'Next step' : 'Submit lab'} <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PracticeLabPlayer;
