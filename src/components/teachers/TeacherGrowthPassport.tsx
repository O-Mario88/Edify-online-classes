import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Award, Star, Medal, BookOpen, Clock, Target, Flame, TrendingUp, Zap, ChevronRight } from 'lucide-react';

export const TeacherGrowthPassport: React.FC = () => {
  const currentXP = 1550;
  const nextLevelXP = 2000;
  const progressPct = Math.round((currentXP / nextLevelXP) * 100);
  const xpRemaining = nextLevelXP - currentXP;

  return (
    <Card className="shadow-sm border-slate-200 bg-white overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100 bg-gradient-to-r from-amber-50 via-orange-50/30 to-white">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-amber-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            Growth Passport
          </CardTitle>
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-bold text-xs">
            <Flame className="w-3 h-3 mr-1 text-orange-500" />
            12-Day Streak
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-5 flex flex-col gap-6">
        
        {/* Top: Level + XP Progress + Motivational CTA */}
        <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
          {/* Level Badge */}
          <div className="flex items-center gap-4 lg:min-w-[220px]">
            <div className="relative shrink-0">
              <div className="w-18 h-18 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center border-[3px] border-amber-300 shadow-lg shadow-amber-200/50 w-[72px] h-[72px]">
                <span className="text-2xl font-black text-amber-700">L4</span>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-1.5 rounded-full shadow-md">
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-extrabold text-slate-900 text-lg">Master Teacher</h3>
              <p className="text-sm text-amber-700 font-semibold">{xpRemaining} XP to Level 5</p>
              <div className="w-full bg-slate-100 h-2.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-400 to-orange-500 h-2.5 rounded-full transition-all duration-700 relative"
                  style={{ width: `${progressPct}%` }}
                >
                  <div className="absolute right-0 top-0 w-2 h-full bg-white/40 rounded-full animate-pulse"></div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-1">{currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP</p>
            </div>
          </div>

          {/* Motivational Push Card */}
          <div className="flex-1 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg shrink-0">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-900 text-sm mb-1">You're on fire! 🔥</h4>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Your students' average scores jumped <strong>+12%</strong> this month. You've recovered <strong>3 at-risk learners</strong> and 
                  your content has been accessed <strong>340 times</strong>. Keep this momentum — Level 5 unlocks the <strong>Platinum Creator</strong> badge!
                </p>
                <div className="flex items-center gap-2 mt-2.5">
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                    <Zap className="w-3 h-3 mr-0.5" /> +85 XP this week
                  </Badge>
                  <Badge className="bg-white text-slate-600 border-slate-200 text-[10px] font-bold">
                    Top 15% of teachers
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle: Badges + Commendations */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Earned Badges */}
          <div className="lg:w-[280px] shrink-0">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Earned Badges</h4>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="flex flex-col items-center p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-center hover:bg-indigo-100/70 transition-colors cursor-pointer group">
                <Medal className="w-6 h-6 text-indigo-500 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-700">Turnaround</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-center hover:bg-emerald-100/70 transition-colors cursor-pointer group">
                <BookOpen className="w-6 h-6 text-emerald-500 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-700">Creator</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-red-50/70 border border-red-100 rounded-xl text-center hover:bg-red-100/70 transition-colors cursor-pointer group">
                <Target className="w-6 h-6 text-red-500 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-700">Intervention</span>
              </div>
            </div>
            <div className="mt-3 p-2 bg-amber-50 border border-amber-100 rounded-lg text-center">
              <p className="text-[10px] text-amber-700 font-semibold">🏅 Next badge: <strong>Punctuality Pro</strong> — 5 more on-time sessions</p>
            </div>
          </div>

          {/* Recent Commendations */}
          <div className="flex-1">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Recent Commendations</h4>
            <div className="space-y-2.5">
              <div className="text-sm p-3 border border-slate-100 rounded-lg bg-white shadow-sm border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                <p className="italic text-slate-700 font-medium">"Excellent use of the intervention bundles for failing students."</p>
                <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">- Head of Dept (Maths)</p>
              </div>
              <div className="text-sm p-3 border border-slate-100 rounded-lg bg-white shadow-sm border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                <p className="italic text-slate-700 font-medium">"Your live session on vectors was the clearest explanation!"</p>
                <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">- Student Feedback</p>
              </div>
              <div className="text-sm p-3 border border-slate-100 rounded-lg bg-white shadow-sm border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
                <p className="italic text-slate-700 font-medium">"Thank you for following up. Joan's grades are improving!"</p>
                <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">- Parent (Mrs. Doe)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Challenge CTA */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/20 p-2 rounded-lg">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Weekly Challenge: Upload 2 more resources</h4>
              <p className="text-xs text-slate-400">Complete this to earn 150 bonus XP and unlock the Content King badge</p>
            </div>
          </div>
          <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold shrink-0 shadow-lg shadow-amber-500/30">
            Accept <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
