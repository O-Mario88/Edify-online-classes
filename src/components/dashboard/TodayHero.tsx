import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, AlertTriangle, Info, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { apiClient } from '../../lib/apiClient';

interface TodayPayload {
  kind: string;
  severity: 'warning' | 'info' | 'healthy' | string;
  title: string;
  message: string;
  action_label: string;
  action_link: string;
}

interface TodayHeroProps {
  /** Visual variant for dashboards with different background themes. */
  variant?: 'light' | 'glass';
}

const SEVERITY_META: Record<string, { ring: string; bg: string; icon: React.ReactNode; label: string }> = {
  warning:  { ring: 'ring-amber-300',   bg: 'bg-amber-50/80 border-amber-200',     icon: <AlertTriangle className="w-5 h-5 text-amber-700" />, label: 'Needs attention' },
  info:     { ring: 'ring-indigo-300',  bg: 'bg-indigo-50/80 border-indigo-200',   icon: <Info className="w-5 h-5 text-indigo-700" />,        label: 'Heads up' },
  healthy:  { ring: 'ring-emerald-300', bg: 'bg-emerald-50/80 border-emerald-200', icon: <CheckCircle2 className="w-5 h-5 text-emerald-700" />, label: "You're good" },
};

const GLASS_META: Record<string, { bg: string; iconColor: string; label: string }> = {
  warning:  { bg: 'bg-amber-500/10 border-amber-400/30',  iconColor: 'text-amber-300', label: 'Needs attention' },
  info:     { bg: 'bg-indigo-500/10 border-indigo-400/30', iconColor: 'text-indigo-300', label: 'Heads up' },
  healthy:  { bg: 'bg-emerald-500/10 border-emerald-400/30', iconColor: 'text-emerald-300', label: "You're good" },
};

/**
 * Single hero card shown first on every dashboard. Pulls from
 * /api/v1/dashboard/today/ which branches on role and returns the
 * one highest-priority action:
 *   - overdue assessments, marking backlog, pending admissions, upgrade
 *     requests → "warning" card with a big action button
 *   - upcoming live class, fresh feedback → "info" card
 *   - nothing urgent → "healthy" card with a keep-going message
 *
 * The action_link may be an internal route (navigated via react-router)
 * or an external URL (opened in a new tab — Google Meet links fall in
 * this bucket).
 */
export const TodayHero: React.FC<TodayHeroProps> = ({ variant = 'light' }) => {
  const navigate = useNavigate();
  const [payload, setPayload] = useState<TodayPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await apiClient.get<TodayPayload>('/dashboard/today/');
      setPayload(data || null);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className={`rounded-2xl border shadow-sm p-5 animate-pulse ${
        variant === 'glass' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
      }`}>
        <div className="h-5 w-48 bg-slate-200 dark:bg-white/10 rounded mb-3" />
        <div className="h-4 w-64 bg-slate-100 dark:bg-white/10 rounded" />
      </div>
    );
  }

  if (!payload) return null;

  const isExternal = /^https?:\/\//i.test(payload.action_link);
  const onAction = () => {
    if (isExternal) {
      window.open(payload.action_link, '_blank');
    } else {
      navigate(payload.action_link);
    }
  };

  if (variant === 'glass') {
    const meta = GLASS_META[payload.severity] || GLASS_META.info;
    return (
      <div className={`rounded-2xl border shadow-lg p-5 ${meta.bg} backdrop-blur-md`}>
        <div className="flex items-start gap-4">
          <div className={`shrink-0 w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center ${meta.iconColor}`}>
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-wider font-bold text-white/60 mb-0.5">
              Today · {meta.label}
            </p>
            <p className="text-lg font-bold text-white leading-snug">{payload.title}</p>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">{payload.message}</p>
          </div>
          <Button
            onClick={onAction}
            className="shrink-0 bg-white text-slate-900 hover:bg-slate-100 font-semibold"
          >
            {payload.action_label}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </div>
    );
  }

  const meta = SEVERITY_META[payload.severity] || SEVERITY_META.info;
  return (
    <div className={`rounded-2xl border shadow-sm p-5 ${meta.bg}`}>
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-sm">
          {meta.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-0.5">
            Today · {meta.label}
          </p>
          <p className="text-lg font-bold text-slate-900 leading-snug">{payload.title}</p>
          <p className="text-sm text-slate-700 mt-1 leading-relaxed">{payload.message}</p>
        </div>
        <Button onClick={onAction} className="shrink-0 font-semibold">
          {payload.action_label}
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>
    </div>
  );
};
