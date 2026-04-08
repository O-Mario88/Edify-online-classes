import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  School, Users, DollarSign, TrendingUp, BookOpen, 
  UserCheck, AlertTriangle, Activity, MapPin, 
  CheckCircle, Briefcase, Calendar, ShieldAlert, Settings2, Download, BellRing, TrendingDown, ArrowRight, ShieldCheck, UserX, Clock, Upload, CreditCard
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { BulkInviteModal } from '@/components/dashboard/BulkInviteModal';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { TeacherRedAlertsPanel } from '../components/dashboard/TeacherRedAlertsPanel';
import { PremiumEmptyState } from '../components/ui/PremiumEmptyState';
import { PremiumLockState } from '../components/ui/PremiumLockState';
import { InstitutionIntelligenceHub } from '../components/dashboard/InstitutionIntelligenceHub';
import { PastoralTimeline } from '../components/pastoral/PastoralTimeline';
import { TeacherAssignmentManager } from '../components/dashboard/TeacherAssignmentManager';
import { InstitutionBillingPortal } from '../components/institutions/InstitutionBillingPortal';
import { StudentOnboardingForm } from '../components/institutions/StudentOnboardingForm';
import { IntelligenceCard } from '../components/dashboard/IntelligenceCard';
import { ActiveChallengeCard } from '../components/competition/ActiveChallengeCard';
import { HouseStandingsCard } from '../components/competition/HouseStandingsCard';
import { SchoolHealthScore } from '../components/institutions/SchoolHealthScore';
import { ExamWarRoomMode } from '../components/institutions/ExamWarRoomMode';
import { AIAdminReportAssistant } from '../components/institutions/AIAdminReportAssistant';
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton';
import { ResourceUploadModal } from '../components/academic/ResourceUploadModal';

export const InstitutionManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [showOnboardingForm, setShowOnboardingForm] = useState(false);
  const [isLibraryUploadOpen, setIsLibraryUploadOpen] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data, error: apiError } = await apiClient.get('/analytics/institution-dashboard/');
        if (apiError || !data) {
          throw new Error(apiError?.message || 'Data payload was empty from API');
        }
        setDashboardData(data);
        setError(null);
      } catch (error: any) {
        console.error('Error fetching dashboard data, falling back to mock data:', error);
        setDashboardData({
          intelligence: [
            {
              title: 'Subject Decline',
              value: 'Mathematics',
              trendValue: 12,
              trendLabel: 'avg score drop',
              trendDirection: 'down',
              riskLevel: 'critical',
              alertText: 'S3 East failing heavily',
              actionLabel: 'Review teacher',
              actionLink: '/dashboard/institution/staff',
              drillDownText: 'View performance maps',
              drillDownLink: '/dashboard/institution/academics'
            },
            {
              title: 'Timetable Risks',
              value: '3 Classes',
              trendValue: 3,
              trendLabel: 'new uncovered',
              trendDirection: 'up',
              trendIsGood: false,
              riskLevel: 'warning',
              alertText: 'Uncovered sessions tomorrow',
              actionLabel: 'Assign cover',
              actionLink: '/dashboard/institution/timetable',
              drillDownText: 'View schedule',
              drillDownLink: '/dashboard/institution/timetable'
            },
            {
              title: 'Attendance Drop',
              value: 'S3 East',
              trendValue: 18,
              trendLabel: 'weekly drop',
              trendDirection: 'down',
              riskLevel: 'critical',
              alertText: 'Collapsed below 70%',
              actionLabel: 'Trigger pastoral',
              actionLink: '/dashboard/institution/pastoral'
            },
            {
              title: 'Finance Locks',
              value: '18 Students',
              trendValue: 5,
              trendLabel: 'cleared this week',
              trendDirection: 'down',
              trendIsGood: true,
              riskLevel: 'warning',
              alertText: 'Nearing lockout threshold',
              actionLabel: 'Message parents',
              actionLink: '/dashboard/institution/finance',
              drillDownText: 'View debtors',
              drillDownLink: '/dashboard/institution/finance'
            },
            {
              title: 'Action List',
              value: '2 Critical',
              trendValue: 1,
              trendLabel: 'new incident',
              trendDirection: 'up',
              trendIsGood: false,
              riskLevel: 'critical',
              alertText: 'Behavior incidents logged',
              actionLabel: 'Review cases',
              actionLink: '/dashboard/institution/pastoral'
            }
          ],
          kpis: {
            totalStudents: 1240,
            totalTeachers: 45,
            activeClasses: 18,
            attendanceToday: 89,
            avgPerformance: 68,
            riskAlerts: 4
          },
          academicPerformance: {},
          financialMetrics: {},
          activationStatus: 'active',
          unpaidSeats: 18,
          complianceTracking: { syllabusCoveragePct: 65, assessmentCompliance: 80, practicalLearning: 40 }
        });
        setError(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <DashboardSkeleton type="institution" />;
  }

  if (error || !dashboardData) {
     return (
      <div className="w-full bg-transparent p-6 md:p-8 space-y-6">
        <div className="text-center bg-red-50 p-8 rounded-lg max-w-md border border-red-200">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-red-900 mb-2">Dashboard Error</h2>
          <p className="text-red-700">{error || 'Data payload was empty'}</p>
          <Button className="mt-6" variant="outline" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
     )
  }

  const { kpis, academicPerformance, financialMetrics, activationStatus, unpaidSeats } = dashboardData;
  const isSetup = activationStatus === 'setup';

  return (
    <div className="w-full bg-transparent">
      <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <School className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kampala Model High School</h1>
            <p className="text-gray-600 font-medium">Institution Analytics & Management Hub</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 shadow-sm py-1.5 px-3">
             <MapPin className="w-3 h-3 mr-1"/> Kampala, Central Region
           </Badge>
           <Button className="shadow-sm"><DollarSign className="w-4 h-4 mr-2" /> Billing Portal</Button>
        </div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow-sm text-yellow-800 text-sm">
        <strong className="font-bold flex items-center"><ShieldAlert className="w-4 h-4 mr-2"/> Privacy Bound Scope Active.</strong> 
        All analytics displayed on this dashboard represent ONLY Kampala Model High School learners, teachers, and financial transactions.
      </div>

      {isSetup && (
        <InstitutionBillingPortal 
           activeStudents={kpis.totalStudents} 
           unpaidSeats={unpaidSeats} 
        />
      )}

      {/* Phase 1: Pillar 1 - School Health Score */}
      <SchoolHealthScore metrics={{
        attendance: 92,
        academicPerformance: 68,
        teacherPunctuality: 85,
        behavior: 95,
        parentEngagement: 42,
        financeHealth: 78,
        interventionCompletion: 55
      }} />

      {/* Row 1: KPI Strip (Intelligence Cards) */}
      <div className="flex flex-wrap gap-4">
        {dashboardData.intelligence?.map((card: any, i: number) => (
           <div key={i} className="flex-[1_1_200px] flex flex-col">
              <div className="flex-1 h-full">
                <IntelligenceCard {...card} />
              </div>
           </div>
        ))}
      </div>

      {/* NCDC Compliance Tracking visual ring */}
      <div className="flex flex-wrap gap-6">
         <Card className="flex-[1_1_250px] shadow-sm border-blue-200">
           <CardContent className="p-5 flex justify-between items-center bg-blue-50/50 h-full">
             <div>
                <p className="text-sm font-bold text-blue-800 mb-1">Syllabus Coverage</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.complianceTracking?.syllabusCoveragePct || 0}%</p>
             </div>
             <BookOpen className="w-8 h-8 text-blue-300" />
           </CardContent>
         </Card>

         <Card className="flex-[1_1_250px] shadow-sm border-green-200">
           <CardContent className="p-5 flex justify-between items-center bg-green-50/50 h-full">
             <div>
                <p className="text-sm font-bold text-green-800 mb-1">Assessment Compliance</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.complianceTracking?.assessmentCompliance || 0}%</p>
             </div>
             <CheckCircle className="w-8 h-8 text-green-300" />
           </CardContent>
         </Card>

         <Card className="flex-[1_1_250px] shadow-sm border-purple-200">
           <CardContent className="p-5 flex justify-between items-center bg-purple-50/50 h-full">
             <div>
                <p className="text-sm font-bold text-purple-800 mb-1">Practical Learning</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.complianceTracking?.practicalLearning || 0}%</p>
             </div>
             <Activity className="w-8 h-8 text-purple-300" />
           </CardContent>
         </Card>
      </div>

      {/* Phase 3 Competition Engine: Institution Analytics */}
      <div className="flex flex-wrap gap-6 mb-6">
        <div className="flex-[1_1_300px] flex flex-col">
            <ActiveChallengeCard 
              challenge={{
                id: 'c1',
                title: 'Term 2 Study Sprint',
                description: 'Highest average class study time wins early dismissal flag.',
                type: 'reading',
                scope: 'class',
                targetValue: 500,
                currentValue: 345,
                unit: 'hours',
                daysRemaining: 12,
                rewardText: 'Pizza Party & Early Dismissal',
                participantsCount: 850
              }} 
            />
        </div>
        <div className="flex-[2_2_600px] flex flex-col">
           <HouseStandingsCard 
               institutionName="Institution"
               houses={[
                 { id: 'h1', name: 'Crane', color: '#dc2626', points: 45000 },
                 { id: 'h2', name: 'Kob', color: '#2563eb', points: 42000 },
                 { id: 'h3', name: 'Rhino', color: '#16a34a', points: 39500 },
                 { id: 'h4', name: 'Leopard', color: '#ca8a04', points: 38200 }
               ]}
           />
        </div>
      </div>

      {/* 9-Lens Executive Command Center Layout */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-10 bg-gray-100/80 mb-6 h-auto">
          <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white py-2 shadow-none rounded-none first:rounded-l-lg">Overview</TabsTrigger>
          <TabsTrigger value="academics" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white py-2 shadow-none rounded-none">Academics</TabsTrigger>
          <TabsTrigger value="staff" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white py-2 shadow-none rounded-none">Staff</TabsTrigger>
          <TabsTrigger value="students" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white py-2 shadow-none rounded-none">Students</TabsTrigger>
          <TabsTrigger value="timetable" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white py-2 shadow-none rounded-none">Timetable</TabsTrigger>
          <TabsTrigger value="pastoral" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white py-2 shadow-none rounded-none">Pastoral</TabsTrigger>
          <TabsTrigger value="resources" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white py-2 shadow-none rounded-none">Resources</TabsTrigger>
          <TabsTrigger value="parents" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white py-2 shadow-none rounded-none">Parents</TabsTrigger>
          <TabsTrigger value="finance" className="data-[state=active]:bg-green-600 data-[state=active]:text-white py-2 shadow-none rounded-none">Finance</TabsTrigger>
          <TabsTrigger value="war_room" className="data-[state=active]:bg-red-600 data-[state=active]:text-white py-2 shadow-none rounded-none last:rounded-r-lg font-bold">War Room</TabsTrigger>
        </TabsList>
        
        <TabsContent value="war_room" className="space-y-6">
           <ExamWarRoomMode />
        </TabsContent>

        <TabsContent value="overview">
           <Card className="border-red-200 bg-white shadow-sm mb-6">
             <CardHeader className="bg-red-50/50 border-b border-red-100">
               <CardTitle className="flex items-center text-red-900">
                 <AlertTriangle className="w-5 h-5 mr-4 text-red-600" /> Executive Highlights & Alerts
               </CardTitle>
             </CardHeader>
             <CardContent className="p-0">
               <div className="divide-y divide-red-100">
                 <div className="p-4 flex justify-between items-center hover:bg-red-50/30 transition-colors">
                   <div>
                     <p className="font-bold text-gray-900">High Absenteeism - S3 East</p>
                     <p className="text-sm text-gray-600">12 students fell below the 70% threshold this week.</p>
                   </div>
                   <Button size="sm" variant="outline" className="text-red-700 border-red-200">Investigate</Button>
                 </div>
                 <div className="p-4 flex justify-between items-center hover:bg-red-50/30 transition-colors">
                   <div>
                     <p className="font-bold text-gray-900">Low Grading Completion - Mr. Kato</p>
                     <p className="text-sm text-gray-600">Math assessments pending for over 5 days.</p>
                   </div>
                   <Button size="sm" variant="outline" className="text-red-700 border-red-200">Ping Teacher</Button>
                 </div>
               </div>
             </CardContent>
           </Card>

           <div className="mb-6">
              <AIAdminReportAssistant />
           </div>

           <Card className="shadow-sm">
             <CardHeader className="pb-4 border-b bg-gray-50/50">
               <CardTitle>Workspace Identity</CardTitle>
               <CardDescription>Setup your institution's name, colors, and country localization.</CardDescription>
             </CardHeader>
             <CardContent className="pt-6 space-y-4">
                 <div className="flex flex-wrap gap-4 max-w-3xl">
                    <div className="space-y-2 flex-[1_1_250px]">
                       <label className="text-sm font-medium">Institution Name</label>
                       <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" defaultValue="Kampala Model High School" />
                    </div>
                    <div className="space-y-2 flex-[1_1_250px]">
                       <label className="text-sm font-medium">Platform Scope Slug</label>
                       <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" defaultValue="kampalahigh" disabled />
                    </div>
                 </div>
             </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-6">
           <Card className="shadow-sm">
             <CardHeader className="flex flex-row items-center justify-between pb-4 border-b bg-gray-50/50">
               <div>
                  <CardTitle>Staff Management & Workload</CardTitle>
                  <CardDescription>Monitor teacher attendance, assign subjects, and track grading compliance.</CardDescription>
               </div>
               <Button onClick={() => setInviteModalOpen(true)}><UserCheck className="w-4 h-4 mr-2" /> Bulk Invite Matrix</Button>
             </CardHeader>
           </Card>
           <TeacherAssignmentManager />
        </TabsContent>

        <TabsContent value="academics">
           <InstitutionIntelligenceHub />
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
           <Card className="shadow-sm border-indigo-200">
             <CardHeader className="pb-4 border-b bg-indigo-50/30 flex flex-row justify-between items-center">
               <div>
                  <CardTitle className="text-indigo-900">Learner Onboarding Station</CardTitle>
                  <CardDescription>Enroll students into the institution and attach parent/payment linkage.</CardDescription>
               </div>
               <Button onClick={() => setShowOnboardingForm(!showOnboardingForm)} className="bg-indigo-600 hover:bg-indigo-700">
                  {showOnboardingForm ? 'Close Station' : 'Launch Onboarding Form'}
               </Button>
             </CardHeader>
             {showOnboardingForm && (
               <CardContent className="p-6 bg-slate-50 border-b">
                  <StudentOnboardingForm />
               </CardContent>
             )}
           </Card>

           <Card className="shadow-sm">
             <CardHeader className="pb-4 border-b bg-gray-50/50">
               <CardTitle>Student Interventions & Risk Radar</CardTitle>
               <CardDescription>Track students slipping across multiple subjects and intercept with support.</CardDescription>
             </CardHeader>
             <CardContent className="p-10">
               <PremiumEmptyState 
                 icon={AlertTriangle} 
                 title="No Elevated Risks" 
                 description="Excellent! Your automated diagnostic radar has not flagged any critical student behavioral or academic risks within the past 48 hours." 
                 actionLabel="View Historical Radar Logs"
                 onAction={() => {}}
               />
             </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="timetable" className="space-y-6">
           {isSetup ? (
             <div className="max-w-5xl mx-auto pt-6">
                <PremiumLockState 
                  title="Unlock the Timetable Studio" 
                  description="Optimize your institution's schedule, prevent collisions, and instantly assign cover-teachers with the AI-driven Timetable Studio. Available immediately upon completing your institution's onboarding activation."
                />
             </div>
           ) : (
             <Card className="shadow-sm text-center py-8">
                <Calendar className="w-12 h-12 text-indigo-600 mx-auto mb-4"/>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Master Timetable & Cover Substitutions</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">Launch the Studio to resolve scheduling collisions and assign cover blocks.</p>
                <Link to="/dashboard/institution/timetable">
                  <Button className="bg-indigo-600 hover:bg-indigo-700">Launch Studio</Button>
                </Link>
             </Card>
           )}
        </TabsContent>

        <TabsContent value="pastoral" className="space-y-6">
           <PastoralTimeline />
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
           <Card className="shadow-sm border-indigo-200 bg-indigo-50/20">
             <CardHeader className="pb-4 border-b bg-white flex flex-row items-center justify-between">
               <div>
                  <CardTitle>Academic Library & Intervention Metrics</CardTitle>
                  <CardDescription>Track how effectively your institution utilizes learning resources to recover failing students.</CardDescription>
               </div>
               <Button onClick={() => setIsLibraryUploadOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 shadow-sm text-white border-0">
                  <Upload className="w-4 h-4 mr-2" /> Upload Reference Material
               </Button>
             </CardHeader>
             <CardContent className="pt-6">
               <div className="flex flex-wrap gap-6">
                 <div className="flex-[1_1_200px] flex flex-col justify-center bg-white border rounded-xl p-6 text-center shadow-sm">
                    <p className="text-3xl font-black text-indigo-600 mb-1">142</p>
                    <p className="text-xs font-bold text-slate-500 uppercase">Resources Deployed</p>
                 </div>
                 <div className="flex-[1_1_200px] flex flex-col justify-center bg-white border rounded-xl p-6 text-center shadow-sm">
                    <p className="text-3xl font-black text-emerald-600 mb-1">89%</p>
                    <p className="text-xs font-bold text-slate-500 uppercase">Recovery Rate</p>
                 </div>
                 <div className="flex-[1_1_200px] flex flex-col justify-center bg-white border rounded-xl p-6 text-center shadow-sm">
                    <p className="text-3xl font-black text-amber-600 mb-1">24</p>
                     <p className="text-xs font-bold text-slate-500 uppercase">Peer Discussions Led</p>
                 </div>
               </div>
               <div className="mt-6 flex justify-end">
                 <Link to="/dashboard/library">
                   <Button variant="outline" className="border-indigo-200 text-indigo-700">Go to Academic Library</Button>
                 </Link>
               </div>
             </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="parents" className="space-y-6">
           <Card className="shadow-sm">
             <CardHeader className="pb-4 border-b bg-gray-50/50">
               <CardTitle>Parent Engagement & Responsiveness</CardTitle>
               <CardDescription>Monitor parent portal sign-ins and intervention acknowledgment rates.</CardDescription>
             </CardHeader>
             <CardContent className="p-10">
               <PremiumEmptyState 
                 icon={Users}
                 title="Awaiting Parent Integrations"
                 description="Once parents onboard and link to their student portfolios, engagement metrics and responsiveness data will securely surface here."
                 actionLabel="Generate Parent Invites"
                 onAction={() => {}}
               />
             </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="finance" className="space-y-6">
           {isSetup ? (
             <div className="max-w-5xl mx-auto pt-6">
                <PremiumLockState 
                  title="Access the Finance Hub" 
                  description="Manage fee structures, fully automate billing, and instantly provision student licenses through our compliant financial clearinghouse. Complete your institution setup to unlock operations."
                  actionLabel="Complete Activation"
                />
             </div>
           ) : (
             <Card className="shadow-sm text-center py-12">
                <div className="w-16 h-16 bg-green-100 flex justify-center items-center rounded-full mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-green-600 "/>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise School Financial ERP</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">Manage multi-tier workflows, fee collections, invoice reconciliation, and executive dashboards through our dedicated institutional financial hub.</p>
                <Link to="/dashboard/finance">
                  <Button className="bg-green-600 hover:bg-green-700 h-12 px-8 text-lg rounded-xl shadow-lg shadow-green-600/20">Launch Finance ERP</Button>
                </Link>
             </Card>
           )}
        </TabsContent>

      </Tabs>

      <BulkInviteModal 
        isOpen={inviteModalOpen} 
        onClose={() => setInviteModalOpen(false)} 
        institutionId={1} // Static mock ID mapping to backend for MVP
        onSuccess={() => console.log('Successfully invited roster')}
      />
      <ResourceUploadModal 
         isOpen={isLibraryUploadOpen} 
         onClose={() => setIsLibraryUploadOpen(false)} 
      />
    </div>
    </div>
  );
};

export default InstitutionManagementPage;