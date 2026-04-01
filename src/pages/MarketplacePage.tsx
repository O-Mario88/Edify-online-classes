import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Clock, Users, PlayCircle, BookOpen, Filter, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface MarketplaceCourse {
  id: string;
  teacher_id: string;
  teacher_name: string;
  title: string;
  description: string;
  subject: string;
  level: string;
  difficulty: string;
  price: number;
  currency: string;
  duration_hours: number;
  rating: number;
  total_reviews: number;
  total_enrollments: number;
  thumbnail: string;
  preview_video: string;
  tags: string[];
  status: string;
}

interface IndependentTeacher {
  id: string;
  name: string;
  avatar: string;
  professional_info: {
    specializations: string[];
    teaching_experience: number;
    bio: string;
  };
  marketplace_profile: {
    rating: number;
    total_students: number;
    total_courses: number;
    featured: boolean;
  };
}

const MarketplacePage: React.FC = () => {
  const { user, currentContext } = useAuth();
  const [courses, setCourses] = useState<MarketplaceCourse[]>([]);
  const [teachers, setTeachers] = useState<IndependentTeacher[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<MarketplaceCourse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, selectedSubject, selectedLevel, priceRange]);

  const fetchMarketplaceData = async () => {
    try {
      const response = await fetch('/data/marketplace.json');
      const data = await response.json();
      setCourses(data.marketplace_courses || []);
      setTeachers(data.independent_teachers || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching marketplace data:', error);
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.teacher_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSubject = selectedSubject === 'all' || course.subject === selectedSubject;
      const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
      
      let matchesPrice = true;
      if (priceRange === 'under-50k') {
        matchesPrice = course.price < 50000;
      } else if (priceRange === '50k-100k') {
        matchesPrice = course.price >= 50000 && course.price <= 100000;
      } else if (priceRange === 'over-100k') {
        matchesPrice = course.price > 100000;
      }

      return matchesSearch && matchesSubject && matchesLevel && matchesPrice;
    });

    setFilteredCourses(filtered);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getTeacherById = (teacherId: string) => {
    return teachers.find(t => t.id === teacherId);
  };

  const handleEnrollCourse = (courseId: string) => {
    // Handle course enrollment
    console.log('Enrolling in course:', courseId);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">Loading marketplace...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Marketplace</h1>
        <p className="text-lg text-gray-600">
          Discover courses from Uganda's top independent educators
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Business Studies">Business Studies</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="O-level">O-level</SelectItem>
                  <SelectItem value="A-level">A-level</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under-50k">Under UGX 50,000</SelectItem>
                  <SelectItem value="50k-100k">UGX 50,000 - 100,000</SelectItem>
                  <SelectItem value="over-100k">Over UGX 100,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="courses">
            <BookOpen className="h-4 w-4 mr-2" />
            Courses ({filteredCourses.length})
          </TabsTrigger>
          <TabsTrigger value="teachers">
            <Users className="h-4 w-4 mr-2" />
            Teachers ({teachers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          {filteredCourses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No courses found matching your criteria.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                const teacher = getTeacherById(course.teacher_id);
                return (
                  <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gradient-to-r from-blue-500 to-purple-600 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PlayCircle className="h-12 w-12 text-white opacity-80" />
                      </div>
                      <Badge className="absolute top-2 left-2 bg-white text-gray-900">
                        {course.level}
                      </Badge>
                      <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
                        {formatPrice(course.price)}
                      </Badge>
                    </div>
                    
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={teacher?.avatar} />
                          <AvatarFallback>{course.teacher_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600">{course.teacher_name}</span>
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span>{course.rating}</span>
                          <span>({course.total_reviews})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{course.duration_hours}h</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{course.total_enrollments}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {course.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    
                    <CardFooter>
                      <Button 
                        onClick={() => handleEnrollCourse(course.id)}
                        className="w-full"
                        disabled={user?.role !== 'universal_student'}
                      >
                        {user?.role === 'universal_student' ? 'Enroll Now' : 'Login to Enroll'}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="teachers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((teacher) => (
              <Card key={teacher.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <Avatar className="h-20 w-20 mx-auto mb-4">
                    <AvatarImage src={teacher.avatar} />
                    <AvatarFallback className="text-lg">{teacher.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl">{teacher.name}</CardTitle>
                  {teacher.marketplace_profile.featured && (
                    <Badge className="mx-auto w-fit bg-yellow-500">Featured Teacher</Badge>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-semibold">{teacher.marketplace_profile.rating}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {teacher.professional_info.teaching_experience} years experience
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="font-semibold text-blue-600">
                        {teacher.marketplace_profile.total_students}
                      </div>
                      <div className="text-xs text-gray-600">Students</div>
                    </div>
                    <div>
                      <div className="font-semibold text-green-600">
                        {teacher.marketplace_profile.total_courses}
                      </div>
                      <div className="text-xs text-gray-600">Courses</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Specializations:</h4>
                    <div className="flex flex-wrap gap-1">
                      {teacher.professional_info.specializations.slice(0, 4).map((spec, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {teacher.professional_info.bio}
                  </p>
                </CardContent>
                
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View Profile
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketplacePage;