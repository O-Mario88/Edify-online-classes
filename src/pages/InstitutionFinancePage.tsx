import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Banknote } from 'lucide-react';

const InstitutionFinancePage: React.FC = () => (
  <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
    <Card className="shadow-xl border-0 max-w-xl w-full">
      <CardHeader className="flex flex-col items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-50 dark:from-green-900 dark:to-emerald-950 rounded-t-xl">
        <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-900 flex items-center justify-center mb-2">
          <Banknote className="w-8 h-8 text-green-600 dark:text-green-300" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-green-900 dark:text-white">Institution Finance</CardTitle>
        <CardDescription className="text-base text-slate-600 dark:text-slate-300">Manage your institution’s finances, payments, and billing.</CardDescription>
      </CardHeader>
      <CardContent className="py-10 flex flex-col items-center">
        <p className="text-lg text-slate-700 dark:text-slate-200 mb-6 text-center">This page is under construction. All dashboard action links to <span className="font-semibold text-green-700 dark:text-green-300">/dashboard/institution/finance</span> now resolve here.</p>
        <Button variant="outline" className="rounded-full px-8 py-3 text-green-700 border-green-200 bg-green-50 dark:bg-green-900/20 shadow-md font-semibold text-base">Go to Billing</Button>
      </CardContent>
    </Card>
  </div>
);

export default InstitutionFinancePage;
