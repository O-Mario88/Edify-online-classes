import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Target, Users, Clock, Gift, Activity } from 'lucide-react';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';

export interface ActiveChallenge {
  id: string;
  title: string;
  description: string;
  type: 'attendance' | 'quiz' | 'reading' | 'behavior';
  scope: 'class' | 'institution' | 'house';
  targetValue: number;
  currentValue: number;
  unit: string;
  daysRemaining: number;
  rewardText: string;
  participantsCount: number;
}

interface ActiveChallengeCardProps {
  challenge: ActiveChallenge;
  isStudentView?: boolean;
}

export const ActiveChallengeCard: React.FC<ActiveChallengeCardProps> = ({ challenge, isStudentView = false }) => {
  const percentage = Math.min(100, (challenge.currentValue / challenge.targetValue) * 100);
  const isComplete = percentage >= 100;

  return (
    <Card className={`relative overflow-hidden shadow-sm border ${isComplete ? 'border-green-300' : 'border-indigo-200'}`}>
      <div className={`absolute top-0 right-0 p-4 opacity-5 pointer-events-none`}>
         <Target className="w-32 h-32" />
      </div>

      <CardHeader className={`pb-3 border-b ${isComplete ? 'bg-green-50/50 border-green-100' : 'bg-indigo-50/50 border-indigo-100'}`}>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                 {challenge.scope} Challenge
               </span>
               <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isComplete ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                 {isComplete ? 'Completed' : `${challenge.daysRemaining} Days Left`}
               </span>
            </div>
            <CardTitle className="text-lg text-slate-900 mt-1">{challenge.title}</CardTitle>
            <CardDescription className="text-slate-600">{challenge.description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-5">
        
        {/* Progress Section */}
        <div>
           <div className="flex justify-between text-sm font-medium mb-1.5">
              <span className="text-slate-700">Goal Progress</span>
              <span className={`${isComplete ? 'text-green-600 font-bold' : 'text-indigo-600'}`}>
                 {challenge.currentValue} / {challenge.targetValue} {challenge.unit}
              </span>
           </div>
           <Progress 
             value={percentage} 
             className={`h-2 ${isComplete ? '[&>div]:bg-green-500' : '[&>div]:bg-indigo-500'}`} 
           />
        </div>

        {/* Challenge Footer Stats */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
           <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
                 <Users className="w-3.5 h-3.5" /> Participants
              </div>
              <span className="font-semibold text-slate-800">{challenge.participantsCount.toLocaleString()}</span>
           </div>
           <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
                 <Gift className="w-3.5 h-3.5 text-yellow-600" /> Reward
              </div>
              <span className="font-semibold text-slate-800 truncate">{challenge.rewardText}</span>
           </div>
        </div>

        {isStudentView && !isComplete && (
           <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
             <Activity className="w-4 h-4 mr-2" /> Contribute Now
           </Button>
        )}
      </CardContent>
    </Card>
  );
};
