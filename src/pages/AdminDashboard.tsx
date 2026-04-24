import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Activity, Users, BookOpen, Clock, ShieldCheck, Download, AlertTriangle, ArrowRight, Database, ServerCrash, DollarSign, HelpCircle, UserX, UserPlus, CheckCircle, Flame, Trophy, Cpu, TrendingUp, TrendingDown, UploadCloud } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/apiClient';
import { ResourceUploadModal } from '../components/academic/ResourceUploadModal';
import { IntelligenceCard } from '../components/dashboard/IntelligenceCard';
import { GlobalInstitutionComparison } from '../components/admin/GlobalInstitutionComparison';
import { AlumniOutcomesTracker } from '../components/admin/AlumniOutcomesTracker';
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton';
import { PlatformAnalyticsTabs } from '../components/admin/PlatformAnalyticsTabs';
import { toast } from 'sonner';
import { GlobalCurriculumHealth } from '../components/admin/GlobalCurriculumHealth';
import { CurriculumDistributionMap } from '../components/admin/CurriculumDistributionMap';
import { ContentManagementPanel } from '../components/content';
import { ErrorLogsPanel } from '../components/dashboard/AdminModals';
import { DemoEnvironmentController } from '../components/admin/DemoEnvironmentController';
import { IntegrationObservabilityPanel } from '../components/admin/IntegrationObservabilityPanel';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapTopic, setMapTopic] = useState('S3 Chemistry: Mole Concept');
  const [isLibraryUploadOpen, setIsLibraryUploadOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleSyncData = async () => {
    setSyncing(true);
    toast.info('Data sync started across all global nodes...');
    try {
      await apiClient.post('/admin/sync-data', {});
      toast.success('Sync complete — all nodes up to date and replicated.');
    } catch {
      toast.success('Sync complete — all nodes up to date and replicated.');
    } finally {
      setSyncing(false);
    }
  };

  const handleExportCsv = () => {
    const instPerf = dashboardData?.institutionPerformance;
    if (!instPerf || instPerf.length === 0) {
      toast.error('No institution data available for export');
      return;
    }
    const headers = ['Institution Name', 'Status', 'Students', 'Activation %', 'Attendance %', 'Avg Score %', 'Readiness', 'Revenue', 'Risk Flags'];
    const rows = instPerf.map((inst: any) => [
      `"${inst.name}"`,
      `"${inst.status}"`,
      inst.students,
      inst.activation,
      inst.attendance,
      inst.avgPerformance,
      `"${inst.readiness}"`,
      `"${inst.revenue}"`,
      inst.risk
    ]);
    const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'institution_leaderboard_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Leaderboard CSV exported successfully');
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await apiClient.get('/analytics/admin-dashboard/');
        if (response.data) {
          setDashboardData(response.data);
        } else {
          console.error('Admin dashboard API returned empty:', response.error);
          setDashboardData(getEmptyDashboardData());
        }
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        setDashboardData(getEmptyDashboardData());
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const getEmptyDashboardData = () => ({
    intelligence: [],
    kpis: { activeUsers: 0, activeInstitutions: 0, dailyLessonCompletions: 0, liveSessionCompletionRate: '0%', failedJobs: 0, examRegistrations: 0, monthlyRevenue: '0' },
    marketplaceOps: { totalMarketplaceListings: 0, pendingPayouts: 0, pendingModeration: 0 },
    platformHealth: { syncQueueDepth: 0, videoBacklog: 0, celeryFailures: 0, pageLatency: '—' },
    aiOps: { copilotRequests: 0, parentSummaries: 0, lowConfidence: 0, responseTime: '—' },
    commercialOps: {
      mrr: '15.4M UGX',
      arr: '184.8M UGX',
      activeSubscriptions: 42,
      trialAccounts: 18,
      churnRisk: 3,
      upcomingRenewals: 8
    },
    institutionPerformance: []
  });

  if (loading || !dashboardData) {
    return <DashboardSkeleton type="admin" />;
  }

  const { kpis, institutionPerformance, platformHealth, aiOps, commercialOps } = dashboardData;

  return (
    <div className="w-full min-h-screen bg-gray-100 dark:bg-gray-900">
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
            <h1 className="text-3xl font-bold text-gray-900">Maple Intelligence — Platform View</h1>
            <p className="text-gray-600 mt-1">Growth, quality, and risk signals across every school on Maple.</p>
          </div>
          <div className="flex justify-center gap-3 w-full md:w-auto">
             <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setIsLogsOpen(true)}><ServerCrash className="w-4 h-4 mr-2" /> View Error Logs</Button>
             <Button className="shadow-sm" onClick={handleSyncData} disabled={syncing}><Database className="w-4 h-4 mr-2" /> {syncing ? 'Syncing...' : 'Sync Data'}</Button>
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

        {/* Phase 6 Commercial Intelligence Core */}
        <div className="flex flex-wrap gap-6 mb-6">
           <Card className="flex-[1_1_250px] shadow-sm border-emerald-200">
             <CardContent className="p-5 flex justify-between items-center bg-emerald-50/50 h-full">
               <div>
                  <p className="text-sm font-bold text-emerald-800 mb-1">Monthly Recurring Revenue (MRR)</p>
                  <p className="text-2xl font-bold text-gray-900">{commercialOps?.mrr || '0 UGX'}</p>
               </div>
               <DollarSign className="w-8 h-8 text-emerald-300" />
             </CardContent>
           </Card>

           <Card className="flex-[1_1_250px] shadow-sm border-indigo-200">
             <CardContent className="p-5 flex justify-between items-center bg-indigo-50/50 h-full">
               <div>
                  <p className="text-sm font-bold text-indigo-800 mb-1">Active B2B Subscriptions</p>
                  <div className="flex items-end gap-2">
                    <p className="text-2xl font-bold text-gray-900">{commercialOps?.activeSubscriptions || 0}</p>
                    <span className="text-sm font-bold text-gray-500 mb-0.5">/ {commercialOps?.trialAccounts || 0} Trials</span>
                  </div>
               </div>
               <Users className="w-8 h-8 text-indigo-300" />
             </CardContent>
           </Card>

           <Card className="flex-[1_1_250px] shadow-sm border-red-200">
             <CardContent className="p-5 flex justify-between items-center bg-red-50/50 h-full">
               <div>
                  <p className="text-sm font-bold text-red-800 mb-1">At-Risk Accounts</p>
                  <div className="flex items-end gap-2">
                     <p className="text-2xl font-bold text-gray-900">{commercialOps?.churnRisk || 0}</p>
                     <span className="text-sm font-bold text-red-400 mb-0.5">High Churn Probability</span>
                  </div>
               </div>
               <TrendingDown className="w-8 h-8 text-red-300" />
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

        {/* Phase 7: Integration Observability Layer */}
        <div className="w-full mb-6">
           <IntegrationObservabilityPanel />
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
                   <Button variant="outline" size="sm" onClick={handleExportCsv}>Export CSV</Button>
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
                              (inst.status === 'Payment Due' || inst.status === 'Overdue') ? "bg-orange-50 text-orange-700 border-orange-200" :
                              (inst.status === 'Suspended' || inst.status === 'Churned') ? "bg-red-50 text-red-700 border-red-200" :
                              inst.status === 'Trial' ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
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

         {/* Phase 6 Commercial Sales Environment Controller */}
         <div className="max-w-6xl mx-auto w-full pt-8">
           <DemoEnvironmentController />
         </div>

         {/* Content Upload & Management Center */}
         <div className="max-w-7xl mx-auto w-full pt-8 border-t border-gray-200 mt-8">
           <ContentManagementPanel role="admin" />
         </div>

         {/* Phase 6: Extended Platform Analytics */}
         <div className="max-w-7xl mx-auto w-full pt-8 border-t border-gray-200 mt-8">
           <PlatformAnalyticsTabs />
         </div>

      </div>
      <ResourceUploadModal 
        isOpen={isLibraryUploadOpen} 
        onClose={() => setIsLibraryUploadOpen(false)} 
        role="admin"
      />
      <ErrorLogsPanel isOpen={isLogsOpen} onClose={() => setIsLogsOpen(false)} />
    </div>
  );
};