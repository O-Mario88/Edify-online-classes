import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Users, AlertTriangle, TrendingUp, TrendingDown, BookOpen, UserMinus } from 'lucide-react';

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
    <Card className={`relative overflow-hidden transition-all hover:shadow-md ${isAtRisk ? 'border-orange-200' : 'border-slate-200'}`}>
      {isAtRisk && (
        <div className="absolute top-0 left-0 w-full h-1 bg-orange-500"></div>
      )}
      <CardHeader className="pb-3 border-b border-slate-100 bg-white">
        <div className="flex justify-between items-start">
          <div>
            <Badge variant="outline" className="mb-2 bg-slate-50 text-slate-600 border-slate-200">
              {subject}
            </Badge>
            <CardTitle className="text-xl font-bold text-slate-800">{className}</CardTitle>
          </div>
          {improvementTrend === 'up' && <TrendingUp className="w-6 h-6 text-green-500" />}
          {improvementTrend === 'down' && <TrendingDown className="w-6 h-6 text-red-500" />}
        </div>
      </CardHeader>
      <CardContent className="pt-4 bg-slate-50/50">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" /> Attendance
            </div>
            <div className={`text-xl font-bold ${attendancePct < 85 ? 'text-orange-600' : 'text-slate-800'}`}>
              {attendancePct}%
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" /> Avg Score
            </div>
            <div className={`text-xl font-bold ${avgPerformance < 50 ? 'text-red-600' : 'text-slate-800'}`}>
              {avgPerformance}%
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-slate-400" /> Weak Topic
            </span>
            <span className="font-semibold text-slate-800 truncate max-w-[120px]" title={weakestTopic}>{weakestTopic}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600 flex items-center gap-2">
              <UserMinus className="w-4 h-4 text-slate-400" /> At-Risk Students
            </span>
            <Badge variant="secondary" className={redAlertStudents > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
              {redAlertStudents} learners
            </Badge>
          </div>
        </div>

        <Button 
          variant={isAtRisk ? 'default' : 'outline'} 
          className={`w-full ${isAtRisk ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
          onClick={() => onIntervene && onIntervene(id)}
        >
          {isAtRisk ? 'Launch Intervention' : 'View Class Overview'}
        </Button>
      </CardContent>
    </Card>
  );
};
