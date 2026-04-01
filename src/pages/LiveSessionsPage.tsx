import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Calendar } from '../components/ui/calendar';
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
  Star,
  CheckCircle,
  AlertCircle,
  MapPin,
  Target,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LiveSession {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  teacherName: string;
  classId: string;
  className: string;
  level: string;
  combination?: string;
  subjectId: string;
  subjectName: string;
  topicId?: string;
  topicName?: string;
  date: string;
  time: string;
  duration: number;
  timezone: string;
  maxParticipants: number;
  currentParticipants?: number;
  registeredStudents?: string[];
  meetingLink?: string;
  status: 'upcoming' | 'live' | 'completed';
  recordingEnabled: boolean;
  recordingUrl?: string;
  chatEnabled: boolean;
  qnaEnabled: boolean;
  language: string;
  examRelevance: string;
  isSpecialSession?: boolean;
  materials?: Array<{
    title: string;
    url: string;
  }>;
  feedback?: Array<{
    studentId: string;
    rating: number;
    comment: string;
  }>;
  participantCount?: number;
}

export const LiveSessionsPage: React.FC = () => {
  const { user } = useAuth();
  const [upcomingSessions, setUpcomingSessions] = useState<LiveSession[]>([]);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [pastSessions, setPastSessions] = useState<LiveSession[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch('/data/live-sessions.json');
        const data = await response.json();
        
        setUpcomingSessions(data.upcomingSessions || []);
        setLiveSessions(data.liveNow || []);
        setPastSessions(data.pastSessions || []);
      } catch (error) {
        console.error('Error fetching live sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleRegister = (sessionId: string) => {
    setUpcomingSessions(prev => prev.map(session => {
      if (session.id === sessionId && user?.id) {
        const registeredStudents = session.registeredStudents || [];
        if (!registeredStudents.includes(user.id)) {
          return {
            ...session,
            registeredStudents: [...registeredStudents, user.id],
            currentParticipants: (session.currentParticipants || 0) + 1
          };
        }
      }
      return session;
    }));
  };

  const handleUnregister = (sessionId: string) => {
    setUpcomingSessions(prev => prev.map(session => {
      if (session.id === sessionId && user?.id) {
        const registeredStudents = session.registeredStudents || [];
        return {
          ...session,
          registeredStudents: registeredStudents.filter(id => id !== user.id),
          currentParticipants: Math.max((session.currentParticipants || 0) - 1, 0)
        };
      }
      return session;
    }));
  };

  const isRegistered = (session: LiveSession) => {
    return user?.id && session.registeredStudents && session.registeredStudents.includes(user.id);
  };

  const getFilteredSessions = (sessions: LiveSession[]) => {
    return sessions.filter(session => {
      const matchesSearch = !searchTerm || 
        session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.className.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLevel = selectedLevel === 'all' || session.level === selectedLevel;
      const matchesClass = selectedClass === 'all' || session.className === selectedClass;
      
      return matchesSearch && matchesLevel && matchesClass;
    });
  };

  const formatDateTime = (date: string, time: string) => {
    const sessionDate = new Date(`${date}T${time}`);
    return {
      date: sessionDate.toLocaleDateString(),
      time: sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dayOfWeek: sessionDate.toLocaleDateString([], { weekday: 'long' })
    };
  };

  const getTimeUntilSession = (date: string, time: string) => {
    const sessionDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    const diffInMinutes = Math.floor((sessionDateTime.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 0) return 'Started';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ${diffInMinutes % 60}m`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const levelOptions = ['O\'level', 'A\'level'];
  const allClasses = [...new Set([...upcomingSessions, ...pastSessions].map(s => s.className))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading live sessions...</p>
        </div>
      </div>
    );
  }

  const SessionCard: React.FC<{ session: LiveSession; type: 'upcoming' | 'live' | 'past' }> = ({ session, type }) => {
    const { date, time, dayOfWeek } = formatDateTime(session.date, session.time);
    const timeUntil = type === 'upcoming' ? getTimeUntilSession(session.date, session.time) : null;
    const isUserRegistered = isRegistered(session);
    
    return (
      <Card className={`hover:shadow-md transition-all duration-200 ${
        type === 'live' ? 'border-red-200 shadow-md' : 
        session.isSpecialSession ? 'border-blue-200 bg-blue-50' : ''
      }`}>
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <Badge variant={session.level === 'O\'level' ? 'default' : 'secondary'}>
                {session.level}
              </Badge>
              {session.combination && (
                <Badge variant="outline" className="text-xs">{session.combination}</Badge>
              )}
              {type === 'live' && (
                <Badge variant="destructive" className="animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
                  LIVE
                </Badge>
              )}
              {session.isSpecialSession && (
                <Badge variant="default" className="bg-yellow-500">
                  <Star className="h-3 w-3 mr-1" />
                  Special
                </Badge>
              )}
            </div>
            {type === 'upcoming' && timeUntil && (
              <Badge variant="outline" className="text-xs">
                {timeUntil}
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg">{session.title}</CardTitle>
          <p className="text-sm text-gray-600">{session.description}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span>{session.teacherName}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-gray-500" />
                <span>{session.subjectName}</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-gray-500" />
                <span>{session.className}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-gray-500" />
                <span>{session.examRelevance}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                <span>{dayOfWeek}, {date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>{time} EAT • {session.duration} min</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span>
                  {type === 'past' 
                    ? `${session.participantCount || 0} attended`
                    : `${session.currentParticipants || 0}/${session.maxParticipants} registered`
                  }
                </span>
              </div>
              {session.recordingEnabled && (
                <div className="flex items-center gap-1 text-gray-600">
                  <Video className="h-4 w-4" />
                  <span>Will be recorded</span>
                </div>
              )}
            </div>

            {session.materials && session.materials.length > 0 && (
              <div className="text-sm">
                <p className="font-medium mb-1">Materials:</p>
                <div className="space-y-1">
                  {session.materials.slice(0, 2).map((material, index) => (
                    <div key={index} className="text-blue-600 hover:underline cursor-pointer">
                      {material.title}
                    </div>
                  ))}
                  {session.materials.length > 2 && (
                    <span className="text-gray-500">+{session.materials.length - 2} more</span>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {type === 'upcoming' && (
                <>
                  {isUserRegistered ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleUnregister(session.id)}
                      className="flex-1"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Registered
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      onClick={() => handleRegister(session.id)}
                      className="flex-1"
                      disabled={session.currentParticipants && session.currentParticipants >= session.maxParticipants}
                    >
                      {session.currentParticipants && session.currentParticipants >= session.maxParticipants ? (
                        <>
                          <AlertCircle className="mr-2 h-4 w-4" />
                          Full
                        </>
                      ) : (
                        <>
                          <Users className="mr-2 h-4 w-4" />
                          Register
                        </>
                      )}
                    </Button>
                  )}
                </>
              )}
              
              {type === 'live' && (
                <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700">
                  <Play className="mr-2 h-4 w-4" />
                  Join Live Session
                </Button>
              )}
              
              {type === 'past' && session.recordingUrl && (
                <Button variant="outline" size="sm" className="flex-1">
                  <Play className="mr-2 h-4 w-4" />
                  Watch Recording
                </Button>
              )}
              
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>

            {type === 'past' && session.feedback && session.feedback.length > 0 && (
              <div className="pt-3 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span>
                    {(session.feedback.reduce((sum, f) => sum + f.rating, 0) / session.feedback.length).toFixed(1)} 
                    ({session.feedback.length} reviews)
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span className="text-blue-600 font-medium">Uganda Secondary Education</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Live Sessions</h1>
          <p className="text-lg text-gray-600 mb-6">
            Interactive online classes for O'level and A'level students across Uganda
          </p>
          
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by session title, teacher, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                {levelOptions.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Classes</option>
                {allClasses.map(className => (
                  <option key={className} value={className}>{className}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">
              Upcoming ({getFilteredSessions(upcomingSessions).length})
            </TabsTrigger>
            <TabsTrigger value="live">
              Live Now ({liveSessions.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past Sessions ({getFilteredSessions(pastSessions).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredSessions(upcomingSessions).map(session => (
                <SessionCard key={session.id} session={session} type="upcoming" />
              ))}
            </div>
            {getFilteredSessions(upcomingSessions).length === 0 && (
              <div className="text-center py-12">
                <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming sessions found</h3>
                <p className="text-gray-600">Check back later or adjust your search criteria</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="live">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveSessions.map(session => (
                <SessionCard key={session.id} session={session} type="live" />
              ))}
            </div>
            {liveSessions.length === 0 && (
              <div className="text-center py-12">
                <Video className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No live sessions right now</h3>
                <p className="text-gray-600">Check the upcoming sessions or browse recorded content</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredSessions(pastSessions).map(session => (
                <SessionCard key={session.id} session={session} type="past" />
              ))}
            </div>
            {getFilteredSessions(pastSessions).length === 0 && (
              <div className="text-center py-12">
                <Play className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No past sessions found</h3>
                <p className="text-gray-600">Recorded sessions will appear here after completion</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
