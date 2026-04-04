import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { DollarSign, Video, CheckCircle, Calendar, BarChart3, ArrowRight } from 'lucide-react';

interface PayoutStats {
  totalLessons: number;
  qualifiedLessons: number;
  pendingBalance: number;
  earnings: {
    thisMonth: number;
    thisQuarter: number;
    thisYear: number;
  };
}

export const TeacherPayoutStatusCard: React.FC = () => {
  // Mock data mimicking real platform calculations
  const stats: PayoutStats = {
    totalLessons: 42,
    qualifiedLessons: 38,
    pendingBalance: 450000,
    earnings: {
      thisMonth: 680000,
      thisQuarter: 1250000,
      thisYear: 4500000
    }
  };

  const formatCurrency = (amount: number) => {
    return `UGX ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] transition-all duration-300 border-none bg-white p-6 md:p-8">
      
      {/* Top Header - Identity/Summary Block */}
      <div className="flex flex-col mb-8 bg-gradient-to-br from-green-50 to-emerald-100/50 p-6 rounded-[2rem] border border-green-100 shadow-inner">
        <div className="flex justify-between items-center mb-3">
           <h3 className="text-emerald-900 font-extrabold text-lg tracking-tight uppercase">Available for Payout</h3>
           <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm border-none">
             <CheckCircle className="w-3.5 h-3.5 mr-1" /> Fast-track ready
           </Badge>
        </div>
        <div className="flex items-end gap-2">
           <span className="text-5xl md:text-6xl font-black text-emerald-950 tracking-tighter drop-shadow-sm">
             {formatCurrency(stats.pendingBalance)}
           </span>
        </div>
      </div>

      <CardContent className="p-0 flex-1 flex flex-col justify-between">
        {/* Middle Stats - floating pills mimicking the reference stat bar */}
        <div className="flex flex-wrap md:flex-nowrap gap-3 mb-8">
          <div className="flex-1 bg-slate-50 rounded-2xl p-4 flex flex-col items-center justify-center border border-slate-100">
             <span className="text-2xl font-black text-slate-800 tracking-tight">{stats.totalLessons}</span>
             <span className="text-xs text-slate-500 font-semibold mt-1">Live Lessons</span>
          </div>
          <div className="flex-1 bg-slate-50 rounded-2xl p-4 flex flex-col items-center justify-center border border-slate-100">
             <span className="text-2xl font-black text-slate-800 tracking-tight">{stats.qualifiedLessons}</span>
             <span className="text-xs text-slate-500 font-semibold mt-1">Qualified</span>
          </div>
          <div className="flex-1 bg-primary/5 rounded-2xl p-4 flex flex-col items-center justify-center border border-primary/10">
             <span className="text-xl font-bold text-primary tracking-tight">{formatCurrency(stats.earnings.thisMonth)}</span>
             <span className="text-xs text-primary/70 font-semibold mt-1">This Month</span>
          </div>
        </div>

        {/* Bottom Section - Detailed Tracker */}
        <div className="space-y-4 mb-8 flex-1">
           <div className="flex justify-between items-center bg-white border border-slate-100 p-4 rounded-[1.5rem] shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-slate-50 p-2.5 rounded-full"><Calendar className="w-4 h-4 text-slate-500"/></div>
                <span className="text-sm font-semibold text-slate-700">This Quarter</span>
              </div>
              <span className="font-bold text-slate-900">{formatCurrency(stats.earnings.thisQuarter)}</span>
           </div>
           <div className="flex justify-between items-center bg-white border border-slate-100 p-4 rounded-[1.5rem] shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-slate-50 p-2.5 rounded-full"><Calendar className="w-4 h-4 text-slate-500"/></div>
                <span className="text-sm font-semibold text-slate-700">Year to Date</span>
              </div>
              <span className="font-bold text-slate-900">{formatCurrency(stats.earnings.thisYear)}</span>
           </div>
        </div>
      </CardContent>

      <div className="mt-auto pt-2">
         <Button className="w-full text-base h-14 bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-bold tracking-wide">
            Request Payout
         </Button>
      </div>
    </Card>
  );
};
