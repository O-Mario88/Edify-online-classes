import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { BarChart3 } from 'lucide-react';

const AnalyticsPage: React.FC = () => (
  <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
    <Card className="shadow-xl border-0 max-w-xl w-full">
      <CardHeader className="flex flex-col items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-50 dark:from-blue-900 dark:to-indigo-950 rounded-t-xl">
        <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900 flex items-center justify-center mb-2">
          <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-300" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-blue-900 dark:text-white">Analytics Dashboard</CardTitle>
        <CardDescription className="text-base text-slate-600 dark:text-slate-300">Visualize your learning and performance metrics in style.</CardDescription>
      </CardHeader>
      <CardContent className="py-10 flex flex-col items-center">
        <p className="text-lg text-slate-700 dark:text-slate-200 mb-6 text-center">This page is under construction. All dashboard action links to <span className="font-semibold text-blue-700 dark:text-blue-300">/dashboard/analytics</span> now resolve here.</p>
        <Button variant="outline" className="rounded-full px-8 py-3 text-blue-700 border-blue-200 bg-blue-50 dark:bg-blue-900/20 shadow-md font-semibold text-base">View Analytics</Button>
      </CardContent>
    </Card>
  </div>
);

export default AnalyticsPage;
