import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Flame, CalendarDays, Zap, ShieldAlert } from 'lucide-react';
import { Progress } from '../ui/progress';

export interface StreakData {
  id: string;
  title: string;
  currentStreakCount: number;
  longestStreakCount: number;
  streakType: 'daily' | 'weekly';
  status: 'active' | 'at_risk' | 'broken';
  maintenanceActionText: string;
}

interface StreakTrackerProps {
  streaks: StreakData[];
}

export const StreakTracker: React.FC<StreakTrackerProps> = ({ streaks }) => {
  if (!streaks || streaks.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {streaks.map(streak => {
        const isAtRisk = streak.status === 'at_risk';
        const isBroken = streak.status === 'broken';
        const isActive = streak.status === 'active';

        return (
          <Card key={streak.id} className={`border ${isAtRisk ? 'border-orange-300 bg-orange-50/30' : isBroken ? 'border-gray-200' : 'border-indigo-100'} shadow-sm relative overflow-hidden group`}>
            {isActive && <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>}
            {isAtRisk && <div className="absolute top-0 left-0 w-1 h-full bg-red-500 animate-pulse"></div>}
            
            <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full flex items-center justify-center
                  ${isActive ? 'bg-orange-100 text-orange-500' : isAtRisk ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-400'}
                `}>
                  {isActive || isAtRisk ? <Flame className={`w-6 h-6 ${isAtRisk ? 'animate-bounce' : ''}`} /> : <CalendarDays className="w-6 h-6" />}
                </div>
                
                <div>
                  <h4 className="font-bold text-gray-900">{streak.title}</h4>
                  <div className="flex items-center gap-3 mt-1 text-sm">
                    <span className={`font-semibold ${isActive || isAtRisk ? 'text-orange-600' : 'text-gray-500'}`}>
                      {streak.currentStreakCount} {streak.streakType === 'daily' ? 'Days' : 'Weeks'}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-500 text-xs">Best: {streak.longestStreakCount}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 w-full md:w-auto md:max-w-xs md:ml-auto">
                {isAtRisk ? (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-md text-xs font-medium border border-red-100">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{streak.maintenanceActionText}</span>
                  </div>
                ) : isActive ? (
                  <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded-md text-xs font-medium border border-green-100">
                    <Zap className="w-4 h-4 shrink-0" />
                    <span>Streak secured for today! {streak.maintenanceActionText}</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5 w-full">
                     <div className="flex justify-between text-xs text-gray-500 font-medium">
                        <span>Recovery Progress</span>
                        <span>0%</span>
                     </div>
                     <Progress value={0} className="h-1.5" />
                     <p className="text-[10px] text-gray-400">Start today to rebuild your streak.</p>
                  </div>
                )}
              </div>

            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
