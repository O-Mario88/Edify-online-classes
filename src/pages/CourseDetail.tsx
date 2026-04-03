import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  BookOpen, 
  Play, 
  FileText, 
  Users, 
  Star,
  Clock,
  CheckCircle,
  Target,
  Award,
  GraduationCap,
  MapPin,
  Calendar,
  TrendingUp,
  ChevronRight,
  Download,
  WifiOff
} from 'lucide-react';
import { UgandaLevel, UgandaClass, Subject, Teacher, Topic, Student } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { OfflineSyncEngine } from '../lib/offlineSync';

export const CourseDetail: React.FC = () => {
  const { classId, termId, subjectId } = useParams();
  const { user } = useAuth();
  const [levels, setLevels] = useState<UgandaLevel[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('');

  const [currentClass, setCurrentClass] = useState<UgandaClass | null>(null);
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);

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

        // Find the specific class and subject
        for (const level of coursesData.levels) {
          for (const ugandaClass of level.classes) {
            if (ugandaClass.id === classId) {
              setCurrentClass(ugandaClass);
              
              // Find the subject across all terms
              for (const term of ugandaClass.terms) {
                const subject = term.subjects.find(s => s.id === subjectId);
                if (subject) {
                  setCurrentSubject(subject);
                  
                  // Find the teacher
                  const teacher = usersData.teachers.find(t => t.id === subject.teacherId);
                  if (teacher) {
                    setCurrentTeacher(teacher);
                  }
                  break;
                }
              }
              break;
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classId, termId, subjectId]);

  const handleEnroll = async () => {
    setEnrolling(true);
    // Simulate enrollment process
    setTimeout(() => {
      setEnrolling(false);
      // Redirect to payment or dashboard
    }, 2000);
  };

  const getTotalLessons = () => {
    if (!currentSubject) return 0;
    let total = 0;
    currentSubject.topics.forEach(topic => {
      topic.subtopics.forEach(subtopic => {
        total += subtopic.lessons.length;
      });
    });
    return total;
  };

  const getCompletedLessons = () => {
    if (!currentSubject || !user) return 0;
    let completed = 0;
    currentSubject.topics.forEach(topic => {
      topic.subtopics.forEach(subtopic => {
        subtopic.lessons.forEach(lesson => {
          if (lesson.completed) completed++;
        });
      });
    });
    return completed;
  };

  const getProgressPercentage = () => {
    const total = getTotalLessons();
    const completed = getCompletedLessons();
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const isEnrolled = () => {
    if (!user || user.role !== 'universal_student' || !currentSubject) return false;
    const student = user as any;
    return student.enrolledSubjects?.includes(currentSubject.id) || false;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading class details...</p>
        </div>
      </div>
    );
  }

  if (!currentClass || !currentSubject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Class not found</h3>
          <p className="text-gray-600 mb-4">The requested class could not be found.</p>
          <Link to="/classes">
            <Button>Back to Classes</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/classes" className="hover:text-blue-600">Classes</Link>
            <ChevronRight className="h-4 w-4" />
            <span>{currentClass.level}</span>
            <ChevronRight className="h-4 w-4" />
            <span>{currentClass.name}</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 font-medium">{currentSubject.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Class Header */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Badge variant={currentClass.level === 'O\'level' ? 'default' : 'secondary'}>
                    {currentClass.level}
                  </Badge>
                  <Badge variant="outline" className={`text-xs ${
                    currentSubject.subject_type === 'sciences' ? 'border-blue-500 text-blue-600' :
                    currentSubject.subject_type === 'humanities' ? 'border-green-500 text-green-600' :
                    currentSubject.subject_type === 'languages' ? 'border-purple-500 text-purple-600' :
                    currentSubject.subject_type === 'technical' ? 'border-orange-500 text-orange-600' :
                    'border-pink-500 text-pink-600'
                  }`}>
                    {currentSubject.subject_type}
                  </Badge>
                  {currentSubject.category && (
                    <Badge variant="outline" className="text-xs">
                      {currentSubject.category}
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <MapPin className="h-4 w-4 text-blue-600 inline mr-1" />
                  <span className="text-sm text-blue-600">Uganda Curriculum</span>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentClass.name} - {currentSubject.name}
              </h1>
              <p className="text-lg text-gray-600 mb-6">{currentSubject.description}</p>

              {/* Key Information */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                  <div className="text-lg font-semibold">{currentSubject.topics.length}</div>
                  <div className="text-sm text-gray-600">Topics</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-6 w-6 text-green-600 mx-auto mb-1" />
                  <div className="text-lg font-semibold">{getTotalLessons()}</div>
                  <div className="text-sm text-gray-600">Lessons</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                  <div className="text-lg font-semibold">{Math.floor(Math.random() * 200) + 50}</div>
                  <div className="text-sm text-gray-600">Students</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Target className="h-6 w-6 text-red-600 mx-auto mb-1" />
                  <div className="text-lg font-semibold">{currentClass.isExamYear ? currentClass.examType : 'Foundation'}</div>
                  <div className="text-sm text-gray-600">Focus</div>
                </div>
              </div>

              {/* Progress (if enrolled) */}
              {isEnrolled() && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Your Progress</span>
                    <span className="text-sm text-gray-600">{getCompletedLessons()} of {getTotalLessons()} lessons</span>
                  </div>
                  <Progress value={getProgressPercentage()} className="w-full" />
                  <p className="text-sm text-gray-600 mt-1">{getProgressPercentage()}% complete</p>
                </div>
              )}

              {/* Enrollment Button */}
              {!isEnrolled() && (
                <div className="flex gap-3">
                  <Button 
                    onClick={handleEnroll} 
                    disabled={enrolling}
                    size="lg"
                    className="flex-1"
                  >
                    {enrolling ? 'Enrolling...' : `Enroll for UGX ${currentClass.priceUGX.toLocaleString()}/month`}
                  </Button>
                  <Button variant="outline" size="lg">
                    Preview Content
                  </Button>
                </div>
              )}
            </div>

            {/* Class Content Tabs */}
            <Tabs defaultValue="curriculum" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="teacher">Teacher</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>

              <TabsContent value="curriculum">
                <Card>
                  <CardHeader>
                    <CardTitle>Class Curriculum</CardTitle>
                    <p className="text-gray-600">
                      Comprehensive coverage aligned with UNEB curriculum for {currentClass.level}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentSubject.topics.map((topic, topicIndex) => (
                        <div key={topic.id} className="border rounded-lg">
                          <button
                            onClick={() => setSelectedTopic(selectedTopic === topic.id ? '' : topic.id)}
                            className="w-full p-4 text-left hover:bg-gray-50 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                                {topicIndex + 1}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{topic.name}</h4>
                                <p className="text-sm text-gray-600">{topic.description}</p>
                              </div>
                            </div>
                            <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${
                              selectedTopic === topic.id ? 'rotate-90' : ''
                            }`} />
                          </button>
                          {/* Open Full Topic Page */}
                          <div className="px-4 pb-2 flex justify-end">
                            <Link
                              to={`/classes/${classId}/${currentClass.terms[0]?.id || 'term-1'}/${subjectId}/topic/${topic.id}`}
                              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Open full topic page <ChevronRight className="h-3 w-3" />
                            </Link>
                          </div>
                          
                          {selectedTopic === topic.id && (
                            <div className="px-4 pb-4 border-t bg-gray-50">
                              {topic.subtopics.map((subtopic, subtopicIndex) => (
                                <div key={subtopic.id} className="py-4 border-b last:border-0 last:pb-0">
                                  <h5 className="font-semibold text-gray-800 mb-3">{subtopic.name}</h5>
                                  <div className="space-y-4">
                                    {subtopic.lessons.map((lesson) => (
                                      <div key={lesson.id} className="bg-white p-4 rounded-lg border shadow-sm">
                                        <div className="flex items-start justify-between mb-3">
                                          <div className="flex items-center gap-3">
                                            {lesson.type === 'video' && <Play className="h-5 w-5 text-red-500" />}
                                            {lesson.type === 'exercise' && <BookOpen className="h-5 w-5 text-purple-500" />}
                                            {lesson.type === 'notes' && <FileText className="h-5 w-5 text-green-500" />}
                                            <div>
                                              <span className="font-medium text-gray-900 block">{lesson.title}</span>
                                              {lesson.duration && <span className="text-xs text-gray-500">Est: {lesson.duration}</span>}
                                            </div>
                                          </div>
                                          {lesson.completed ? (
                                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1"/> Completed</Badge>
                                          ) : (
                                              <Badge variant="outline" className="text-gray-500">Pending</Badge>
                                          )}
                                        </div>
                                        
                                        {/* Student Learning Action Strip */}
                                        <div className="flex flex-wrap gap-2 pt-2 border-t mt-2">
                                          <Button variant="ghost" size="sm" className="text-xs h-7 text-blue-600 bg-blue-50 hover:bg-blue-100">
                                            {lesson.type === 'video' ? 'Watch Lesson' : 'Read Notes'}
                                          </Button>
                                          <Button variant="ghost" size="sm" className="text-xs h-7 text-purple-600 bg-purple-50 hover:bg-purple-100">
                                            Start Practice
                                          </Button>
                                          <Button variant="ghost" size="sm" className="text-xs h-7 text-gray-600 bg-gray-100 hover:bg-gray-200">
                                            Join Discussion
                                          </Button>
                                          
                                          <div className="flex-1 flex justify-end">
                                            <button 
                                              onClick={(e) => {
                                                  e.stopPropagation();
                                                  OfflineSyncEngine.queueJob('download_course', lesson.id);
                                              }}
                                              className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded transition-all"
                                              title="Save for offline view"
                                            >
                                              <Download className="h-4 w-4" />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="teacher">
                {currentTeacher && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-6">
                        <img
                          src={currentTeacher.avatar}
                          alt={currentTeacher.name}
                          className="w-24 h-24 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentTeacher.name)}&background=3B82F6&color=fff`;
                          }}
                        />
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">{currentTeacher.name}</h3>
                          <p className="text-lg text-gray-600 mb-3">{currentTeacher.qualification}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center">
                              <Star className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
                              <div className="font-semibold">{currentTeacher.rating}</div>
                              <div className="text-sm text-gray-600">Rating</div>
                            </div>
                            <div className="text-center">
                              <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                              <div className="font-semibold">{currentTeacher.totalStudents}</div>
                              <div className="text-sm text-gray-600">Students</div>
                            </div>
                            <div className="text-center">
                              <BookOpen className="h-5 w-5 text-green-600 mx-auto mb-1" />
                              <div className="font-semibold">{currentTeacher.subjects.length}</div>
                              <div className="text-sm text-gray-600">Subjects</div>
                            </div>
                            <div className="text-center">
                              <Award className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                              <div className="font-semibold">{currentTeacher.experience}</div>
                              <div className="text-sm text-gray-600">Experience</div>
                            </div>
                          </div>

                          <p className="text-gray-700 mb-4">{currentTeacher.bio}</p>

                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">Specializations</h4>
                              <div className="flex flex-wrap gap-2">
                                {currentTeacher.specializations?.map((spec) => (
                                  <Badge key={spec} variant="outline" className="text-xs">
                                    {spec}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">Teaching Levels</h4>
                              <div className="flex flex-wrap gap-2">
                                {currentTeacher.levels.map((level) => (
                                  <Badge key={level} variant="secondary" className="text-xs">
                                    {level}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle>Student Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Overall Rating */}
                      <div className="text-center p-6 bg-gray-50 rounded-lg">
                        <div className="text-4xl font-bold text-gray-900 mb-2">4.8</div>
                        <div className="flex justify-center mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <p className="text-gray-600">Based on 127 reviews</p>
                      </div>

                      {/* Sample Reviews */}
                      {[
                        {
                          name: "Grace Nakato",
                          rating: 5,
                          comment: "Excellent teaching! The way complex math topics are broken down makes it so easy to understand. Perfect for UCE preparation!",
                          date: "2025-06-20"
                        },
                        {
                          name: "David Musoke", 
                          rating: 5,
                          comment: "This class helped me improve from D to A in Mathematics. The practice exercises are exactly like what we see in UCE exams.",
                          date: "2025-06-15"
                        }
                      ].map((review, index) => (
                        <div key={index} className="border-b pb-4 last:border-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">
                                {review.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{review.name}</h4>
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} className={`h-4 w-4 ${
                                      star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`} />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500">{review.date}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="resources">
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Resources</CardTitle>
                    <p className="text-gray-600">
                      Supplementary materials to enhance your learning experience
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: "UNEB Past Papers Collection", type: "PDF", size: "15 MB", icon: FileText },
                        { name: "Quick Reference Formula Sheet", type: "PDF", size: "2 MB", icon: FileText },
                        { name: "Practice Exercise Bank", type: "Interactive", size: "Online", icon: BookOpen },
                        { name: "Video Solutions Library", type: "Videos", size: "500+ videos", icon: Play }
                      ].map((resource, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <resource.icon className="h-5 w-5 text-blue-600" />
                            <div>
                              <h4 className="font-medium text-gray-900">{resource.name}</h4>
                              <p className="text-sm text-gray-600">{resource.type} • {resource.size}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            {resource.type === "Interactive" ? "Access" : "Download"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Class Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Class Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Price</span>
                  <span className="font-bold text-xl text-blue-600">
                    UGX {currentClass.priceUGX.toLocaleString()}/month
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Level</span>
                  <Badge variant={currentClass.level === 'O\'level' ? 'default' : 'secondary'}>
                    {currentClass.level}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Exam Focus</span>
                  <span className="font-medium">
                    {currentClass.isExamYear ? currentClass.examType : 'Foundation'}
                  </span>
                </div>
                {currentClass.isExamYear && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Exam Year</span>
                    <span className="font-medium">2025</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Language</span>
                  <span className="font-medium">English</span>
                </div>
              </CardContent>
            </Card>

            {/* Related Subjects */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Related Subjects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentClass.terms[0]?.subjects
                    .filter(s => s.id !== currentSubject.id)
                    .slice(0, 3)
                    .map((subject) => (
                      <Link
                        key={subject.id}
                        to={`/classes/${classId}/${currentClass.terms[0].id}/${subject.id}`}
                        className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <h4 className="font-medium text-gray-900">{subject.name}</h4>
                        <p className="text-sm text-gray-600">{subject.description}</p>
                      </Link>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/forum">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Join Subject Forum
                  </Button>
                </Link>
                <Link to="/live-sessions">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Live Sessions
                  </Button>
                </Link>
                <Button 
                   variant="outline" 
                   className="w-full justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200"
                   onClick={() => OfflineSyncEngine.queueJob('download_course', currentSubject.id)}
                >
                  <WifiOff className="h-4 w-4 mr-2" />
                  Save Class for Offline
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Track Progress
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};