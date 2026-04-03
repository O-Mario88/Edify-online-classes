import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api';
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
import { InstitutionTeacherWellness } from '../components/teachers/InstitutionTeacherWellness';
import { TeacherCollabHub } from '../components/teachers/TeacherCollabHub';
import { IndependentEarningsIntelligence } from '../components/teachers/IndependentEarningsIntelligence';
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

  const teacher = user as unknown as Teacher;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesResponse, usersResponse, sessionsResponse] = await Promise.all([
          fetch('/data/courses.json'),
          fetch('/data/users.json'),
          fetch('/data/live-sessions.json')
        ]);
        
        const coursesData = await coursesResponse.json();
        const usersData = await usersResponse.json();
        const sessionsData = await sessionsResponse.json();
        
        setLevels(coursesData.levels);
        setStudents(usersData.students);
        
        // Calculate teacher stats
        const teacherStats: TeacherStats = {
          totalStudents: teacher.totalStudents,
          activeClasses: teacher.classes?.length || 0,
          totalEarnings: teacher.earnings?.totalEarned || 0,
          monthlyEarnings: teacher.earnings?.currentMonth || 0,
          pendingPayouts: teacher.earnings?.pendingPayouts || 0,
          completedSessions: sessionsData.pastSessions.filter((s: any) => s.teacherId === teacher.id).length,
          avgRating: teacher.rating,
          totalContent: Math.floor(Math.random() * 200) + 50, // Simulated content count
          intelligence: [
            {
              title: 'Class Declining',
              value: 'S3 Physics',
              trendValue: 12,
              trendLabel: 'avg score drop',
              trendDirection: 'down',
              riskLevel: 'critical',
              alertText: 'Kinematics failing',
              actionLabel: 'Assign revision',
              actionLink: '/dashboard/library',
              drillDownText: 'View topic analysis',
              drillDownLink: '/dashboard/analytics'
            },
            {
              title: 'Need Intervention',
              value: '8 Students',
              trendValue: 3,
              trendLabel: 'new at risk',
              trendDirection: 'up',
              trendIsGood: false,
              riskLevel: 'warning',
              alertText: 'Check attendance drops',
              actionLabel: 'Message parents',
              actionLink: '/dashboard/students',
              drillDownText: 'View risk roster',
              drillDownLink: '/dashboard/interventions'
            },
            {
              title: 'Qualified Payouts',
              value: '4 Lessons',
              trendValue: 4,
              trendLabel: 'newly monetized',
              trendDirection: 'up',
              riskLevel: 'healthy',
              alertText: 'Ready for review',
              actionLabel: 'Claim payout',
              actionLink: '/dashboard/teacher/store',
              drillDownText: 'View payout ledger',
              drillDownLink: '/dashboard/earnings'
            },
            {
              title: 'Effective Resources',
              value: 'Video 3',
              trendValue: 89,
              trendLabel: 'recovery rate',
              trendDirection: 'up',
              riskLevel: 'healthy',
              alertText: 'Highest impact',
              drillDownText: 'View engagement stats',
              drillDownLink: '/dashboard/resources'
            }
          ]
        };
        setStats(teacherStats);

        // Get classes taught by this teacher
        const teacherClasses: ClassOverview[] = [];
        coursesData.levels.forEach((level: any) => {
          level.classes.forEach((ugandaClass: any) => {
            ugandaClass.terms.forEach((term: any) => {
              term.subjects.forEach((subject: any) => {
                if (subject.teacherId === teacher.id) {
                  teacherClasses.push({
                    id: `${ugandaClass.id}-${subject.id}`,
                    name: ugandaClass.name,
                    level: ugandaClass.level,
                    subject: subject.name,
                    enrolledStudents: Math.floor(Math.random() * 50) + 10,
                    completionRate: Math.floor(Math.random() * 40) + 60,
                    lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
                  });
                }
              });
            });
          });
        });
        setClasses(teacherClasses);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Signature Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
               <h1 className="text-3xl font-bold tracking-tight text-slate-900">Teaching Command Center</h1>
               <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 mt-1">Uganda Curriculum</Badge>
            </div>
            <p className="text-slate-500 font-medium">Welcome back, {teacher.name}. Here is your command center.</p>
          </div>
          <div className="flex gap-3">
             <Button onClick={() => navigate('/dashboard/teacher/marks-upload')} size="lg" className="bg-indigo-600 hover:bg-indigo-700 shadow-sm font-bold tracking-wide">
                Upload Target Grades
             </Button>
          </div>
        </div>

        {/* Intelligence System Block (Hero Strip) */}
        <div className="flex flex-wrap gap-4 mb-8">
          {stats?.intelligence?.map((card: any, i: number) => (
             <div key={i} className="flex-[1_1_250px] flex flex-col">
                <div className="flex-1 h-full">
                  <IntelligenceCard {...card} />
                </div>
             </div>
          ))}
        </div>

        {/* Teacher Personal Planner */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 mt-6">
           <div className="lg:col-span-2">
              <SmartStudyPlanner 
                 mode="interactive" 
                 titleOverride="My Teaching Planner" 
                 descriptionOverride="Track your lesson prep, grading, and administrative tasks"
                 dailyPlan={[
                 {
                   dayOfWeek: "Monday",
                   date: "Today",
                   tasks: [
                     { id: "t-1", title: "Grade Senior 4 Exams", type: "deadline", subject: "Maths", durationMinutes: 120, isCompleted: false },
                     { id: "t-2", title: "Prep Term 2 Topic Outline", type: "custom", subject: "Physics", durationMinutes: 60, isCompleted: true }
                   ]
                 }
               ]} />
           </div>
        </div>

        {/* Phase 2: Interventions & Resource Intelligence */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
           <div className="lg:col-span-1">
             <SmartInterventionBuilder data={{
               topicName: 'Algebraic Formulations',
               targetStudentsCount: 14,
               availableResources: [
                 { id: '1', type: 'video', title: 'Solving for X - Core Demo' },
                 { id: '2', type: 'quiz', title: '5-Question Diagnostic' },
                 { id: '3', type: 'note', title: 'Algebra Rule Set PDF' },
                 { id: '4', type: 'peer_support', title: 'Peer Study Group (Top Improver Mentor)' },
                 { id: '5', type: 'parent_note', title: 'Parent Intervention Notice' }
               ]
             }} />
           </div>
           <div className="lg:col-span-1">
             <ResourceEffectivenessIntelligence 
               subjectContext="Senior 4 Mathematics"
               resources={[
                 { id: 'r1', title: 'Calculus Crash Course', type: 'video', views: 340, avgCompletionRate: 88, impactScore: 14, status: 'highly_effective' },
                 { id: 'r2', title: 'Functions Practice Sheet', type: 'note', views: 45, avgCompletionRate: 30, impactScore: -2, status: 'needs_revision' },
                 { id: 'r3', title: 'Algebra Introduction', type: 'video', views: 12, avgCompletionRate: 15, impactScore: 0, status: 'ignored' }
               ]}
             />
           </div>
           <div className="lg:col-span-1">
             <ParentCommunicationCopilot />
           </div>
           <div className="lg:col-span-1 flex flex-col gap-6">
             <TeacherReflectionAssistant />
             <VoiceNoteWidget />
           </div>
        </div>

        {/* Phase 3: AI Partner & Reputation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
           <div className="lg:col-span-1">
              <AITeachingPartner />
           </div>
           <div className="lg:col-span-1 flex flex-col gap-6">
              <TeacherPerformanceStory />
              {/* Keeping the detailed legacy metric score as well */}
              <TeacherQualityScore metrics={{
                 overallScore: 88,
                 deliveryConsistency: 92,
                 studentEngagement: 84,
                 studentImprovement: 78,
                 markingTurnaroundDays: 2,
                 punctuality: 98,
                 nextImprovementGoal: 'Decrease turnaround on essay assignments'
               }} />
           </div>
           <div className="lg:col-span-1">
              <TeacherGrowthPassport />
           </div>
        </div>

        {/* Phase 4: Business & Institutional Tooling */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
           {teacher.institutionId ? (
              <>
                <div className="md:col-span-1">
                   <InstitutionTeacherWellness />
                </div>
                <div className="md:col-span-1">
                   <TeacherCollabHub />
                </div>
              </>
           ) : (
              <div className="md:col-span-2 lg:col-span-1">
                 <IndependentEarningsIntelligence />
              </div>
           )}
        </div>

        {/* Phase 6: Student Follow Up View (Readonly/Assign Planner) */}
        <div className="grid grid-cols-1 mb-8">
           <div className="lg:col-span-1">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
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
        <TeacherInterventionPanel />

        {/* Phase 2 Competition Engine: Teacher View */}
        <div className="flex flex-wrap gap-6 mb-8 mt-8">
           <div className="flex-[2_2_600px] flex flex-col">
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
           <div className="flex-[1_1_300px] flex flex-col">
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

          <TabsContent value="overview">
            <div className="flex flex-wrap gap-6 items-start">
              {/* Main Content Area */}
              <div className="flex-[2_2_600px] flex flex-col space-y-6">
                
                {/* 1. Next Best Action Queue */}
                <NextBestActionQueue actions={[
                   { id: 'a1', title: 'Grade Senior 4 Exams', description: '24 exams pending grading. Expected turnaround is 2 days.', type: 'grading_blocker', priority: 'high', actionLabel: 'Go to Grading' },
                   { id: 'a2', title: 'Intervene: Joan Doe', description: 'Joan has failed 3 consecutive Physics assignments.', type: 'urgent_academic', priority: 'high', actionLabel: 'Launch Intervention' },
                   { id: 'a3', title: 'Follow-up with Parents (S2)', description: '5 students missed yesterday’s live session.', type: 'attendance_risk', priority: 'medium', actionLabel: 'Message Parents' },
                   { id: 'a4', title: 'Claim Pending Payout', description: 'You have UGX 450,000 cleared for withdrawal.', type: 'payout_blocker', priority: 'low', actionLabel: 'Withdraw Funds', isIndependentContext: true }
                ]} />

                {/* 2. Instant Class Health Cards */}
                <div>
                   <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                     <Users className="w-5 h-5 text-blue-600" />
                     Class Health Monitor
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <ClassHealthCard 
                        id="c1"
                        className="Senior 3 Physics"
                        subject="Physics"
                        attendancePct={94}
                        avgPerformance={72}
                        redAlertStudents={0}
                        weakestTopic="Kinematics"
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
             </div>

              {/* Sidebar Area */}
              <div className="flex-[1_1_300px] flex flex-col space-y-6">
                 {/* 3. Teaching Wins Timeline */}
                 <TeachingWinsTimeline wins={[
                    { id: 'w1', timestamp: 'Today, 10:00 AM', title: 'S3 Physics recovered', description: 'Class average jumped by 12% after your recent intervention block.', impactType: 'score_jump' },
                    { id: 'w2', timestamp: 'Yesterday', title: 'New Resource Trending', description: 'Your "Vectors Summary" notes were downloaded 45 times.', impactType: 'resource_popular' },
                    { id: 'w3', timestamp: 'Yesterday', title: 'Joan Doe Recovered', description: 'Joan scored 85% on her makeup quiz, exiting red-alert status.', impactType: 'intervention_success' },
                    { id: 'w4', timestamp: 'Monday', title: 'Top Attendance', description: 'Your classes had the highest attendance in the school this week.', impactType: 'attendance_improved' }
                 ]} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="classes">
            <Card>
              <CardHeader>
                <CardTitle>All My Classes</CardTitle>
                <p className="text-gray-600">Manage your teaching assignments across different Uganda classes</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-6">
                  {classes.map((classItem) => (
                    <Card key={classItem.id} className="hover:shadow-md transition-shadow flex-[1_1_300px] flex flex-col justify-between">
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

          <TabsContent value="content">
            <div className="space-y-6">
              {/* Upload New Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Upload New Content</CardTitle>
                  <p className="text-gray-600">Add videos, notes, or exercises to the academic marketplace</p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="outline" className="h-24 flex-[1_1_250px] flex flex-col" onClick={() => setIsUploadModalOpen(true)}>
                      <Video className="h-8 w-8 mb-2 text-red-500" />
                      Upload Video
                    </Button>
                    <Button variant="outline" className="h-24 flex-[1_1_250px] flex flex-col" onClick={() => setIsUploadModalOpen(true)}>
                      <FileText className="h-8 w-8 mb-2 text-blue-500" />
                      Add Notes
                    </Button>
                    <Button variant="outline" className="h-24 flex-[1_1_250px] flex flex-col" onClick={() => setIsUploadModalOpen(true)}>
                      <BookOpen className="h-8 w-8 mb-2 text-green-500" />
                      Create Exercise
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

          <TabsContent value="sessions">
            <div className="space-y-6">
              {/* Schedule New Session */}
              <Card>
                <CardHeader>
                  <CardTitle>Schedule New Live Session</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Subject</label>
                      <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                        <option>Select subject...</option>
                        {teacher.subjects?.map(subject => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Class</label>
                      <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                        <option>Select class...</option>
                        {teacher.classes?.map(cls => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Date</label>
                      <input type="date" className="w-full border border-gray-300 rounded-md px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Time</label>
                      <input type="time" className="w-full border border-gray-300 rounded-md px-3 py-2" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">Session Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Senior 2 Mathematics - Quadratic Equations Review"
                      className="w-full border border-gray-300 rounded-md px-3 py-2" 
                    />
                  </div>
                  <div className="mt-6">
                    <Button>
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Session
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingSessions.map((session) => (
                      <div key={session.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{session.title}</h4>
                            <p className="text-sm text-gray-600">{session.date} at {session.time} • {session.duration} minutes</p>
                          </div>
                          <Badge variant="outline">{session.students} registered</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm">
                            <Play className="mr-2 h-4 w-4" />
                            Start Session
                          </Button>
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button size="sm" variant="outline">Cancel</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="earnings">
            <TeacherMonetizationDashboard />
          </TabsContent>
        </Tabs>
      </div>
      <MarketplaceUploadModal 
         isOpen={isUploadModalOpen} 
         onClose={() => setIsUploadModalOpen(false)} 
         defaultCountry={user?.countryCode || 'uganda'} 
      />
    </div>
  );
};