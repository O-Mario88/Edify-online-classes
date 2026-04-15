import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { GraduationCap, Briefcase, MapPin, Building } from 'lucide-react';
import { Badge } from '../ui/badge';

export const AlumniOutcomesTracker: React.FC = () => {
  return (
    <Card className="shadow-sm border-slate-200 bg-white">
       <CardHeader className="bg-slate-50 border-b border-slate-100 pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
             <GraduationCap className="w-5 h-5 text-indigo-800" />
             Alumni & Outcomes Beta
          </CardTitle>
          <CardDescription>Tracking platform-wide post-graduation outcomes.</CardDescription>
       </CardHeader>
       <CardContent className="p-5">
          <div className="grid grid-cols-3 gap-4 mb-6">
             <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100 text-center">
                <span className="text-3xl font-black text-blue-700">12.4k</span>
                <span className="block text-xs font-bold uppercase text-blue-700 mt-1">Tracked Alumni</span>
             </div>
             <div className="p-4 bg-green-50/50 rounded-lg border border-green-100 text-center">
                <span className="text-3xl font-black text-green-700">76%</span>
                <span className="block text-xs font-bold uppercase text-emerald-700 mt-1">University Rate</span>
             </div>
             <div className="p-4 bg-purple-50/50 rounded-lg border border-purple-100 text-center">
                <span className="text-3xl font-black text-purple-700">4,200</span>
                <span className="block text-xs font-bold uppercase text-purple-700 mt-1">Direct Hires</span>
             </div>
          </div>

          <h4 className="text-xs font-bold uppercase text-slate-800 mb-3 tracking-wider">Recent Verifiable Outcomes</h4>
          <div className="space-y-3">
             {[
               { name: "Isaac O.", path: "Makerere University", degree: "BSc Software Engineering", year: "2024", school: "Kampala Model" },
               { name: "Sarah M.", path: "SafeBoda HQ", degree: "Junior Analyst", year: "2025", school: "Valley View" },
               { name: "David K.", path: "Kyambogo University", degree: "Civil Engineering", year: "2024", school: "Kampala Model" },
             ].map((alum, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-100 transition-colors">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-white shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
                         {i === 1 ? <Briefcase className="w-5 h-5 text-purple-700" /> : <Building className="w-5 h-5 text-emerald-700" />}
                      </div>
                      <div>
                         <p className="font-bold text-slate-800 text-sm">
                           {alum.name} <span className="text-slate-800 font-normal">({alum.year})</span>
                         </p>
                         <p className="text-xs text-slate-800 font-medium">{alum.path} • {alum.degree}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <Badge variant="outline" className="text-[10px] text-slate-700 bg-white shadow-sm font-semibold border-slate-200">
                        {alum.school}
                      </Badge>
                   </div>
                </div>
             ))}
          </div>
       </CardContent>
    </Card>
  );
};
