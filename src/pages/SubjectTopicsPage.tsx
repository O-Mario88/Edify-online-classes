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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await fetch(`/data/courses.json?t=${new Date().getTime()}`);
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
    <div className="min-h-screen bg-[#faf9f7] font-sans pb-24 relative">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{zIndex: 0}}>
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-amber-200/20 blur-[120px]" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full bg-rose-200/15 blur-[100px]" />
        <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] rounded-full bg-sky-200/15 blur-[120px]" />
        <div className="absolute top-2/3 left-1/2 w-[400px] h-[400px] rounded-full bg-violet-100/15 blur-[90px] -translate-x-1/2" />
      </div>

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
              Complete topic sequence from introduction to final module — all three terms in one place.
            </p>
          </div>
        </div>
      </div>

      {/* Topic Sequence */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="space-y-16">
          {Object.entries(byTerm).map(([termId, topics]) => (
            <div key={termId}>
              {/* Term Section Divider */}
              <div className="flex items-center gap-4 mb-8">
                <span className="text-xs font-black uppercase tracking-widest text-[#8e8268] bg-[#f4efe2] px-4 py-2 rounded-full">
                  {topics[0].termName}
                </span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Topics in this term */}
              <div className="space-y-4">
                {topics.map((topic) => {
                  const totalLessons = topic.subtopics.reduce((a, st) => a + st.lessons.length, 0);
                  const lessonTypes = [...new Set(topic.subtopics.flatMap(st => st.lessons.map(l => l.type)))];

                  return (
                    <button
                      key={topic.id}
                      onClick={() => navigate(`/classes/${classId}/${termId}/${subjectId}/topic/${topic.id}`)}
                      className="w-full text-left group"
                    >
                      <EditorialPanel
                        variant="elevated"
                        padding="none"
                        className="border border-slate-100 bg-white hover:shadow-lg transition-all duration-300 overflow-hidden"
                      >
                        <div className="flex items-center gap-6 p-6 sm:p-8">
                          {/* Number */}
                          <div className="w-14 h-14 rounded-2xl bg-[#f4efe2] flex items-center justify-center flex-shrink-0 group-hover:bg-slate-900 transition-colors duration-300">
                            <span className="text-xl font-black text-[#8e8268] group-hover:text-white transition-colors duration-300 leading-none">
                              {topic.globalIndex}
                            </span>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-amber-700 transition-colors leading-snug mb-2">
                              {topic.name}
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

                          {/* Arrow */}
                          <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                        </div>
                      </EditorialPanel>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubjectTopicsPage;
