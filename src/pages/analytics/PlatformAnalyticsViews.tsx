import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, GraduationCap, Store, Activity, AlertTriangle, ShieldCheck, Database, Calendar } from 'lucide-react';

export const LearningAnalytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Avg Topic Completion</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">64.2%</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="border-slate-100 shadow-sm opacity-60">
        <CardHeader>
          <CardTitle className="text-lg">Learning Engagement Heatmap</CardTitle>
          <CardDescription>Visualizing student login frequency and resource consumption.</CardDescription>
        </CardHeader>
        <CardContent className="py-20 text-center">
          <p className="text-sm font-medium text-slate-400">Detailed metric widgets will populate as the academic term progresses.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export const ExamsAnalytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">UNEB Readiness Index</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">78/100</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="border-orange-200 shadow-sm border-dashed bg-orange-50/10">
        <CardContent className="p-10 text-center">
          <div className="mx-auto w-16 h-16 bg-white shadow-sm flex items-center justify-center rounded-full mb-4">
            <Calendar className="w-8 h-8 text-orange-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No Active National Exams</h3>
          <p className="text-sm text-slate-500">Wait until the start of the Examination cycle to view passing thresholds and readiness forecasts.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export const MarketplaceAnalytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 flex flex-col gap-3">
             <div className="flex justify-between items-start">
               <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                 <Store className="w-6 h-6" />
               </div>
               <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full">+14% m/m</span>
             </div>
             <div>
               <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Marketplace Gross Revenue</p>
               <h3 className="text-3xl font-bold text-slate-900 mt-1">UGX 4.2M</h3>
             </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col gap-3">
             <div className="flex justify-between items-start">
               <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center">
                 <Store className="w-6 h-6" />
               </div>
             </div>
             <div>
               <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Published Items</p>
               <h3 className="text-3xl font-bold text-slate-900 mt-1">142</h3>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const SystemHealthAnalytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-6">
             <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-slate-800">Security Core</h3>
             </div>
             <p className="text-sm text-slate-500">Healthy. Last threat audit: 2 hours ago.</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-6">
             <div className="flex items-center gap-3 mb-2">
                <Database className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-slate-800">Database Uptime</h3>
             </div>
             <p className="text-sm text-slate-500">99.999% uptime rolling 30-day window.</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500 bg-amber-50/10">
          <CardContent className="p-6">
             <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-800">Media Sync Server</h3>
             </div>
             <p className="text-sm text-amber-700">High latency detected (&gt;300ms).</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
