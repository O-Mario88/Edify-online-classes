import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  BookOpen, Users, TrendingUp, TrendingDown,
  AlertCircle, AlertTriangle, GraduationCap,
  Calendar, Play, ArrowRight, CheckCircle,
  MessageSquare, Target, Clock, Heart, Home,
  Star, Eye, Phone
} from 'lucide-react';
import { toast } from 'sonner';
import { apiGet } from '../../lib/apiClient';
import { DashboardGrid } from '../../components/dashboard/layout/DashboardGrid';
import { DashboardSection } from '../../components/dashboard/layout/DashboardSection';
import { DashboardCard } from '../../components/dashboard/layout/DashboardCard';
import { IntelligenceCard } from '../../components/dashboard/IntelligenceCard';
import { DashboardSkeleton } from '../../components/dashboard/DashboardSkeleton';
import { PLEReadinessGauge } from '../../components/dashboard/PLEReadinessGauge';

// ─── Empty State Data ───
const getEmptyData = () => ({
  child: { name: 'Your Child', class: '—', classId: '', isP7: false, school: '—', classTeacher: '—', position: 0, totalStudents: 0 },
  kpis: { attendance: 0, attendanceTrend: '0', overallProgress: 0, progressTrend: '0', lessonsCompleted: 0, totalLessons: 0, avgScore: 0, streakDays: 0, overdueHomework: 0 },
  subjects: [],
  p7Readiness: { score: 0, state: 'on_track' as const, strongest: '—', weakest: '—', weakAlerts: [], daysToExam: 0 },
  intelligence: [],
  homeSupportActions: [],
  teacherMessages: [],
});

export const PrimaryParentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReturnType<typeof getEmptyData> | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data: apiData, error } = await apiGet<typeof data>('/analytics/primary-parent-dashboard/');
        if (error || !apiData) {
          setData(getEmptyData());
        } else {
          setData(apiData);
        }
      } catch (error) {
        console.error('Error fetching primary parent dashboard:', error);
        setData(getEmptyData());
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || !data) return <DashboardSkeleton />;

  const { child, kpis, subjects, p7Readiness, intelligence, homeSupportActions, teacherMessages } = data;

  return (
    <div className="w-full min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome */}
      <DashboardSection title="">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {child.name}'s Learning Progress
              </h1>
              <p className="text-gray-800 mt-1">
                {child.class} · {child.school} · Class Teacher: {child.classTeacher}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {child.isP7 && (
                <Badge className="bg-amber-100 text-amber-800 flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" /> PLE Year — {p7Readiness.daysToExam} days
                </Badge>
              )}
              <Badge className="bg-blue-100 text-blue-800">
                #{child.position}/{child.totalStudents} in class
              </Badge>
            </div>
          </div>
        </div>
      </DashboardSection>

      {/* Tab Navigation */}
      <DashboardSection title="">
        <div className="col-span-full">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="subjects">Subjects</TabsTrigger>
              <TabsTrigger value="support">Home Support</TabsTrigger>
              <TabsTrigger value="messages">Messages {teacherMessages.filter(m => m.unread).length > 0 && `(${teacherMessages.filter(m => m.unread).length})`}</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-4 space-y-6">
              {/* KPIs */}
              <DashboardGrid>
                <DashboardCard variant="transparent" colSpan={1} mdColSpan={3} lgColSpan={3}>
                  <Card className="h-full border-transparent bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <CardContent className="pt-4 pb-3 text-center">
                      <Calendar className="w-6 h-6 mx-auto text-emerald-800 mb-1" />
                      <p className="text-2xl font-bold text-emerald-800">{kpis.attendance}%</p>
                      <p className="text-xs text-gray-700">Attendance <span className="text-emerald-800">{kpis.attendanceTrend}</span></p>
                    </CardContent>
                  </Card>
                </DashboardCard>
                <DashboardCard variant="transparent" colSpan={1} mdColSpan={3} lgColSpan={3}>
                  <Card className="h-full border-transparent bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <CardContent className="pt-4 pb-3 text-center">
                      <TrendingUp className="w-6 h-6 mx-auto text-blue-800 mb-1" />
                      <p className="text-2xl font-bold text-blue-800">{kpis.overallProgress}%</p>
                      <p className="text-xs text-gray-700">Progress <span className="text-emerald-800">{kpis.progressTrend}</span></p>
                    </CardContent>
                  </Card>
                </DashboardCard>
                <DashboardCard variant="transparent" colSpan={1} mdColSpan={3} lgColSpan={3}>
                  <Card className="h-full border-transparent bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <CardContent className="pt-4 pb-3 text-center">
                      <Star className="w-6 h-6 mx-auto text-purple-800 mb-1" />
                      <p className="text-2xl font-bold text-purple-800">{kpis.avgScore}%</p>
                      <p className="text-xs text-gray-700">Avg Score</p>
                    </CardContent>
                  </Card>
                </DashboardCard>
                <DashboardCard variant="transparent" colSpan={1} mdColSpan={3} lgColSpan={3}>
                  <Card className="h-full border-transparent bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <CardContent className="pt-4 pb-3 text-center">
                      <BookOpen className="w-6 h-6 mx-auto text-amber-800 mb-1" />
                      <p className="text-2xl font-bold text-amber-800">{kpis.lessonsCompleted}/{kpis.totalLessons}</p>
                      <p className="text-xs text-gray-700">Lessons Done</p>
                    </CardContent>
                  </Card>
                </DashboardCard>
              </DashboardGrid>

              {/* Intelligence Cards */}
              <DashboardGrid>
                {intelligence.map((card, idx) => (
                  <DashboardCard variant="transparent" key={idx} colSpan={1} mdColSpan={6} lgColSpan={3}>
                    <IntelligenceCard {...card} />
                  </DashboardCard>
                ))}
              </DashboardGrid>

              {/* P7 PLE Section */}
              {child.isP7 && (
                <DashboardGrid>
                  <DashboardCard variant="transparent" colSpan={1} mdColSpan={12} lgColSpan={4}>
                    <PLEReadinessGauge
                      score={p7Readiness.score}
                      readinessState={p7Readiness.state}
                      strongestSubject={p7Readiness.strongest}
                      weakestSubject={p7Readiness.weakest}
                      weakSubjectAlerts={p7Readiness.weakAlerts}
                    />
                  </DashboardCard>
                  <DashboardCard variant="transparent" colSpan={1} mdColSpan={12} lgColSpan={8}>
                    <Card className="h-full border-transparent bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-700">
                          <GraduationCap className="w-5 h-5" />
                          PLE Readiness — What You Can Do
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-gray-800">
                          {child.name} is <strong>{p7Readiness.state.replace(/_/g, ' ')}</strong> for the PLE.
                          Here's how you can help at home:
                        </p>
                        {p7Readiness.weakAlerts.map((subj) => (
                          <div key={subj} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-700" />
                              <div>
                                <span className="text-sm font-medium">{subj} needs improvement</span>
                                <p className="text-xs text-gray-700">Practice exercises available</p>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" className="border-indigo-200 text-indigo-700 bg-white/50 hover:bg-indigo-50 hover:text-indigo-800 transition-all shadow-sm">Support Tips</Button>
                          </div>
                        ))}
                        <Link to="/primary/p7-readiness">
                          <Button variant="outline" className="w-full mt-2 text-amber-700 border-amber-300">
                            Full PLE Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </DashboardCard>
                </DashboardGrid>
              )}
            </TabsContent>

            {/* Subjects Tab */}
            <TabsContent value="subjects" className="mt-4">
              <DashboardGrid>
                {subjects.map((subj) => (
                  <DashboardCard variant="transparent" key={subj.name} colSpan={1} mdColSpan={6} lgColSpan={6}>
                    <Card className={`h-full border-transparent backdrop-blur-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${subj.score < 55 ? 'bg-red-50/50' : 'bg-white/80'}`}>
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold">{subj.name}</h3>
                          <Badge className={
                            subj.score >= 70 ? 'bg-green-100 text-green-800' :
                            subj.score >= 55 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {subj.score}%
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-gray-700">
                            <span>Completion</span>
                            <span>{subj.completion}%</span>
                          </div>
                          <Progress value={subj.completion} className="h-2" />
                          {subj.weakTopics.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-red-700 font-medium mb-1">Weak Topics:</p>
                              <div className="flex flex-wrap gap-1">
                                {subj.weakTopics.map((topic) => (
                                  <Badge key={topic} variant="outline" className="text-xs text-red-700 border-red-200">
                                    {topic}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          <p className="text-xs text-gray-800 flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
                            {subj.trend === 'up' ? <TrendingUp className="w-3 h-3 text-emerald-700" /> :
                             subj.trend === 'down' ? <TrendingDown className="w-3 h-3 text-red-700" /> :
                             <span className="w-3 h-3">—</span>}
                            {subj.trend === 'up' ? 'Improving' : subj.trend === 'down' ? 'Declining' : 'Stable'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </DashboardCard>
                ))}
              </DashboardGrid>
            </TabsContent>

            {/* Home Support Tab */}
            <TabsContent value="support" className="mt-4 space-y-4">
              <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Home className="w-6 h-6 text-blue-800" />
                    <div>
                      <h3 className="font-semibold text-blue-900">Home Support Actions</h3>
                      <p className="text-sm text-blue-700">Things you can do at home to help {child.name} succeed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {homeSupportActions.map((action) => (
                <Card key={action.id} className={`border-l-4 border-r-0 border-t-0 border-b-0 backdrop-blur-md shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white/80 ${
                  action.completed ? 'border-l-green-400 bg-green-50/50' :
                  action.priority === 'high' ? 'border-l-red-400' :
                  action.priority === 'medium' ? 'border-l-yellow-400' :
                  'border-l-blue-400'
                }`}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-0.5 ${
                          action.completed ? 'bg-green-100' :
                          action.type === 'revision_followup' ? 'bg-purple-100' :
                          action.type === 'reading_support' ? 'bg-blue-100' :
                          action.type === 'mock_prep' ? 'bg-amber-100' :
                          'bg-gray-100'
                        }`}>
                          {action.completed ? <CheckCircle className="w-4 h-4 text-emerald-800" /> :
                           action.type === 'revision_followup' ? <Target className="w-4 h-4 text-purple-800" /> :
                           action.type === 'reading_support' ? <BookOpen className="w-4 h-4 text-blue-800" /> :
                           action.type === 'mock_prep' ? <GraduationCap className="w-4 h-4 text-amber-800" /> :
                           <Home className="w-4 h-4 text-gray-800" />}
                        </div>
                        <div>
                          <p className={`font-medium ${action.completed ? 'text-gray-800' : 'text-gray-900'}`}>
                            {action.title}
                          </p>
                          <p className="text-sm text-gray-700 mt-0.5">{action.description}</p>
                        </div>
                      </div>
                      {!action.completed && (
                        <Button variant="outline" size="sm" className="border-indigo-200 text-indigo-700 bg-white/50 hover:bg-indigo-50 transition-all shadow-sm" onClick={() => { setData(prev => prev ? { ...prev, homeSupportActions: prev.homeSupportActions.map(a => a.id === action.id ? { ...a, completed: true } : a) } : prev); toast.success('Activity marked as done!'); }}>Mark Done</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages" className="mt-4 space-y-3">
              {teacherMessages.map((msg, idx) => (
                <Card key={idx} className={`cursor-pointer backdrop-blur-md shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${msg.unread ? 'border-blue-300 bg-blue-50/80' : 'bg-white/80 border-transparent'}`}>
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${msg.unread ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <MessageSquare className={`w-5 h-5 ${msg.unread ? 'text-blue-800' : 'text-gray-800'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-900">{msg.from}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-800">{msg.time}</span>
                            {msg.unread && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                          </div>
                        </div>
                        <p className="text-sm font-medium text-gray-700">{msg.subject}</p>
                        <p className="text-sm text-gray-700 mt-0.5">{msg.preview}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 border-indigo-200 text-indigo-700 bg-white/50 hover:bg-indigo-50 shadow-sm transition-all" onClick={() => { window.open('tel:+256700000000'); toast.info('Opening phone dialer...'); }}>
                  <Phone className="w-4 h-4 mr-2" /> Call Class Teacher
                </Button>
                <Button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md hover:shadow-lg transition-all" onClick={() => toast.success('Message sent to class teacher. You will receive a reply in the Messages tab.')}>
                  <MessageSquare className="w-4 h-4 mr-2" /> Send Message
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardSection>
      </div>
    </div>
  );
};

export default PrimaryParentDashboard;
