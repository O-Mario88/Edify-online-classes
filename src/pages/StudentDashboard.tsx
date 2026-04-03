import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { 
  BookOpen, Calendar, MessageCircle, Play, CheckCircle, 
  Clock, TrendingUp, TrendingDown, Target, Brain, 
  AlertCircle, AlertTriangle, BarChart3, Flame, Activity, User, Users, FileText, Video
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';
import { IntelligenceCard } from '../components/dashboard/IntelligenceCard';
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton';
import { CareerGuidanceWidget } from '../components/dashboard/CareerGuidanceWidget';
import { StudentResourceEngagementPanel } from '../components/dashboard/StudentResourceEngagementPanel';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const student = user as any;

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await apiClient.get('/analytics/student-dashboard/');
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || !dashboardData) {
    return <DashboardSkeleton type="student" />;
  }

  const { kpis, subjectPerformance, nextSession, assessmentSnapshot } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Signature Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
          <div>
            <div className="flex items-center gap-3 mb-1">
               <h1 className="text-3xl font-bold tracking-tight text-slate-900">Learning Command Center</h1>
               <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 mt-1">Active Term</Badge>
            </div>
            <p className="text-slate-500 font-medium">Welcome back, {student?.name?.split(' ')[0] || 'Learner'}. Here is your diagnostic overview.</p>
          </div>
          <div className="flex gap-3">
             <Button size="lg" className="shadow-sm"><BookOpen className="w-4 h-4 mr-2" /> Resume Learning</Button>
          </div>
        </div>

        {/* Row 1: KPI Strip (Intelligence Cards) */}
        <div className="flex flex-wrap gap-4">
          {dashboardData.intelligence?.map((card: any, i: number) => (
             <div key={i} className="flex-[1_1_250px] flex flex-col">
                <div className="flex-1 h-full">
                  <IntelligenceCard {...card} />
                </div>
             </div>
          ))}
        </div>

        {/* Phase 8 Resource Engagement */}
        <StudentResourceEngagementPanel />

        {/* Row 2: Live Session + Risk + AI Guide */}
        <div className="flex flex-wrap gap-6 items-stretch">
          
          {/* Next Live Session Upgrade */}
          <Card className="flex-[1_1_300px] border-l-4 border-l-blue-600 shadow-[0_4px_20px_-4px_rgba(37,99,235,0.1)] relative overflow-hidden flex flex-col justify-between hover:shadow-[0_8px_30px_-6px_rgba(37,99,235,0.15)] transition-all">
             <div className="absolute -top-4 -right-4 p-4 opacity-5 pointer-events-none">
                <Calendar className="w-32 h-32" />
             </div>
             <CardHeader className="pb-3 relative z-10">
               <CardTitle className="text-xs font-bold text-slate-500 flex justify-between uppercase tracking-wider">
                  Next Live Session
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    <Flame className="w-3 h-3 text-orange-500 mr-1" /> {nextSession.streak} Streak
                  </Badge>
               </CardTitle>
               <h3 className="text-xl font-extrabold mt-2 text-slate-900 tracking-tight">{nextSession.subject}: {nextSession.topic}</h3>
             </CardHeader>
             <CardContent className="relative z-10 pt-2">
               <div className="flex justify-between items-end mb-5">
                 <div className="space-y-2">
                   <p className="text-sm font-medium text-slate-600 flex items-center bg-slate-50 w-max px-2 py-1 rounded-md border"><Clock className="w-4 h-4 mr-2 text-slate-400" /> {nextSession.time}</p>
                   <p className="text-sm font-medium text-slate-600 flex items-center bg-slate-50 w-max px-2 py-1 rounded-md border"><User className="w-4 h-4 mr-2 text-slate-400" /> {nextSession.tutor}</p>
                 </div>
                 <div className="text-right bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                    <p className="text-[10px] uppercase font-bold text-blue-600 mb-0.5">Starts in</p>
                    <p className="text-2xl font-black text-blue-700 leading-none">{nextSession.countdown}</p>
                 </div>
               </div>
               <div className="space-y-4 pt-4 border-t border-slate-100">
                 <div className="flex items-center justify-between text-sm">
                   <span className="font-semibold text-slate-500">Join Readiness</span>
                   <Badge variant="secondary" className="text-emerald-700 bg-emerald-50 border-emerald-200 font-bold">{nextSession.readinessState || 'Prepared'}</Badge>
                 </div>
                 <Button className="w-full bg-blue-600 hover:bg-blue-700 font-bold tracking-wide"><Play className="w-4 h-4 mr-2" /> Join Meeting</Button>
               </div>
             </CardContent>
          </Card>

          {/* At Risk Card */}
          <Card className="flex-[1_1_300px] border border-red-100 shadow-[0_4px_20px_-4px_rgba(239,68,68,0.05)] bg-white flex flex-col hover:shadow-[0_8px_30px_-6px_rgba(239,68,68,0.1)] transition-all">
            <CardHeader className="pb-3 border-b border-slate-50 mb-4 bg-slate-50/50">
              <CardTitle className="text-xs font-bold text-red-600 flex items-center uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 mr-2" /> Attention Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                 <div className="bg-red-50/50 border border-red-100 rounded-lg p-3">
                    <p className="text-sm font-semibold text-red-900 leading-tight">
                      Physics attendance dropped below school average (60%).
                    </p>
                 </div>
                 <div className="text-sm space-y-3">
                   <div className="flex justify-between items-center bg-slate-50 p-2 rounded-md border border-slate-100">
                     <span className="text-slate-500 font-medium">Topics slipping</span>
                     <span className="font-bold text-slate-800">Kinematics</span>
                   </div>
                   <div className="flex justify-between items-center bg-slate-50 p-2 rounded-md border border-slate-100">
                     <span className="text-slate-500 font-medium">Missed assignments</span>
                     <Badge variant="outline" className="text-red-700 bg-red-50 border-red-200">2 pending</Badge>
                   </div>
                 </div>
                 <div className="pt-4 border-t border-slate-100">
                   <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">Next best action</p>
                   <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-bold">Review Overdue Tasks</Button>
                 </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Resource Recommendation Engine */}
          <Card className="flex-[1_1_300px] bg-gradient-to-br from-indigo-50/80 to-purple-50/80 border border-indigo-100 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.08)] relative overflow-hidden flex flex-col hover:shadow-[0_8px_30px_-6px_rgba(99,102,241,0.15)] transition-all">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 rounded-l-2xl"></div>
            <CardHeader className="pb-3 border-b border-indigo-100/50 mb-3 bg-white/40">
               <CardTitle className="text-xs font-bold text-indigo-900 flex items-center uppercase tracking-wider">
                 <Brain className="w-4 h-4 mr-2 text-indigo-600" /> Resource Recommendations
               </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-5">
                 <div>
                   <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1.5">Based on Kinematics Quiz</p>
                   <h4 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">Calculus: Limits & Continuity</h4>
                 </div>
                 
                 <div className="space-y-3">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 border border-indigo-100 shadow-sm backdrop-blur-sm hover:bg-white transition-colors cursor-pointer group">
                       <div className="flex items-center gap-3">
                         <div className="p-2 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-100 transition-colors"><FileText className="w-4 h-4" /></div>
                         <div>
                            <p className="text-sm font-bold text-slate-900">Recovery Worksheet</p>
                            <p className="text-[11px] font-medium text-slate-500">PDF Document • 2 pages</p>
                         </div>
                       </div>
                       <Button size="sm" variant="ghost" className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">Download</Button>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 border border-indigo-100 shadow-sm backdrop-blur-sm hover:bg-white transition-colors cursor-pointer group">
                       <div className="flex items-center gap-3">
                         <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors"><Video className="w-4 h-4" /></div>
                         <div>
                            <p className="text-sm font-bold text-slate-900">Limits Refresher</p>
                            <p className="text-[11px] font-medium text-slate-500">Video • 12 mins</p>
                         </div>
                       </div>
                       <Button size="sm" variant="ghost" className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">Watch</Button>
                    </div>
                 </div>

                 <div className="pt-4 border-t border-indigo-200/50">
                    <p className="text-[10px] uppercase text-indigo-600 font-bold tracking-wider mb-2">Upcoming Support Session</p>
                    <div className="flex justify-between items-center text-sm bg-white p-2.5 rounded-xl border border-indigo-100 shadow-sm">
                       <span className="text-slate-700 font-bold text-xs"><Users className="w-3 h-3 inline mr-1 text-slate-400"/> Peer Discussion (Jane)</span>
                       <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 font-bold">Join Queue</Button>
                    </div>
                 </div>
               </div>
            </CardContent>
          </Card>

        </div>

        {/* Row 3: Career Engine Injection */}
        <CareerGuidanceWidget />

        {/* Row 4: Subject Performance Grid */}
        <Card className="shadow-sm">
          <CardHeader className="border-b bg-gray-50/50 pb-4">
             <CardTitle className="text-lg">Subject Performance Grid</CardTitle>
             <CardDescription>Comprehensive diagnostic of your current academic standing</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left border-collapse">
                 <thead className="bg-gray-50 text-gray-500 border-b">
                   <tr>
                     <th className="font-medium p-4 font-semibold uppercase text-xs">Subject</th>
                     <th className="font-medium p-4 font-semibold uppercase text-xs text-center">Completion</th>
                     <th className="font-medium p-4 font-semibold uppercase text-xs text-center">Avg Score</th>
                     <th className="font-medium p-4 font-semibold uppercase text-xs text-center">Weak Topics</th>
                     <th className="font-medium p-4 font-semibold uppercase text-xs text-center">Confidence</th>
                     <th className="font-medium p-4 font-semibold uppercase text-xs text-right">Last Activity</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y">
                   {subjectPerformance.map((subj, index) => (
                     <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${subj.readinessColor}`}></div>
                            <span className="font-bold text-gray-900">{subj.subject}</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Progress value={subj.completion} className="w-16 h-2" />
                            <span className="text-gray-600 font-medium">{subj.completion}%</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <Badge variant="outline" className={subj.avgScore < 60 ? "text-red-600 border-red-200" : ""}>
                            {subj.avgScore}%
                          </Badge>
                        </td>
                        <td className="p-4 text-center">
                          {subj.weakTopics > 0 ? (
                            <span className="text-red-600 font-bold flex items-center justify-center gap-1">
                              {subj.weakTopics} <AlertTriangle className="w-3 h-3" />
                            </span>
                          ) : (
                            <span className="text-green-600 font-bold"><CheckCircle className="w-4 h-4 mx-auto" /></span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            subj.confidence === 'High' ? 'bg-green-100 text-green-700' :
                            subj.confidence === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {subj.confidence}
                          </span>
                        </td>
                        <td className="p-4 text-right text-gray-500 font-medium whitespace-nowrap">
                          {subj.lastActivity}
                        </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </CardContent>
        </Card>

        {/* Row 4: Assessment Trend & Quick Links */}
        <div className="flex flex-wrap gap-6">
          <Card className="flex-[1_1_400px] shadow-sm flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-md flex items-center gap-2"><BarChart3 className="w-4 h-4 text-gray-500" /> Assessment Snapshot</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assessmentSnapshot.map((assessment, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-800">{assessment.name}</span>
                      <span className={assessment.scored < assessment.average ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                        {assessment.scored}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={assessment.scored} className="h-2 flex-1" />
                      <span className="text-xs text-gray-500 w-24 text-right">Class Avg: {assessment.average}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-md flex items-center gap-2"><TrendingUp className="w-4 h-4 text-gray-500" /> 7-Day Activity Trend</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-2 gap-4">
                 <div className="p-3 bg-gray-50 rounded-lg border">
                   <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Lessons Completed</p>
                   <div className="flex items-end gap-2">
                     <span className="text-xl font-bold text-gray-900">12</span>
                     <span className="text-xs text-green-600 flex items-center pb-1"><TrendingUp className="w-3 h-3 mr-1" /> +3</span>
                   </div>
                 </div>
                 <div className="p-3 bg-gray-50 rounded-lg border">
                   <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Forum Posts</p>
                   <div className="flex items-end gap-2">
                     <span className="text-xl font-bold text-gray-900">4</span>
                     <span className="text-xs text-red-600 flex items-center pb-1"><TrendingDown className="w-3 h-3 mr-1" /> -2</span>
                   </div>
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};