import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { apiClient } from '../lib/apiClient';
import { IntelligenceCard } from '../components/dashboard/IntelligenceCard';
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton';
import { CareerGuidanceWidget } from '../components/dashboard/CareerGuidanceWidget';
import { StudentResourceEngagementPanel } from '../components/dashboard/StudentResourceEngagementPanel';
import { AskStandbyTeacherCard } from '../components/standby/AskStandbyTeacherCard';
import { StudentAssignmentsPanel } from '../components/students/StudentAssignmentsPanel';
import { PilotFeedbackButton } from '../components/PilotFeedbackButton';
import { StudentActionCenter } from '../components/dashboard/StudentActionCenter';
import { StudentPlatformLaunchpad } from '../components/dashboard/StudentPlatformLaunchpad';
import { StudentMotivationEngine } from '../components/dashboard/StudentMotivationEngine';

import { DashboardGrid } from '../components/dashboard/layout/DashboardGrid';
import { DashboardSection } from '../components/dashboard/layout/DashboardSection';
import { DashboardCard } from '../components/dashboard/layout/DashboardCard';
import { toast } from 'sonner';
import { StudentScheduleModal, OverdueTasksModal } from '../components/dashboard/StudentModals';
import { contentApi } from '../lib/contentApi';


export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  
  // Modal states
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isOverdueOpen, setIsOverdueOpen] = useState(false);
  
  // Action states
  const [challengeEnrolled, setChallengeEnrolled] = useState(false);
  const [tutorRequested, setTutorRequested] = useState(false);

  const student = user as any;

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await apiClient.get('/analytics/student-dashboard/');
        if (response.data) {
          setDashboardData(response.data);
        } else {
          console.error('Student dashboard API returned empty:', response.error);
          setDashboardData(getEmptyDashboardData());
        }
      } catch (error) {
        console.error('Error fetching student dashboard data:', error);
        setDashboardData(getEmptyDashboardData());
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const getEmptyDashboardData = () => ({
    kpis: { overallProgress: 0, progressTrend: '0', attendance: 0, attendanceTrend: '0', assessmentsCompleted: 0, readinessScore: 0, overdueTasks: 0, liveSessionsAttended: 0 },
    subjectPerformance: [],
    nextSession: { subject: '—', topic: 'No upcoming sessions', tutor: '—', time: '—', countdown: '—', streak: 0, readinessState: '—' },
    intelligence: [],
    assessmentSnapshot: []
  });


  if (loading || !dashboardData) {
    return <DashboardSkeleton type="student" />;
  }

  const { kpis, subjectPerformance, assessmentSnapshot } = dashboardData;

  const nextSession = dashboardData.nextSession || {};

  const handleResumeLearning = async () => {
    try {
      const db = await contentApi.dashboard.student();
      if (db && db.continue_learning && db.continue_learning.length > 0) {
        const target = db.continue_learning[0];
        toast.success(`Resuming ${target.topic_name || target.title}...`);
        // ContinueLearningItem doesn't carry class/subject/topic IDs, so the
        // Academic Library is the most faithful landing place for now. Adding
        // those IDs to the API response would let us deep-link further.
        navigate('/library');
      } else {
        toast.info('No active lesson found. Taking you to classes.');
        navigate('/classes');
      }
    } catch (e) {
      toast.info('Could not find active learning session. Routing to curriculum directory.');
      navigate('/classes');
    }
  };

  const handleJoinMeeting = () => {
    if (nextSession.meetLink) {
      toast.success('Opening secure live session room...');
      window.open(nextSession.meetLink, '_blank');
    } else {
      toast.info('Navigating to internal live room...');
      navigate('/live-sessions');
    }
  };

  const handleEnrollChallenge = async () => {
    setChallengeEnrolled(true);
    await apiClient.post('/analytics/student/enroll-challenge', { challengeId: 'physics-5' }).catch(() => {});
    toast.success('Challenge started! Monitor your progress in the Action Center.');
  };

  const handleRequestTutor = async () => {
    setTutorRequested(true);
    await apiClient.post('/analytics/student/request-tutor', { topicId: 'calc-limits-1' }).catch(() => {});
    toast.success('Tutor intervention request securely submitted. You will be matched within 24hrs.');
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Signature Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-6 border-b border-slate-200/50">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
               <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Learning Command Center</h1>
               <Badge className="bg-emerald-100/50 text-emerald-700 hover:bg-emerald-100/80 border-emerald-200">Active Term</Badge>
            </div>
            <p className="text-slate-700 font-medium text-sm md:text-base">Welcome back, {student?.name?.split(' ')[0] || 'Learner'}. Here is your real-time diagnostic overview.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
             <Button variant="outline" className="hidden md:flex shadow-sm bg-white/50 backdrop-blur-sm" onClick={() => setIsScheduleOpen(true)}><Calendar className="w-4 h-4 mr-2 text-slate-700" /> View Schedule</Button>
             <Button size="lg" className="w-full md:w-auto shadow-sm shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold tracking-wide" onClick={handleResumeLearning}>
               <BookOpen className="w-4 h-4 mr-2" /> Resume Learning
             </Button>
          </div>
        </div>

        {/* Row 1: KPI Strip (Intelligence Cards) */}
        <DashboardSection>
           <DashboardGrid>
             {dashboardData.intelligence?.map((card: any, i: number) => (
                <DashboardCard key={i} colSpan={1} mdColSpan={3} lgColSpan={3} variant="transparent">
                   <IntelligenceCard {...card} />
                </DashboardCard>
             ))}
           </DashboardGrid>
        </DashboardSection>

        {/* Phase 8 Resource Engagement */}
        <DashboardSection>
           <StudentResourceEngagementPanel />
        </DashboardSection>

        {/* Standby Teacher Network — real teachers on call */}
        <DashboardSection title="Real Teachers, On Call">
           <AskStandbyTeacherCard />
        </DashboardSection>

        {/* Phase 4.3 — assignments + grades */}
        <DashboardSection title="My assignments">
           <StudentAssignmentsPanel />
        </DashboardSection>

        {/* Global Action Center - Surfacing critical pending tasks & collaborative duties */}
        <DashboardSection title="Action Center">
           <StudentActionCenter />
        </DashboardSection>

        {/* Row 2: Live Session + Risk + AI Guide */}
        <DashboardSection title="Current Priorities">
           <DashboardGrid className="!items-stretch">
             {/* Next Live Session Upgrade (Hero Aesthetic) */}
             <DashboardCard colSpan={1} mdColSpan={12} lgColSpan={5} variant="transparent">
               <Card className="h-full border-none shadow-xl shadow-blue-900/10 bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 relative overflow-hidden flex flex-col justify-between hover:shadow-2xl hover:shadow-blue-900/20 hover:-translate-y-1 transition-all text-white">
                 {/* Abstract background shapes for premium feel */}
                 <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                 <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-xl pointer-events-none"></div>
                 
                 <CardHeader className="pb-3 relative z-10">
                   <CardTitle className="text-[10px] font-bold text-blue-100 flex justify-between uppercase tracking-wider items-center gap-2">
                      <span className="truncate">Next Live Session</span>
                      <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-md border-white/10 hover:bg-white/30 whitespace-nowrap">
                        <Flame className="w-3 h-3 text-orange-300 mr-1.5 flex-shrink-0" /> {nextSession.streak} Streak
                      </Badge>
                   </CardTitle>
                   <h3 className="text-xl md:text-2xl font-black mt-3 tracking-tight leading-tight line-clamp-3 break-words" title={`${nextSession.subject}: ${nextSession.topic}`}>{nextSession.subject}: {nextSession.topic}</h3>
                 </CardHeader>
                 <CardContent className="relative z-10 pt-2 flex flex-col flex-1">
                   <div className="flex justify-between items-end mb-6">
                     <div className="space-y-2.5">
                       <p className="text-sm font-semibold text-blue-50 flex items-center bg-white/10 backdrop-blur-md w-max px-2.5 py-1.5 rounded-md border border-white/10 shadow-sm"><Clock className="w-4 h-4 mr-2 opacity-70" /> {nextSession.time}</p>
                       <p className="text-sm font-semibold text-blue-50 flex items-center bg-white/10 backdrop-blur-md w-max px-2.5 py-1.5 rounded-md border border-white/10 shadow-sm"><User className="w-4 h-4 mr-2 opacity-70" /> {nextSession.tutor}</p>
                     </div>
                     <div className="text-right bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/20 shadow-inner">
                        <p className="text-[10px] uppercase font-bold text-blue-200 mb-1 tracking-wider">Starts in</p>
                        <p className="text-3xl font-black text-white leading-none tracking-tighter">{nextSession.countdown}</p>
                     </div>
                   </div>
                   <div className="space-y-4 pt-5 border-t border-white/10 mt-auto">
                     <div className="flex items-center justify-between text-sm">
                       <span className="font-semibold text-blue-100">Join Readiness</span>
                       <Badge className="text-emerald-900 bg-emerald-400 border-none font-bold hover:bg-emerald-300 shadow-sm">{nextSession.readinessState || 'Prepared'}</Badge>
                     </div>
                     <Button className="w-full bg-white text-indigo-700 hover:bg-blue-50 font-extrabold tracking-wide shadow-md hover:shadow-lg transition-all h-11" onClick={handleJoinMeeting}><Play className="w-4 h-4 mr-2" /> Join Meeting</Button>
                   </div>
                 </CardContent>
               </Card>
             </DashboardCard>
             
             {/* At Risk Card */}
             <DashboardCard colSpan={1} mdColSpan={6} lgColSpan={3} variant="transparent" orientation="vertical">
               <Card className="h-full border border-rose-200/50 shadow-md shadow-rose-900/5 bg-white flex flex-col hover:shadow-xl hover:shadow-rose-900/10 hover:-translate-y-1 transition-all overflow-hidden relative group">
                 <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                 <CardHeader className="pb-3 mb-4 bg-gradient-to-b from-rose-50/50 to-white">
                   <CardTitle className="text-xs font-bold text-rose-600 flex items-center uppercase tracking-wider">
                     <AlertTriangle className="w-4 h-4 mr-2 text-rose-500" /> Attention Required
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="flex flex-col flex-1">
                   <div className="space-y-5 flex-1 flex flex-col">
                      <div className="bg-rose-50/80 border border-rose-100 rounded-xl p-3.5 shadow-sm group-hover:bg-rose-50 transition-colors">
                         <p className="text-sm font-semibold text-rose-900 leading-snug">
                           Physics attendance dropped below school average (60%).
                         </p>
                      </div>
                      <div className="text-sm space-y-3 flex-1 overflow-hidden">
                        <div className="flex justify-between items-center bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 shadow-sm gap-2">
                          <span className="text-slate-700 font-semibold text-[10px] md:text-xs uppercase tracking-wider whitespace-nowrap">Topics slipping</span>
                          <span className="font-bold text-slate-800 line-clamp-1 break-all text-right" title="Advanced Sub-atomic Thermodynamics">Advanced Sub-atomic Thermodynamics</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 shadow-sm gap-2">
                          <span className="text-slate-700 font-semibold text-xs uppercase tracking-wider">Missed assignments</span>
                          <Badge variant="outline" className="text-rose-700 bg-rose-50 border-rose-200/60 font-bold shadow-sm">2 pending</Badge>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-slate-100 mt-auto">
                        <p className="text-[10px] uppercase font-bold text-slate-800 mb-2.5 tracking-wider">Next best action</p>
                        <Button variant="outline" className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 font-bold shadow-sm h-10 transition-colors" onClick={() => setIsOverdueOpen(true)}>Review Overdue Tasks</Button>
                      </div>
                   </div>
                 </CardContent>
               </Card>
             </DashboardCard>

              {/* 7-Day Activity Trend (moved up to fill space) */}
              <DashboardCard colSpan={1} mdColSpan={6} lgColSpan={4} variant="transparent">
                <Card className="shadow-sm h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-md flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-400" /> 7-Day Activity Trend</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-center">
                     <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                         <p className="text-xs text-slate-800 uppercase tracking-wider font-semibold mb-1.5">Lessons Completed</p>
                         <div className="flex items-end gap-2">
                           <span className="text-2xl font-bold text-white tracking-widest">{dashboardData.telemetry?.lessonsCompleted || 12}</span>
                           <span className="text-xs text-emerald-400 flex items-center pb-1 font-semibold"><TrendingUp className="w-3 h-3 mr-1" /> +{(dashboardData.telemetry?.lessonsCompleted || 12) - 9}</span>
                         </div>
                       </div>
                       <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                         <p className="text-xs text-slate-800 uppercase tracking-wider font-semibold mb-1.5">Forum Posts</p>
                         <div className="flex items-end gap-2">
                           <span className="text-2xl font-bold text-white tracking-widest">{dashboardData.telemetry?.forumPosts || 4}</span>
                           <span className="text-xs text-rose-400 flex items-center pb-1 font-semibold"><TrendingDown className="w-3 h-3 mr-1" /> -2</span>
                         </div>
                       </div>
                       <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                         <p className="text-xs text-slate-800 uppercase tracking-wider font-semibold mb-1.5">Resources Opened</p>
                         <div className="flex items-end gap-2">
                           <span className="text-2xl font-bold text-white tracking-widest">{dashboardData.telemetry?.resourcesOpened || 8}</span>
                           <span className="text-xs text-emerald-400 flex items-center pb-1 font-semibold"><TrendingUp className="w-3 h-3 mr-1" /> +1</span>
                         </div>
                       </div>
                       <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                         <p className="text-xs text-slate-800 uppercase tracking-wider font-semibold mb-1.5">Avg Session</p>
                         <div className="flex items-end gap-2">
                           <span className="text-2xl font-bold text-white tracking-widest">{dashboardData.telemetry?.avgSessionMins || 24}m</span>
                           <span className="text-xs text-emerald-400 flex items-center pb-1 font-semibold"><TrendingUp className="w-3 h-3 mr-1" /> +5m</span>
                         </div>
                       </div>
                     </div>
                  </CardContent>
                </Card>
              </DashboardCard>
           </DashboardGrid>
        </DashboardSection>

        {/* Row 3: Automated Resource Recommendations */}
        <DashboardSection title="Resource Recommendations">
           <DashboardGrid className="!items-stretch">

              {/* ----------------- RESOURCE RECOMMENDATIONS ROW (4 + 4 + 4 = 12 cols) ----------------- */}
              
              {/* Card 1: Performed Well (Enrichment) */}
              <DashboardCard colSpan={1} mdColSpan={6} lgColSpan={4} variant="transparent">
                <Card className="border border-emerald-500/20 bg-emerald-500/5 shadow-xl relative overflow-hidden flex flex-col h-full group hover:-translate-y-1 transition-transform">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 rounded-l-2xl"></div>
                  <CardHeader className="pb-3 border-b border-white/10 mb-3 bg-gradient-to-b from-emerald-500/10 to-transparent">
                     <CardTitle className="text-xs font-bold text-emerald-300 flex items-center uppercase tracking-wider">
                       <CheckCircle className="w-4 h-4 mr-2 text-emerald-400" /> Mastery Enrichment
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1">
                     <div className="space-y-4 flex flex-col flex-1">
                       <div>
                         <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Based on 95% in Biology</p>
                         <h4 className="text-lg font-extrabold text-white tracking-tight leading-tight">Advanced Genetics Simulation</h4>
                       </div>
                       
                       <div className="space-y-2.5 flex-1">
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-emerald-500/10 transition-colors cursor-pointer group/item">
                             <div className="flex items-center gap-3">
                               <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg"><Activity className="w-4 h-4" /></div>
                               <div>
                                  <p className="text-sm font-bold text-slate-100 line-clamp-1">Interactive DNA Mapping</p>
                                  <p className="text-[11px] font-medium text-slate-800">Virtual Lab • 25 mins</p>
                               </div>
                             </div>
                             <Button size="sm" variant="ghost" className="text-emerald-300 opacity-0 group-hover/item:opacity-100 transition-opacity"><Play className="w-4 h-4"/></Button>
                          </div>
                       </div>

                       <div className="pt-3 border-t border-white/10 mt-auto">
                          <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold" onClick={handleEnrollChallenge} disabled={challengeEnrolled}>
                            {challengeEnrolled ? 'Enrolled' : 'Start Challenge'}
                          </Button>
                       </div>
                     </div>
                  </CardContent>
                </Card>
              </DashboardCard>

              {/* Card 2: Warning Level (Concept Reinforcement) */}
              <DashboardCard colSpan={1} mdColSpan={6} lgColSpan={4} variant="transparent">
                <Card className="border border-amber-500/20 bg-amber-500/5 shadow-xl relative overflow-hidden flex flex-col h-full group hover:-translate-y-1 transition-transform">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500 rounded-l-2xl"></div>
                  <CardHeader className="pb-3 border-b border-white/10 mb-3 bg-gradient-to-b from-amber-500/10 to-transparent">
                     <CardTitle className="text-xs font-bold text-amber-300 flex items-center uppercase tracking-wider">
                       <BarChart3 className="w-4 h-4 mr-2 text-amber-400" /> Concept Reinforcement
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1">
                     <div className="space-y-4 flex flex-col flex-1">
                       <div>
                         <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1">Based on 65% in Chemistry</p>
                         <h4 className="text-lg font-extrabold text-white tracking-tight leading-tight">Hydrocarbons & Reactivity</h4>
                       </div>
                       
                       <div className="space-y-2.5 flex-1">
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-amber-500/10 transition-colors cursor-pointer group/item">
                             <div className="flex items-center gap-3">
                               <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><Video className="w-4 h-4" /></div>
                               <div>
                                  <p className="text-sm font-bold text-slate-100 line-clamp-1">Alkanes vs Alkenes</p>
                                  <p className="text-[11px] font-medium text-slate-800">Video Guide • 14 mins</p>
                               </div>
                             </div>
                             <Button size="sm" variant="ghost" className="text-blue-300 opacity-0 group-hover/item:opacity-100 transition-opacity"><Play className="w-4 h-4"/></Button>
                          </div>
                          
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-amber-500/10 transition-colors cursor-pointer group/item">
                             <div className="flex items-center gap-3">
                               <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg"><FileText className="w-4 h-4" /></div>
                               <div>
                                  <p className="text-sm font-bold text-slate-100 line-clamp-1">Reactivity Practice Set</p>
                                  <p className="text-[11px] font-medium text-slate-800">Quiz • 10 Questions</p>
                               </div>
                             </div>
                             <Button size="sm" variant="ghost" className="text-purple-300 opacity-0 group-hover/item:opacity-100 transition-opacity"><Play className="w-4 h-4"/></Button>
                          </div>
                       </div>
                       
                       <div className="pt-3 border-t border-white/10 mt-auto">
                          <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-500 font-bold" onClick={() => navigate('/classes/c1/t1/chemistry_s3/topic/hydrocarbons_1')}>Resume Study Module</Button>
                       </div>
                     </div>
                  </CardContent>
                </Card>
              </DashboardCard>

              {/* Card 3: Danger Zone (Critical Intervention) */}
              <DashboardCard colSpan={1} mdColSpan={12} lgColSpan={4} variant="transparent">
                <Card className="border border-rose-500/20 bg-rose-500/5 shadow-xl relative overflow-hidden flex flex-col h-full group hover:-translate-y-1 transition-transform">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500 rounded-l-2xl"></div>
                  <CardHeader className="pb-3 border-b border-white/10 mb-3 bg-gradient-to-b from-rose-500/10 to-transparent">
                     <CardTitle className="text-xs font-bold text-rose-300 flex items-center uppercase tracking-wider">
                       <Brain className="w-4 h-4 mr-2 text-rose-400" /> Critical Intervention
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1">
                     <div className="space-y-4 flex flex-col flex-1">
                       <div>
                         <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-1">Based on Kinematics Quiz Failure</p>
                         <h4 className="text-lg font-extrabold text-white tracking-tight leading-tight">Calculus: Limits & Continuity</h4>
                       </div>
                       
                       <div className="space-y-2.5 flex-1">
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-rose-500/10 transition-colors cursor-pointer group/item">
                             <div className="flex items-center gap-3">
                               <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg"><FileText className="w-4 h-4" /></div>
                               <div>
                                  <p className="text-sm font-bold text-slate-100 line-clamp-1">Guided Recovery Sheet</p>
                                  <p className="text-[11px] font-medium text-slate-800">PDF • Required</p>
                               </div>
                             </div>
                             <Button size="sm" variant="ghost" className="text-rose-300 opacity-0 group-hover/item:opacity-100 transition-opacity">PDF</Button>
                          </div>

                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-rose-500/10 transition-colors cursor-pointer group/item">
                             <div className="flex items-center gap-3">
                               <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg"><Users className="w-4 h-4" /></div>
                               <div>
                                  <p className="text-sm font-bold text-slate-100 line-clamp-1">Peer Discussion (Jane)</p>
                                  <p className="text-[11px] font-medium text-slate-800">Scheduled • 4:00 PM</p>
                               </div>
                             </div>
                             <Button size="sm" variant="ghost" className="text-indigo-300 opacity-0 group-hover/item:opacity-100 transition-opacity">Join</Button>
                          </div>
                       </div>

                       <div className="pt-3 border-t border-white/10 mt-auto">
                          <Button size="sm" className="w-full bg-rose-600 hover:bg-rose-500 font-bold" onClick={handleRequestTutor} disabled={tutorRequested}>
                            {tutorRequested ? 'Tutor Requested' : 'Request Tutor Intervention'}
                          </Button>
                       </div>
                     </div>
                  </CardContent>
                </Card>
              </DashboardCard>
            </DashboardGrid>
         </DashboardSection>

         {/* Row 4: Motivation Engine */}
         <DashboardSection title="Trajectory & Velocity">
            <StudentMotivationEngine />
         </DashboardSection>

         {/* Row 5: Career Engine Injection */}
         <DashboardSection>
            <CareerGuidanceWidget />
         </DashboardSection>

         {/* Row 4: Subject Performance Grid */}
         <DashboardSection title="Academic Diagnostic">
            <DashboardGrid>
              <DashboardCard colSpan={1} mdColSpan={12} lgColSpan={12} variant="transparent">
                <Card className="shadow-sm">
                  <CardHeader className="border-b border-white/10 pb-4">
                     <CardTitle className="text-lg text-white">Subject Performance Grid</CardTitle>
                     <CardDescription className="text-slate-800">Comprehensive diagnostic of your current academic standing</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                     <div className="overflow-x-auto">
                       <table className="w-full text-sm text-left border-collapse">
                         <thead>
                           <tr>
                             <th className="font-semibold p-4 uppercase text-xs text-slate-800">Subject</th>
                             <th className="font-semibold p-4 uppercase text-xs text-center text-slate-800">Completion</th>
                             <th className="font-semibold p-4 uppercase text-xs text-center text-slate-800">Avg Score</th>
                             <th className="font-semibold p-4 uppercase text-xs text-center text-slate-800">Weak Topics</th>
                             <th className="font-semibold p-4 uppercase text-xs text-center text-slate-800">Confidence</th>
                             <th className="font-semibold p-4 uppercase text-xs text-right text-slate-800">Last Activity</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-white/5">
                           {subjectPerformance.map((subj, index) => (
                             <tr key={index} className="hover:bg-white/5 transition-colors">
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${subj.readinessColor}`}></div>
                                    <span className="font-bold text-white">{subj.subject}</span>
                                  </div>
                                </td>
                                <td className="p-4 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <Progress value={subj.completion} className="w-16 h-2" />
                                    <span className="text-slate-300 font-medium">{subj.completion}%</span>
                                  </div>
                                </td>
                                <td className="p-4 text-center">
                                  <Badge variant="outline" className={`border-white/20 ${subj.avgScore < 60 ? "text-rose-400 border-rose-500/30" : "text-emerald-400 border-emerald-500/30"}`}>
                                    {subj.avgScore}%
                                  </Badge>
                                </td>
                                <td className="p-4 text-center">
                                  {subj.weakTopics > 0 ? (
                                    <span className="text-rose-400 font-bold flex items-center justify-center gap-1">
                                      {subj.weakTopics} <AlertTriangle className="w-3 h-3" />
                                    </span>
                                  ) : (
                                    <span className="text-emerald-400 font-bold"><CheckCircle className="w-4 h-4 mx-auto" /></span>
                                  )}
                                </td>
                                <td className="p-4 text-center">
                                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                                    subj.confidence === 'High' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                    subj.confidence === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  }`}>
                                    {subj.confidence}
                                  </span>
                                </td>
                                <td className="p-4 text-right text-slate-800 font-medium whitespace-nowrap">
                                  {subj.lastActivity}
                                </td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                     </div>
                  </CardContent>
                </Card>
              </DashboardCard>
            </DashboardGrid>
         </DashboardSection>

         {/* Row 5: Assessment Snapshot (only show if there's data) */}
         {assessmentSnapshot && assessmentSnapshot.length > 0 && (
           <DashboardSection>
              <DashboardGrid>
                <DashboardCard colSpan={1} mdColSpan={12} lgColSpan={12} variant="transparent">
                  <Card className="shadow-sm flex flex-col h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-md flex items-center gap-2"><BarChart3 className="w-4 h-4 text-blue-400" /> Assessment Snapshot</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {assessmentSnapshot.map((assessment, i) => (
                          <div key={i} className="flex flex-col gap-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium text-slate-200">{assessment.name}</span>
                              <span className={assessment.scored < assessment.average ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                                {assessment.scored}%
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Progress value={assessment.scored} className="h-2 flex-1" />
                              <span className="text-xs text-slate-800 w-24 text-right">Class Avg: {assessment.average}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </DashboardCard>
              </DashboardGrid>
           </DashboardSection>
         )}

         {/* Row 6: Deep Ecosystem Navigation (Platform Launchpad) */}
         <DashboardSection title="Learning Ecosystem Hubs">
            <StudentPlatformLaunchpad />
         </DashboardSection>

      </div>
      <StudentScheduleModal isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} />
      <OverdueTasksModal isOpen={isOverdueOpen} onClose={() => setIsOverdueOpen(false)} />
      <PilotFeedbackButton />
    </div>
  );
};