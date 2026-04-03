import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Activity, ShieldCheck, HeartPulse, TrendingUp } from 'lucide-react';

export interface HealthScoreMetrics {
  attendance: number;
  academicPerformance: number;
  teacherPunctuality: number;
  behavior: number;
  parentEngagement: number;
  financeHealth: number;
  interventionCompletion: number;
}

interface SchoolHealthScoreProps {
  metrics: HealthScoreMetrics;
}

export const SchoolHealthScore: React.FC<SchoolHealthScoreProps> = ({ metrics }) => {
  // Simple unweighted average for the overall score
  const overallScore = Math.round(Object.values(metrics).reduce((a, b) => a + b, 0) / 7);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 75) return 'text-indigo-600 bg-indigo-50 border-indigo-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const scoreTheme = getScoreColor(overallScore);

  const metricLabels: Record<keyof HealthScoreMetrics, string> = {
    attendance: 'Student Attendance',
    academicPerformance: 'Academic Avg',
    teacherPunctuality: 'Teacher Consistency',
    behavior: 'Behavior & Conduct',
    parentEngagement: 'Parent Activity',
    financeHealth: 'Fee Collection',
    interventionCompletion: 'Intervention Rate'
  };

  return (
    <Card className="shadow-sm border-slate-200 overflow-hidden relative">
       <div className={`absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-current opacity-5 pointer-events-none ${scoreTheme.split(' ')[0]}`}></div>
       <CardHeader className="pb-2 border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="text-lg flex items-center text-slate-800 gap-2">
            <HeartPulse className={`w-5 h-5 ${scoreTheme.split(' ')[0]}`} />
            Edify School Health Index
          </CardTitle>
       </CardHeader>
       <CardContent className="p-5 flex flex-col md:flex-row items-center gap-6">
          <div className={`shrink-0 w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center shadow-inner ${scoreTheme}`}>
             <span className="text-4xl font-black">{overallScore}</span>
             <span className="text-xs uppercase font-bold tracking-wider opacity-70">Out of 100</span>
          </div>

          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
             {Object.entries(metrics).map(([key, value]) => {
                const isWarning = value < 60;
                return (
                  <div key={key} className="flex flex-col">
                     <span className="text-[10px] uppercase font-bold text-slate-500 truncate" title={metricLabels[key as keyof HealthScoreMetrics]}>
                       {metricLabels[key as keyof HealthScoreMetrics]}
                     </span>
                     <div className="flex items-end gap-1.5 mt-1">
                        <span className={`text-lg font-bold ${isWarning ? 'text-red-600' : 'text-slate-800'}`}>{value}%</span>
                        {isWarning && <span className="w-1.5 h-1.5 rounded-full bg-red-500 mb-1.5 animate-pulse" title="Needs Attention"></span>}
                     </div>
                     <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                        <div className={`h-full rounded-full ${isWarning ? 'bg-red-500' : 'bg-indigo-400'}`} style={{ width: `${value}%` }}></div>
                     </div>
                  </div>
                );
             })}
          </div>
       </CardContent>
    </Card>
  );
};
