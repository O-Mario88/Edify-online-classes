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
  AlertCircle, AlertTriangle, BarChart3, Flame, Activity, User, FileText, Video
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your Learning Command Center...</p>
        </div>
      </div>
    );
  }

  const { kpis, subjectPerformance, nextSession, assessmentSnapshot } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Learning Command Center</h1>
            <p className="text-gray-600 mt-1">Welcome back, {student?.name?.split(' ')[0] || 'Learner'}. Here is your active diagnostic overview.</p>
          </div>
          <div className="flex gap-3">
             <Button className="shadow-sm"><BookOpen className="w-4 h-4 mr-2" /> Resume Course</Button>
          </div>
        </div>

        {/* Row 1: KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Overall Progress</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">{kpis.overallProgress}%</span>
                <span className="text-xs text-green-600 flex items-center mb-1"><TrendingUp className="w-3 h-3 mr-1"/>{kpis.progressTrend}%</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm hover:border-red-300 transition-colors">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Attendance</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">{kpis.attendance}%</span>
                <span className="text-xs text-red-600 flex items-center mb-1"><TrendingDown className="w-3 h-3 mr-1"/>{kpis.attendanceTrend}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Weekly Assessments</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">{kpis.assessmentsCompleted}</span>
                <span className="text-xs text-gray-500 mb-1">completed</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <p className="text-xs font-medium text-gray-500 mb-1 flex items-center justify-between">UNEB Readiness <Target className="w-3 h-3 text-blue-500"/></p>
              <div className="text-2xl font-bold text-blue-700">{kpis.readinessScore}</div>
              <Progress value={kpis.readinessScore} className="h-1 mt-2" />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-red-200 bg-red-50/30">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-red-800 mb-1">Overdue Tasks</p>
              <div className="flex items-end gap-2 text-red-600">
                <span className="text-2xl font-bold">{kpis.overdueTasks}</span>
                <AlertCircle className="w-4 h-4 mb-1" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Live Sessions</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">{kpis.liveSessionsAttended}</span>
                <span className="text-xs text-gray-500 mb-1">this month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Phase 8 Resource Engagement */}
        <StudentResourceEngagementPanel />

        {/* Row 2: Live Session + Risk + AI Guide */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Next Live Session Upgrade */}
          <Card className="border-l-4 border-l-blue-500 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Calendar className="w-24 h-24" />
             </div>
             <CardHeader className="pb-2 relative z-10">
               <CardTitle className="text-sm font-semibold text-gray-500 flex justify-between uppercase">
                  Next Live Session
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <Flame className="w-3 h-3 text-orange-500 mr-1" /> {nextSession.streak} Streak
                  </Badge>
               </CardTitle>
               <h3 className="text-xl font-bold mt-1 text-gray-900">{nextSession.subject}: {nextSession.topic}</h3>
             </CardHeader>
             <CardContent className="relative z-10">
               <div className="flex justify-between items-end mb-4">
                 <div className="space-y-1">
                   <p className="text-sm text-gray-600 flex items-center"><Clock className="w-4 h-4 mr-2" /> {nextSession.time}</p>
                   <p className="text-sm text-gray-600 flex items-center"><User className="w-4 h-4 mr-2" /> {nextSession.tutor}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-xs text-gray-500 font-medium">Starts in</p>
                    <p className="text-xl font-bold text-blue-600">{nextSession.countdown}</p>
                 </div>
               </div>
               <div className="space-y-3">
                 <div className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm border">
                   <span className="text-gray-600">Join Readiness</span>
                   <Badge variant="secondary" className="text-yellow-700 bg-yellow-100">{nextSession.readinessState}</Badge>
                 </div>
                 <Button className="w-full"><Play className="w-4 h-4 mr-2" /> Join Meeting</Button>
               </div>
             </CardContent>
          </Card>

          {/* At Risk Card */}
          <Card className="border border-red-200 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-red-700 flex items-center uppercase">
                <AlertTriangle className="w-4 h-4 mr-2" /> Attention Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                 <Alert variant="destructive" className="bg-red-50 border-none py-2 px-3">
                    <AlertDescription className="text-xs font-medium">
                      Physics attendance dropped below school average (60%).
                    </AlertDescription>
                 </Alert>
                 <div className="text-sm space-y-2">
                   <div className="flex justify-between items-center border-b pb-1">
                     <span className="text-gray-600">Topics slipping</span>
                     <span className="font-semibold text-gray-900">Kinematics</span>
                   </div>
                   <div className="flex justify-between items-center border-b pb-1">
                     <span className="text-gray-600">Missed assignments</span>
                     <span className="font-semibold text-red-600">2 pending</span>
                   </div>
                 </div>
                 <div className="pt-2">
                   <p className="text-xs text-gray-500 mb-2">Next best action</p>
                   <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">Review Overdue Tasks</Button>
                 </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Resource Recommendation Engine */}
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
            <CardHeader className="pb-2">
               <CardTitle className="text-sm font-semibold text-indigo-900 flex items-center uppercase">
                 <Brain className="w-4 h-4 mr-2 text-indigo-600" /> Resource Recommendations
               </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                 <div>
                   <p className="text-xs font-medium text-indigo-800 opacity-70 uppercase tracking-wider mb-1">Based on recent Kinematics Quiz</p>
                   <h4 className="text-lg font-bold text-gray-900 leading-tight">Calculus: Limits & Continuity</h4>
                 </div>
                 
                 <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-indigo-100 shadow-sm">
                       <div className="flex items-center gap-2">
                         <div className="p-1.5 bg-red-100 rounded text-red-600"><FileText className="w-4 h-4" /></div>
                         <div>
                            <p className="text-xs font-bold text-slate-900">Recovery Worksheet</p>
                            <p className="text-[10px] text-slate-500">PDF Document • 2 pages</p>
                         </div>
                       </div>
                       <Button size="sm" variant="ghost" className="text-indigo-600 h-8 px-2 text-xs">Download</Button>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-indigo-100 shadow-sm">
                       <div className="flex items-center gap-2">
                         <div className="p-1.5 bg-blue-100 rounded text-blue-600"><Video className="w-4 h-4" /></div>
                         <div>
                            <p className="text-xs font-bold text-slate-900">Limits Refresher Lesson</p>
                            <p className="text-[10px] text-slate-500">Video • 12 mins</p>
                         </div>
                       </div>
                       <Button size="sm" variant="ghost" className="text-indigo-600 h-8 px-2 text-xs">Watch</Button>
                    </div>
                 </div>

                 <div className="pt-2 border-t border-indigo-100/50">
                    <p className="text-xs text-indigo-900 font-semibold mb-2">Upcoming Support Session</p>
                    <div className="flex justify-between items-center text-sm bg-white/60 p-2 rounded-md">
                       <span className="text-slate-600 font-medium text-xs">Peer Discussion (by Jane A.)</span>
                       <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 h-7 text-xs">Join Queue</Button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-sm">
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