import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Activity, ShieldCheck, HeartPulse, TrendingUp } from 'lucide-react';

export interface HealthScoreMetrics {
  attendance: number;
  academicPerformance: number;
  teacherPunctuality: number;
  behavior: number;
  parentEngagement: number;
  interventionCompletion: number;
}

interface SchoolHealthScoreProps {
  metrics: HealthScoreMetrics;
}

export const SchoolHealthScore: React.FC<SchoolHealthScoreProps> = ({ metrics }) => {
  // Simple unweighted average for the overall score
  const vals = Object.values(metrics);
  const overallScore = Math.round(vals.reduce((a, b) => a + b, 0) / (vals.length || 1));

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-[#36D399] bg-[#36D399]/10 border-[#36D399]/20';
    if (score >= 75) return 'text-[#3ABFF8] bg-[#3ABFF8]/10 border-[#3ABFF8]/20';
    if (score >= 60) return 'text-[#FBBD23] bg-[#FBBD23]/10 border-[#FBBD23]/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  const scoreTheme = getScoreColor(overallScore);

  const metricLabels: Record<keyof HealthScoreMetrics, string> = {
    attendance: 'Student Attendance',
    academicPerformance: 'Academic Avg',
    teacherPunctuality: 'Teacher Consistency',
    behavior: 'Behavior & Conduct',
    parentEngagement: 'Parent Activity',
    interventionCompletion: 'Intervention Rate'
  };

  return (
    <Card className="shadow-lg border-[#1E293B] bg-white/5 backdrop-blur-md overflow-hidden relative">
       <div className={`absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-current opacity-[0.03] pointer-events-none ${scoreTheme.split(' ')[0]}`}></div>
       <CardHeader className="pb-2 border-b border-[#1E293B] bg-transparent">
          <CardTitle className="text-lg flex items-center text-white gap-2">
            <HeartPulse className={`w-5 h-5 ${scoreTheme.split(' ')[0]}`} />
            Edify School Health Index
          </CardTitle>
       </CardHeader>
       <CardContent className="p-5 flex flex-col md:flex-row items-center gap-6">
          <div className={`shrink-0 w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center shadow-inner ${scoreTheme}`}>
             <span className="text-4xl font-bold">{overallScore}</span>
             <span className="text-xs uppercase font-bold tracking-wider opacity-60">Out of 100</span>
          </div>

          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full">
             {Object.entries(metrics).map(([key, value]) => {
                const isWarning = value < 60;
                return (
                  <div key={key} className="flex flex-col">
                     <span className="text-[11px] uppercase font-bold text-slate-400 truncate" title={metricLabels[key as keyof HealthScoreMetrics]}>
                       {metricLabels[key as keyof HealthScoreMetrics]}
                     </span>
                     <div className="flex items-end gap-1.5 mt-1">
                        <span className={`text-[15px] font-bold ${isWarning ? 'text-rose-400' : 'text-white'}`}>{value}%</span>
                        {isWarning && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mb-1.5 animate-pulse" title="Needs Attention"></span>}
                     </div>
                     <div className="w-full h-1.5 bg-[#0B1120] rounded-full mt-1.5 overflow-hidden">
                        <div className={`h-full rounded-full ${isWarning ? 'bg-rose-500' : 'bg-[#3ABFF8]'}`} style={{ width: `${value}%` }}></div>
                     </div>
                  </div>
                );
             })}
          </div>
       </CardContent>
    </Card>
  );
};
