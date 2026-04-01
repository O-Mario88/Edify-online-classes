import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ParentUser, UniversalStudent } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AlertCircle, Calendar, GraduationCap, ArrowUpRight, ArrowDownRight, Clock, UserIcon, Activity } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Progress } from '../components/ui/progress';
import { NotificationPreferences } from '../components/dashboard/NotificationPreferences';

export const ParentDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const parent = userProfile as ParentUser;
  const [children, setChildren] = useState<UniversalStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would be an API call fetching just the linked children
    const fetchChildren = async () => {
      try {
        const response = await fetch('/data/hybrid-users.json');
        const data = await response.json();
        
        const linkedIds = parent?.children?.map(c => c.studentId) || [];
        const linkedChildren = data.universal_students.filter((student: UniversalStudent) => 
          linkedIds.includes(student.id)
        );
        
        setChildren(linkedChildren);
      } catch (err) {
        console.error("Failed to load children data", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (parent) {
      fetchChildren();
    }
  }, [parent]);

  if (isLoading) {
    return <div className="p-8"><div className="animate-pulse space-y-4 max-w-4xl mx-auto"><div className="h-8 bg-muted rounded w-1/4"></div><div className="h-32 bg-muted rounded"></div><div className="h-64 bg-muted rounded"></div></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Parent Portal</h1>
        <p className="text-gray-500 mt-2">Welcome back, {parent?.name.split(' ')[0]}. Here is how your children are doing this week.</p>
      </div>

      {/* Risk Alert Banner */}
      <Alert variant="destructive" className="mb-8 border-red-200 bg-red-50 text-red-900">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="font-bold">Attention Required</AlertTitle>
        <AlertDescription>
          Grace Nakato missed 2 assignments in Advanced Physics this week and is at risk of falling behind before the mock exams.
          <Button variant="link" className="text-red-700 p-0 ml-2 h-auto">View details</Button>
        </AlertDescription>
      </Alert>

      {/* Children Overview */}
      <div className="space-y-8">
        {children.map(child => (
          <Card key={child.id} className="overflow-hidden">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-primary/20">
                    <AvatarImage src={child.avatar} alt={child.name} />
                    <AvatarFallback><UserIcon size={24} /></AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{child.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <GraduationCap size={14} />
                      {child.student_statuses.institutional[0] ? child.student_statuses.institutional[0].class : 'Independent Learner'}
                      <Badge variant="secondary" className="text-xs">
                        {child.preferences.level}
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm">View Full Profile</Button>
                  <Button size="sm">Message Tutor</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Weekly Summary Auto-Gen */}
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Activity size={16} /> AI Weekly Summary
                    </h3>
                    <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100 space-y-2">
                       <p className="text-sm text-gray-700 leading-relaxed">
                         <strong>{child.name.split(' ')[0]}</strong> has maintained excellent attendance across all core subjects this week. However, there has been a notable dip in quiz scores related to purely mathematical concepts in Physics. I recommend reviewing the "Kinematics Equations" module before the end of the week.
                       </p>
                    </div>
                  </div>

                  {/* Progress Bars */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Current Class Progress</h3>
                    <div className="space-y-4">
                      {child.preferences.subjects.map((subject, idx) => (
                        <div key={subject}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">{subject}</span>
                            <span className="text-gray-500">{60 + (idx * 15)}%</span>
                          </div>
                          <Progress value={60 + (idx * 15)} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column Metrics */}
                <div className="space-y-4">
                   <div className="bg-card rounded-lg border p-4 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-sm font-medium text-gray-500">Attendance</span>
                         <Clock size={16} className="text-gray-400" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">92%</div>
                      <p className="text-xs text-green-600 flex items-center mt-1">
                         <ArrowUpRight size={12} className="mr-1" /> +2% from last week
                      </p>
                   </div>
                   
                   <div className="bg-card rounded-lg border p-4 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-sm font-medium text-gray-500">UNEB Readiness</span>
                         <Target size={16} className="text-gray-400" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">High</div>
                      <p className="text-xs text-blue-600 flex items-center mt-1">
                         On track for Division 1
                      </p>
                   </div>
                </div>

              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Communications Preferences */}
      <div className="mt-8">
         <NotificationPreferences />
      </div>

    </div>
  );
};

// Extracted missing Target icon from lucide-react manually to fix compiler error
const Target = ({ className, size }: { className?: string, size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
);
