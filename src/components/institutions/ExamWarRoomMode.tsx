import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { AlertTriangle, BookOpen, Clock, Target, DollarSign, Users, AlertCircle } from 'lucide-react';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export const ExamWarRoomMode: React.FC = () => {
  return (
    <div className="space-y-6">

       <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-red-100 text-red-800 rounded-full flex items-center justify-center animate-pulse shrink-0">
               <AlertTriangle className="w-6 h-6" />
             </div>
             <div>
               <h3 className="text-red-900 font-bold text-lg">Exam Readiness Tracker — UNEB O-Level</h3>
               <p className="text-red-700 text-sm font-medium">24 days out. Readiness estimate based on attendance, assessments, and completed work.</p>
             </div>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-100">Broadcast Alert</Button>
             <Button className="bg-red-600 hover:bg-red-700 text-white shadow-md">Generate Status Memo</Button>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <Card className="border-slate-200 shadow-sm border-l-4 border-l-red-500">
            <CardContent className="p-4 flex flex-col">
               <span className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2"><DollarSign className="w-4 h-4 text-slate-800"/> Unpaid Candidates</span>
               <span className="text-3xl font-black text-slate-800">42</span>
               <span className="text-xs text-red-700 mt-1 font-medium">Clearance required for seating</span>
            </CardContent>
         </Card>
         <Card className="border-slate-200 shadow-sm border-l-4 border-l-orange-500">
            <CardContent className="p-4 flex flex-col">
               <span className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2"><Clock className="w-4 h-4 text-slate-800"/> Chronic Absenteeism</span>
               <span className="text-3xl font-black text-slate-800">14<span className="text-lg text-slate-800 font-bold ml-1">students</span></span>
               <span className="text-xs text-orange-600 mt-1 font-medium">&lt; 85% attendance rate</span>
            </CardContent>
         </Card>
         <Card className="border-slate-200 shadow-sm border-l-4 border-l-yellow-500">
            <CardContent className="p-4 flex flex-col">
               <span className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2"><BookOpen className="w-4 h-4 text-slate-800"/> Missing Assignments</span>
               <span className="text-3xl font-black text-slate-800">89</span>
               <span className="text-xs text-amber-700 mt-1 font-medium">Across 3 core subjects</span>
            </CardContent>
         </Card>
         <Card className="border-slate-200 shadow-sm border-l-4 border-l-indigo-500">
            <CardContent className="p-4 flex flex-col">
               <span className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2"><Users className="w-4 h-4 text-slate-800"/> Priority Revision Grps</span>
               <span className="text-3xl font-black text-slate-800">5</span>
               <span className="text-xs text-indigo-800 mt-1 font-medium">Auto-generated via diagnostics</span>
            </CardContent>
         </Card>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm">
             <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
               <CardTitle className="text-md flex items-center gap-2 text-slate-800"><Target className="w-4 h-4 text-indigo-800" /> Overall Readiness by Subject</CardTitle>
             </CardHeader>
             <CardContent className="p-4 space-y-4">
                {[
                  { subject: 'Mathematics Core', readiness: 45 },
                  { subject: 'Physics', readiness: 62 },
                  { subject: 'Chemistry', readiness: 58 },
                  { subject: 'English Language', readiness: 88 }
                ].map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm font-medium mb-1.5">
                       <span className="text-slate-800">{s.subject}</span>
                       <span className={`${s.readiness < 60 ? 'text-red-700' : 'text-emerald-800'} font-bold`}>{s.readiness}%</span>
                    </div>
                    <Progress value={s.readiness} className={`h-2 ${s.readiness < 60 ? '[&>div]:bg-red-500' : '[&>div]:bg-green-500'}`} />
                  </div>
                ))}
             </CardContent>
          </Card>

          <Card className="shadow-sm border-red-200 border">
             <CardHeader className="pb-3 border-b border-red-100 bg-red-50/50">
               <CardTitle className="text-md flex items-center gap-2 text-red-900"><AlertCircle className="w-4 h-4 text-red-800" /> Platform Identified Weak Topics</CardTitle>
             </CardHeader>
             <CardContent className="p-0">
               <div className="divide-y divide-red-100">
                  {[
                    { topic: 'Quadratic Equations', subject: 'Math', failureRate: '68%', group: 'Senior 4' },
                    { topic: 'Atomic Structure', subject: 'Chemistry', failureRate: '55%', group: 'Senior 4' },
                    { topic: 'Electromagnetism', subject: 'Physics', failureRate: '52%', group: 'Senior 4' },
                  ].map((w, i) => (
                    <div key={i} className="p-3 px-4 flex items-center justify-between hover:bg-red-50/30 transition-colors">
                       <div>
                          <p className="font-bold text-slate-800 text-sm">{w.topic}</p>
                          <p className="text-xs text-slate-700">{w.subject} • {w.group}</p>
                       </div>
                       <div className="text-right">
                          <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100">
                            {w.failureRate} Fail Rate
                          </Badge>
                       </div>
                    </div>
                  ))}
               </div>
               <div className="p-3 bg-slate-50 border-t border-slate-100">
                   <Button variant="outline" className="w-full text-sm">Assign Emergency Quizzes</Button>
               </div>
             </CardContent>
          </Card>
       </div>
    </div>
  );
};
