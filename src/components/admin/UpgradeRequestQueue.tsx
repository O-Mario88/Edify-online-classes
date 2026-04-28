import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { CreditCard, CheckCircle2, X } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';
import { toast } from 'sonner';

interface UpgradeRequest {
  id: number | string;
  plan: string;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  amount?: number | string;
  payment_reference?: string;
  requester_email?: string;
  requester_name?: string;
  created_at: string;
}

export const UpgradeRequestQueue: React.FC = () => {
  const [items, setItems] = useState<UpgradeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await apiClient.get<UpgradeRequest[]>(
      '/pilot-payments/upgrade-requests/admin-inbox/',
    );
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const review = async (id: string, decision: 'approved' | 'rejected') => {
    setActingOn(id);
    try {
      const { error } = await apiClient.post(
        `/pilot-payments/upgrade-requests/${id}/review/`,
        { decision, grant_months: 3 },
      );
      if (error) throw error;
      toast.success(decision === 'approved' ? 'Upgrade approved — 3 months granted.' : 'Request rejected.');
      setItems((prev) => prev.filter((r) => String(r.id) !== id));
    } catch (err) {
      console.error('Review failed', err);
      toast.error('Could not save the decision. Please try again.');
    } finally {
      setActingOn(null);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 border-b border-gray-100">
        <CardTitle className="text-md flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-slate-500" />
          Upgrade Requests Queue
          <Badge variant="outline" className="ml-2">{items.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        {loading && <div className="py-6 text-center text-sm text-slate-500">Loading…</div>}
        {!loading && items.length === 0 && (
          <div className="py-6 text-center">
            <p className="text-sm font-semibold text-slate-700 mb-1">No pending upgrade requests.</p>
            <p className="text-xs text-slate-500">When a learner clicks an upgrade CTA, the request lands here for review.</p>
          </div>
        )}
        {!loading && items.length > 0 && (
          <div className="divide-y divide-slate-100">
            {items.map((r) => {
              const id = String(r.id);
              const isActing = actingOn === id;
              return (
                <div key={id} className="py-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200" variant="outline">
                        {r.plan || 'plan'}
                      </Badge>
                      {r.amount != null && (
                        <span className="text-xs font-medium text-slate-700">{r.amount}</span>
                      )}
                      {r.payment_reference && (
                        <span className="text-[11px] text-slate-500 font-mono">ref: {r.payment_reference}</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-800 leading-snug">
                      {r.requester_name || r.requester_email || 'unknown user'}
                      {r.requester_email && r.requester_name ? ` · ${r.requester_email}` : null}
                    </p>
                    {r.message && (
                      <p className="text-xs text-slate-600 mt-1 italic">"{r.message}"</p>
                    )}
                    <p className="text-[11px] text-slate-500 mt-1">
                      requested {new Date(r.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      disabled={isActing}
                      onClick={() => review(id, 'approved')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white h-8 text-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isActing}
                      onClick={() => review(id, 'rejected')}
                      className="text-slate-600 h-8 text-xs"
                    >
                      <X className="w-3.5 h-3.5 mr-1" />
                      Reject
                    </Button>
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
