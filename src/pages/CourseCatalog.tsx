import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  BookOpen, 
  Search, 
  Filter,
  Star,
  Users,
  Clock,
  ChevronRight,
  Grid,
  List,
  GraduationCap, Target, MapPin
} from 'lucide-react';
import { UgandaLevel, UgandaClass, Teacher } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { getCurriculumConfig } from '../lib/curriculum';

export const CourseCatalog: React.FC = () => {
  const [levels, setLevels] = useState<UgandaLevel[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { countryCode } = useAuth();
  const curriculumConfig = getCurriculumConfig(countryCode);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesResponse, usersResponse] = await Promise.all([
          fetch(`/data/courses.json?t=${new Date().getTime()}`),
          fetch(`/data/users.json?t=${new Date().getTime()}`)
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

  const getTeacherById = (teacherId: string) => {
    return teachers.find(teacher => teacher.id === teacherId);
  };

  const getAllClasses = (): UgandaClass[] => {
    const allClasses: UgandaClass[] = [];
    levels.forEach(level => {
      allClasses.push(...level.classes);
    });
    return allClasses;
  };

  const getFilteredClasses = () => {
    const classes = getAllClasses();
    return classes.filter(ugandaClass => {
      const matchesSearch = ugandaClass.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ugandaClass.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ugandaClass.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = selectedLevel === 'all' || ugandaClass.level === selectedLevel;
      const matchesClass = selectedClass === 'all' || ugandaClass.id === selectedClass;
      return matchesSearch && matchesLevel && matchesClass;
    });
  };

  const levelOptions = ['O\'level', 'A\'level'];
  const classOptions = getAllClasses().map(c => ({ id: c.id, name: c.name, level: c.level }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span className="text-blue-600 font-medium">{curriculumConfig.countryName} Secondary Education</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Class Catalog</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive classes aligned with the {curriculumConfig.countryName} ({curriculumConfig.examBody}) curriculum
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by class name, level, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Level Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                {levelOptions.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* Class Filter */}
            <div className="flex items-center gap-2">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Classes</option>
                {classOptions.map(ugandaClass => (
                  <option key={ugandaClass.id} value={ugandaClass.id}>
                    {ugandaClass.name} ({ugandaClass.level})
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {getFilteredClasses().length} class{getFilteredClasses().length !== 1 ? 'es' : ''}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* Class Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredClasses().map((ugandaClass) => (
              <ClassCard key={ugandaClass.id} ugandaClass={ugandaClass} teachers={teachers} />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {getFilteredClasses().map((ugandaClass) => (
              <ClassListItem key={ugandaClass.id} ugandaClass={ugandaClass} teachers={teachers} />
            ))}
          </div>
        )}

        {getFilteredClasses().length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ClassCard: React.FC<{ ugandaClass: UgandaClass; teachers: Teacher[] }> = ({ ugandaClass, teachers }) => {
  const getTeacherCount = () => {
    const teacherIds = new Set();
    ugandaClass.terms.forEach(term => {
      term.subjects.forEach(subject => {
        teacherIds.add(subject.teacherId);
      });
    });
    return teacherIds.size;
  };

  const getTotalSubjects = () => {
    let total = 0;
    ugandaClass.terms.forEach(term => {
      total += term.subjects.length;
    });
    return total;
  };

  const getTotalLessons = () => {
    let total = 0;
    ugandaClass.terms.forEach(term => {
      term.subjects.forEach(subject => {
        subject.topics.forEach(topic => {
          topic.subtopics.forEach(subtopic => {
            total += subtopic.lessons.length;
          });
        });
      });
    });
    return total;
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <Badge variant={ugandaClass.level === 'O\'level' ? 'default' : 'secondary'}>
              {ugandaClass.level}
            </Badge>
            {ugandaClass.isExamYear && (
              <Badge variant="outline" className="text-xs">
                {ugandaClass.examType} Year
              </Badge>
            )}
          </div>
          <div className="text-right">
            <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200">Start Free</Badge>
          </div>
        </div>
        <CardTitle className="text-xl">{ugandaClass.name}</CardTitle>
        <p className="text-sm text-gray-600">{ugandaClass.description}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <BookOpen className="h-4 w-4 mr-2" />
            {ugandaClass.terms.length} term{ugandaClass.terms.length > 1 ? 's' : ''} • {getTotalSubjects()} subjects • {getTotalLessons()} lessons
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            {getTeacherCount()} expert teacher{getTeacherCount() > 1 ? 's' : ''}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Target className="h-4 w-4 mr-2" />
            {ugandaClass.isExamYear ? `${ugandaClass.examType} exam preparation` : 'Foundation building'}
          </div>
        </div>

        {/* Subject Combinations for A'level */}
        {ugandaClass.level === 'A\'level' && ugandaClass.subjectCombinations && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Subject combinations:</p>
            <div className="flex flex-wrap gap-1">
              {ugandaClass.subjectCombinations.map((combo) => (
                <Badge key={combo} variant="outline" className="text-xs">
                  {combo}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Subjects Preview */}
        {ugandaClass.terms[0]?.subjects && ugandaClass.terms[0].subjects.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Offered subjects (All):</p>
            <div className="flex flex-wrap gap-1">
              {ugandaClass.terms[0].subjects.map((subject) => (
                <Badge key={subject.id} variant="outline" className="text-xs">
                  {subject.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Link to={`/classes/${ugandaClass.id}`}>
          <Button className="w-full">
            Explore {ugandaClass.name}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

const ClassListItem: React.FC<{ ugandaClass: UgandaClass; teachers: Teacher[] }> = ({ ugandaClass, teachers }) => {
  const getTeacherCount = () => {
    const teacherIds = new Set();
    ugandaClass.terms.forEach(term => {
      term.subjects.forEach(subject => {
        teacherIds.add(subject.teacherId);
      });
    });
    return teacherIds.size;
  };

  const getTotalSubjects = () => {
    let total = 0;
    ugandaClass.terms.forEach(term => {
      total += term.subjects.length;
    });
    return total;
  };

  const getTotalLessons = () => {
    let total = 0;
    ugandaClass.terms.forEach(term => {
      term.subjects.forEach(subject => {
        subject.topics.forEach(topic => {
          topic.subtopics.forEach(subtopic => {
            total += subtopic.lessons.length;
          });
        });
      });
    });
    return total;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant={ugandaClass.level === 'O\'level' ? 'default' : 'secondary'}>
                {ugandaClass.level}
              </Badge>
              <h3 className="text-xl font-semibold text-gray-900">{ugandaClass.name}</h3>
              {ugandaClass.isExamYear && (
                <Badge variant="outline" className="text-xs">
                  {ugandaClass.examType} Year
                </Badge>
              )}
            </div>
            
            <p className="text-gray-600 mb-3">{ugandaClass.description}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <BookOpen className="h-4 w-4 mr-2" />
                {ugandaClass.terms.length} terms • {getTotalSubjects()} subjects
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                {getTeacherCount()} teachers
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                {getTotalLessons()} lessons
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1 mt-2">
              <span className="text-xs font-semibold text-gray-700 mr-2">Subjects:</span>
              {ugandaClass.terms[0]?.subjects.map((subject) => (
                <Badge key={subject.id} variant="outline" className="text-xs">
                  {subject.name}
                </Badge>
              ))}
            </div>
            {ugandaClass.level === 'A\'level' && ugandaClass.subjectCombinations && (
              <div className="flex flex-wrap items-center gap-1 mt-2">
                <span className="text-xs font-semibold text-gray-700 mr-2">Combinations:</span>
                {ugandaClass.subjectCombinations.map((combo) => (
                  <Badge key={combo} variant="outline" className="text-xs">
                    {combo}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200 mb-2 block w-fit ml-auto">Start Free</Badge>
            </div>
            <Link to={`/classes/${ugandaClass.id}`}>
              <Button>
                View Details
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
