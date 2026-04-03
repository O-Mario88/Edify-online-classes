import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AlertCircle, Calendar, GraduationCap, ArrowUpRight, ArrowDownRight, Clock, Activity, Target, MessageCircle, AlertTriangle, FileText, Settings, BookOpen } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Progress } from '../components/ui/progress';
import { ParentResourceEngagementPanel } from '../components/dashboard/ParentResourceEngagementPanel';
import { StreakTracker } from '../components/competition/StreakTracker';
import { AchievementShowcase } from '../components/competition/AchievementShowcase';
import { ParentActionCenter } from '../components/parents/ParentActionCenter';
import { CelebrationEngineWidget } from '../components/dashboard/CelebrationEngineWidget';
import { IntelligenceCard } from '../components/dashboard/IntelligenceCard';
import { SmartStudyPlanner } from '../components/students/SmartStudyPlanner';

export const ParentDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const parent = userProfile as any;
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await apiClient.get('/analytics/parent-dashboard/');
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data, falling back to mock data:', error);
        setDashboardData({
          intelligence: [
            {
              title: 'Doing Well In',
              value: 'Mathematics',
              trendValue: 5,
              trendLabel: 'score increase',
              trendDirection: 'up',
              riskLevel: 'healthy',
              alertText: 'Top of class',
              actionLabel: 'Commend child',
              actionLink: '/dashboard/messages',
              drillDownText: 'View assignments',
              drillDownLink: '/dashboard/assignments'
            },
            {
              title: 'Struggling With',
              value: 'Physics',
              trendValue: 12,
              trendLabel: 'score drop',
              trendDirection: 'down',
              riskLevel: 'critical',
              alertText: 'Kinematics failing',
              actionLabel: 'Book tutor',
              actionLink: '/dashboard/tutoring',
              drillDownText: 'View intervention',
              drillDownLink: '/dashboard/interventions'
            },
            {
              title: 'Study Time',
              value: '4h 30m',
              trendValue: 15,
              trendLabel: 'vs last week',
              trendDirection: 'down',
              trendIsGood: true,
              riskLevel: 'warning',
              alertText: 'Below target',
              actionLabel: 'Check library',
              actionLink: '/dashboard/library'
            },
            {
              title: 'Teacher Support',
              value: '2 Plans',
              trendValue: 1,
              trendLabel: 'active',
              trendDirection: 'up',
              riskLevel: 'healthy',
              alertText: 'Teacher engaged',
              drillDownText: 'View plans',
              drillDownLink: '/dashboard/support'
            },
            {
              title: 'Action List',
              value: '1 Task',
              trendValue: 1,
              trendLabel: 'new overdue',
              trendDirection: 'up',
              trendIsGood: false,
              riskLevel: 'warning',
              alertText: 'Physics Lab',
              actionLabel: 'Review task',
              actionLink: '/dashboard/tasks'
            }
          ],
          kpis: {
            attendance: 92,
            classProgress: 75,
            avgPerformance: 81,
            readinessScore: 78,
            missedTasks: 1,
            alertLevel: 'Moderate'
          },
          riskAlert: {
            title: 'Attendance Dropping in Physics',
            description: 'Grace has missed 2 of the last 3 online Physics sessions.',
            action: 'Review recorded lessons and submit absentee task.',
            status: 'Pending Parent Review'
          },
          weeklySummary: {
            aiNarrative: 'Grace is performing well overall, but her Physics grades have dipped recently due to missed sessions.',
            strongestSubject: 'Mathematics',
            weakestTopic: 'Kinematics',
            assessmentTrend: 'Trending down in Sciences',
            recommendedFocus: 'Review Kinematics Video and complete pending Lab.'
          },
          childPerformance: {
            name: 'Grace',
            grade: 'Senior 2',
            subjects: [
               { name: 'Mathematics', completion: 80, attendance: 95, lastScore: 88, teacherComment: 'Excellent work', trend: 'up', revisionNeeded: 'None' },
               { name: 'Physics', completion: 60, attendance: 70, lastScore: 55, teacherComment: 'Needs to catch up on labs', trend: 'down', revisionNeeded: 'Kinematics' }
            ]
          }
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
          <p className="text-gray-600">Loading Early Warning & Support Hub...</p>
        </div>
      </div>
    );
  }

  const { kpis, riskAlert, weeklySummary, childPerformance } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Parent Support Portal</h1>
            <p className="text-gray-600 mt-1">Action-focused early warning and progression dashboard.</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline"><Settings className="w-4 h-4 mr-2" /> Notification Preferences</Button>
          </div>
        </div>
        
        <Tabs defaultValue="academics" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md bg-gray-100/80 mb-6">
            <TabsTrigger value="academics" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Academic Performance</TabsTrigger>
            <TabsTrigger value="finance" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Household Finances</TabsTrigger>
          </TabsList>

          <TabsContent value="academics" className="space-y-8 mt-0">
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

           <Card className="shadow-sm border-indigo-100 bg-gradient-to-br from-indigo-50 to-white">
              <CardHeader className="pb-2 border-b border-indigo-50">
                 <CardTitle className="text-md font-semibold text-indigo-900 flex items-center">
                   <Activity className="w-4 h-4 mr-2 text-indigo-600" /> AI Weekly Summary
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                 <p className="text-sm text-gray-700 leading-relaxed">
                   {weeklySummary.aiNarrative}
                 </p>
                 <div className="space-y-2 text-sm bg-white p-3 rounded-md border border-indigo-100 shadow-sm">
                   <div className="flex justify-between border-b pb-1">
                     <span className="text-gray-500">Strongest</span>
                     <span className="font-medium text-green-700">{weeklySummary.strongestSubject}</span>
                   </div>
                   <div className="flex justify-between border-b pb-1">
                     <span className="text-gray-500">Weakest</span>
                     <span className="font-medium text-red-700">{weeklySummary.weakestTopic}</span>
                   </div>
                   <div className="flex justify-between pb-1">
                     <span className="text-gray-500">Trend</span>
                     <span className="font-medium text-gray-900 text-right max-w-[60%]">{weeklySummary.assessmentTrend}</span>
                   </div>
                 </div>
                 <div className="pt-2">
                   <p className="text-xs text-indigo-600 font-bold uppercase mb-1">Focus Request</p>
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
              <SmartStudyPlanner mode="readonly" dailyPlan={[
                 {
                   dayOfWeek: "Monday",
                   date: "Today",
                   tasks: [
                     { id: "1", title: "Review Quadratic Forms", type: "weak_topic", subject: "Mathematics", durationMinutes: 30, isCompleted: true },
                     { id: "2", title: "Complete Physics Lab Report", type: "deadline", subject: "Physics", durationMinutes: 45, isCompleted: false },
                     { id: "3", title: "Read Chapter 4 Notes", type: "custom", subject: "Biology", durationMinutes: 45, isCompleted: false }
                   ]
                 }
               ]} />
           </div>
        </div>

        {/* Phase 8 Resource Engagement Tracking */}
        <ParentResourceEngagementPanel />

        {/* Phase 2 Competition Engine: Parent Visibility */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-1">
              <StreakTracker streaks={[
                { id: '1', title: 'Daily Study', currentStreakCount: 5, longestStreakCount: 12, streakType: 'daily', status: 'active', maintenanceActionText: 'Read 1 resource today' }
              ]} />
           </div>
           <div className="lg:col-span-2">
              <AchievementShowcase badges={[
                { id: 'b1', name: 'Top Improver', description: 'Improved Math score by 15%', category: 'improvement', unlockedAt: '2026-04-01', rarity: 'epic' },
                { id: 'b4', name: 'Perfect Attendance', description: 'Never missed a live session this term', category: 'attendance', unlockedAt: '2026-03-15', rarity: 'legendary' }
              ]} />
           </div>
        </div>

        {/* Row 3: Child Subject Performance Cards */}
        <Card className="shadow-sm">
          <CardHeader className="border-b bg-gray-50/50 pb-4">
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
               <Button variant="outline" size="sm"><FileText className="w-4 h-4 mr-2"/> Download Report</Button>
             </div>
          </CardHeader>
          <CardContent className="p-0">
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left border-collapse">
                 <thead className="bg-gray-50 text-gray-500 border-b">
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
                            <span className="text-gray-600 font-medium">{subj.completion}%</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <Badge variant="outline" className={subj.attendance < 85 ? "text-yellow-600 border-yellow-200" : "text-green-600 border-green-200"}>
                            {subj.attendance}%
                          </Badge>
                        </td>
                        <td className="p-4 text-center font-bold text-gray-900">{subj.lastScore}%</td>
                        <td className="p-4 text-gray-600 italic">"{subj.teacherComment}"</td>
                        <td className="p-4 text-center">
                           {subj.trend === 'up' ? (
                             <ArrowUpRight className="w-4 h-4 text-green-500 mx-auto" />
                           ) : (
                             <ArrowDownRight className="w-4 h-4 text-red-500 mx-auto" />
                           )}
                        </td>
                        <td className="p-4 text-right">
                          {subj.revisionNeeded !== 'None' ? (
                             <span className="text-red-600 font-medium text-xs px-2 py-1 bg-red-50 rounded-full border border-red-100">
                               {subj.revisionNeeded}
                             </span>
                          ) : (
                             <span className="text-gray-400 font-medium text-xs">None</span>
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
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-md flex items-center gap-2"><Settings className="w-4 h-4 text-gray-500" /> Parent Action Center</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-3">
                 <Button variant="outline" className="h-16 flex flex-col justify-center items-center gap-1">
                   <MessageCircle className="w-4 h-4" /> Message Tutor
                 </Button>
                 <Button variant="outline" className="h-16 flex flex-col justify-center items-center gap-1">
                   <Calendar className="w-4 h-4" /> Book Meeting
                 </Button>
                 <Button variant="outline" className="h-16 flex flex-col justify-center items-center gap-1">
                   <BookOpen className="w-4 h-4 text-blue-600" /> View Curriculum
                 </Button>
                 <Button variant="outline" className="h-16 flex flex-col justify-center items-center gap-1">
                   <FileText className="w-4 h-4" /> View Full Report
                 </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <CardTitle className="text-md flex items-center gap-2"><Clock className="w-4 h-4 text-gray-500" /> Upcoming Schedule & Tasks</CardTitle>
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
                   <p className="text-sm text-red-600 font-medium mt-1">Pending Submission (Overdue by 2 hours)</p>
                 </div>
               </div>
               <div className="flex items-start gap-3">
                 <div className="bg-blue-100 text-blue-700 p-2 rounded text-center min-w-[50px]">
                   <p className="text-xs font-bold uppercase">In</p>
                   <p className="text-lg font-bold">2d</p>
                 </div>
                 <div>
                   <p className="font-semibold text-gray-900">Biology - Unit Test 3</p>
                   <p className="text-sm text-gray-600 mt-1">Thursday, 2:00 PM</p>
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>
          </TabsContent>

          <TabsContent value="finance" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border border-emerald-200 dark:border-emerald-800 shadow-sm bg-emerald-50/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-emerald-800 uppercase font-bold">Household Balance Due</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-emerald-900 mt-1">UGX 460,000</div>
                  <p className="text-xs text-emerald-700 mt-2 font-medium">Due by June 15, 2026</p>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-slate-500 uppercase font-bold">Total Invoiced (Term 1)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900 mt-1">UGX 1,760,000</div>
                  <Badge variant="outline" className="mt-2 bg-slate-100 font-medium">2 Dependents</Badge>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm border-blue-200 bg-blue-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-blue-800 uppercase font-bold">Granted Waivers & Bursaries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-blue-900 mt-1">- UGX 100,000</div>
                  <p className="text-xs text-blue-700 mt-2">Sibling Discount Applied (5%)</p>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-sm border-slate-200">
               <CardHeader className="border-b bg-slate-50/50">
                 <CardTitle className="text-lg">Individual Child Ledgers</CardTitle>
                 <CardDescription>Consolidated breakdown of generated bills mapped to your household.</CardDescription>
               </CardHeader>
               <CardContent className="p-0">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-slate-100 text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="font-semibold p-4 uppercase text-xs">Student Name</th>
                        <th className="font-semibold p-4 uppercase text-xs">Class</th>
                        <th className="font-semibold p-4 uppercase text-xs text-right">Invoiced (UGX)</th>
                        <th className="font-semibold p-4 uppercase text-xs text-right">Paid (UGX)</th>
                        <th className="font-semibold p-4 uppercase text-xs text-right">Balance Due</th>
                        <th className="font-semibold p-4 uppercase text-xs text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-slate-50">
                        <td className="p-4 font-bold text-slate-900">Alice Mukasa</td>
                        <td className="p-4 text-slate-600">S2-B</td>
                        <td className="p-4 text-right">800,000</td>
                        <td className="p-4 text-right text-emerald-600 font-medium">800,000</td>
                        <td className="p-4 text-right font-black">0</td>
                        <td className="p-4 text-center"><Badge className="bg-emerald-100 text-emerald-700 border-none">Cleared</Badge></td>
                      </tr>
                      <tr className="hover:bg-slate-50 bg-rose-50/20">
                        <td className="p-4 font-bold text-slate-900">David Ochieng</td>
                        <td className="p-4 text-slate-600">S4-A</td>
                        <td className="p-4 text-right">960,000</td>
                        <td className="p-4 text-right text-emerald-600 font-medium">500,000</td>
                        <td className="p-4 text-right font-black text-rose-600">460,000</td>
                        <td className="p-4 text-center"><Badge variant="destructive" className="border-none">Active Arrears</Badge></td>
                      </tr>
                    </tbody>
                  </table>
               </CardContent>
            </Card>

            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline">Download Consolidated Statement</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Make Online Payment</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
