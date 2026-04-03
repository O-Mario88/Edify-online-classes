import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Sparkles, TrendingUp, Users, BookOpen } from 'lucide-react';

export const TeacherPerformanceStory: React.FC = () => {
  return (
    <Card className="shadow-sm border-blue-200 bg-gradient-to-br from-white to-blue-50/50">
      <CardHeader className="pb-2 border-b border-blue-50">
        <CardTitle className="text-lg font-bold text-blue-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          Your Teaching Story
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            "Over the last 30 days, your interventions have led to a <strong className="text-emerald-600">14% measurable jump</strong> in Mathematics across your S3 cohort. You are incredibly consistent with grading, turning around exams in just 2 days. To reach the next tier, focus on boosting attendance in early morning live sessions."
          </p>

          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-blue-100">
            <div className="text-center">
              <div className="bg-emerald-100 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-500">Impact</div>
              <div className="text-sm font-bold text-slate-800">Top 10%</div>
            </div>
            <div className="text-center border-l border-r border-blue-100">
              <div className="bg-indigo-100 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1">
                <BookOpen className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-500">Resources</div>
              <div className="text-sm font-bold text-slate-800">2.1k views</div>
            </div>
            <div className="text-center">
              <div className="bg-amber-100 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1">
                <Users className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-500">Retention</div>
              <div className="text-sm font-bold text-slate-800">92%</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
