import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Target,
  Brain,
  CheckCircle,
  Lock,
  Lightbulb,
  BookOpen,
  Play,
  Clock,
  Calendar,
  TrendingUp,
  MapPin
} from 'lucide-react';

export const LearningPathPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('mathematics');

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const subjects = [
    { id: 'mathematics', name: 'Mathematics', progress: 65, nextTopic: 'Quadratic Equations' },
    { id: 'physics', name: 'Physics', progress: 42, nextTopic: 'Waves and Sound' },
    { id: 'chemistry', name: 'Chemistry', progress: 78, nextTopic: 'Organic Chemistry' },
    { id: 'biology', name: 'Biology', progress: 55, nextTopic: 'Cell Division' }
  ];

  const skillNodes = [
    { id: 1, title: 'Basic Algebra', status: 'mastered', mastery: 95, x: 100, y: 100 },
    { id: 2, title: 'Linear Equations', status: 'mastered', mastery: 88, x: 250, y: 80 },
    { id: 3, title: 'Quadratic Equations', status: 'current', mastery: 45, x: 400, y: 120 },
    { id: 4, title: 'Functions', status: 'recommended', mastery: 0, x: 550, y: 100 },
    { id: 5, title: 'Polynomials', status: 'locked', mastery: 0, x: 400, y: 220 }
  ];

  const weeklyPlan = [
    { day: 'Monday', activity: 'Complete Quadratic Equations - Part 1', duration: '45 min', type: 'Video Lesson' },
    { day: 'Tuesday', activity: 'Practice Quadratic Formula', duration: '30 min', type: 'Exercise' },
    { day: 'Wednesday', activity: 'Quadratic Equations - Part 2', duration: '45 min', type: 'Video Lesson' },
    { day: 'Thursday', activity: 'Review and Practice', duration: '30 min', type: 'Review' },
    { day: 'Friday', activity: 'Assessment Quiz', duration: '20 min', type: 'Quiz' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mastered': return 'bg-green-500';
      case 'current': return 'bg-blue-500';
      case 'recommended': return 'bg-orange-500';
      case 'locked': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'mastered': return <CheckCircle className="h-4 w-4 text-white" />;
      case 'current': return <Target className="h-4 w-4 text-white" />;
      case 'recommended': return <Lightbulb className="h-4 w-4 text-white" />;
      case 'locked': return <Lock className="h-4 w-4 text-white" />;
      default: return <BookOpen className="h-4 w-4 text-white" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your personalized learning path...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span className="text-blue-600 font-medium">AI-Powered Learning for Uganda Students</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Personal Learning Path</h1>
          <p className="text-lg text-gray-600">
            AI-customized study journey designed for UCE/UACE success
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="skill-tree" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Skill Tree
            </TabsTrigger>
            <TabsTrigger value="weekly-plan" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Weekly Plan
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {subjects.map((subject) => (
                <Card key={subject.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{subject.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>{subject.progress}%</span>
                        </div>
                        <Progress value={subject.progress} className="h-2" />
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Next Topic:</p>
                        <p className="font-medium">{subject.nextTopic}</p>
                      </div>
                      
                      <Button size="sm" className="w-full">
                        <Play className="mr-2 h-4 w-4" />
                        Continue Learning
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Focus Area This Week</h4>
                      <p className="text-blue-800">
                        Based on your recent performance, spend extra time on quadratic equations. 
                        Your current understanding is 45% - aim for 80% by Friday.
                      </p>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Strength</h4>
                      <p className="text-green-800">
                        You excel at basic algebra! This strong foundation will help with advanced topics.
                      </p>
                    </div>
                    
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-medium text-orange-900 mb-2">Study Tip</h4>
                      <p className="text-orange-800">
                        Try solving 3-4 practice problems daily to improve retention and speed.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="skill-tree">
            <Card>
              <CardHeader>
                <CardTitle>Mathematics Skill Tree</CardTitle>
                <p className="text-gray-600">Interactive visualization of your learning journey</p>
              </CardHeader>
              <CardContent>
                <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-8 min-h-[400px]">
                  {skillNodes.map((node) => (
                    <div
                      key={node.id}
                      className="absolute cursor-pointer transform transition-all duration-200 hover:scale-105"
                      style={{ left: node.x, top: node.y }}
                    >
                      <div className={`w-24 h-16 rounded-lg ${getStatusColor(node.status)} shadow-lg flex flex-col items-center justify-center relative`}>
                        {getStatusIcon(node.status)}
                        <span className="text-xs text-white font-medium text-center px-1 mt-1">
                          {node.title.split(' ').slice(0, 2).join(' ')}
                        </span>
                        {node.mastery > 0 && (
                          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                            <div className="bg-white rounded-full px-2 py-1 text-xs font-bold text-gray-700">
                              {node.mastery}%
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
               <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="bg-purple-50 rounded-t-lg pb-4 border-b border-purple-100">
                     <CardTitle className="text-purple-900 flex items-center gap-2"><Target className="w-5 h-5"/> Topic Readiness Diagnostic</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                     <p className="text-sm text-gray-600">You are currently struggling with solving Quadratic equations using the formula method. Practice to increase your NCDC mastery score.</p>
                     <Button className="w-full bg-purple-600 hover:bg-purple-700">Start 15-Minute Practice Check</Button>
                  </CardContent>
               </Card>
               <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="bg-indigo-50 rounded-t-lg pb-4 border-b border-indigo-100">
                     <CardTitle className="text-indigo-900 flex items-center gap-2"><Lightbulb className="w-5 h-5"/> Copilot Topic Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                     <p className="text-sm text-gray-600">Confused about the skill tree? Let the AI Copilot explain the current topic map in simpler terms before you attempt the practice drills.</p>
                     <Button variant="outline" className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50">Ask Copilot to Explain</Button>
                  </CardContent>
               </Card>
            </div>
          </TabsContent>

          <TabsContent value="weekly-plan">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  AI-Generated Weekly Study Plan
                </CardTitle>
                <p className="text-gray-600">Optimized for your learning style and schedule</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeklyPlan.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className="font-medium">{day.day}</span>
                          <Badge variant="outline" className="text-xs">
                            {day.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 ml-6">
                          {day.activity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{day.duration}</span>
                        <Button size="sm" variant="outline">
                          Start
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Study Streak</span>
                      <span className="font-bold text-green-600">7 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Session Time</span>
                      <span className="font-bold">42 minutes</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Topics Mastered</span>
                      <span className="font-bold text-blue-600">12/25</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Success Rate</span>
                      <span className="font-bold text-purple-600">78%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Adaptive Learning</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-medium text-blue-900">Learning Style</h4>
                      <p className="text-sm text-blue-800">Visual + Practice-based</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <h4 className="font-medium text-green-900">Best Study Time</h4>
                      <p className="text-sm text-green-800">Evening (6-8 PM)</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <h4 className="font-medium text-purple-900">Recommended Pace</h4>
                      <p className="text-sm text-purple-800">2-3 topics per week</p>
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

export default LearningPathPage;
