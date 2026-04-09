import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Flag, Trophy } from 'lucide-react';
import { Progress } from '../ui/progress';

export interface HouseData {
  id: string;
  name: string;
  color: string; // Tailwind color class or hex
  points: number;
}

interface HouseStandingsCardProps {
  houses: HouseData[];
  userHouseId?: string;
  institutionName: string;
}

export const HouseStandingsCard: React.FC<HouseStandingsCardProps> = ({ houses, userHouseId, institutionName }) => {
  if (!houses || houses.length === 0) return null;

  // Sort by points descending
  const sortedHouses = [...houses].sort((a, b) => b.points - a.points);
  const maxPoints = sortedHouses[0].points;
  const isWinning = sortedHouses[0].id === userHouseId;

  return (
    <Card className="h-full shadow-[0_4px_24px_rgba(0,0,0,0.2)] border-[#1E293B] bg-white/5 backdrop-blur-md">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg text-white">
               <Flag className="w-5 h-5 text-[#3ABFF8]" />
               House Competition
            </CardTitle>
            <CardDescription className="mt-1 text-slate-400">{institutionName} Term 2 Cup</CardDescription>
          </div>
          {userHouseId && isWinning && (
            <div className="bg-amber-500/20 text-amber-400 w-10 h-10 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)] border border-amber-500/30">
               <Trophy className="w-5 h-5" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col justify-end min-h-[160px] gap-6 relative">
           {sortedHouses.map((house, index) => {
             const percentage = (house.points / maxPoints) * 100;
             const isUserHouse = house.id === userHouseId;
             
             return (
               <div key={house.id} className="relative w-full">
                 <div className="flex justify-between items-end mb-1">
                   <div className="flex items-center gap-2">
                     <span className={`font-bold text-sm ${isUserHouse ? 'text-[#3ABFF8]' : 'text-slate-300'}`}>
                       {index + 1}. {house.name}
                     </span>
                     {isUserHouse && <span className="text-[10px] bg-[#3ABFF8]/10 text-[#3ABFF8] px-1.5 py-0.5 rounded font-black uppercase border border-[#3ABFF8]/30">Your House</span>}
                   </div>
                   <span className="font-bold text-white text-sm">{house.points.toLocaleString()}</span>
                 </div>
                 <div className="w-full h-3 bg-[#0B1120] rounded-full overflow-hidden">
                   <div 
                     className="h-full transition-all duration-1000 ease-out rounded-full shadow-inner"
                     style={{ width: `${percentage}%`, backgroundColor: house.color }}
                   />
                 </div>
               </div>
             );
           })}
        </div>
      </CardContent>
    </Card>
  );
};
