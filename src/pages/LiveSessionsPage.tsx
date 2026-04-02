import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Play,
  Search,
  Filter,
  Video,
  User,
  MapPin,
  ExternalLink,
  Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { WebinarSession } from '../types';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { isFuture, isPast, addMinutes } from 'date-fns';

export const LiveSessionsPage: React.FC = () => {
  const { user } = useAuth();
  const [upcomingWebinars, setUpcomingWebinars] = useState<WebinarSession[]>([]);
  const [liveWebinars, setLiveWebinars] = useState<WebinarSession[]>([]);
  const [pastWebinars, setPastWebinars] = useState<WebinarSession[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Host-specific states
  const isTeacher = user?.role === 'independent_teacher' || user?.role === 'institution_admin';

  useEffect(() => {
    const fetchWebinars = async () => {
      try {
        const response = await apiClient.get('/live-sessions/live-session/');
        const sessions = response.data.results || response.data || [];
        
        const upcoming: WebinarSession[] = [];
        const live: WebinarSession[] = [];
        const past: WebinarSession[] = [];

        sessions.forEach((session: any) => {
          const start = new Date(session.scheduledStart);
          const end = addMinutes(start, session.durationMinutes || 60);

          if (isFuture(start)) {
            upcoming.push(session);
          } else if (isPast(end)) {
            past.push(session);
          } else {
            live.push(session);
          }
        });
        
        setUpcomingWebinars(upcoming);
        setLiveWebinars(live);
        setPastWebinars(past);
      } catch (error) {
        console.error('Error fetching webinars:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWebinars();
  }, []);

  const handleRSVP = (sessionId: string) => {
    setUpcomingWebinars(prev => prev.map(session => {
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

  const getFilteredWebinars = (sessions: WebinarSession[]) => {
    return sessions.filter(session => {
      const matchesSearch = !searchTerm || 
        session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.hostName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.subject.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSubject = selectedSubject === 'all' || session.subject.toLowerCase() === selectedSubject.toLowerCase();
      
      return matchesSearch && matchesSubject;
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

  const allSubjects = [...new Set([...upcomingWebinars, ...pastWebinars, ...liveWebinars].map(s => s.subject))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your webinar schedule...</p>
        </div>
      </div>
    );
  }

  const WebinarCard: React.FC<{ session: WebinarSession; type: 'upcoming' | 'live' | 'past' }> = ({ session, type }) => {
    const { date, time, dayOfWeek } = formatDateTime(session.scheduledStart);
    
    return (
      <Card className={`hover:shadow-md transition-all duration-200 ${
        type === 'live' ? 'border-red-200 border-2 shadow-lg bg-red-50/10' : ''
      }`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {session.subject}
              </Badge>
              <Badge variant="outline" className="text-gray-600 bg-gray-50">
                {session.type || 'Live Lesson'}
              </Badge>
              {type === 'live' && (
                <Badge variant="destructive" className="animate-pulse flex items-center gap-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  LIVE NOW
                </Badge>
              )}
            </div>
          </div>
          <CardTitle className="text-xl line-clamp-1">{session.title}</CardTitle>
          <CardDescription className="line-clamp-2 mt-1 min-h-[40px]">
            {session.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 pt-2">
            
            {/* Host Details */}
            <div className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded-md border text-gray-700">
              <User className="h-4 w-4 text-blue-600" />
              <span>Host: <strong>{session.hostName}</strong></span>
            </div>

            {/* Time Constraints */}
            <div className="flex items-center justify-between text-sm py-1 border-b">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                <span>{dayOfWeek}, {date}</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>{time} ({session.durationMinutes}m)</span>
              </div>
            </div>

            {/* Capacity & Platform */}
            <div className="flex items-center justify-between text-sm pb-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="h-4 w-4" />
                <span>
                  {session.enrolledCount}/{session.capacity} Attendees
                </span>
              </div>
              <div className="flex items-center gap-1 text-green-700 font-medium">
                <Video className="h-4 w-4" />
                <span>Google Meet</span>
              </div>
            </div>

            {/* Resources Section for Past/Host */}
            {session.resources && session.resources.length > 0 && (
              <div className="text-sm border-t pt-2">
                <p className="font-semibold text-gray-700 mb-1">Attached Resources:</p>
                <div className="flex flex-col gap-1">
                  {session.resources.map((res, i) => (
                    <a key={i} href="#" className="text-blue-600 hover:underline flex items-center gap-1">
                       <ExternalLink size={12} /> {res.title}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Actions Array */}
            <div className="flex gap-2 pt-2">
              {type === 'upcoming' && (
                <>
                   {(isTeacher && session.createdBy === user?.id) ? (
                      <Button variant="default" className="w-full bg-blue-600">Manage Host Settings</Button>
                   ) : (
                      <Button onClick={() => handleRSVP(session.id)} variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50">
                        <CalendarIcon className="mr-2 h-4 w-4" /> RSVP to Cal
                      </Button>
                   )}
                </>
              )}
              
              {type === 'live' && (
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white shadow-md">
                  <Play className="mr-2 h-4 w-4 fill-white flex-shrink-0" />
                  Join Google Meet
                </Button>
              )}
              
              {type === 'past' && session.recordingUrl && (
                 <Button variant="secondary" className="w-full shadow-sm">
                   <Play className="mr-2 h-4 w-4" />
                   Watch Webinar Replay
                 </Button>
              )}
            </div>

          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header Area */}
      <div className="bg-white border-b sticky top-16 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-blue-600 font-medium text-sm">Uganda Digital Campus</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Virtual Classrooms & Support</h1>
              <p className="text-gray-600 mt-1">Join Live Lessons, Peer Tutoring Groups, and Office Hours.</p>
            </div>
            {isTeacher && (
              <Button onClick={() => toast.info('Opening Host Modal...')} className="shadow-md hidden md:flex">
                <Plus className="mr-2 h-4 w-4"/> Schedule Webinar
              </Button>
            )}
          </div>
          
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search webinars by name, host, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap overflow-x-auto pb-1">
              <Filter className="h-4 w-4 text-gray-500 mr-2" />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 min-w-[150px]"
              >
                <option value="all">All Subjects</option>
                {allSubjects.map(subj => (
                  <option key={subj} value={subj}>{subj}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto bg-gray-200/50 p-1">
            <TabsTrigger value="upcoming" className="data-[state=active]:shadow-sm">
              Upcoming ({getFilteredWebinars(upcomingWebinars).length})
            </TabsTrigger>
            <TabsTrigger value="live" className="data-[state=active]:text-red-700">
              Live Now ({liveWebinars.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="data-[state=active]:shadow-sm">
              Replays ({getFilteredWebinars(pastWebinars).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredWebinars(upcomingWebinars).map(session => (
                <WebinarCard key={session.id} session={session} type="upcoming" />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="live">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveWebinars.map(session => (
                <WebinarCard key={session.id} session={session} type="live" />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="past">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredWebinars(pastWebinars).map(session => (
                <WebinarCard key={session.id} session={session} type="past" />
              ))}
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};
