import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Trophy, Target, Rocket, Zap, ChevronUp, Star, MapPin } from 'lucide-react';
import { DashboardGrid } from './layout/DashboardGrid';
import { DashboardCard } from './layout/DashboardCard';

export const StudentMotivationEngine: React.FC = () => {
  return (
    <DashboardGrid className="!items-stretch">
      {/* Gamification: Scholar Status */}
      <DashboardCard colSpan={1} mdColSpan={12} lgColSpan={4} variant="transparent">
        <Card className="h-full border border-purple-500/20 bg-gradient-to-b from-purple-500/10 to-transparent hover:bg-purple-500/10 transition-colors shadow-lg relative overflow-hidden group">
          {/* Holographic glow effect */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-400/30 transition-all pointer-events-none"></div>
          
          <CardContent className="p-5 flex flex-col h-full z-10 relative">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                <Trophy className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Global Rank</span>
                <p className="text-xl font-black text-white">Top 8%</p>
              </div>
            </div>
            
            <div className="mt-auto pt-6 space-y-4">
              <div>
                <h3 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  Level 4 Academician <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                </h3>
                <p className="text-sm text-slate-800 font-medium">120 Platform Reputation Points <span className="opacity-50">(Max Level 10)</span></p>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-purple-300">Progress to Level 5</span>
                  <span className="text-white">120 / 200 XP</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-400 w-[60%] rounded-full shadow-[0_0_10px_rgba(192,38,211,0.5)]"></div>
                </div>
                <p className="text-[10px] text-slate-700 pt-1">Help 2 more students to level up.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DashboardCard>

      {/* Goal Trajectory: Career Mapping */}
      <DashboardCard colSpan={1} mdColSpan={6} lgColSpan={4} variant="transparent">
        <Card className="h-full border border-blue-500/20 bg-gradient-to-b from-blue-500/10 to-transparent hover:bg-blue-500/10 transition-colors shadow-lg relative overflow-hidden group">
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-400/30 transition-all pointer-events-none"></div>

          <CardContent className="p-5 flex flex-col h-full z-10 relative">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                <Target className="w-5 h-5 text-blue-400" />
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-blue-400" />
                <span className="text-xs font-bold text-blue-300">Makerere Univ.</span>
              </div>
            </div>

            <div className="mt-auto pt-4 space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Career Trajectory</p>
                <h3 className="text-xl font-extrabold text-white tracking-tight leading-tight mt-1">Software Engineering</h3>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-3 border border-white/5 space-y-3">
                 <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-slate-800 font-medium">Current Sci/Math Avg</p>
                      <p className="text-lg font-bold text-white">72%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-blue-400 font-bold tracking-wider uppercase">Target</p>
                      <p className="text-lg font-bold text-blue-300">85%</p>
                    </div>
                 </div>
                 
                 <div className="relative pt-2">
                    {/* Background Track */}
                    <div className="h-1.5 w-full bg-slate-800 rounded-full"></div>
                    {/* Current Progress */}
                    <div className="absolute top-2 left-0 h-1.5 bg-slate-400 rounded-full z-10" style={{ width: '72%' }}></div>
                    {/* The Gap */}
                    <div className="absolute top-2 left-[72%] h-1.5 bg-blue-500/40 border-y border-r border-blue-400 rounded-r-full z-20" style={{ width: '13%' }}></div>
                    
                    {/* Markers */}
                    <div className="absolute top-0 left-[72%] w-1 h-5 bg-white shadow-[0_0_8px_white] -translate-x-1/2 z-30 rounded-full"></div>
                    <div className="absolute top-0 left-[85%] w-1 h-5 bg-blue-400 shadow-[0_0_8px_blue] -translate-x-1/2 z-30 rounded-full"></div>
                 </div>
                 <p className="text-[10px] text-slate-800 text-center font-medium">You need a <span className="text-blue-300 font-bold">+13% boost</span> to hit your trajectory line.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DashboardCard>

      {/* Velocity Tracking: Momentum */}
      <DashboardCard colSpan={1} mdColSpan={6} lgColSpan={4} variant="transparent">
        <Card className="h-full border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 to-transparent hover:bg-emerald-500/10 transition-colors shadow-lg relative overflow-hidden group">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-20 bg-emerald-500/20 blur-2xl group-hover:bg-emerald-400/30 transition-all pointer-events-none"></div>

          <CardContent className="p-5 flex flex-col h-full z-10 relative">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <Rocket className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold text-emerald-300">Hot Streak</span>
              </div>
            </div>

            <div className="mt-auto pt-4 space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Improvement Velocity</p>
                <div className="flex items-end gap-2 mt-1">
                   <h3 className="text-4xl font-black text-white tracking-tighter leading-none">+15<span className="text-lg text-emerald-500">%</span></h3>
                   <span className="flex items-center text-emerald-400 font-bold mb-1"><ChevronUp className="w-4 h-4 text-emerald-400" strokeWidth={3} /> in Physics</span>
                </div>
              </div>

              <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20">
                <div className="text-sm font-bold text-emerald-100 mb-1">Fastest Improver 🏆</div>
                <p className="text-xs text-emerald-200/70 font-medium leading-relaxed">
                  Your physics score jumped from 55% to 70% over the last 30 days. You have the highest improvement rate in S4. Keep this momentum!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DashboardCard>

    </DashboardGrid>
  );
};
