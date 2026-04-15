import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';
import { GraduationCap, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import type { P7ReadinessState } from '../../types';

interface PLEReadinessGaugeProps {
  score: number;
  readinessState: P7ReadinessState;
  strongestSubject?: string;
  weakestSubject?: string;
  weakSubjectAlerts?: string[];
}

const stateLabels: Record<P7ReadinessState, { label: string; color: string; bgColor: string }> = {
  highly_ready: { label: 'Highly Ready', color: '#22c55e', bgColor: 'bg-green-100 text-green-800' },
  on_track: { label: 'On Track', color: '#3b82f6', bgColor: 'bg-blue-100 text-blue-800' },
  needs_support: { label: 'Needs Support', color: '#eab308', bgColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200' },
  high_risk: { label: 'High Risk', color: '#f97316', bgColor: 'bg-orange-100 text-orange-800' },
  critical_exam_risk: { label: 'Critical Risk', color: '#ef4444', bgColor: 'bg-red-100 text-red-800' },
};

export const PLEReadinessGauge: React.FC<PLEReadinessGaugeProps> = ({
  score,
  readinessState,
  strongestSubject,
  weakestSubject,
  weakSubjectAlerts = [],
}) => {
  const stateInfo = stateLabels[readinessState];
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];

  return (
    <Card className="h-full border-2 border-primary/10 shadow-md relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <GraduationCap size={120} />
      </div>
      <CardHeader className="pb-0">
        <CardTitle className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
          PLE Readiness Score
        </CardTitle>
        <CardDescription>Primary Leaving Examination preparedness</CardDescription>
      </CardHeader>
      <CardContent className="pt-4 relative z-10">
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                startAngle={180}
                endAngle={0}
                dataKey="value"
                stroke="none"
              >
                <Cell key="cell-0" fill={stateInfo.color} />
                <Cell key="cell-1" fill="rgba(255,255,255,0.12)" />
                <Label
                  value={`${Math.round(score)}%`}
                  position="centerBottom"
                  className="text-3xl font-bold fill-white"
                  dy={-20}
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="text-center mt-[-20px] space-y-3">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${stateInfo.bgColor}`}>
            {stateInfo.label}
          </span>

          {(strongestSubject || weakestSubject) && (
            <div className="flex justify-between text-sm px-2">
              {strongestSubject && (
                <div className="flex items-center gap-1 text-green-700">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Best: {strongestSubject}</span>
                </div>
              )}
              {weakestSubject && (
                <div className="flex items-center gap-1 text-red-800">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Weak: {weakestSubject}</span>
                </div>
              )}
            </div>
          )}

          {weakSubjectAlerts.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-left dark:bg-amber-900/30 dark:border-amber-700">
              <p className="text-xs font-medium text-amber-800 dark:text-amber-200 mb-1">Urgent Revision Needed:</p>
              <div className="flex flex-wrap gap-1">
                {weakSubjectAlerts.map((subj) => (
                  <span key={subj} className="text-xs bg-amber-200 text-amber-900 dark:bg-amber-800/50 dark:text-amber-100 px-2 py-0.5 rounded">
                    {subj}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-2">
            {score >= 80
              ? 'Excellent! This learner is well-prepared for PLE.'
              : score >= 65
              ? 'Good progress. Focused revision on weak subjects will help.'
              : score >= 45
              ? 'This learner needs additional support. Consider an intervention pack.'
              : 'Critical risk. Immediate revision support and parent follow-up needed.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
