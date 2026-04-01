import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import {
  Users,
  Clock,
  Calendar,
  Search,
  Plus,
  Star,
  MapPin,
  Lightbulb,
  Target,
  FileText,
  MessageCircle,
  CheckCircle,
  TrendingUp,
  Award,
  Globe,
  Zap,
  PlayCircle
} from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const projectTemplates = [
    {
      id: '1',
      title: 'Uganda Water Crisis Solution',
      description: 'Design innovative solutions to address water scarcity in rural Uganda communities',
      level: "O'level",
      difficulty: 'intermediate',
      duration: '4 weeks',
      subject: 'Science & Technology',
      groupSize: '3-5 members',
      ugandaRelevance: 'high',
      skills: ['Research', 'Innovation', 'Problem Solving', 'Teamwork'],
      tags: ['water', 'sustainability', 'innovation']
    },
    {
      id: '2',
      title: 'Kampala Traffic Management System',
      description: 'Develop a smart traffic solution for Kampala city using technology and data analysis',
      level: "A'level",
      difficulty: 'advanced',
      duration: '6 weeks',
      subject: 'Mathematics & ICT',
      groupSize: '4-6 members',
      ugandaRelevance: 'high',
      skills: ['Data Analysis', 'Programming', 'Urban Planning', 'Critical Thinking'],
      tags: ['traffic', 'technology', 'urban-planning']
    },
    {
      id: '3',
      title: 'Local Food Security Initiative',
      description: 'Create a business plan for improving food security in your local community',
      level: "O'level",
      difficulty: 'beginner',
      duration: '3 weeks',
      subject: 'Entrepreneurship',
      groupSize: '2-4 members',
      ugandaRelevance: 'high',
      skills: ['Business Planning', 'Agriculture Knowledge', 'Market Research'],
      tags: ['agriculture', 'business', 'community']
    }
  ];

  const activeProjects = [
    {
      id: '1',
      title: 'Solar Power for Schools',
      description: 'Developing renewable energy solutions for rural schools',
      progress: 65,
      members: ['You', 'Grace Nakato', 'David Musoke', 'Sarah Namuli'],
      dueDate: '2025-07-15',
      lastUpdate: '2 days ago'
    },
    {
      id: '2',
      title: 'Mobile Banking App Design',
      description: 'Creating user-friendly mobile money interface',
      progress: 40,
      members: ['You', 'John Kiwanuka', 'Moses Ssebunya'],
      dueDate: '2025-07-22',
      lastUpdate: '1 day ago'
    }
  ];

  const completedProjects = [
    {
      id: '1',
      title: 'COVID-19 Awareness Campaign',
      description: 'Community health education project',
      completedDate: '2025-06-15',
      rating: 4.8,
      impact: 'Reached 500+ community members'
    },
    {
      id: '2',
      title: 'Local Market Price Tracker',
      description: 'Mobile app for tracking commodity prices',
      completedDate: '2025-05-20',
      rating: 4.6,
      impact: 'Used by 200+ farmers'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case 'high': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFilteredTemplates = () => {
    return projectTemplates.filter(template => {
      const matchesSearch = !searchTerm || 
        template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesLevel = selectedLevel === 'all' || template.level === selectedLevel;
      
      return matchesSearch && matchesLevel;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading collaborative projects...</p>
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
            <span className="text-blue-600 font-medium">Project-Based Learning for Uganda</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Collaborative Projects</h1>
          <p className="text-lg text-gray-600">
            Real-world projects designed to develop practical skills for Uganda's future leaders
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="marketplace" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="marketplace" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Project Marketplace
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <PlayCircle className="h-4 w-4" />
              Active Projects
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Completed
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="marketplace">
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search projects by title, description, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Levels</option>
                    <option value="O'level">O'level</option>
                    <option value="A'level">A'level</option>
                  </select>
                  
                  {user?.role === 'teacher' && (
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Project
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredTemplates().map((template) => (
                  <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-lg mb-2">{template.title}</CardTitle>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className={getDifficultyColor(template.difficulty)}>
                          {template.difficulty}
                        </Badge>
                        <Badge variant="outline">{template.level}</Badge>
                        <Badge className={getRelevanceColor(template.ugandaRelevance)}>
                          🇺🇬 {template.ugandaRelevance} relevance
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{template.description}</p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>{template.duration}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span>{template.groupSize}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Target className="h-4 w-4 text-gray-500" />
                          <span>{template.subject}</span>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium mb-2">Skills Developed:</p>
                          <div className="flex flex-wrap gap-1">
                            {template.skills.slice(0, 3).map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {template.skills.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{template.skills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {template.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>

                        <Button className="w-full mt-4">
                          <Lightbulb className="mr-2 h-4 w-4" />
                          Join Project
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="active">
            <div className="space-y-6">
              {activeProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{project.title}</CardTitle>
                        <p className="text-gray-600 mb-3">{project.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{project.members.length} members</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Due: {project.dueDate}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Updated {project.lastUpdate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{project.progress}%</div>
                        <p className="text-sm text-gray-600">complete</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-2">Team Members:</p>
                        <div className="flex flex-wrap gap-2">
                          {project.members.map((member, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {member}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          <PlayCircle className="mr-2 h-4 w-4" />
                          Continue Working
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Team Chat
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="mr-2 h-4 w-4" />
                          Documents
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <p className="text-gray-600">{project.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Completed:</span>
                        <span className="font-medium">{project.completedDate}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Rating:</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span className="font-medium">{project.rating}</span>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-sm text-gray-600">Impact:</span>
                        <p className="font-medium text-green-600">{project.impact}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Award className="mr-2 h-4 w-4" />
                          View Certificate
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="mr-2 h-4 w-4" />
                          Portfolio
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Projects Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">12</div>
                  <p className="text-sm text-gray-600">lifetime projects</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Collaboration Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">4.7</div>
                  <p className="text-sm text-gray-600">avg team rating</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Skills Gained
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">28</div>
                  <p className="text-sm text-gray-600">new skills</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Community Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">1.2K</div>
                  <p className="text-sm text-gray-600">people reached</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectsPage;
