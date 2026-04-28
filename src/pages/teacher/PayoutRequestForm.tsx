import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Wallet, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { apiGet, apiPost, API_BASE_URL } from '../../lib/apiClient';

interface Wallet {
  balance: number;
  currency?: string;
}

/**
 * Payout request form. Teachers see their wallet balance, request a
 * withdrawal, and the request lands in the admin payout-batch queue.
 * Disbursement happens via the existing fortnightly batch
 * (process_biweekly_payouts management command).
 *
 * Route: /dashboard/teacher/payouts/new
 */
export const PayoutRequestForm: React.FC = () => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ amount: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await apiGet<any>(`${API_BASE_URL}/api/v1/marketplace/wallet/me/`);
      if (cancelled) return;
      if (!r.error && r.data) {
        setWallet({ balance: parseFloat(r.data.balance ?? '0'), currency: r.data.currency || 'UGX' });
      } else {
        // Endpoint may not exist yet — let teachers request anyway with a manual amount.
        setWallet({ balance: 0, currency: 'UGX' });
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const balance = wallet?.balance ?? 0;
  const currency = wallet?.currency || 'UGX';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { setError('Enter a positive amount.'); return; }
    if (balance > 0 && amt > balance) { setError(`Amount exceeds wallet balance (${currency} ${balance}).`); return; }

    setSubmitting(true);
    const r = await apiPost<any>(`${API_BASE_URL}/api/v1/marketplace/payouts/`, {
      net_payable: amt.toFixed(2),
      status: 'requested',
    });
    setSubmitting(false);
    if (r.error) { setError(r.error.message); return; }
    setSuccess({ amount: amt.toFixed(2) });
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-xl">
        <Card><CardContent className="p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Payout requested</h1>
          <p className="mt-2 text-slate-600">{currency} {success.amount} is in the queue. The next biweekly batch run will disburse it to your registered mobile money number.</p>
          <div className="mt-7 flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={() => navigate('/dashboard/teacher/earnings')} className="rounded-full">See earnings</Button>
          </div>
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link to="/dashboard/teacher/earnings" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" /> Back to earnings
      </Link>
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Earnings</p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Request a payout</h1>
        <p className="mt-2 text-slate-600">Withdraw to your registered mobile money number. Disbursed in the next biweekly batch run.</p>
      </header>

      <Card className="mb-4 bg-slate-50 border-slate-200">
        <CardContent className="p-5 flex items-center gap-3">
          <Wallet className="w-5 h-5 text-slate-500" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Wallet balance</p>
            <p className="text-2xl font-extrabold text-slate-900">{loading ? '—' : `${currency} ${balance.toLocaleString()}`}</p>
          </div>
        </CardContent>
      </Card>

      <Card><CardContent className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Amount to withdraw *</Label>
            <Input type="number" min={0} step={0.01} className="mt-1.5" placeholder={`Up to ${balance.toLocaleString()}`} value={amount} onChange={(e) => setAmount(e.target.value)} />
            <p className="mt-1.5 text-xs text-slate-500">Currency: {currency}. Make sure your payout profile (mobile money number) is set up under Settings.</p>
          </div>
          {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-rose-600" /><p className="text-sm text-rose-700">{error}</p></div>}
          <Button type="submit" disabled={submitting} className="w-full rounded-full bg-slate-900 hover:bg-slate-800 text-white h-11 font-bold">
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Request payout
          </Button>
        </form>
      </CardContent></Card>
    </div>
  );
};

export default PayoutRequestForm;
