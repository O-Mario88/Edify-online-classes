import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Trophy, TrendingUp, HeartHandshake, Zap, Award } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';

export interface LeaderboardEntry {
  id: string;
  rank: number;
  studentId: string;
  name: string;
  score: number;
  avatarUrl?: string;
  isCurrentUser?: boolean;
}

interface LeaderboardData {
  title: string;
  type: 'academic' | 'improvers' | 'peer_support' | 'consistency';
  description: string;
  entries: LeaderboardEntry[];
  currentUserRank?: number;
}

interface LeaderboardsProps {
  boards: LeaderboardData[];
  currentStudentId: string;
}

export const Leaderboards: React.FC<LeaderboardsProps> = ({ boards, currentStudentId }) => {
  const [activeTab, setActiveTab] = useState(boards[0]?.type || 'academic');

  // Anti-shame rendering algorithm:
  // Show Top 3.
  // Then show a break if the current user/neighbors aren't continuous.
  // Show Current User and Immediate Neighbors (n-1, n+1).
  // Never explicitly show "last place" unless there's only 5 students total.
  const renderSafeEntries = (board: LeaderboardData) => {
    const sorted = [...board.entries].sort((a, b) => a.rank - b.rank);
    const currentUserEntry = sorted.find(e => e.studentId === currentStudentId);
    
    // If we only have 5 or fewer, just show them all safely
    if (sorted.length <= 5) return sorted;

    const visibleEntries: LeaderboardEntry[] = [];
    const top3 = sorted.slice(0, 3);
    visibleEntries.push(...top3);

    if (currentUserEntry && currentUserEntry.rank > 4) {
      // Add gap marker logic in rendering later, just add the neighbors here
      const neighborAbove = sorted.find(e => e.rank === currentUserEntry.rank - 1);
      const neighborBelow = sorted.find(e => e.rank === currentUserEntry.rank + 1);

      if (neighborAbove && !visibleEntries.includes(neighborAbove)) visibleEntries.push(neighborAbove);
      if (!visibleEntries.includes(currentUserEntry)) visibleEntries.push(currentUserEntry);
      
      // Only show neighbor below if it doesn't expose the absolute bottom (e.g. if rank is total - 1)
      if (neighborBelow && neighborBelow.rank < sorted.length && !visibleEntries.includes(neighborBelow)) {
        visibleEntries.push(neighborBelow);
      }
    } else if (currentUserEntry && currentUserEntry.rank <= 4) {
        // user is in top 4, just show 4th place to pad it out
        const fourth = sorted.find(e => e.rank === 4);
        if (fourth && !visibleEntries.includes(fourth)) visibleEntries.push(fourth);
    }

    return visibleEntries.sort((a, b) => a.rank - b.rank);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'improvers': return <TrendingUp className="w-4 h-4 text-purple-600" />;
      case 'peer_support': return <HeartHandshake className="w-4 h-4 text-pink-600" />;
      case 'consistency': return <Zap className="w-4 h-4 text-orange-600" />;
      case 'academic':
      default: return <Award className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <Card className="h-full shadow-sm border border-slate-200">
      <CardHeader className="pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
             <Trophy className="w-5 h-5 text-yellow-500" />
             Class Rankings
          </CardTitle>
          <Badge variant="outline" className="text-slate-500 text-xs">This Week</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b border-slate-100 bg-slate-50/50 p-0 h-auto overflow-x-auto">
            {boards.map(board => (
              <TabsTrigger 
                key={board.type} 
                value={board.type}
                className="py-3 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none bg-transparent"
              >
                <div className="flex items-center gap-2">
                  {getIconForType(board.type)}
                  <span className="hidden sm:inline">{board.title}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {boards.map(board => {
            const safeEntries = renderSafeEntries(board);
            let lastRank = 0;

            return (
              <TabsContent key={board.type} value={board.type} className="m-0 p-0">
                <div className="p-3 bg-slate-50 border-b border-slate-100 text-xs text-slate-500 px-4">
                  {board.description}
                </div>
                <div className="divide-y divide-slate-100">
                  {safeEntries.map((entry, index) => {
                    const isJump = entry.rank > lastRank + 1 && lastRank !== 0;
                    lastRank = entry.rank;

                    return (
                      <React.Fragment key={entry.id}>
                        {isJump && (
                          <div className="py-2 flex justify-center bg-slate-50/50">
                            <span className="text-slate-300 font-bold tracking-widest">...</span>
                          </div>
                        )}
                        <div className={`flex items-center p-3 px-4 transition-colors ${entry.studentId === currentStudentId ? 'bg-indigo-50/60' : 'hover:bg-slate-50'}`}>
                           <div className="w-8 text-center font-black text-slate-400 mr-2">
                              {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                           </div>
                           <Avatar className="h-8 w-8 mr-3 border border-slate-200">
                              <AvatarImage src={entry.avatarUrl} />
                              <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-semibold">{entry.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                           </Avatar>
                           <div className="flex-1 min-w-0">
                             <p className={`text-sm font-semibold truncate ${entry.studentId === currentStudentId ? 'text-indigo-900' : 'text-slate-800'}`}>
                               {entry.studentId === currentStudentId ? 'You' : entry.name}
                             </p>
                           </div>
                           <div className="text-right">
                             <span className="font-bold text-slate-700">{entry.score}</span>
                             <span className="text-xs text-slate-500 ml-1">pts</span>
                           </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
};
