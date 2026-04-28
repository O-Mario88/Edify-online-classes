import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Loader2, AlertTriangle, CheckCircle2, Plus, CalendarCheck, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { apiGet, apiPost, apiPatch, apiDelete, API_BASE_URL } from '../../lib/apiClient';

interface Institution { id: number; name: string }
interface AcademicTerm {
  id: number;
  name: string;
  institution: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

const arr = <T,>(d: any): T[] => (Array.isArray(d) ? d : (d?.results || []));

/**
 * Term Setup form. Lists existing terms for the admin's institution
 * and provides an inline form to add a new term. Activating a term
 * deactivates the others (the backend's @action activate handles
 * this atomically). Used by InstitutionTimetableStudio + the homepage
 * "this term" displays.
 *
 * Route: /dashboard/institution/terms
 */
export const TermSetupPage: React.FC = () => {
  const navigate = useNavigate();

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [institutionId, setInstitutionId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New-term form state
  const [name, setName] = useState('Term 1 2026');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [makeActive, setMakeActive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [instResp, termsResp] = await Promise.all([
        apiGet<any>(`${API_BASE_URL}/api/v1/institutions/`),
        apiGet<any>(`${API_BASE_URL}/api/v1/scheduling/terms/`),
      ]);
      if (cancelled) return;
      const insts = arr<Institution>(instResp.data || []);
      setInstitutions(insts);
      if (insts.length === 1) setInstitutionId(String(insts[0].id));
      if (!termsResp.error) setTerms(arr<AcademicTerm>(termsResp.data || []));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const refreshTerms = async () => {
    const r = await apiGet<any>(`${API_BASE_URL}/api/v1/scheduling/terms/`);
    if (!r.error) setTerms(arr<AcademicTerm>(r.data || []));
  };

  const validate = (): string | null => {
    if (!institutionId) return 'Pick an institution.';
    if (!name.trim()) return 'Name the term (e.g. "Term 1 2026").';
    if (!startDate || !endDate) return 'Set both start and end dates.';
    if (new Date(startDate) >= new Date(endDate)) return 'End date must come after start date.';
    return null;
  };

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const err = validate();
    if (err) { setError(err); return; }

    setSaving(true);
    const r = await apiPost<AcademicTerm>(
      `${API_BASE_URL}/api/v1/scheduling/terms/`,
      {
        institution: institutionId,
        name: name.trim(),
        start_date: startDate,
        end_date: endDate,
        is_active: makeActive,
      },
    );
    setSaving(false);
    if (r.error) {
      setError(r.error.message);
      return;
    }
    if (makeActive && r.data?.id) {
      // Server-side activate flips siblings off too
      await apiPost<AcademicTerm>(
        `${API_BASE_URL}/api/v1/scheduling/terms/${r.data.id}/activate/`,
        {},
      );
    }
    setName('');
    setStartDate('');
    setEndDate('');
    setMakeActive(false);
    await refreshTerms();
  };

  const onActivate = async (term: AcademicTerm) => {
    await apiPost<AcademicTerm>(`${API_BASE_URL}/api/v1/scheduling/terms/${term.id}/activate/`, {});
    await refreshTerms();
  };

  const onDelete = async (term: AcademicTerm) => {
    if (!confirm(`Delete "${term.name}"? Timetable slots and assessments linked to this term will lose their term context.`)) return;
    await apiDelete(`${API_BASE_URL}/api/v1/scheduling/terms/${term.id}/`);
    await refreshTerms();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // Filter terms to the selected institution (server already scopes by
  // membership; this is just for the multi-institution admin case).
  const visibleTerms = institutionId
    ? terms.filter((t) => String(t.institution) === institutionId)
    : terms;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link to="/dashboard/institution" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>

      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">School calendar</p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Academic terms</h1>
        <p className="mt-2 text-slate-600">
          Define when each term starts and ends. The active term drives the timetable, assessment windows, and the homepage's "this term" view.
        </p>
      </header>

      {/* Institution picker (only when admin has multiple) */}
      {institutions.length > 1 && (
        <div className="mb-4">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Institution</Label>
          <Select value={institutionId} onValueChange={setInstitutionId}>
            <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
            <SelectContent>
              {institutions.map((i) => (
                <SelectItem key={i.id} value={String(i.id)}>{i.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Existing terms list */}
      <Card className="mb-6">
        <CardContent className="p-0 divide-y divide-slate-100">
          {visibleTerms.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              No terms defined yet. Add the first one below.
            </div>
          ) : (
            visibleTerms.map((term) => (
              <div key={term.id} className="p-4 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900">{term.name}</p>
                    {term.is_active && (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">
                        <CalendarCheck className="w-3 h-3 mr-1" /> Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(term.start_date).toLocaleDateString()} → {new Date(term.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {!term.is_active && (
                    <Button variant="outline" size="sm" className="rounded-full" onClick={() => onActivate(term)}>
                      Activate
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => onDelete(term)} aria-label="Delete term">
                    <Trash2 className="w-4 h-4 text-rose-600" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* New term form */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
            <Plus className="w-3.5 h-3.5 inline mr-1" /> Add a term
          </h2>
          <form onSubmit={onCreate} className="space-y-4">
            <div>
              <Label className="text-xs font-semibold text-slate-700">Name</Label>
              <Input
                className="mt-1.5"
                placeholder="Term 1 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  <Calendar className="w-3.5 h-3.5 inline mr-1" /> Start date
                </Label>
                <Input
                  type="date"
                  className="mt-1.5"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  <Calendar className="w-3.5 h-3.5 inline mr-1" /> End date
                </Label>
                <Input
                  type="date"
                  className="mt-1.5"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={makeActive}
                onChange={(e) => setMakeActive(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-700"
              />
              <span className="text-sm text-slate-700">
                <CalendarCheck className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />
                Make this the active term (deactivates others)
              </span>
            </label>

            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <p className="text-sm text-rose-700">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={saving}
              className="w-full rounded-full bg-slate-900 hover:bg-slate-800 text-white h-11 font-bold"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Add term
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TermSetupPage;
