import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { HeartPulse, Briefcase, CalendarCheck, ShieldAlert, FileOutput } from 'lucide-react';
import { Badge } from '../ui/badge';

export const InstitutionTeacherWellness: React.FC = () => {
  const [showHandover, setShowHandover] = useState(false);

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
         <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-rose-500" />
            Teacher Wellness & Cover
            <Badge variant="outline" className="ml-auto bg-slate-100 text-slate-700 text-xs border-slate-200">
               Institution Feature
            </Badge>
         </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Load Status */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border text-center border-slate-100 rounded-lg p-3 shadow-sm">
             <div className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">Weekly Load</div>
             <div className="text-xl font-bold text-slate-800">28 Hours</div>
             <div className="text-[10px] text-emerald-800 mt-1">Within limits</div>
          </div>
          <div className="bg-white border text-center border-slate-100 rounded-lg p-3 shadow-sm border-l-4 border-l-orange-400">
             <div className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">Burnout Risk</div>
             <div className="text-xl font-bold text-orange-600">Moderate</div>
             <div className="text-[10px] text-slate-700 mt-1">Due to high grading volume</div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-rose-50 rounded-lg p-4 border border-rose-100">
           <h4 className="font-semibold text-rose-900 flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-rose-600" />
              Need to take sick leave?
           </h4>
           <p className="text-sm text-rose-700/80 mb-3">
             Your institution uses Smart Cover. We can auto-generate a handover package for your substitute containing your latest lesson plans, current topic progress, and a list of at-risk students.
           </p>
           {!showHandover ? (
              <Button onClick={() => setShowHandover(true)} variant="outline" className="w-full bg-white text-rose-700 border-rose-200 hover:bg-rose-100">
                 <FileOutput className="w-4 h-4 mr-2" /> Generate Handover Package
              </Button>
           ) : (
              <div className="bg-white rounded-md p-3 border border-rose-200 text-sm animate-in fade-in zoom-in">
                 <div className="flex items-center gap-2 text-emerald-800 font-semibold mb-2">
                    <CalendarCheck className="w-4 h-4" /> Package Ready
                 </div>
                 <ul className="list-disc pl-4 space-y-1 text-slate-800 text-xs mb-3">
                    <li>S3 Physics Topic State: "Kinematics" (Week 2 of 4)</li>
                    <li>S4 Maths Assignments pending review</li>
                    <li>Joan Doe (S4) Requires Red-Alert Monitoring</li>
                 </ul>
                 <Button className="w-full bg-rose-600 hover:bg-rose-700">Submit Cover Request to DOS</Button>
              </div>
           )}
        </div>
      </CardContent>
    </Card>
  );
};
