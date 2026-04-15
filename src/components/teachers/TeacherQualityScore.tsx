import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Target, Clock, Users, BookOpen, AlertCircle } from 'lucide-react';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';

export interface TeacherQualityMetrics {
  overallScore: number;
  deliveryConsistency: number;
  studentEngagement: number;
  markingTurnaroundDays: number;
  studentImprovement: number;
  punctuality: number;
  nextImprovementGoal: string;
}

export const TeacherQualityScore: React.FC<{ metrics: TeacherQualityMetrics }> = ({ metrics }) => {
  return (
    <Card className="border-indigo-100 shadow-sm">
       <CardHeader className="bg-indigo-50/50 pb-3 border-b border-indigo-100">
          <div className="flex justify-between items-start">
             <div>
               <CardTitle className="flex items-center gap-2 text-indigo-900 border-l-4 border-indigo-500 pl-2">
                  <Target className="w-5 h-5 text-indigo-800" />
                  Educator Impact Score
               </CardTitle>
               <CardDescription className="pl-3 mt-1">Private AI coaching metrics</CardDescription>
             </div>
             <div className="bg-white p-2 rounded-lg border border-indigo-100 shadow-sm text-center min-w-[3.5rem]">
               <span className="text-sm text-indigo-400 font-bold uppercase block">Score</span>
               <span className="text-2xl font-black text-indigo-700">{metrics.overallScore}</span>
             </div>
          </div>
       </CardHeader>
       <CardContent className="p-4 space-y-5">
          <div className="grid grid-cols-2 gap-4">
             <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                   <span>Consistency</span>
                   <span>{metrics.deliveryConsistency}%</span>
                </div>
                <Progress value={metrics.deliveryConsistency} className="h-1.5 [&>div]:bg-blue-500" />
             </div>
             <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                   <span>Engagement</span>
                   <span>{metrics.studentEngagement}%</span>
                </div>
                <Progress value={metrics.studentEngagement} className="h-1.5 [&>div]:bg-purple-500" />
             </div>
             <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                   <span>Growth</span>
                   <span>{metrics.studentImprovement}%</span>
                </div>
                <Progress value={metrics.studentImprovement} className="h-1.5 [&>div]:bg-green-500" />
             </div>
             <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                   <span>Turaround</span>
                   <span className={metrics.markingTurnaroundDays > 5 ? 'text-red-700' : ''}>{metrics.markingTurnaroundDays} days</span>
                </div>
                <Progress value={Math.max(0, 100 - (metrics.markingTurnaroundDays * 10))} className={`h-1.5 ${metrics.markingTurnaroundDays > 5 ? '[&>div]:bg-red-500' : '[&>div]:bg-orange-400'}`} />
             </div>
          </div>

          <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 flex items-start gap-3">
             <AlertCircle className="w-5 h-5 text-indigo-800 shrink-0 mt-0.5" />
             <div>
                <p className="text-xs font-bold uppercase text-indigo-700 tracking-wider mb-0.5">Focus Goal</p>
                <p className="text-sm font-medium text-slate-800">{metrics.nextImprovementGoal}</p>
             </div>
          </div>
       </CardContent>
    </Card>
  );
};
