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
import { ChildSelector, type LinkedChild } from '../components/parents/ChildSelector';
import { AccessStatusBanner } from '../components/dashboard/AccessStatusBanner';
import { AcademicTermBanner } from '../components/dashboard/AcademicTermBanner';
import { LearnerKpiRow } from '../components/dashboard/LearnerKpiRow';
import { TodayHero } from '../components/dashboard/TodayHero';

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

  // Selected child — only relevant for parents with multiple linked
  // students. Single-child parents never see the selector but the state
  // still hydrates so we can show their child's name in headers.
  const [selectedChild, setSelectedChild] = useState<LinkedChild | null>(null);

  // Inline reports viewer — honest replacement for the old "download PDF"
  // flow, which fabricated a .pdf file whose bytes were raw JSON. Now we
  // fetch /grading/reports/, render it readably, and let the user use
  // browser Print-to-PDF if they want a file.
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [reports, setReports] = useState<any[] | null>(null);
  const [reportsLoading, setReportsLoading] = useState(false);

  const handleViewFullReport = async () => {
    setIsReportsOpen(true);
    if (reports !== null) return; // already loaded; just re-open
    setReportsLoading(true);
    try {
      const { data, error } = await apiClient.get('/grading/reports/');
      if (error) throw error;
      const rows = Array.isArray(data) ? data : (data as any)?.results || [];
      setReports(rows);
    } catch (err) {
      console.error('Load reports failed', err);
      toast.error('Could not load the latest reports. Please try again shortly.');
      setReports([]);
    } finally {
      setReportsLoading(false);
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
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-indigo-200 drop-shadow-sm">
              {selectedChild?.student_name
                ? `${selectedChild.student_name.split(' ')[0]}'s Confidence Report`
                : 'Parent Confidence Report'}
            </h1>
            <p className="text-blue-100/70 font-medium mt-1">See your child's progress clearly — and know what to do next.</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 transition-all shadow-sm rounded-lg" onClick={() => setIsSettingsOpen(true)}><Settings className="w-4 h-4 mr-2" /> Notification Preferences</Button>
          </div>
        </div>

        <AcademicTermBanner />

        {/* "Today" hero — one priority action based on every linked
            child's state. Overdue work > upcoming class > all clear. */}
        <TodayHero />

        {/* Multi-child selector — renders only when this parent has more than
            one linked child. Replaces the previous one-child-only assumption. */}
        <ChildSelector onChange={setSelectedChild} />

        {/* Account access state — replaces the disclaimer that punted billing
            questions to the school admin office. */}
        <AccessStatusBanner upsellPlan="parent_premium" />

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

        {/* Canonical learner KPI row — same vocabulary, same thresholds,
            same colours as the student's "My Standing This Term" so a
            parent can sanity-check what their child sees. Sourced from
            /analytics/parent-dashboard/.kpis (which already aliases the
            student's underlying numbers). */}
        <div className="space-y-4">
          <LearnerKpiRow kpis={kpis} />
          {/* Existing intelligence cards stay below as supplementary
              alerts — risk callouts, AI suggestions, etc. */}
          {dashboardData.intelligence?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {dashboardData.intelligence.map((card: any, i: number) => (
                <IntelligenceCard key={i} {...card} />
              ))}
            </div>
          )}
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
               <Button variant="outline" size="sm" className="border-indigo-200 text-indigo-700 bg-white/50 hover:bg-indigo-50 shadow-sm transition-all rounded-lg" onClick={handleViewFullReport}><FileText className="w-4 h-4 mr-2"/> View Full Report</Button>
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
                 <Button variant="outline" className="h-16 flex flex-col justify-center items-center gap-1 border-indigo-100 text-indigo-700 hover:border-indigo-300 hover:bg-indigo-50 hover:-translate-y-1 transition-all duration-300 shadow-sm rounded-xl" onClick={handleViewFullReport}>
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
            <CardContent className="pt-4">
              {(kpis?.missedTasks ?? 0) > 0 ? (
                <div className="flex items-start gap-3 pb-3">
                  <div className="bg-red-100 text-red-700 p-2 rounded text-center min-w-[50px]">
                    <p className="text-xs font-bold uppercase">Overdue</p>
                    <p className="text-lg font-bold">{kpis.missedTasks}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {childPerformance?.name || 'Your child'} has {kpis.missedTasks} overdue assignment{kpis.missedTasks === 1 ? '' : 's'}.
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      Open the Full Report below to see exactly what's pending and how scores compare to the class average.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Clock className="w-7 h-7 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-700">Nothing overdue right now.</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upcoming live classes and assignment deadlines will surface here as teachers schedule them.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
          </TabsContent>
        </Tabs>
      </div>
      <ParentSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <WhatsAppCommunicationHub isOpen={isMessageOpen} onClose={() => setIsMessageOpen(false)} />
      <BookMeetingModal isOpen={isBookOpen} onClose={() => setIsBookOpen(false)} />

      {isReportsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsReportsOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {childPerformance?.name ? `${childPerformance.name}'s Full Report` : 'Full Academic Report'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  All graded work your child has completed, most recent first.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="text-slate-700"
                >
                  Print / Save as PDF
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsReportsOpen(false)}
                  className="text-slate-500"
                >
                  Close
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {reportsLoading && (
                <div className="py-10 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-600">Loading reports…</p>
                </div>
              )}

              {!reportsLoading && (reports?.length ?? 0) === 0 && (
                <div className="py-10 text-center">
                  <FileText className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-700 mb-1">No reports yet.</p>
                  <p className="text-xs text-slate-500">
                    Reports appear here once teachers publish grades for completed work.
                  </p>
                </div>
              )}

              {!reportsLoading && (reports?.length ?? 0) > 0 && (
                <div className="space-y-3">
                  {reports!.map((r: any, i: number) => {
                    const title = r.title || r.assessment_title || r.assessment?.title || r.name || 'Graded item';
                    const subject = r.subject_name || r.subject?.name || r.assessment?.subject?.name || '';
                    const score = r.score ?? r.marks ?? r.grade ?? null;
                    const total = r.max_score ?? r.total ?? r.assessment?.max_score ?? null;
                    const dateStr = r.graded_at || r.submitted_at || r.created_at || r.date;
                    const feedback = r.feedback || r.teacher_feedback || '';
                    return (
                      <div key={r.id ?? i} className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
                            {subject && <p className="text-xs text-slate-500">{subject}</p>}
                          </div>
                          {score != null && (
                            <Badge className="bg-indigo-100 text-indigo-800 border-none shrink-0">
                              {score}{total != null ? ` / ${total}` : ''}
                            </Badge>
                          )}
                        </div>
                        {dateStr && (
                          <p className="text-[11px] text-slate-400 mt-1">
                            {new Date(dateStr).toLocaleDateString(undefined, {
                              year: 'numeric', month: 'short', day: 'numeric',
                            })}
                          </p>
                        )}
                        {feedback && (
                          <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                            <span className="font-semibold text-slate-800">Teacher note: </span>{feedback}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <PilotFeedbackButton />
    </div>
  );
};
