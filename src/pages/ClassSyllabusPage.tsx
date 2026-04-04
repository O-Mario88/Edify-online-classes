import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { EditorialPanel } from '../components/ui/editorial/EditorialPanel';
import { EditorialPill } from '../components/ui/editorial/EditorialPill';
import { EditorialHeader } from '../components/ui/editorial/EditorialHeader';
import { Badge } from '../components/ui/badge';
import {
  ArrowRight,
  BookOpen,
  MapPin,
  ChevronDown,
  Activity,
  Beaker,
  Globe,
  PenTool
} from 'lucide-react';
import { UgandaClass, Term, Subject, Topic } from '../types';

export const ClassSyllabusPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<UgandaClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTermIndex, setSelectedTermIndex] = useState(0);

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
      <div className="min-h-screen bg-[#fbfaf8] flex items-center justify-center">
        <div className="animate-pulse w-12 h-12 rounded-full bg-[#f4efe2]"></div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-[#fbfaf8] flex items-center justify-center flex-col gap-4">
        <EditorialPanel className="text-center py-20">
          <EditorialHeader level="h2" className="text-slate-800 mb-4">Class Not Found</EditorialHeader>
          <Link to="/classes"><EditorialPill variant="outline">Browse All Classes</EditorialPill></Link>
        </EditorialPanel>
      </div>
    );
  }

  const currentTerm = classData.terms[selectedTermIndex];

  // Helper to give unique icons/colors based on subject string
  const getSubjectIconStyle = (subjectName: string) => {
    const str = subjectName.toLowerCase();
    if (str.includes('math')) return { icon: Activity, color: 'bg-amber-100 text-amber-700' };
    if (str.includes('bio') || str.includes('chem') || str.includes('phy') || str.includes('sci')) return { icon: Beaker, color: 'bg-rose-100 text-rose-700' };
    if (str.includes('geo') || str.includes('hist')) return { icon: Globe, color: 'bg-emerald-100 text-emerald-700' };
    if (str.includes('eng') || str.includes('art') || str.includes('lit')) return { icon: PenTool, color: 'bg-purple-100 text-purple-700' };
    return { icon: BookOpen, color: 'bg-[#e5dfd3] text-[#8e8268]' };
  };

  return (
    <div className="min-h-screen bg-[#fbfaf8] font-sans pb-24 relative">
      <div className="fixed inset-0 bg-white/40 pointer-events-none" />

      {/* Header Area */}
      <div className="relative z-10 pt-16 pb-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/classes" className="text-slate-500 hover:text-slate-900 flex items-center text-[10px] uppercase font-black tracking-widest mb-10 transition-colors w-fit bg-white px-4 py-2 rounded-full shadow-sm">
            <ArrowRight className="h-3 w-3 mr-2 rotate-180" /> Back to Pathways
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Badge className="bg-slate-900 border-none px-4 py-1.5 text-[9px] uppercase font-black tracking-widest">{classData.level}</Badge>
                {classData.isExamYear && <Badge variant="outline" className="text-amber-700 bg-amber-50 border-none px-4 py-1.5 text-[9px] uppercase font-black tracking-widest">Candidate Year</Badge>}
              </div>
              <EditorialHeader level="h1" className="text-slate-900">
                {classData.name}
              </EditorialHeader>
              <p className="mt-4 text-xl text-slate-500 font-light max-w-2xl leading-relaxed">
                {classData.description}. Structured academic modules covering the official {classData.level === "A'level" ? 'UNEB' : 'NCDC'} syllabus.
              </p>
            </div>
            
            {/* Term Navigator (Requested to maintain) */}
            <div className="flex flex-wrap gap-2 items-center bg-white p-2 rounded-full w-max shadow-sm border border-slate-100">
              {classData.terms.map((term, idx) => (
                 <button
                   key={term.id}
                   onClick={() => setSelectedTermIndex(idx)}
                   className={`px-8 py-3 rounded-full text-xs uppercase font-black tracking-widest transition-all ${
                     selectedTermIndex === idx 
                       ? 'bg-slate-900 text-white shadow-md'
                       : 'text-slate-500 hover:text-slate-800'
                   }`}
                 >
                    {term.name}
                 </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
         
         {/* Academic Structure (Picture 2 / Khan model) */}
         {currentTerm && currentTerm.subjects.length > 0 ? (
           <div className="columns-1 md:columns-2 xl:columns-3 gap-8 space-y-8 pb-12">
             {currentTerm.subjects.map(subject => {
               const { icon: Icon, color } = getSubjectIconStyle(subject.name);
               
               return (
                 <div key={subject.id} className="break-inside-avoid">
                   <EditorialPanel 
                     variant="glass" 
                     padding="none" 
                     className="border border-white bg-white/70 shadow-sm overflow-hidden group hover:shadow-md transition-shadow"
                   >
                     {/* Subject Header Row */}
                     <div className="p-7 border-b border-slate-100 flex justify-between items-center bg-white/50">
                       <div className="flex items-center gap-4">
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner flex-shrink-0 ${color}`}>
                           <Icon className="w-6 h-6" />
                         </div>
                         <h2 className="text-2xl font-bold text-slate-900 leading-tight">{subject.name}</h2>
                       </div>
                       <ChevronDown className="w-5 h-5 text-slate-300 flex-shrink-0" />
                     </div>

                     {/* Topics List */}
                     <div className="p-7">
                       {subject.topics.length === 0 ? (
                         <div className="text-base text-slate-400 font-medium py-2">Modules being compiled...</div>
                       ) : (
                         <ul className="space-y-5">
                           {subject.topics.map((topic, topicIdx) => (
                              <li key={topic.id}>
                                <button
                                  className="w-full text-left group/topic flex items-start gap-3"
                                  onClick={() => navigate(`/classes/${classId}/${currentTerm.id}/${subject.id}/topic/${topic.id}`)}
                                >
                                  <span className="text-sm font-black text-slate-300 mt-0.5 leading-none flex-shrink-0 w-6">{topicIdx + 1}.</span>
                                  <span className="text-base font-semibold text-slate-700 group-hover/topic:text-amber-700 transition-colors leading-snug">
                                    {topic.name}
                                  </span>
                                </button>
                              </li>
                           ))}
                         </ul>
                       )}

                       {/* See All Subject Action */}
                       <div className="mt-8 pt-5 border-t border-slate-100">
                         <button 
                           onClick={() => navigate(`/classes/${classId}/subject/${subject.id}`)}
                           className="text-sm font-bold text-[#8e8268] hover:text-amber-700 flex items-center gap-2 transition-colors"
                         >
                           See all {subject.name} topics <ArrowRight className="w-4 h-4" />
                         </button>
                       </div>
                     </div>
                   </EditorialPanel>
                 </div>
               );
             })}
           </div>
         ) : (
           <EditorialPanel variant="flat" className="text-center py-24 border border-white bg-white/60">
              <MapPin className="mx-auto h-8 w-8 text-slate-300 mb-6" />
              <EditorialHeader level="h4" className="text-slate-800 font-light mb-2">Curriculum Compiling</EditorialHeader>
              <p className="text-slate-500 text-sm">Syllabus structure for this term is being verified.</p>
           </EditorialPanel>
         )}

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

export default ClassSyllabusPage;
