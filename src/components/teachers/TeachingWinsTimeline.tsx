import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Trophy, TrendingUp, DollarSign, Award, Users, CheckCircle, Zap } from 'lucide-react';

export interface TeachingWin {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  impactType: 'score_jump' | 'payout_qualified' | 'resource_popular' | 'badge_earned' | 'attendance_improved' | 'intervention_success';
}

interface TeachingWinsTimelineProps {
  wins: TeachingWin[];
}

export const TeachingWinsTimeline: React.FC<TeachingWinsTimelineProps> = ({ wins }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'score_jump': return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'payout_qualified': return <DollarSign className="w-4 h-4 text-amber-600" />;
      case 'resource_popular': return <Zap className="w-4 h-4 text-blue-600" />;
      case 'badge_earned': return <Award className="w-4 h-4 text-purple-600" />;
      case 'attendance_improved': return <Users className="w-4 h-4 text-cyan-600" />;
      case 'intervention_success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Trophy className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'score_jump': return 'bg-emerald-100 border-emerald-200';
      case 'payout_qualified': return 'bg-amber-100 border-amber-200';
      case 'resource_popular': return 'bg-blue-100 border-blue-200';
      case 'badge_earned': return 'bg-purple-100 border-purple-200';
      case 'attendance_improved': return 'bg-cyan-100 border-cyan-200';
      case 'intervention_success': return 'bg-green-100 border-green-200';
      default: return 'bg-indigo-100 border-indigo-200';
    }
  };

  return (
    <Card className="shadow-sm border-slate-200 h-full">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b border-indigo-50 pb-3">
        <CardTitle className="text-lg font-bold text-indigo-900 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-indigo-600" />
          Recent Wins & Impact
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {wins.length === 0 ? (
          <p className="text-sm text-slate-500 italic text-center mt-4">No recent wins logged. Keep up the great teaching!</p>
        ) : (
          <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 mt-2 mb-2">
            {wins.map((win, idx) => (
              <div key={win.id} className="relative pl-6">
                <div className={`absolute -left-[13px] top-1 w-6 h-6 rounded-full border flex items-center justify-center shadow-sm ${getBgColor(win.impactType)}`}>
                  {getIcon(win.impactType)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">{win.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{win.description}</p>
                  <p className="text-[10px] text-slate-400 font-medium tracking-wide mt-1.5 uppercase">{win.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
