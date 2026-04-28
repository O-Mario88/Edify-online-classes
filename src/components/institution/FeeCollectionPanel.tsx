import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CreditCard, AlertTriangle, RefreshCw } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';

interface SummaryPayload {
  currency: string;
  total_assessed: string;
  total_collected: string;
  outstanding: string;
  students_with_balance: number;
  overdue_count: number;
  assessment_count: number;
}

interface AssessmentRow {
  id: number;
  student_name: string;
  student_email: string;
  term_label: string;
  item: string;
  amount: string;
  currency: string;
  status: string;
  total_paid: string;
  balance: string;
  due_date: string | null;
}

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  partial: 'bg-blue-50 text-blue-800 border-blue-200',
  paid: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  waived: 'bg-slate-50 text-slate-700 border-slate-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
};

const fmt = (s: string, currency = 'UGX') => {
  const n = Number(s);
  if (!Number.isFinite(n)) return s;
  return `${n.toLocaleString()} ${currency}`;
};

/**
 * Institution-admin fee collection table. Reads from /api/v1/fees/
 * which is scoped to the caller's administered institutions on the
 * backend, so we don't need to filter again here.
 */
export const FeeCollectionPanel: React.FC = () => {
  const [summary, setSummary] = useState<SummaryPayload | null>(null);
  const [rows, setRows] = useState<AssessmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [sumRes, rowsRes] = await Promise.all([
      apiClient.get<SummaryPayload>('/fees/assessments/summary/'),
      apiClient.get<any>('/fees/assessments/'),
    ]);
    if (sumRes.data) setSummary(sumRes.data);
    const list = Array.isArray(rowsRes.data) ? rowsRes.data : (rowsRes.data?.results || []);
    setRows(list);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const currency = summary?.currency || 'UGX';

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-md flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-slate-500" /> Fee Collection
          </CardTitle>
          <Button size="sm" variant="ghost" onClick={load} className="text-xs">
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-5">
        {/* Summary tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryTile label="Total assessed" value={summary ? fmt(summary.total_assessed, currency) : '—'} />
          <SummaryTile label="Collected" value={summary ? fmt(summary.total_collected, currency) : '—'} accent="emerald" />
          <SummaryTile
            label="Outstanding"
            value={summary ? fmt(summary.outstanding, currency) : '—'}
            accent={summary && Number(summary.outstanding) > 0 ? 'rose' : undefined}
          />
          <SummaryTile
            label="Students with balance"
            value={summary ? String(summary.students_with_balance) : '—'}
            sub={summary && summary.overdue_count > 0 ? `${summary.overdue_count} overdue` : undefined}
            accent={summary && summary.overdue_count > 0 ? 'amber' : undefined}
          />
        </div>

        {/* Table */}
        {loading && (
          <div className="py-6 text-center text-sm text-slate-500">Loading fee ledger…</div>
        )}
        {!loading && rows.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center">
            <p className="text-sm font-semibold text-slate-700 mb-1">No fee assessments yet.</p>
            <p className="text-xs text-slate-500">
              Add the first one through the Django admin (Fees → Fee Assessment) or contact schools@maple.edify to bulk-import a fee schedule.
            </p>
          </div>
        )}
        {rows.length > 0 && (
          <>
            {/* Mobile: stacked-card list. The table on phones forced admins to
                horizontal-scroll past Student / Term / Assessed / Paid before
                seeing the all-important Balance + Status columns. The
                stacked-card surfaces Balance and Status first instead. */}
            <div className="md:hidden space-y-3">
              {rows.map((r) => {
                const isOverdue =
                  (r.status === 'pending' || r.status === 'partial') &&
                  r.due_date &&
                  new Date(r.due_date) < new Date();
                return (
                  <div key={r.id} className="rounded-lg border border-slate-200 p-3 bg-white">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800 truncate">{r.student_name || r.student_email}</p>
                        <p className="text-[11px] text-slate-500 truncate">{r.term_label} · {r.item}</p>
                      </div>
                      <Badge variant="outline" className={`${STATUS_BADGE[r.status] || 'bg-slate-50 text-slate-700 border-slate-200'} shrink-0`}>
                        {r.status}
                      </Badge>
                    </div>
                    <div className={`text-2xl font-extrabold ${Number(r.balance) > 0 ? 'text-rose-700' : 'text-slate-500'}`}>
                      {fmt(r.balance, r.currency)}
                      <span className="text-[11px] font-medium text-slate-500 ml-1.5">balance</span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                      <div>
                        <span className="block text-slate-400 uppercase tracking-wider">Assessed</span>
                        <span className="font-medium">{fmt(r.amount, r.currency)}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 uppercase tracking-wider">Paid</span>
                        <span className="font-medium text-emerald-700">{fmt(r.total_paid, r.currency)}</span>
                      </div>
                    </div>
                    {r.due_date && (
                      <p className={`mt-2 text-[11px] ${isOverdue ? 'text-rose-700 font-semibold' : 'text-slate-500'} inline-flex items-center gap-1`}>
                        {isOverdue && <AlertTriangle className="w-3 h-3" />}
                        Due {new Date(r.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Tablet+: full table view with horizontal scroll fallback. */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-3 pl-4 font-semibold">Student</th>
                    <th className="py-3 font-semibold">Term · Item</th>
                    <th className="py-3 font-semibold text-right">Assessed</th>
                    <th className="py-3 font-semibold text-right">Paid</th>
                    <th className="py-3 font-semibold text-right">Balance</th>
                    <th className="py-3 font-semibold">Due</th>
                    <th className="py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((r) => {
                    const isOverdue =
                      (r.status === 'pending' || r.status === 'partial') &&
                      r.due_date &&
                      new Date(r.due_date) < new Date();
                    return (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="py-3 pl-4">
                          <p className="font-semibold text-slate-800">{r.student_name || r.student_email}</p>
                          {r.student_name && <p className="text-xs text-slate-500">{r.student_email}</p>}
                        </td>
                        <td className="py-3">
                          <p className="text-slate-700">{r.term_label}</p>
                          <p className="text-xs text-slate-500">{r.item}</p>
                        </td>
                        <td className="py-3 text-right font-medium">{fmt(r.amount, r.currency)}</td>
                        <td className="py-3 text-right text-emerald-700">{fmt(r.total_paid, r.currency)}</td>
                        <td className={`py-3 text-right font-bold ${Number(r.balance) > 0 ? 'text-rose-700' : 'text-slate-500'}`}>
                          {fmt(r.balance, r.currency)}
                        </td>
                        <td className="py-3 text-slate-600">
                          {r.due_date ? (
                            <span className={isOverdue ? 'text-rose-700 font-semibold inline-flex items-center gap-1' : ''}>
                              {isOverdue && <AlertTriangle className="w-3 h-3" />}
                              {new Date(r.due_date).toLocaleDateString()}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="py-3">
                          <Badge variant="outline" className={STATUS_BADGE[r.status] || 'bg-slate-50 text-slate-700 border-slate-200'}>
                            {r.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        <p className="text-[11px] text-slate-500">
          Records are entered by the school admin. Auto-imported payments via Pesapal / mobile-money will land here once the integration is enabled.
        </p>
      </CardContent>
    </Card>
  );
};

const SummaryTile: React.FC<{ label: string; value: string; sub?: string; accent?: 'emerald' | 'rose' | 'amber' }> = ({ label, value, sub, accent }) => {
  const accentCls =
    accent === 'emerald' ? 'text-emerald-700' :
    accent === 'rose' ? 'text-rose-700' :
    accent === 'amber' ? 'text-amber-700' :
    'text-slate-800';
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
      <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">{label}</p>
      <p className={`text-lg font-bold ${accentCls} mt-0.5 truncate`}>{value}</p>
      {sub && <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
};
