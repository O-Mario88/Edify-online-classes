import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Activity, Users, BookOpen, Clock, ShieldCheck, Download, AlertTriangle, ArrowRight, Database, ServerCrash, DollarSign, HelpCircle, UserX, UserPlus, CheckCircle, Flame, Trophy, Cpu, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';
import { IntelligenceCard } from '../components/dashboard/IntelligenceCard';
import { GlobalInstitutionComparison } from '../components/admin/GlobalInstitutionComparison';
import { AlumniOutcomesTracker } from '../components/admin/AlumniOutcomesTracker';
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await apiClient.get('/analytics/admin-dashboard/');
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data, falling back to mock data:', error);
        setDashboardData({
          intelligence: [
            {
              title: 'Fastest Growing',
              value: '12 Orgs',
              trendValue: 24,
              trendLabel: 'new signups',
              trendDirection: 'up',
              riskLevel: 'healthy',
              alertText: 'Above monthly target',
              actionLabel: 'View growth metrics',
              actionLink: '/admin/institutions'
            },
            {
              title: 'High-Churn Risk',
              value: '3 Orgs',
              trendValue: 2,
              trendLabel: 'newly flagged',
              trendDirection: 'up',
              trendIsGood: false,
              riskLevel: 'critical',
              alertText: 'Low activation thresholds',
              actionLabel: 'Intervene',
              actionLink: '/admin/analytics',
              drillDownText: 'View raw logs',
              drillDownLink: '/admin/logs'
            },
            {
              title: 'Module Adoption',
              value: '85%',
              trendValue: 5,
              trendLabel: 'this quarter',
              trendDirection: 'up',
              riskLevel: 'healthy',
              alertText: 'Finance Hub rolling out well',
              actionLabel: 'View adoption map',
              actionLink: '/admin/modules'
            },
            {
              title: 'Highest Yield',
              value: 'Test Prep',
              trendValue: 12,
              trendLabel: 'revenue jump',
              trendDirection: 'up',
              riskLevel: 'healthy',
              alertText: 'Marketplace top earner',
              actionLabel: 'Promote bundle',
              actionLink: '/admin/marketplace'
            },
            {
              title: 'System Weak Topic',
              value: 'S3 Chem',
              trendValue: 8,
              trendLabel: 'failure rate',
              trendDirection: 'up',
              trendIsGood: false,
              riskLevel: 'warning',
              alertText: 'Mole Concept dropping across 12 orgs',
              actionLabel: 'Adjust curriculum',
              actionLink: '/admin/content'
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
             { name: 'Kampala Model High', status: 'Active', students: 1240, activation: 92, attendance: 89, avgPerformance: 68, readiness: 71, revenue: 'UGX 1.2M', risk: 0 },
             { name: 'Lakeside College', status: 'Active', students: 850, activation: 88, attendance: 91, avgPerformance: 72, readiness: 75, revenue: 'UGX 900K', risk: 0 },
             { name: 'City High School', status: 'Warning', students: 2100, activation: 45, attendance: 65, avgPerformance: 55, readiness: 60, revenue: 'UGX 450K', risk: 3 }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || !dashboardData) {
    return <DashboardSkeleton type="admin" />;
  }

  const { kpis, institutionPerformance, platformHealth, aiOps } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Platform Intelligence Center</h1>
            <p className="text-gray-600 mt-1">Global EMIS Operations & Infrastructure Telemetry</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50"><ServerCrash className="w-4 h-4 mr-2" /> View Error Logs</Button>
             <Button className="shadow-sm"><Database className="w-4 h-4 mr-2" /> Sync Data</Button>
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
           <Card className="flex-[1_1_300px] shadow-sm">
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

           <Card className="flex-[1_1_300px] shadow-sm border-indigo-100 bg-gradient-to-br from-indigo-50 to-white">
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

           <Card className="flex-[1_1_300px] shadow-sm">
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
                   <Button variant="outline" className="w-full text-xs h-8">View Master Distribution Map</Button>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Row 3: Institution Leaderboard */}
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
                   {institutionPerformance.map((inst, index) => (
                     <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-bold text-gray-900">{inst.name}</td>
                        <td className="p-4 text-center">
                          <Badge variant="outline" className={inst.status === 'Active' ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}>
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
    </div>
  );
};