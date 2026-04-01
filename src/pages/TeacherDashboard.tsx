import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

interface TeacherStats {
  totalStudents: number;
  activeClasses: number;
  totalEarnings: number;
  monthlyEarnings: number;
  pendingPayouts: number;
  completedSessions: number;
  avgRating: number;
  totalContent: number;
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
  const [levels, setLevels] = useState<UgandaLevel[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [classes, setClasses] = useState<ClassOverview[]>([]);
  const [loading, setLoading] = useState(true);

  const teacher = user as Teacher;

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
          totalEarnings: teacher.earnings.totalEarned,
          monthlyEarnings: teacher.earnings.currentMonth,
          pendingPayouts: teacher.earnings.pendingPayouts,
          completedSessions: sessionsData.pastSessions.filter((s: any) => s.teacherId === teacher.id).length,
          avgRating: teacher.rating,
          totalContent: Math.floor(Math.random() * 200) + 50 // Simulated content count
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
            <span className="text-blue-600 font-medium">Teaching in Uganda</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {teacher.name}!</h1>
          <div className="flex items-center gap-4 text-gray-600 mt-2">
            <div className="flex items-center gap-1">
              <GraduationCap className="h-4 w-4" />
              <span>{teacher.qualification}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400" />
              <span>{teacher.rating} rating</span>
            </div>
            <Badge variant={teacher.verified ? 'default' : 'secondary'}>
              {teacher.verified ? 'Verified Teacher' : 'Pending Verification'}
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalStudents || 0}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Classes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.activeClasses || 0}</p>
                </div>
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">UGX {stats?.monthlyEarnings.toLocaleString() || '0'}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.avgRating || 0}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/ai-assistant" className="group">
                <div className="bg-white rounded-lg p-4 border border-purple-200 hover:shadow-md transition-all group-hover:border-purple-300">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertCircle className="h-8 w-8 text-orange-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Confusion Report</h4>
                      <p className="text-sm text-gray-600">Student analytics</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Identify topics where students struggle most</p>
                  <Badge variant="secondary" className="text-xs">Weekly Insights</Badge>
                </div>
              </Link>

              <Link to="/ai-assistant" className="group">
                <div className="bg-white rounded-lg p-4 border border-blue-200 hover:shadow-md transition-all group-hover:border-blue-300">
                  <div className="flex items-center gap-3 mb-3">
                    <MessageSquare className="h-8 w-8 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Smart Replies</h4>
                      <p className="text-sm text-gray-600">AI assistance</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Generate helpful responses to student questions</p>
                  <Badge variant="secondary" className="text-xs">Auto-Generate</Badge>
                </div>
              </Link>

              <Link to="/ai-assistant" className="group">
                <div className="bg-white rounded-lg p-4 border border-green-200 hover:shadow-md transition-all group-hover:border-green-300">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Quiz Generator</h4>
                      <p className="text-sm text-gray-600">Auto-create tests</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Create quizzes from your lesson content automatically</p>
                  <Badge variant="secondary" className="text-xs">AI-Powered</Badge>
                </div>
              </Link>

              <Link to="/ai-assistant" className="group">
                <div className="bg-white rounded-lg p-4 border border-indigo-200 hover:shadow-md transition-all group-hover:border-indigo-300">
                  <div className="flex items-center gap-3 mb-3">
                    <BarChart3 className="h-8 w-8 text-indigo-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Teaching Analytics</h4>
                      <p className="text-sm text-gray-600">Performance insights</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Track content effectiveness and student engagement</p>
                  <Badge variant="secondary" className="text-xs">Data-Driven</Badge>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* My Classes Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>My Classes Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {classes.slice(0, 3).map((classItem) => (
                        <div key={classItem.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900">{classItem.name} - {classItem.subject}</h4>
                              <p className="text-sm text-gray-600">{classItem.level} • {classItem.enrolledStudents} students</p>
                            </div>
                            <Badge variant="outline">{classItem.completionRate}% avg completion</Badge>
                          </div>
                          <Progress value={classItem.completionRate} className="mb-3" />
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Last active: {new Date(classItem.lastActive).toLocaleDateString()}</span>
                            <Link to="/live-sessions" className="text-blue-600 hover:underline">
                              Schedule session
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <Button variant="outline" className="w-full">
                        View All Classes
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Content Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Content Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentContent.map((content) => (
                        <div key={content.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                          <div className="flex items-center gap-3">
                            {content.type === 'video' ? (
                              <Video className="h-5 w-5 text-red-500" />
                            ) : (
                              <FileText className="h-5 w-5 text-blue-500" />
                            )}
                            <div>
                              <h4 className="font-medium text-gray-900">{content.title}</h4>
                              <p className="text-sm text-gray-600">Uploaded {content.uploadDate}</p>
                            </div>
                          </div>
                          <div className="text-right text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Eye className="h-4 w-4" />
                              <span>{content.views}</span>
                              <Star className="h-4 w-4 text-yellow-400" />
                              <span>{content.likes}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Upcoming Sessions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Upcoming Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingSessions.map((session) => (
                        <div key={session.id} className="border rounded-lg p-3">
                          <h4 className="font-medium text-gray-900 mb-2">{session.title}</h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>{session.date} at {session.time}</p>
                            <p>{session.students} students registered</p>
                            <p>{session.duration} minutes</p>
                          </div>
                          <Button size="sm" className="w-full mt-3">
                            <Play className="mr-2 h-4 w-4" />
                            Start Session
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <Link to="/live-sessions">
                        <Button variant="outline" size="sm" className="w-full">
                          Schedule New Session
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
                    <Button variant="outline" className="w-full justify-start">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Content
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Session
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message Students
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View Analytics
                    </Button>
                  </CardContent>
                </Card>

                {/* Earnings Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Earnings Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Earned</span>
                        <span className="font-semibold">UGX {stats?.totalEarnings.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">This Month</span>
                        <span className="font-semibold">UGX {stats?.monthlyEarnings.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pending Payout</span>
                        <span className="font-semibold text-orange-600">UGX {stats?.pendingPayouts.toLocaleString() || '0'}</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button variant="outline" size="sm" className="w-full">
                        Request Payout
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {classes.map((classItem) => (
                    <Card key={classItem.id} className="hover:shadow-md transition-shadow">
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
                  <p className="text-gray-600">Add videos, notes, or exercises for your students</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-24 flex-col">
                      <Video className="h-8 w-8 mb-2 text-red-500" />
                      Upload Video
                    </Button>
                    <Button variant="outline" className="h-24 flex-col">
                      <FileText className="h-8 w-8 mb-2 text-blue-500" />
                      Add Notes
                    </Button>
                    <Button variant="outline" className="h-24 flex-col">
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
                        {teacher.subjects.map(subject => (
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
            <div className="space-y-6">
              {/* Earnings Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Total Earnings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-600">UGX {stats?.totalEarnings.toLocaleString() || '0'}</p>
                    <p className="text-sm text-gray-600 mt-1">Lifetime earnings</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">This Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-blue-600">UGX {stats?.monthlyEarnings.toLocaleString() || '0'}</p>
                    <p className="text-sm text-gray-600 mt-1">Current month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Pending Payout</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-orange-600">UGX {stats?.pendingPayouts.toLocaleString() || '0'}</p>
                    <p className="text-sm text-gray-600 mt-1">Available for withdrawal</p>
                  </CardContent>
                </Card>
              </div>

              {/* Revenue Share Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Share Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Your Share: 60%</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Student payments this month</span>
                          <span>UGX 850,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Platform fee (40%)</span>
                          <span>UGX 340,000</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Your earnings (60%)</span>
                          <span>UGX 510,000</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Payout Information</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>• Minimum payout: UGX 100,000</p>
                        <p>• Payout schedule: Every 15th of the month</p>
                        <p>• Payment methods: Mobile Money, Bank Transfer</p>
                        <p>• Processing time: 2-3 business days</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payout History */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Payout History</CardTitle>
                    <Button>
                      <Download className="mr-2 h-4 w-4" />
                      Request Payout
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { date: '2025-06-15', amount: 450000, status: 'Completed', method: 'MTN Mobile Money' },
                      { date: '2025-05-15', amount: 380000, status: 'Completed', method: 'Bank Transfer' },
                      { date: '2025-04-15', amount: 420000, status: 'Completed', method: 'MTN Mobile Money' },
                      { date: '2025-03-15', amount: 350000, status: 'Completed', method: 'Airtel Money' }
                    ].map((payout, index) => (
                      <div key={index} className="flex items-center justify-between border rounded-lg p-3">
                        <div>
                          <p className="font-medium">UGX {payout.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">{payout.date} • {payout.method}</p>
                        </div>
                        <Badge variant={payout.status === 'Completed' ? 'default' : 'secondary'}>
                          {payout.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};