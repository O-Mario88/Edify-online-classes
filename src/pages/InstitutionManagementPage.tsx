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
import { apiClient } from '@/lib/api';
import { getCurriculumConfig } from '@/lib/curriculum';

interface Institution {
  id: string;
  name: string;
  primary_color: string;
  secondary_color: string;
  curriculum_track: string;
  subscription_plan: string;
  is_active: boolean;
  country_code: string;
  created_at: string;
}

interface ApiClass {
  id: number;
  subject_name: string;
  class_level_name: string;
  teacher_name: string;
  title: string;
  visibility: string;
}

interface ApiTimetableSlot {
  id: number;
  class_title: string;
  room_name: string;
  teacher_name: string;
  day_name: string;
  start_time: string;
  end_time: string;
}

const InstitutionManagementPage: React.FC = () => {
  const { user, countryCode } = useAuth();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [classes, setClasses] = useState<ApiClass[]>([]);
  const [timetables, setTimetables] = useState<ApiTimetableSlot[]>([]);
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
      const { data: instData } = await apiClient.get('/institutions/');
      // An admin might belong to multiple, we grab the first for the dashboard context
      if (instData.length > 0) {
        setInstitution(instData[0]);
      }
      
      const { data: clsData } = await apiClient.get('/classes/');
      setClasses(clsData);

      const { data: ttData } = await apiClient.get('/scheduling/timetable/');
      setTimetables(ttData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching School OS data:', error);
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
              Edify Shared Platform • Multi-Tenant Scope
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge 
            variant={institution.is_active ? 'default' : 'secondary'}
            className="text-sm"
          >
            {institution.subscription_plan} Plan - {institution.is_active ? 'ACTIVE' : 'INACTIVE'}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="classes">Active Classes</TabsTrigger>
          <TabsTrigger value="timetable">School Timetable</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
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
                  <label className="text-sm font-medium text-gray-700">Curriculum Track</label>
                  <p className="text-sm text-gray-600 capitalize">{institution.curriculum_track}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Country Target</label>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {institution.country_code.toUpperCase()} Scope
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Core Subscription</label>
                  <p className="text-sm text-gray-600">
                    {institution.subscription_plan}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="classes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Active Class Federation
              </CardTitle>
              <CardDescription>
                Private sections natively scoped to your School's Platform Database
              </CardDescription>
            </CardHeader>
            <CardContent>
              {classes.length === 0 ? (
                 <p className="text-gray-500 py-4">No active classes scheduled. Click 'New Class' to begin.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {classes.map(cls => (
                    <div key={cls.id} className="p-4 border rounded-lg hover:shadow-md transition">
                       <h3 className="font-bold text-lg">{cls.title}</h3>
                       <p className="text-sm text-blue-600 font-semibold mb-2">{cls.subject_name} • {cls.class_level_name}</p>
                       <div className="flex justify-between items-center text-sm text-gray-600 border-t pt-2 mt-2">
                         <span>Instructor: {cls.teacher_name}</span>
                         <Badge variant="outline">{cls.visibility}</Badge>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timetable" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Master Timetable Engine
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timetables.length === 0 ? (
                 <p className="text-gray-500 py-4">Timetable blocks have not been built for this Academic Term.</p>
              ) : (
                <div className="space-y-4">
                  {timetables.map(slot => (
                    <div key={slot.id} className="flex justify-between items-center p-3 border-l-4 border-blue-500 bg-gray-50 rounded shadow-sm">
                      <div>
                        <span className="font-bold text-gray-900">{slot.day_name}</span>
                        <span className="mx-2 text-gray-400">|</span>
                        <span className="font-mono text-gray-700 text-sm">{slot.start_time} - {slot.end_time}</span>
                      </div>
                      <div className="font-medium">{slot.class_title}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                         <MapPin className="h-3 w-3" /> {slot.room_name} 
                         <span className="mx-1">•</span> 
                         <UserCheck className="h-3 w-3" /> {slot.teacher_name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Institution Roster
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 py-4">Student and Teacher onboarding portals are currently synchronized natively against internal class rosters.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InstitutionManagementPage;