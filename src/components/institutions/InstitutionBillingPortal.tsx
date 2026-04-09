import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, CheckCircle2, TrendingUp, Calendar, Info, Loader2 } from 'lucide-react';

export function InstitutionBillingPortal({ activeStudents = 120, unpaidSeats = 120 }) {
  const [selectedPlan, setSelectedPlan] = useState('termly');
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = {
    monthly: { id: 'monthly', name: 'Monthly Flex Plan', price: 15000, desc: 'Billed monthly per active student. Great for trial periods.' },
    termly: { id: 'termly', name: 'Term Plan', price: 45000, desc: 'Billed per term per active student. The most popular choice.' },
    yearly: { id: 'yearly', name: 'Annual Best Value Plan', price: 120000, desc: 'Billed annually per active student. Maximum savings.' }
  };

  const handleActivation = () => {
    setIsProcessing(true);
    // Simulate API call to CheckoutInstitutionActivationView
    setTimeout(() => {
      setIsProcessing(false);
      window.location.href = 'https://mock-pesapal.edify.ug/pay'; // Redirect to mock pesapal
    }, 1500);
  };

  const currentPlan = plans[selectedPlan as keyof typeof plans];
  const totalDue = currentPlan.price * unpaidSeats;

  return (
    <div className="space-y-6 mb-8 mt-4">
      {/* Overview Alert */}
      <Card className="border-amber-300 bg-amber-50">
        <CardContent className="p-6 flex flex-col md:flex-row justify-between md:items-center gap-6">
           <div>
             <h2 className="text-xl font-black text-amber-900 flex items-center gap-2 mb-2">
               <ShieldAlert className="w-6 h-6" /> Free Setup Mode Active
             </h2>
             <p className="text-amber-800">
               Your institution workspace is fully active for testing and onboarding. However, <strong className="font-extrabold">{unpaidSeats} active student seats</strong> require payment to unlock complete Analytics and Timetable Studio operations.
             </p>
           </div>
           <div className="shrink-0 flex items-center gap-4 bg-white p-4 rounded-xl border border-amber-200 shadow-sm">
             <div className="text-center px-4 border-r border-slate-200">
                <span className="block text-2xl font-black text-slate-900">{activeStudents}</span>
                <span className="text-xs uppercase font-bold text-slate-500">Active Students</span>
             </div>
             <div className="text-center px-4">
                <span className="block text-2xl font-black text-amber-600">{unpaidSeats}</span>
                <span className="text-xs uppercase font-bold text-amber-700">Unpaid Seats</span>
             </div>
           </div>
        </CardContent>
      </Card>

      {/* Plan Selection Wrapper */}
      <div>
        <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
           <TrendingUp className="w-5 h-5 text-indigo-600" /> Select Institution Pricing Tier
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* Monthly */}
           <Card 
             className={`cursor-pointer transition-all duration-300 border-2 ${selectedPlan === 'monthly' ? 'border-indigo-600 shadow-md bg-indigo-50/20' : 'border-slate-200 hover:border-slate-300'}`}
             onClick={() => setSelectedPlan('monthly')}
           >
             <CardHeader>
               <CardTitle className="text-lg text-slate-900">Monthly Flex Plan</CardTitle>
               <CardDescription>Billed monthly per active student</CardDescription>
             </CardHeader>
             <CardContent>
               <div className="mb-4">
                 <span className="text-3xl font-black text-slate-900">UGX 15K</span>
                 <span className="text-slate-500">/mo</span>
               </div>
               <ul className="space-y-2 text-sm text-slate-600">
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Flexible commitment</li>
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Full Analytics Suite</li>
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Free Teacher Onboarding</li>
               </ul>
             </CardContent>
           </Card>

           {/* Termly */}
           <Card 
             className={`relative cursor-pointer transition-all duration-300 border-2 ${selectedPlan === 'termly' ? 'border-indigo-600 shadow-md bg-indigo-50/20' : 'border-slate-200 hover:border-slate-300'}`}
             onClick={() => setSelectedPlan('termly')}
           >
             <Badge className="absolute -top-3 right-4 bg-indigo-600 hover:bg-indigo-700">Most Popular</Badge>
             <CardHeader>
               <CardTitle className="text-lg text-slate-900">Term Plan</CardTitle>
               <CardDescription>Aligned with the academic calendar</CardDescription>
             </CardHeader>
             <CardContent>
               <div className="mb-4">
                 <span className="text-3xl font-black text-slate-900">UGX 45K</span>
                 <span className="text-slate-500">/term</span>
               </div>
               <ul className="space-y-2 text-sm text-slate-600">
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Covers entire 3-month term</li>
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Includes Master Timetable</li>
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Free Teacher Onboarding</li>
               </ul>
             </CardContent>
           </Card>

           {/* Yearly */}
           <Card 
             className={`cursor-pointer transition-all duration-300 border-2 ${selectedPlan === 'yearly' ? 'border-indigo-600 shadow-md bg-indigo-50/20' : 'border-slate-200 hover:border-slate-300'}`}
             onClick={() => setSelectedPlan('yearly')}
           >
             <CardHeader>
               <CardTitle className="text-lg text-slate-900">Annual Best Value</CardTitle>
               <CardDescription>Maximum savings for the whole year</CardDescription>
             </CardHeader>
             <CardContent>
               <div className="mb-4">
                 <span className="text-3xl font-black text-slate-900">UGX 120K</span>
                 <span className="text-slate-500">/yr</span>
               </div>
               <ul className="space-y-2 text-sm text-slate-600">
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Save approx. 12% annually</li>
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Dedicated Priority Support</li>
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> All Premium Integrations</li>
               </ul>
             </CardContent>
           </Card>
        </div>
      </div>

      {/* Checkout Strip */}
      <Card className="bg-slate-900 text-white shadow-xl border-none overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 opacity-10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
         <CardContent className="p-6 md:p-8 flex flex-col md:flex-row justify-between md:items-center gap-6 relative z-10">
            <div>
               <p className="text-indigo-300 font-bold uppercase tracking-wider text-sm mb-1">Activation Summary</p>
               <h3 className="text-2xl md:text-3xl font-black">{currentPlan.name}</h3>
               <p className="text-slate-400 mt-2 flex items-center gap-2">
                 <Info className="w-4 h-4" /> Billed for {unpaidSeats} unpaid active seats
               </p>
            </div>
            <div className="text-right flex flex-col md:items-end gap-4">
               <div>
                 <span className="text-slate-400 block text-xs uppercase font-bold tracking-wider mb-1">Total Due Now</span>
                 <span className="text-4xl font-black text-emerald-400 block">UGX {totalDue.toLocaleString()}</span>
               </div>
               <Button onClick={handleActivation} disabled={isProcessing} size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold w-full md:w-auto h-14 px-8 text-lg">
                 {isProcessing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Verifying...</> : 'Proceed to Secure Payment'}
               </Button>
            </div>
         </CardContent>
      </Card>
    </div>
  );
}
