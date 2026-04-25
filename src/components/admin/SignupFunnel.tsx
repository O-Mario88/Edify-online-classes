import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Users, TrendingDown } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';

interface FunnelStep {
  id: string;
  label: string;
  count: number;
  share_of_prev: number;
  share_of_start: number;
}

interface FunnelPayload {
  window_days: number;
  generated_at: string;
  steps: FunnelStep[];
}

/**
 * Signup funnel — answers "are new users completing onboarding?"
 * The widest bar is Registered; each subsequent stage's bar width is
 * its share_of_start (a percentage of the registered count). Drop-off
 * chips flag any stage losing >25% vs the previous step so bad
 * transitions are impossible to miss.
 */
export const SignupFunnel: React.FC = () => {
  const [data, setData] = useState<FunnelPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: payload } = await apiClient.get<FunnelPayload>(
        '/analytics/signup-funnel/',
      );
      setData(payload || null);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-md flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" /> Signup funnel
            {data && (
              <span className="text-xs text-slate-500 font-normal">
                · last {data.window_days} days
              </span>
            )}
          </CardTitle>
          {data && (
            <span className="text-[11px] text-slate-500">
              Updated {new Date(data.generated_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {loading && <p className="py-4 text-center text-sm text-slate-500">Loading funnel…</p>}
        {!loading && data && data.steps.length > 0 && data.steps[0].count === 0 && (
          <div className="py-6 text-center">
            <p className="text-sm font-semibold text-slate-700 mb-1">No new signups in the last {data.window_days} days.</p>
            <p className="text-xs text-slate-500">Once pilot users sign up, the funnel fills out automatically.</p>
          </div>
        )}
        {!loading && data && data.steps[0]?.count > 0 && (
          <div className="space-y-2">
            {data.steps.map((step, i) => {
              const width = Math.max(4, Math.min(100, step.share_of_start));
              const bigDrop = i > 0 && step.share_of_prev < 75;
              return (
                <div key={step.id}>
                  {/* Mobile: stack label above the count + chips so long
                      labels ("First graded work") don't get truncated and
                      the drop-off chip never collides with the percentage. */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1 gap-1 text-sm">
                    <span className="font-semibold text-slate-800">{step.label}</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900">{step.count.toLocaleString()}</span>
                      <span className="text-xs text-slate-500">({step.share_of_start}% of signups)</span>
                      {bigDrop && (
                        <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 text-[10px]">
                          <TrendingDown className="w-3 h-3 mr-0.5" />
                          {100 - step.share_of_prev}% drop
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${bigDrop ? 'bg-rose-400' : 'bg-indigo-500'}`}
                      style={{ width: `${width}%` }}
                    />
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
