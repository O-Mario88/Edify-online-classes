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
import { apiClient } from '@/lib/apiClient';
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

export const PlatformAnalyticsTabs: React.FC = () => {
  const [platformData, setPlatformData] = useState<PlatformData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchPlatformData();
  }, []);

  const fetchPlatformData = async () => {
    try {
      const response = await apiClient.get('/analytics/admin-dashboard/');
      const serverData = response.data || {};
      const kpis = serverData.kpis || {};
      
      // Parse numeric revenue string if it's abbreviated
      const rawRev = kpis.monthlyRevenue || '0';
      const monthlyRevenue = rawRev.includes('M') 
        ? parseFloat(rawRev.replace('M', '')) * 1000000 
        : parseInt(rawRev.replace(/,/g, ''), 10) || 0;

      const mappedData: PlatformData = {
        platform_overview: {
          total_revenue_monthly: monthlyRevenue,
          revenue_breakdown: {
            b2b_subscriptions: monthlyRevenue * 0.45,
            marketplace_commissions: monthlyRevenue * 0.35,
            exam_center_fees: monthlyRevenue * 0.15,
            facilitation_fees: monthlyRevenue * 0.05,
          },
          user_statistics: {
            total_institutions: parseInt(kpis.activeInstitutions?.replace(/,/g, '')) || 0,
            total_independent_teachers: serverData.marketplaceOps?.totalMarketplaceListings || 450,
            total_universal_students: parseInt(kpis.activeUsers?.replace(/,/g, '')) || 0,
            monthly_active_users: parseInt(kpis.activeUsers?.replace(/,/g, '')) || 0,
            new_registrations_this_month: 1205, // Placeholder metric
          },
          geographic_coverage: {
            districts_covered: 14,
            regions_active: ['Central', 'Western', 'Eastern', 'Northern'],
            top_performing_regions: ['Central', 'Western'],
            underserved_areas: ['Karamoja', 'West Nile'],
          },
          market_intelligence: {
            average_course_price: 25000,
            popular_subjects: ['Mathematics (O-Level)', 'Physics (A-Level)', 'Biology (O-Level)'],
            growth_trends: [
              { month: '2025-01', growth_rate: 5 },
              { month: '2025-02', growth_rate: 8 },
              { month: '2025-03', growth_rate: 15 },
              { month: '2025-04', growth_rate: 22 },
              { month: '2025-05', growth_rate: 28 },
              { month: '2025-06', growth_rate: 31.4 },
            ],
          },
        },
        performance_metrics: {
          student_success: {
            average_course_completion: 68,
            exam_pass_rates: { uce_2024: 76, uace_2024: 82 },
            student_satisfaction: 4.2,
            retention_rate: 85,
          },
          teacher_success: {
            average_earnings_monthly: 450000,
            average_rating: 4.6,
            course_completion_rates: 72,
            student_satisfaction_with_teachers: 4.5,
          },
          institution_success: {
            average_student_growth: 15,
            platform_adoption_rate: 68,
            roi_on_subscription: 120,
            exam_center_utilization: 45,
          },
        },
        financial_summary: {
          monthly_breakdown: {
            june_2025: {
              total_revenue: monthlyRevenue,
              b2b_subscriptions: { amount: monthlyRevenue * 0.45, transactions: 42, institutions: [] },
              marketplace_sales: { amount: monthlyRevenue * 0.35, platform_commission: (monthlyRevenue * 0.35) * 0.1, teacher_earnings: (monthlyRevenue * 0.35) * 0.9, total_courses_sold: 1250 },
              exam_registrations: { amount: monthlyRevenue * 0.15, platform_fees: 500000, center_payments: 2500000, total_registrations: kpis.examRegistrations || 0 },
              enrollment_facilitations: { amount: monthlyRevenue * 0.05, platform_fees: 150000, school_payments: 850000, applications_processed: 45 },
            },
          },
          projections: {
            q3_2025: { estimated_revenue: monthlyRevenue * 3.5, target_institutions: 85, target_teachers: 1200, target_students: 50000 },
            end_of_year_2025: { estimated_revenue: monthlyRevenue * 12, target_institutions: 150, target_teachers: 2500, target_students: 100000 },
          },
        },
      };

      setPlatformData(mappedData);
    } catch (error) {
      console.error('Error fetching platform data from backend api:', error);
    } finally {
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
      <div className="w-full py-8 text-center text-slate-500">Loading extended platform analytics...</div>
    );
  }

  if (!platformData) return null;

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
    <div className="w-full mt-10">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Analytics</h1>
            <p className="text-lg text-gray-600">
              Comprehensive insights into Maple Online School platform performance
            </p>
          </div>
          <div className="flex items-center justify-center gap-4 w-full md:w-auto">
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 gap-2 bg-transparent p-1">
          {['overview', 'revenue', 'users', 'performance', 'geographic'].map(tab => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="transition-all rounded-md text-sm font-medium py-2"
              style={activeTab === tab ? { backgroundColor: '#059669', color: 'white', boxShadow: '0 1px 3px rgba(5,150,105,0.3)' } : {}}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </TabsTrigger>
          ))}
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
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {revenueBreakdownData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Growth Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Growth Trend
                </CardTitle>
                <CardDescription>Monthly growth rate (%)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={growthTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="growth" stroke="#0088FE" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Monthly Revenue Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                    <span className="text-sm font-medium text-slate-700">Total Revenue</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(platformData.platform_overview.total_revenue_monthly)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                    <span className="text-sm font-medium text-slate-700">B2B Subscriptions</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(platformData.platform_overview.revenue_breakdown.b2b_subscriptions)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                    <span className="text-sm font-medium text-slate-700">Marketplace</span>
                    <span className="text-lg font-bold text-emerald-600">
                      {formatCurrency(platformData.platform_overview.revenue_breakdown.marketplace_commissions)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                    <span className="text-sm font-medium text-slate-700">Exam Centers</span>
                    <span className="text-lg font-bold text-amber-600">
                      {formatCurrency(platformData.platform_overview.revenue_breakdown.exam_center_fees)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Facilitation</span>
                    <span className="text-lg font-bold text-purple-600">
                      {formatCurrency(platformData.platform_overview.revenue_breakdown.facilitation_fees)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Marketplace Economics</CardTitle>
                <CardDescription>June 2025 Breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                    <span className="text-sm font-medium text-slate-700">Courses Sold</span>
                    <span className="text-lg font-bold text-blue-600">
                      {platformData.financial_summary.monthly_breakdown.june_2025.marketplace_sales.total_courses_sold}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                    <span className="text-sm font-medium text-slate-700">Teacher Earnings</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(platformData.financial_summary.monthly_breakdown.june_2025.marketplace_sales.teacher_earnings)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                    <span className="text-sm font-medium text-slate-700">Platform Commission</span>
                    <span className="text-lg font-bold text-indigo-600">
                      {formatCurrency(platformData.financial_summary.monthly_breakdown.june_2025.marketplace_sales.platform_commission)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Exam Registrations</span>
                    <span className="text-lg font-bold text-amber-600">
                      {platformData.financial_summary.monthly_breakdown.june_2025.exam_registrations.total_registrations}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT CARD: User Statistics + Exam Performance combined */}
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                    <span className="text-sm font-medium text-slate-700">Universal Students</span>
                    <span className="text-lg font-bold text-blue-600">
                      {platformData.platform_overview.user_statistics.total_universal_students.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                    <span className="text-sm font-medium text-slate-700">Independent Teachers</span>
                    <span className="text-lg font-bold text-green-600">
                      {platformData.platform_overview.user_statistics.total_independent_teachers.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                    <span className="text-sm font-medium text-slate-700">Partner Institutions</span>
                    <span className="text-lg font-bold text-purple-600">
                      {platformData.platform_overview.user_statistics.total_institutions.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                    <span className="text-sm font-medium text-slate-700">Monthly Active Users</span>
                    <span className="text-lg font-bold text-indigo-600">
                      {platformData.platform_overview.user_statistics.monthly_active_users.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">New Registrations (This Month)</span>
                    <span className="text-lg font-bold text-emerald-600">
                      {platformData.platform_overview.user_statistics.new_registrations_this_month.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Exam Performance section merged below */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-800 mb-4">Exam Performance — 2024 Results</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-sm font-medium text-slate-700">UCE Pass Rate</span>
                        <span className="text-sm font-bold text-emerald-600">{platformData.performance_metrics.student_success.exam_pass_rates.uce_2024}%</span>
                      </div>
                      <Progress value={platformData.performance_metrics.student_success.exam_pass_rates.uce_2024} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-sm font-medium text-slate-700">UACE Pass Rate</span>
                        <span className="text-sm font-bold text-blue-600">{platformData.performance_metrics.student_success.exam_pass_rates.uace_2024}%</span>
                      </div>
                      <Progress value={platformData.performance_metrics.student_success.exam_pass_rates.uace_2024} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* RIGHT CARD: Popular Subjects */}
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Popular Subjects</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
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
              <Card className="bg-purple-100 border-purple-300 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-bold text-purple-700 uppercase tracking-wide">Avg Active Time</p>
                    <BookOpen className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-3xl font-black text-purple-800">42<span className="text-lg font-medium text-purple-600 ml-1">mins</span></p>
                  <p className="text-xs text-purple-600 mt-2 font-semibold">Per day, per active user</p>
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
                        <Badge key={region} variant="secondary" className="bg-slate-100 text-slate-700">{region}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Top Performing Regions</h4>
                    <div className="flex flex-wrap gap-2">
                      {platformData.platform_overview.geographic_coverage.top_performing_regions.map((region) => (
                        <Badge key={region} variant="default" className="bg-indigo-600">{region}</Badge>
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