import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ShieldCheck } from 'lucide-react';

const InterventionsPage: React.FC = () => (
  <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
    <Card className="shadow-xl border-0 max-w-xl w-full">
      <CardHeader className="flex flex-col items-center gap-2 bg-gradient-to-r from-emerald-100 to-blue-50 dark:from-emerald-900 dark:to-blue-950 rounded-t-xl">
        <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900 flex items-center justify-center mb-2">
          <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-300" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-emerald-900 dark:text-white">Interventions</CardTitle>
        <CardDescription className="text-base text-slate-600 dark:text-slate-300">Monitor and manage support actions for learners and staff.</CardDescription>
      </CardHeader>
      <CardContent className="py-10 flex flex-col items-center">
        <p className="text-lg text-slate-700 dark:text-slate-200 mb-6 text-center">This page is under construction. All dashboard action links to <span className="font-semibold text-emerald-700 dark:text-emerald-300">/dashboard/interventions</span> now resolve here.</p>
        <Button variant="outline" className="rounded-full px-8 py-3 text-emerald-700 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 shadow-md font-semibold text-base">View Interventions</Button>
      </CardContent>
    </Card>
  </div>
);

export default InterventionsPage;
