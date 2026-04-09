import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { EditorialPanel } from '../components/ui/editorial/EditorialPanel';
import { EditorialPill } from '../components/ui/editorial/EditorialPill';
import { EditorialHeader } from '../components/ui/editorial/EditorialHeader';
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
  MapPin,
  Calendar,
  TrendingUp,
  ChevronRight,
  ArrowRight,
  Download,
  WifiOff
} from 'lucide-react';
import { UgandaLevel, UgandaClass, Subject, Teacher, Topic, Student } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { OfflineSyncEngine } from '../lib/offlineSync';
import { apiClient } from '@/lib/apiClient';

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
          apiClient.get('/curriculum/full-tree/').catch(() => ({ data: { levels: [] } })),
          fetch(`/data/users.json?t=${new Date().getTime()}`).then(r => r.json()).catch(() => ({ teachers: [] }))
        ]);
        
        const coursesData = coursesResponse.data || { levels: [] };
        const usersData = usersResponse;
        
        setLevels(coursesData.levels || []);
        setTeachers(usersData.teachers || []);

        // Find the specific class and subject
        let found = false;
        for (const level of coursesData.levels) {
          if(found) break;
          for (const ugandaClass of level.classes) {
            if(found) break;
            if (ugandaClass.id === classId) {
              setCurrentClass(ugandaClass);
              
              // Find the subject for the specific term in the URL
              const specificTerm = ugandaClass.terms.find((t: any) => t.id === termId) || ugandaClass.terms[0];
              if (specificTerm) {
                const subject = specificTerm.subjects.find((s: Subject) => s.id === subjectId);
                if (subject) {
                  setCurrentSubject(subject);
                  
                  // Find the teacher
                  const teacher = usersData.teachers.find((t: Teacher) => t.id === subject.teacherId);
                  if (teacher) {
                    setCurrentTeacher(teacher);
                  }
                  found = true;
                }
              }
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
      <div className="min-h-screen bg-[#fbfaf8] flex items-center justify-center">
        <div className="animate-pulse w-12 h-12 rounded-full bg-[#f4efe2]"></div>
      </div>
    );
  }

  if (!currentClass || !currentSubject) {
    return (
      <div className="min-h-screen bg-[#fbfaf8] flex items-center justify-center">
        <EditorialPanel className="text-center py-20 max-w-lg">
          <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-6" />
          <EditorialHeader level="h3" className="text-slate-800 mb-2">Subject Unavailable</EditorialHeader>
          <p className="text-slate-500 font-light mb-8">The requested academic material could not be located.</p>
          <Link to="/classes">
            <EditorialPill variant="outline" className="mx-auto">Back to Pathways</EditorialPill>
          </Link>
        </EditorialPanel>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfaf8] font-sans pb-24 relative">
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-[0.4] pointer-events-none"
        style={{ backgroundImage: "url('/images/bg-editorial-sand.png')" }}
      />
      <div className="fixed inset-0 bg-white/40 pointer-events-none" />

      {/* Breadcrumb Area */}
      <div className="relative z-10 pt-8 pb-4 border-b border-white mix-blend-multiply">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            <Link to="/classes" className="hover:text-slate-800 transition-colors">Pathways</Link>
            <ChevronRight className="h-3 w-3" />
            <span>{currentClass.level}</span>
            <ChevronRight className="h-3 w-3" />
            <Link to={`/classes/${classId}`} className="hover:text-slate-800 transition-colors">{currentClass.name}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-900 border-b border-slate-900 pb-0.5">{currentSubject.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Header Panel */}
            <EditorialPanel variant="glass" radius="xl" className="border border-white shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#f4efe2] rounded-full blur-3xl opacity-50 -z-10 pointer-events-none" />
              
              <div className="flex flex-wrap items-start justify-between gap-4 mb-8 border-b border-white mix-blend-multiply pb-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="bg-slate-900 border-none px-3 py-1 text-[10px] uppercase font-bold tracking-widest">
                    {currentClass.level}
                  </Badge>
                  <Badge variant="outline" className={`px-3 py-1 text-[10px] uppercase font-bold tracking-widest border-none ${
                    currentSubject.subject_type === 'sciences' ? 'bg-blue-50 text-blue-700' :
                    currentSubject.subject_type === 'humanities' ? 'bg-emerald-50 text-emerald-700' :
                    currentSubject.subject_type === 'languages' ? 'bg-purple-50 text-purple-700' :
                    currentSubject.subject_type === 'technical' ? 'bg-orange-50 text-orange-700' :
                    'bg-rose-50 text-rose-700'
                  }`}>
                    {currentSubject.subject_type}
                  </Badge>
                  {currentSubject.category && (
                    <Badge variant="outline" className="px-3 py-1 text-[10px] uppercase font-bold tracking-widest border-slate-200 text-slate-500 bg-white">
                      {currentSubject.category}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#8e8268]">
                  <MapPin className="h-3.5 w-3.5" />
                  National Curriculum
                </div>
              </div>

              <EditorialHeader level="h1" className="text-slate-900 mb-4">
                {currentSubject.name}_
              </EditorialHeader>
              <p className="text-lg text-slate-500 font-light leading-relaxed mb-10 max-w-2xl">{currentSubject.description}</p>

              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                <div className="p-4 bg-white/60 rounded-2xl border border-white text-center">
                  <BookOpen className="h-5 w-5 text-slate-400 mx-auto mb-2" />
                  <div className="text-2xl font-black text-slate-800">{currentSubject.topics.length}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Syllabus Topics</div>
                </div>
                <div className="p-4 bg-white/60 rounded-2xl border border-white text-center">
                  <Clock className="h-5 w-5 text-slate-400 mx-auto mb-2" />
                  <div className="text-2xl font-black text-slate-800">{getTotalLessons()}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Study Sessions</div>
                </div>
                <div className="p-4 bg-white/60 rounded-2xl border border-white text-center">
                  <Users className="h-5 w-5 text-slate-400 mx-auto mb-2" />
                  <div className="text-2xl font-black text-slate-800">{Math.floor(Math.random() * 200) + 50}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Active Peers</div>
                </div>
                <div className="p-4 bg-white/60 rounded-2xl border border-white text-center">
                  <Target className="h-5 w-5 text-slate-400 mx-auto mb-2" />
                  <div className="text-xl font-black text-slate-800 break-words line-clamp-1">{currentClass.isExamYear ? currentClass.examType : 'Core'}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Focus Area</div>
                </div>
              </div>

              {/* Action Area */}
              {isEnrolled() ? (
                <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mastery Progress</span>
                    <span className="text-sm font-bold text-slate-700">{getCompletedLessons()} / {getTotalLessons()} Units</span>
                  </div>
                  <Progress value={getProgressPercentage()} className="h-2 bg-slate-100 mb-2" indicatorClassName="bg-emerald-500" />
                  <p className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase text-right">{getProgressPercentage()}% Verified</p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white mix-blend-multiply">
                  <EditorialPill 
                    variant="primary"
                    onClick={handleEnroll} 
                    disabled={enrolling}
                    className="flex-1 justify-center py-5 shadow-xl shadow-slate-900/10"
                  >
                    {enrolling ? 'Processing...' : `Secure Access • UGX ${currentClass.priceUGX.toLocaleString()}/mo`}
                  </EditorialPill>
                  <EditorialPill variant="outline" className="justify-center py-5 bg-white">
                    Preview Material
                  </EditorialPill>
                </div>
              )}
            </EditorialPanel>

            <Tabs defaultValue="curriculum" className="space-y-8">
              <TabsList className="flex overflow-x-auto hide-scrollbar w-full h-auto bg-white/60 backdrop-blur-md p-2 rounded-[2rem] border border-white shadow-sm gap-2">
                <TabsTrigger value="curriculum" className="flex-1 rounded-full py-3.5 text-xs font-bold uppercase tracking-wider data-[state=active]:bg-slate-900 data-[state=active]:text-white text-slate-500 hover:bg-white/50 transition-all">Syllabus</TabsTrigger>
                <TabsTrigger value="teacher" className="flex-1 rounded-full py-3.5 text-xs font-bold uppercase tracking-wider data-[state=active]:bg-slate-900 data-[state=active]:text-white text-slate-500 hover:bg-white/50 transition-all">Educator</TabsTrigger>
                <TabsTrigger value="reviews" className="flex-1 rounded-full py-3.5 text-xs font-bold uppercase tracking-wider data-[state=active]:bg-slate-900 data-[state=active]:text-white text-slate-500 hover:bg-white/50 transition-all">Alumni Insight</TabsTrigger>
                <TabsTrigger value="resources" className="flex-1 rounded-full py-3.5 text-xs font-bold uppercase tracking-wider data-[state=active]:bg-slate-900 data-[state=active]:text-white text-slate-500 hover:bg-white/50 transition-all">Archives</TabsTrigger>
              </TabsList>

              <TabsContent value="curriculum">
                <EditorialPanel variant="elevated" radius="large" className="border border-slate-100 p-0 overflow-hidden">
                  <div className="p-8 border-b border-slate-50 bg-[#fbfaf8]">
                    <EditorialHeader level="h3" className="text-slate-800">Academic Sequence</EditorialHeader>
                    <p className="text-slate-500 font-light mt-2 text-sm">Rigorous progression aligned strictly with national standards.</p>
                  </div>
                  
                  <div className="divide-y divide-slate-50">
                    {currentSubject.topics.map((topic, topicIndex) => (
                      <div key={topic.id} className="group">
                        <button
                          onClick={() => setSelectedTopic(selectedTopic === topic.id ? '' : topic.id)}
                          className={`w-full p-6 text-left flex items-center justify-between transition-colors ${selectedTopic === topic.id ? 'bg-[#f4efe2]/30' : 'bg-white hover:bg-slate-50'}`}
                        >
                          <div className="flex items-center gap-6">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border transition-colors ${selectedTopic === topic.id ? 'bg-[#f4efe2] border-white text-[#8e8268]' : 'bg-slate-50 border-slate-100 text-slate-400 group-hover:bg-slate-100'}`}>
                              {topicIndex + 1}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-lg">{topic.name}</h4>
                              <p className="text-sm font-light text-slate-500 mt-1 line-clamp-1">{topic.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Link
                              to={`/classes/${classId}/${currentClass.terms[0]?.id || 'term-1'}/${subjectId}/topic/${topic.id}`}
                              className="text-[10px] font-bold uppercase tracking-widest text-[#8e8268] hover:text-blue-600 hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Enter Space <ArrowRight className="h-3 w-3" />
                            </Link>
                            <ChevronRight className={`h-4 w-4 text-slate-300 transition-transform duration-300 ${
                              selectedTopic === topic.id ? 'rotate-90' : ''
                            }`} />
                          </div>
                        </button>
                        
                        <div className={`grid transition-all duration-300 ease-in-out ${selectedTopic === topic.id ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                          <div className="overflow-hidden bg-[#fbfaf8]">
                            <div className="p-6">
                              {topic.subtopics.map((subtopic, subtopicIndex) => (
                                <div key={subtopic.id} className="mb-8 last:mb-0">
                                  <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-3">
                                     <span className="w-6 h-px bg-slate-300" />
                                     {subtopic.name}
                                  </h5>
                                  <div className="space-y-3 pl-2 sm:pl-9 border-l border-slate-200">
                                    {subtopic.lessons.map((lesson) => (
                                      <div key={lesson.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group/lesson relative overflow-hidden">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                          <div className="flex items-start sm:items-center gap-4">
                                            <div className={`p-3 rounded-full flex-shrink-0 ${
                                              lesson.type === 'video' ? 'bg-rose-50 text-rose-600' :
                                              lesson.type === 'exercise' ? 'bg-[#f4efe2] text-[#8e8268]' :
                                              'bg-slate-50 text-slate-600'
                                            }`}>
                                              {lesson.type === 'video' && <Play className="h-4 w-4" />}
                                              {lesson.type === 'exercise' && <BookOpen className="h-4 w-4" />}
                                              {lesson.type === 'notes' && <FileText className="h-4 w-4" />}
                                            </div>
                                            <div>
                                              <span className="font-bold text-slate-800 text-base block mb-1">{lesson.title}</span>
                                              {lesson.duration && <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duration • {lesson.duration}</span>}
                                            </div>
                                          </div>
                                          
                                          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-slate-50">
                                            {lesson.completed ? (
                                                <Badge className="bg-emerald-50 text-emerald-700 border-none px-3 py-1 font-bold text-[10px] uppercase tracking-widest"><CheckCircle className="w-3 h-3 mr-1.5 inline mb-0.5"/> Verified</Badge>
                                            ) : (
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Unverified</span>
                                            )}
                                            
                                            <div className="flex items-center gap-1">
                                              <button 
                                                onClick={(e) => { e.stopPropagation(); OfflineSyncEngine.queueJob('download_course', lesson.id); }}
                                                className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-all border border-slate-100"
                                                title="Save for offline"
                                              >
                                                <Download className="h-3.5 w-3.5" />
                                              </button>
                                              <button className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-all border border-slate-100 sm:opacity-0 sm:group-hover/lesson:opacity-100">
                                                <ChevronRight className="h-3.5 w-3.5" />
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </EditorialPanel>
              </TabsContent>

              <TabsContent value="teacher">
                {currentTeacher && (
                  <EditorialPanel variant="elevated" radius="large" className="border border-slate-100 p-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl shadow-slate-900/10">
                          <img
                            src={currentTeacher.avatar}
                            alt={currentTeacher.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentTeacher.name)}&background=1e293b&color=fff`; }}
                          />
                        </div>
                        <div className="absolute -bottom-3 -right-3 bg-white p-1 rounded-full shadow-sm border border-slate-100">
                           <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center z-10 relative">
                             <CheckCircle className="w-4 h-4" />
                           </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 text-center md:text-left">
                        <EditorialHeader level="h2" className="text-slate-900 mb-1">{currentTeacher.name}</EditorialHeader>
                        <p className="text-sm font-bold uppercase tracking-widest text-[#8e8268] mb-6">{currentTeacher.qualification}</p>
                        
                        <div className="flex flex-wrap justify-center md:justify-start gap-6 mb-8 py-6 border-y border-slate-100 mix-blend-multiply">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1 justify-center md:justify-start">
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                              <span className="font-black text-slate-800 text-lg">{currentTeacher.rating}</span>
                            </div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Score</div>
                          </div>
                          <div className="w-px bg-slate-200" />
                          <div>
                            <div className="font-black text-slate-800 text-lg mb-1">{currentTeacher.totalStudents}</div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Alumni</div>
                          </div>
                          <div className="w-px bg-slate-200 hidden sm:block" />
                          <div className="hidden sm:block">
                            <div className="font-black text-slate-800 text-lg mb-1">{currentTeacher.experience}</div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Tenure</div>
                          </div>
                        </div>

                        <p className="text-slate-600 font-light leading-relaxed mb-6 max-w-2xl">{currentTeacher.bio}</p>

                        <div className="space-y-4">
                          <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Subject Mastery</h4>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                              {currentTeacher.specializations?.map((spec) => (
                                <span key={spec} className="border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full text-xs font-semibold bg-white shadow-sm">
                                  {spec}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </EditorialPanel>
                )}
              </TabsContent>

              <TabsContent value="reviews">
                <EditorialPanel variant="elevated" radius="large" className="border border-slate-100 p-0 overflow-hidden">
                  <div className="p-8 border-b border-slate-50 bg-[#fbfaf8] flex flex-col md:flex-row items-center gap-8">
                    <div className="text-center md:text-left border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-8 mx-auto md:mx-0">
                      <div className="text-5xl font-black text-slate-900 mb-3 tracking-tighter">4.8</div>
                      <div className="flex justify-center md:justify-start gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-5 w-5 text-amber-500 fill-amber-500" />
                        ))}
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">127 Student Reviews</p>
                    </div>
                    <div className="flex-1 w-full max-w-md">
                      {/* Rating bars */}
                      {[5, 4, 3, 2, 1].map(r => (
                        <div key={r} className="flex items-center gap-3 mb-2 last:mb-0">
                           <span className="text-xs font-bold text-slate-500 w-2">{r}</span>
                           <Progress value={r === 5 ? 80 : r === 4 ? 15 : r === 3 ? 3 : 1} className="h-1.5 flex-1 bg-slate-100" indicatorClassName="bg-amber-400" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="divide-y divide-slate-50">
                    {[
                      { name: "Grace Nakato", rating: 5, comment: "Masterclass level teaching. The way complex topics are broken down makes it so easy to understand. Perfect for UCE preparation!", date: "2025-06-20", init: "GN" },
                      { name: "David Musoke", rating: 5, comment: "This class helped me improve from D to A. The integrated practice exercises are exactly aligned with national standards.", date: "2025-06-15", init: "DM" }
                    ].map((review, index) => (
                      <div key={index} className="p-8 bg-white">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-[#f4efe2] rounded-full flex items-center justify-center border border-white shadow-sm">
                            <span className="text-[#8e8268] font-black tracking-widest">{review.init}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">{review.name}</h4>
                            <div className="flex items-center gap-2 mt-1.5">
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star key={star} className={`h-3.5 w-3.5 ${star <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                                ))}
                              </div>
                              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-300 ml-2">• {review.date}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-slate-600 font-light leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </EditorialPanel>
              </TabsContent>

              <TabsContent value="resources">
                <EditorialPanel variant="elevated" radius="large" className="border border-slate-100 p-0 overflow-hidden">
                  <div className="p-8 border-b border-slate-50 bg-[#fbfaf8]">
                    <EditorialHeader level="h3" className="text-slate-800">Resource Archives</EditorialHeader>
                    <p className="text-slate-500 font-light mt-2 text-sm">Supplementary materials curated for excellence.</p>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { name: "UNEB Past Papers Collection", type: "PDF Archive", size: "15 MB", icon: FileText, color: "text-rose-600 bg-rose-50 border-rose-100" },
                        { name: "Quick Reference Formula Sheet", type: "PDF Document", size: "2 MB", icon: FileText, color: "text-blue-600 bg-blue-50 border-blue-100" },
                        { name: "Practice Exercise Bank", type: "Interactive Module", size: "Cloud App", icon: BookOpen, color: "text-[#8e8268] bg-[#f4efe2] border-white" },
                        { name: "Video Solutions Library", type: "Media Hub", size: "500+ Assets", icon: Play, color: "text-amber-600 bg-amber-50 border-amber-100" }
                      ].map((resource, index) => (
                        <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-slate-100 rounded-2xl bg-white hover:shadow-md transition-all gap-4 group cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center border shadow-sm ${resource.color}`}>
                              <resource.icon className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">{resource.name}</h4>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{resource.type} • {resource.size}</p>
                            </div>
                          </div>
                          <EditorialPill variant="outline" className="hidden sm:flex border-slate-200 text-slate-600 shadow-none hover:bg-slate-50 min-w-max">
                            <Download className="h-3.5 w-3.5 mr-2" /> Retrieve
                          </EditorialPill>
                        </div>
                      ))}
                    </div>
                  </div>
                </EditorialPanel>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* Class Info Box */}
            <EditorialPanel variant="glass" padding="md" className="border border-white shadow-sm sticky top-24">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                 <BookOpen className="w-3 h-3 text-[#8e8268]" />
                 Logistics
               </h4>
               
               <div className="space-y-5">
                  <div className="flex justify-between items-center pb-5 border-b border-white mix-blend-multiply">
                    <span className="text-sm font-bold text-slate-500">Premium Access</span>
                    <span className="font-black text-lg text-slate-900 tracking-tight text-right">
                      UGX {currentClass.priceUGX.toLocaleString()}<span className="text-[10px] font-black tracking-widest text-slate-400 uppercase block leading-none mt-1">per month</span>
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-500">Academic Tier</span>
                    <Badge className="bg-slate-900 text-white border-none rounded-full px-3 text-[10px] uppercase font-bold tracking-widest">{currentClass.level}</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-500">Curriculum</span>
                    <span className="text-sm font-black text-slate-800">{currentClass.isExamYear ? currentClass.examType : 'Foundation Sequence'}</span>
                  </div>
                  
                  {currentClass.isExamYear && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-500">Window</span>
                      <span className="text-sm font-black text-slate-800">2025</span>
                    </div>
                  )}

                  <div className="pt-6 mt-2 border-t border-white mix-blend-multiply space-y-3">
                     <EditorialPill variant="secondary" className="w-full justify-center" onClick={() => OfflineSyncEngine.queueJob('download_course', currentSubject.id)}>
                       <WifiOff className="h-4 w-4 mr-2 text-slate-500" /> Save for Offline
                     </EditorialPill>
                     <EditorialPill variant="outline" className="w-full justify-center bg-white shadow-sm border-white hover:border-slate-200">
                       <TrendingUp className="h-4 w-4 mr-2 text-slate-500" /> Analytics Suite
                     </EditorialPill>
                  </div>
               </div>
            </EditorialPanel>

            {/* Related Sequences */}
            <EditorialPanel variant="glass" padding="md" className="border border-white shadow-sm">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                 <Layers className="w-3 h-3 text-[#8e8268]" />
                 Related Disciplines
               </h4>
               <div className="space-y-4">
                  {currentClass.terms[0]?.subjects
                    .filter(s => s.id !== currentSubject.id)
                    .slice(0, 3)
                    .map((subject) => (
                      <Link
                        key={subject.id}
                        to={`/classes/${classId}/${currentClass.terms[0].id}/${subject.id}`}
                        className="block p-4 border border-white rounded-2xl bg-white/60 hover:bg-white hover:shadow-md transition-all group"
                      >
                        <h5 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-1">{subject.name}</h5>
                        <p className="text-xs text-slate-500 font-light line-clamp-1">{subject.description}</p>
                      </Link>
                    ))}
               </div>
            </EditorialPanel>
          </div>
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

// Add missing icon
const Layers = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 12 12 17 22 12"></polyline>
    <polyline points="2 17 12 22 22 17"></polyline>
  </svg>
);