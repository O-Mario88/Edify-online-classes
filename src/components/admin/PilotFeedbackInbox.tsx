import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MessageSquareWarning, AlertTriangle, Lightbulb, HelpCircle } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';

type Severity = 'bug' | 'confusing' | 'idea' | 'other';

interface FeedbackItem {
  id: number;
  severity: Severity;
  message: string;
  page_url: string;
  user_email: string | null;
  user_role: string;
  created_at: string;
}

const SEVERITY_META: Record<Severity, { label: string; cls: string; icon: React.ReactNode }> = {
  bug:       { label: 'Bug',       cls: 'bg-red-50 text-red-700 border-red-200',         icon: <AlertTriangle className="w-3 h-3" /> },
  confusing: { label: 'Confusing', cls: 'bg-amber-50 text-amber-700 border-amber-200',   icon: <HelpCircle className="w-3 h-3" /> },
  idea:      { label: 'Idea',      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <Lightbulb className="w-3 h-3" /> },
  other:     { label: 'Other',     cls: 'bg-slate-50 text-slate-700 border-slate-200',   icon: <MessageSquareWarning className="w-3 h-3" /> },
};

export const PilotFeedbackInbox: React.FC = () => {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Severity | 'all'>('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const qs = filter === 'all' ? '' : `?severity=${filter}`;
      const { data } = await apiClient.get<{ count: number; items: FeedbackItem[] }>(
        `/feedback/inbox/${qs}`,
      );
      if (data) {
        setItems(data.items || []);
        setCount(data.count || 0);
      } else {
        setItems([]);
        setCount(0);
      }
      setLoading(false);
    };
    load();
  }, [filter]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-md flex items-center gap-2">
            <MessageSquareWarning className="w-4 h-4 text-slate-500" /> Pilot Feedback Inbox
            <Badge variant="outline" className="ml-2">{count}</Badge>
          </CardTitle>
          <div className="flex items-center gap-1.5 text-xs">
            {(['all', 'bug', 'confusing', 'idea', 'other'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={
                  filter === s
                    ? 'px-2.5 py-1 rounded-full bg-slate-900 text-white font-semibold'
                    : 'px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200'
                }
              >
                {s === 'all' ? 'All' : SEVERITY_META[s].label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        {loading && (
          <div className="py-6 text-center text-sm text-slate-500">Loading feedback…</div>
        )}
        {!loading && items.length === 0 && (
          <div className="py-6 text-center">
            <p className="text-sm font-semibold text-slate-700 mb-1">No feedback yet.</p>
            <p className="text-xs text-slate-500">Pilot users submit via the floating "Report an issue" button.</p>
          </div>
        )}
        {!loading && items.length > 0 && (
          <div className="divide-y divide-slate-100">
            {items.map((it) => {
              const meta = SEVERITY_META[it.severity] || SEVERITY_META.other;
              return (
                <div key={it.id} className="py-3 flex items-start gap-3">
                  <Badge className={`shrink-0 mt-0.5 ${meta.cls}`} variant="outline">
                    <span className="mr-1">{meta.icon}</span>{meta.label}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 leading-snug whitespace-pre-wrap break-words">{it.message}</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {it.user_email || 'anonymous'} · {it.user_role || 'unknown role'} · {new Date(it.created_at).toLocaleString()}
                      {it.page_url ? <> · <span className="font-mono">{it.page_url}</span></> : null}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
