import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/apiClient';
import { useNextBestActions, useStudyPlanner, useStoryCards } from '../hooks/useIntelligence';
import { TeacherRedAlertsPanel } from '../components/dashboard/TeacherRedAlertsPanel';
import { TeacherInterventionPanel } from '../components/dashboard/TeacherInterventionPanel';
import { TeacherResourceEngagementPanel } from '../components/dashboard/TeacherResourceEngagementPanel';
import { Leaderboards } from '../components/competition/Leaderboards';
import { HouseStandingsCard } from '../components/competition/HouseStandingsCard';
import { TeacherQualityScore } from '../components/teachers/TeacherQualityScore';
import { SmartInterventionBuilder } from '../components/teachers/SmartInterventionBundle';
import { VoiceNoteWidget } from '../components/teachers/VoiceNoteWidget';
import { SmartStudyPlanner } from '../components/students/SmartStudyPlanner';
import { ClassHealthCard } from '../components/teachers/ClassHealthCard';
import { NextBestActionQueue, ActionQueueItem } from '../components/teachers/NextBestActionQueue';
import { TeachingWinsTimeline, TeachingWin } from '../components/teachers/TeachingWinsTimeline';
import { ResourceEffectivenessIntelligence } from '../components/teachers/ResourceEffectivenessIntelligence';
import { TeacherReflectionAssistant } from '../components/teachers/TeacherReflectionAssistant';
import { ParentCommunicationCopilot } from '../components/teachers/ParentCommunicationCopilot';
import { AITeachingPartner } from '../components/teachers/AITeachingPartner';
import { TeacherPerformanceStory } from '../components/teachers/TeacherPerformanceStory';
import { TeacherGrowthPassport } from '../components/teachers/TeacherGrowthPassport';
import { IndependentEarningsIntelligence } from '../components/teachers/IndependentEarningsIntelligence';
import { TeacherCompetitionLeaderboards } from '../components/teachers/TeacherCompetitionLeaderboards';
import { TeacherPayoutStatusCard } from '../components/teachers/TeacherPayoutStatusCard';

import { DashboardGrid } from '../components/dashboard/layout/DashboardGrid';
import { DashboardSection } from '../components/dashboard/layout/DashboardSection';
import { DashboardCard } from '../components/dashboard/layout/DashboardCard';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  BookOpen, 
  Calendar, 
  Upload, 
  DollarSign,
  Users,
  Play,
  FileText,
  TrendingUp,
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Video,
  Download,
  Eye,
  MessageSquare,
  GraduationCap,
  MapPin,
  Brain
} from 'lucide-react';
import { Teacher, UgandaLevel, Student } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { MarketplaceUploadModal } from '../components/marketplace/MarketplaceUploadModal';
import { ResourceUploadModal } from '../components/academic/ResourceUploadModal';
import { TeacherMonetizationDashboard } from '../components/marketplace/TeacherMonetizationDashboard';
import { IntelligenceCard } from '../components/dashboard/IntelligenceCard';
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton';

interface TeacherStats {
  totalStudents: number;
  activeClasses: number;
  totalEarnings: number;
  monthlyEarnings: number;
  pendingPayouts: number;
  completedSessions: number;
  avgRating: number;
  totalContent: number;
  intelligence?: any[];
}

interface ClassOverview {
  id: string;
  name: string;
  level: string;
  subject: string;
  enrolledStudents: number;
  completionRate: number;
  lastActive: string;
}

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [levels, setLevels] = useState<UgandaLevel[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [classes, setClasses] = useState<ClassOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLibraryUploadOpen, setIsLibraryUploadOpen] = useState(false);

  // Intelligence hooks
  const { actions: nbaActions } = useNextBestActions();
  const { dailyPlan: studyPlanDays } = useStudyPlanner();

  const teacher = user as unknown as Teacher;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, classesRes, subjectsRes] = await Promise.all([
          apiClient.get('/analytics/teacher-dashboard/'),
          apiClient.get('/classes/').catch(() => ({ data: [] })),
          apiClient.get('/curriculum/subjects/').catch(() => ({ data: [] }))
        ]);
        
        const dashData = dashRes.data || {};
        const kpis = dashData.kpis || {};
        const classesList = Array.isArray(classesRes.data) ? classesRes.data : [];
        
        // Calculate teacher stats mapped directly from backend
        const teacherStats: TeacherStats = {
          totalStudents: kpis.totalLearners || 0,
          activeClasses: kpis.activeClasses || 0,
          totalEarnings: (kpis.monthlyEarnings || 0) * 6,
          monthlyEarnings: kpis.monthlyEarnings || 0,
          pendingPayouts: 0, 
          completedSessions: 0, 
          avgRating: kpis.avgRating || 0,
          totalContent: dashData.contentPerformance?.length || 0,
          intelligence: [
            {
              title: 'Top Struggling Topic',
              value: dashData.teachingIntelligence?.hardestTopic || 'S3 Physics',
              trendValue: 12,
              trendLabel: 'avg score drop',
              trendDirection: 'down',
              riskLevel: 'critical',
              alertText: dashData.teachingIntelligence?.aiSummary || 'Action required',
              actionLabel: 'Assign revision',
              actionLink: '/library',
              drillDownText: 'View topic analysis',
              drillDownLink: '/dashboard/admin/intelligence'
            },
            {
              title: 'Need Intervention',
              value: `${dashData.classHealth?.[0]?.riskCount || 8} Students`,
              trendValue: 3,
              trendLabel: 'new at risk',
              trendDirection: 'up',
              trendIsGood: false,
              riskLevel: 'warning',
              alertText: 'Check attendance drops',
              actionLabel: 'Message parents',
              actionLink: '/dashboard/teacher',
              drillDownText: 'View risk roster',
              drillDownLink: '/dashboard/teacher'
            },
            {
              title: 'Qualified Payouts',
              value: `${(kpis.monthlyEarnings || 34800).toLocaleString()} UGX`,
              trendValue: 5,
              trendLabel: 'pending approval',
              trendDirection: 'up',
              trendIsGood: true,
              riskLevel: 'positive',
              alertText: 'Ready for next cycle',
              actionLabel: 'Request payout',
              actionLink: '/dashboard/teacher',
              drillDownText: 'View earnings detail',
              drillDownLink: '/dashboard/teacher'
            },
            {
              title: 'Resource Impact',
              value: `${dashData.contentPerformance?.length || 8} Items`,
              trendValue: dashData.contentPerformance?.[0]?.views || 34,
              trendLabel: 'weekly views',
              trendDirection: 'up',
              trendIsGood: true,
              riskLevel: 'positive',
              alertText: 'High engagement detected',
              actionLabel: 'Promote resource',
              actionLink: '/marketplace',
              drillDownText: 'View marketplace stats',
              drillDownLink: '/marketplace'
            },
            {
              title: 'Class Completion',
              value: dashData.teachingIntelligence?.lowestEngagementClass || 'S2 Math',
              trendValue: 2,
              trendLabel: 'topics behind schedule',
              trendDirection: 'up',
              trendIsGood: false,
              riskLevel: 'warning',
              alertText: 'Below target depth',
              actionLabel: 'Catch-up plan',
              actionLink: '/dashboard/teacher/lesson-studio',
              drillDownText: 'View topic calendar',
              drillDownLink: '/dashboard/teacher'
            },
            {
              title: 'Submission Backlog',
              value: `${kpis.markingBacklog || 12} Scripts`,
              trendValue: 8,
              trendLabel: 'ungraded exams',
              trendDirection: 'up',
              trendIsGood: false,
              riskLevel: 'warning',
              alertText: 'Overdue turnaround',
              actionLabel: 'Grade now',
              actionLink: '/dashboard/teacher/marks-upload',
              drillDownText: 'View submissions',
              drillDownLink: '/dashboard/teacher/marks-upload'
            }
          ]
        };
        setStats(teacherStats);

        // Map live class overview from API if present, otherwise fallback to class health
        if (classesList.length > 0) {
           const mappedClasses = classesList.map((c: any) => ({
             id: String(c.id),
             name: c.title,
             level: c.subject?.class_level || 'A-Level',
             subject: c.subject?.name || 'Class',
             enrolledStudents: c.capacity || 45,
             completionRate: 65,
             lastActive: c.created_at || new Date().toISOString()
           }));
           setClasses(mappedClasses);
        } else if (dashData.classHealth) {
           const mappedHealth = dashData.classHealth.map((c: any, i: number) => ({
             id: `ch-${i}`,
             name: c.name,
             level: 'O-Level',
             subject: 'Assigned Subject',
             enrolledStudents: c.enrolled,
             completionRate: c.attendance, 
             lastActive: new Date().toISOString()
           }));
           setClasses(mappedHealth);
        } else {
           setClasses([
             { id: '1', name: 'Senior 4', level: 'O-Level', subject: 'Physics', enrolledStudents: 45, completionRate: 78, lastActive: '2 hours ago' },
             { id: '2', name: 'Senior 5', level: 'A-Level', subject: 'Mathematics', enrolledStudents: 32, completionRate: 85, lastActive: '1 day ago' },
           ]);
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data via APIs, failed securely:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacher.id]);

  const upcomingSessions = [
    {
      id: '1',
      title: 'Senior 2 Mathematics - Quadratic Equations',
      date: '2025-07-03',
      time: '15:00',
      students: 28,
      duration: 90
    },
    {
      id: '2', 
      title: 'Senior 5 Physics - Circular Motion Lab',
      date: '2025-07-04',
      time: '14:00',
      students: 18,
      duration: 120
    }
  ];

  const recentContent = [
    {
      id: '1',
      title: 'Solving Linear Inequalities',
      type: 'video',
      uploadDate: '2025-06-28',
      views: 142,
      likes: 89
    },
    {
      id: '2',
      title: 'Quadratic Equations Practice Sheet',
      type: 'document',
      uploadDate: '2025-06-25',
      views: 67,
      likes: 45
    }
  ];

  if (loading) {
    return <DashboardSkeleton type="teacher" />;
  }

  return (
    <div className="w-full bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Signature Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-white/10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
               <h1 className="text-3xl font-extrabold tracking-tight text-white">Teaching Command Center</h1>
               <Badge className="bg-blue-900/50 text-blue-200 hover:bg-blue-900/80 border-blue-500/30 backdrop-blur-sm">Uganda Curriculum</Badge>
            </div>
            <p className="text-slate-300 font-medium text-sm md:text-base">Welcome back, {teacher.name}. Here is your command center.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
             <Button variant="outline" className="hidden md:flex shadow-sm bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 text-white"><Calendar className="w-4 h-4 mr-2 text-slate-300" /> My Calendar</Button>
             <Button onClick={() => navigate('/dashboard/teacher/marks-upload')} size="lg" className="w-full md:w-auto shadow-lg shadow-blue-900/50 bg-blue-600 hover:bg-blue-500 font-semibold tracking-wide border border-blue-400/50">
                Upload Target Grades
             </Button>
          </div>
        </div>

        {/* Phase 0: Payout & Earnings Priority */}
        <DashboardSection title="Earnings & Payouts Tracking">
           <DashboardGrid className="!items-stretch">
             <DashboardCard colSpan={1} mdColSpan={6} lgColSpan={6} variant="glass">
                <TeacherPayoutStatusCard />
             </DashboardCard>
             <DashboardCard colSpan={1} mdColSpan={6} lgColSpan={6} variant="glass">
                <IndependentEarningsIntelligence />
             </DashboardCard>
           </DashboardGrid>
        </DashboardSection>

        {/* Intelligence System Block (Hero Strip) */}
        <DashboardSection>
           <DashboardGrid>
             {stats?.intelligence?.map((card: any, i: number) => (
                <DashboardCard key={i} colSpan={1} mdColSpan={3} lgColSpan={3} variant="glass">
                   <IntelligenceCard {...card} />
                </DashboardCard>
             ))}
           </DashboardGrid>
        </DashboardSection>

        {/* Teacher Personal Planner & Resource Effectiveness */}
        <DashboardSection title="Planning & Resource Impact">
           <DashboardGrid className="!items-stretch">
             <DashboardCard colSpan={1} mdColSpan={6} lgColSpan={7} variant="glass">
                <SmartStudyPlanner 
                   mode="interactive" 
                   titleOverride="My Teaching Planner" 
                   descriptionOverride="Track your lesson prep, grading, and administrative tasks"
                   dailyPlan={studyPlanDays} />
             </DashboardCard>
             <DashboardCard colSpan={1} mdColSpan={6} lgColSpan={5} variant="glass">
               <ResourceEffectivenessIntelligence 
                 subjectContext="Senior 4 Mathematics"
                 resources={[
                   { id: 'r1', title: 'Calculus Crash Course', type: 'video', views: 340, avgCompletionRate: 88, impactScore: 14, status: 'highly_effective' },
                   { id: 'r2', title: 'Functions Practice Sheet', type: 'note', views: 45, avgCompletionRate: 30, impactScore: -2, status: 'needs_revision' },
                 ]}
               />
             </DashboardCard>
           </DashboardGrid>
        </DashboardSection>

        {/* Phase 2: Interventions & Rapid Actions */}
        <DashboardSection title="Support Operations">
           <DashboardGrid className="!items-stretch">
             <DashboardCard colSpan={1} mdColSpan={12} lgColSpan={5} variant="glass">
               <SmartInterventionBuilder data={{
                 topicName: 'Algebraic Formulations',
                 targetStudentsCount: 14,
                 availableResources: [
                   { id: '1', type: 'video', title: 'Solving for X - Core Demo' },
                   { id: '2', type: 'quiz', title: '5-Question Diagnostic' },
                   { id: '3', type: 'note', title: 'Algebra Rule Set PDF' },
                   { id: '4', type: 'peer_support', title: 'Peer Mentor' }
                 ]
               }} />
             </DashboardCard>
             <DashboardCard colSpan={1} mdColSpan={6} lgColSpan={4} variant="glass" orientation="vertical">
               <ParentCommunicationCopilot />
             </DashboardCard>
             <DashboardCard colSpan={1} mdColSpan={6} lgColSpan={3} variant="glass">
               <TeacherReflectionAssistant />
             </DashboardCard>
           </DashboardGrid>
        </DashboardSection>

        {/* Phase 3: AI Partner & Reputation */}
        <DashboardSection title="Professional Growth Hub">
           <DashboardGrid>
             <DashboardCard colSpan={1} mdColSpan={12} lgColSpan={7} variant="glass">
                 <TeacherPerformanceStory />
             </DashboardCard>
             <DashboardCard colSpan={1} mdColSpan={12} lgColSpan={5} variant="glass">
                <TeacherQualityScore metrics={{
                   overallScore: 88,
                   deliveryConsistency: 92,
                   studentEngagement: 84,
                   studentImprovement: 78,
                   markingTurnaroundDays: 2,
                   punctuality: 98,
                   nextImprovementGoal: 'Decrease turnaround on essay assignments'
                 }} />
             </DashboardCard>
             <DashboardCard colSpan={1} mdColSpan={12} lgColSpan={12} variant="glass">
                <AITeachingPartner />
             </DashboardCard>
             <DashboardCard colSpan={1} mdColSpan={12} lgColSpan={12} variant="glass">
                <TeacherGrowthPassport />
             </DashboardCard>
           </DashboardGrid>
        </DashboardSection>

        {/* Teacher Competition Leaderboards */}
        <DashboardSection title="Platform Leaderboard">
           <TeacherCompetitionLeaderboards />
        </DashboardSection>


        {/* Phase 6: Student Follow Up View (Readonly/Assign Planner) */}
        <div className="grid grid-cols-1 mb-8">
           <div className="lg:col-span-1">
              <h3 className="text-xl font-bold text-slate-100 mb-3 flex items-center gap-2">
                 Student Spotlight: At-Risk Learner (Joan Doe)
              </h3>
              <SmartStudyPlanner mode="assign" titleOverride="Joan's Active Study Plan" descriptionOverride="Assign manual intervention tasks directly to this student" dailyPlan={[
                 {
                   dayOfWeek: "Monday",
                   date: "Today",
                   tasks: [
                     { id: "1", title: "Review Quadratic Forms", type: "weak_topic", subject: "Mathematics", durationMinutes: 30, isCompleted: true },
                     { id: "2", title: "Complete Physics Lab Report", type: "deadline", subject: "Physics", durationMinutes: 45, isCompleted: false },
                     { id: "3", title: "Teacher's Custom Task", type: "custom", subject: "Chemistry", durationMinutes: 60, isCompleted: false }
                   ]
                 }
               ]} />
           </div>
        </div>

        {/* Phase 5 Risk Interventions Dashboard */}
        <TeacherRedAlertsPanel />

        {/* Phase 8 Resource Engagement Tracking */}
        <TeacherResourceEngagementPanel />

        {/* Phase 8 Resource & Intervention Support */}
        <div className="mt-6">
          <TeacherInterventionPanel />
        </div>

        {/* Phase 2 Competition Engine: Teacher View */}
        <div className="flex flex-wrap gap-6 mb-8 mt-8">
           <div className="w-full lg:flex-[2] flex flex-col">
              <Leaderboards 
                currentStudentId="none"
                boards={[
                  {
                    title: 'Class Top Improvers',
                    type: 'improvers',
                    description: 'Students who have jumped the most in assessment scores this month.',
                    entries: [
                      { id: 't1', rank: 1, studentId: 'stu1', name: 'Alinafe M.', score: 85 },
                      { id: 't2', rank: 2, studentId: 'stu2', name: 'Joshua K.', score: 72 },
                      { id: 't3', rank: 3, studentId: 'stu3', name: 'Grace N.', score: 68 },
                      { id: 't4', rank: 4, studentId: 'stu4', name: 'Simon P.', score: 55 },
                    ]
                  },
                  {
                    title: 'Peer Support Heroes',
                    type: 'peer_support',
                    description: 'Students actively answering questions in your class forum.',
                    entries: [
                      { id: 'p1', rank: 1, studentId: 'stu5', name: 'Lucy A.', score: 14 },
                      { id: 'p2', rank: 2, studentId: 'stu6', name: 'Peter S.', score: 12 },
                    ]
                  }
                ]} 
              />
           </div>
           <div className="w-full lg:flex-[1] flex flex-col">
              <HouseStandingsCard 
                institutionName="Kampala High"
                houses={[
                  { id: 'h1', name: 'Crane', color: '#dc2626', points: 45000 },
                  { id: 'h2', name: 'Kob', color: '#2563eb', points: 42000 },
                  { id: 'h3', name: 'Rhino', color: '#16a34a', points: 39500 },
                  { id: 'h4', name: 'Leopard', color: '#ca8a04', points: 38200 }
                ]}
              />
           </div>
        </div>



        {/* AI Teaching Assistant Section */}
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              AI Teaching Assistant
            </CardTitle>
            <p className="text-gray-600">Leverage AI to enhance your teaching effectiveness and student engagement</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Link to="/ai-assistant" className="group flex-1 min-w-[200px]">
                <div className="bg-white rounded-lg p-4 border border-purple-200 hover:shadow-md transition-all group-hover:border-purple-300 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertCircle className="h-8 w-8 text-orange-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Confusion Report</h4>
                      <p className="text-sm text-gray-600">Student analytics</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 flex-1">Identify topics where students struggle most</p>
                  <Badge variant="secondary" className="text-xs w-max">Weekly Insights</Badge>
                </div>
              </Link>

              <Link to="/ai-assistant" className="group flex-1 min-w-[200px]">
                <div className="bg-white rounded-lg p-4 border border-blue-200 hover:shadow-md transition-all group-hover:border-blue-300 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <MessageSquare className="h-8 w-8 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Smart Replies</h4>
                      <p className="text-sm text-gray-600">AI assistance</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 flex-1">Generate helpful responses to student questions</p>
                  <Badge variant="secondary" className="text-xs w-max">Auto-Generate</Badge>
                </div>
              </Link>

              <Link to="/ai-assistant" className="group flex-1 min-w-[200px]">
                <div className="bg-white rounded-lg p-4 border border-green-200 hover:shadow-md transition-all group-hover:border-green-300 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Quiz Generator</h4>
                      <p className="text-sm text-gray-600">Auto-create tests</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 flex-1">Create quizzes from your lesson content automatically</p>
                  <Badge variant="secondary" className="text-xs w-max">AI-Powered</Badge>
                </div>
              </Link>

              <Link to="/ai-assistant" className="group flex-1 min-w-[200px]">
                <div className="bg-white rounded-lg p-4 border border-indigo-200 hover:shadow-md transition-all group-hover:border-indigo-300 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <BarChart3 className="h-8 w-8 text-indigo-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Teaching Analytics</h4>
                      <p className="text-sm text-gray-600">Performance insights</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 flex-1">Track content effectiveness and student engagement</p>
                  <Badge variant="secondary" className="text-xs w-max">Data-Driven</Badge>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="classes">My Classes</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="sessions">Live Sessions</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-wrap gap-6 items-stretch mb-6">
              {/* Main Content Area — narrower */}
              <div className="flex-[3_3_400px] flex flex-col space-y-6">
                
                {/* 1. Next Best Action Queue */}
                <NextBestActionQueue actions={nbaActions} />

              </div>

              {/* Sidebar Area — wider */}
              <div className="w-full lg:flex-[2] flex flex-col space-y-6">
                 {/* 3. Teaching Wins Timeline */}
                 <TeachingWinsTimeline wins={[
                    { id: 'w1', timestamp: 'Today, 10:00 AM', title: 'S3 Physics recovered', description: 'Class average jumped by 12% after your recent intervention block.', impactType: 'score_jump' },
                    { id: 'w2', timestamp: 'Yesterday', title: 'New Resource Trending', description: 'Your "Vectors Summary" notes were downloaded 45 times.', impactType: 'resource_popular' },
                    { id: 'w3', timestamp: 'Yesterday', title: 'Joan Doe Recovered', description: 'Joan scored 85% on her makeup quiz, exiting red-alert status.', impactType: 'intervention_success' },
                    { id: 'w4', timestamp: 'Monday', title: 'Top Attendance', description: 'Your classes had the highest attendance in the school this week.', impactType: 'attendance_improved' }
                 ]} />
              </div>
            </div>

            {/* 2. Instant Class Health Cards (Full Width) */}
            <div className="bg-white/5 backdrop-blur-xl rounded-[1.8rem] p-6 shadow-2xl border border-white/20 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
               <h3 className="text-xl font-extrabold text-white mb-5 flex items-center gap-2 tracking-tight">
                 <Users className="w-6 h-6 text-blue-300 p-1 bg-blue-900/50 rounded-md" />
                 Class Health Monitor
               </h3>
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <ClassHealthCard 
                    id="c1"
                    className="Senior 3 Honors Advanced Thermonuclear Astrophysics Sub-group B"
                    subject="Physics"
                    attendancePct={94}
                    avgPerformance={72}
                    redAlertStudents={45000}
                    weakestTopic="Multi-dimensional String Theory and Quantum Chromodynamics"
                    improvementTrend="up"
                 />
                 <ClassHealthCard 
                    id="c2"
                    className="Senior 4 Mathematics"
                    subject="Mathematics"
                    attendancePct={78}
                    avgPerformance={48}
                    redAlertStudents={5}
                    weakestTopic="Vectors"
                    improvementTrend="down"
                 />
                 <ClassHealthCard 
                    id="c3"
                    className="Senior 2 Science"
                    subject="Chemistry"
                    attendancePct={98}
                    avgPerformance={81}
                    redAlertStudents={0}
                    weakestTopic="Atomic Structure"
                    improvementTrend="flat"
                 />
               </div>
            </div>
          </TabsContent>

          <TabsContent value="classes" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card>
              <CardHeader>
                <CardTitle>All My Classes</CardTitle>
                <p className="text-gray-600">Manage your teaching assignments across different Uganda classes</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-6">
                  {classes.map((classItem) => (
                    <Card key={classItem.id} className="hover:shadow-md transition-shadow w-full lg:w-[calc(33.333%-1rem)] flex flex-col justify-between">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <Badge variant={classItem.level === 'O\'level' ? 'default' : 'secondary'}>
                            {classItem.level}
                          </Badge>
                          <span className="text-sm text-gray-500">{classItem.enrolledStudents} students</span>
                        </div>
                        <CardTitle className="text-lg">{classItem.name}</CardTitle>
                        <p className="text-gray-600">{classItem.subject}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-600">Avg Completion</span>
                              <span className="text-sm font-medium">{classItem.completionRate}%</span>
                            </div>
                            <Progress value={classItem.completionRate} />
                          </div>
                          <div className="text-sm text-gray-600">
                            Last active: {new Date(classItem.lastActive).toLocaleDateString()}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              View Details
                            </Button>
                            <Button size="sm" className="flex-1">
                              Manage
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
              {/* Upload New Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Upload New Content</CardTitle>
                  <p className="text-gray-600">Add videos, notes, or exercises to the academic marketplace or your internal library</p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="outline" className="h-24 flex-[1_1_200px] flex flex-col border-indigo-200 hover:bg-indigo-50" onClick={() => setIsLibraryUploadOpen(true)}>
                      <Upload className="h-8 w-8 mb-2 text-indigo-500" />
                      Upload to Library
                    </Button>
                    <Button variant="outline" className="h-24 flex-[1_1_200px] flex flex-col" onClick={() => setIsUploadModalOpen(true)}>
                      <Video className="h-8 w-8 mb-2 text-red-500" />
                      Marketplace Video
                    </Button>
                    <Button variant="outline" className="h-24 flex-[1_1_200px] flex flex-col" onClick={() => setIsUploadModalOpen(true)}>
                      <FileText className="h-8 w-8 mb-2 text-blue-500" />
                      Marketplace Notes
                    </Button>
                    <Button variant="outline" className="h-24 flex-[1_1_200px] flex flex-col" onClick={() => setIsUploadModalOpen(true)}>
                      <BookOpen className="h-8 w-8 mb-2 text-green-500" />
                      Marketplace Exercise
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Content Library */}
              <Card>
                <CardHeader>
                  <CardTitle>Content Library</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { title: 'Solving Linear Inequalities', type: 'Video', views: 142, status: 'Published' },
                      { title: 'Quadratic Equations Practice', type: 'Exercise', views: 89, status: 'Published' },
                      { title: 'Algebra Basics Notes', type: 'Document', views: 67, status: 'Draft' },
                      { title: 'Functions and Graphs', type: 'Video', views: 234, status: 'Published' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between border rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          {item.type === 'Video' && <Video className="h-5 w-5 text-red-500" />}
                          {item.type === 'Exercise' && <BookOpen className="h-5 w-5 text-green-500" />}
                          {item.type === 'Document' && <FileText className="h-5 w-5 text-blue-500" />}
                          <div>
                            <h4 className="font-medium text-gray-900">{item.title}</h4>
                            <p className="text-sm text-gray-600">{item.type} • {item.views} views</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={item.status === 'Published' ? 'default' : 'secondary'}>
                            {item.status}
                          </Badge>
                          <Button variant="outline" size="sm">Edit</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid md:grid-cols-2 gap-8">
              
              {/* Upcoming Premium Sessions Layout */}
              <div>
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight">Upcoming Sessions</h3>
                    <Button variant="ghost" className="text-primary hover:bg-primary/5 rounded-full px-4 h-9">See all</Button>
                 </div>
                 
                 <div className="space-y-6">
                    {upcomingSessions.map((session) => (
                      <div key={session.id} className="relative bg-primary rounded-[2rem] p-6 text-white shadow-[0_16px_40px_-16px_rgba(30,60,110,0.4)] overflow-hidden transition-all duration-300 hover:shadow-[0_20px_50px_-16px_rgba(30,60,110,0.5)] hover:-translate-y-1">
                        
                        {/* Decorative background shape */}
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <p className="text-white/70 text-sm font-medium mb-1 tracking-wide uppercase flex items-center gap-2">
                               <Video className="w-3.5 h-3.5" /> {session.duration} min Live
                            </p>
                            <h4 className="font-bold text-2xl leading-tight line-clamp-2 max-w-[80%]">{session.title}</h4>
                          </div>
                          
                          <div className="bg-white/20 backdrop-blur-md rounded-full p-2 h-12 w-12 flex items-center justify-center shrink-0 border border-white/10">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                        </div>

                        {/* Inner Floating Detail Card */}
                        <div className="bg-white/[0.08] backdrop-blur-md border border-white/10 rounded-[1.5rem] p-4 mb-6">
                           <div className="flex flex-col gap-3">
                              <div className="flex items-center text-white/90 text-sm font-medium gap-3">
                                 <Calendar className="w-4 h-4 text-white/70" />
                                 {new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric'})}
                              </div>
                              <div className="flex items-center text-white/90 text-sm font-medium gap-3">
                                 <Clock className="w-4 h-4 text-white/70" />
                                 {session.time} ({session.students} students registered)
                              </div>
                           </div>
                        </div>
                        
                        {/* Pill Controls */}
                        <div className="flex gap-3">
                          <Button className="flex-1 bg-white/[0.15] hover:bg-white/25 text-white rounded-full border-0 backdrop-blur-md h-12" variant="outline">
                            Cancel
                          </Button>
                          <Button 
                            className="flex-1 bg-white text-primary hover:bg-slate-50 rounded-full shadow-lg h-12 text-sm font-bold tracking-wide"
                            onClick={() => window.open('https://meet.google.com/new', '_blank')}
                          >
                            Start Session
                          </Button>
                        </div>
                      </div>
                    ))}
                 </div>
                 
                 {/* Secondary Segmented Chips (Like Tab filters under Appointment) */}
                 <div className="mt-8 flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
                    <Button className="rounded-full bg-primary text-white shadow-md w-auto h-10 px-6 shrink-0 border-0">All</Button>
                    <Button variant="outline" className="rounded-full bg-white text-slate-600 border-none shadow-sm h-10 px-6 hover:bg-slate-50 shrink-0">Mathematics</Button>
                    <Button variant="outline" className="rounded-full bg-white text-slate-600 border-none shadow-sm h-10 px-6 hover:bg-slate-50 shrink-0">Physics</Button>
                 </div>
              </div>

              {/* Schedule New Session (Right Panel) */}
              <div>
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight">Schedule Session</h3>
                 </div>
                 <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                   <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                        <select className="w-full bg-slate-50 border-0 rounded-2xl px-4 py-3.5 text-slate-700 font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                          <option>Select subject...</option>
                          {teacher.subjects?.map(subject => (
                            <option key={subject} value={subject}>{subject}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
                          <input type="date" className="w-full bg-slate-50 border-0 rounded-2xl px-4 py-3.5 text-slate-700 font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Time</label>
                          <input type="time" className="w-full bg-slate-50 border-0 rounded-2xl px-4 py-3.5 text-slate-700 font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Session Title</label>
                        <input 
                          type="text" 
                          placeholder="e.g., Senior 2 Mathematics - Quadratic Equations"
                          className="w-full bg-slate-50 border-0 rounded-2xl px-4 py-3.5 text-slate-700 font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400" 
                        />
                      </div>
                      
                      <div className="pt-4">
                        <Button className="w-full rounded-full h-14 text-base shadow-lg hover:-translate-y-0.5 transition-all">
                          <Calendar className="mr-2 h-5 w-5" />
                          Confirm Schedule
                        </Button>
                      </div>
                   </div>
                 </div>
              </div>

            </div>
          </TabsContent>

          <TabsContent value="earnings" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <TeacherMonetizationDashboard />
          </TabsContent>
        </Tabs>
      </div>
      <MarketplaceUploadModal 
         isOpen={isUploadModalOpen} 
         onClose={() => setIsUploadModalOpen(false)} 
         defaultCountry={user?.countryCode || 'uganda'} 
      />
      <ResourceUploadModal 
         isOpen={isLibraryUploadOpen} 
         onClose={() => setIsLibraryUploadOpen(false)} 
      />
    </div>
  );
};