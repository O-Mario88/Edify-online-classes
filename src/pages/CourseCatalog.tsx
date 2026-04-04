import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EditorialHeader } from '../components/ui/editorial/EditorialHeader';
import { 
  Users,
  Clock,
  BookOpen,
  Star,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { UgandaLevel, UgandaClass, Teacher } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const CourseCatalog: React.FC = () => {
  const [levels, setLevels] = useState<UgandaLevel[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const { countryCode } = useAuth();

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
      const levelMatch = 
        selectedCategory === 'all' || 
        ugandaClass.level.toLowerCase().includes(selectedCategory.toLowerCase());
      
      const typeMatch = 
        (selectedCategory === 'sciences' && ugandaClass.description.toLowerCase().includes('science')) ||
        (selectedCategory === 'arts' && ugandaClass.description.toLowerCase().includes('arts'));

      if (['sciences', 'arts'].includes(selectedCategory)) return typeMatch;
      return levelMatch;
    });
  };

  const categories = ['ALL', "O'LEVEL", "A'LEVEL", 'SCIENCES', 'ARTS'];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfaf8] flex items-center justify-center">
        <div className="animate-pulse w-12 h-12 rounded-full bg-[#f4efe2]"></div>
      </div>
    );
  }

  // Soft pastel colors based on ID
  const getBackgroundColor = (id: string, index: number) => {
    const colors = [
      'bg-rose-50',
      'bg-amber-50',
      'bg-blue-50',
      'bg-emerald-50',
      'bg-purple-50',
      'bg-slate-50'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-[#fbfaf8] font-sans pt-12 pb-24 relative">
      <div className="fixed inset-0 bg-white/40 pointer-events-none" />

      {/* 1. Top Filter Row (Picture 1) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-12">
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 shadow-sm flex-shrink-0 transition-colors">
             <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="flex-1 overflow-x-auto hide-scrollbar flex gap-4 py-2 px-1">
             {categories.map((category) => {
               const active = selectedCategory.toLowerCase() === category.toLowerCase();
               return (
                 <button
                   key={category}
                   onClick={() => setSelectedCategory(category.toLowerCase())}
                   className={`whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 border ${
                     active 
                       ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                       : 'bg-white text-slate-400 border-white shadow-sm hover:text-slate-600'
                   }`}
                 >
                   {category}
                 </button>
               )
             })}
          </div>

          <button className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 shadow-sm flex-shrink-0 transition-colors">
             <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 2. Class Cards Grid (Picture 1 Layout, Picture 4 Theme) */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {getFilteredClasses().map((ugandaClass, index) => {
             const firstSubject = ugandaClass.terms[0]?.subjects[0];
             const teacher = teachers.find(t => t.id === firstSubject?.teacherId);
             
             const totalModules = ugandaClass.terms.reduce((acc, term) => 
               acc + term.subjects.reduce((sAcc, sub) => sAcc + sub.topics.length, 0), 0
             );

             return (
               <div key={ugandaClass.id} className="group bg-white rounded-[2rem] overflow-hidden border border-white shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
                 
                 {/* Top Pastel Block */}
                 <div className={`h-40 relative ${getBackgroundColor(ugandaClass.id, index)} p-5 flex flex-col justify-between overflow-hidden transition-colors`}>
                    <div className="flex justify-between items-start z-10 relative">
                       <span className="bg-white text-slate-800 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                         {ugandaClass.level}
                       </span>
                    </div>
                 </div>

                 <div className="p-6 flex flex-col flex-grow relative bg-white">
                    
                    {/* Teacher / Meta Row */}
                    <div className="flex items-center gap-3 mb-5 mt-[-36px] z-20">
                      <div className="w-10 h-10 rounded-[0.8rem] bg-white p-1 shadow-sm border border-slate-100">
                         <div className="w-full h-full bg-[#f4efe2] rounded-[0.6rem] flex items-center justify-center overflow-hidden">
                           {teacher ? (
                             <img src={teacher.avatar} alt="teacher" className="w-full h-full object-cover" />
                           ) : (
                             <span className="text-[10px] font-black text-[#8e8268]">ED</span>
                           )}
                         </div>
                      </div>
                      <div className="mt-6 flex items-center gap-2 flex-wrap">
                         <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">{teacher?.name || 'Edify Educators'}</span>
                         <span className="text-[9px] font-black text-[#8e8268] uppercase tracking-widest bg-[#f4efe2] px-2 py-0.5 rounded-full">Core</span>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-amber-700 transition-colors line-clamp-2">
                      {ugandaClass.name}
                    </h3>
                    
                    {/* Metadata Line */}
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 mb-6">
                       <div className="flex items-center gap-1.5">
                         <Clock className="w-3.5 h-3.5" />
                         {totalModules * 2} Hrs
                       </div>
                       <div className="flex items-center gap-1.5">
                         <Users className="w-3.5 h-3.5" />
                         {Math.floor(Math.random() * 200) + 110} Students
                       </div>
                    </div>

                    {/* Footer Row */}
                    <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between">
                       <div className="flex items-center gap-1.5">
                          <span className="text-amber-500 font-bold text-sm leading-none">4.9</span>
                          <div className="flex gap-0.5">
                             {[1,2,3,4,5].map(s => <Star key={s} className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />)}
                          </div>
                       </div>
                       <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                          <BookOpen className="w-3.5 h-3.5" />
                          {totalModules} Modules
                       </div>
                    </div>

                    {/* Click Overlay */}
                    <Link to={`/classes/${ugandaClass.id}`} className="absolute inset-0 z-10">
                      <span className="sr-only">View Class</span>
                    </Link>
                 </div>
               </div>
             );
          })}
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

export default CourseCatalog;
