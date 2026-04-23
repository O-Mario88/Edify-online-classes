import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { EditorialPanel } from '../components/ui/editorial/EditorialPanel';
import { EditorialPill } from '../components/ui/editorial/EditorialPill';
import { EditorialHeader } from '../components/ui/editorial/EditorialHeader';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
  BookOpen, Play, FileText, ChevronRight,
  Video, ClipboardList, CheckCircle2, Lock,
  ArrowLeft, Circle, Sparkles, MoveRight, ArrowDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ResourceViewer } from '../components/academic/ResourceViewer';
import { Resource } from '../types';
import { contentApi, ContentItem } from '../lib/contentApi';
import { getCurriculumTree } from '../lib/curriculumCache';

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

export const TopicDetailPage: React.FC = () => {
  const { classId, termId, subjectId, topicId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState<SubjectData | null>(null);
  const [activeTopic, setActiveTopic] = useState<TopicData | null>(null);
  const [activeResource, setActiveResource] = useState<Resource | null>(null);
  
  // Real backend-driven state
  const [topicPhases, setTopicPhases] = useState<Subtopic[]>([]);
  const [supplementaryContent, setSupplementaryContent] = useState<ContentItem[]>([]);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    setActiveResource(null);
    let cancelled = false;

    // Fetch the core structural metadata (topic name, subject context)
    const fetchStructureAndContent = async () => {
      const findInLevels = (levels: any[]) => {
        for (const level of levels) {
          for (const cls of level.classes) {
            if (cls.id === classId) {
              for (const term of cls.terms) {
                if (term.id === termId) {
                  const subj = term.subjects.find((s: SubjectData) => s.id === subjectId);
                  if (subj) {
                    const tp = subj.topics.find((t: TopicData) => t.id === topicId);
                    if (tp) return { subject: subj, topic: tp };
                  }
                }
              }
            }
          }
        }
        return null;
      };

      try {
        const tree = await getCurriculumTree();
        if (cancelled) return;
        if (tree?.levels) {
          const result = findInLevels(tree.levels);
          if (result) {
            setSubject(result.subject);
            setActiveTopic(result.topic);
          }
        }

        // PHASE 2 REAL ACADEMIC TRUTH: 
        // 1. Fetch real content items from backend
        // 2. Fetch real engagement progress
        if (topicId && classId && subjectId) {
          const [contentResp, progressResp] = await Promise.all([
            contentApi.classroom({
              topic: Number(topicId),
              subject: Number(subjectId),
              class_level: Number(classId),
            }).catch(() => ({ results: [] as ContentItem[] })),
            contentApi.engagement.myProgress().catch(() => ([]))
          ]);

          const completed = new Set<string>();
          progressResp.forEach((prog: any) => {
            if (prog.is_completed || prog.status === 'completed') {
              completed.add(prog.content_item_id);
            }
          });
          if (!cancelled) setCompletedItems(completed);

          const items: ContentItem[] = contentResp.results || [];

          // Build the 4-phase Guided Academic Pathway structure required by Phase 2
          const phases: Subtopic[] = [
            { id: `phase-1-${topicId}`, name: "Introduction & Overview", lessons: [] },
            { id: `phase-2-${topicId}`, name: "Core Concepts", lessons: [] },
            { id: `phase-3-${topicId}`, name: "Worked Examples", lessons: [] },
            { id: `phase-4-${topicId}`, name: "Practice & Application", lessons: [] }
          ];

          const extraContent: ContentItem[] = [];

          items.forEach((item) => {
            const lesson: Lesson = {
              id: item.id,
              title: item.title,
              type: item.content_type,
              duration: item.duration_seconds ? `${Math.round(item.duration_seconds / 60)} MIN` : '15 MIN',
            };

            // Route items into standard phases based on heuristics
            if (['library_resource', 'other'].includes(item.content_type)) {
              extraContent.push(item);
            } else if (['notes', 'pdf', 'document', 'slides', 'textbook'].includes(item.content_type)) {
              if (phases[0].lessons.length < 2) phases[0].lessons.push(lesson);
              else phases[1].lessons.push(lesson);
            } else if (item.content_type === 'video') {
              if (phases[0].lessons.length === 0) phases[0].lessons.push(lesson);
              else phases[2].lessons.push(lesson); // Normally worked examples
            } else if (['exercise', 'worksheet', 'assignment', 'activity', 'project', 'mock_exam'].includes(item.content_type)) {
              phases[3].lessons.push(lesson);
            } else {
              phases[1].lessons.push(lesson);
            }
          });

          // Filter out empty phases to ensure the page doesn't look broken when content is sparse
          if (!cancelled) {
            setTopicPhases(phases.filter(p => p.lessons.length > 0));
            setSupplementaryContent(extraContent);
          }
        }
      } catch (err) {
        console.error('Error loading topic data:', err);
      }
      if (!cancelled) setLoading(false);
    };

    fetchStructureAndContent();

    return () => { cancelled = true; };
  }, [classId, termId, subjectId, topicId]);

  const { flattenedLessons, totalLessons, nextUpId, progressPercent } = useMemo(() => {
    if (topicPhases.length === 0) return { flattenedLessons: [], totalLessons: 0, nextUpId: null, progressPercent: 0 };
    const flat: Lesson[] = [];
    let next: string | null = null;
    
    topicPhases.forEach(sub => {
      sub.lessons.forEach(l => {
        flat.push(l);
        if (!next && !completedItems.has(l.id)) {
          next = l.id;
        }
      });
    });

    const total = flat.length;
    const p = total > 0 ? Math.round((completedItems.size / total) * 100) : 0;
    
    return { flattenedLessons: flat, totalLessons: total, nextUpId: next, progressPercent: p };
  }, [topicPhases, completedItems]);


  const markCompletedAndClose = (resourceId: string) => {
    setCompletedItems(prev => {
        const next = new Set(prev);
        next.add(resourceId);
        return next;
    });
    setActiveResource(null);
  };

  const getActionLabel = (type: string) => {
    if (type === 'video') return "Play Video";
    if (type === 'notes') return "Read Notes";
    if (type === 'exercise') return "Start Practice";
    return "Start";
  };

  const getCompletedActionLabel = (type: string) => {
    if (type === 'video') return "Rewatch";
    if (type === 'notes') return "Review Notes";
    if (type === 'exercise') return "Retry Practice";
    return "Revisit";
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="animate-pulse w-12 h-12 rounded-full bg-slate-200"></div>
      </div>
    );
  }

  if (!subject || !activeTopic) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <EditorialPanel className="text-center py-20 max-w-sm border border-slate-200">
          <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <EditorialHeader level="h3" className="text-slate-800 mb-2">Topic Not Found</EditorialHeader>
          <Link to="/classes"><EditorialPill variant="outline">Return</EditorialPill></Link>
        </EditorialPanel>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans relative pb-24 text-slate-900">
      
      {/* Structural Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          
          <div className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
             <Link to={`/classes/${classId}`} className="hover:text-blue-600 transition-colors flex items-center gap-1">
               <ArrowLeft className="w-3.5 h-3.5" /> {subject.name}
             </Link>
             <span className="mx-2 text-slate-300">/</span>
             <span className="text-slate-800">{activeTopic.name}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
             <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
                  {activeTopic.name}
                </h1>
                <p className="text-slate-600 text-lg font-light flex items-center gap-2">
                   <Sparkles className="w-5 h-5 text-blue-500" /> Goal: Master the foundational concepts and complete the final practice application.
                </p>
             </div>
             
             {/* Progress Box */}
             <div className="shrink-0 bg-slate-50 border border-slate-200 rounded-xl p-4 w-full md:w-72">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-700">Pathway Progress</span>
                  <span className="text-sm font-black text-blue-600">{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-2.5 bg-slate-200 mb-2" />
                <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
                  {completedItems.size} of {totalLessons} items completed
                </p>
             </div>
          </div>
        </div>
      </div>

      {/* Main Pathway Map */}
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 w-full mt-12 pb-20">
        
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-8 md:p-12 pl-6 md:pl-10 relative">
           
           {/* Center Timeline Spine */}
           <div className="absolute top-[80px] bottom-12 left-10 md:left-14 w-0.5 bg-slate-100 z-0 hidden sm:block"></div>

           <div className="space-y-12 relative z-10">
              {topicPhases.length === 0 ? (
                 <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-300">
                    <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold text-slate-700">Content Unavailable</h3>
                    <p className="text-slate-500 mt-2 max-w-sm mx-auto">No academic resources have been uploaded to this topic yet. Check back later or ask your teacher.</p>
                 </div>
              ) : topicPhases.map((subtopic, subIdx) => {
                
                return (
                  <div key={subtopic.id} className="relative">
                    
                    {/* Phase Header */}
                    <div className="flex items-center gap-4 mb-8">
                       <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm z-10 shadow-sm shrink-0">
                         {subIdx + 1}
                       </div>
                       <h2 className="text-2xl font-bold tracking-tight text-slate-900 bg-white pr-4">
                         {subtopic.name}
                       </h2>
                    </div>

                    {/* Lesson nodes */}
                    <div className="pl-4 sm:pl-12 space-y-5">
                       {subtopic.lessons.map((lesson, lessonIdx) => {
                          const isCompleted = completedItems.has(lesson.id);
                          const isNextUp = lesson.id === nextUpId;
                          const isLocked = !isCompleted && !isNextUp;

                          // Custom click handler for exercise/project
                          const handleLessonClick = () => {
                            if (isLocked) return;
                            if (lesson.type === 'exercise') {
                              navigate(`/exercises/${lesson.id}`);
                            } else if (lesson.type === 'project') {
                              navigate(`/projects/${lesson.id}/submit`);
                            } else {
                              setActiveResource({
                                id: lesson.id,
                                title: lesson.title,
                                type: lesson.type === 'video' ? 'video' : lesson.type === 'exercise' ? 'interactive' : 'pdf',
                                visibility: 'private',
                                ownerType: 'platform',
                                authorName: subject.name
                              } as unknown as Resource);
                            }
                          };

                          return (
                            <div 
                              key={lesson.id} 
                              className={`group flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border transition-all relative
                                ${isCompleted ? 'bg-slate-50/50 border-slate-200/50 hover:bg-slate-50' : 
                                  isNextUp ? 'bg-white border-blue-300 shadow-[0_8px_30px_rgb(59,130,246,0.12)] ring-1 ring-blue-100 transform scale-[1.01] z-20' : 
                                  'bg-white border-slate-200 hover:border-slate-300'}`
                              }
                            >
                              {/* Left Marker Connecting Node */}
                              <div className="absolute -left-3 sm:-left-[39px] top-1/2 -translate-y-1/2 flex items-center justify-center bg-white py-2 z-10 hidden sm:flex">
                                 {isCompleted ? (
                                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center ring-4 ring-white">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                    </div>
                                 ) : isNextUp ? (
                                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center ring-4 ring-white shadow-sm relative">
                                       <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-75"></div>
                                       <div className="w-2 h-2 bg-white rounded-full relative z-10" />
                                    </div>
                                 ) : (
                                    <div className="w-3 h-3 rounded-full bg-slate-200 ring-4 ring-white" />
                                 )}
                              </div>

                              <div className="flex gap-4 items-start">
                                {/* Icon Box */}
                                <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center 
                                  ${isCompleted ? 'bg-slate-100 text-slate-400' : 
                                    isNextUp ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}
                                >
                                  {lesson.type === 'video' ? <Video className="w-5 h-5" /> : 
                                   lesson.type === 'notes' ? <BookOpen className="w-5 h-5" /> : 
                                   <ClipboardList className="w-5 h-5" />}
                                </div>

                                {/* Content Details */}
                                <div>
                                  {isNextUp && (
                                    <div className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1 flex items-center gap-1">
                                      <ArrowDown className="w-3 h-3" /> Next Action
                                    </div>
                                  )}
                                  <h3 className={`font-semibold text-lg leading-tight mb-1.5 transition-colors
                                    ${isCompleted ? 'text-slate-800 group-hover:text-slate-900' : 'text-slate-900 group-hover:text-blue-700'}`}>
                                    {lesson.title}
                                  </h3>
                                  <div className="flex items-center gap-2">
                                     <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider rounded-md border-slate-200 border bg-white ${isCompleted?'text-slate-400':'text-slate-500'}`}> 
                                       {lesson.type}
                                     </Badge>
                                     <span className="text-[12px] font-medium text-slate-400">
                                       {lesson.duration || '20 MIN'}
                                     </span>
                                  </div>
                                </div>
                              </div>

                              {/* Action Button */}
                              <div className="shrink-0 mt-3 md:mt-0">
                                <button
                                  onClick={handleLessonClick}
                                  className={`w-full md:w-auto px-6 py-2.5 rounded-full text-sm font-bold shadow-sm transition-all duration-300 flex items-center justify-center gap-2
                                    ${isCompleted ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50' : 
                                      isNextUp ? 'bg-blue-600 border border-blue-600 text-white hover:bg-blue-700 hover:shadow-md' : 
                                      'bg-slate-800 border border-slate-800 text-white hover:bg-slate-700 hover:shadow-md'}`}
                                >
                                  {isCompleted ? getCompletedActionLabel(lesson.type) : getActionLabel(lesson.type)}
                                  {!isCompleted && <MoveRight className="w-4 h-4 ml-1 opacity-70" />}
                                </button>
                              </div>

                            </div>
                          );
                       })}
                    </div>
                  </div>
                );
              })}
           </div>

           {/* Pathway Completion Node */}
           <div className="relative mt-12 flex justify-center pb-4 z-10 w-full sm:-ml-2 block">
              <div className="bg-slate-100 border border-slate-200 px-6 py-3 rounded-full text-slate-500 font-bold tracking-wide text-sm flex items-center gap-2 shadow-sm">
                 {progressPercent === 100 ? (
                    <><CheckCircle2 className="w-5 h-5 text-emerald-500" /> <span className="text-slate-900">Module Fully Completed!</span></>
                 ) : (
                    <><Circle className="w-4 h-4" /> Final Assessment Checkpoint</>
                 )}
              </div>
           </div>
        </div>

        {/* Supplementary Materials Section */}
        {supplementaryContent.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-slate-400" /> Optional Study / Deep Dives
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {supplementaryContent.map(item => (
                <div 
                  key={item.id}
                  onClick={() => item.file_url && window.open(item.file_url, '_blank')}
                  className="group flex gap-4 p-5 rounded-2xl border border-slate-200/60 shadow-sm bg-white hover:border-blue-200 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className={`mt-0.5 ${['video', 'video_lecture', 'recorded_lesson'].includes(item.content_type) ? 'text-rose-500' : 'text-blue-500'}`}>
                    {['video', 'video_lecture', 'recorded_lesson'].includes(item.content_type) 
                      ? <Video className="w-5 h-5 fill-current opacity-20" /> 
                      : <FileText className="w-5 h-5 fill-current opacity-20" />}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                      {item.title}
                    </h5>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {item.content_type.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Embedded Resource Viewer with Completion Dispatcher */}
      {activeResource && (
        <ResourceViewer
          resource={activeResource}
          studentId={user?.id || 'demo-student'}
          onClose={(snapshot) => {
            console.log('Engagement Logged:', snapshot);
            // In a real app we'd dispatch this completion state to the backend
            markCompletedAndClose(activeResource.id);
          }}
        />
      )}

    </div>
  );
};

export default TopicDetailPage;
