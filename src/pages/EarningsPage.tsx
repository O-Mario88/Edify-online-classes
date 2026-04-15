import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { DollarSign } from 'lucide-react';

const EarningsPage: React.FC = () => (
  <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
    <Card className="shadow-xl border-0 max-w-xl w-full">
      <CardHeader className="flex flex-col items-center gap-2 bg-gradient-to-r from-yellow-100 to-amber-50 dark:from-yellow-900 dark:to-amber-950 rounded-t-xl">
        <div className="w-16 h-16 rounded-full bg-yellow-50 dark:bg-yellow-900 flex items-center justify-center mb-2">
          <DollarSign className="w-8 h-8 text-yellow-600 dark:text-yellow-300" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-yellow-900 dark:text-white">Earnings</CardTitle>
        <CardDescription className="text-base text-slate-600 dark:text-slate-300">Track your payouts, revenue, and financial performance.</CardDescription>
      </CardHeader>
      <CardContent className="py-10 flex flex-col items-center">
        <p className="text-lg text-slate-700 dark:text-slate-200 mb-6 text-center">This page is under construction. All dashboard action links to <span className="font-semibold text-yellow-700 dark:text-yellow-300">/dashboard/earnings</span> now resolve here.</p>
        <Button variant="outline" className="rounded-full px-8 py-3 text-yellow-700 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 shadow-md font-semibold text-base">View Earnings</Button>
      </CardContent>
    </Card>
  </div>
);

export default EarningsPage;
