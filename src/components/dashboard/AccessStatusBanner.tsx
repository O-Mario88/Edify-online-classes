import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';
import { CheckCircle2, Sparkles, Building2 } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';
import { useAuth } from '../../contexts/AuthContext';

interface AccessStatusBannerProps {
  /** What plan to advertise as the upgrade target if the user has none. */
  upsellPlan?: string;
}

/**
 * Tells the learner / parent — at a glance — what level of access their
 * account currently has. Pulls from /pilot-payments/premium-access/my-access/
 * (truth) and falls back to inferring from `user.role` when the API is
 * silent. Replaces the previous silent assumption that every account was
 * institutional.
 */
export const AccessStatusBanner: React.FC<AccessStatusBannerProps> = ({ upsellPlan = 'learner_plus' }) => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<string[]>([]);
  const [grants, setGrants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await apiClient.get<{ active_plans: string[]; grants: any[] }>(
        '/pilot-payments/premium-access/my-access/',
      );
      if (data) {
        setPlans(data.active_plans || []);
        setGrants(data.grants || []);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return null;

  const role = String((user as any)?.role || '').toLowerCase();
  const isInstitutional = role.includes('institution');

  let title = 'Free tier';
  let blurb = 'Unlock premium tracks, exam mocks, and parent reports with Learner Plus.';
  let icon = <Sparkles className="w-5 h-5 text-indigo-500" />;
  let cls = 'border-indigo-200 bg-indigo-50/40';
  let badge: { label: string; cls: string } = { label: 'Free', cls: 'bg-slate-100 text-slate-700 border-slate-200' };
  let cta: { label: string; to: string } | null = { label: 'See plans', to: '/pricing' };
  let expiry = '';

  if (plans.length > 0) {
    const plan = plans[0];
    title = plan.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    blurb = 'You have full access to premium content and reports.';
    icon = <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    cls = 'border-emerald-200 bg-emerald-50/50';
    badge = { label: 'Active', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    cta = null;
    const grant = grants[0];
    if (grant?.expires_at) {
      const days = Math.max(0, Math.round((new Date(grant.expires_at).getTime() - Date.now()) / 86_400_000));
      expiry = `Renews / expires in ${days} day${days === 1 ? '' : 's'}.`;
    }
  } else if (isInstitutional) {
    title = 'Institutional access';
    blurb = "Your school sponsors your access. For billing or plan questions, talk to your school's admin office.";
    icon = <Building2 className="w-5 h-5 text-blue-600" />;
    cls = 'border-blue-200 bg-blue-50/50';
    badge = { label: 'Through your school', cls: 'bg-blue-100 text-blue-700 border-blue-200' };
    cta = null;
  }

  return (
    <Card className={`${cls} shadow-sm`}>
      <CardContent className="py-4 px-5 flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="shrink-0">{icon}</div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-slate-900">{title}</p>
              <Badge variant="outline" className={badge.cls}>{badge.label}</Badge>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">{blurb}</p>
            {expiry && <p className="text-[11px] text-slate-500 mt-0.5">{expiry}</p>}
          </div>
        </div>
        {cta && (
          <Link to={cta.to} className="shrink-0">
            <Button size="sm" className="h-8 text-xs">{cta.label}</Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
};
