import React, { useState, useEffect } from 'react';
import { EditorialPanel } from '../components/ui/editorial/EditorialPanel';
import { EditorialPill } from '../components/ui/editorial/EditorialPill';
import { EditorialHeader } from '../components/ui/editorial/EditorialHeader';
import { Badge } from '../components/ui/badge';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Play,
  Search,
  Filter,
  Video,
  ChevronLeft,
  ChevronRight,
  User,
  Star,
  Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { WebinarSession } from '../types';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { isFuture, isPast, addMinutes } from 'date-fns';
import { LiveSessionCTA } from '../components/dashboard/LiveSessionCTA';

export const LiveSessionsPage: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<WebinarSession[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  // Host-specific states
  const isTeacher = user?.role === 'independent_teacher' || user?.role === 'institution_admin';

  useEffect(() => {
    const fetchWebinars = async () => {
      try {
        const response = await apiClient.get('/live-sessions/live-session/');
        const fetchedSessions = response.data.results || response.data || [];
        setSessions(fetchedSessions);
      } catch (error) {
        console.error('Error fetching webinars:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWebinars();
  }, []);

  const handleRSVP = (sessionId: string) => {
    setSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        toast.success(`RSVP Confirmed for ${session.title}! We added it to your calendar.`);
        return {
          ...session,
          enrolledCount: session.enrolledCount + 1
        };
      }
      return session;
    }));
  };

  const getFilteredSessions = () => {
    return sessions.filter(session => {
      const start = new Date(session.scheduledStart);
      const end = addMinutes(start, session.durationMinutes || 60);
      
      let state = 'live';
      if (isFuture(start)) state = 'upcoming';
      else if (isPast(end)) state = 'recorded';

      // Advanced mock states if any (Peer Discussion, Revision)
      if (session.type === 'peer_discussion') state = 'peer discussion';
      if (session.type === 'revision') state = 'revision session';

      const matchesSearch = !searchTerm || 
        session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.hostName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || 
        state.toLowerCase() === selectedCategory.toLowerCase();
      
      return matchesSearch && matchesCategory;
    });
  };

  const formatDateTime = (isoString: string) => {
    const d = new Date(isoString);
    return {
      date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dayOfWeek: d.toLocaleDateString([], { weekday: 'long' })
    };
  };

  const categories = ['All', 'Upcoming', 'Live', 'Recorded', 'Peer Discussion', 'Revision Session'];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfaf8] flex items-center justify-center">
        <div className="animate-pulse w-12 h-12 rounded-full bg-[#f4efe2]"></div>
      </div>
    );
  }

  // Generate deterministic abstract background colors based on ID
  const getGradientForId = (id: string, state: string) => {
    if (state === 'live') return 'from-rose-100 to-orange-50';
    if (state === 'recorded') return 'from-slate-200 to-slate-100';
    const sum = id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const backgrounds = [
      'from-emerald-100 to-teal-50',
      'from-blue-100 to-indigo-50',
      'from-purple-100 to-pink-50',
      'from-amber-100 to-yellow-50'
    ];
    return backgrounds[sum % backgrounds.length];
  };

  const WebinarCard: React.FC<{ session: WebinarSession }> = ({ session }) => {
    const { date, time, dayOfWeek } = formatDateTime(session.scheduledStart);
    
    const start = new Date(session.scheduledStart);
    const end = addMinutes(start, session.durationMinutes || 60);
    let state = 'Live';
    if (isFuture(start)) state = 'Upcoming';
    else if (isPast(end)) state = 'Recorded';

    const gradient = getGradientForId(session.id, state.toLowerCase());

    return (
      <div className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
        
        {/* Top visual area */}
        <div className={`h-48 relative overflow-hidden bg-gradient-to-br ${gradient} p-5 flex flex-col justify-between`}>
           <div className="flex justify-between items-start z-10 relative">
              <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm backdrop-blur-md ${
                state === 'Live' ? 'bg-rose-500 text-white' : 
                state === 'Upcoming' ? 'bg-white/90 text-slate-800' : 
                'bg-slate-800/80 text-white'
              }`}>
                {state === 'Live' && <span className="w-1.5 h-1.5 rounded-full bg-white inline-block mr-1.5 animate-pulse" />}
                {state}
              </span>
           </div>
           
           {/* Abstract geometric elements */}
           <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-[12px] border-white/20 blur-[2px]" />
           <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/30 rounded-lg rotate-45 backdrop-blur-xl" />
        </div>

        <div className="p-6 flex flex-col flex-grow relative">
           
           {/* Host Row */}
           <div className="flex items-center gap-3 mb-4 mt-[-40px] z-20">
             <div className="w-12 h-12 rounded-full bg-white p-1 shadow-md border border-slate-100">
                <div className="w-full h-full bg-[#f4efe2] rounded-full flex items-center justify-center overflow-hidden text-[#8e8268]">
                  <User className="h-5 w-5" />
                </div>
             </div>
             <div className="mt-6 flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">{session.hostName}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-[10px] font-bold text-[#8e8268] uppercase tracking-wider bg-[#f4efe2] px-2 py-0.5 rounded-sm">Host</span>
             </div>
           </div>

           <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-amber-700 transition-colors line-clamp-2">
             {session.title}
           </h3>
           
           {/* Meta Data */}
           <div className="flex flex-col gap-3 text-xs font-bold text-slate-400 mb-6">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-3.5 h-3.5" />
                {dayOfWeek}, {date}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                {time} <span className="font-medium text-slate-300 ml-1">({session.durationMinutes}m)</span>
              </div>
           </div>

           {/* Metrics Footer */}
           <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                 <Users className="w-3.5 h-3.5 text-slate-400" />
                 {session.enrolledCount} <span className="font-medium text-slate-400 ml-0.5 text-xs">/ {session.capacity}</span>
              </div>
              
              {/* Action */}
              <div className="relative z-20">
                {state === 'Upcoming' && (
                  <button onClick={(e) => { e.preventDefault(); handleRSVP(session.id); }} className="text-xs font-bold text-emerald-600 hover:text-white border border-emerald-200 hover:bg-emerald-500 hover:border-emerald-500 transition-colors px-4 py-1.5 rounded-full">
                    RSVP
                  </button>
                )}
                {state === 'Recorded' && (
                   <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 hover:text-slate-700 transition-colors">
                     <Play className="w-3 h-3" /> Replay
                   </button>
                )}
              </div>
           </div>
           
           {/* For Live State, cover the bottom row or full card with CTA link */}
           {state === 'Live' && (
             <div className="absolute inset-x-4 bottom-4 z-20">
                <LiveSessionCTA 
                  sessionId={session.id}
                  scheduledStart={session.scheduledStart}
                  durationMinutes={session.durationMinutes || 60}
                  attended={false}
                  meetingUrl={session.meetingUrl}
                  className="w-full !rounded-xl !py-3 shadow-lg"
               />
             </div>
           )}

        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fbfaf8] font-sans pb-24 relative">
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-[0.35] pointer-events-none"
        style={{ backgroundImage: "url('/images/bg-editorial-sand.png')" }}
      />
      <div className="fixed inset-0 bg-white/40 pointer-events-none" />

      {/* 1. Hero Section (2-Column) */}
      <div className="relative pt-20 pb-20 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left Column: Text & CTA */}
            <div className="flex-1 space-y-8 text-center lg:text-left z-10 relative">
              <div className="inline-block relative">
                <EditorialHeader level="h1" className="text-slate-900 leading-[1.1] tracking-tight">
                  Engage in live virtual<br />masterclasses
                </EditorialHeader>
                <div className="absolute top-1/2 -left-6 w-16 h-16 bg-blue-200/40 rounded-full blur-xl -z-10" />
              </div>
              
              <p className="text-lg sm:text-xl text-slate-500 font-light leading-relaxed max-w-lg mx-auto lg:mx-0">
                Participate in real-time academic discourse, interactive office hours, and revision seminars with leading educators.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                {isTeacher ? (
                   <EditorialPill variant="primary" onClick={() => toast.info('Opening Host Modal...')} className="px-8 py-4 shadow-xl shadow-slate-900/10 hover:-translate-y-1 transition-transform">
                     Host a Seminar
                   </EditorialPill>
                ) : (
                   <EditorialPill variant="primary" className="px-8 py-4 shadow-xl shadow-slate-900/10 hover:-translate-y-1 transition-transform">
                     Discover Live Events
                   </EditorialPill>
                )}
              </div>
            </div>

            {/* Right Column: Hero Visual */}
            <div className="flex-1 w-full relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/50 to-purple-50/50 rounded-full blur-[100px] -z-10" />
              
              <div className="relative rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl shadow-slate-200/50 aspect-[4/3] bg-slate-100 group">
                <img 
                  src="https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                  alt="Student watching a live seminar"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-white/50 flex items-center gap-3 animate-pulse">
                  <div className="w-3 h-3 bg-rose-500 rounded-full" />
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-800">Live Network Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sessions Section Intro & Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10 mb-8">
        <div className="flex flex-col md:flex-row items-end justify-between gap-6 border-b border-slate-200/50 pb-6">
          <div>
             <EditorialHeader level="h2" className="text-slate-900 flex items-center gap-3">
               Platform Seminars
             </EditorialHeader>
             <div className="w-16 h-1 bg-blue-300 mt-3 rounded-full" />
          </div>
          
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search seminars, hosts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-full py-3.5 pl-5 pr-12 text-sm outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all font-medium text-slate-800 placeholder:text-slate-400 shadow-sm"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-100 hover:text-slate-600 transition-colors border border-slate-100">
               <Search className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Category / filter row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-12">
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 shadow-sm flex-shrink-0">
             <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="flex-1 overflow-x-auto hide-scrollbar flex gap-3 py-2 px-1 mask-edges">
             {categories.map((category) => {
               const active = selectedCategory === category;
               return (
                 <button
                   key={category}
                   onClick={() => setSelectedCategory(category)}
                   className={`whitespace-nowrap px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 border ${
                     active 
                       ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10' 
                       : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                   }`}
                 >
                   {category}
                 </button>
               )
             })}
          </div>

          <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 shadow-sm flex-shrink-0">
             <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 4. Session cards grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {getFilteredSessions().map((session) => (
             <WebinarCard key={session.id} session={session} />
          ))}
          {getFilteredSessions().length === 0 && (
             <div className="col-span-full py-20 text-center">
                <EditorialPanel variant="flat" className="inline-block px-12 border border-slate-100 bg-white/50">
                  <EditorialHeader level="h4" className="text-slate-800 font-light mb-2">No active sessions found.</EditorialHeader>
                  <p className="text-slate-500 text-sm">Review your filters or check back later.</p>
                </EditorialPanel>
             </div>
          )}
        </div>
      </div>

      {/* 5. Bottom Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 mb-12 relative z-10">
        <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-800 p-8 md:p-12 relative flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
           
           <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500/20 blur-3xl rounded-full" />
           <div className="absolute bottom-12 right-1/4 w-32 h-32 bg-purple-500/20 blur-2xl rounded-full" />
           <div className="absolute top-10 right-10 flex gap-2 opacity-30">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
           </div>

           <div className="relative z-10 text-center md:text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Influence the Network</span>
              <h3 className="text-3xl md:text-4xl font-light text-white leading-tight">
                Want to lead a live session?<br/><span className="font-bold border-b-[3px] border-amber-500/50 pb-1 text-slate-200">Submit your proposal.</span>
              </h3>
           </div>
           
           <div className="relative z-10 flex-shrink-0">
              <button className="bg-white hover:bg-slate-100 text-slate-900 rounded-full px-8 py-4 font-bold text-sm tracking-wide transition-colors shadow-lg">
                Host Masterclass
              </button>
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
        .mask-edges {
          -webkit-mask-image: linear-gradient(to right, transparent, black 15px, black calc(100% - 15px), transparent);
          mask-image: linear-gradient(to right, transparent, black 15px, black calc(100% - 15px), transparent);
        }
      `}</style>
    </div>
  );
};

export default LiveSessionsPage;
