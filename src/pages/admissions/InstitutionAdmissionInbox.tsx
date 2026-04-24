import React, { useEffect, useState } from 'react';
import { Loader2, ExternalLink, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { apiGet, apiPost } from '../../lib/apiClient';
import { toast } from 'sonner';

interface StatusEvent { id: string; from_status: string; to_status: string; actor_name: string; note: string; created_at: string; }

interface Application {
  id: string;
  student_name: string;
  institution_name: string;
  entry_term?: string;
  study_mode?: string;
  current_school?: string;
  academic_summary?: string;
  share_passport: boolean;
  shared_passport_token: string;
  status: string;
  submitted_at?: string;
  events: StatusEvent[];
}

const NEXT_STATES: Record<string, string[]> = {
  submitted: ['under_review', 'more_info_requested', 'interview_invited', 'rejected'],
  under_review: ['more_info_requested', 'interview_invited', 'accepted', 'waitlisted', 'rejected'],
  more_info_requested: ['under_review', 'rejected'],
  interview_invited: ['accepted', 'waitlisted', 'rejected'],
};

export const InstitutionAdmissionInbox: React.FC = () => {
  const [inbox, setInbox] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await apiGet<Application[]>('/admission-passport/applications/institution-inbox/');
    if (error) {
      toast.error("You don't have access to the admissions inbox.");
      return;
    }
    if (Array.isArray(data)) setInbox(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">Admission Interest Inbox</h1>
          <p className="text-sm text-slate-600">Every applicant here has real platform evidence in their Learning Passport — open the passport before deciding.</p>
        </header>

        {inbox.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-900">Inbox is clear.</h3>
            <p className="text-sm text-slate-600 mt-1">New admission applications will appear here the moment a learner submits.</p>
          </div>
        ) : (
          inbox.map(a => <InboxItem key={a.id} app={a} onUpdated={load} />)
        )}
      </div>
    </div>
  );
};

const InboxItem: React.FC<{ app: Application; onUpdated: () => void }> = ({ app, onUpdated }) => {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const allowed = NEXT_STATES[app.status] || [];

  const change = async (to_status: string) => {
    setSaving(true);
    const { error } = await apiPost(`/admission-passport/applications/${app.id}/change-status/`, { to_status, note });
    setSaving(false);
    if (error) { toast.error('Could not update status.'); return; }
    toast.success(`Moved to ${to_status.replace('_', ' ')}.`);
    setNote('');
    onUpdated();
  };

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-base">{app.student_name}</CardTitle>
          <p className="text-xs text-slate-500 mt-1">{app.entry_term || '—'} · {app.study_mode || 'mode not set'} · currently at {app.current_school || '—'}</p>
        </div>
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100">{app.status.replace('_', ' ')}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {app.academic_summary && (
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700">{app.academic_summary}</div>
        )}
        {app.shared_passport_token ? (
          <a
            href={`/api/v1/passport/public/${app.shared_passport_token}/`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-700 hover:text-indigo-800"
          >
            <ExternalLink className="w-4 h-4" /> Open Learning Passport
          </a>
        ) : (
          <p className="text-xs text-slate-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Applicant did not share a Learning Passport.</p>
        )}

        {app.events.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Timeline</p>
            <ul className="space-y-1">
              {app.events.map(e => (
                <li key={e.id} className="text-xs text-slate-600 flex items-center gap-2">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span className="font-medium">{e.to_status.replace('_', ' ')}</span>
                  <span className="text-slate-400">·</span>
                  <span>{e.actor_name}</span>
                  {e.note && <span className="text-slate-500">— {e.note}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {allowed.length > 0 && (
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <Textarea rows={2} placeholder="Optional note to applicant…" value={note} onChange={e => setNote(e.target.value)} />
            <div className="flex flex-wrap gap-2 justify-end">
              {allowed.map(s => (
                <Button key={s} size="sm" variant="outline" onClick={() => change(s)} disabled={saving}>
                  Move to {s.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InstitutionAdmissionInbox;
