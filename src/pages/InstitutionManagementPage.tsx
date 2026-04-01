import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  School, 
  Users, 
  DollarSign, 
  TrendingUp, 
  BookOpen, 
  UserCheck, 
  Calendar,
  MapPin,
  Star,
  Award,
  CheckCircle,
  AlertCircle,
  Clock,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getCurriculumConfig } from '@/lib/curriculum';

interface Institution {
  id: string;
  name: string;
  admin_id: string;
  type: string;
  location: {
    district: string;
    region: string;
    address: string;
  };
  subscription: {
    plan: string;
    status: string;
    cost_per_student: number;
    total_students: number;
    billing_cycle: string;
  };
  public_profile: {
    visible: boolean;
    description: string;
    enrollment_fee: number;
    achievements: string[];
  };
  exam_center: {
    is_registered: boolean;
    uneb_center_code?: string;
    capacity?: number;
  };
  analytics: {
    financial: {
      monthly_revenue: number;
      subscription_cost: number;
      profit_margin: number;
    };
    academic: {
      average_performance: number;
      attendance_rate: number;
      completion_rate: number;
    };
    engagement: {
      active_students: number;
      forum_participation: number;
      live_session_attendance: number;
    };
  };
}

const InstitutionManagementPage: React.FC = () => {
  const { user, userProfile, countryCode } = useAuth();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const curriculumConfig = getCurriculumConfig(countryCode);

  useEffect(() => {
    if (user?.role === 'institution_admin') {
      fetchInstitutionData();
    }
  }, [user]);

  const fetchInstitutionData = async () => {
    try {
      const response = await fetch('/data/institutions.json');
      const data = await response.json();
      
      // Find institution associated with current admin
      const adminInstitution = data.institutions.find((inst: Institution) => 
        inst.admin_id === user?.id
      );
      
      if (adminInstitution) {
        setInstitution(adminInstitution);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching institution data:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">Loading institution data...</div>
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Institution Not Found</h2>
            <p className="text-gray-600">No institution data found for your account.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <School className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{institution.name}</h1>
            <p className="text-lg text-gray-600">
              {institution.location.district}, {institution.location.region} • {institution.type} Institution
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge 
            variant={institution.subscription.status === 'active' ? 'default' : 'secondary'}
            className="text-sm"
          >
            {institution.subscription.plan} Plan - {institution.subscription.status}
          </Badge>
          {institution.exam_center.is_registered && (
            <Badge variant="outline" className="text-sm">
              <Award className="h-3 w-3 mr-1" />
              {curriculumConfig.examBody} Exam Center
            </Badge>
          )}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{institution.subscription.total_students}</div>
            <p className="text-xs text-muted-foreground">
              {institution.analytics.engagement.active_students} active this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(institution.analytics.financial.monthly_revenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {institution.analytics.financial.profit_margin}% profit margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Academic Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{institution.analytics.academic.average_performance}%</div>
            <p className="text-xs text-muted-foreground">
              {institution.analytics.academic.completion_rate}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Engagement</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{institution.analytics.engagement.forum_participation}%</div>
            <p className="text-xs text-muted-foreground">
              {institution.analytics.engagement.live_session_attendance}% live session attendance
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="academics">Academics</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="profile">Public Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Institution Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="h-5 w-5" />
                  Institution Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Location</label>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {institution.location.address}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Institution Type</label>
                  <p className="text-sm text-gray-600 capitalize">{institution.type}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Subscription</label>
                  <p className="text-sm text-gray-600">
                    {institution.subscription.plan} Plan - {formatCurrency(institution.subscription.cost_per_student)} per student/{institution.subscription.billing_cycle}
                  </p>
                </div>
                
                {institution.exam_center.is_registered && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">{curriculumConfig.examBody} Center Code</label>
                    <p className="text-sm text-gray-600 font-mono">
                      {institution.exam_center.uneb_center_code}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Student Attendance Rate
                  </label>
                  <Progress value={institution.analytics.academic.attendance_rate} className="mb-1" />
                  <p className="text-sm text-gray-600">{institution.analytics.academic.attendance_rate}%</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Class Completion Rate
                  </label>
                  <Progress value={institution.analytics.academic.completion_rate} className="mb-1" />
                  <p className="text-sm text-gray-600">{institution.analytics.academic.completion_rate}%</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Forum Participation
                  </label>
                  <Progress value={institution.analytics.engagement.forum_participation} className="mb-1" />
                  <p className="text-sm text-gray-600">{institution.analytics.engagement.forum_participation}%</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {institution.public_profile.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium">{achievement}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Student Management
              </CardTitle>
              <CardDescription>
                Manage student enrollments and track their progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {institution.subscription.total_students}
                  </div>
                  <p className="text-sm text-gray-600">Total Enrolled</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {institution.analytics.engagement.active_students}
                  </div>
                  <p className="text-sm text-gray-600">Active Students</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    {Math.round(institution.analytics.academic.attendance_rate)}%
                  </div>
                  <p className="text-sm text-gray-600">Attendance Rate</p>
                </div>
              </div>
              
              <div className="mt-6 flex gap-4">
                <Button>Add New Student</Button>
                <Button variant="outline">Import Students</Button>
                <Button variant="outline">Export Student Data</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Academic Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Overall Performance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Average Academic Performance
                      </label>
                      <Progress value={institution.analytics.academic.average_performance} className="mb-1" />
                      <p className="text-sm text-gray-600">{institution.analytics.academic.average_performance}%</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Class Completion Rate
                      </label>
                      <Progress value={institution.analytics.academic.completion_rate} className="mb-1" />
                      <p className="text-sm text-gray-600">{institution.analytics.academic.completion_rate}%</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Button>View Detailed Reports</Button>
                  <Button variant="outline">Download Academic Data</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Revenue Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Monthly Revenue</span>
                      <span className="font-semibold">{formatCurrency(institution.analytics.financial.monthly_revenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Platform Subscription</span>
                      <span className="font-semibold">{formatCurrency(institution.analytics.financial.subscription_cost)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm font-semibold">Net Profit</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(institution.analytics.financial.monthly_revenue - institution.analytics.financial.subscription_cost)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Subscription Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Plan</span>
                      <span className="font-semibold capitalize">{institution.subscription.plan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Cost per Student</span>
                      <span className="font-semibold">{formatCurrency(institution.subscription.cost_per_student)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Billing Cycle</span>
                      <span className="font-semibold capitalize">{institution.subscription.billing_cycle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <Badge variant={institution.subscription.status === 'active' ? 'default' : 'secondary'}>
                        {institution.subscription.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                Public Institution Profile
              </CardTitle>
              <CardDescription>
                Manage how your institution appears to potential students
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Profile Visibility</h3>
                  <p className="text-sm text-gray-600">Allow students to find and apply to your institution</p>
                </div>
                <Badge variant={institution.public_profile.visible ? 'default' : 'secondary'}>
                  {institution.public_profile.visible ? 'Visible' : 'Hidden'}
                </Badge>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Institution Description
                </label>
                <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded">
                  {institution.public_profile.description}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Enrollment Fee
                </label>
                <p className="text-lg font-semibold">
                  {formatCurrency(institution.public_profile.enrollment_fee)}
                </p>
              </div>
              
              <div className="flex gap-4">
                <Button>Edit Profile</Button>
                <Button variant="outline">Preview Public Page</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InstitutionManagementPage;