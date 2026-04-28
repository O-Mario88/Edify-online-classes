import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, DollarSign, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { apiGet, apiPost, API_BASE_URL } from '../../lib/apiClient';

interface Institution { id: number; name: string }
interface Student { id: number; full_name: string; email: string }

const arr = <T,>(d: any): T[] => (Array.isArray(d) ? d : (d?.results || []));

/**
 * Fee assessment creation form. Charges a single student a fee for a
 * term, with a free-form item label so admins can use their own
 * naming (Tuition / Transport / Lunch / Exam / etc.). Currency
 * defaults to UGX; KES + USD selectable.
 *
 * Route: /dashboard/institution/fees/new
 */
export const FeeAssessmentForm: React.FC = () => {
  const navigate = useNavigate();

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const [institutionId, setInstitutionId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [termLabel, setTermLabel] = useState('2026 Term 1');
  const [item, setItem] = useState('Tuition');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'UGX' | 'KES' | 'USD'>('UGX');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ id: number; amount: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [iR, sR] = await Promise.all([
        apiGet<any>(`${API_BASE_URL}/api/v1/institutions/`),
        apiGet<any>(`${API_BASE_URL}/api/v1/institution-memberships/?role=student&status=active`),
      ]);
      if (cancelled) return;
      const insts = arr<Institution>(iR.data);
      setInstitutions(insts);
      if (insts.length === 1) setInstitutionId(String(insts[0].id));
      setStudents(arr<any>(sR.data).map((m: any) => ({
        id: m.user_id || m.user?.id,
        full_name: m.user?.full_name || m.full_name || m.user?.email || 'Student',
        email: m.user?.email || '',
      })));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!institutionId || !studentId || !termLabel.trim() || !item.trim() || !amount) {
      setError('Institution, student, term, item, and amount are required.');
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { setError('Amount must be a positive number.'); return; }

    setSubmitting(true);
    const r = await apiPost<{ id: number; amount: string }>(
      `${API_BASE_URL}/api/v1/fees/assessments/`,
      {
        institution: institutionId,
        student: studentId,
        term_label: termLabel.trim(),
        item: item.trim(),
        amount: amt.toFixed(2),
        currency,
        due_date: dueDate || null,
        notes: notes.trim(),
      },
    );
    setSubmitting(false);
    if (r.error) { setError(r.error.message); return; }
    setSuccess({ id: r.data!.id, amount: r.data!.amount });
  };

  if (success) {
    const studentName = students.find((s) => String(s.id) === studentId)?.full_name || 'the student';
    return (
      <div className="container mx-auto px-4 py-12 max-w-xl">
        <Card><CardContent className="p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Fee charged</h1>
          <p className="mt-2 text-slate-600">{currency} {amount} charged to {studentName} for {item} ({termLabel}). The parent will receive an SMS with payment instructions.</p>
          <div className="mt-7 flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={() => navigate('/dashboard/institution')} className="rounded-full">Back to dashboard</Button>
            <Button variant="outline" onClick={() => { setSuccess(null); setStudentId(''); setAmount(''); setNotes(''); }} className="rounded-full">Charge another</Button>
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
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Finance</p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Charge a fee</h1>
        <p className="mt-2 text-slate-600">Single-student fee assessment. The parent gets an SMS with payment options (MoMo, Airtel, M-Pesa).</p>
      </header>

      <Card><CardContent className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          {institutions.length > 1 && (
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Institution</Label>
              <Select value={institutionId} onValueChange={setInstitutionId} disabled={loading}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder={loading ? 'Loading…' : 'Pick'} /></SelectTrigger>
                <SelectContent>{institutions.map((i) => <SelectItem key={i.id} value={String(i.id)}>{i.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Student *</Label>
            <Select value={studentId} onValueChange={setStudentId} disabled={loading}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder={loading ? 'Loading…' : 'Pick a student'} /></SelectTrigger>
              <SelectContent>{students.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.full_name}{s.email ? ` · ${s.email}` : ''}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Term label *</Label>
              <Input className="mt-1.5" placeholder="2026 Term 1" value={termLabel} onChange={(e) => setTermLabel(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Item *</Label>
              <Input className="mt-1.5" placeholder="Tuition / Lunch / Transport" value={item} onChange={(e) => setItem(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500"><DollarSign className="w-3.5 h-3.5 inline mr-1" /> Amount *</Label>
              <Input type="number" min={0} step={0.01} className="mt-1.5" placeholder="500000" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Currency</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as 'UGX' | 'KES' | 'USD')}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="UGX">UGX</SelectItem>
                  <SelectItem value="KES">KES</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Due date</Label>
            <Input type="date" className="mt-1.5" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Notes</Label>
            <Textarea className="mt-1.5" rows={2} placeholder="Optional context the parent will see." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-rose-600" /><p className="text-sm text-rose-700">{error}</p></div>}
          <Button type="submit" disabled={submitting} className="w-full rounded-full bg-slate-900 hover:bg-slate-800 text-white h-11 font-bold">
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Charge fee
          </Button>
        </form>
      </CardContent></Card>
    </div>
  );
};

export default FeeAssessmentForm;
