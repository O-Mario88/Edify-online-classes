import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Activity, Users, BookOpen, Clock, ShieldCheck, Download, AlertTriangle, ArrowRight, Database, ServerCrash, DollarSign, HelpCircle, UserX, UserPlus, CheckCircle, Flame, Trophy, Cpu, TrendingUp, UploadCloud } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/apiClient';
import { ResourceUploadModal } from '../components/academic/ResourceUploadModal';
import { IntelligenceCard } from '../components/dashboard/IntelligenceCard';
import { GlobalInstitutionComparison } from '../components/admin/GlobalInstitutionComparison';
import { AlumniOutcomesTracker } from '../components/admin/AlumniOutcomesTracker';
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton';
import { PlatformAnalyticsTabs } from '../components/admin/PlatformAnalyticsTabs';
import { GlobalCurriculumHealth } from '../components/admin/GlobalCurriculumHealth';
import { CurriculumDistributionMap } from '../components/admin/CurriculumDistributionMap';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapTopic, setMapTopic] = useState('S3 Chemistry: Mole Concept');
  const [isLibraryUploadOpen, setIsLibraryUploadOpen] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await apiClient.get('/analytics/admin-dashboard/');
        
        if (response.data) {
          setDashboardData(response.data);
        } else {
          // Fallback to mock data
          console.error('Failed to fetch admin dashboard data:', response.error);
          setDashboardData(getMockAdminDashboardData());
        }
      } catch (error) {
        console.error('Error fetching dashboard data, falling back to mock data:', error);
        setDashboardData(getMockAdminDashboardData());
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Mock data fallback
  const getMockAdminDashboardData = () => ({
          intelligence: [
            {
              title: 'Fastest Growing',
              value: '12 Institutions',
              trendValue: 24,
              trendLabel: 'new signups',
              trendDirection: 'up',
              riskLevel: 'healthy',
              alertText: 'Tracks B2B SaaS growth. New school onboardings are 24% above target.',
              actionLabel: 'View growth metrics',
              actionLink: '/dashboard/admin/intelligence'
            },
            {
              title: 'High-Churn Risk',
              value: '3 Institutions',
              trendValue: 2,
              trendLabel: 'newly flagged',
              trendDirection: 'up',
              trendIsGood: false,
              riskLevel: 'critical',
              alertText: 'Platform AI flagged 3 schools with dormant usage, signaling high risk of license cancellation.',
              actionLabel: 'Intervene',
              actionLink: '/dashboard/admin/intelligence/risk',
              drillDownText: 'View raw logs',
              drillDownLink: '/dashboard/admin/intelligence'
            },
            {
              title: 'Module Adoption',
              value: '85%',
              trendValue: 5,
              trendLabel: 'this quarter',
              trendDirection: 'up',
              riskLevel: 'healthy',
              alertText: 'Measures feature rollout success. Module adoption is seeing excellent daily active usage.',
              actionLabel: 'View adoption map',
              actionLink: '/dashboard/admin/intelligence'
            },
            {
              title: 'Highest Yield',
              value: 'Test Prep',
              trendValue: 12,
              trendLabel: 'revenue jump',
              trendDirection: 'up',
              riskLevel: 'healthy',
              alertText: 'Identifies the most profitable B2C marketplace sector. Test Prep is currently the top earner.',
              actionLabel: 'Promote bundle',
              actionLink: '/marketplace'
            }
          ],
          kpis: {
            activeUsers: 45200,
            activeInstitutions: 84,
            dailyLessonCompletions: 12400,
            liveSessionCompletionRate: '88%',
            failedJobs: 3,
            examRegistrations: 1420,
            monthlyRevenue: '42,500,000'
          },
          marketplaceOps: {
            totalMarketplaceListings: 1240,
            pendingPayouts: 34,
            pendingModeration: 12
          },
          platformHealth: {
            syncQueueDepth: 14,
            videoBacklog: 2,
            celeryFailures: 3,
            pageLatency: '142ms'
          },
          aiOps: {
            copilotRequests: 14200,
            parentSummaries: 8400,
            lowConfidence: 12,
            responseTime: '850ms'
          },
          institutionPerformance: [
             { name: 'Kampala Model High School', status: 'Active', students: 2480, activation: 96, attendance: 93, avgPerformance: 78, readiness: 82, revenue: 'UGX 4.8M', risk: 0 },
             { name: 'Makerere College School', status: 'Active', students: 1890, activation: 94, attendance: 91, avgPerformance: 81, readiness: 85, revenue: 'UGX 3.6M', risk: 0 },
             { name: 'Lakeside Secondary School', status: 'Active', students: 1240, activation: 88, attendance: 87, avgPerformance: 72, readiness: 75, revenue: 'UGX 2.1M', risk: 1 },
             { name: 'Gulu Core Institute', status: 'Warning', students: 980, activation: 52, attendance: 58, avgPerformance: 48, readiness: 42, revenue: 'UGX 890K', risk: 5 },
             { name: 'Mbale Progressive Academy', status: 'Active', students: 1560, activation: 91, attendance: 89, avgPerformance: 74, readiness: 77, revenue: 'UGX 2.8M', risk: 0 },
             { name: 'Fort Portal Heritage College', status: 'Active', students: 720, activation: 85, attendance: 82, avgPerformance: 69, readiness: 71, revenue: 'UGX 1.4M', risk: 2 },
             { name: 'Jinja Nile View High School', status: 'Active', students: 1100, activation: 87, attendance: 84, avgPerformance: 66, readiness: 68, revenue: 'UGX 1.9M', risk: 1 },
             { name: 'Mbarara Western Institute', status: 'Active', students: 850, activation: 79, attendance: 76, avgPerformance: 62, readiness: 64, revenue: 'UGX 1.1M', risk: 3 },
             { name: 'Soroti Technical Academy', status: 'Warning', students: 420, activation: 44, attendance: 51, avgPerformance: 43, readiness: 38, revenue: 'UGX 340K', risk: 7 },
             { name: 'Lira Community Day School', status: 'Active', students: 680, activation: 72, attendance: 74, avgPerformance: 58, readiness: 55, revenue: 'UGX 780K', risk: 4 },
             { name: 'Arua Border Heights Academy', status: 'Payment Due', students: 510, activation: 38, attendance: 45, avgPerformance: 41, readiness: 35, revenue: 'UGX 0', risk: 9 },
             { name: 'Kabale Highlands Prep School', status: 'Active', students: 340, activation: 92, attendance: 90, avgPerformance: 76, readiness: 79, revenue: 'UGX 620K', risk: 0 },
             { name: 'Masaka Southern College', status: 'Active', students: 920, activation: 83, attendance: 80, avgPerformance: 65, readiness: 67, revenue: 'UGX 1.5M', risk: 2 },
             { name: 'Hoima Petroleum City School', status: 'Active', students: 1340, activation: 76, attendance: 78, avgPerformance: 60, readiness: 58, revenue: 'UGX 1.8M', risk: 3 },
             { name: 'Kasese Mountain View Academy', status: 'Suspended', students: 280, activation: 12, attendance: 18, avgPerformance: 32, readiness: 25, revenue: 'UGX 0', risk: 12 }
          ]
  });

  if (loading || !dashboardData) {
    return <DashboardSkeleton type="admin" />;
  }

  const { kpis, institutionPerformance, platformHealth, aiOps } = dashboardData;

  return (
    <div className="w-full bg-transparent">
      {/* Distribution Map Modal */}
      <CurriculumDistributionMap 
        isOpen={isMapOpen} 
        onClose={() => setIsMapOpen(false)} 
        topicName={mapTopic} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Platform Intelligence Center</h1>
            <p className="text-gray-600 mt-1">Global EMIS Operations & Infrastructure Telemetry</p>
          </div>
          <div className="flex justify-center gap-3 w-full md:w-auto">
             <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50"><ServerCrash className="w-4 h-4 mr-2" /> View Error Logs</Button>
             <Button className="shadow-sm"><Database className="w-4 h-4 mr-2" /> Sync Data</Button>
             <Button onClick={() => setIsLibraryUploadOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 shadow-sm text-white border-0"><UploadCloud className="w-4 h-4 mr-2" /> Upload Library Material</Button>
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

        {/* Global Curriculum Health Layer */}
        <div className="pt-2">
           <GlobalCurriculumHealth 
             onOpenMap={(topic) => {
               setMapTopic(topic);
               setIsMapOpen(true);
             }}
           />
        </div>

        {/* Phase 4: Gamification KPIs */}
        <div className="flex flex-wrap gap-6 my-6">
           <Card className="flex-[1_1_250px] shadow-sm border-blue-200">
             <CardContent className="p-5 flex justify-between items-center bg-blue-50/50 h-full">
               <div>
                  <p className="text-sm font-bold text-blue-800 mb-1">Active Challenges</p>
                  <p className="text-2xl font-bold text-gray-900">142</p>
               </div>
               <Trophy className="w-8 h-8 text-blue-300" />
             </CardContent>
           </Card>

           <Card className="flex-[1_1_250px] shadow-sm border-orange-200">
             <CardContent className="p-5 flex justify-between items-center bg-orange-50/50 h-full">
               <div>
                  <p className="text-sm font-bold text-orange-800 mb-1">Global Streaks Tracked</p>
                  <p className="text-2xl font-bold text-gray-900">4,291</p>
               </div>
               <Flame className="w-8 h-8 text-orange-300" />
             </CardContent>
           </Card>

           <Card className="flex-[1_1_250px] shadow-sm border-purple-200">
             <CardContent className="p-5 flex justify-between items-center bg-purple-50/50 h-full">
               <div>
                  <p className="text-sm font-bold text-purple-800 mb-1">Badges Minted</p>
                  <p className="text-2xl font-bold text-gray-900">12,050</p>
               </div>
               <ShieldCheck className="w-8 h-8 text-purple-300" />
             </CardContent>
           </Card>
        </div>

        {/* Phase 5: Global OS Layer */}
        <div className="flex flex-wrap gap-6 mb-6">
           <div className="flex-[1_1_450px]">
              <GlobalInstitutionComparison />
           </div>
           <div className="flex-[1_1_450px]">
              <AlumniOutcomesTracker />
           </div>
        </div>

        {/* Global Marketplace Ops */}
        <div className="flex flex-wrap gap-6">
           <Card className="flex-[1_1_250px] shadow-sm border-blue-200">
             <CardContent className="p-5 flex justify-between items-center bg-blue-50/50 h-full">
               <div>
                  <p className="text-sm font-bold text-blue-800 mb-1">Marketplace Listings</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.marketplaceOps?.totalMarketplaceListings || 0}</p>
               </div>
               <ShieldCheck className="w-8 h-8 text-blue-300" />
             </CardContent>
           </Card>

           <Card className="flex-[1_1_250px] shadow-sm border-orange-200">
             <CardContent className="p-5 flex justify-between items-center bg-orange-50/50 h-full">
               <div>
                  <p className="text-sm font-bold text-orange-800 mb-1">Pending Wallet Payouts</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.marketplaceOps?.pendingPayouts || 0}</p>
               </div>
               <DollarSign className="w-8 h-8 text-orange-300" />
             </CardContent>
           </Card>

           <Card className="flex-[1_1_250px] shadow-sm border-purple-200">
             <CardContent className="p-5 flex justify-between items-center bg-purple-50/50 h-full">
               <div>
                  <p className="text-sm font-bold text-purple-800 mb-1">Pending Content Moderation</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.marketplaceOps?.pendingModeration || 0}</p>
               </div>
               <HelpCircle className="w-8 h-8 text-purple-300" />
             </CardContent>
           </Card>
        </div>

        {/* Row 2: Platform Growth + System Health + AI Ops */}
        <div className="flex flex-wrap gap-6">
           <Card className="w-full lg:flex-[1] shadow-sm">
              <CardHeader className="pb-3 border-b border-gray-100">
                 <CardTitle className="text-md flex items-center gap-2">
                   <Activity className="w-4 h-4 text-gray-500" /> Platform Infrastructure Health
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                 <div className="grid grid-cols-2 gap-4 text-sm">
                   <div className="flex justify-between items-center border-b pb-1">
                     <span className="text-gray-500">Sync Queue</span>
                     <span className="font-bold text-gray-900">{platformHealth.syncQueueDepth} depth</span>
                   </div>
                   <div className="flex justify-between items-center border-b pb-1">
                     <span className="text-gray-500">Video Backlog</span>
                     <span className="font-bold text-gray-900">{platformHealth.videoBacklog} pending</span>
                   </div>
                   <div className="flex justify-between items-center border-b pb-1">
                     <span className="text-gray-500">Celery Tasks</span>
                     <span className="font-bold text-red-600">{platformHealth.celeryFailures} failed</span>
                   </div>
                   <div className="flex justify-between items-center border-b pb-1">
                     <span className="text-gray-500">Latency (p95)</span>
                     <span className="font-bold text-green-600">{platformHealth.pageLatency}</span>
                   </div>
                 </div>
                 <div className="flex justify-between items-center pt-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase">Redis State</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1"/> Operational
                    </Badge>
                 </div>
              </CardContent>
           </Card>

           <Card className="w-full lg:flex-[1] shadow-sm border-indigo-100 bg-gradient-to-br from-indigo-50 to-white">
              <CardHeader className="pb-3 border-b border-indigo-50">
                 <CardTitle className="text-md font-semibold text-indigo-900 flex items-center">
                   <Cpu className="w-4 h-4 mr-2 text-indigo-600" /> AI Operations Telemetry
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                 <div className="grid grid-cols-2 gap-3 text-sm">
                   <div className="p-3 bg-white rounded-lg border shadow-sm">
                     <p className="text-xs text-indigo-500 mb-1 uppercase font-bold">Copilot Requests</p>
                     <p className="text-xl font-bold text-gray-900 leading-tight flex items-end justify-between">
                       {aiOps.copilotRequests} <span className="text-xs text-green-600 font-normal"><TrendingUp className="w-3 h-3 inline"/> 12%</span>
                     </p>
                   </div>
                   <div className="p-3 bg-white rounded-lg border shadow-sm">
                     <p className="text-xs text-indigo-500 mb-1 uppercase font-bold">Parent Narratives</p>
                     <p className="text-xl font-bold text-gray-900 leading-tight">{aiOps.parentSummaries}</p>
                   </div>
                   <div className="p-3 bg-white rounded-lg border shadow-sm">
                     <p className="text-xs text-red-500 mb-1 uppercase font-bold">Low Confidence</p>
                     <p className="text-xl font-bold text-red-600 leading-tight flex items-center">{aiOps.lowConfidence} <AlertTriangle className="w-3 h-3 ml-2"/></p>
                   </div>
                   <div className="p-3 bg-white rounded-lg border shadow-sm">
                     <p className="text-xs text-indigo-500 mb-1 uppercase font-bold">Avg Inference</p>
                     <p className="text-xl font-bold text-gray-900 leading-tight">{aiOps.responseTime}</p>
                   </div>
                 </div>
              </CardContent>
           </Card>

           <Card className="w-full lg:flex-[1] shadow-sm">
              <CardHeader className="pb-3 border-b border-gray-100">
                 <CardTitle className="text-md flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4 text-gray-500" /> Academic Quality Monitor
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                 <div className="space-y-3 text-sm">
                   <div>
                     <div className="flex justify-between items-center mb-1">
                       <span className="font-semibold text-gray-900">National UCE Readiness</span>
                       <span className="font-bold text-blue-600">71% Avg</span>
                     </div>
                     <Progress value={71} className="h-1.5" />
                   </div>
                   <div className="pt-2">
                     <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Failure Hotspots Detected</p>
                     <div className="flex gap-2">
                       <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">S3 Chemistry (Mole Concept)</Badge>
                       <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">S4 Physics (Calculations)</Badge>
                     </div>
                   </div>
                 </div>
                 <div className="pt-3 border-t">
                   <Button variant="outline" className="w-full text-xs h-8" onClick={() => {
                     setMapTopic('National UCE Readiness Distribution');
                     setIsMapOpen(true);
                   }}>
                     View Master Distribution Map
                   </Button>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Row 3: Institution Leaderboard */}
        <div className="max-w-6xl mx-auto w-full">
          <Card className="shadow-sm">
            <CardHeader className="border-b bg-gray-50/50 pb-4">
               <div className="flex justify-between items-center">
                 <CardTitle className="text-lg">Institution Diagnostic Leaderboard</CardTitle>
                 <div className="flex gap-2">
                   <Button variant="outline" size="sm">Export CSV</Button>
                 </div>
               </div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left border-collapse">
                   <thead className="bg-gray-50 text-gray-500 border-b">
                     <tr>
                       <th className="font-bold p-4 uppercase text-xs">Institution Name</th>
                       <th className="font-bold p-4 uppercase text-xs text-center">Status</th>
                       <th className="font-bold p-4 uppercase text-xs text-center">Students</th>
                       <th className="font-bold p-4 uppercase text-xs text-center">Activation</th>
                       <th className="font-bold p-4 uppercase text-xs text-center">Attendance</th>
                       <th className="font-bold p-4 uppercase text-xs text-center">Avg Score</th>
                       <th className="font-bold p-4 uppercase text-xs text-center">Readiness</th>
                       <th className="font-bold p-4 uppercase text-xs text-right">Revenue</th>
                       <th className="font-bold p-4 uppercase text-xs text-right">Sys Flags</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y">
                     {institutionPerformance.map((inst: any, index: number) => (
                       <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-bold text-gray-900">{inst.name}</td>
                          <td className="p-4 text-center">
                            <Badge variant="outline" className={
                              inst.status === 'Active' ? "bg-green-50 text-green-700 border-green-200" :
                              inst.status === 'Warning' ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                              inst.status === 'Payment Due' ? "bg-orange-50 text-orange-700 border-orange-200" :
                              inst.status === 'Suspended' ? "bg-red-50 text-red-700 border-red-200" :
                              "bg-gray-50 text-gray-700 border-gray-200"
                            }>
                              {inst.status}
                            </Badge>
                          </td>
                          <td className="p-4 text-center font-medium text-gray-600">{inst.students}</td>
                          <td className="p-4 text-center">
                            <Progress value={inst.activation} className="w-12 h-1.5 mx-auto mb-1" />
                            <span className="text-xs text-gray-500">{inst.activation}%</span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={inst.attendance < 70 ? "text-red-600 font-bold" : "text-gray-900 font-bold"}>{inst.attendance}%</span>
                          </td>
                          <td className="p-4 text-center font-bold text-gray-700">{inst.avgPerformance}%</td>
                          <td className="p-4 text-center font-bold text-blue-600">{inst.readiness}</td>
                          <td className="p-4 text-right font-medium text-gray-900">{inst.revenue}</td>
                          <td className="p-4 text-right">
                            {inst.risk > 0 ? (
                              <span className="inline-flex items-center justify-center bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-bold">
                                {inst.risk} <AlertTriangle className="w-3 h-3 ml-1"/>
                              </span>
                            ) : (
                              <span className="text-gray-400 font-medium text-xs">-</span>
                            )}
                          </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </CardContent>
          </Card>
         </div>

         {/* Phase 6: Extended Platform Analytics */}
         <div className="max-w-7xl mx-auto w-full pt-8 border-t border-gray-200 mt-8">
           <PlatformAnalyticsTabs />
         </div>

      </div>
      <ResourceUploadModal 
         isOpen={isLibraryUploadOpen} 
         onClose={() => setIsLibraryUploadOpen(false)} 
      />
    </div>
  );
};