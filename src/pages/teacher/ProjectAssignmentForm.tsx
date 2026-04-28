import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ClipboardList, Plus, Trash2, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { apiGet, apiPost, API_BASE_URL } from '../../lib/apiClient';

interface RubricCriterion {
  localId: string;
  criterion: string;
  description: string;
  max_points: number;
}

interface Subject { id: number; name: string }
interface ClassLevel { id: number; name: string }

const arr = <T,>(d: any): T[] => (Array.isArray(d) ? d : (d?.results || []));

const newCriterion = (defaultPoints = 5): RubricCriterion => ({
  localId: `c-${Date.now()}-${Math.random()}`,
  criterion: '',
  description: '',
  max_points: defaultPoints,
});

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

/**
 * Project assignment form. Creates a MasteryProject with metadata +
 * a custom rubric (criterion list). Each criterion has a label,
 * description, and max points; total points show live.
 *
 * Route: /dashboard/teacher/projects/new
 */
export const ProjectAssignmentForm: React.FC = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [levels, setLevels] = useState<ClassLevel[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [classLevelId, setClassLevelId] = useState('');
  const [estimatedDays, setEstimatedDays] = useState(3);
  const [isGroupProject, setIsGroupProject] = useState(false);
  const [criteria, setCriteria] = useState<RubricCriterion[]>([
    { ...newCriterion(10), criterion: 'Clarity' },
    { ...newCriterion(10), criterion: 'Depth' },
    { ...newCriterion(5), criterion: 'Originality' },
  ]);

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

  const totalPoints = criteria.reduce((s, c) => s + (Number.isFinite(c.max_points) ? c.max_points : 0), 0);

  const addCriterion = () => setCriteria((c) => [...c, newCriterion()]);
  const removeCriterion = (id: string) => setCriteria((c) => c.filter((x) => x.localId !== id));
  const updateCriterion = (id: string, patch: Partial<RubricCriterion>) =>
    setCriteria((c) => c.map((x) => (x.localId === id ? { ...x, ...patch } : x)));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) { setError('Title is required.'); return; }
    if (criteria.length === 0) { setError('Add at least one rubric criterion.'); return; }
    if (criteria.some((c) => !c.criterion.trim())) { setError('Every criterion needs a label.'); return; }

    setSubmitting(true);
    const r = await apiPost<{ id: string; slug: string }>(
      `${API_BASE_URL}/api/v1/mastery-projects/projects/`,
      {
        title: title.trim(),
        slug: slugify(title) + '-' + Date.now().toString(36),
        description: description.trim(),
        instructions: instructions.trim(),
        subject: subjectId || null,
        class_level: classLevelId || null,
        rubric: criteria.map(({ localId, ...rest }) => rest),
        estimated_days: estimatedDays,
        is_group_project: isGroupProject,
        is_published: true,
      },
    );
    setSubmitting(false);
    if (r.error) { setError(r.error.message); return; }
    setSuccess({ slug: r.data!.slug });
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-xl">
        <Card><CardContent className="p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Project published</h1>
          <p className="mt-2 text-slate-600">Students at the right class level can now start the project from their Projects tab.</p>
          <div className="mt-7 flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={() => navigate('/dashboard/teacher')} className="rounded-full">Back to dashboard</Button>
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
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Mastery projects</p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900">
          <ClipboardList className="w-7 h-7 inline mr-2 text-purple-600" /> Assign a project
        </h1>
        <p className="mt-2 text-slate-600">Define the project + rubric. Students upload artifacts; you grade against your rubric criteria.</p>
      </header>

      <form onSubmit={onSubmit} className="space-y-5">
        <Card><CardContent className="p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Project metadata</h2>
          <div>
            <Label className="text-xs font-semibold text-slate-700">Title *</Label>
            <Input className="mt-1.5" placeholder="My Local Ecosystem Field Study" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-700">Description</Label>
            <Textarea className="mt-1.5" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-700">Instructions / deliverables</Label>
            <Textarea className="mt-1.5" rows={4} placeholder="What should students submit? File formats, page counts, deadlines, etc." value={instructions} onChange={(e) => setInstructions(e.target.value)} />
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-slate-700">Estimated days</Label>
              <Input type="number" min={1} step={1} className="mt-1.5" value={estimatedDays} onChange={(e) => setEstimatedDays(parseInt(e.target.value) || 1)} />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer h-11">
                <input
                  type="checkbox"
                  checked={isGroupProject}
                  onChange={(e) => setIsGroupProject(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-700"
                />
                <span className="text-sm text-slate-700">Group project</span>
              </label>
            </div>
          </div>
        </CardContent></Card>

        {/* Rubric */}
        <Card><CardContent className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Rubric — total {totalPoints} points</h2>
            <Button type="button" variant="outline" size="sm" onClick={addCriterion} className="rounded-full">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add criterion
            </Button>
          </div>
          {criteria.map((c) => (
            <div key={c.localId} className="rounded-xl border border-slate-200 p-4 space-y-2.5">
              <div className="flex items-start gap-3">
                <Input placeholder="Criterion (e.g. Clarity)" value={c.criterion} onChange={(e) => updateCriterion(c.localId, { criterion: e.target.value })} />
                <div className="w-24">
                  <Input type="number" min={0} step={1} placeholder="Points" value={c.max_points} onChange={(e) => updateCriterion(c.localId, { max_points: parseInt(e.target.value) || 0 })} />
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeCriterion(c.localId)} aria-label="Delete criterion">
                  <Trash2 className="w-4 h-4 text-rose-600" />
                </Button>
              </div>
              <Textarea
                rows={1}
                placeholder="What does a high score on this criterion look like?"
                value={c.description}
                onChange={(e) => updateCriterion(c.localId, { description: e.target.value })}
              />
            </div>
          ))}
        </CardContent></Card>

        {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-rose-600" /><p className="text-sm text-rose-700">{error}</p></div>}
        <Button type="submit" disabled={submitting} className="w-full rounded-full bg-slate-900 hover:bg-slate-800 text-white h-11 font-bold">
          {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Publish project
        </Button>
      </form>
    </div>
  );
};

export default ProjectAssignmentForm;
