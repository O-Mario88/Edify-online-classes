import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookMarked, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { apiGet, apiPost, API_BASE_URL } from '../../lib/apiClient';

interface Subject { id: number; name: string }
interface ClassLevel { id: number; name: string }

const arr = <T,>(d: any): T[] => (Array.isArray(d) ? d : (d?.results || []));

/**
 * Topic creation form. Lets a teacher (or admin) extend the
 * curriculum by adding a new topic under an existing subject + class
 * level. Useful when the national syllabus needs school-specific
 * scaffolding (e.g. a "Numeracy Recovery" topic for slow starters).
 *
 * Route: /dashboard/teacher/topics/new
 */
export const TopicCreationForm: React.FC = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
  const [loading, setLoading] = useState(true);

  const [subjectId, setSubjectId] = useState('');
  const [classLevelId, setClassLevelId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState(1);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [sR, lR] = await Promise.all([
        apiGet<any>(`${API_BASE_URL}/api/v1/curriculum/subjects/`),
        apiGet<any>(`${API_BASE_URL}/api/v1/curriculum/class-levels/`),
      ]);
      if (cancelled) return;
      setSubjects(arr<Subject>(sR.data));
      setClassLevels(arr<ClassLevel>(lR.data));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!subjectId || !classLevelId || !name.trim()) {
      setError('Subject, class level, and topic name are required.');
      return;
    }
    setSubmitting(true);
    const r = await apiPost<{ id: number; name: string }>(
      `${API_BASE_URL}/api/v1/curriculum/topics/`,
      { subject: subjectId, class_level: classLevelId, name: name.trim(), description: description.trim(), order },
    );
    setSubmitting(false);
    if (r.error) { setError(r.error.message); return; }
    setSuccess({ id: r.data!.id, name: r.data!.name });
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-xl">
        <Card><CardContent className="p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h1 className="mt-4 text-2xl font-extrabold text-slate-900">"{success.name}" created</h1>
          <p className="mt-2 text-slate-600">Add lessons or practice labs that map to this topic next.</p>
          <div className="mt-7 flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={() => navigate('/dashboard/teacher')} className="rounded-full">Back to dashboard</Button>
            <Button variant="outline" onClick={() => { setSuccess(null); setName(''); setDescription(''); setOrder(order + 1); }} className="rounded-full">Add another topic</Button>
          </div>
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link to="/dashboard/teacher" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Curriculum</p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Add a topic</h1>
        <p className="mt-2 text-slate-600">Extend the curriculum tree with a new topic. Lessons, practice labs, and assessments can attach to it.</p>
      </header>

      <Card><CardContent className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Subject *</Label>
              <Select value={subjectId} onValueChange={setSubjectId} disabled={loading}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder={loading ? 'Loading…' : 'Pick'} /></SelectTrigger>
                <SelectContent>{subjects.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Class level *</Label>
              <Select value={classLevelId} onValueChange={setClassLevelId} disabled={loading}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder={loading ? 'Loading…' : 'Pick'} /></SelectTrigger>
                <SelectContent>{classLevels.map((l) => <SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500"><BookMarked className="w-3.5 h-3.5 inline mr-1" /> Topic name *</Label>
            <Input className="mt-1.5" placeholder="Algebra Basics" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</Label>
            <Textarea className="mt-1.5" rows={3} placeholder="Learning outcomes for this topic." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Order</Label>
            <Input type="number" min={1} step={1} className="mt-1.5 w-32" value={order} onChange={(e) => setOrder(parseInt(e.target.value) || 1)} />
            <p className="mt-1 text-xs text-slate-500">Position within the subject. Lower numbers appear first.</p>
          </div>
          {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-rose-600" /><p className="text-sm text-rose-700">{error}</p></div>}
          <Button type="submit" disabled={submitting} className="w-full rounded-full bg-slate-900 hover:bg-slate-800 text-white h-11 font-bold">
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Add topic
          </Button>
        </form>
      </CardContent></Card>
    </div>
  );
};

export default TopicCreationForm;
