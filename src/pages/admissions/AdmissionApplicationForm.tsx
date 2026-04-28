import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, School, GraduationCap, Loader2, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { apiGet, apiPost, API_BASE_URL } from '../../lib/apiClient';

interface InstitutionRow { id: number; name: string; location?: string; tagline?: string }
interface ClassLevel { id: number; name: string }

const arr = <T,>(d: any): T[] => (Array.isArray(d) ? d : (d?.results || []));

/**
 * Parent-side admission application form. Routes from school
 * recommendations → "Apply" button. Creates a draft application,
 * then submits it via the @action submit endpoint so the backend
 * sets submitted_at + flips status to "submitted".
 *
 * Route: /admissions/apply (optional ?institution=<id> prefill)
 */
export const AdmissionApplicationForm: React.FC = () => {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const prefillInst = search.get('institution');

  const [institutions, setInstitutions] = useState<InstitutionRow[]>([]);
  const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  // Form state
  const [institutionId, setInstitutionId] = useState<string>(prefillInst || '');
  const [classLevelId, setClassLevelId] = useState<string>('');
  const [entryTerm, setEntryTerm] = useState('Term 1 2026');
  const [studyMode, setStudyMode] = useState<'day' | 'boarding' | 'hybrid' | ''>('');
  const [currentSchool, setCurrentSchool] = useState('');
  const [academicSummary, setAcademicSummary] = useState('');
  const [sharePassport, setSharePassport] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ id: string; institution: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [instResp, levelsResp] = await Promise.all([
        apiGet<any>(`${API_BASE_URL}/api/v1/institutions/`),
        apiGet<any>(`${API_BASE_URL}/api/v1/curriculum/class-levels/`),
      ]);
      if (cancelled) return;
      setInstitutions(arr<InstitutionRow>(instResp.data || []));
      setClassLevels(arr<ClassLevel>(levelsResp.data || []));
      setLoadingMeta(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const validate = (): string | null => {
    if (!institutionId) return 'Pick a school to apply to.';
    if (!classLevelId) return 'Pick the class your child is applying for.';
    if (!entryTerm.trim()) return 'Set the entry term.';
    if (!studyMode) return 'Pick study mode (day, boarding, or hybrid).';
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const err = validate();
    if (err) { setError(err); return; }

    setSubmitting(true);
    // Step 1 — create the draft application
    const createResp = await apiPost<{ id: string }>(
      `${API_BASE_URL}/api/v1/admission-passport/applications/`,
      {
        institution: institutionId,
        class_level: classLevelId,
        entry_term: entryTerm,
        study_mode: studyMode,
        current_school: currentSchool || '',
        academic_summary: academicSummary || '',
        share_passport: sharePassport,
      },
    );
    if (createResp.error || !createResp.data?.id) {
      setSubmitting(false);
      setError(createResp.error?.message || 'Could not start the application.');
      return;
    }

    // Step 2 — submit it (flips draft → submitted, stamps submitted_at)
    const submitResp = await apiPost<any>(
      `${API_BASE_URL}/api/v1/admission-passport/applications/${createResp.data.id}/submit/`,
      { passport_share_consent: sharePassport },
    );
    setSubmitting(false);
    if (submitResp.error) {
      setError(submitResp.error.message);
      return;
    }
    const inst = institutions.find((i) => String(i.id) === institutionId);
    setSuccess({ id: createResp.data.id, institution: inst?.name || 'the school' });
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-xl">
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Application sent</h1>
            <p className="mt-2 text-slate-600">
              {success.institution} has received your application. They'll get in touch about next steps —
              usually an interview invitation, an entrance assessment, or a request for more information.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={() => navigate('/dashboard/parent')} className="rounded-full">
                Back to dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate('/schools/compare')} className="rounded-full">
                Compare more schools
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link to="/dashboard/parent" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>

      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Admissions</p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Apply to a school</h1>
        <p className="mt-2 text-slate-600">
          Build the application packet from your child's Learning Passport. Send to one school, or reuse it for several.
        </p>
      </header>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Institution */}
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                <School className="w-3.5 h-3.5 inline mr-1" /> School
              </Label>
              <Select value={institutionId} onValueChange={setInstitutionId} disabled={loadingMeta}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder={loadingMeta ? 'Loading schools…' : 'Pick a school'} />
                </SelectTrigger>
                <SelectContent>
                  {institutions.map((i) => (
                    <SelectItem key={i.id} value={String(i.id)}>
                      {i.name}{i.location ? ` · ${i.location}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Class level + entry term */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  <GraduationCap className="w-3.5 h-3.5 inline mr-1" /> Class level
                </Label>
                <Select value={classLevelId} onValueChange={setClassLevelId} disabled={loadingMeta}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder={loadingMeta ? 'Loading…' : 'P6, S2, Grade 7…'} />
                  </SelectTrigger>
                  <SelectContent>
                    {classLevels.map((l) => (
                      <SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Entry term</Label>
                <Input
                  className="mt-1.5"
                  placeholder="Term 1 2026"
                  value={entryTerm}
                  onChange={(e) => setEntryTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Study mode */}
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Study mode</Label>
              <Select value={studyMode} onValueChange={(v) => setStudyMode(v as typeof studyMode)}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Day, boarding, or hybrid" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="boarding">Boarding</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Current school */}
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                <FileText className="w-3.5 h-3.5 inline mr-1" /> Current school (optional)
              </Label>
              <Input
                className="mt-1.5"
                placeholder="Where is your child studying now?"
                value={currentSchool}
                onChange={(e) => setCurrentSchool(e.target.value)}
              />
            </div>

            {/* Academic summary */}
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">A short note (optional)</Label>
              <Textarea
                className="mt-1.5"
                rows={4}
                placeholder="Strengths, interests, recent achievements — anything the admissions officer should know."
                value={academicSummary}
                onChange={(e) => setAcademicSummary(e.target.value)}
              />
              <p className="mt-1.5 text-xs text-slate-500">
                The full Learning Passport is shared automatically when you tick the consent box below. Use this for context the Passport doesn't capture.
              </p>
            </div>

            {/* Passport consent */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sharePassport}
                  onChange={(e) => setSharePassport(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-700"
                />
                <span>
                  <span className="text-sm font-bold text-slate-900">Share Learning Passport with this school</span>
                  <span className="block text-xs text-slate-600 mt-1">
                    The school's admissions officer can read a redacted version (badges, certificates, attendance, signals)
                    to make a calibrated decision. You can revoke access at any time.
                  </span>
                </span>
              </label>
            </div>

            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <p className="text-sm text-rose-700">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-slate-900 hover:bg-slate-800 text-white h-11 font-bold"
            >
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Submit application
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdmissionApplicationForm;
