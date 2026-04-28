import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { apiGet, apiPost, API_BASE_URL } from '../../lib/apiClient';

interface Institution { id: number; name: string }
interface ClassLevel { id: number; name: string }
interface InstitutionSubject { id: number; subject_name?: string; name?: string }
interface Teacher { id: number; full_name: string; email: string }

const arr = <T,>(d: any): T[] => (Array.isArray(d) ? d : (d?.results || []));

/**
 * Class creation form. Single-record alternative to the bulk class
 * setup buried inside InstitutionWizard. Used when an admin creates
 * a new class mid-term ("S2 East Biology with Mr Okello").
 *
 * Route: /dashboard/institution/classes/new
 */
export const ClassCreationForm: React.FC = () => {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
  const [subjects, setSubjects] = useState<InstitutionSubject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  const [institutionId, setInstitutionId] = useState('');
  const [classLevelId, setClassLevelId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState<'private' | 'public'>('private');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ id: number; title: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [iR, lR, sR, tR] = await Promise.all([
        apiGet<any>(`${API_BASE_URL}/api/v1/institutions/`),
        apiGet<any>(`${API_BASE_URL}/api/v1/curriculum/class-levels/`),
        apiGet<any>(`${API_BASE_URL}/api/v1/institutions/subjects/`),
        apiGet<any>(`${API_BASE_URL}/api/v1/institution-memberships/?role=teacher&status=active`),
      ]);
      if (cancelled) return;
      const insts = arr<Institution>(iR.data);
      setInstitutions(insts);
      if (insts.length === 1) setInstitutionId(String(insts[0].id));
      setClassLevels(arr<ClassLevel>(lR.data));
      setSubjects(arr<InstitutionSubject>(sR.data));
      setTeachers(arr<any>(tR.data).map((m: any) => ({
        id: m.user_id || m.user?.id,
        full_name: m.user?.full_name || m.full_name || m.user?.email || 'Teacher',
        email: m.user?.email || '',
      })));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!institutionId || !classLevelId || !teacherId || !title.trim()) {
      setError('Fill the required fields.');
      return;
    }
    setSubmitting(true);
    const r = await apiPost<{ id: number; title: string }>(
      `${API_BASE_URL}/api/v1/classes/`,
      {
        institution: institutionId,
        institution_subject: subjectId || null,
        class_level: classLevelId,
        teacher: teacherId,
        title: title.trim(),
        visibility,
        is_published: false,
      },
    );
    setSubmitting(false);
    if (r.error) { setError(r.error.message); return; }
    setSuccess({ id: r.data!.id, title: r.data!.title });
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-xl">
        <Card><CardContent className="p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h1 className="mt-4 text-2xl font-extrabold text-slate-900">{success.title} created</h1>
          <p className="mt-2 text-slate-600">Add a timetable slot or schedule the first lesson next.</p>
          <div className="mt-7 flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={() => navigate('/dashboard/institution')} className="rounded-full">Back to dashboard</Button>
            <Button variant="outline" onClick={() => navigate('/dashboard/institution/timetable')} className="rounded-full">Add timetable slot</Button>
          </div>
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link to="/dashboard/institution" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Classes</p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Create a class</h1>
        <p className="mt-2 text-slate-600">Pick a class level + subject + teacher. Visibility defaults to private (only your school sees it).</p>
      </header>

      <Card><CardContent className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500"><BookOpen className="w-3.5 h-3.5 inline mr-1" /> Title *</Label>
            <Input className="mt-1.5" placeholder="S3 East Biology" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          {institutions.length > 1 && (
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Institution</Label>
              <Select value={institutionId} onValueChange={setInstitutionId} disabled={loading}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder={loading ? 'Loading…' : 'Pick'} /></SelectTrigger>
                <SelectContent>{institutions.map((i) => <SelectItem key={i.id} value={String(i.id)}>{i.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Class level *</Label>
              <Select value={classLevelId} onValueChange={setClassLevelId} disabled={loading}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder={loading ? 'Loading…' : 'Pick'} /></SelectTrigger>
                <SelectContent>{classLevels.map((l) => <SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Subject</Label>
              <Select value={subjectId} onValueChange={setSubjectId} disabled={loading}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>{subjects.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.subject_name || s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Teacher *</Label>
            <Select value={teacherId} onValueChange={setTeacherId} disabled={loading}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder={loading ? 'Loading…' : 'Pick a teacher'} /></SelectTrigger>
              <SelectContent>{teachers.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.full_name}{t.email ? ` · ${t.email}` : ''}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Visibility</Label>
            <Select value={visibility} onValueChange={(v) => setVisibility(v as 'private' | 'public')}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private — only your school</SelectItem>
                <SelectItem value="public">Public — discoverable in marketplace</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-rose-600" /><p className="text-sm text-rose-700">{error}</p></div>}
          <Button type="submit" disabled={submitting} className="w-full rounded-full bg-slate-900 hover:bg-slate-800 text-white h-11 font-bold">
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Create class
          </Button>
        </form>
      </CardContent></Card>
    </div>
  );
};

export default ClassCreationForm;
