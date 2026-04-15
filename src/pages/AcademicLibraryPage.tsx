import React, { useState, useEffect, useCallback } from 'react';
import { EditorialPanel } from '../components/ui/editorial/EditorialPanel';
import { EditorialPill } from '../components/ui/editorial/EditorialPill';
import { EditorialHeader } from '../components/ui/editorial/EditorialHeader';
import { Search, Star, BookOpen, ChevronDown, ChevronLeft, ChevronRight, User, AlertCircle, RefreshCw, PlayCircle, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ResourceViewer } from '../components/academic/ResourceViewer';
import VideoPlayer from '../components/academic/VideoPlayer';
import { contentApi, type ContentItem } from '../lib/contentApi';
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/button';

/** Map a ContentItem from the API to a normalized shape for the card grid */
function mapContentToResource(item: ContentItem): any {
  return {
    id: item.id,
    title: item.title,
    author: item.uploader_name || 'Maple',
    subject: item.subject_name || item.school_level || 'General',
    category: (item.content_type || 'other').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    description: item.description,
    file_url: item.file_url || item.thumbnail_url,
    is_featured: item.is_featured,
    vimeo_video_id: item.vimeo_video_id,
    content_type: item.content_type,
    engagement_views: item.engagement_summary?.total_views || 0,
    engagement_viewers: item.engagement_summary?.unique_viewers || 0,
    file_size: item.file_size,
    rating: 4.5 + (Math.random() * 0.5), // Placeholder until rating system is added
  };
}

const TEACHERS_OF_WEEK = [
  { name: "Sarah Nakamya", subject: "Math & Physics", avatar: "https://i.pravatar.cc/150?u=1" },
  { name: "Michael Okello", subject: "Biology", avatar: "https://i.pravatar.cc/150?u=2" },
  { name: "Dr. Kaggwa", subject: "History", avatar: "https://i.pravatar.cc/150?u=3" },
  { name: "Jane Doe", subject: "Geography", avatar: "https://i.pravatar.cc/150?u=4" },
  { name: "Maple Board", subject: "Official Materials", avatar: "https://i.pravatar.cc/150?u=5" },
];

const SUBJECTS = ["All Subjects", "Mathematics", "Science", "Arts", "Humanities", "Languages"];
const CATEGORIES = ["All", "notes", "textbook", "worksheet", "video", "slides", "pdf", "mock_exam", "revision", "other"];
const CATEGORY_LABELS: Record<string, string> = {
  'All': 'All', 'notes': 'Notes', 'textbook': 'Textbook', 'worksheet': 'Worksheet',
  'video': 'Video', 'slides': 'Slides', 'pdf': 'PDF', 'mock_exam': 'Mock Exam',
  'revision': 'Revision', 'other': 'Other',
};
const SORT_OPTIONS = [
  { value: '-published_at', label: 'Newest' },
  { value: '-created_at', label: 'Recently Added' },
  { value: 'title', label: 'A → Z' },
  { value: '-title', label: 'Z → A' },
];

export function AcademicLibraryPage() {
  const { user } = useAuth();
  const [activeResource, setActiveResource] = useState<any>(null);
  const [activeSubject, setActiveSubject] = useState("All Subjects");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState('-created_at');
  const [searchQuery, setSearchQuery] = useState("");
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [videoPlayer, setVideoPlayer] = useState<{ vimeoId: string; title: string } | null>(null);

  // Fetch resources from Content Delivery API
  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = { ordering: sortBy };
      if (searchQuery) filters.search = searchQuery;
      if (activeCategory !== 'All') filters.content_type = activeCategory;

      const response = await contentApi.library(filters);
      if (!response) throw new Error('Empty response from content API');
      const results = response.results || [];

      setResources(results.map(mapContentToResource));
      setTotalCount(response.count || results.length);
    } catch (err) {
      console.error('Error fetching content from delivery API:', err);
      setError('Unable to load resources. Please check your connection and try again.');
      setResources([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeCategory, sortBy, retryCount]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleResourceClick = (resource: any) => {
    if (resource.vimeo_video_id) {
      setVideoPlayer({ vimeoId: resource.vimeo_video_id, title: resource.title });
    } else {
      setActiveResource(resource);
    }
  };

  // Show loading state
  if (loading && resources.length === 0) {
    return (
      <div className="min-h-screen bg-[#e2ddd1] flex items-center justify-center">
        <DashboardSkeleton />
      </div>
    );
  }

  // Show error state with retry option
  if (error && resources.length === 0) {
    return (
      <div className="min-h-screen bg-[#e2ddd1] flex items-center justify-center p-4">
        <EmptyState
          icon={AlertCircle}
          title="Unable to Load Resources"
          description={error}
          actionLabel="Try Again"
          onAction={handleRetry}
        />
      </div>
    );
  }

  // Show empty state
  if (!loading && resources.length === 0) {
    return (
      <div className="min-h-screen bg-[#e2ddd1] flex items-center justify-center p-4">
        <EmptyState
          icon={BookOpen}
          title="No Academic Resources Available"
          description="Resources will appear here once they are uploaded by educators."
          actionLabel="Refresh"
          onAction={handleRetry}
        />
      </div>
    );
  }

  const filteredResources = resources.filter(res => {
    if (activeSubject !== "All Subjects" && res.subject !== activeSubject && !(activeSubject === 'Science' && ['Physics', 'Biology', 'Chemistry'].includes(res.subject)) && !(activeSubject === 'Humanities' && ['History', 'Geography'].includes(res.subject)) && !(activeSubject === 'Languages' && ['English'].includes(res.subject))) return false;
    if (searchQuery && !res.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const featuredResources = resources.filter(r => r.is_featured).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#e2ddd1] font-sans pb-24 relative">
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-[0.35] pointer-events-none"
        style={{ backgroundImage: "url('/images/bg-editorial-sand.png')" }}
      />
      <div className="fixed inset-0 bg-white/40 pointer-events-none" />

      {/* 1. Top Header Zone */}
      <div className="relative z-10 sticky top-0 bg-[#e2ddd1]/90 backdrop-blur-md border-b border-white z-50 py-4">
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
             <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold">Maple Library</span>
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
             <div key={book.id} className={`relative p-8 md:p-12 overflow-hidden flex flex-col items-center text-center group bg-gradient-to-br from-blue-400 to-blue-300`}>
                {/* Background noise and abstract shapes */}
                <div className="absolute inset-0 bg-noise opacity-[0.05] mix-blend-overlay pointer-events-none" />
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/20 blur-3xl rounded-full pointer-events-none" />
                
                {/* Navigation Arrows (mock, only on edges) */}
                {idx === 0 && <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-600 shadow-lg hover:bg-white transition-colors z-20"><ChevronLeft className="w-5 h-5" /></button>}
                {idx === 2 && <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-600 shadow-lg hover:bg-white transition-colors z-20"><ChevronRight className="w-5 h-5" /></button>}
                
                {/* Content */}
                <h3 className="text-white font-bold text-2xl mb-1 drop-shadow-md relative z-10 line-clamp-2">{book.title}</h3>
                <p className="text-white/80 text-sm font-medium mb-4 drop-shadow-sm relative z-10">by {book.author || 'Maple'}</p>
                
                <div className="flex gap-1 mb-6 relative z-10">
                   {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.floor(book.rating || 4) ? 'text-white fill-white' : 'text-white/30 fill-white/30'}`} />)}
                </div>

                <div className="relative w-40 h-56 mb-8 group-hover:-translate-y-2 transition-transform duration-500 z-10 shadow-2xl bg-white rounded-md">
                   <div className="w-full h-full flex items-center justify-center">
                     <div className="text-center">
                       <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-2" />
                       <p className="text-xs text-slate-400 font-medium">{book.type}</p>
                     </div>
                   </div>
                </div>

                <EditorialPill variant="primary" className="bg-white text-slate-800 hover:bg-slate-50 border-none shadow-xl px-8 relative z-10 cursor-pointer" onClick={() => handleResourceClick(book)}>
                  {book.vimeo_video_id ? 'Watch Video' : 'Open Material'}
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
              <div className="space-y-5 max-h-[600px] overflow-y-auto pr-1 hide-scrollbar">
                {resources.slice(0, 10).map((book, idx) => (
                  <div key={book.id} className="flex items-start gap-3 group cursor-pointer" onClick={() => setActiveResource(book)}>
                    <span className="text-[10px] font-black text-slate-300 w-4 flex-shrink-0 mt-1">#{idx + 1}</span>
                    <div className="w-12 h-16 rounded-lg shadow-sm overflow-hidden flex-shrink-0">
                      <img src={book.file_url || 'https://via.placeholder.com/50x70?text=Resource'} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-semibold text-slate-700 text-sm leading-snug group-hover:text-amber-700 transition-colors line-clamp-2 mb-0.5">{book.title}</h5>
                      <p className="text-[10px] text-slate-400 font-medium">by {book.author || 'Unknown'}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => <Star key={s} className={`w-2 h-2 ${s <= Math.floor(book.rating || 4) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />)}
                        </div>
                        <span className="text-[9px] text-slate-400">{book.rating?.toFixed(1) || '4.5'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Main Column */}
          <div className="flex-1">
             
             {/* 4. Category / subject tabs row */}
             <div className="flex flex-col gap-4 mb-8">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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

               {/* Category + Sort row */}
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                 <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                   {CATEGORIES.map((cat) => (
                     <button
                       key={cat}
                       onClick={() => setActiveCategory(cat)}
                       className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border whitespace-nowrap ${
                         activeCategory === cat
                           ? 'bg-[#8e8268] text-white border-[#8e8268]'
                           : 'border-slate-200 text-slate-500 hover:border-slate-400'
                       }`}
                     >
                       {CATEGORY_LABELS[cat] || cat}
                     </button>
                   ))}
                 </div>
                 <div className="flex items-center gap-2">
                   <Filter className="w-3.5 h-3.5 text-slate-400" />
                   <select
                     value={sortBy}
                     onChange={(e) => setSortBy(e.target.value)}
                     className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 bg-white focus:outline-none focus:border-slate-400"
                   >
                     {SORT_OPTIONS.map((opt) => (
                       <option key={opt.value} value={opt.value}>{opt.label}</option>
                     ))}
                   </select>
                   <span className="text-xs text-slate-400">{totalCount} resources</span>
                 </div>
               </div>
             </div>

             {/* 5. Main content — 6-col vertical book card grid */}
             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
               {filteredResources.map((book) => (
                 <div
                   key={book.id}
                   className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 flex flex-col"
                   onClick={() => handleResourceClick(book)}
                 >
                   {/* Cover Image (tall, fills top) */}
                   <div className="relative overflow-hidden bg-slate-100 aspect-[3/4] w-full flex-shrink-0">
                     <div className="w-full h-full flex items-center justify-center">
                       {book.vimeo_video_id ? (
                         <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-600">
                           <PlayCircle className="w-12 h-12 text-white/80" />
                           <span className="absolute bottom-2 left-2 text-[8px] font-bold text-white/70 uppercase tracking-wider">Video</span>
                         </div>
                       ) : (
                         <BookOpen className="w-16 h-16 text-slate-300" />
                       )}
                     </div>
                     {/* Category badge */}
                     <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm text-[9px] font-black uppercase tracking-widest text-[#8e8268]">
                       {book.category || 'General'}
                     </div>
                   </div>

                   {/* Details below cover */}
                   <div className="p-3 flex flex-col flex-1">
                     <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors leading-snug line-clamp-2 mb-1">
                       {book.title}
                     </h4>
                     <p className="text-[10px] font-medium text-slate-400 mb-2">by {book.author || 'Maple'}</p>

                     <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed font-light mb-3 flex-1">
                       {book.description}
                     </p>

                     {/* Engagement Strip */}
                     <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 mb-2">
                       <div className="flex -space-x-1.5">
                         <img src="https://i.pravatar.cc/150?img=11" className="w-4 h-4 rounded-full border border-white" alt="user" />
                         <img src="https://i.pravatar.cc/150?img=12" className="w-4 h-4 rounded-full border border-white" alt="user" />
                         <img src="https://i.pravatar.cc/150?img=13" className="w-4 h-4 rounded-full border border-white" alt="user" />
                       </div>
                       <p className="text-[9px] text-slate-400 font-medium leading-tight">
                         {book.engagement_views ? `${book.engagement_views} views` : `${book.engagement_viewers || 0} viewers`}
                       </p>
                     </div>

                     {/* Rating row — bottom of card */}
                     <div className="flex items-center gap-1">
                       <div className="flex gap-0.5">
                         {[1,2,3,4,5].map(s => (
                           <Star key={s} className={`w-2.5 h-2.5 ${s <= Math.floor(book.rating || 4) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
                         ))}
                       </div>
                       <span className="text-[9px] font-semibold text-slate-400">{(book.rating || 4).toFixed(1)} / 5</span>
                     </div>
                   </div>
                 </div>
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

      {videoPlayer && (
        <VideoPlayer
          isOpen={!!videoPlayer}
          onClose={() => setVideoPlayer(null)}
          vimeoVideoId={videoPlayer.vimeoId}
          title={videoPlayer.title}
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
