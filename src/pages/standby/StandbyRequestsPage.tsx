import React, { useEffect, useState } from 'react';
import { Users, Clock, CheckCircle2, Send, Loader2, ArrowLeft, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { apiGet, apiPost } from '../../lib/apiClient';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';

interface SupportRequest {
  id: string;
  student_name?: string;
  teacher_name?: string | null;
  subject_name?: string | null;
  topic: string;
  question: string;
  request_type: string;
  priority: string;
  status: string;
  resolution_note?: string;
  created_at: string;
  assigned_at?: string | null;
  resolved_at?: string | null;
}

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-amber-50 text-amber-700 border-amber-100',
  assigned: 'bg-blue-50 text-blue-700 border-blue-100',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  closed: 'bg-slate-50 text-slate-700 border-slate-100',
};


export const StandbyRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const isTeacher = ['teacher', 'independent_teacher', 'institution_teacher', 'institution_admin', 'platform_admin'].includes(
    (user as any)?.role || '',
  );

  const [items, setItems] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const url = isTeacher
      ? '/standby-teachers/support-requests/teacher-queue/'
      : '/standby-teachers/support-requests/my/';
    const { data } = await apiGet<SupportRequest[]>(url);
    if (Array.isArray(data)) setItems(data);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [isTeacher]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-3xl mx-auto px-4 space-y-6">
        <Link to="/dashboard/student" className="text-sm text-slate-500 inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>

        <header className="flex items-start gap-3">
          <Users className="w-7 h-7 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isTeacher ? 'Standby Teacher Queue' : 'My questions to the Standby Teachers'}
            </h1>
            <p className="text-sm text-slate-600">
              {isTeacher
                ? 'Pick up a question and help a learner. Responses build your reputation on Maple.'
                : 'Every question here is picked up by a real verified teacher, not a bot.'}
            </p>
          </div>
        </header>

        {items.length === 0 ? (
          <Card><CardContent className="p-10 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-900">
              {isTeacher ? 'Queue is clear.' : 'No questions yet.'}
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              {isTeacher
                ? 'When learners post new questions, they appear here ranked by priority.'
                : 'When you\'re stuck on something, ask a standby teacher from the dashboard card and it will appear here.'}
            </p>
          </CardContent></Card>
        ) : (
          items.map(r => <RequestCard key={r.id} r={r} isTeacher={isTeacher} onUpdated={load} />)
        )}
      </div>
    </div>
  );
};


const RequestCard: React.FC<{ r: SupportRequest; isTeacher: boolean; onUpdated: () => void }> = ({ r, isTeacher, onUpdated }) => {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const accept = async () => {
    setSaving(true);
    const { error } = await apiPost(`/standby-teachers/support-requests/${r.id}/accept/`, {});
    setSaving(false);
    if (error) { toast.error('Could not accept the request.'); return; }
    toast.success('Accepted — you can now resolve it below.');
    onUpdated();
  };

  const resolve = async () => {
    setSaving(true);
    const { error } = await apiPost(`/standby-teachers/support-requests/${r.id}/resolve/`, {
      resolution_note: note,
    });
    setSaving(false);
    if (error) { toast.error('Could not resolve the request.'); return; }
    toast.success('Response sent to the learner.');
    setNote('');
    onUpdated();
  };

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <CardTitle className="text-base">{r.topic || r.subject_name || 'Question'}</CardTitle>
          <p className="text-xs text-slate-500 mt-1">
            {isTeacher ? `From ${r.student_name}` : r.teacher_name ? `Assigned to ${r.teacher_name}` : 'Waiting for a teacher'}
            {' · '}
            {new Date(r.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <Badge variant="outline" className={STATUS_STYLES[r.status] || 'bg-slate-50'}>{r.status}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700 whitespace-pre-line">{r.question}</div>

        {r.resolution_note && (
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-1 flex items-center gap-1">
              <UserCheck className="w-3 h-3" /> Teacher response
            </p>
            <p className="text-sm text-emerald-900 whitespace-pre-line">{r.resolution_note}</p>
          </div>
        )}

        {isTeacher && r.status === 'open' && (
          <Button size="sm" onClick={accept} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            <Clock className="w-4 h-4 mr-1" /> Accept
          </Button>
        )}
        {isTeacher && r.status === 'assigned' && (
          <div className="space-y-2">
            <Textarea rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="Write your teaching response…" />
            <div className="flex justify-end">
              <Button size="sm" onClick={resolve} disabled={!note.trim() || saving} className="bg-emerald-600 hover:bg-emerald-700">
                <Send className="w-4 h-4 mr-1" /> Send response
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StandbyRequestsPage;
