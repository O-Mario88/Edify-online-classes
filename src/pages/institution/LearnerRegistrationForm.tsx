import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Phone, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { apiGet, apiPost, API_BASE_URL } from '../../lib/apiClient';

interface ClassLevel { id: number; name: string; code?: string }
interface Institution { id: number; name: string }

const arr = <T,>(d: any): T[] => (Array.isArray(d) ? d : (d?.results || []));

/**
 * Single-record learner registration form for institution admins.
 * Fills the LearnerRegistration model directly via POST. The bulk
 * invite flow lives elsewhere — this is the "I have a new student
 * walking into reception, register them now" path.
 *
 * Route: /dashboard/institution/learners/new
 */
export const LearnerRegistrationForm: React.FC = () => {
  const navigate = useNavigate();

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  // Form state
  const [institutionId, setInstitutionId] = useState<string>('');
  const [fullName, setFullName] = useState('');
  const [classLevelId, setClassLevelId] = useState<string>('');
  const [stream, setStream] = useState('');
  const [learnerIdNumber, setLearnerIdNumber] = useState('');
  const [gender, setGender] = useState<string>('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentRelationship, setParentRelationship] = useState('');
  const [parentConsent, setParentConsent] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [instResp, levelsResp] = await Promise.all([
        apiGet<any>(`${API_BASE_URL}/api/v1/institutions/`),
        apiGet<any>(`${API_BASE_URL}/api/v1/curriculum/class-levels/`),
      ]);
      if (cancelled) return;
      const insts = arr<Institution>(instResp.data || []);
      const levels = arr<ClassLevel>(levelsResp.data || []);
      setInstitutions(insts);
      setClassLevels(levels);
      if (insts.length === 1) setInstitutionId(String(insts[0].id));
      setLoadingMeta(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const validate = (): string | null => {
    if (!institutionId) return 'Pick an institution.';
    if (!fullName.trim()) return "Student's full name is required.";
    if (!classLevelId) return 'Pick the class level.';
    if (!parentName.trim()) return "Parent / guardian name is required.";
    if (!parentPhone.trim()) return 'Parent phone is required for SMS notifications.';
    if (!parentConsent) return 'Confirm the parent has consented to enrollment.';
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const err = validate();
    if (err) { setError(err); return; }

    setSubmitting(true);
    const payload = {
      institution: institutionId,
      full_name: fullName.trim(),
      class_level: classLevelId,
      stream_section: stream.trim() || null,
      learner_id_number: learnerIdNumber.trim() || null,
      gender: gender || null,
      parent_name: parentName.trim(),
      parent_phone: parentPhone.trim(),
      parent_email: parentEmail.trim() || null,
      parent_relationship: parentRelationship || null,
      parent_consent: parentConsent,
    };
    const r = await apiPost<{ id: string; full_name: string }>(
      `${API_BASE_URL}/api/v1/institutions/learner-registrations/`,
      payload,
    );
    setSubmitting(false);
    if (r.error) {
      setError(r.error.message);
      return;
    }
    setSuccess({ id: r.data?.id || '', name: r.data?.full_name || fullName });
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-xl">
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h1 className="mt-4 text-2xl font-extrabold text-slate-900">{success.name} registered</h1>
            <p className="mt-2 text-slate-600">
              The parent will receive an SMS with a sign-in link to confirm their account and pay the platform fee.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={() => navigate('/dashboard/institution')} className="rounded-full">
                Back to dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSuccess(null);
                  setFullName('');
                  setStream('');
                  setLearnerIdNumber('');
                  setGender('');
                  setParentName('');
                  setParentPhone('');
                  setParentEmail('');
                  setParentRelationship('');
                  setParentConsent(false);
                }}
                className="rounded-full"
              >
                Register another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link to="/dashboard/institution" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>

      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Admissions</p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Register a learner</h1>
        <p className="mt-2 text-slate-600">
          Single-student registration. The parent / guardian gets an SMS to confirm and pay.
        </p>
      </header>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Institution + Student section */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                <User className="w-3.5 h-3.5 inline mr-1" /> Student details
              </h3>
              {institutions.length > 1 && (
                <div className="mb-3">
                  <Label className="text-xs font-semibold text-slate-700">Institution</Label>
                  <Select value={institutionId} onValueChange={setInstitutionId} disabled={loadingMeta}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder={loadingMeta ? 'Loading…' : 'Pick'} />
                    </SelectTrigger>
                    <SelectContent>
                      {institutions.map((i) => (
                        <SelectItem key={i.id} value={String(i.id)}>{i.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <Label className="text-xs font-semibold text-slate-700">Full name *</Label>
                  <Input className="mt-1.5" placeholder="Akiki Namatovu" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Class level *</Label>
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
                  <Label className="text-xs font-semibold text-slate-700">Stream / Section</Label>
                  <Input className="mt-1.5" placeholder="East, A" value={stream} onChange={(e) => setStream(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Learner ID</Label>
                  <Input className="mt-1.5" placeholder="School ID number" value={learnerIdNumber} onChange={(e) => setLearnerIdNumber(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Optional" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Parent section */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                <Phone className="w-3.5 h-3.5 inline mr-1" /> Parent / guardian
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Parent name *</Label>
                  <Input className="mt-1.5" placeholder="Mrs Namatovu Senior" value={parentName} onChange={(e) => setParentName(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Relationship</Label>
                  <Select value={parentRelationship} onValueChange={setParentRelationship}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Mother, Father, Guardian…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mother">Mother</SelectItem>
                      <SelectItem value="father">Father</SelectItem>
                      <SelectItem value="guardian">Guardian</SelectItem>
                      <SelectItem value="sponsor">Sponsor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Phone *</Label>
                  <Input className="mt-1.5" type="tel" placeholder="+256 700 000 000" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Email</Label>
                  <Input className="mt-1.5" type="email" placeholder="parent@example.com" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} />
                </div>
              </div>

              <label className="mt-4 flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={parentConsent}
                  onChange={(e) => setParentConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-700"
                />
                <span className="text-sm text-slate-700">
                  Parent / guardian has consented to enrollment and platform-fee payment.
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
              Register learner
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearnerRegistrationForm;
