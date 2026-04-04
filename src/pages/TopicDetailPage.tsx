import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { EditorialPanel } from '../components/ui/editorial/EditorialPanel';
import { EditorialPill } from '../components/ui/editorial/EditorialPill';
import { EditorialHeader } from '../components/ui/editorial/EditorialHeader';
import { Badge } from '../components/ui/badge';
import {
  BookOpen, Play, FileText, ChevronRight,
  Video, ClipboardList, CheckCircle, Lock,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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

// Add Mock assignment to augment practice sections
const MOCK_ASSIGNMENTS = [
  { id: 'asgn-1', title: 'End of Section Assessment', type: 'quiz' },
  { id: 'asgn-2', title: 'Conceptual Recap', type: 'worksheet' }
];

export const TopicDetailPage: React.FC = () => {
  const { classId, termId, subjectId, topicId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState<SubjectData | null>(null);
  const [activeTopic, setActiveTopic] = useState<TopicData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await fetch(`/data/courses.json?t=${new Date().getTime()}`);
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
                    if (tp) setActiveTopic(tp);
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
      <div className="min-h-screen bg-[#fbfaf8] flex items-center justify-center">
        <div className="animate-pulse w-12 h-12 rounded-full bg-[#f4efe2]"></div>
      </div>
    );
  }

  if (!subject || !activeTopic) {
    return (
      <div className="min-h-screen bg-[#fbfaf8] flex items-center justify-center">
        <EditorialPanel className="text-center py-20 max-w-sm border border-white">
          <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <EditorialHeader level="h3" className="text-slate-800 mb-2">Space Not Found</EditorialHeader>
          <Link to="/classes"><EditorialPill variant="outline">Return</EditorialPill></Link>
        </EditorialPanel>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] font-sans relative pb-24">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{zIndex: 0}}>
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-amber-200/20 blur-[120px]" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full bg-rose-200/15 blur-[100px]" />
        <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] rounded-full bg-sky-200/15 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full bg-violet-100/15 blur-[90px] -translate-x-1/2" />
      </div>

      {/* Top Breadcrumb Context */}
      <div className="relative z-10 pt-8 pb-6 border-b border-white mix-blend-multiply flex flex-col items-center">
        <Link 
          to={`/classes/${classId}`} 
          className="text-xs uppercase font-black tracking-widest text-slate-400 hover:text-slate-800 transition-colors flex items-center mb-2"
        >
          <ArrowLeft className="w-3 h-3 mr-1" /> Back to Subject
        </Link>
        <EditorialHeader level="h3" className="text-slate-900 tracking-tight text-center">
          {subject.name}
        </EditorialHeader>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full mt-10 relative z-10 flex flex-col md:flex-row gap-8 lg:gap-16">
        
        {/* Left Sidebar (Picture 3 Structure: Unit List) */}
        <div className="w-full md:w-64 lg:w-80 flex-shrink-0">
          <div className="sticky top-24">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#8e8268] mb-6 pl-2">
              Sequence Overview
            </h4>
            
            <div className="space-y-1">
              {subject.topics.map((topic, index) => {
                const isActive = topic.id === activeTopic.id;
                return (
                  <button
                    key={topic.id}
                    onClick={() => navigate(`/classes/${classId}/${termId}/${subjectId}/topic/${topic.id}`)}
                    className={`w-full text-left px-5 py-4 rounded-2xl flex items-center transition-all ${
                      isActive 
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <span className="text-sm font-bold opacity-40 mr-2">{index + 1}.</span>
                      <span className="text-base font-semibold leading-snug">{topic.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Main Content (Picture 3 Structure: Learn & Practice) */}
        <div className="flex-1 max-w-4xl">
          
          <div className="mb-14">
            <EditorialHeader level="h1" className="text-slate-900 mb-5 tracking-[-0.03em]">
              {activeTopic.name}
            </EditorialHeader>
            <p className="text-xl text-slate-600 font-light leading-relaxed max-w-2xl">
              {activeTopic.description || 'Master the fundamental concepts through curated lessons and structured practice sets.'}
            </p>
          </div>

          <div className="space-y-12">
            {activeTopic.subtopics.map((subtopic) => {
              
              // Split logic for Learn vs Practice elements
              const learnItems = subtopic.lessons.filter(l => l.type === 'video' || l.type === 'notes');
              const practiceItems = subtopic.lessons.filter(l => l.type === 'exercise');
              
              // Emulate more practice density by throwing in MOCK_ASSIGNMENTS if exercises are scarce
              const augmentedPractice = practiceItems.length > 0 
                ? practiceItems 
                : MOCK_ASSIGNMENTS.map(a => ({ ...a, type: a.type === 'quiz' ? 'exercise' : 'worksheet', duration: '20 Min' }));

              return (
                <div key={subtopic.id}>
                  <h2 className="text-2xl font-bold text-slate-900 mb-8 pb-4 border-b-2 border-slate-900/10 inline-block">
                    {subtopic.name}
                  </h2>
                  
                  {/* Two-Column Learn vs Practice Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 pl-0 md:pl-4">
                    
                    {/* Learn Column */}
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 pl-2 mb-5 flex items-center gap-2">
                        <Play className="w-3.5 h-3.5" /> Learn
                      </h3>
                      <div className="space-y-1 relative before:absolute before:inset-y-2 before:left-[-1px] before:w-px before:bg-slate-200 pl-4 border-l border-transparent">
                        {learnItems.length === 0 && <p className="text-xs text-slate-400 py-2">No learning materials added yet.</p>}
                        
                        {learnItems.map(item => (
                          <div 
                            key={item.id} 
                            className="group flex gap-4 p-3 rounded-2xl hover:bg-white transition-colors cursor-pointer relative"
                          >
                            <div className="absolute top-[22px] -left-[20px] w-2 h-2 rounded-full bg-slate-300 border-2 border-[#fbfaf8] group-hover:bg-amber-400 group-hover:border-white transition-colors" />
                            
                            <div className={`mt-0.5 ${item.type === 'video' ? 'text-rose-500' : 'text-blue-500'}`}>
                              {item.type === 'video' ? <Video className="w-5 h-5 fill-current opacity-20" /> : <BookOpen className="w-5 h-5 fill-current opacity-20" />}
                            </div>
                            <div>
                               <h5 className="font-semibold text-slate-800 text-base group-hover:text-amber-700 transition-colors leading-snug">
                                 {item.title}
                               </h5>
                               <div className="flex items-center gap-3 mt-1.5 opacity-50">
                                  {item.type === 'video' ? <Video className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                                  <span className="text-[10px] font-black uppercase tracking-widest">
                                    {item.type} {item.duration && `• ${item.duration}`}
                                  </span>
                               </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Practice Column */}
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-[#8e8268] pl-2 mb-5 flex items-center gap-2">
                        <ClipboardList className="w-3.5 h-3.5" /> Practice
                      </h3>
                      <div className="space-y-4">
                        {augmentedPractice.map((prac) => (
                           <EditorialPanel 
                             key={prac.id} 
                             variant="elevated" 
                             padding="md" 
                             radius="large"
                             className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white bg-white/70 hover:bg-white cursor-pointer group"
                           >
                              <div>
                                <h5 className="font-semibold text-slate-800 text-base group-hover:text-amber-700 transition-colors leading-snug mb-1">
                                  {prac.title}
                                </h5>
                                <div className="text-xs font-black uppercase tracking-widest text-slate-400">
                                  {prac.duration || 'Assessment'}
                                </div>
                              </div>
                              <EditorialPill variant="secondary" className="border-none bg-slate-50 text-slate-600 px-4 group-hover:bg-amber-50 group-hover:text-amber-700 w-full sm:w-auto justify-center">
                                Start
                              </EditorialPill>
                           </EditorialPanel>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};

export default TopicDetailPage;
