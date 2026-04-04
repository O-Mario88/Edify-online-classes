import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Users, AlertTriangle, TrendingUp, TrendingDown, BookOpen, UserMinus, Minus } from 'lucide-react';

export interface ClassHealthProps {
  id: string;
  className: string;
  subject: string;
  attendancePct: number;
  avgPerformance: number;
  redAlertStudents: number;
  weakestTopic: string;
  improvementTrend: 'up' | 'down' | 'flat';
  onIntervene?: (classId: string) => void;
}

const formatStudentCount = (count: number): string => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

export const ClassHealthCard: React.FC<ClassHealthProps> = ({
  id,
  className,
  subject,
  attendancePct,
  avgPerformance,
  redAlertStudents,
  weakestTopic,
  improvementTrend,
  onIntervene
}) => {
  const isAtRisk = attendancePct < 80 || avgPerformance < 50 || redAlertStudents > 3;

  return (
    <Card className={`relative overflow-hidden transition-all hover:shadow-md flex flex-col h-full ${isAtRisk ? 'border-orange-200' : 'border-slate-200'}`}>
      {isAtRisk && (
        <div className="absolute top-0 left-0 w-full h-1 bg-orange-500"></div>
      )}
      
      {/* 1. Header Section */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <Badge variant="outline" className="mb-1.5 bg-slate-50 text-slate-600 border-slate-200 text-[10px]">
              {subject}
            </Badge>
            <CardTitle className="text-base font-bold text-slate-800 line-clamp-2 leading-tight" title={className}>
              {className}
            </CardTitle>
          </div>
          <div className="shrink-0 mt-1">
            {improvementTrend === 'up' && <TrendingUp className="w-5 h-5 text-green-500" />}
            {improvementTrend === 'down' && <TrendingDown className="w-5 h-5 text-red-500" />}
            {improvementTrend === 'flat' && <Minus className="w-5 h-5 text-slate-400" />}
          </div>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="p-4 bg-slate-50/50 flex-1">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white px-3 py-2.5 rounded-lg border border-slate-100 shadow-sm">
            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium mb-1 uppercase tracking-wider">
              <Users className="w-3 h-3 shrink-0" /> Attendance
            </div>
            <div className={`text-xl font-bold ${attendancePct < 85 ? 'text-orange-600' : 'text-slate-800'}`}>
              {attendancePct}%
            </div>
          </div>
          <div className="bg-white px-3 py-2.5 rounded-lg border border-slate-100 shadow-sm">
            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium mb-1 uppercase tracking-wider">
              <BookOpen className="w-3 h-3 shrink-0" /> Avg Score
            </div>
            <div className={`text-xl font-bold ${avgPerformance < 50 ? 'text-red-600' : 'text-slate-800'}`}>
              {avgPerformance}%
            </div>
          </div>
        </div>

        {/* Risk Indicators */}
        <div className="space-y-2.5">
          <div className="flex items-start gap-2 text-sm">
            <span className="text-slate-500 flex items-center gap-1 shrink-0 mt-0.5">
              <AlertTriangle className="w-3.5 h-3.5" />
            </span>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Weak Topic</span>
              <span className="font-semibold text-slate-800 text-sm leading-tight line-clamp-2" title={weakestTopic}>
                {weakestTopic}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 flex items-center gap-1.5 shrink-0">
              <UserMinus className="w-3.5 h-3.5" /> At-Risk
            </span>
            <Badge variant="secondary" className={`shrink-0 ${redAlertStudents > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {formatStudentCount(redAlertStudents)} learners
            </Badge>
          </div>
        </div>
      </div>

      {/* 3. Action Section */}
      <div className="p-4 flex-none border-t border-slate-100 bg-white">
        <Button 
          variant={isAtRisk ? 'default' : 'outline'} 
          className={`w-full min-h-[40px] whitespace-nowrap text-sm ${isAtRisk ? 'bg-orange-600 hover:bg-orange-700 text-white border-transparent' : ''}`}
          onClick={() => onIntervene && onIntervene(id)}
        >
          {isAtRisk ? 'Launch Intervention' : 'View Overview'}
        </Button>
      </div>
    </Card>
  );
};
