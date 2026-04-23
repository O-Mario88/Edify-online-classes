import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import {
  BookOpen, CheckCircle, Clock, TrendingUp, Target,
  AlertCircle, BarChart3, Flame, Star, GraduationCap,
  Calendar, Play, FileText, ArrowRight
} from 'lucide-react';
import { DashboardGrid } from '../../components/dashboard/layout/DashboardGrid';
import { DashboardSection } from '../../components/dashboard/layout/DashboardSection';
import { apiGet } from '../../lib/apiClient';
import { DashboardCard } from '../../components/dashboard/layout/DashboardCard';
import { IntelligenceCard } from '../../components/dashboard/IntelligenceCard';
import { DashboardSkeleton } from '../../components/dashboard/DashboardSkeleton';
import { PLEReadinessGauge } from '../../components/dashboard/PLEReadinessGauge';

// ─── Empty State Data ───
const getEmptyDashboardData = () => ({
  kpis: { overallProgress: 0, progressTrend: '0', attendance: 0, lessonsCompleted: 0, totalLessons: 0, practicesDone: 0, streakDays: 0, classPosition: 0, totalStudents: 0 },
  subjects: [],
  nextLesson: { subject: '—', topic: 'No upcoming lessons', teacher: '—', time: '—', type: 'lesson' },
  intelligence: [],
  p7Readiness: { isP7: false, score: 0, state: 'on_track' as const, strongest: '—', weakest: '—', weakAlerts: [] },
  todaysTasks: [],
  achievements: [],
});

export const PrimaryStudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const classLevel = (user as any)?.class_level || 'p7';
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReturnType<typeof getEmptyDashboardData> | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data: apiData, error } = await apiGet<typeof data>('/analytics/primary-student-dashboard/');
        if (error || !apiData) {
          setData(getEmptyDashboardData());
        } else {
          setData(apiData);
        }
      } catch (error) {
        console.error('Error fetching primary student dashboard:', error);
        setData(getEmptyDashboardData());
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || !data) return <DashboardSkeleton />;

  const { kpis, subjects, nextLesson, intelligence, p7Readiness, todaysTasks, achievements } = data;

  return (
    <div className="w-full min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Header */}
      <DashboardSection title="">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {(user as any)?.first_name || 'Learner'}! 👋
            </h1>
            <p className="text-gray-800 mt-1">Primary {classLevel.replace('p', '')} · Keep going — you're doing great!</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-orange-100 px-3 py-1.5 rounded-full">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-bold text-orange-700">{kpis.streakDays}-day streak</span>
            </div>
            <div className="flex items-center gap-1 bg-blue-100 px-3 py-1.5 rounded-full">
              <Star className="w-4 h-4 text-blue-700" />
              <span className="text-sm font-bold text-blue-700">#{kpis.classPosition} in class</span>
            </div>
          </div>
        </div>
      </DashboardSection>

      {/* KPI Row */}
      <DashboardSection title="Your Progress">
        <DashboardGrid>
          <DashboardCard variant="transparent" colSpan={1} mdColSpan={3} lgColSpan={3}>
            <Card className="text-center h-full">
              <CardHeader className="pb-1 pt-4"><CardTitle className="text-sm text-gray-700">Overall Progress</CardTitle></CardHeader>
              <CardContent className="pb-4">
                <p className="text-3xl font-bold text-primary">{kpis.overallProgress}%</p>
                <p className="text-xs text-emerald-800 mt-1">{kpis.progressTrend} this week</p>
              </CardContent>
            </Card>
          </DashboardCard>
          <DashboardCard variant="transparent" colSpan={1} mdColSpan={3} lgColSpan={3}>
            <Card className="text-center h-full">
              <CardHeader className="pb-1 pt-4"><CardTitle className="text-sm text-gray-700">Attendance</CardTitle></CardHeader>
              <CardContent className="pb-4">
                <p className="text-3xl font-bold text-emerald-800">{kpis.attendance}%</p>
                <p className="text-xs text-gray-700 mt-1">This term</p>
              </CardContent>
            </Card>
          </DashboardCard>
          <DashboardCard variant="transparent" colSpan={1} mdColSpan={3} lgColSpan={3}>
            <Card className="text-center h-full">
              <CardHeader className="pb-1 pt-4"><CardTitle className="text-sm text-gray-700">Lessons Done</CardTitle></CardHeader>
              <CardContent className="pb-4">
                <p className="text-3xl font-bold text-blue-800">{kpis.lessonsCompleted}/{kpis.totalLessons}</p>
                <Progress value={(kpis.lessonsCompleted / kpis.totalLessons) * 100} className="mt-2 h-2" />
              </CardContent>
            </Card>
          </DashboardCard>
          <DashboardCard variant="transparent" colSpan={1} mdColSpan={3} lgColSpan={3}>
            <Card className="text-center h-full">
              <CardHeader className="pb-1 pt-4"><CardTitle className="text-sm text-gray-700">Practices</CardTitle></CardHeader>
              <CardContent className="pb-4">
                <p className="text-3xl font-bold text-purple-800">{kpis.practicesDone}</p>
                <p className="text-xs text-gray-700 mt-1">Completed</p>
              </CardContent>
            </Card>
          </DashboardCard>
        </DashboardGrid>
      </DashboardSection>

      {/* Intelligence Cards */}
      <DashboardSection title="Maple Says">
        <DashboardGrid>
          {intelligence.map((card, idx) => (
            <DashboardCard variant="transparent" key={idx} colSpan={1} mdColSpan={6} lgColSpan={4}>
               <IntelligenceCard {...card} />
            </DashboardCard>
          ))}
        </DashboardGrid>
      </DashboardSection>

      {/* P7 PLE Readiness (only for P7 students) */}
      {p7Readiness.isP7 && (
        <DashboardSection title="PLE Readiness">
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
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-amber-800" />
                    PLE Preparation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-800 mb-4">
                    Focus on your weak subjects to improve your readiness score before the PLE exam.
                  </p>
                  <div className="space-y-2">
                    {p7Readiness.weakAlerts.map((subj) => (
                      <div key={subj} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-700" />
                          <span className="text-sm font-medium">{subj}</span>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => navigate(`/primary/class/${classLevel}`)}>Practice Now</Button>
                      </div>
                    ))}
                  </div>
                  <Link to="/primary/p7-readiness">
                    <Button className="w-full mt-4" variant="outline">
                      View Full PLE Readiness Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </DashboardCard>
          </DashboardGrid>
        </DashboardSection>
      )}

      {/* Today's Tasks */}
      <DashboardSection title="Today's Tasks">
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {todaysTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      task.type === 'practice' ? 'bg-purple-100' : task.type === 'activity' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {task.type === 'practice' ? <Target className="w-4 h-4 text-purple-800" /> :
                       task.type === 'activity' ? <Play className="w-4 h-4 text-emerald-800" /> :
                       <BookOpen className="w-4 h-4 text-blue-800" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{task.task}</p>
                      <p className="text-xs text-gray-700">{task.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.urgent && <Badge variant="destructive" className="text-xs">Urgent</Badge>}
                    <Button size="sm" onClick={() => navigate(`/primary/class/${classLevel}`)}>Start</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </DashboardSection>

      {/* Subject Performance */}
      <DashboardSection title="My Subjects">
        <DashboardGrid>
          {subjects.map((subj) => (
            <DashboardCard variant="transparent" key={subj.id} colSpan={1} mdColSpan={6} lgColSpan={4}>
              <Card
                className="h-full cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200"
                onClick={() => navigate(`/primary/class/${classLevel}`)}
              >
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>{subj.icon} {subj.name}</span>
                    <ArrowRight className="w-4 h-4 text-gray-800" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Progress</span>
                    <span className="font-semibold">{subj.completion}%</span>
                  </div>
                  <Progress value={subj.completion} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Avg Score</span>
                    <span className={`font-semibold ${subj.avgScore >= 60 ? 'text-emerald-800' : 'text-red-800'}`}>
                      {subj.avgScore}%
                    </span>
                  </div>
                  {subj.weakTopics > 0 && (
                    <p className="text-xs text-red-700 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {subj.weakTopics} weak topic{subj.weakTopics > 1 ? 's' : ''}
                    </p>
                  )}
                  <p className="text-xs text-gray-800">Last: {subj.lastActivity}</p>
                </CardContent>
              </Card>
            </DashboardCard>
          ))}
        </DashboardGrid>
      </DashboardSection>

      {/* Upcoming Lesson */}
      <DashboardSection title="Next Lesson">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <Play className="w-6 h-6 text-blue-800" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{nextLesson.topic}</p>
                <p className="text-sm text-gray-800">{nextLesson.subject} · {nextLesson.teacher}</p>
                <div className="flex items-center gap-1 text-xs text-blue-800 mt-1">
                  <Clock className="w-3 h-3" /> {nextLesson.time}
                </div>
              </div>
            </div>
            <Button onClick={() => navigate(`/primary/class/${classLevel}`)}>Join Lesson</Button>
          </CardContent>
        </Card>
      </DashboardSection>

      {/* Achievements */}
      <DashboardSection title="My Badges">
        <div className="flex flex-wrap gap-4">
          {achievements.map((a) => (
            <div
              key={a.label}
              className={`flex flex-col items-center gap-1 p-4 rounded-xl border ${
                a.earned ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200 opacity-50'
              }`}
            >
              <span className="text-3xl mb-1">{a.emoji}</span>
              <span className="text-xs font-semibold text-gray-700 text-center w-min whitespace-nowrap">{a.label}</span>
              {a.earned && <Badge className="bg-green-100 text-green-700 text-[10px] mt-1 border-none">Earned</Badge>}
            </div>
          ))}
        </div>
      </DashboardSection>
      </div>
    </div>
  );
};

export default PrimaryStudentDashboard;
