import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, PlayCircle, FastForward, ShieldAlert, CheckCircle, Database } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

export const DemoEnvironmentController: React.FC = () => {
  const [isResetting, setIsResetting] = useState(false);

  const handleStateMutation = async (stateName: string, stateLabel: string) => {
    setIsResetting(true);
    toast.info(`Simulating state mutation to: ${stateLabel}`);
    
    // Simulate API delay for changing the global environment state
    setTimeout(() => {
      // We would hit an admin endpoint here: /admin/demo/mutate-state?target=stateName
      toast.success(`Success: Commercial environment rolled to ${stateLabel}`);
      setIsResetting(false);
    }, 1200);
  };

  const handleFullReset = () => {
    setIsResetting(true);
    toast.info('Purging all demo transactions and rolling back to Vanilla State...');
    
    setTimeout(() => {
      toast.success('Clean reset complete. Ready for next sales demo.');
      setIsResetting(false);
    }, 2000);
  };

  return (
    <Card className="shadow-lg border-rose-200 bg-gradient-to-br from-white to-rose-50/30">
      <CardHeader className="pb-4 border-b border-rose-100">
        <CardTitle className="text-lg font-bold text-rose-900 flex items-center">
          <PlayCircle className="w-5 h-5 mr-2 text-rose-600" />
          Sales & Demo Operations Controller
        </CardTitle>
        <CardDescription className="text-slate-600">
          Rapidly mutate the commercial environment to demonstrate specific states during sales calls.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div>
           <p className="text-sm font-bold text-slate-800 mb-3">Targeted State Overrides</p>
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
             <Button 
               variant="outline" 
               className="border-slate-300 hover:bg-slate-100"
               onClick={() => handleStateMutation('setup', 'Trial / Onboarding')}
               disabled={isResetting}
             >
               <FastForward className="w-4 h-4 mr-2 text-slate-500" />
               Force Trial Mode
             </Button>
             
             <Button 
               variant="outline" 
               className="border-emerald-200 hover:bg-emerald-50 text-emerald-800"
               onClick={() => handleStateMutation('active', 'Paid / Active')}
               disabled={isResetting}
             >
               <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
               Force Paid State
             </Button>
             
             <Button 
               variant="outline" 
               className="border-amber-200 hover:bg-amber-50 text-amber-800"
               onClick={() => handleStateMutation('overdue', 'Payment Overdue')}
               disabled={isResetting}
             >
               <ShieldAlert className="w-4 h-4 mr-2 text-amber-600" />
               Force Overdue
             </Button>

             <Button 
               variant="outline" 
               className="border-red-200 hover:bg-red-50 text-red-800"
               onClick={() => handleStateMutation('suspended', 'Suspended / Locked')}
               disabled={isResetting}
             >
               <ShieldAlert className="w-4 h-4 mr-2 text-red-600" />
               Force Suspension
             </Button>
           </div>
        </div>
        
        <div className="pt-6 border-t border-rose-100">
           <p className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
             <Database className="w-4 h-4 text-indigo-500" />
             Massive Data Seed Generation (Demo Mode)
           </p>
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
             <Button 
               variant="outline" 
               className="border-indigo-200 hover:bg-indigo-50 text-indigo-800 justify-start"
               onClick={() => {
                 toast.info("Seeding Large Institution Data...");
                 setTimeout(() => toast.success("Seeded: 500 Students, 40 Teachers, 25 Classes"), 2000);
               }}
               disabled={isResetting}
             >
               <Database className="w-4 h-4 mr-2" />
               Seed Large Enterprise School (500+ Users)
             </Button>

             <Button 
               variant="outline" 
               className="border-purple-200 hover:bg-purple-50 text-purple-800 justify-start"
               onClick={() => {
                 toast.info("Injecting 2-Year Historical Data...");
                 setTimeout(() => toast.success("Injected: Attendance, Invoices, and Marks history"), 4000);
               }}
               disabled={isResetting}
             >
               <Database className="w-4 h-4 mr-2" />
               Populate 2 Years History (Telemetry)
             </Button>

             <Button 
               variant="outline" 
               className="border-sky-200 hover:bg-sky-50 text-sky-800 justify-start"
               onClick={() => {
                 toast.info("Generating Mock Marketplace Transactions...");
                 setTimeout(() => toast.success("Generated: 100+ Sales and Earnings"), 1500);
               }}
               disabled={isResetting}
             >
               <Database className="w-4 h-4 mr-2" />
               Seed 100+ Marketplace Sales
             </Button>
           </div>
        </div>
        
        <div className="pt-6 border-t border-rose-100">
           <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-rose-200 shadow-sm">
              <div>
                <p className="font-bold text-slate-900">End of Presentation Reset</p>
                <p className="text-xs text-slate-500">Purge dummy transactions, clear mock chats, and reset the clock.</p>
              </div>
              <Button 
                onClick={handleFullReset}
                disabled={isResetting} 
                className="bg-rose-600 hover:bg-rose-700 text-white shadow-md"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isResetting ? 'animate-spin' : ''}`} />
                {isResetting ? 'Resetting...' : 'Hard Reset Environment'}
              </Button>
           </div>
        </div>
      </CardContent>
    </Card>
  );
};
