import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, TrendingUp, DollarSign, CreditCard, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';

export const TeacherEarningsPage = () => {
  const [eligibility, setEligibility] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    fetchEligibility();
  }, []);

  const fetchEligibility = async () => {
    try {
      const { data } = await apiClient.get('/marketplace/payouts/eligibility/');
      setEligibility(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    setWithdrawing(true);
    try {
      const { data, error } = await apiClient.post('/marketplace/payouts/', {});
      if (error) throw new Error(error.message);
      toast.success('Withdrawal request initiated successfully. Check your Mobile Money soon!');
      fetchEligibility();
    } catch (err: any) {
      toast.error(err.message || 'Withdrawal failed. Ensure you have eligible earnings.');
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Earnings & Payouts</h1>
            <p className="text-gray-500">Track your monetization performance from the Teacher Storefront.</p>
          </div>
          <Button>
             <Download className="w-4 h-4 mr-2" /> Download Statement
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <Card className="bg-slate-900 border-none text-white">
             <CardContent className="pt-6">
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">Available Balance</p>
               <div className="text-4xl font-black mb-4">
                 {loading ? <Loader2 className="animate-spin w-8 h-8" /> : `UGX ${eligibility?.net_payable || '0'}`}
               </div>
               <Button 
                className="w-full bg-white text-slate-900 hover:bg-slate-100" 
                onClick={handleWithdraw} 
                disabled={loading || withdrawing || !eligibility?.eligible}
               >
                 {withdrawing ? 'Processing...' : 'Withdraw to Mobile Money'}
               </Button>
               {!loading && !eligibility?.eligible && (
                 <p className="text-xs text-red-400 mt-2 text-center">{eligibility?.reason}</p>
               )}
             </CardContent>
           </Card>
           
           <Card>
             <CardContent className="pt-6">
               <div className="flex justify-between items-start mb-2">
                 <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Monthly Revenue</p>
                 <TrendingUp className="w-4 h-4 text-emerald-500" />
               </div>
               <div className="text-3xl font-black text-gray-900 mb-1">UGX 450K</div>
               <p className="text-sm text-emerald-600 font-medium">+15% from last month</p>
             </CardContent>
           </Card>

           <Card>
             <CardContent className="pt-6">
               <div className="flex justify-between items-start mb-2">
                 <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Total Sales</p>
                 <DollarSign className="w-4 h-4 text-blue-500" />
               </div>
               <div className="text-3xl font-black text-gray-900 mb-1">342</div>
               <p className="text-sm text-gray-500 font-medium">Resources & Courses</p>
             </CardContent>
           </Card>
        </div>

        <Card>
           <CardHeader>
             <CardTitle>Recent Transactions</CardTitle>
             <CardDescription>Sales and platform payouts over the last 30 days.</CardDescription>
           </CardHeader>
           <CardContent>
             <div className="divide-y divide-gray-100">
                <div className="py-4 flex justify-between items-center">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                         <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                         <h4 className="font-bold text-gray-900">O'Level Physics Masterclass</h4>
                         <p className="text-xs text-gray-500">Course Subscription • Today, 10:45 AM</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <span className="font-bold text-emerald-600">+ UGX 15,000</span>
                      <Badge variant="outline" className="block w-max ml-auto mt-1 bg-gray-50">Completed</Badge>
                   </div>
                </div>

                <div className="py-4 flex justify-between items-center">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                         <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                         <h4 className="font-bold text-gray-900">Mobile Money Withdrawal</h4>
                         <p className="text-xs text-gray-500">Payout to 077***1234 • Yesterday, 2:30 PM</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <span className="font-bold text-gray-900">- UGX 500,000</span>
                      <Badge variant="outline" className="block w-max ml-auto mt-1 bg-gray-50">Processed</Badge>
                   </div>
                </div>

                <div className="py-4 flex justify-between items-center">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                         <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                         <h4 className="font-bold text-gray-900">S4 Chemistry Notes Bundle</h4>
                         <p className="text-xs text-gray-500">Resource Sale • Oct 12, 09:15 AM</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <span className="font-bold text-emerald-600">+ UGX 5,000</span>
                      <Badge variant="outline" className="block w-max ml-auto mt-1 bg-gray-50">Completed</Badge>
                   </div>
                </div>
             </div>
             
             <Button variant="outline" className="w-full mt-4">Load More Transactions</Button>
           </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default TeacherEarningsPage;
