import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Award, Briefcase, GraduationCap, HeartHandshake, Shield, Sparkles, Code, Globe, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

export interface StudentPassportData {
  studentName: string;
  grade: string;
  house: string;
  avatarUrl?: string;
  academicGPA: number;
  attendanceRate: number;
  careerSignals: string[];
  leadershipRoles: string[];
  topSkills: { name: string; level: number }[];
  projects: { title: string; type: string }[];
}

interface StudentPassportProps {
  data: StudentPassportData;
}

export const StudentPassport: React.FC<StudentPassportProps> = ({ data }) => {
  return (
    <Card className="overflow-hidden border-indigo-100 shadow-md bg-white">
       <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white pb-16 relative">
          <div className="absolute top-0 right-0 p-4 opacity-20"><Globe className="w-32 h-32" /></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             <div>
                <h2 className="text-sm font-bold tracking-widest uppercase opacity-80 mb-1">Maple Global Learner Passport</h2>
                <h1 className="text-3xl font-black">{data.studentName}</h1>
                <p className="opacity-90">{data.grade} • {data.house} House</p>
             </div>
             <div className="flex gap-2">
                <Badge variant="outline" className="border-white/40 text-white hover:bg-white/10 shadow-sm backdrop-blur-sm px-3 py-1 bg-black/10">
                   Verified Record
                </Badge>
             </div>
          </div>
       </div>

       <CardContent className="px-6 pb-6 relative z-10">
          <div className="flex flex-col md:flex-row gap-6 -mt-10">
             
             {/* Profile Column */}
             <div className="w-full md:w-1/3 space-y-6">
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg bg-white">
                  <AvatarImage src={data.avatarUrl} />
                  <AvatarFallback className="text-2xl text-indigo-700 bg-indigo-50 font-bold">
                    {data.studentName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="grid grid-cols-2 gap-3">
                   <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 flex flex-col items-center justify-center text-center">
                      <GraduationCap className="w-5 h-5 text-indigo-700 mb-1" />
                      <span className="text-[10px] font-bold text-slate-700 uppercase">Core Academic</span>
                      <span className="text-xl font-black text-slate-800">{data.academicGPA.toFixed(1)}</span>
                   </div>
                   <div className="bg-green-50/50 p-3 rounded-xl border border-green-100 flex flex-col items-center justify-center text-center">
                      <User className="w-5 h-5 text-emerald-700 mb-1" />
                      <span className="text-[10px] font-bold text-slate-700 uppercase">Attendance</span>
                      <span className="text-xl font-black text-slate-800">{data.attendanceRate}%</span>
                   </div>
                </div>

                <div className="space-y-3">
                   <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5"><HeartHandshake className="w-3.5 h-3.5" /> Leadership & Honors</h3>
                   <div className="flex flex-wrap gap-2">
                     {data.leadershipRoles.map((role, i) => (
                       <Badge key={i} variant="secondary" className="bg-yellow-50 text-yellow-800 hover:bg-yellow-50 border border-yellow-200">
                         {role}
                       </Badge>
                     ))}
                   </div>
                </div>

                <div className="space-y-3">
                   <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> Career Signals</h3>
                   <div className="flex flex-wrap gap-2">
                     {data.careerSignals.map((signal, i) => (
                       <Badge key={i} variant="outline" className="text-slate-800 border-slate-200">
                         <Sparkles className="w-3 h-3 mr-1 text-purple-700" /> {signal}
                       </Badge>
                     ))}
                   </div>
                </div>
             </div>

             {/* Details Column */}
             <div className="w-full md:w-2/3 space-y-6 pt-12 md:pt-0">
               
                <div>
                   <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                     <Code className="w-4 h-4 text-indigo-700" /> Competency Matrix
                   </h3>
                   <div className="space-y-4">
                      {data.topSkills.map((skill, i) => (
                        <div key={i}>
                           <div className="flex justify-between text-sm font-medium mb-1">
                              <span className="text-slate-700">{skill.name}</span>
                              <span className="text-indigo-800">{skill.level}%</span>
                           </div>
                           <Progress value={skill.level} className="h-2 [&>div]:bg-indigo-500" />
                        </div>
                      ))}
                   </div>
                </div>

                <div>
                   <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                     <Award className="w-4 h-4 text-purple-700" /> Portfolio & Projects
                   </h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {data.projects.map((proj, i) => (
                        <div key={i} className="p-3 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer flex items-start gap-3">
                           <div className="w-8 h-8 rounded bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
                             <FileIcon type={proj.type} />
                           </div>
                           <div>
                              <p className="font-bold text-slate-800 text-sm line-clamp-1">{proj.title}</p>
                              <p className="text-xs text-slate-700 uppercase tracking-wider mt-0.5">{proj.type}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

             </div>

          </div>
       </CardContent>
    </Card>
  );
};

const FileIcon = ({ type }: { type: string }) => {
  if (type === 'code') return <Code className="w-4 h-4 text-slate-800" />;
  if (type === 'presentation') return <Sparkles className="w-4 h-4 text-yellow-500" />;
  return <Briefcase className="w-4 h-4 text-blue-400" />;
}
