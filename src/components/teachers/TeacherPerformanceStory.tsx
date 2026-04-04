import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Sparkles, TrendingUp, Users, BookOpen } from 'lucide-react';

export const TeacherPerformanceStory: React.FC = () => {
  return (
    <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-none bg-primary text-white h-full justify-between flex flex-col p-6 rounded-[2rem]">
      <div>
         <div className="flex justify-between items-start mb-4">
            <h3 className="font-extrabold text-2xl tracking-tight text-white/90">Your Imprint</h3>
            <div className="bg-white/20 backdrop-blur-md p-2 rounded-full shadow-sm text-white">
               <Sparkles className="w-5 h-5" />
            </div>
         </div>
         <p className="text-white/80 leading-relaxed font-medium mb-6">
            "Over the last 30 days, your interventions have led to a <strong className="text-white font-extrabold bg-white/20 px-2 py-0.5 rounded-full inline-flex items-center">14% positive jump</strong> in Mathematics across your S3 cohort. You are incredibly consistent with grading, turning around exams in just 2 days. To reach the next tier, focus on boosting attendance in early morning live sessions."
         </p>
      </div>

      <div className="flex gap-2">
         <div className="flex-1 bg-white/[0.08] backdrop-blur-md rounded-[1.5rem] p-4 text-center border border-white/10 hover:bg-white/20 transition-all">
            <TrendingUp className="w-5 h-5 text-white/70 mx-auto mb-2" />
            <div className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Impact</div>
            <div className="text-md font-bold text-white">Top 10%</div>
         </div>
         <div className="flex-1 bg-white/[0.08] backdrop-blur-md rounded-[1.5rem] p-4 text-center border border-white/10 hover:bg-white/20 transition-all">
            <BookOpen className="w-5 h-5 text-white/70 mx-auto mb-2" />
            <div className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Resources</div>
            <div className="text-md font-bold text-white">2.1k views</div>
         </div>
         <div className="flex-1 bg-white/[0.08] backdrop-blur-md rounded-[1.5rem] p-4 text-center border border-white/10 hover:bg-white/20 transition-all">
            <Users className="w-5 h-5 text-white/70 mx-auto mb-2" />
            <div className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Retention</div>
            <div className="text-md font-bold text-white">92%</div>
         </div>
      </div>
    </Card>
  );
};
