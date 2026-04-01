import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  BookOpen, 
  Users, 
  Star, 
  Play, 
  ArrowRight,
  CheckCircle,
  Globe,
  Award,
  Clock,
  TrendingUp,
  GraduationCap,
  Target,
  MapPin,
  Smartphone,
  Brain,
  Lightbulb,
  MessageSquare,
  BarChart3
} from 'lucide-react';
import { UgandaLevel, Teacher } from '../types';

export const HomePage: React.FC = () => {
  const [levels, setLevels] = useState<UgandaLevel[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesResponse, usersResponse] = await Promise.all([
          fetch('/data/courses.json'),
          fetch('/data/users.json')
        ]);
        
        const coursesData = await coursesResponse.json();
        const usersData = await usersResponse.json();
        
        setLevels(coursesData.levels);
        setTeachers(usersData.teachers);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const features = [
    {
      icon: GraduationCap,
      title: 'Uganda Curriculum Focused',
      description: 'Complete O\'level and A\'level classes aligned with UNEB curriculum and exam requirements'
    },
    {
      icon: Users,
      title: 'Qualified Uganda Teachers',
      description: 'Learn from experienced teachers with degrees from Makerere University and other top institutions'
    },
    {
      icon: Target,
      title: 'UCE & UACE Exam Prep',
      description: 'Comprehensive preparation for Uganda Certificate of Education and Advanced Certificate exams'
    },
    {
      icon: Smartphone,
      title: 'Mobile Money Payments',
      description: 'Easy payments with MTN Mobile Money, Airtel Money, and bank transfers in UGX'
    }
  ];

  const stats = [
    { label: 'Uganda Students', value: '2,500+', icon: Users },
    { label: 'Qualified Teachers', value: '50+', icon: Award },
    { label: 'Lesson Periods', value: '5,000+', icon: Clock },
    { label: 'UCE Success Rate', value: '96%', icon: TrendingUp }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-6 w-6 text-yellow-400" />
                <span className="text-yellow-400 font-medium">Proudly Serving Uganda</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Excel in Uganda's Secondary Education
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100">
                Master O'level and A'level subjects with Uganda's premier online learning platform. 
                Join thousands of students preparing for UCE and UACE success.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/classes">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                    Explore O'level & A'level Classes
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                    Start Learning Today
                  </Button>
                </Link>
              </div>
              <div className="mt-6 flex items-center gap-6 text-sm text-blue-100">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>UNEB Curriculum Aligned</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>Mobile Money Supported</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src="/images/backgrounds/education-bg.jpg"
                alt="Uganda Secondary Education"
                className="rounded-lg shadow-2xl"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-3">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Maple Online School Uganda?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're the only online platform specifically designed for Uganda's secondary education system, 
              with features tailored to local needs and payment methods.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <feature.icon className="h-12 w-12 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI-Powered Learning Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Brain className="h-8 w-8 text-blue-600" />
              <Badge variant="secondary" className="px-3 py-1">NEW</Badge>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              AI-Powered Learning Experience
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of education with personalized AI tools designed specifically for Uganda's students and teachers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-all hover:scale-105 bg-white border-blue-200">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Target className="h-10 w-10 text-blue-600" />
                  </div>
                </div>
                <CardTitle className="text-xl">Personal Learning Path</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  AI-powered personalized learning journeys that adapt to your strengths and learning style for UCE/UACE success.
                </p>
                <div className="flex justify-center gap-2">
                  <Badge variant="outline" className="text-xs">Adaptive</Badge>
                  <Badge variant="outline" className="text-xs">Smart</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all hover:scale-105 bg-white border-green-200">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Lightbulb className="h-10 w-10 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-xl">Collaborative Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Work on real-world projects with classmates across Uganda, building practical skills for your future career.
                </p>
                <div className="flex justify-center gap-2">
                  <Badge variant="outline" className="text-xs">Team Work</Badge>
                  <Badge variant="outline" className="text-xs">Real Projects</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all hover:scale-105 bg-white border-purple-200">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <MessageSquare className="h-10 w-10 text-purple-600" />
                  </div>
                </div>
                <CardTitle className="text-xl">Peer Tutoring Network</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Connect with verified peer tutors and join study groups with students from top schools across Uganda.
                </p>
                <div className="flex justify-center gap-2">
                  <Badge variant="outline" className="text-xs">Peer Learning</Badge>
                  <Badge variant="outline" className="text-xs">Study Groups</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all hover:scale-105 bg-white border-indigo-200">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-indigo-100 rounded-full">
                    <BarChart3 className="h-10 w-10 text-indigo-600" />
                  </div>
                </div>
                <CardTitle className="text-xl">AI Teaching Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  For teachers: AI-powered insights, automated quiz generation, and smart response suggestions to enhance teaching.
                </p>
                <div className="flex justify-center gap-2">
                  <Badge variant="outline" className="text-xs">For Teachers</Badge>
                  <Badge variant="outline" className="text-xs">AI-Powered</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Link to="/classes">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Explore AI Features
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Education Levels Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Complete Secondary Education Coverage
            </h2>
            <p className="text-xl text-gray-600">
              From Senior 1 to Senior 6 - comprehensive classes for every level
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {levels.map((level) => (
              <Card key={level.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={level.id === 'olevel' ? 'default' : 'secondary'} className="text-sm">
                      {level.name}
                    </Badge>
                    <span className="text-sm text-gray-500">{level.classes.length} classes</span>
                  </div>
                  <CardTitle className="text-2xl">{level.name}</CardTitle>
                  <p className="text-gray-600">{level.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {level.classes.slice(0, 4).map((ugandaClass) => (
                        <div key={ugandaClass.id} className="p-3 bg-gray-50 rounded-md">
                          <div className="font-medium text-sm">{ugandaClass.name}</div>
                          <div className="text-xs text-gray-600">
                            UGX {ugandaClass.priceUGX.toLocaleString()}/month
                          </div>
                          {ugandaClass.isExamYear && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {ugandaClass.examType} Year
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                      <Link to="/classes" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <BookOpen className="mr-2 h-4 w-4" />
                          View All Classes
                        </Button>
                      </Link>
                      <Link to="/live-sessions" className="flex-1">
                        <Button size="sm" className="w-full">
                          <Play className="mr-2 h-4 w-4" />
                          Live Sessions
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Teachers Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Learn from Uganda's Best Teachers
            </h2>
            <p className="text-xl text-gray-600">
              Qualified educators from Makerere University and other top institutions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teachers.slice(0, 3).map((teacher) => (
              <Card key={teacher.id} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <img
                    src={teacher.avatar}
                    alt={teacher.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=3B82F6&color=fff`;
                    }}
                  />
                  <CardTitle className="text-xl">{teacher.name}</CardTitle>
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">{teacher.rating}</span>
                    <span className="text-sm text-gray-500">({teacher.totalStudents} students)</span>
                  </div>
                  <p className="text-sm text-gray-600">{teacher.qualification}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 text-sm">{teacher.bio}</p>
                  <div className="flex flex-wrap gap-1 justify-center mb-3">
                    {teacher.subjects.slice(0, 2).map((subject) => (
                      <Badge key={subject} variant="outline" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500">
                    {teacher.experience} • {teacher.levels.join(', ')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Subject Combinations Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              A'level Subject Combinations
            </h2>
            <p className="text-xl text-gray-600">
              Choose the right combination for your university and career goals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'PCM', full: 'Physics, Chemistry, Mathematics', career: 'Engineering, Architecture, Computer Science' },
              { name: 'PCB', full: 'Physics, Chemistry, Biology', career: 'Medicine, Veterinary, Pharmacy' },
              { name: 'HEG', full: 'History, Economics, Geography', career: 'Law, Business, Social Sciences' },
              { name: 'HEL', full: 'History, Economics, Literature', career: 'Journalism, Literature, Education' },
              { name: 'ICT', full: 'Mathematics, Physics, ICT', career: 'Computer Science, Information Technology' }
            ].slice(0, 3).map((combo, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{combo.name}</CardTitle>
                  <p className="text-sm text-gray-600">{combo.full}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Career Paths:</strong> {combo.career}
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Excel in UCE & UACE?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of Uganda students already achieving academic success with our comprehensive online platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Start Learning Free
              </Button>
            </Link>
            <Link to="/classes">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Explore All Classes
              </Button>
            </Link>
          </div>
          <div className="mt-6 text-sm text-blue-100">
            <p>Pay with Mobile Money • UGX Pricing • Uganda Teachers • UNEB Aligned</p>
          </div>
        </div>
      </section>
    </div>
  );
};
