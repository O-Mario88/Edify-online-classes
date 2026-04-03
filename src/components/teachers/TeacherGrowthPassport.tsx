import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Award, Star, Medal, BookOpen, Clock, Target } from 'lucide-react';

export const TeacherGrowthPassport: React.FC = () => {
  return (
    <Card className="shadow-sm border-slate-200 bg-white">
      <CardHeader className="pb-3 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-white">
        <CardTitle className="text-lg font-bold text-amber-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-600" />
          Growth Passport
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border-2 border-amber-200">
              <span className="text-2xl font-bold text-amber-600">L4</span>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-1 rounded-full shadow-sm">
              <Star className="w-3 h-3 fill-current" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Master Teacher</h3>
            <p className="text-sm text-slate-500">Earn 450 more XP to reach Level 5</p>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2">
              <div className="bg-amber-500 h-2 rounded-full" style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Earned Badges</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="flex flex-col items-center p-3 bg-slate-50 border border-slate-100 rounded-lg text-center">
              <Medal className="w-6 h-6 text-indigo-500 mb-1" />
              <span className="text-xs font-bold text-slate-800">Turnaround Ace</span>
              <span className="text-[10px] text-slate-500">Graded &lt;24hrs</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-slate-50 border border-slate-100 rounded-lg text-center">
              <BookOpen className="w-6 h-6 text-emerald-500 mb-1" />
              <span className="text-xs font-bold text-slate-800">Content Creator</span>
              <span className="text-[10px] text-slate-500">50+ Notes uploaded</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-slate-50 border border-slate-100 rounded-lg text-center">
              <Target className="w-6 h-6 text-red-500 mb-1" />
              <span className="text-xs font-bold text-slate-800">Intervention Pro</span>
              <span className="text-[10px] text-slate-500">Recovered 20 students</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Recent Commendations</h4>
          <div className="space-y-2">
            <div className="text-sm p-3 border border-slate-100 rounded-lg bg-white shadow-sm border-l-4 border-l-purple-500">
              <p className="italic text-slate-700">"Excellent use of the intervention bundles to recover S4 failing students."</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">- Head of Dept (Maths)</p>
            </div>
            <div className="text-sm p-3 border border-slate-100 rounded-lg bg-white shadow-sm border-l-4 border-l-blue-500">
              <p className="italic text-slate-700">"Your live session on vectors was the clearest explanation I've heard!"</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">- Student Feedback</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
