import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  BookOpen, Play, FileText, ChevronRight, ChevronDown, ChevronUp,
  Video, Download, UploadCloud, ClipboardList, MessageSquare,
  Lightbulb, GraduationCap, MapPin, CheckCircle, Clock,
  FolderOpen, Presentation, FileSpreadsheet, PlayCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DiscussionThread } from '../components/academic/DiscussionThread';
import { ResourceUploadModal } from '../components/academic/ResourceUploadModal';
import { AssignmentCreateModal } from '../components/academic/AssignmentCreateModal';
import { ProjectActivityPanel } from '../components/academic/ProjectActivityPanel';

interface Lesson {
  id: string;
  title: string;
  type: string;
  duration?: string;
  completed?: boolean;
}
interface Subtopic {
  id: string;
  name: string;
  lessons: Lesson[];
}
interface TopicData {
  id: string;
  name: string;
  description: string;
  subtopics: Subtopic[];
}
interface SubjectData {
  id: string;
  name: string;
  description: string;
  topics: TopicData[];
}

const RESOURCE_TYPE_CONFIG: Record<string, { icon: any; color: string }> = {
  video: { icon: Video, color: 'text-red-600 bg-red-50' },
  notes: { icon: FileText, color: 'text-blue-600 bg-blue-50' },
  pdf: { icon: FileText, color: 'text-orange-600 bg-orange-50' },
  slides: { icon: Presentation, color: 'text-purple-600 bg-purple-50' },
  worksheet: { icon: FileSpreadsheet, color: 'text-green-600 bg-green-50' },
  recording: { icon: PlayCircle, color: 'text-indigo-600 bg-indigo-50' },
  reading: { icon: BookOpen, color: 'text-teal-600 bg-teal-50' },
  revision: { icon: FolderOpen, color: 'text-amber-600 bg-amber-50' },
};

const MOCK_TOPIC_RESOURCES = [
  { id: 'res-1', title: 'Comprehensive Topic Summary Notes', type: 'notes', author: 'Mr. Ssebunya', downloads: 234, size: '2.4 MB' },
  { id: 'res-2', title: 'UNEB Past Paper Questions (2019-2025)', type: 'pdf', author: 'Edify Admin', downloads: 890, size: '8.1 MB' },
  { id: 'res-3', title: 'Recorded Revision Session', type: 'recording', author: 'Ms. Namuli', downloads: 156, size: '45 min' },
  { id: 'res-4', title: 'Practice Worksheet Pack', type: 'worksheet', author: 'Mr. Ssebunya', downloads: 412, size: '1.2 MB' },
  { id: 'res-5', title: 'Visual Slides Presentation', type: 'slides', author: 'Ms. Namuli', downloads: 178, size: '5.3 MB' },
];

const MOCK_ASSIGNMENTS = [
  { id: 'asgn-1', title: 'End of Topic Test', type: 'quiz', maxScore: 30, dueDate: '2026-04-20', status: 'active', submissions: 28, totalStudents: 42 },
  { id: 'asgn-2', title: 'Practice Worksheet: Set A', type: 'worksheet', maxScore: 20, dueDate: '2026-04-15', status: 'completed', submissions: 42, totalStudents: 42 },
  { id: 'asgn-3', title: 'Remedial Intervention Pack', type: 'intervention', maxScore: 15, dueDate: '2026-04-25', status: 'active', submissions: 8, totalStudents: 14, targeting: 'at-risk' },
];

export const TopicDetailPage: React.FC = () => {
  const { classId, termId, subjectId, topicId } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState<SubjectData | null>(null);
  const [topic, setTopic] = useState<TopicData | null>(null);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const isTeacher = user?.role?.includes('teacher') || user?.role === 'platform_admin' || user?.role === 'institution_admin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await fetch('/data/courses.json');
        const data = await resp.json();
        for (const level of data.levels) {
          for (const cls of level.classes) {
            if (cls.id === classId) {
              setClassName(cls.name);
              for (const term of cls.terms) {
                if (term.id === termId) {
                  const subj = term.subjects.find((s: SubjectData) => s.id === subjectId);
                  if (subj) {
                    setSubject(subj);
                    const tp = subj.topics.find((t: TopicData) => t.id === topicId);
                    if (tp) setTopic(tp);
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Error loading topic data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [classId, termId, subjectId, topicId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading topic...</p>
        </div>
      </div>
    );
  }

  if (!subject || !topic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Topic not found</h3>
          <Link to="/classes"><Button>Back to Classes</Button></Link>
        </div>
      </div>
    );
  }

  const allLessons = topic.subtopics.flatMap(st => st.lessons);
  const completedLessons = allLessons.filter(l => l.completed).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
            <Link to="/classes" className="hover:text-indigo-600">Classes</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to={`/classes/${classId}`} className="hover:text-indigo-600">{className}</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="hover:text-indigo-600">{subject.name}</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-gray-900 font-semibold">{topic.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-10 w-40 h-40 bg-indigo-900/30 rounded-full blur-2xl -mb-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-indigo-300" />
            <span className="text-indigo-200 text-sm font-medium">NCDC Curriculum</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{topic.name}</h1>
          <p className="text-indigo-200 text-lg max-w-2xl">
            {className} → {subject.name} — Complete learning container with all resources, assignments, and discussions
          </p>

          {/* Stats chips */}
          <div className="flex flex-wrap gap-3 mt-5">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-200" />
              <span className="text-white text-sm font-medium">{allLessons.length} Lessons</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-indigo-200" />
              <span className="text-white text-sm font-medium">{MOCK_TOPIC_RESOURCES.length} Resources</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-indigo-200" />
              <span className="text-white text-sm font-medium">{MOCK_ASSIGNMENTS.length} Assignments</span>
            </div>
            {completedLessons > 0 && (
              <div className="bg-green-500/20 border border-green-400/30 rounded-lg px-3 py-1.5 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-300" />
                <span className="text-green-100 text-sm font-medium">{completedLessons}/{allLessons.length} complete</span>
              </div>
            )}
          </div>

          {/* Teacher actions */}
          {isTeacher && (
            <div className="flex gap-2 mt-5">
              <Button size="sm" onClick={() => setShowUploadModal(true)} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm">
                <UploadCloud className="h-4 w-4 mr-2" /> Upload Resource
              </Button>
              <Button size="sm" onClick={() => setShowAssignmentModal(true)} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm">
                <ClipboardList className="h-4 w-4 mr-2" /> Create Assignment
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="lessons" className="space-y-5">
          <TabsList className="bg-white border shadow-sm p-1 rounded-xl">
            <TabsTrigger value="lessons" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-4">
              <BookOpen className="h-4 w-4 mr-2" /> Lessons
            </TabsTrigger>
            <TabsTrigger value="resources" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-4">
              <FolderOpen className="h-4 w-4 mr-2" /> Resources
            </TabsTrigger>
            <TabsTrigger value="assignments" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-4">
              <ClipboardList className="h-4 w-4 mr-2" /> Assignments
            </TabsTrigger>
            <TabsTrigger value="discussion" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-4">
              <MessageSquare className="h-4 w-4 mr-2" /> Discussion
            </TabsTrigger>
            <TabsTrigger value="projects" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-4">
              <Lightbulb className="h-4 w-4 mr-2" /> Projects
            </TabsTrigger>
          </TabsList>

          {/* ===== LESSONS TAB ===== */}
          <TabsContent value="lessons">
            <div className="space-y-3">
              {topic.subtopics.map((subtopic) => (
                <div key={subtopic.id}>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">{subtopic.name}</h3>
                  <div className="space-y-2">
                    {subtopic.lessons.map(lesson => (
                      <Card key={lesson.id} className="border-gray-200 overflow-hidden hover:border-gray-300 transition-all">
                        <div
                          className="p-4 cursor-pointer flex items-center justify-between"
                          onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${lesson.type === 'video' ? 'bg-red-50' : lesson.type === 'notes' ? 'bg-blue-50' : 'bg-purple-50'}`}>
                              {lesson.type === 'video' && <Play className="h-4 w-4 text-red-600" />}
                              {lesson.type === 'notes' && <FileText className="h-4 w-4 text-blue-600" />}
                              {lesson.type === 'exercise' && <BookOpen className="h-4 w-4 text-purple-600" />}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{lesson.title}</p>
                              {lesson.duration && <p className="text-xs text-gray-500 mt-0.5">Duration: {lesson.duration}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {lesson.completed ? (
                              <Badge className="bg-green-100 text-green-700 border-none text-xs"><CheckCircle className="h-3 w-3 mr-1" /> Done</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs text-gray-500">Pending</Badge>
                            )}
                            {expandedLesson === lesson.id ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                          </div>
                        </div>

                        {/* Expanded Lesson Container */}
                        {expandedLesson === lesson.id && (
                          <div className="border-t bg-gradient-to-b from-gray-50 to-white px-4 pb-4">
                            <Tabs defaultValue="lesson-resources" className="mt-3">
                              <TabsList className="bg-gray-100 p-0.5 rounded-lg h-8">
                                <TabsTrigger value="lesson-resources" className="text-xs data-[state=active]:bg-white rounded-md px-3 h-7">Resources</TabsTrigger>
                                <TabsTrigger value="lesson-assignment" className="text-xs data-[state=active]:bg-white rounded-md px-3 h-7">Assignment</TabsTrigger>
                                <TabsTrigger value="lesson-discussion" className="text-xs data-[state=active]:bg-white rounded-md px-3 h-7">Discussion</TabsTrigger>
                                <TabsTrigger value="lesson-activity" className="text-xs data-[state=active]:bg-white rounded-md px-3 h-7">Activity</TabsTrigger>
                              </TabsList>
                              <TabsContent value="lesson-resources" className="mt-3">
                                <div className="flex flex-wrap gap-2">
                                  <Button variant="outline" size="sm" className="text-xs h-8">
                                    <Play className="h-3 w-3 mr-1.5 text-red-500" /> Watch Video
                                  </Button>
                                  <Button variant="outline" size="sm" className="text-xs h-8">
                                    <FileText className="h-3 w-3 mr-1.5 text-blue-500" /> Read Notes
                                  </Button>
                                  <Button variant="outline" size="sm" className="text-xs h-8">
                                    <Download className="h-3 w-3 mr-1.5 text-gray-500" /> Download PDF
                                  </Button>
                                  {isTeacher && (
                                    <Button variant="outline" size="sm" className="text-xs h-8 border-dashed" onClick={() => setShowUploadModal(true)}>
                                      <UploadCloud className="h-3 w-3 mr-1.5" /> Add Resource
                                    </Button>
                                  )}
                                </div>
                              </TabsContent>
                              <TabsContent value="lesson-assignment" className="mt-3">
                                <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3 border border-dashed">
                                  <ClipboardList className="h-4 w-4 text-gray-400 mb-1" />
                                  <p>No assignment yet for this lesson.</p>
                                  {isTeacher && (
                                    <Button size="sm" variant="outline" className="mt-2 text-xs" onClick={() => setShowAssignmentModal(true)}>
                                      <ClipboardList className="h-3 w-3 mr-1" /> Create
                                    </Button>
                                  )}
                                </div>
                              </TabsContent>
                              <TabsContent value="lesson-discussion" className="mt-3">
                                <DiscussionThread contextType="lesson" contextId={lesson.id} contextName={lesson.title} />
                              </TabsContent>
                              <TabsContent value="lesson-activity" className="mt-3">
                                <ProjectActivityPanel contextType="lesson" contextId={lesson.id} contextName={lesson.title} />
                              </TabsContent>
                            </Tabs>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ===== RESOURCES TAB (Topic-Level) ===== */}
          <TabsContent value="resources">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Broader support materials for this topic</p>
                {isTeacher && (
                  <Button size="sm" onClick={() => setShowUploadModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <UploadCloud className="h-4 w-4 mr-2" /> Upload Resource
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MOCK_TOPIC_RESOURCES.map(res => {
                  const cfg = RESOURCE_TYPE_CONFIG[res.type] || RESOURCE_TYPE_CONFIG.notes;
                  const Icon = cfg.icon;
                  return (
                    <Card key={res.id} className="hover:shadow-md transition-all cursor-pointer overflow-hidden group">
                      <div className={`h-1 w-full ${cfg.color.split(' ')[1]?.replace('bg-', 'bg-') || 'bg-gray-200'}`} />
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${cfg.color} flex-shrink-0`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 group-hover:text-indigo-700 transition-colors">{res.title}</h4>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                              <span>{res.author}</span>
                              <span className="flex items-center gap-0.5"><Download className="h-3 w-3" /> {res.downloads}</span>
                              <span>{res.size}</span>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="flex-shrink-0 text-xs h-8">
                            <Download className="h-3 w-3 mr-1" /> Get
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* ===== ASSIGNMENTS TAB ===== */}
          <TabsContent value="assignments">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Assignments and assessments for this topic</p>
                {isTeacher && (
                  <Button size="sm" onClick={() => setShowAssignmentModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <ClipboardList className="h-4 w-4 mr-2" /> Create Assignment
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                {MOCK_ASSIGNMENTS.map(asgn => (
                  <Card key={asgn.id} className="hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{asgn.title}</h4>
                            <Badge variant="outline" className="text-[10px]">{asgn.type}</Badge>
                            {asgn.targeting && (
                              <Badge className="bg-red-100 text-red-700 border-none text-[10px]">At-Risk Only</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Due: {asgn.dueDate}</span>
                            <span>Max: {asgn.maxScore} marks</span>
                            <span>{asgn.submissions}/{asgn.totalStudents} submitted</span>
                          </div>
                        </div>
                        <Badge className={`${
                          asgn.status === 'active'
                            ? 'bg-blue-100 text-blue-700 border-none'
                            : 'bg-green-100 text-green-700 border-none'
                        } text-xs`}>
                          {asgn.status === 'active' ? 'Active' : 'Completed'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ===== DISCUSSION TAB (Topic-Level) ===== */}
          <TabsContent value="discussion">
            <DiscussionThread contextType="topic" contextId={topic.id} contextName={topic.name} />
          </TabsContent>

          {/* ===== PROJECTS TAB ===== */}
          <TabsContent value="projects">
            <ProjectActivityPanel contextType="topic" contextId={topic.id} contextName={topic.name} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <ResourceUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        defaultSubject={subject.name}
        defaultClass={className}
        defaultTopic={topic.name}
      />
      <AssignmentCreateModal
        isOpen={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        contextType="topic"
        contextName={topic.name}
        subjectName={subject.name}
        className={className}
      />
    </div>
  );
};

export default TopicDetailPage;
