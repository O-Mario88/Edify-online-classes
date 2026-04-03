import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  School,
  BookOpen,
  MapPin,
  Target,
  Award,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart as RechartsBarChart, Bar } from 'recharts';
import { PieChart as RechartsPieChart, Cell, Pie } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';

interface PlatformData {
  platform_overview: {
    total_revenue_monthly: number;
    revenue_breakdown: {
      b2b_subscriptions: number;
      marketplace_commissions: number;
      exam_center_fees: number;
      facilitation_fees: number;
    };
    user_statistics: {
      total_institutions: number;
      total_independent_teachers: number;
      total_universal_students: number;
      monthly_active_users: number;
      new_registrations_this_month: number;
    };
    geographic_coverage: {
      districts_covered: number;
      regions_active: string[];
      top_performing_regions: string[];
      underserved_areas: string[];
    };
    market_intelligence: {
      average_course_price: number;
      popular_subjects: string[];
      growth_trends: Array<{
        month: string;
        growth_rate: number;
      }>;
    };
  };
  performance_metrics: {
    student_success: {
      average_course_completion: number;
      exam_pass_rates: {
        uce_2024: number;
        uace_2024: number;
      };
      student_satisfaction: number;
      retention_rate: number;
    };
    teacher_success: {
      average_earnings_monthly: number;
      average_rating: number;
      course_completion_rates: number;
      student_satisfaction_with_teachers: number;
    };
    institution_success: {
      average_student_growth: number;
      platform_adoption_rate: number;
      roi_on_subscription: number;
      exam_center_utilization: number;
    };
  };
  financial_summary: {
    monthly_breakdown: {
      june_2025: {
        total_revenue: number;
        b2b_subscriptions: {
          amount: number;
          transactions: number;
          institutions: string[];
        };
        marketplace_sales: {
          amount: number;
          platform_commission: number;
          teacher_earnings: number;
          total_courses_sold: number;
        };
        exam_registrations: {
          amount: number;
          platform_fees: number;
          center_payments: number;
          total_registrations: number;
        };
        enrollment_facilitations: {
          amount: number;
          platform_fees: number;
          school_payments: number;
          applications_processed: number;
        };
      };
    };
    projections: {
      q3_2025: {
        estimated_revenue: number;
        target_institutions: number;
        target_teachers: number;
        target_students: number;
      };
      end_of_year_2025: {
        estimated_revenue: number;
        target_institutions: number;
        target_teachers: number;
        target_students: number;
      };
    };
  };
}

const PlatformAnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [platformData, setPlatformData] = useState<PlatformData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');

  useEffect(() => {
    if (user?.role === 'platform_admin') {
      fetchPlatformData();
    }
  }, [user]);

  const fetchPlatformData = async () => {
    try {
      const response = await fetch('/data/platform-analytics.json');
      const data = await response.json();
      setPlatformData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching platform data:', error);
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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">Loading platform analytics...</div>
      </div>
    );
  }

  if (!platformData || user?.role !== 'platform_admin') {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-gray-600">Only platform administrators can access analytics.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const revenueBreakdownData = [
    { name: 'B2B Subscriptions', value: platformData.platform_overview.revenue_breakdown.b2b_subscriptions, color: '#0088FE' },
    { name: 'Marketplace', value: platformData.platform_overview.revenue_breakdown.marketplace_commissions, color: '#00C49F' },
    { name: 'Exam Centers', value: platformData.platform_overview.revenue_breakdown.exam_center_fees, color: '#FFBB28' },
    { name: 'Facilitation', value: platformData.platform_overview.revenue_breakdown.facilitation_fees, color: '#FF8042' }
  ];

  const growthTrendData = platformData.platform_overview.market_intelligence.growth_trends.map(trend => ({
    month: trend.month.split('-')[1],
    growth: trend.growth_rate
  }));

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Analytics</h1>
            <p className="text-lg text-gray-600">
              Comprehensive insights into Maple Online School platform performance
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(platformData.platform_overview.total_revenue_monthly)}
            </div>
            <p className="text-xs text-muted-foreground">
              +31.4% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {platformData.platform_overview.user_statistics.monthly_active_users.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {platformData.platform_overview.user_statistics.new_registrations_this_month} new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Institutions</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {platformData.platform_overview.user_statistics.total_institutions}
            </div>
            <p className="text-xs text-muted-foreground">
              {platformData.performance_metrics.institution_success.platform_adoption_rate}% adoption rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Geographic Coverage</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {platformData.platform_overview.geographic_coverage.districts_covered}
            </div>
            <p className="text-xs text-muted-foreground">
              districts across {platformData.platform_overview.geographic_coverage.regions_active.length} regions
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Revenue Breakdown
                </CardTitle>
                <CardDescription>Monthly revenue by source</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={revenueBreakdownData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {revenueBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Growth Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Growth Trend
                </CardTitle>
                <CardDescription>Monthly growth rate percentage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={growthTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}%`, 'Growth Rate']} />
                      <Line type="monotone" dataKey="growth" stroke="#8884d8" strokeWidth={2} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Performance Indicators */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Key Performance Indicators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Student Satisfaction
                  </label>
                  <Progress value={platformData.performance_metrics.student_success.student_satisfaction * 20} className="mb-1" />
                  <p className="text-sm text-gray-600">{platformData.performance_metrics.student_success.student_satisfaction}/5.0</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Class Completion Rate
                  </label>
                  <Progress value={platformData.performance_metrics.student_success.average_course_completion} className="mb-1" />
                  <p className="text-sm text-gray-600">{platformData.performance_metrics.student_success.average_course_completion}%</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Teacher Rating
                  </label>
                  <Progress value={platformData.performance_metrics.teacher_success.average_rating * 20} className="mb-1" />
                  <p className="text-sm text-gray-600">{platformData.performance_metrics.teacher_success.average_rating}/5.0</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Student Retention
                  </label>
                  <Progress value={platformData.performance_metrics.student_success.retention_rate} className="mb-1" />
                  <p className="text-sm text-gray-600">{platformData.performance_metrics.student_success.retention_rate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Breakdown</CardTitle>
                <CardDescription>June 2025 financial summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">B2B Subscriptions</span>
                    <span className="font-semibold">
                      {formatCurrency(platformData.financial_summary.monthly_breakdown.june_2025.b2b_subscriptions.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Marketplace Commission</span>
                    <span className="font-semibold">
                      {formatCurrency(platformData.financial_summary.monthly_breakdown.june_2025.marketplace_sales.platform_commission)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Exam Registration Fees</span>
                    <span className="font-semibold">
                      {formatCurrency(platformData.financial_summary.monthly_breakdown.june_2025.exam_registrations.platform_fees)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Enrollment Facilitation</span>
                    <span className="font-semibold">
                      {formatCurrency(platformData.financial_summary.monthly_breakdown.june_2025.enrollment_facilitations.platform_fees)}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between items-center">
                    <span className="font-semibold">Total Revenue</span>
                    <span className="font-bold text-green-600 text-lg">
                      {formatCurrency(platformData.financial_summary.monthly_breakdown.june_2025.total_revenue)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Projections</CardTitle>
                <CardDescription>Forecast for 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Q3 2025 Targets</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Estimated Revenue</span>
                        <span className="font-semibold">
                          {formatCurrency(platformData.financial_summary.projections.q3_2025.estimated_revenue)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Target Institutions</span>
                        <span className="font-semibold">{platformData.financial_summary.projections.q3_2025.target_institutions}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">End of Year 2025</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Estimated Revenue</span>
                        <span className="font-semibold">
                          {formatCurrency(platformData.financial_summary.projections.end_of_year_2025.estimated_revenue)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Target Students</span>
                        <span className="font-semibold">{platformData.financial_summary.projections.end_of_year_2025.target_students.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {platformData.platform_overview.user_statistics.total_universal_students.toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-600">Universal Students</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {platformData.platform_overview.user_statistics.total_independent_teachers}
                    </div>
                    <p className="text-sm text-gray-600">Independent Teachers</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {platformData.platform_overview.user_statistics.total_institutions}
                    </div>
                    <p className="text-sm text-gray-600">Partner Institutions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Subjects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {platformData.platform_overview.market_intelligence.popular_subjects.map((subject, index) => (
                    <div key={subject} className="flex items-center justify-between">
                      <span className="text-sm">{subject}</span>
                      <Badge variant="secondary">#{index + 1}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Exam Performance</CardTitle>
                <CardDescription>2024 Results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      UCE Pass Rate
                    </label>
                    <Progress value={platformData.performance_metrics.student_success.exam_pass_rates.uce_2024} className="mb-1" />
                    <p className="text-sm text-gray-600">{platformData.performance_metrics.student_success.exam_pass_rates.uce_2024}%</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      UACE Pass Rate
                    </label>
                    <Progress value={platformData.performance_metrics.student_success.exam_pass_rates.uace_2024} className="mb-1" />
                    <p className="text-sm text-gray-600">{platformData.performance_metrics.student_success.exam_pass_rates.uace_2024}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Teacher Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Average Monthly Earnings</span>
                      <span className="font-semibold">
                        {formatCurrency(platformData.performance_metrics.teacher_success.average_earnings_monthly)}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Average Rating</span>
                      <span className="font-semibold">
                        {platformData.performance_metrics.teacher_success.average_rating}/5.0
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Class Completion Rate</span>
                      <span className="font-semibold">
                        {platformData.performance_metrics.teacher_success.course_completion_rates}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Institution Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Average Student Growth</span>
                      <span className="font-semibold">
                        {platformData.performance_metrics.institution_success.average_student_growth}%
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Platform Adoption Rate</span>
                      <span className="font-semibold">
                        {platformData.performance_metrics.institution_success.platform_adoption_rate}%
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">ROI on Subscription</span>
                      <span className="font-semibold">
                        {platformData.performance_metrics.institution_success.roi_on_subscription}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 border-t pt-6 border-slate-200">
            <h3 className="text-xl font-bold mb-4 text-slate-900 border-l-4 border-indigo-500 pl-3">Resource Engagement Tracking</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-indigo-50 border-indigo-100 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-semibold text-indigo-900 uppercase">Avg Active Time</p>
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                  </div>
                  <p className="text-3xl font-black text-indigo-950">42<span className="text-lg font-medium text-indigo-700 ml-1">mins</span></p>
                  <p className="text-xs text-indigo-700 mt-2 font-medium">Per day, per active user</p>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-slate-500 uppercase">Video Completion Rate</p>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">76%</p>
                  <Progress value={76} className="h-1.5 mt-3 mb-1 bg-slate-100 [&>div]:bg-red-500" />
                  <p className="text-xs text-slate-500 mt-2">Up 12% since disabling downloads</p>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-slate-500 uppercase">Document Reading Depth</p>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">68%</p>
                  <Progress value={68} className="h-1.5 mt-3 mb-1 bg-slate-100 [&>div]:bg-blue-500" />
                  <p className="text-xs text-slate-500 mt-2">Avg scroll position achieved</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Geographic Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Active Regions</h4>
                    <div className="flex flex-wrap gap-2">
                      {platformData.platform_overview.geographic_coverage.regions_active.map((region) => (
                        <Badge key={region} variant="default">{region}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Top Performing Regions</h4>
                    <div className="flex flex-wrap gap-2">
                      {platformData.platform_overview.geographic_coverage.top_performing_regions.map((region) => (
                        <Badge key={region} variant="default" className="bg-green-600">{region}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expansion Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <h4 className="font-semibold mb-2">Underserved Areas</h4>
                  <div className="space-y-2">
                    {platformData.platform_overview.geographic_coverage.underserved_areas.map((area) => (
                      <div key={area} className="flex items-center justify-between">
                        <span className="text-sm">{area}</span>
                        <Badge variant="outline">Opportunity</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlatformAnalyticsPage;