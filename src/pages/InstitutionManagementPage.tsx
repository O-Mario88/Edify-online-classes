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
  CheckCircle, Briefcase, Calendar, ShieldAlert
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { BulkInviteModal } from '@/components/dashboard/BulkInviteModal';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { TeacherRedAlertsPanel } from '../components/dashboard/TeacherRedAlertsPanel';
import { InstitutionIntelligenceHub } from '../components/dashboard/InstitutionIntelligenceHub';
import { PastoralTimeline } from '../components/pastoral/PastoralTimeline';
import { TeacherAssignmentManager } from '../components/dashboard/TeacherAssignmentManager';
import { InstitutionFinanceHub } from './InstitutionFinanceHub';
import { InstitutionBillingPortal } from '../components/institutions/InstitutionBillingPortal';
import { StudentOnboardingForm } from '../components/institutions/StudentOnboardingForm';

export const InstitutionManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [showOnboardingForm, setShowOnboardingForm] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await apiClient.get('/analytics/institution-dashboard/');
        setDashboardData(data);
        setError(null);
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Institution Analytics Hub...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
     return (
      <div className="min-h-screen flex items-center justify-center p-8">
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
    <div className="container mx-auto py-8 px-4 space-y-8">
      
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

      {/* Row 1: KPI Strip (Local) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="shadow-sm border-t-2 border-t-blue-500 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <CardContent className="p-4">
            <p className="text-[11px] font-bold uppercase text-gray-500 mb-1 leading-tight">Enrolled Students</p>
            <div className="text-2xl font-bold text-gray-900 flex items-center">{kpis.totalStudents} <Users className="w-4 h-4 ml-auto text-blue-200"/></div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-t-2 border-t-green-500 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <CardContent className="p-4">
            <p className="text-[11px] font-bold uppercase text-gray-500 mb-1 leading-tight">Teaching Staff</p>
            <div className="text-2xl font-bold text-gray-900 flex items-center">{kpis.totalTeachers} <Briefcase className="w-4 h-4 ml-auto text-green-200"/></div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-t-2 border-t-indigo-500 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <CardContent className="p-4">
            <p className="text-[11px] font-bold uppercase text-gray-500 mb-1 leading-tight">Active Classes</p>
            <div className="text-2xl font-bold text-gray-900 flex items-center">{kpis.activeClasses} <BookOpen className="w-4 h-4 ml-auto text-indigo-200"/></div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-t-2 border-t-purple-500 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <CardContent className="p-4">
            <p className="text-[11px] font-bold uppercase text-gray-500 mb-1 flex justify-between leading-tight">
              Attendance Today
            </p>
            <div className="text-2xl font-bold text-gray-900 flex items-center">{kpis.attendanceToday}% <TrendingUp className="w-4 h-4 ml-auto text-green-500"/></div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-t-2 border-t-orange-500 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <CardContent className="p-4">
            <p className="text-[11px] font-bold uppercase text-gray-500 mb-1 leading-tight">Avg Performance</p>
            <div className="text-2xl font-bold text-gray-900 flex items-center">{kpis.avgPerformance}% <Activity className="w-4 h-4 ml-auto text-orange-200"/></div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-red-200 bg-red-50/30 border-t-2 border-t-red-600 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <CardContent className="p-4">
            <p className="text-[11px] font-bold uppercase text-red-800 mb-1 leading-tight">Critical Alerts</p>
            <div className="text-2xl font-bold text-red-700 flex items-center">{kpis.riskAlerts} <AlertTriangle className="w-4 h-4 ml-auto text-red-400"/></div>
          </CardContent>
        </Card>
      </div>

      {/* NCDC Compliance Tracking visual ring */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="shadow-sm border-blue-200">
           <CardContent className="p-5 flex justify-between items-center bg-blue-50/50">
             <div>
                <p className="text-sm font-bold text-blue-800 mb-1">Syllabus Coverage</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.complianceTracking?.syllabusCoveragePct || 0}%</p>
             </div>
             <BookOpen className="w-8 h-8 text-blue-300" />
           </CardContent>
         </Card>

         <Card className="shadow-sm border-green-200">
           <CardContent className="p-5 flex justify-between items-center bg-green-50/50">
             <div>
                <p className="text-sm font-bold text-green-800 mb-1">Assessment Compliance</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.complianceTracking?.assessmentCompliance || 0}%</p>
             </div>
             <CheckCircle className="w-8 h-8 text-green-300" />
           </CardContent>
         </Card>

         <Card className="shadow-sm border-purple-200">
           <CardContent className="p-5 flex justify-between items-center bg-purple-50/50">
             <div>
                <p className="text-sm font-bold text-purple-800 mb-1">Practical Learning</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.complianceTracking?.practicalLearning || 0}%</p>
             </div>
             <Activity className="w-8 h-8 text-purple-300" />
           </CardContent>
         </Card>
      </div>

      {/* 9-Lens Executive Command Center Layout */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-9 bg-gray-100/80 mb-6 h-auto">
          <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white py-2 shadow-none rounded-none first:rounded-l-lg">Overview</TabsTrigger>
          <TabsTrigger value="academics" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white py-2 shadow-none rounded-none">Academics</TabsTrigger>
          <TabsTrigger value="staff" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white py-2 shadow-none rounded-none">Staff</TabsTrigger>
          <TabsTrigger value="students" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white py-2 shadow-none rounded-none">Students</TabsTrigger>
          <TabsTrigger value="timetable" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white py-2 shadow-none rounded-none">Timetable</TabsTrigger>
          <TabsTrigger value="pastoral" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white py-2 shadow-none rounded-none">Pastoral</TabsTrigger>
          <TabsTrigger value="resources" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white py-2 shadow-none rounded-none">Resources</TabsTrigger>
          <TabsTrigger value="parents" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white py-2 shadow-none rounded-none">Parents</TabsTrigger>
          <TabsTrigger value="finance" className="data-[state=active]:bg-green-600 data-[state=active]:text-white py-2 shadow-none rounded-none last:rounded-r-lg">Finance</TabsTrigger>
        </TabsList>

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

           <Card className="shadow-sm">
             <CardHeader className="pb-4 border-b bg-gray-50/50">
               <CardTitle>Workspace Identity</CardTitle>
               <CardDescription>Setup your institution's name, colors, and country localization.</CardDescription>
             </CardHeader>
             <CardContent className="pt-6 space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                    <div className="space-y-2">
                       <label className="text-sm font-medium">Institution Name</label>
                       <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" defaultValue="Kampala Model High School" />
                    </div>
                    <div className="space-y-2">
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
             <CardContent className="py-16 text-center text-gray-500">
               <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
               <p className="font-medium">No elevated student risks currently flagged within network.</p>
             </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="timetable" className="space-y-6">
           {isSetup ? (
             <Card className="shadow-sm border-dashed border-2 border-gray-300 text-center py-16">
               <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
               <h3 className="text-lg font-bold text-gray-900 mb-2">Timetable Studio Locked</h3>
               <p className="font-medium text-gray-500">Please complete institution activation to access the Timetable Studio.</p>
             </Card>
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
             <CardHeader className="pb-4 border-b bg-white">
               <CardTitle>Academic Library & Intervention Metrics</CardTitle>
               <CardDescription>Track how effectively your institution utilizes learning resources to recover failing students.</CardDescription>
             </CardHeader>
             <CardContent className="pt-6">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white border rounded-xl p-6 text-center shadow-sm">
                    <p className="text-3xl font-black text-indigo-600 mb-1">142</p>
                    <p className="text-xs font-bold text-slate-500 uppercase">Resources Deployed</p>
                 </div>
                 <div className="bg-white border rounded-xl p-6 text-center shadow-sm">
                    <p className="text-3xl font-black text-emerald-600 mb-1">89%</p>
                    <p className="text-xs font-bold text-slate-500 uppercase">Recovery Rate</p>
                 </div>
                 <div className="bg-white border rounded-xl p-6 text-center shadow-sm">
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
             <CardContent className="py-16 text-center text-gray-500">
               <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
               <p className="font-medium">No parent engagement metrics generated for the current term.</p>
             </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="finance" className="space-y-6">
           {isSetup ? (
             <Card className="shadow-sm border-dashed border-2 border-gray-300 text-center py-16">
               <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
               <h3 className="text-lg font-bold text-gray-900 mb-2">Finance Hub Locked</h3>
               <p className="font-medium text-gray-500">Please complete institution activation to access finance operations.</p>
             </Card>
           ) : (
             <InstitutionFinanceHub />
           )}
        </TabsContent>

      </Tabs>

      <BulkInviteModal 
        isOpen={inviteModalOpen} 
        onClose={() => setInviteModalOpen(false)} 
        institutionId={1} // Static mock ID mapping to backend for MVP
        onSuccess={() => console.log('Successfully invited roster')}
      />
    </div>
  );
};

export default InstitutionManagementPage;