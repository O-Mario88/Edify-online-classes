import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EditorialPanel } from '@/components/ui/editorial/EditorialPanel';
import { EditorialPill } from '@/components/ui/editorial/EditorialPill';
import { EditorialHeader } from '@/components/ui/editorial/EditorialHeader';
import { Search, Filter, Globe2, BookOpen, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';

// We define our local API type
interface DjangoSubject {
  id: number;
  name: string;
  code: string;
  category?: string;
  classLevels?: string[];
}

const MarketplacePage: React.FC = () => {
  const { currentContext } = useAuth();
  const navigate = useNavigate();
  
  const [selectedCountry, setSelectedCountry] = useState(currentContext || 'uganda');
  const [searchTerm, setSearchTerm] = useState('');
  const [apiStatus, setApiStatus] = useState<string>('disconnected');
  const [subjects, setSubjects] = useState<DjangoSubject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  React.useEffect(() => {
    // Phase 2/3: Live Database Feed
    apiClient.get('/curriculum/subjects/')
      .then(res => {
         const mapped = (res.data as any).map((subject: any) => ({
             ...subject,
             category: 'Core Syllabus'
         }));
         setSubjects(mapped);
         setApiStatus('connected');
         setLoading(false);
      })
      .catch(err => {
         console.error("API Connectivity Error (Backend may be offline):", err);
         setApiStatus('disconnected');
         setLoading(false);
      });
  }, []);
  
  const filteredSubjects = subjects.filter(subject => {
    const matchesCountry = true;
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCountry && matchesSearch;
  });

  const handleSubjectClick = (subjectId: number | string) => {
    navigate(`/marketplace/${selectedCountry}/${subjectId}`);
  };

  return (
    <div className="min-h-screen bg-[#fbfaf8] font-sans pb-24 relative">
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-[0.35] pointer-events-none"
        style={{ backgroundImage: "url('/images/bg-editorial-sand.png')" }}
      />
      <div className="fixed inset-0 bg-white/40 pointer-events-none" />

      {/* Header Area */}
      <div className="relative z-10 pt-16 pb-8 border-b border-white mix-blend-multiply">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between items-start gap-4 mb-4">
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur px-4 py-2 rounded-full border border-white">
              <Globe2 className="h-4 w-4 text-emerald-700" />
              <span className="text-xs font-bold tracking-widest text-emerald-800 uppercase">National Repository</span>
            </div>
            
            <EditorialHeader level="h1" className="text-slate-800">
               Academic Marketplace_
            </EditorialHeader>
            <p className="text-lg text-slate-500 font-light max-w-xl leading-relaxed">
               Discover curriculum-aligned resources, lesson materials, and premium study aids.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10">
        
        {/* Soft Filter Bar */}
        <EditorialPanel variant="glass" radius="xl" padding="sm" className="mb-12 border border-white shadow-sm max-w-4xl">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 p-2">
            
            {/* Pill Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
              <input
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#fbfaf8]/80 border-none rounded-full py-4 pl-12 pr-6 text-sm outline-none focus:ring-2 focus:ring-slate-200 transition-all font-medium text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <div className="hidden lg:block w-px h-8 bg-slate-200" />

            {/* Region Filter */}
            <div className="flex items-center gap-3 bg-[#fbfaf8]/80 rounded-full px-4 py-2 flex-grow sm:flex-grow-0">
              <Globe2 className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="bg-transparent border-none text-sm font-medium text-slate-700 outline-none cursor-pointer pr-4 appearance-none focus:ring-0 w-full"
              >
                <option value="uganda">Uganda (NCDC)</option>
                <option value="kenya">Kenya (CBC / 8-4-4)</option>
                <option value="rwanda">Rwanda (CBC)</option>
              </select>
            </div>
          </div>
        </EditorialPanel>

        <div className="mb-8 px-2 flex justify-between items-end border-b border-white pb-4 mix-blend-multiply">
           <h2 className="text-xl font-medium text-slate-800">
              Disciplines in {selectedCountry.charAt(0).toUpperCase() + selectedCountry.slice(1)}
           </h2>
           <span className="text-[10px] font-black uppercase tracking-widest text-[#8e8268] bg-[#f4efe2] px-3 py-1.5 rounded-full border border-white">
              {filteredSubjects.length} Curated
           </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {loading ? (
            <div className="col-span-full py-24 text-center">
               <div className="animate-pulse flex items-center justify-center space-x-4">
                 <div className="w-12 h-12 bg-[#f4efe2] rounded-full"></div>
                 <div className="text-slate-400 font-medium tracking-widest uppercase text-sm">Syncing Records...</div>
               </div>
            </div>
          ) : filteredSubjects.length === 0 ? (
            <EditorialPanel variant="flat" className="col-span-full py-24 text-center border-none">
              <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-6" />
              <EditorialHeader level="h4" className="text-slate-800 font-light mb-2">No disciplines found</EditorialHeader>
              <p className="text-slate-500 text-sm">Check back later or adjust your regional filters.</p>
            </EditorialPanel>
          ) : (
            filteredSubjects.map((subject) => (
              <EditorialPanel 
                key={subject.id} 
                variant="elevated"
                radius="large"
                padding="none"
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full border border-slate-100"
                onClick={() => handleSubjectClick(subject.id)}
              >
                <div className="h-40 bg-[#fbfaf8] relative overflow-hidden flex flex-col justify-end p-6 border-b border-slate-100">
                  {/* Soft Background Accent */}
                  <div className="absolute top-[-50%] right-[-20%] w-64 h-64 bg-rose-100/50 rounded-full blur-3xl pointer-events-none group-hover:bg-rose-200/50 transition-colors" />
                  
                  <h3 className="text-2xl font-bold text-slate-900 relative z-10 group-hover:text-amber-700 transition-colors leading-tight mb-2">
                    {subject.name}
                  </h3>
                  
                  <span className="absolute top-4 left-4 text-[9px] font-black tracking-widest uppercase bg-white border border-slate-100 text-slate-500 px-3 py-1.5 rounded-full shadow-sm">
                    {subject.category}
                  </span>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                   <p className="text-sm font-light text-slate-500 leading-relaxed mb-6 flex-grow">
                      Examine verified academic materials mapped strictly to the S1-S6 {subject.name} path.
                   </p>
                   
                   <div className="flex flex-wrap gap-2 mb-8">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-1 rounded-sm">Topics</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-1 rounded-sm">Masterclass</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-1 rounded-sm">Papers</span>
                   </div>

                   <EditorialPill variant="primary" className="w-full justify-between mt-auto">
                     Enter Archive <ArrowRight className="h-4 w-4 opacity-70" />
                   </EditorialPill>
                </div>
              </EditorialPanel>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;