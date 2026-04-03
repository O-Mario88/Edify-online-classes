import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  Calendar,
  Layers,
  Award,
  Video,
  FileText,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  Clock,
  MessageSquare,
  PlayCircle,
  ClipboardList,
  PenTool
} from 'lucide-react';
import { UgandaClass, Term, Subject, Topic, Subtopic, Lesson } from '../types';

export const ClassSyllabusPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<UgandaClass | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedTermIndex, setSelectedTermIndex] = useState(0);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  const [expandedLessons, setExpandedLessons] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const response = await fetch(`/data/courses.json?t=${new Date().getTime()}`);
        const data = await response.json();
        let foundClass = null;
        for (const level of data.levels) {
          foundClass = level.classes.find((c: UgandaClass) => c.id === classId);
          if (foundClass) break;
        }
        if (foundClass) {
          setClassData(foundClass);
          if (foundClass.terms.length > 0 && foundClass.terms[0].subjects.length > 0) {
            setSelectedSubjectId(foundClass.terms[0].subjects[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching class data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClassData();
  }, [classId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Class Not Found</h2>
        <Link to="/classes"><Button variant="outline">Browse All Classes</Button></Link>
      </div>
    );
  }

  const currentTerm = classData.terms[selectedTermIndex];
  const currentSubject = currentTerm?.subjects.find(s => s.id === selectedSubjectId) || currentTerm?.subjects[0];

  const toggleTopic = (topicId: string) => {
    setExpandedTopics(prev => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  const toggleLesson = (lessonId: string) => {
    setExpandedLessons(prev => ({ ...prev, [lessonId]: !prev[lessonId] }));
  };

  const getPedagogicalTags = (topicIndex: number, subtopicIndex: number, lessonIndex: number) => {
    const tags = [];
    const hash = topicIndex * 13 + subtopicIndex * 7 + lessonIndex * 3;
    
    if (classData?.level === "A'level") {
      if (hash % 3 === 0) tags.push({ label: 'Assignment', color: 'bg-blue-100 text-blue-800 border-blue-200' });
      if (hash % 4 === 1) tags.push({ label: 'UNEB Past Paper Review', color: 'bg-orange-100 text-orange-800 border-orange-200' });
      if (hash % 5 === 0) tags.push({ label: 'Practical', color: 'bg-purple-100 text-purple-800 border-purple-200' });
    } else {
      if (hash % 3 === 0) tags.push({ label: 'Assignment', color: 'bg-blue-100 text-blue-800 border-blue-200' });
      if (hash % 5 === 0) tags.push({ label: 'Project Work', color: 'bg-purple-100 text-purple-800 border-purple-200' });
      if (hash % 4 === 1 || lessonIndex === 0) tags.push({ label: 'Activity of Integration', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' });
    }
    
    return tags;
  };

  // Resource types for the expanded lesson panel
  const getResourceItems = () => {
    const items = [
      { icon: FileText, label: 'Lesson Notes', desc: 'Downloadable PDF notes', color: 'text-blue-600 bg-blue-50' },
      { icon: PlayCircle, label: 'Video Lesson', desc: 'Watch recorded explanation', color: 'text-red-600 bg-red-50' },
      { icon: Video, label: 'Recorded Live Session', desc: 'Past live class replay', color: 'text-orange-600 bg-orange-50' },
      { icon: ClipboardList, label: 'Assignment', desc: 'Practice & submit work', color: 'text-indigo-600 bg-indigo-50' },
      { icon: MessageSquare, label: 'Discussion Forum', desc: 'Ask questions on this topic', color: 'text-teal-600 bg-teal-50' },
    ];
    
    if (classData?.level === "A'level") {
      items.push({ icon: Award, label: 'UNEB Marking Guide', desc: 'Past paper assessment', color: 'text-emerald-600 bg-emerald-50' });
      items.push({ icon: PenTool, label: 'Practical Guide', desc: 'Advanced laboratory instructions', color: 'text-purple-600 bg-purple-50' });
    } else {
      items.push({ icon: PenTool, label: 'Project Work', desc: 'Extended project activity', color: 'text-purple-600 bg-purple-50' });
      items.push({ icon: Award, label: 'Activity of Integration', desc: 'Cross-topic assessment', color: 'text-emerald-600 bg-emerald-50' });
    }
    
    return items;
  };

  const resourceItems = getResourceItems();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link to="/classes" className="text-indigo-200 hover:text-white flex items-center text-sm font-medium mb-6 transition-colors w-fit">
            <ArrowRight className="h-4 w-4 mr-2 rotate-180" /> Back to Curriculum Catalog
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white border-none px-3 py-1 text-sm">{classData.level}</Badge>
                {classData.isExamYear && <Badge variant="outline" className="text-indigo-200 border-indigo-400">Exam Window Year</Badge>}
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                {classData.name} Journey
              </h1>
              <p className="mt-4 text-lg text-indigo-100 max-w-2xl leading-relaxed">
                {classData.description}. Choose a term and subject below to explore the official {classData.level === "A'level" ? 'UNEB Advanced' : 'NCDC Lower Secondary'} curriculum flow.
              </p>
            </div>
            <Button size="lg" className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold whitespace-nowrap shadow-lg">
              Enroll Entire Class
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow -mt-10 relative z-10">
        <div className="bg-white rounded-t-2xl shadow-sm border-b overflow-hidden">
           <div className="flex flex-wrap divide-x divide-gray-100">
             {classData.terms.map((term, idx) => (
                <button
                  key={term.id}
                  onClick={() => { setSelectedTermIndex(idx); setSelectedSubjectId(null); }}
                  className={`flex-1 py-4 px-6 text-center focus:outline-none transition-all ${
                    selectedTermIndex === idx 
                      ? 'bg-white text-indigo-700 font-bold border-b-2 border-indigo-600'
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 font-medium'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                     <Calendar className="h-4 w-4" />
                     {term.name}
                  </div>
                </button>
             ))}
           </div>
        </div>

        <div className="flex flex-col lg:flex-row bg-white shadow-sm border border-t-0 rounded-b-2xl overflow-hidden min-h-[600px]">
          <div className="w-full lg:w-80 border-r bg-gray-50/50 flex-shrink-0">
             <div className="p-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
                  Subjects ({currentTerm?.subjects.length || 0})
                </h3>
                <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
                   {currentTerm?.subjects.map(subject => (
                      <button
                        key={subject.id}
                        onClick={() => setSelectedSubjectId(subject.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-colors ${
                          selectedSubjectId === subject.id
                            ? 'bg-indigo-100 border-indigo-200 text-indigo-900 font-semibold shadow-sm'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                         <span className="flex items-center gap-3">
                            <BookOpen className={`h-4 w-4 ${selectedSubjectId === subject.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                            <span className="text-sm">{subject.name}</span>
                         </span>
                         {selectedSubjectId === subject.id && <ChevronRight className="h-4 w-4 text-indigo-400" />}
                      </button>
                   ))}
                </div>
             </div>
          </div>

          <div className="flex-1 p-6 lg:p-10 bg-white overflow-y-auto">
             {currentSubject ? (
                <>
                   <div className="mb-8 border-b pb-6 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
                      <div>
                         <h2 className="text-3xl font-bold text-gray-900">{currentSubject.name}</h2>
                         <p className="text-gray-600 mt-2">{currentSubject.description}</p>
                         <p className="text-sm text-indigo-600 font-medium mt-1">{currentSubject.topics.length} topic(s) this term</p>
                      </div>
                      <Link to={`/classes/${classData.id}/${currentTerm.id}/${currentSubject.id}`}>
                         <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Start Learning</Button>
                      </Link>
                   </div>
                   
                   <div className="space-y-4">
                      {currentSubject.topics.length === 0 ? (
                         <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed">
                            <Layers className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                            <h3 className="text-gray-900 font-medium">No topics deployed</h3>
                            <p className="text-sm text-gray-500">Curriculum team is preparing materials.</p>
                         </div>
                      ) : (
                         currentSubject.topics.map((topic, topicIdx) => {
                            const isExpanded = expandedTopics[topic.id] !== false;
                            return (
                               <div key={topic.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:border-gray-300 transition-colors bg-white">
                                  <button 
                                     onClick={() => toggleTopic(topic.id)}
                                     className="w-full text-left px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between border-b border-gray-100"
                                  >
                                     <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                                           {topicIdx + 1}
                                        </div>
                                        <div>
                                           <h3 className="text-lg font-bold text-gray-900">{topic.name}</h3>
                                           {topic.description && <p className="text-sm text-gray-500 mt-0.5">{topic.description}</p>}
                                        </div>
                                     </div>
                                     <div className="flex items-center gap-2">
                                        <Button
                                          variant="ghost" size="sm"
                                          className="text-indigo-600 hover:bg-indigo-50 text-xs"
                                          onClick={(e) => { e.stopPropagation(); navigate(`/classes/${classData.id}/${currentTerm.id}/${currentSubject.id}/topic/${topic.id}`); }}
                                        >
                                          Open Topic <ArrowRight className="ml-1 h-3 w-3" />
                                        </Button>
                                        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                     </div>
                                  </button>
                                  
                                  {isExpanded && (
                                     <div className="p-2 space-y-2">
                                        {topic.subtopics.map((subtopic, subIdx) => (
                                           <div key={subtopic.id} className="p-4">
                                              <h4 className="text-sm font-bold tracking-wide text-gray-800 uppercase mb-4 flex items-center gap-2">
                                                 <Layers className="h-4 w-4 text-indigo-400" />
                                                 {subtopic.name}
                                              </h4>
                                              
                                              <div className="space-y-3 pl-2 sm:pl-6 border-l-2 border-indigo-100 ml-2">
                                                 {subtopic.lessons.map((lesson, lessonIdx) => {
                                                    const tags = getPedagogicalTags(topicIdx, subIdx, lessonIdx);
                                                    const isLessonExpanded = expandedLessons[lesson.id] || false;
                                                    
                                                    return (
                                                       <div key={lesson.id} className="bg-white border border-gray-100 rounded-lg overflow-hidden hover:border-indigo-300 hover:shadow-md transition-all">
                                                          <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer" onClick={() => toggleLesson(lesson.id)}>
                                                             <div className="flex items-start sm:items-center gap-4 mb-3 sm:mb-0">
                                                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded flex-shrink-0 mt-1 sm:mt-0">
                                                                   {lesson.type === 'video' ? <Video className="h-4 w-4" /> : 
                                                                    lesson.type === 'exercise' ? <FileText className="h-4 w-4" /> : 
                                                                    <BookOpen className="h-4 w-4" />}
                                                                </div>
                                                                <div>
                                                                   <h5 className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">{lesson.title}</h5>
                                                                   <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                                                      <span className="text-xs text-gray-500 flex items-center font-medium">
                                                                         <Clock className="h-3 w-3 mr-1" /> {lesson.duration}
                                                                      </span>
                                                                      {tags.map((tag, i) => (
                                                                         <Badge key={i} className={`${tag.color} border font-medium text-[10px] px-2 py-0 h-5`}>
                                                                            {tag.label === 'Activity of Integration' && <Award className="h-3 w-3 mr-1 inline" />}
                                                                            {tag.label === 'UNEB Past Paper Review' && <Award className="h-3 w-3 mr-1 inline" />}
                                                                            {tag.label === 'Project Work' && <Lightbulb className="h-3 w-3 mr-1 inline" />}
                                                                            {tag.label === 'Practical' && <Lightbulb className="h-3 w-3 mr-1 inline" />}
                                                                            {tag.label}
                                                                         </Badge>
                                                                      ))}
                                                                   </div>
                                                                </div>
                                                             </div>
                                                             
                                                             <Button variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50">
                                                                {isLessonExpanded ? 'Hide' : 'Open'} Resources
                                                                <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isLessonExpanded ? 'rotate-180' : ''}`} />
                                                             </Button>
                                                          </div>

                                                          {/* Expanded Resource Panel */}
                                                          {isLessonExpanded && (
                                                             <div className="border-t bg-gray-50/80 p-4">
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                   {resourceItems.map((res, ri) => (
                                                                      <button key={ri} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all text-left group/res">
                                                                         <div className={`p-2 rounded-lg ${res.color} flex-shrink-0`}>
                                                                            <res.icon className="h-4 w-4" />
                                                                         </div>
                                                                         <div>
                                                                            <p className="text-sm font-semibold text-gray-900 group-hover/res:text-indigo-700">{res.label}</p>
                                                                            <p className="text-xs text-gray-500">{res.desc}</p>
                                                                         </div>
                                                                      </button>
                                                                   ))}
                                                                </div>
                                                             </div>
                                                          )}
                                                       </div>
                                                    );
                                                 })}
                                              </div>
                                           </div>
                                        ))}
                                     </div>
                                  )}
                               </div>
                            );
                         })
                      )}
                   </div>
                </>
             ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12">
                   <BookOpen className="h-16 w-16 text-gray-200 mb-4" />
                   <p>Select a subject on the left to view its syllabus</p>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
