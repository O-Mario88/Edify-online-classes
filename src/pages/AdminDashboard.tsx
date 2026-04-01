import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { 
  Users, 
  DollarSign, 
  BookOpen, 
  TrendingUp,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  BarChart3,
  Download,
  Eye,
  Edit,
  Trash2,
  Star,
  MapPin,
  GraduationCap,
  Target,
  CreditCard
} from 'lucide-react';
import { Administrator, Student, Teacher, UgandaLevel } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface PlatformStats {
  totalStudents: number;
  totalTeachers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeClasses: number;
  completedSessions: number;
  pendingPayouts: number;
  avgRating: number;
}

interface WithdrawalRequest {
  id: string;
  teacherId: string;
  teacherName: string;
  amount: number;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  paymentMethod: string;
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [levels, setLevels] = useState<UgandaLevel[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const admin = user as Administrator;

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
        setTeachers(usersData.teachers);
        
        // Calculate platform statistics
        const totalRevenue = usersData.students.reduce((sum: number, student: Student) => 
          sum + (student.totalPaidUGX || 0), 0
        );
        
        const monthlyRevenue = Math.floor(totalRevenue * 0.15); // Estimate monthly revenue
        
        const platformStats: PlatformStats = {
          totalStudents: usersData.students.length,
          totalTeachers: usersData.teachers.length,
          totalRevenue,
          monthlyRevenue,
          activeClasses: coursesData.levels.reduce((sum: number, level: any) => 
            sum + level.classes.reduce((classSum: number, cls: any) => 
              classSum + cls.terms.reduce((termSum: number, term: any) => termSum + term.subjects.length, 0), 0), 0
          ),
          completedSessions: sessionsData.pastSessions.length,
          pendingPayouts: usersData.teachers.reduce((sum: number, teacher: Teacher) => 
            sum + teacher.earnings.pendingPayouts, 0
          ),
          avgRating: usersData.teachers.reduce((sum: number, teacher: Teacher) => 
            sum + teacher.rating, 0) / usersData.teachers.length
        };
        setStats(platformStats);

        // Generate mock withdrawal requests
        const mockRequests: WithdrawalRequest[] = usersData.teachers
          .filter((teacher: Teacher) => teacher.earnings.pendingPayouts > 0)
          .slice(0, 5)
          .map((teacher: Teacher, index: number) => ({
            id: `req-${teacher.id}-${index}`,
            teacherId: teacher.id,
            teacherName: teacher.name,
            amount: teacher.earnings.pendingPayouts,
            requestDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: ['pending', 'pending', 'approved', 'pending', 'rejected'][index] as any,
            paymentMethod: ['MTN Mobile Money', 'Bank Transfer', 'Airtel Money', 'MTN Mobile Money', 'Bank Transfer'][index]
          }));
        
        setWithdrawalRequests(mockRequests);
        
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApproveTeacher = (teacherId: string) => {
    setTeachers(prev => prev.map(teacher => 
      teacher.id === teacherId ? { ...teacher, verified: true } : teacher
    ));
  };

  const handleRejectTeacher = (teacherId: string) => {
    setTeachers(prev => prev.map(teacher => 
      teacher.id === teacherId ? { ...teacher, verified: false } : teacher
    ));
  };

  const handleWithdrawalAction = (requestId: string, action: 'approve' | 'reject') => {
    setWithdrawalRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: action === 'approve' ? 'approved' : 'rejected' } : req
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
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
            <span className="text-blue-600 font-medium">Maple Online School Uganda</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Platform overview and management tools for Uganda's premier online learning platform
          </p>
        </div>

        {/* Platform Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalStudents || 0}</p>
                  <p className="text-xs text-green-600">+12% this month</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Teachers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalTeachers || 0}</p>
                  <p className="text-xs text-green-600">+3 this week</p>
                </div>
                <GraduationCap className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">UGX {stats?.monthlyRevenue.toLocaleString() || '0'}</p>
                  <p className="text-xs text-green-600">+8% from last month</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Classes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.activeClasses || 0}</p>
                  <p className="text-xs text-blue-600">Across O & A levels</p>
                </div>
                <BookOpen className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Overview */}
              <div className="lg:col-span-2 space-y-6">
                {/* Recent Activities */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Platform Activities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { action: 'New student enrollment', user: 'Grace Nakato', time: '2 hours ago', type: 'enrollment' },
                        { action: 'Teacher verification request', user: 'Dr. Paul Wasswa', time: '4 hours ago', type: 'verification' },
                        { action: 'Payment received', user: 'David Musoke', time: '6 hours ago', type: 'payment' },
                        { action: 'Withdrawal request', user: 'Sarah Nakamya', time: '1 day ago', type: 'withdrawal' },
                        { action: 'New live session scheduled', user: 'Michael Chen', time: '2 days ago', type: 'session' }
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.type === 'enrollment' ? 'bg-green-500' :
                            activity.type === 'verification' ? 'bg-yellow-500' :
                            activity.type === 'payment' ? 'bg-blue-500' :
                            activity.type === 'withdrawal' ? 'bg-purple-500' :
                            'bg-gray-500'
                          }`} />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{activity.action}</p>
                            <p className="text-sm text-gray-600">{activity.user} • {activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Uganda Education Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Uganda Education Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Level Distribution</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">O'level Students</span>
                            <span className="font-medium">{students.filter(s => s.level === 'O\'level').length}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">A'level Students</span>
                            <span className="font-medium">{students.filter(s => s.level === 'A\'level').length}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">Exam Focus</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">UCE Candidates</span>
                            <span className="font-medium">{students.filter(s => s.targetExam === 'UCE').length}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">UACE Candidates</span>
                            <span className="font-medium">{students.filter(s => s.targetExam === 'UACE').length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Pending Approvals */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      Pending Approvals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Teacher Verifications</span>
                        <Badge variant="secondary">{teachers.filter(t => !t.verified).length}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Withdrawal Requests</span>
                        <Badge variant="secondary">{withdrawalRequests.filter(r => r.status === 'pending').length}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Content Reviews</span>
                        <Badge variant="secondary">3</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Financial Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Revenue</span>
                        <span className="font-semibold">UGX {stats?.totalRevenue.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Platform Share (40%)</span>
                        <span className="font-semibold">UGX {((stats?.totalRevenue || 0) * 0.4).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Teacher Share (60%)</span>
                        <span className="font-semibold">UGX {((stats?.totalRevenue || 0) * 0.6).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pending Payouts</span>
                        <span className="font-semibold text-orange-600">UGX {stats?.pendingPayouts.toLocaleString() || '0'}</span>
                      </div>
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
                      <UserCheck className="mr-2 h-4 w-4" />
                      Approve Teachers
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Process Payouts
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View Reports
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="mr-2 h-4 w-4" />
                      Export Data
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Student Management</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                    <Button size="sm">Add Student</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students.slice(0, 10).map((student) => (
                    <div key={student.id} className="flex items-center justify-between border rounded-lg p-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=3B82F6&color=fff`;
                          }}
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">{student.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>{student.class} • {student.level}</span>
                            {student.school && <span>• {student.school}</span>}
                            {student.combination && <Badge variant="outline" className="text-xs">{student.combination}</Badge>}
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.location} • Targeting {student.targetExam} {student.examYear}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Badge variant={student.paymentStatus === 'active' ? 'default' : 'destructive'}>
                              {student.paymentStatus}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            UGX {student.totalPaidUGX?.toLocaleString() || '0'} paid
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teachers">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Teacher Management</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teachers.map((teacher) => (
                    <div key={teacher.id} className="flex items-center justify-between border rounded-lg p-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={teacher.avatar}
                          alt={teacher.name}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=3B82F6&color=fff`;
                          }}
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">{teacher.name}</h4>
                          <p className="text-sm text-gray-600">{teacher.qualification}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Star className="h-4 w-4 text-yellow-400" />
                            <span>{teacher.rating}</span>
                            <span>• {teacher.totalStudents} students</span>
                            <span>• {teacher.experience}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {teacher.subjects.slice(0, 3).map((subject) => (
                              <Badge key={subject} variant="outline" className="text-xs">{subject}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge variant={teacher.verified ? 'default' : 'secondary'}>
                            {teacher.verified ? 'Verified' : 'Pending'}
                          </Badge>
                          <div className="text-sm text-gray-600 mt-1">
                            UGX {teacher.earnings.totalEarned.toLocaleString()} earned
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!teacher.verified && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleApproveTeacher(teacher.id)}
                              >
                                <UserCheck className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleRejectTeacher(teacher.id)}
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students.slice(0, 8).map((student, index) => (
                    <div key={`transaction-${student.id}-${index}`} className="flex items-center justify-between border rounded-lg p-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                          index % 3 === 0 ? 'bg-green-500' : index % 3 === 1 ? 'bg-blue-500' : 'bg-purple-500'
                        }`}>
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{student.name}</h4>
                          <p className="text-sm text-gray-600">
                            {student.class} - Monthly subscription payment
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          +UGX {(Math.floor(Math.random() * 50000) + 30000).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {['MTN Mobile Money', 'Airtel Money', 'Bank Transfer'][index % 3]}
                        </div>
                        <Badge variant="default" className="text-xs mt-1">Completed</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals">
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {withdrawalRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between border rounded-lg p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{request.teacherName}</h4>
                          <p className="text-sm text-gray-600">
                            Withdrawal request • {request.paymentMethod}
                          </p>
                          <p className="text-sm text-gray-500">
                            Requested on {new Date(request.requestDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            UGX {request.amount.toLocaleString()}
                          </div>
                          <Badge 
                            variant={
                              request.status === 'approved' ? 'default' : 
                              request.status === 'rejected' ? 'destructive' : 
                              'secondary'
                            }
                          >
                            {request.status}
                          </Badge>
                        </div>
                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm"
                              onClick={() => handleWithdrawalAction(request.id, 'approve')}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handleWithdrawalAction(request.id, 'reject')}
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-6">
              {/* Growth Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Student Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600 mb-2">+24%</div>
                    <p className="text-sm text-gray-600">vs last month</p>
                    <Progress value={75} className="mt-3" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Revenue Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600 mb-2">+18%</div>
                    <p className="text-sm text-gray-600">vs last month</p>
                    <Progress value={60} className="mt-3" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Teacher Satisfaction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600 mb-2">4.7</div>
                    <p className="text-sm text-gray-600">out of 5.0</p>
                    <Progress value={94} className="mt-3" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Session Completion</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-600 mb-2">87%</div>
                    <p className="text-sm text-gray-600">avg completion rate</p>
                    <Progress value={87} className="mt-3" />
                  </CardContent>
                </Card>
              </div>

              {/* Regional Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Regional Distribution (Uganda)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Top Regions by Students</h4>
                      <div className="space-y-3">
                        {[
                          { region: 'Central (Kampala)', students: 487, percentage: 34 },
                          { region: 'Eastern (Jinja)', students: 298, percentage: 21 },
                          { region: 'Western (Mbarara)', students: 245, percentage: 17 },
                          { region: 'Northern (Gulu)', students: 198, percentage: 14 },
                          { region: 'Other regions', students: 201, percentage: 14 }
                        ].map((region, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">{region.region}</span>
                              <p className="text-sm text-gray-600">{region.students} students</p>
                            </div>
                            <div className="text-right">
                              <span className="font-medium">{region.percentage}%</span>
                              <Progress value={region.percentage} className="w-20 mt-1" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Popular Subject Combinations</h4>
                      <div className="space-y-3">
                        {[
                          { combo: 'PCM (Physics, Chemistry, Math)', percentage: 45 },
                          { combo: 'PCB (Physics, Chemistry, Biology)', percentage: 35 },
                          { combo: 'HEG (History, Economics, Geography)', percentage: 32 },
                          { combo: 'HEL (History, Economics, Literature)', percentage: 18 },
                          { combo: 'ICT Combination', percentage: 15 }
                        ].map((combo, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">{combo.combo}</span>
                              <span className="text-sm">{combo.percentage}%</span>
                            </div>
                            <Progress value={combo.percentage} />
                          </div>
                        ))}
                      </div>
                    </div>
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