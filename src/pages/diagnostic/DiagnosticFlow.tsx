import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle2, AlertCircle, BookOpen, Calendar, Lock, Trophy, Clock } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Label } from '../../components/ui/label';
import { apiPost, apiGet } from '../../lib/apiClient';
import { toast } from 'sonner';

type Phase = 'intro' | 'questions' | 'grading' | 'report' | 'empty';

interface DiagnosticQuestion {
  id: number;
  type: string;
  content: string;
  options: string[];
  marks: string | number;
  subject_name: string | null;
  topic_name: string | null;
}

interface StudyPlanPreviewDay {
  day: string;
  topic_name: string;
  subject_name: string;
  action: string;
  est_minutes: number;
  locked: boolean;
}

interface DiagnosticReport {
  level_label: string;
  level_tone: 'positive' | 'warning' | 'neutral';
  coaching_message: string;
  strong_subjects: string[];
  weak_topics: Array<{ name: string; subject: string; pct: number }>;
  study_plan_preview: StudyPlanPreviewDay[];
  next_action: { label: string; route: string; payment_hint: string };
  trust_note: string;
}

interface Session {
  id: string;
  state: string;
  score_pct: string | number;
  correct_count: number;
  total_questions: number;
  per_subject_scores: Array<{ subject_name: string; pct: number; correct: number; total: number }>;
  report_data: DiagnosticReport;
}

export const DiagnosticFlow: React.FC = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('intro');
  const [session, setSession] = useState<Session | null>(null);
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleStart = async () => {
    setStarting(true);
    try {
      const { data, error } = await apiPost<any>('/diagnostic/start/', {});
      if (error) throw new Error(error.message);
      if (data?.empty_bank) {
        setPhase('empty');
        return;
      }
      setSession(data.session);
      setQuestions(data.questions || []);
      setPhase('questions');
    } catch (e) {
      toast.error('Could not start the diagnostic right now. Please try again.');
    } finally {
      setStarting(false);
    }
  };

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [String(questionId)]: answer }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!session) return;
    setSubmitting(true);
    setPhase('grading');
    try {
      const { data, error } = await apiPost<Session>(`/diagnostic/${session.id}/submit/`, { answers });
      if (error) throw new Error(error.message);
      if (data) {
        setSession(data);
        setPhase('report');
      }
    } catch (e) {
      toast.error('Could not grade the diagnostic. Your answers are saved — try again in a moment.');
      setPhase('questions');
    } finally {
      setSubmitting(false);
    }
  };

  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/40 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full border-slate-100 shadow-xl shadow-blue-900/5">
          <CardHeader className="pb-2 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-blue-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-slate-900">
              Your Learning Level Check
            </CardTitle>
            <p className="text-slate-600 mt-3 text-base max-w-lg mx-auto">
              A short 10-minute diagnostic. Maple will read your strengths and gaps, then build your first weekly study plan around them.
            </p>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: Clock, title: '~10 minutes', sub: 'Multiple choice' },
                { icon: Trophy, title: 'Instant report', sub: 'Strong + weak topics' },
                { icon: Calendar, title: 'Study plan', sub: '7-day preview' },
              ].map((f, i) => (
                <div key={i} className="rounded-xl border border-slate-100 p-4 text-center">
                  <f.icon className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-900">{f.title}</p>
                  <p className="text-xs text-slate-500">{f.sub}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-center pt-4">
              <Button size="lg" onClick={handleStart} disabled={starting} className="bg-blue-600 hover:bg-blue-700 px-8">
                {starting ? 'Loading…' : 'Start Diagnostic'} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <p className="text-xs text-slate-500 text-center pt-2">
              Your answers are private to you. Results help Maple recommend what to study next.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (phase === 'empty') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="max-w-xl w-full">
          <CardHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <CardTitle className="text-center">We're still preparing your diagnostic</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-slate-600">
              The question bank for your class level isn't fully stocked yet. You can still start exploring lessons while we add more questions.
            </p>
            <Button onClick={() => navigate('/dashboard/student')}>Go to my dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (phase === 'grading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
          <p className="text-slate-700 font-medium">Grading your diagnostic and building your Learning Level Report…</p>
        </div>
      </div>
    );
  }

  if (phase === 'questions') {
    const q = questions[currentIdx];
    if (!q) return null;
    const progress = ((currentIdx + 1) / questions.length) * 100;
    const selected = answers[String(q.id)];
    const isLast = currentIdx === questions.length - 1;
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Question {currentIdx + 1} of {questions.length}</span>
              {q.subject_name && <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">{q.subject_name}</Badge>}
            </div>
            <Progress value={progress} className="h-1.5" />
            <CardTitle className="text-lg leading-snug text-slate-900 pt-2">{q.content}</CardTitle>
            {q.topic_name && <p className="text-xs text-slate-500">Topic: {q.topic_name}</p>}
          </CardHeader>
          <CardContent>
            <RadioGroup value={selected || ''} onValueChange={(v: string) => handleAnswer(q.id, v)} className="space-y-2">
              {(q.options || []).map((opt, i) => (
                <Label
                  key={i}
                  htmlFor={`q-${q.id}-opt-${i}`}
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    selected === opt
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <RadioGroupItem value={opt} id={`q-${q.id}-opt-${i}`} />
                  <span className="text-sm text-slate-800">{opt}</span>
                </Label>
              ))}
            </RadioGroup>
            <div className="flex justify-between items-center mt-6">
              <Button variant="ghost" onClick={() => setCurrentIdx(i => Math.max(0, i - 1))} disabled={currentIdx === 0}>
                Back
              </Button>
              <Button onClick={handleNext} disabled={!selected || submitting} className="bg-blue-600 hover:bg-blue-700">
                {isLast ? 'Submit & See Report' : 'Next'} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // phase === 'report'
  if (!session || !session.report_data) return null;
  const r = session.report_data;
  return <ReportView session={session} report={r} onContinue={() => navigate(r.next_action.route || '/dashboard/student')} />;
};


const ReportView: React.FC<{ session: Session; report: DiagnosticReport; onContinue: () => void }> = ({ session, report, onContinue }) => {
  const toneClass = report.level_tone === 'positive'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : report.level_tone === 'warning'
    ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/40 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Badge variant="outline" className="bg-white text-blue-700 border-blue-200">YOUR LEARNING LEVEL REPORT</Badge>
          <h1 className="text-3xl font-bold text-slate-900 mt-3">You're at <span className="text-blue-600">{report.level_label}</span></h1>
          <p className="text-slate-600 max-w-xl mx-auto">{report.coaching_message}</p>
        </div>

        {/* Score headline */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Diagnostic Score</p>
                <p className="text-5xl font-bold text-slate-900 mt-1">{Number(session.score_pct).toFixed(0)}%</p>
                <p className="text-sm text-slate-500 mt-1">{session.correct_count} of {session.total_questions} correct</p>
              </div>
              <div className={`border rounded-xl px-4 py-3 ${toneClass}`}>
                <p className="text-xs font-bold uppercase tracking-wider">Level</p>
                <p className="text-xl font-bold">{report.level_label}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strong subjects */}
        {report.strong_subjects.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> You're strong in</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {report.strong_subjects.map(s => (
                  <Badge key={s} className="bg-emerald-100 text-emerald-800 border-emerald-200 text-sm py-1.5 px-3">{s}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weak topics */}
        {report.weak_topics.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><AlertCircle className="w-4 h-4 text-amber-600" /> Focus areas for this week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.weak_topics.map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.subject}</p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200">{t.pct}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Study plan preview */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-600" /> Your 7-day study plan preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.study_plan_preview.map((d, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${d.locked ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200'}`}>
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">{d.day}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 text-sm">{d.topic_name}</p>
                    <p className="text-xs text-slate-500">{d.subject_name} • {d.est_minutes} min • {d.action}</p>
                  </div>
                  {d.locked && <Lock className="w-4 h-4 text-slate-400" />}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-4">The first 3 days are unlocked. Unlock the full 7-day plan plus weekly refreshes by upgrading to Learner Plus.</p>
          </CardContent>
        </Card>

        {/* Primary CTA */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-center text-white shadow-xl shadow-blue-900/20">
          <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-90" />
          <h2 className="text-2xl font-bold mb-2">Unlock your full personalised study plan</h2>
          <p className="text-blue-100 mb-6 max-w-md mx-auto">Get weekly refreshes, AI Study Buddy, practice questions, and your parent's Weekly Child Progress Brief.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={onContinue} className="bg-white text-blue-700 hover:bg-slate-100">
              Continue to my dashboard <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Trust note */}
        <p className="text-xs text-slate-500 text-center">{report.trust_note}</p>
      </div>
    </div>
  );
};

export default DiagnosticFlow;
