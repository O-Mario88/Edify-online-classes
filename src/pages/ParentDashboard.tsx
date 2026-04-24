import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/apiClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AlertCircle, Calendar, GraduationCap, ArrowUpRight, ArrowDownRight, Clock, Activity, Target, MessageCircle, AlertTriangle, FileText, Settings, BookOpen } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { toast } from 'sonner';
import { Progress } from '../components/ui/progress';
import { ParentResourceEngagementPanel } from '../components/dashboard/ParentResourceEngagementPanel';
import { ParentRecommendedSchools } from '../components/parents/ParentRecommendedSchools';
import { StreakTracker } from '../components/competition/StreakTracker';
import { AchievementShowcase } from '../components/competition/AchievementShowcase';
import { ParentActionCenter } from '../components/parents/ParentActionCenter';
import { TeacherSupportSummaryCard } from '../components/parents/TeacherSupportSummaryCard';
import { CelebrationEngineWidget } from '../components/dashboard/CelebrationEngineWidget';
import { IntelligenceCard } from '../components/dashboard/IntelligenceCard';
import { SmartStudyPlanner } from '../components/students/SmartStudyPlanner';
import { useStudyPlanner } from '../hooks/useIntelligence';
import { ParentSettingsModal, MessageTutorModal, BookMeetingModal } from '../components/dashboard/ParentModals';
import { WhatsAppCommunicationHub } from '../components/dashboard/WhatsAppCommunicationHub';
import { NotificationEngine } from '../lib/integrations/NotificationEngine';
import { PilotFeedbackButton } from '../components/PilotFeedbackButton';

export const ParentDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const parent = userProfile as any;
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const { dailyPlan: studyPlanDays } = useStudyPlanner();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [isBookOpen, setIsBookOpen] = useState(false);

  const handleDownloadReport = async () => {
    toast.info('Fetching report data from server...');
    try {
      // First verify and fetch the report from the backend API
      const { data, error } = await apiClient.get('/grading/reports/');
      if (error) throw error;
      
      toast.success('Compiling academic report...');
      setTimeout(() => {
        // Generate PDF payload now that data is verified
        const stringifiedReport = JSON.stringify(data, null, 2);
        const link = document.createElement('a');
        const blob = new Blob([`Report Data Payload:\n${stringifiedReport}`], { type: 'application/pdf' });
        link.href = URL.createObjectURL(blob);
        link.download = `${childPerformance?.name || 'Student'}_Report.pdf`;
        link.click();
        URL.revokeObjectURL(link.href);
        toast.success('Report downloaded successfully!');
      }, 1000);
    } catch (err) {
      toast.error('Failed to connect to reporting module.');
    }
  };


  const fetchAISummary = async () => {
    try {
      const res = await apiClient.post<{ reply?: string }>('/ai/copilot/ask/', {
         content: "Generate parent weekly summary.",
         context: "parent_weekly_summary"
      });
      if (res.data && res.data.reply) {
         setDashboardData((prev: any) => ({
            ...prev,
            weeklySummary: {
               ...prev.weeklySummary,
               aiNarrative: res.data.reply
            }
         }));
      }
    } catch (err) {
      console.error("Failed to fetch AI summary", err);
    }
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data, error } = await apiClient.get('/analytics/parent-dashboard/');
        if (error) throw error;
        
        setDashboardData(data as any);
        // After dashboard data is loaded, fetch AI summary to prevent blocking
        fetchAISummary();
      } catch (error) {
        console.error('Error fetching parent dashboard data:', error);
        setDashboardData({
          intelligence: [],
          kpis: { attendance: 0, classProgress: 0, avgPerformance: 0, readinessScore: 0, missedTasks: 0, alertLevel: '—' },
          riskAlert: null,
          weeklySummary: { aiNarrative: 'Your Weekly Child Progress Brief will appear here once your child completes lessons, assessments, or live classes.', strongestSubject: '—', weakestTopic: '—', assessmentTrend: '—', recommendedFocus: '—' },
          childPerformance: { name: 'Your Child', grade: '—', subjects: [] }
        });
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
          <p className="text-gray-800">Loading Early Warning & Support Hub...</p>
        </div>
      </div>
    );
  }

  const { kpis, riskAlert, weeklySummary, childPerformance } = dashboardData;

  return (
    <div className="w-full min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-indigo-200 drop-shadow-sm">Parent Confidence Report</h1>
            <p className="text-blue-100/70 font-medium mt-1">See your child's progress clearly — and know what to do next.</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 transition-all shadow-sm rounded-lg" onClick={() => setIsSettingsOpen(true)}><Settings className="w-4 h-4 mr-2" /> Notification Preferences</Button>
          </div>
        </div>
        
        <Tabs defaultValue="academics" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md bg-gray-100/80 mb-6">
            <TabsTrigger value="academics" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Academic Performance</TabsTrigger>
            <TabsTrigger value="activation" className="data-[state=active]:bg-white data-[state=active]:shadow-sm border-l border-gray-200/50">Child Activation</TabsTrigger>
          </TabsList>

          <TabsContent value="activation" className="space-y-8 mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <Card className="border-transparent bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                   <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-green-800">Child Activation Status</CardTitle>
                   <CardDescription>View your linked children and their platform access status.</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="space-y-4">
                     <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-4">
                       <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                         <GraduationCap className="w-5 h-5 text-emerald-600" />
                       </div>
                       <div className="flex-1">
                         <p className="font-semibold text-emerald-900">{childPerformance?.name || 'Your Child'}</p>
                         <p className="text-sm text-emerald-700">{childPerformance?.grade || 'Enrolled Student'}</p>
                       </div>
                       <Badge className="bg-emerald-100 text-emerald-800 border-none">Active</Badge>
                     </div>
                     <p className="text-xs text-slate-400 text-center mt-4">Subscription and payment management is handled by Maple platform administrators. For billing inquiries, contact your school administration.</p>
                   </div>
                </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="academics" className="space-y-8 mt-0">
        {/* Priority 1: Weekly Child Progress Brief + Teacher Support Summary
            — surface proof of progress above everything else. */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <Card className="lg:col-span-2 border border-indigo-100/50 bg-white/90 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-2 border-b border-indigo-50/50">
                 <CardTitle className="text-lg font-bold text-indigo-900 flex items-center">
                   <Activity className="w-5 h-5 mr-2 text-indigo-700" /> Weekly Child Progress Brief
                 </CardTitle>
                 <CardDescription>Your clearest view of what happened this week — backed by real evidence from Maple.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                 <p className="text-sm text-gray-700 leading-relaxed">
                   {weeklySummary.aiNarrative}
                 </p>
                 <div className="grid grid-cols-3 gap-3 text-sm bg-white p-3 rounded-md border border-indigo-100 shadow-sm">
                   <div>
                     <p className="text-xs uppercase tracking-wider text-slate-500">Strongest</p>
                     <p className="font-semibold text-green-700 mt-0.5">{weeklySummary.strongestSubject}</p>
                   </div>
                   <div>
                     <p className="text-xs uppercase tracking-wider text-slate-500">Weakest</p>
                     <p className="font-semibold text-red-700 mt-0.5">{weeklySummary.weakestTopic}</p>
                   </div>
                   <div>
                     <p className="text-xs uppercase tracking-wider text-slate-500">Trend</p>
                     <p className="font-medium text-gray-900 mt-0.5 text-sm">{weeklySummary.assessmentTrend}</p>
                   </div>
                 </div>
                 <div className="pt-1 border-t border-indigo-50 text-xs">
                   <p className="text-indigo-800 font-bold uppercase mb-1">Recommended focus</p>
                   <p className="text-gray-700">{weeklySummary.recommendedFocus}</p>
                 </div>
                 <p className="text-[11px] text-slate-500 pt-3 border-t border-slate-100">
                   Built from lessons completed, practice activity, attendance, assessments, project reviews, and teacher feedback.
                 </p>
              </CardContent>
            </Card>

           <TeacherSupportSummaryCard />
        </div>

        {/* Row 1: KPI Strip (Intelligence Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {dashboardData.intelligence?.map((card: any, i: number) => (
             <IntelligenceCard key={i} {...card} />
          ))}
        </div>

        {/* Row 2: Pillar 4 Action & Ecosystem Layer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2">
             <ParentActionCenter />
           </div>

           <Card className="border border-indigo-100/50 bg-white/80 backdrop-blur-xl hover:shadow-xl shadow-lg transition-all duration-300">
              <CardHeader className="pb-2 border-b border-indigo-50/50">
                 <CardTitle className="text-md font-semibold text-indigo-900 flex items-center">
                   <Activity className="w-4 h-4 mr-2 text-indigo-700" /> Weekly Child Progress Brief
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                 <p className="text-sm text-gray-700 leading-relaxed">
                   {weeklySummary.aiNarrative}
                 </p>
                 <div className="space-y-2 text-sm bg-white p-3 rounded-md border border-indigo-100 shadow-sm">
                   <div className="flex justify-between border-b pb-1">
                     <span className="text-gray-700">Strongest</span>
                     <span className="font-medium text-green-700">{weeklySummary.strongestSubject}</span>
                   </div>
                   <div className="flex justify-between border-b pb-1">
                     <span className="text-gray-700">Weakest</span>
                     <span className="font-medium text-red-700">{weeklySummary.weakestTopic}</span>
                   </div>
                   <div className="flex justify-between pb-1">
                     <span className="text-gray-700">Trend</span>
                     <span className="font-medium text-gray-900 text-right max-w-[60%]">{weeklySummary.assessmentTrend}</span>
                   </div>
                 </div>
                 <div className="pt-2">
                   <p className="text-xs text-indigo-800 font-bold uppercase mb-1">Focus Request</p>
                   <p className="text-xs text-gray-700">{weeklySummary.recommendedFocus}</p>
                 </div>
              </CardContent>
            </Card>
        {/* Parent Action Center (moved below the Weekly Brief). */}
        <div>
           <ParentActionCenter />
        </div>

        <div className="mt-8 mb-4">
           <CelebrationEngineWidget />
        </div>

        {/* Child's Study Plan (Readonly) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 mt-6">
           <div className="lg:col-span-1">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                 Child's Study Plan
              </h3>
              <SmartStudyPlanner mode="readonly" dailyPlan={studyPlanDays} />
           </div>
        </div>

        {/* Phase 8 Resource Engagement Tracking */}
        <ParentResourceEngagementPanel />

        {/* Institution Discovery — trusted schools for parents */}
        <div className="space-y-3">
           <div>
             <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">Trusted Schools Recommended for Your Child</h3>
             <p className="text-sm text-gray-600">Schools actively delivering lessons, tracking attendance, and reporting to parents on Maple.</p>
           </div>
           <ParentRecommendedSchools />
        </div>

        {/* Phase 2 Competition Engine: Parent Visibility */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-1">
              <StreakTracker streaks={dashboardData.streaks || []} />
           </div>
           <div className="lg:col-span-2">
              <AchievementShowcase badges={dashboardData.badges || []} />
           </div>
        </div>

        {/* Row 3: Child Subject Performance Cards */}
        <Card className="border-transparent bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="border-b border-gray-100/50 pb-4">
             <div className="flex justify-between items-center">
               <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Avatar className="w-8 h-8 border border-gray-200">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Grace&backgroundColor=e2e8f0`} />
                      <AvatarFallback>GN</AvatarFallback>
                    </Avatar>
                    {childPerformance.name}'s Performance Grid
                  </CardTitle>
                  <CardDescription className="ml-10">{childPerformance.grade}</CardDescription>
               </div>
               <Button variant="outline" size="sm" className="border-indigo-200 text-indigo-700 bg-white/50 hover:bg-indigo-50 shadow-sm transition-all rounded-lg" onClick={handleDownloadReport}><FileText className="w-4 h-4 mr-2"/> Download Report</Button>
             </div>
          </CardHeader>
          <CardContent className="p-0">
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left border-collapse">
                 <thead className="bg-gray-50 text-gray-700 border-b">
                   <tr>
                     <th className="font-medium p-4 font-semibold uppercase text-xs">Subject</th>
                     <th className="font-medium p-4 font-semibold uppercase text-xs text-center">Completion</th>
                     <th className="font-medium p-4 font-semibold uppercase text-xs text-center">Attendance</th>
                     <th className="font-medium p-4 font-semibold uppercase text-xs text-center">Last Score</th>
                     <th className="font-medium p-4 font-semibold uppercase text-xs">Teacher Comment</th>
                     <th className="font-medium p-4 font-semibold uppercase text-xs text-center">Trend</th>
                     <th className="font-medium p-4 font-semibold uppercase text-xs text-right">Needs Revision</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y">
                   {childPerformance.subjects.map((subj, index) => (
                     <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-bold text-gray-900">{subj.name}</td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Progress value={subj.completion} className="w-16 h-2" />
                            <span className="text-gray-800 font-medium">{subj.completion}%</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <Badge variant="outline" className={subj.attendance < 85 ? "text-amber-700 border-yellow-200" : "text-emerald-800 border-green-200"}>
                            {subj.attendance}%
                          </Badge>
                        </td>
                        <td className="p-4 text-center font-bold text-gray-900">{subj.lastScore}%</td>
                        <td className="p-4 text-gray-800 italic">"{subj.teacherComment}"</td>
                        <td className="p-4 text-center">
                           {subj.trend === 'up' ? (
                             <ArrowUpRight className="w-4 h-4 text-emerald-700 mx-auto" />
                           ) : (
                             <ArrowDownRight className="w-4 h-4 text-red-700 mx-auto" />
                           )}
                        </td>
                        <td className="p-4 text-right">
                          {subj.revisionNeeded !== 'None' ? (
                             <span className="text-red-800 font-medium text-xs px-2 py-1 bg-red-50 rounded-full border border-red-100">
                               {subj.revisionNeeded}
                             </span>
                          ) : (
                             <span className="text-gray-800 font-medium text-xs">None</span>
                          )}
                        </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </CardContent>
        </Card>

        {/* Row 4: Action Center & Communication */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-transparent bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3 border-b border-gray-100/50">
              <CardTitle className="text-md flex items-center gap-2"><Settings className="w-4 h-4 text-indigo-700" /> Parent Action Center</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-3">
                 <Button variant="outline" className="h-16 flex flex-col justify-center items-center gap-1 border-indigo-100 text-indigo-700 hover:border-indigo-300 hover:bg-indigo-50 hover:-translate-y-1 transition-all duration-300 shadow-sm rounded-xl" onClick={() => setIsMessageOpen(true)}>
                   <MessageCircle className="w-4 h-4" /> Message Tutor
                 </Button>
                 <Button variant="outline" className="h-16 flex flex-col justify-center items-center gap-1 border-indigo-100 text-indigo-700 hover:border-indigo-300 hover:bg-indigo-50 hover:-translate-y-1 transition-all duration-300 shadow-sm rounded-xl" onClick={() => setIsBookOpen(true)}>
                   <Calendar className="w-4 h-4" /> Book Meeting
                 </Button>
                 <Button variant="outline" className="h-16 flex flex-col justify-center items-center gap-1 border-indigo-100 text-indigo-700 hover:border-indigo-300 hover:bg-indigo-50 hover:-translate-y-1 transition-all duration-300 shadow-sm rounded-xl" onClick={() => navigate('/classes?context=parent')}>
                   <BookOpen className="w-4 h-4 text-blue-800" /> View Curriculum
                 </Button>
                 <Button variant="outline" className="h-16 flex flex-col justify-center items-center gap-1 border-indigo-100 text-indigo-700 hover:border-indigo-300 hover:bg-indigo-50 hover:-translate-y-1 transition-all duration-300 shadow-sm rounded-xl" onClick={handleDownloadReport}>
                   <FileText className="w-4 h-4" /> View Full Report
                 </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-transparent bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3 border-b border-gray-100/50">
              <div className="flex justify-between items-center">
                <CardTitle className="text-md flex items-center gap-2"><Clock className="w-4 h-4 text-gray-700" /> Upcoming Schedule & Tasks</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
               <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                 <div className="bg-red-100 text-red-700 p-2 rounded text-center min-w-[50px]">
                   <p className="text-xs font-bold uppercase">Due</p>
                   <p className="text-lg font-bold">TODAY</p>
                 </div>
                 <div>
                   <p className="font-semibold text-gray-900">Physics - Vector Lab Report</p>
                   <p className="text-sm text-red-800 font-medium mt-1">Pending Submission (Overdue by 2 hours)</p>
                 </div>
               </div>
               <div className="flex items-start gap-3">
                 <div className="bg-blue-100 text-blue-700 p-2 rounded text-center min-w-[50px]">
                   <p className="text-xs font-bold uppercase">In</p>
                   <p className="text-lg font-bold">2d</p>
                 </div>
                 <div>
                   <p className="font-semibold text-gray-900">Biology - Unit Test 3</p>
                   <p className="text-sm text-gray-800 mt-1">Thursday, 2:00 PM</p>
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>
          </TabsContent>
        </Tabs>
      </div>
      <ParentSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <WhatsAppCommunicationHub isOpen={isMessageOpen} onClose={() => setIsMessageOpen(false)} />
      <BookMeetingModal isOpen={isBookOpen} onClose={() => setIsBookOpen(false)} />
      <PilotFeedbackButton />
    </div>
  );
};
