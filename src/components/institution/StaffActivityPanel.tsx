import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Users, Mail, UserPlus, Clock } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';
import { toast } from 'sonner';

interface Member {
  id: number;
  user: { id: number; full_name: string; email: string; role?: string } | null;
  user_last_login?: string | null;
  role: string;
  status: string;
}

interface StaffActivityPanelProps {
  members: Member[];
  institutionId?: number | null;
  loading?: boolean;
}

/**
 * Twin-panel for the institution Roster tab:
 * - Left: staff-activity snapshot — who logged in in the last 24h /
 *   7d / never. Replaces the previous "list of everyone with roles"
 *   that didn't tell the admin which teachers are dormant.
 * - Right: a one-click "Invite teacher" mini-form. Posts to
 *   /api/v1/institutions/<id>/members/ with role='subject_teacher'
 *   using the existing BulkInvite endpoint.
 */
export const StaffActivityPanel: React.FC<StaffActivityPanelProps> = ({ members, institutionId, loading }) => {
  const staff = useMemo(
    () => members.filter((m) => /teacher|head|deputy|dos|registrar/.test(m.role || '')),
    [members],
  );

  const buckets = useMemo(() => {
    const now = Date.now();
    const DAY = 86_400_000;
    const activeToday: Member[] = [];
    const activeWeek: Member[] = [];
    const dormant: Member[] = [];
    const neverLoggedIn: Member[] = [];
    staff.forEach((m) => {
      if (!m.user_last_login) {
        neverLoggedIn.push(m);
        return;
      }
      const ts = new Date(m.user_last_login).getTime();
      const ago = now - ts;
      if (ago <= DAY) activeToday.push(m);
      else if (ago <= 7 * DAY) activeWeek.push(m);
      else dormant.push(m);
    });
    return { activeToday, activeWeek, dormant, neverLoggedIn };
  }, [staff]);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'subject_teacher' | 'headteacher' | 'deputy' | 'dos' | 'registrar'>('subject_teacher');
  const [inviting, setInviting] = useState(false);

  const invite = async () => {
    if (!institutionId) {
      toast.error('No institution selected — refresh and try again.');
      return;
    }
    const email = inviteEmail.trim();
    if (!email) {
      toast.error('Enter an email address.');
      return;
    }
    setInviting(true);
    try {
      const { error } = await apiClient.post(
        `/institutions/${institutionId}/members/`,
        { emails: [email], role: inviteRole },
      );
      if (error) throw error;
      toast.success(`Invited ${email} as ${inviteRole.replace('_', ' ')}.`);
      setInviteEmail('');
    } catch (err) {
      console.error('Invite failed', err);
      toast.error('Could not send the invite. Check the email and try again.');
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Activity snapshot */}
      <Card className="lg:col-span-2 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-md flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" /> Staff activity
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Bucket label="Active today"   count={buckets.activeToday.length} accent="emerald" />
            <Bucket label="Active 7 days"  count={buckets.activeWeek.length}  accent="blue" />
            <Bucket label="Dormant 7+ days" count={buckets.dormant.length}    accent="amber" />
            <Bucket label="Never logged in" count={buckets.neverLoggedIn.length} accent="rose" />
          </div>
          {loading && <p className="text-xs text-slate-500">Loading staff…</p>}
          {!loading && buckets.dormant.length > 0 && (
            <details className="text-xs text-slate-600">
              <summary className="cursor-pointer font-semibold text-slate-700">
                Who's dormant? ({buckets.dormant.length})
              </summary>
              <ul className="mt-2 space-y-1">
                {buckets.dormant.map((m) => (
                  <li key={m.id} className="flex items-center justify-between">
                    <span>{m.user?.full_name || m.user?.email}</span>
                    <span className="text-[11px] text-slate-500">
                      last seen {m.user_last_login ? new Date(m.user_last_login).toLocaleDateString() : 'unknown'}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </CardContent>
      </Card>

      {/* Invite teacher */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-md flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-slate-500" /> Invite teacher
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-2">
          <label className="block text-xs font-semibold text-slate-600">Email</label>
          <input
            type="email"
            placeholder="teacher@school.ug"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-2 py-2 text-sm"
          />
          <label className="block text-xs font-semibold text-slate-600 mt-2">Role</label>
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as any)}
            className="w-full border border-slate-300 rounded-md px-2 py-2 text-sm"
            title="Choose role"
          >
            <option value="subject_teacher">Subject teacher</option>
            <option value="headteacher">Head teacher</option>
            <option value="deputy">Deputy</option>
            <option value="dos">DoS</option>
            <option value="registrar">Registrar</option>
          </select>
          <Button onClick={invite} disabled={inviting} className="w-full mt-2">
            <Mail className="w-4 h-4 mr-2" />
            {inviting ? 'Sending…' : 'Send invite'}
          </Button>
          <p className="text-[11px] text-slate-500 leading-snug">
            They'll receive a Maple account link by email and appear under Teaching staff once they accept.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const Bucket: React.FC<{ label: string; count: number; accent: 'emerald' | 'blue' | 'amber' | 'rose' }> = ({ label, count, accent }) => {
  const accentCls: Record<string, string> = {
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    blue:    'border-blue-200 bg-blue-50 text-blue-800',
    amber:   'border-amber-200 bg-amber-50 text-amber-800',
    rose:    'border-rose-200 bg-rose-50 text-rose-800',
  };
  return (
    <div className={`rounded-lg border p-3 min-h-[78px] flex flex-col justify-between ${accentCls[accent]}`}>
      <p className="text-[11px] uppercase tracking-wider font-bold leading-tight">{label}</p>
      <p className="text-2xl font-extrabold">{count}</p>
    </div>
  );
};
