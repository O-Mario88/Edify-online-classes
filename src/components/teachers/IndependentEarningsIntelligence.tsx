import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { DollarSign, TrendingUp, Lightbulb, ShoppingCart } from 'lucide-react';
import { Badge } from '../ui/badge';

export const IndependentEarningsIntelligence: React.FC = () => {
  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
         <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Earnings Intelligence
            <Badge variant="outline" className="ml-auto bg-slate-100 text-slate-500 text-xs border-slate-200">
               Independent Teacher
            </Badge>
         </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border text-center border-emerald-100 rounded-lg p-3 shadow-sm bg-emerald-50">
             <div className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-1">Total Payouts</div>
             <div className="text-xl font-bold text-emerald-900">UGX 1.2M</div>
          </div>
          <div className="bg-white border text-center border-slate-100 rounded-lg p-3 shadow-sm">
             <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Market Rank</div>
             <div className="text-xl font-bold text-slate-800">Top 5%</div>
          </div>
        </div>

        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
           <h4 className="font-semibold text-emerald-900 flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Marketplace Opportunity
           </h4>
           <p className="text-sm text-emerald-800 mb-3">
             Your "Kinematics Summary" notes are trending. Students who buy them are 60% more likely to buy your quiz packs. Consider bundling them together to increase your average order value!
           </p>
           <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
              <ShoppingCart className="w-4 h-4 mr-2" /> Create Resource Bundle
           </Button>
        </div>

        <div className="pt-2">
           <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Demand Forecast</h4>
           <div className="flex items-center gap-3 bg-white border border-slate-100 p-3 rounded-lg shadow-sm">
              <TrendingUp className="w-8 h-8 text-indigo-500" />
              <div>
                 <p className="text-sm font-bold text-slate-800">Exam season approaching</p>
                 <p className="text-xs text-slate-500">Demand for S4 past-paper walkthrough videos is up 300% this week. Upload now to capture traffic.</p>
              </div>
           </div>
        </div>
      </CardContent>
    </Card>
  );
};
