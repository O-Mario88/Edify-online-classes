import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { EditorialPanel } from '../components/ui/editorial/EditorialPanel';
import { EditorialPill } from '../components/ui/editorial/EditorialPill';
import { EditorialHeader } from '../components/ui/editorial/EditorialHeader';
import { Badge } from '../components/ui/badge';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Video,
  FileText,
  ClipboardList,
  FolderOpen,
  ChevronRight
} from 'lucide-react';
import { UgandaClass, Subject, Topic } from '../types';

interface TopicWithMeta extends Topic {
  termId: string;
  termName: string;
  globalIndex: number;
}

export const SubjectTopicsPage: React.FC = () => {
  const { classId, subjectId } = useParams<{ classId: string; subjectId: string }>();
  const navigate = useNavigate();

  const [classData, setClassData] = useState<UgandaClass | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [allTopics, setAllTopics] = useState<TopicWithMeta[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await fetch('http://localhost:8000/api/v1/curriculum/full-tree/');
        const data = await resp.json();

        for (const level of data.levels) {
          for (const cls of level.classes) {
            if (cls.id === classId) {
              setClassData(cls);

              // Collect ALL topics for this subject across all terms in order
              const topics: TopicWithMeta[] = [];
              let globalIndex = 1;
              let foundSubject: Subject | null = null;

              for (const term of cls.terms) {
                const subj = term.subjects.find((s: Subject) => s.id === subjectId);
                if (subj) {
                  if (!foundSubject) foundSubject = subj;
                  for (const topic of subj.topics) {
                    topics.push({ ...topic, termId: term.id, termName: term.name, globalIndex: globalIndex++ });
                  }
                }
              }

              setSubject(foundSubject);
              setAllTopics(topics);
              if (cls.terms && cls.terms.length > 0) {
                setSelectedTermId(cls.terms[0].id);
              }
              return;
            }
          }
        }
      } catch (err) {
        console.error('Error loading subject topics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [classId, subjectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfaf8] flex items-center justify-center">
        <div className="animate-pulse w-12 h-12 rounded-full bg-[#f4efe2]" />
      </div>
    );
  }

  if (!classData || !subject) {
    return (
      <div className="min-h-screen bg-[#fbfaf8] flex items-center justify-center">
        <EditorialPanel className="text-center py-20 border border-white">
          <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <EditorialHeader level="h3" className="text-slate-800 mb-4">Subject Not Found</EditorialHeader>
          <Link to="/classes"><EditorialPill variant="outline">Browse Classes</EditorialPill></Link>
        </EditorialPanel>
      </div>
    );
  }

  // Group topics by term for visual section breaks
  const byTerm = allTopics.reduce<Record<string, TopicWithMeta[]>>((acc, t) => {
    if (!acc[t.termId]) acc[t.termId] = [];
    acc[t.termId].push(t);
    return acc;
  }, {});

  const lessonTypeIcon = (type: string) => {
    if (type === 'video') return <Video className="w-3.5 h-3.5" />;
    if (type === 'notes') return <FileText className="w-3.5 h-3.5" />;
    if (type === 'exercise') return <ClipboardList className="w-3.5 h-3.5" />;
    return <FolderOpen className="w-3.5 h-3.5" />;
  };

  return (
    <div className="min-h-screen bg-[#fbfaf8] font-sans pb-24 relative">
      <div className="fixed inset-0 bg-white/40 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 pt-16 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to={`/classes/${classId}`}
            className="inline-flex items-center gap-2 text-xs uppercase font-black tracking-widest text-slate-400 hover:text-slate-800 transition-colors mb-10 bg-white px-4 py-2 rounded-full shadow-sm w-fit"
          >
            <ArrowLeft className="h-3 w-3" /> Back to {classData.name}
          </Link>

          <div className="flex flex-col gap-4 mb-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className="bg-slate-900 border-none px-4 py-1.5 text-[9px] uppercase font-black tracking-widest">
                {classData.level}
              </Badge>
              <Badge variant="outline" className="border-slate-200 text-slate-500 px-4 py-1.5 text-[9px] uppercase font-black tracking-widest bg-white">
                {classData.name}
              </Badge>
              <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50 px-4 py-1.5 text-[9px] uppercase font-black tracking-widest">
                {allTopics.length} Topics Total
              </Badge>
            </div>

            <EditorialHeader level="h1" className="text-slate-900">
              {subject.name}
            </EditorialHeader>
            <p className="text-xl text-slate-500 font-light leading-relaxed max-w-2xl">
              Complete topic sequence from introduction to final module — switch between terms to view specific topics.
            </p>

            {/* Term Navigator */}
            <div className="flex flex-nowrap gap-2 items-center mt-4 overflow-x-auto hide-scrollbar">
              {classData.terms.map((term) => (
                 <button
                   key={term.id}
                   onClick={() => setSelectedTermId(term.id)}
                   className={`px-5 py-2.5 rounded-full text-xs uppercase font-black tracking-widest transition-all whitespace-nowrap ${
                     selectedTermId === term.id 
                       ? 'bg-blue-600 text-white shadow-md'
                       : 'bg-white text-slate-500 hover:text-blue-600 border border-slate-200'
                   }`}
                 >
                    {term.name}
                 </button>
              ))}
            </div>
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
      {/* Topic Sequence */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="space-y-4">
          {!selectedTermId ? null : (byTerm[selectedTermId as string] || []).length === 0 ? (
            <div className="text-center py-20 bg-white/50 rounded-3xl border border-white">
              <FolderOpen className="h-10 w-10 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No topics available for this term yet.</p>
            </div>
          ) : (
            (byTerm[selectedTermId as string] || []).map((topic) => {
              const totalLessons = topic.subtopics.reduce((a, st) => a + st.lessons.length, 0);
              const lessonTypes = [...new Set(topic.subtopics.flatMap(st => st.lessons.map(l => l.type)))];

              return (
                <button
                  key={topic.id}
                  onClick={() => navigate(`/classes/${classId}/${selectedTermId}/${subjectId}/topic/${topic.id}`)}
                  className="w-full text-left group"
                >
                  <EditorialPanel
                    variant="elevated"
                    padding="none"
                    className="border border-slate-100 bg-white hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    <div className="flex items-center gap-6 p-6 sm:p-8">
                      {/* Number */}
                      <div className="w-14 h-14 rounded-2xl bg-[#f4efe2] flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors duration-300">
                        <span className="text-xl font-black text-[#8e8268] group-hover:text-white transition-colors duration-300 leading-none">
                          {topic.globalIndex}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-slate-900 leading-snug mb-2 inline-block flex-shrink-0">
                          <span className="bg-gradient-to-r from-slate-900 to-slate-900 bg-[length:0%_2px] bg-no-repeat bg-left-bottom group-hover:bg-[length:100%_2px] transition-all duration-300 ease-out pb-0.5">
                            {topic.name}
                          </span>
                        </h3>
                        {topic.description && (
                          <p className="text-base text-slate-500 font-light leading-relaxed line-clamp-1 mb-3">
                            {topic.description}
                          </p>
                        )}

                        {/* Lesson type chips */}
                        <div className="flex items-center gap-3 flex-wrap">
                          {lessonTypes.map(type => (
                            <span
                              key={type}
                              className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                                type === 'video'    ? 'bg-rose-50 text-rose-600' :
                                type === 'notes'    ? 'bg-blue-50 text-blue-600' :
                                type === 'exercise' ? 'bg-[#f4efe2] text-[#8e8268]' :
                                type === 'project'  ? 'bg-emerald-50 text-emerald-600' :
                                'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {lessonTypeIcon(type)} {type}
                            </span>
                          ))}
                          <span className="text-xs font-semibold text-slate-400">
                            {totalLessons} resources
                          </span>
                        </div>
                      </div>

                      <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </EditorialPanel>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectTopicsPage;
