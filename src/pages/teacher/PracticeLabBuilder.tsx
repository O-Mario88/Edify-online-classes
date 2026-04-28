import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FlaskConical, Plus, Trash2, Save, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { apiGet, apiPost, API_BASE_URL } from '../../lib/apiClient';

type StepType = 'instruction' | 'question' | 'reflection' | 'upload' | 'short_answer' | 'mcq';

interface StepDraft {
  localId: string;
  step_type: StepType;
  prompt: string;
  hint: string;
  options: string[];
  expected_answer: string;
  points: number;
}

interface Subject { id: number; name: string }
interface ClassLevel { id: number; name: string }

const arr = <T,>(d: any): T[] => (Array.isArray(d) ? d : (d?.results || []));

const newStep = (): StepDraft => ({
  localId: `s-${Date.now()}-${Math.random()}`,
  step_type: 'question',
  prompt: '',
  hint: '',
  options: ['', '', '', ''],
  expected_answer: '',
  points: 1,
});

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

/**
 * Practice Lab builder. Two phases: lab metadata (title, subject,
 * difficulty, etc.) plus an ordered list of steps. Steps support six
 * types — instruction, MCQ, short answer, open question, reflection,
 * upload — each with prompt + hint + points + (for MCQ) options +
 * expected answer.
 *
 * Route: /dashboard/teacher/practice-labs/new
 */
export const PracticeLabBuilder: React.FC = () => {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [levels, setLevels] = useState<ClassLevel[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [classLevelId, setClassLevelId] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [estimatedMinutes, setEstimatedMinutes] = useState(15);
  const [passThreshold, setPassThreshold] = useState(70);
  const [badgeLabel, setBadgeLabel] = useState('');
  const [steps, setSteps] = useState<StepDraft[]>([newStep()]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ slug: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [sR, lR] = await Promise.all([
        apiGet<any>(`${API_BASE_URL}/api/v1/curriculum/subjects/`),
        apiGet<any>(`${API_BASE_URL}/api/v1/curriculum/class-levels/`),
      ]);
      if (cancelled) return;
      setSubjects(arr<Subject>(sR.data));
      setLevels(arr<ClassLevel>(lR.data));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const addStep = () => setSteps((s) => [...s, newStep()]);
  const removeStep = (id: string) => setSteps((s) => s.filter((x) => x.localId !== id));
  const updateStep = (id: string, patch: Partial<StepDraft>) =>
    setSteps((s) => s.map((x) => (x.localId === id ? { ...x, ...patch } : x)));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) { setError('Title is required.'); return; }
    if (steps.length === 0) { setError('Add at least one step.'); return; }
    if (steps.some((s) => !s.prompt.trim())) { setError('Every step needs a prompt.'); return; }

    setSubmitting(true);
    // Step 1 — create the lab
    const labResp = await apiPost<{ id: string; slug: string }>(
      `${API_BASE_URL}/api/v1/practice-labs/labs/`,
      {
        title: title.trim(),
        slug: slugify(title) + '-' + Date.now().toString(36),
        description: description.trim(),
        instructions: instructions.trim(),
        subject: subjectId || null,
        class_level: classLevelId || null,
        difficulty,
        estimated_minutes: estimatedMinutes,
        pass_threshold_pct: passThreshold,
        badge_label: badgeLabel.trim(),
        is_published: true,
      },
    );
    if (labResp.error || !labResp.data?.slug) {
      setSubmitting(false);
      setError(labResp.error?.message || 'Could not save the lab.');
      return;
    }

    // Step 2 — create each step under the lab
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      await apiPost<any>(
        `${API_BASE_URL}/api/v1/practice-labs/labs/${labResp.data.slug}/steps/`,
        {
          order: i + 1,
          step_type: s.step_type,
          prompt: s.prompt,
          hint: s.hint,
          options: s.step_type === 'mcq' ? s.options.filter((o) => o.trim()) : [],
          expected_answer: s.expected_answer,
          points: s.points,
        },
      );
    }

    setSubmitting(false);
    setSuccess({ slug: labResp.data.slug });
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-xl">
        <Card><CardContent className="p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Practice lab published</h1>
          <p className="mt-2 text-slate-600">Students at the right class level can now start it from their Practice tab.</p>
          <div className="mt-7 flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={() => navigate(`/practice-labs/${success.slug}`)} className="rounded-full">Open lab</Button>
            <Button variant="outline" onClick={() => navigate('/dashboard/teacher')} className="rounded-full">Back to dashboard</Button>
          </div>
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link to="/dashboard/teacher" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Practice labs</p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900"><FlaskConical className="w-7 h-7 inline mr-2 text-emerald-600" /> Build a practice lab</h1>
        <p className="mt-2 text-slate-600">A multi-step exercise — instruction, question, reflection, MCQ, short answer, or upload. Each step earns points, total threshold unlocks the badge.</p>
      </header>

      <form onSubmit={onSubmit} className="space-y-5">
        <Card><CardContent className="p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Lab metadata</h2>
          <div>
            <Label className="text-xs font-semibold text-slate-700">Title *</Label>
            <Input className="mt-1.5" placeholder="Fractions Fluency Sprint" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-700">Description</Label>
            <Textarea className="mt-1.5" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-700">Instructions (shown at start)</Label>
            <Textarea className="mt-1.5" rows={2} value={instructions} onChange={(e) => setInstructions(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-slate-700">Subject</Label>
              <Select value={subjectId} onValueChange={setSubjectId} disabled={loading}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Pick" /></SelectTrigger>
                <SelectContent>{subjects.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700">Class level</Label>
              <Select value={classLevelId} onValueChange={setClassLevelId} disabled={loading}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Pick" /></SelectTrigger>
                <SelectContent>{levels.map((l) => <SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs font-semibold text-slate-700">Difficulty</Label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as any)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700">Time (min)</Label>
              <Input type="number" min={1} step={1} className="mt-1.5" value={estimatedMinutes} onChange={(e) => setEstimatedMinutes(parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700">Pass %</Label>
              <Input type="number" min={1} max={100} step={1} className="mt-1.5" value={passThreshold} onChange={(e) => setPassThreshold(parseInt(e.target.value) || 0)} />
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-700">Badge label (optional)</Label>
            <Input className="mt-1.5" placeholder="e.g. Fluency Starter" value={badgeLabel} onChange={(e) => setBadgeLabel(e.target.value)} />
          </div>
        </CardContent></Card>

        {/* Steps */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Steps</h2>
          {steps.map((s, i) => (
            <Card key={s.localId}>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Step {i + 1}</span>
                  <Badge variant="outline" className="text-xs">{s.step_type}</Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeStep(s.localId)} type="button" aria-label="Delete step">
                  <Trash2 className="w-4 h-4 text-rose-600" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Label className="text-xs font-semibold text-slate-700">Type</Label>
                    <Select value={s.step_type} onValueChange={(v) => updateStep(s.localId, { step_type: v as StepType })}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instruction">Instruction</SelectItem>
                        <SelectItem value="question">Open question</SelectItem>
                        <SelectItem value="short_answer">Short answer</SelectItem>
                        <SelectItem value="mcq">Multiple choice</SelectItem>
                        <SelectItem value="reflection">Reflection</SelectItem>
                        <SelectItem value="upload">Upload</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-700">Points</Label>
                    <Input type="number" min={0} step={1} className="mt-1.5" value={s.points} onChange={(e) => updateStep(s.localId, { points: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Prompt *</Label>
                  <Textarea className="mt-1.5" rows={2} value={s.prompt} onChange={(e) => updateStep(s.localId, { prompt: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Hint</Label>
                  <Input className="mt-1.5" value={s.hint} onChange={(e) => updateStep(s.localId, { hint: e.target.value })} />
                </div>
                {s.step_type === 'mcq' && (
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-700">Options</Label>
                    {s.options.map((opt, idx) => (
                      <Input
                        key={idx}
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        value={opt}
                        onChange={(e) => updateStep(s.localId, { options: s.options.map((o, j) => (j === idx ? e.target.value : o)) })}
                      />
                    ))}
                  </div>
                )}
                {(s.step_type === 'mcq' || s.step_type === 'short_answer') && (
                  <div>
                    <Label className="text-xs font-semibold text-slate-700">Expected answer (auto-grading)</Label>
                    <Input className="mt-1.5" value={s.expected_answer} onChange={(e) => updateStep(s.localId, { expected_answer: e.target.value })} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          <Button type="button" variant="outline" onClick={addStep} className="rounded-full">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add step
          </Button>
        </div>

        {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-rose-600" /><p className="text-sm text-rose-700">{error}</p></div>}
        <Button type="submit" disabled={submitting} className="w-full rounded-full bg-slate-900 hover:bg-slate-800 text-white h-11 font-bold">
          {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Publish practice lab
        </Button>
      </form>
    </div>
  );
};

export default PracticeLabBuilder;
