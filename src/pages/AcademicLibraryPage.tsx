import React, { useState } from 'react';
import { EditorialPanel } from '../components/ui/editorial/EditorialPanel';
import { EditorialPill } from '../components/ui/editorial/EditorialPill';
import { EditorialHeader } from '../components/ui/editorial/EditorialHeader';
import { Search, Star, BookOpen, ChevronDown, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ResourceViewer } from '../components/academic/ResourceViewer';

// Realistic Academic Mock Data
const MOCK_RESOURCES = [
  {
    id: 'res-1',
    title: "Senior 4 Mathematics Revision Notes",
    authorName: "Sarah Nakamya",
    subject: "Mathematics",
    category: "Notes",
    coverURL: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=80",
    rating: 4.8,
    ratingsCount: "1.2k",
    pages: 120,
    description: "Complete coverage of O-level geometry, algebra, and statistics with practice problems.",
    format: "pdf",
    isFeatured: true,
    color: "from-rose-400 to-rose-300"
  },
  {
    id: 'res-2',
    title: "Biology: Human Circulatory System",
    authorName: "Michael Okello",
    subject: "Biology",
    category: "Textbook",
    coverURL: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&q=80",
    rating: 4.9,
    ratingsCount: "2.1k",
    pages: 85,
    description: "Visual exploration of the heart, blood vessels, and circulatory pathways.",
    format: "pdf",
    isFeatured: true,
    color: "from-blue-400 to-blue-300"
  },
  {
    id: 'res-3',
    title: "English Language Comprehension",
    authorName: "Edify Board",
    subject: "English",
    category: "Workbook",
    coverURL: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80",
    rating: 4.7,
    ratingsCount: "845",
    pages: 45,
    description: "Master techniques for summary writing, passage analysis, and critical reading.",
    format: "pdf",
    isFeatured: true,
    color: "from-emerald-400 to-emerald-300"
  },
  {
    id: 'res-4',
    title: "Physics Practical Guide",
    authorName: "Dr. Kaggwa",
    subject: "Physics",
    category: "Notes",
    coverURL: "https://images.unsplash.com/photo-1603126852811-0421213038ce?w=600&q=80",
    rating: 4.5,
    ratingsCount: "320",
    pages: 60,
    description: "Step-by-step guides for mechanics, optics, and electricity experiments.",
    format: "pdf"
  },
  {
    id: 'res-5',
    title: "Geography Atlas Companion",
    authorName: "Jane Doe",
    subject: "Geography",
    category: "Textbook",
    coverURL: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&q=80",
    rating: 4.6,
    ratingsCount: "560",
    pages: 140,
    description: "Detailed maps and analytical notes on East African physical geography.",
    format: "pdf"
  },
  {
    id: 'res-6',
    title: "General Paper Reading Pack",
    authorName: "Edify Arts Team",
    subject: "General Paper",
    category: "Notes",
    coverURL: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80",
    rating: 4.8,
    ratingsCount: "1.5k",
    pages: 200,
    description: "Curated essays and critical thinking prompts for A-level preparation.",
    format: "pdf"
  }
];

const TEACHERS_OF_WEEK = [
  { name: "Sarah Nakamya", subject: "Math & Physics", avatar: "https://i.pravatar.cc/150?u=1" },
  { name: "Michael Okello", subject: "Biology", avatar: "https://i.pravatar.cc/150?u=2" },
  { name: "Dr. Kaggwa", subject: "History", avatar: "https://i.pravatar.cc/150?u=3" },
  { name: "Jane Doe", subject: "Geography", avatar: "https://i.pravatar.cc/150?u=4" },
  { name: "Edify Board", subject: "Official Materials", avatar: "https://i.pravatar.cc/150?u=5" },
];

const SUBJECTS = ["All Subjects", "Mathematics", "Science", "Arts", "Humanities", "Languages"];

export function AcademicLibraryPage() {
  const { user } = useAuth();
  const [activeResource, setActiveResource] = useState<any>(null);
  const [activeSubject, setActiveSubject] = useState("All Subjects");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredResources = MOCK_RESOURCES.filter(res => {
    if (activeSubject !== "All Subjects" && res.subject !== activeSubject && !(activeSubject === 'Science' && ['Physics', 'Biology', 'Chemistry'].includes(res.subject)) && !(activeSubject === 'Humanities' && ['History', 'Geography'].includes(res.subject)) && !(activeSubject === 'Languages' && ['English'].includes(res.subject))) return false;
    if (searchQuery && !res.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const featuredResources = MOCK_RESOURCES.filter(r => r.isFeatured).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#fbfaf8] font-sans pb-24 relative">
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-[0.35] pointer-events-none"
        style={{ backgroundImage: "url('/images/bg-editorial-sand.png')" }}
      />
      <div className="fixed inset-0 bg-white/60 backdrop-blur-[2px] pointer-events-none" />

      {/* 1. Top Header Zone */}
      <div className="relative z-10 sticky top-0 bg-[#fbfaf8]/90 backdrop-blur-md border-b border-white z-50 py-4">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-4 w-full md:w-auto">
             <EditorialPill variant="outline" className="bg-white border-white shadow-sm flex items-center gap-2 px-4 py-2">
               Browse Category <ChevronDown className="w-4 h-4 text-slate-400" />
             </EditorialPill>
             <div className="relative flex-1 md:w-80">
               <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-300 w-4 h-4 pointer-events-none" />
               <input 
                 className="w-full bg-white border border-white focus:border-slate-200 rounded-full py-2.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate-300 text-slate-800 shadow-sm"
                 placeholder="Search Reference Materials..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
             </div>
           </div>
           
           <div className="hidden md:flex flex-col items-center">
             <EditorialHeader level="h3" className="text-slate-800 tracking-widest text-lg">readbooks</EditorialHeader>
             <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold">Edify Library</span>
           </div>

           <div className="hidden md:flex items-center gap-4">
             <div className="w-8 h-8 rounded-full overflow-hidden border border-white shadow-sm">
                <img src={user?.avatar || "https://i.pravatar.cc/150?u=admin"} alt="Profile" className="w-full h-full object-cover" />
             </div>
           </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-8">
        
        {/* 2. Featured Top Carousel / Shelf */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 rounded-3xl overflow-hidden shadow-sm border border-white mb-12">
          {featuredResources.map((book, idx) => (
             <div key={book.id} className={`relative p-8 md:p-12 overflow-hidden flex flex-col items-center text-center group bg-gradient-to-br ${book.color}`}>
                {/* Background noise and abstract shapes */}
                <div className="absolute inset-0 bg-noise opacity-[0.05] mix-blend-overlay pointer-events-none" />
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/20 blur-3xl rounded-full pointer-events-none" />
                
                {/* Navigation Arrows (mock, only on edges) */}
                {idx === 0 && <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-600 shadow-lg hover:bg-white transition-colors z-20"><ChevronLeft className="w-5 h-5" /></button>}
                {idx === 2 && <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-600 shadow-lg hover:bg-white transition-colors z-20"><ChevronRight className="w-5 h-5" /></button>}
                
                {/* Content */}
                <h3 className="text-white font-bold text-2xl mb-1 drop-shadow-md relative z-10">{book.title.split(':')[0]}</h3>
                <p className="text-white/80 text-sm font-medium mb-4 drop-shadow-sm relative z-10">by {book.authorName}</p>
                
                <div className="flex gap-1 mb-6 relative z-10">
                   {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.floor(book.rating) ? 'text-white fill-white' : 'text-white/30 fill-white/30'}`} />)}
                </div>

                <div className="relative w-40 h-56 mb-8 group-hover:-translate-y-2 transition-transform duration-500 z-10 shadow-2xl">
                   <img src={book.coverURL} alt="cover" className="w-full h-full object-cover rounded-md border border-white/20" />
                </div>

                <EditorialPill variant="primary" className="bg-white text-slate-800 hover:bg-slate-50 border-none shadow-xl px-8 relative z-10" onClick={() => setActiveResource(book)}>
                  Open Material
                </EditorialPill>
             </div>
          ))}
        </div>

        {/* 3. Main Content Body with left sidebar + main column */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* Left Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0 space-y-12">
            
            {/* Educator of the week */}
            <div>
              <h4 className="text-lg font-bold text-slate-800 mb-6">Educator of the week</h4>
              <div className="space-y-5">
                {TEACHERS_OF_WEEK.map((teacher, idx) => (
                  <div key={idx} className="flex items-center gap-4 group cursor-pointer">
                    <img src={teacher.avatar} alt={teacher.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 group-hover:border-[#8e8268] transition-colors" />
                    <div>
                      <h5 className="font-semibold text-slate-700 text-sm group-hover:text-[#8e8268] transition-colors">{teacher.name}</h5>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{teacher.subject}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Materials of the year */}
            <div>
              <h4 className="text-lg font-bold text-slate-800 mb-6">Top Materials</h4>
              <div className="space-y-6">
                {MOCK_RESOURCES.slice(0, 4).map((book) => (
                  <div key={book.id} className="flex items-start gap-4 group cursor-pointer" onClick={() => setActiveResource(book)}>
                    <div className="w-14 h-20 rounded shadow-sm overflow-hidden flex-shrink-0">
                      <img src={book.coverURL} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-slate-700 text-sm leading-snug group-hover:text-amber-700 transition-colors line-clamp-2 mb-1">{book.title}</h5>
                      <p className="text-[10px] text-slate-400 font-medium">by {book.authorName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Main Column */}
          <div className="flex-1">
             
             {/* 4. Category / subject tabs row */}
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
               <h3 className="text-xl font-bold text-slate-800">Popular by Subject</h3>
               <div className="flex gap-2 overflow-x-auto hide-scrollbar mask-edges w-full md:w-auto pb-2 md:pb-0">
                 {SUBJECTS.map((subject) => {
                   const isActive = activeSubject === subject;
                   return (
                     <button 
                       key={subject}
                       onClick={() => setActiveSubject(subject)}
                       className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all border whitespace-nowrap ${
                         isActive 
                           ? 'border-slate-800 text-slate-800 bg-transparent' 
                           : 'border-transparent text-slate-400 hover:text-slate-600'
                       }`}
                     >
                       {subject}
                     </button>
                   );
                 })}
               </div>
             </div>

             {/* 5. Main content listing cards (2-Col Image Left Layout) */}
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
               {filteredResources.map((book) => (
                 <EditorialPanel 
                   key={book.id} 
                   variant="glass" 
                   padding="none" 
                   className="overflow-hidden border border-white flex shadow-sm group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer h-[240px]"
                   onClick={() => setActiveResource(book)}
                 >
                    {/* Left Cover Image */}
                    <div className="w-[160px] h-full flex-shrink-0 relative overflow-hidden bg-slate-100">
                      <img src={book.coverURL} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      {/* Optional reading progress or tag */}
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded shadow-sm text-[9px] font-black uppercase tracking-widest text-[#8e8268]">
                        {book.category}
                      </div>
                    </div>

                    {/* Right Content */}
                    <div className="flex-1 p-6 flex flex-col relative bg-white/40">
                      
                      <h4 className="text-lg font-bold text-slate-900 group-hover:text-amber-700 transition-colors leading-tight line-clamp-2 mb-1">{book.title}</h4>
                      <p className="text-sm font-medium text-slate-500 mb-3">by {book.authorName}</p>

                      <div className="flex items-center gap-1.5 mb-3">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= Math.floor(book.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />)}
                        </div>
                        <span className="text-xs font-semibold text-slate-400 ml-1">{book.ratingsCount} users</span>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-light mb-4 flex-1">
                        {book.description}
                      </p>

                      {/* Engagement Strip */}
                      <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-100/50 mix-blend-multiply">
                        <div className="flex -space-x-2">
                           <img src="https://i.pravatar.cc/150?img=11" className="w-6 h-6 rounded-full border border-white" alt="user" />
                           <img src="https://i.pravatar.cc/150?img=12" className="w-6 h-6 rounded-full border border-white" alt="user" />
                           <img src="https://i.pravatar.cc/150?img=13" className="w-6 h-6 rounded-full border border-white" alt="user" />
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">Assigned to 150+ students in {book.subject}</p>
                      </div>

                    </div>
                 </EditorialPanel>
               ))}
               
               {filteredResources.length === 0 && (
                 <div className="col-span-full py-20 text-center text-slate-500">
                    No resources match this selection.
                 </div>
               )}
             </div>

          </div>
        </div>
      </div>

      {activeResource && (
        <ResourceViewer
          resource={activeResource}
          studentId={user?.id || 'anonymous'}
          onClose={(snapshot) => {
             console.log("Recorded view:", snapshot);
             setActiveResource(null);
          }}
        />
      )}

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .mask-edges {
          -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
          mask-image: linear-gradient(to right, transparent, black 15px, black calc(100% - 15px), transparent);
        }
      `}</style>
    </div>
  );
}

export default AcademicLibraryPage;
