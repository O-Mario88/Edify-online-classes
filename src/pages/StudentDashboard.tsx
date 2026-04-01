import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { 
  BookOpen, 
  Calendar, 
  MessageCircle, 
  CreditCard,
  Play,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Award,
  Target,
  Bell,
  MapPin,
  GraduationCap,
  Brain,
  Lightbulb
} from 'lucide-react';
import { Student, UgandaLevel, Teacher } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface LiveSession {
  id: string;
  title: string;
  date: string;
  time: string;
  teacherName: string;
  subjectName: string;
  status: 'upcoming' | 'live' | 'completed';
}

interface ForumActivity {
  id: string;
  title: string;
  author: string;
  category: string;
  replies: number;
  lastActivity: string;
}

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [levels, setLevels] = useState<UgandaLevel[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [forumActivity, setForumActivity] = useState<ForumActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const student = user as Student;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesResponse, usersResponse, sessionsResponse, forumResponse] = await Promise.all([
          fetch('/data/courses.json'),
          fetch('/data/users.json'),
          fetch('/data/live-sessions.json'),
          fetch('/data/forum.json')
        ]);
        
        const coursesData = await coursesResponse.json();
        const usersData = await usersResponse.json();
        const sessionsData = await sessionsResponse.json();
        const forumData = await forumResponse.json();
        
        setLevels(coursesData.levels);
        setTeachers(usersData.teachers);
        
        // Process live sessions data
        const allSessions = [
          ...sessionsData.upcomingSessions.map((s: any) => ({ ...s, status: 'upcoming' })),
          ...sessionsData.liveNow.map((s: any) => ({ ...s, status: 'live' })),
          ...sessionsData.pastSessions.map((s: any) => ({ ...s, status: 'completed' }))
        ];
        setLiveSessions(allSessions.slice(0, 5));

        // Process forum activity
        const recentPosts: ForumActivity[] = [];
        forumData.categories.forEach((category: any) => {
          if (category.posts) {
            category.posts.forEach((post: any) => {
              recentPosts.push({
                id: post.id,
                title: post.title,
                author: post.authorName,
                category: category.name,
                replies: post.replies?.length || 0,
                lastActivity: post.updatedAt || post.createdAt
              });
            });
          }
          // Also check subcategories
          if (category.subcategories) {
            category.subcategories.forEach((sub: any) => {
              if (sub.posts) {
                sub.posts.forEach((post: any) => {
                  recentPosts.push({
                    id: post.id,
                    title: post.title,
                    author: post.authorName,
                    category: sub.name,
                    replies: post.replies?.length || 0,
                    lastActivity: post.updatedAt || post.createdAt
                  });
                });
              }
            });
          }
        });
        
        // Sort by most recent activity and take top 5
        recentPosts.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
        setForumActivity(recentPosts.slice(0, 5));
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getEnrolledSubjects = () => {
    const enrolledSubjects: Array<{
      id: string;
      name: string;
      className: string;
      level: string;
      teacherName: string;
      progress: number;
    }> = [];

    if (!student.enrolledSubjects) return enrolledSubjects;

    levels.forEach(level => {
      level.classes.forEach(ugandaClass => {
        ugandaClass.terms.forEach(term => {
          term.subjects.forEach(subject => {
            if (student.enrolledSubjects.includes(subject.id)) {
              const teacher = teachers.find(t => t.id === subject.teacherId);
              enrolledSubjects.push({
                id: subject.id,
                name: subject.name,
                className: ugandaClass.name,
                level: ugandaClass.level,
                teacherName: teacher?.name || 'Unknown Teacher',
                progress: Math.floor(Math.random() * 80) + 10 // Simulate progress
              });
            }
          });
        });
      });
    });

    return enrolledSubjects;
  };

  const getUpcomingExam = () => {
    if (student.targetExam === 'UCE') {
      return {
        name: 'Uganda Certificate of Education (UCE)',
        date: '2025-11-03',
        daysLeft: Math.ceil((new Date('2025-11-03').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      };
    } else if (student.targetExam === 'UACE') {
      return {
        name: 'Uganda Advanced Certificate of Education (UACE)',
        date: '2025-11-24',
        daysLeft: Math.ceil((new Date('2025-11-24').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      };
    }
    return null;
  };

  const enrolledSubjects = getEnrolledSubjects();
  const upcomingExam = getUpcomingExam();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span className="text-blue-600 font-medium">{student.location}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {student.name}!</h1>
          <div className="flex items-center gap-4 text-gray-600 mt-2">
            <div className="flex items-center gap-1">
              <GraduationCap className="h-4 w-4" />
              <span>{student.class} • {student.level}</span>
            </div>
            {student.school && (
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{student.school}</span>
              </div>
            )}
            {student.combination && (
              <Badge variant="outline">{student.combination}</Badge>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Enrolled Subjects</p>
                  <p className="text-2xl font-bold text-gray-900">{enrolledSubjects.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Forum Posts</p>
                  <p className="text-2xl font-bold text-gray-900">{student.forumPosts}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Amount Paid</p>
                  <p className="text-2xl font-bold text-gray-900">UGX {student.totalPaidUGX?.toLocaleString() || '0'}</p>
                </div>
                <CreditCard className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {enrolledSubjects.length > 0 
                      ? Math.round(enrolledSubjects.reduce((sum, s) => sum + s.progress, 0) / enrolledSubjects.length)
                      : 0}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI-Powered Features Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              AI-Powered Learning Tools
            </CardTitle>
            <p className="text-gray-600">Personalized learning experiences powered by artificial intelligence</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/learning-path" className="group">
                <div className="bg-white rounded-lg p-4 border border-blue-200 hover:shadow-md transition-all group-hover:border-blue-300">
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="h-8 w-8 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Personal Learning Path</h4>
                      <p className="text-sm text-gray-600">AI-customized study plan</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Get a personalized learning journey based on your strengths and areas for improvement</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">Smart Analysis</Badge>
                    <Badge variant="outline" className="text-xs">Adaptive</Badge>
                  </div>
                </div>
              </Link>

              <Link to="/projects" className="group">
                <div className="bg-white rounded-lg p-4 border border-green-200 hover:shadow-md transition-all group-hover:border-green-300">
                  <div className="flex items-center gap-3 mb-3">
                    <Lightbulb className="h-8 w-8 text-green-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Collaborative Projects</h4>
                      <p className="text-sm text-gray-600">Work with classmates</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Join group projects that enhance understanding through hands-on collaboration</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">Team Work</Badge>
                    <Badge variant="outline" className="text-xs">Real Projects</Badge>
                  </div>
                </div>
              </Link>

              <Link to="/peer-tutoring" className="group">
                <div className="bg-white rounded-lg p-4 border border-purple-200 hover:shadow-md transition-all group-hover:border-purple-300">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="h-8 w-8 text-purple-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Peer Tutoring</h4>
                      <p className="text-sm text-gray-600">Learn from peers</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Connect with verified peer tutors and join study groups for collaborative learning</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">Peer Learning</Badge>
                    <Badge variant="outline" className="text-xs">Study Groups</Badge>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Exam Countdown */}
            {upcomingExam && (
              <Card className="border-l-4 border-l-red-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-red-600" />
                      Exam Countdown
                    </CardTitle>
                    <Badge variant="destructive">{upcomingExam.daysLeft} days left</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{upcomingExam.name}</h3>
                      <p className="text-gray-600">Exam starts: {upcomingExam.date}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-red-600">{upcomingExam.daysLeft}</div>
                      <div className="text-sm text-gray-600">days to go</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Link to="/courses" className="flex-1">
                      <Button className="w-full">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Study Now
                      </Button>
                    </Link>
                    <Link to="/live-sessions">
                      <Button variant="outline">
                        <Play className="mr-2 h-4 w-4" />
                        Live Sessions
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enrolled Subjects */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>My Subjects</CardTitle>
                  <Link to="/courses">
                    <Button variant="outline" size="sm">Browse More</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {enrolledSubjects.length > 0 ? (
                  <div className="space-y-4">
                    {enrolledSubjects.map((subject) => (
                      <div key={subject.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{subject.name}</h4>
                            <p className="text-sm text-gray-600">{subject.className} • {subject.level}</p>
                            <p className="text-sm text-gray-500">Taught by {subject.teacherName}</p>
                          </div>
                          <Badge variant="outline">{subject.progress}% complete</Badge>
                        </div>
                        <Progress value={subject.progress} className="mb-3" />
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Play className="mr-2 h-4 w-4" />
                            Continue Learning
                          </Button>
                          <Button size="sm" variant="ghost">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No enrolled subjects</h3>
                    <p className="text-gray-600 mb-4">Start your learning journey by enrolling in subjects</p>
                    <Link to="/courses">
                      <Button>Browse Subjects</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Forum Activity */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Forum Activity</CardTitle>
                  <Link to="/forum">
                    <Button variant="outline" size="sm">View All</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {forumActivity.length > 0 ? (
                  <div className="space-y-4">
                    {forumActivity.map((activity) => (
                      <div key={activity.id} className="border-b last:border-0 pb-3 last:pb-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">{activity.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>by {activity.author}</span>
                              <span>in {activity.category}</span>
                              <span>{activity.replies} replies</span>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(activity.lastActivity).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
                    <p className="text-gray-600 mb-4">Join the community discussions</p>
                    <Link to="/forum">
                      <Button>Visit Forum</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Live Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Live Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {liveSessions.filter(s => s.status === 'upcoming').slice(0, 3).map((session) => (
                  <div key={session.id} className="border-b last:border-0 py-3 last:pb-0">
                    <h4 className="font-medium text-gray-900 mb-1">{session.title}</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>by {session.teacherName}</p>
                      <p>{session.date} at {session.time}</p>
                      <p className="text-blue-600">{session.subjectName}</p>
                    </div>
                  </div>
                ))}
                <div className="pt-3">
                  <Link to="/live-sessions">
                    <Button variant="outline" size="sm" className="w-full">
                      View All Sessions
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status</span>
                    <Badge variant={student.paymentStatus === 'active' ? 'default' : 'destructive'}>
                      {student.paymentStatus}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Paid</span>
                    <span className="font-semibold">UGX {student.totalPaidUGX?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Month</span>
                    <span className="font-semibold">UGX 85,000</span>
                  </div>
                </div>
                <div className="pt-3 mt-3 border-t">
                  <Link to="/payment">
                    <Button variant="outline" size="sm" className="w-full">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Make Payment
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/forum">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Ask a Question
                  </Button>
                </Link>
                <Link to="/live-sessions">
                  <Button variant="outline" className="w-full justify-start">
                    <Play className="mr-2 h-4 w-4" />
                    Join Live Session
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="mr-2 h-4 w-4" />
                  Study Reminders
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Award className="mr-2 h-4 w-4" />
                  View Certificates
                </Button>
              </CardContent>
            </Card>

            {/* Study Tips */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Study Tip of the Day</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-800 text-sm">
                  Practice past UCE/UACE papers regularly. They help you understand the exam format and identify 
                  commonly tested topics. Focus on time management during practice sessions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};