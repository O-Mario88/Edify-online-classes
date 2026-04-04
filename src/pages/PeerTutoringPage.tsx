import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { EditorialPanel } from '../components/ui/editorial/EditorialPanel';
import { EditorialPill } from '../components/ui/editorial/EditorialPill';
import { EditorialHeader } from '../components/ui/editorial/EditorialHeader';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Users,
  Star,
  Clock,
  Calendar,
  Search,
  Plus,
  MapPin,
  MessageCircle,
  Award,
  Target,
  CheckCircle,
  Crown,
  Gift,
  Shield,
  UserPlus
} from 'lucide-react';

export const PeerTutoringPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [userPoints, setUserPoints] = useState(150);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const tutors = [
    {
      id: '1',
      name: 'Sarah Namuli',
      class: 'Senior 6',
      level: "A'level",
      subjects: ['Mathematics', 'Physics'],
      rating: 4.8,
      reviews: 24,
      sessions: 48,
      verified: true
    },
    {
      id: '2',
      name: 'David Musoke',
      class: 'Senior 4',
      level: "O'level",
      subjects: ['Chemistry', 'Biology'],
      rating: 4.6,
      reviews: 18,
      sessions: 32,
      verified: true
    },
    {
      id: '3',
      name: 'Grace Nakato',
      class: 'Senior 5',
      level: "A'level",
      subjects: ['English', 'Literature'],
      rating: 4.9,
      reviews: 31,
      sessions: 56,
      verified: true
    }
  ];

  const studyGroups = [
    {
      id: '1',
      name: 'UCE Mathematics Prep 2025',
      subject: 'Mathematics',
      level: "O'level",
      members: 12,
      maxMembers: 15,
      nextSession: 'Tomorrow 3:00 PM',
      description: 'Intensive preparation for UCE Mathematics exam'
    },
    {
      id: '2',
      name: 'A-level Physics Study Circle',
      subject: 'Physics',
      level: "A'level",
      members: 8,
      maxMembers: 10,
      nextSession: 'Friday 2:00 PM',
      description: 'Weekly physics problem-solving sessions'
    },
    {
      id: '3',
      name: 'Chemistry Lab Discussion',
      subject: 'Chemistry',
      level: "O'level",
      members: 10,
      maxMembers: 12,
      nextSession: 'Saturday 10:00 AM',
      description: 'Discuss lab experiments and practical chemistry'
    }
  ];

  const leaderboard = [
    { name: 'Sarah Namuli', points: 520, rank: 1 },
    { name: 'Grace Nakato', points: 285, rank: 2 },
    { name: 'John Kiwanuka', points: 375, rank: 3 },
    { name: 'David Musoke', points: 195, rank: 4 },
    { name: 'Moses Ssebunya', points: 160, rank: 5 }
  ];

  const getFilteredTutors = () => {
    return tutors.filter(tutor => {
      const matchesSearch = !searchTerm || 
        tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesSubject = selectedSubject === 'all' || tutor.subjects.includes(selectedSubject);
      const matchesLevel = selectedLevel === 'all' || tutor.level === selectedLevel;
      
      return matchesSearch && matchesSubject && matchesLevel;
    });
  };

  const getFilteredStudyGroups = () => {
    return studyGroups.filter(group => {
      const matchesSearch = !searchTerm || 
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.subject.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSubject = selectedSubject === 'all' || group.subject === selectedSubject;
      const matchesLevel = selectedLevel === 'all' || group.level === selectedLevel;
      
      return matchesSearch && matchesSubject && matchesLevel;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfaf8] flex items-center justify-center">
        <div className="animate-pulse w-12 h-12 rounded-full bg-[#f4efe2]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfaf8] font-sans pb-24 relative">
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-[0.35] pointer-events-none"
        style={{ backgroundImage: "url('/images/bg-editorial-sand.png')" }}
      />
      <div className="fixed inset-0 bg-white/60 backdrop-blur-[2px] pointer-events-none" />

      {/* Header Area */}
      <div className="relative z-10 pt-16 pb-8 border-b border-white mix-blend-multiply">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between items-start gap-4 mb-4">
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur px-4 py-2 rounded-full border border-white">
              <MapPin className="h-4 w-4 text-rose-700" />
              <span className="text-xs font-bold tracking-widest text-rose-800 uppercase">National Network</span>
            </div>
            
            <EditorialHeader level="h1" className="text-slate-800">
               Mentorship & Discourse_
            </EditorialHeader>
            <p className="text-lg text-slate-500 font-light max-w-xl leading-relaxed">
               Collaborate, teach, and learn from fellow students across Uganda.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10">
        <Tabs defaultValue="tutors" className="space-y-10">
          <TabsList className="flex overflow-x-auto hide-scrollbar w-full max-w-3xl h-auto bg-white/60 backdrop-blur-md p-2 rounded-[2rem] border border-white shadow-sm gap-2">
            <TabsTrigger 
              value="tutors" 
              className="flex-1 rounded-full py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider data-[state=active]:bg-slate-900 data-[state=active]:text-white text-slate-500 hover:bg-white/50 transition-all flex items-center justify-center gap-2"
            >
              <Users className="h-4 w-4" /> Find Mentors
            </TabsTrigger>
            <TabsTrigger 
              value="groups" 
              className="flex-1 rounded-full py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider data-[state=active]:bg-slate-900 data-[state=active]:text-white text-slate-500 hover:bg-white/50 transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="h-4 w-4" /> Study Circles
            </TabsTrigger>
            <TabsTrigger 
              value="leaderboard" 
              className="flex-1 rounded-full py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-amber-600/20 text-slate-500 hover:bg-white/50 transition-all flex items-center justify-center gap-2"
            >
              <Award className="h-4 w-4" /> Prestige
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tutors">
            <div className="space-y-8">
              
              <EditorialPanel variant="glass" radius="xl" padding="sm" className="max-w-4xl border border-white">
                <div className="flex flex-col lg:flex-row gap-4 p-2 items-center">
                  <div className="flex-1 relative w-full">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                    <input
                      placeholder="Search mentors by topic..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-[#fbfaf8]/80 border-none rounded-full py-4 pl-12 pr-6 text-sm outline-none focus:ring-2 focus:ring-slate-200 transition-all font-medium text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                  
                  <div className="hidden lg:block w-px h-8 bg-slate-200" />
                  
                  <div className="flex items-center gap-4 w-full lg:w-auto">
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="bg-[#fbfaf8]/80 rounded-full border-none px-4 py-3 text-sm font-medium text-slate-700 outline-none cursor-pointer focus:ring-0 w-full"
                    >
                      <option value="all">All Subjects</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="English">English</option>
                    </select>
                    
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="bg-[#fbfaf8]/80 rounded-full border-none px-4 py-3 text-sm font-medium text-slate-700 outline-none cursor-pointer focus:ring-0 w-full"
                    >
                      <option value="all">All Levels</option>
                      <option value="O'level">O'level</option>
                      <option value="A'level">A'level</option>
                    </select>
                  </div>
                </div>
              </EditorialPanel>

              <div className="bg-white/60 backdrop-blur border border-white p-4 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100">
                    <Gift className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Your Currency</h3>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Earn by assisting peers</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-slate-900 tracking-tight">{userPoints}</div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Points</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {getFilteredTutors().map((tutor) => (
                  <EditorialPanel key={tutor.id} variant="elevated" radius="large" className="group shadow-sm hover:shadow-xl transition-all border border-slate-100 flex flex-col h-full">
                    
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-lg font-black text-slate-400 select-none">
                         {tutor.name.charAt(0)}
                      </div>
                      <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-full border border-amber-100 shadow-sm">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        <span className="text-[10px] font-bold text-amber-900">{tutor.rating}</span>
                      </div>
                    </div>

                    <div className="flex-grow">
                      <h3 className="text-xl font-medium text-slate-900 flex items-center gap-2">
                        {tutor.name}
                        {tutor.verified && <Shield className="h-4 w-4 text-emerald-500" />}
                      </h3>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">{tutor.class} • {tutor.level}</p>
                      
                      <div className="flex flex-wrap gap-1.5 mt-6 mb-8">
                        {tutor.subjects.map((subject, index) => (
                          <span key={index} className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-1 rounded-sm">
                            {subject}
                          </span>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 pb-8 border-b border-slate-100 mix-blend-multiply">
                        <div className="bg-[#fbfaf8] p-3 rounded-xl border border-white">
                          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Metrics</div>
                          <div className="font-bold text-slate-700">{tutor.sessions} Sessions</div>
                        </div>
                        <div className="bg-[#fbfaf8] p-3 rounded-xl border border-white">
                          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Feedback</div>
                          <div className="font-bold text-slate-700">{tutor.reviews} Reviews</div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex gap-2 w-full">
                      <EditorialPill 
                        variant="primary"
                        className="flex-1 justify-center relative overflow-hidden"
                        disabled={userPoints < 20}
                      >
                        <span className="relative z-10 flex items-center gap-2 text-xs">
                          Book Slot <span className="opacity-70 font-normal ml-2">20 pts</span>
                        </span>
                      </EditorialPill>
                      <EditorialPill variant="outline" className="px-5 aspect-square flex items-center justify-center p-0">
                        <MessageCircle className="h-4 w-4 text-slate-600" />
                      </EditorialPill>
                    </div>
                  </EditorialPanel>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="groups">
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <EditorialPanel variant="glass" padding="sm" radius="full" className="flex-1 relative w-full border border-white">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    placeholder="Discover circles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent border-none py-2 pl-12 pr-6 text-sm outline-none font-medium text-slate-800 placeholder:text-slate-400"
                  />
                </EditorialPanel>
                
                <EditorialPill variant="primary" className="w-full sm:w-auto gap-2">
                  <Plus className="h-4 w-4" /> Assemble Circle
                </EditorialPill>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {getFilteredStudyGroups().map((group) => {
                  const spotsLeft = group.maxMembers - group.members;
                  
                  return (
                    <EditorialPanel key={group.id} variant="elevated" radius="large" className="group shadow-sm hover:shadow-lg transition-all border border-slate-100 flex flex-col">
                      <div className="pb-4 border-b border-slate-100 mix-blend-multiply flex items-center gap-3 mb-6">
                        <Badge variant="outline" className={`border-none px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${group.level === "O'level" ? 'bg-[#f4efe2] text-[#8e8268]' : 'bg-rose-50 text-rose-800'}`}>
                          {group.level}
                        </Badge>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{group.subject}</span>
                      </div>
                      
                      <div className="flex-grow">
                        <h3 className="text-xl font-medium text-slate-900 mb-2">{group.name}</h3>
                        <p className="text-sm text-slate-500 font-light leading-relaxed mb-8">{group.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-8">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                              <Users className="h-3.5 w-3.5 text-slate-400" />
                            </div>
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{group.members}/{group.maxMembers}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            </div>
                            <span className="text-xs font-bold text-slate-600 tracking-wide uppercase truncate w-24" title={group.nextSession}>{group.nextSession}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-slate-100 mix-blend-multiply flex gap-2">
                        {spotsLeft > 0 ? (
                          <EditorialPill variant="secondary" className="flex-1 justify-center text-xs">
                            <UserPlus className="mr-2 h-3.5 w-3.5 text-slate-400" />
                            Join • {spotsLeft} remaining
                          </EditorialPill>
                        ) : (
                          <EditorialPill variant="outline" className="flex-1 justify-center text-xs bg-slate-50 text-slate-400 cursor-not-allowed">
                            Space Filled
                          </EditorialPill>
                        )}
                      </div>
                    </EditorialPanel>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="leaderboard">
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <EditorialPanel variant="elevated" radius="large" className="border border-slate-100">
                  <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100 mix-blend-multiply">
                    <Crown className="h-6 w-6 text-amber-500" />
                    <EditorialHeader level="h3" className="text-slate-800">Top Mentors</EditorialHeader>
                  </div>
                  <div className="space-y-4">
                    {leaderboard.map((person, index) => (
                      <div key={index} className="flex items-center justify-between p-3 hover:bg-[#fbfaf8] rounded-2xl transition-colors border border-transparent hover:border-white">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border-2 border-white shadow-sm ${
                            index === 0 ? 'bg-amber-100 text-amber-700' :
                            index === 1 ? 'bg-slate-200 text-slate-600' :
                            index === 2 ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-50 text-blue-700'
                          }`}>
                            {person.rank}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 tracking-wide">{person.name}</div>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-lg">{person.points}</span>
                          <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest bg-slate-100 px-2 py-1 rounded-sm">Pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </EditorialPanel>
                
                <EditorialPanel variant="elevated" radius="large" className="border border-slate-100 bg-[#fbfaf8]">
                  <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white mix-blend-multiply">
                    <Award className="h-6 w-6 text-rose-500" />
                    <EditorialHeader level="h3" className="text-slate-800">Honor Roll</EditorialHeader>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { name: 'Bronze Standard', description: '10 seminars hosted', badge: '🥉', earned: true },
                      { name: 'Silver Standard', description: '25 high-rated sessions', badge: '🥈', earned: true },
                      { name: 'Gold Standard', description: '50 mastery sessions', badge: '🥇', earned: false },
                      { name: 'Altruist', description: 'Assisted 100 peers', badge: '🤝', earned: true }
                    ].map((achievement, index) => (
                      <div key={index} className={`text-center p-6 border rounded-3xl relative overflow-hidden flex flex-col ${
                        achievement.earned ? 'bg-white border-white shadow-sm' : 'bg-transparent border-slate-200 border-dashed opacity-60'
                      }`}>
                        {achievement.earned && <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-200 to-amber-500"/>}
                        <div className="text-4xl mb-4 drop-shadow-sm">{achievement.badge}</div>
                        <div className={`font-bold text-sm tracking-wide mb-2 ${
                          achievement.earned ? 'text-slate-900' : 'text-slate-500'
                        }`}>
                          {achievement.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-auto">
                          {achievement.description}
                        </div>
                        {achievement.earned && (
                          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center">
                            <CheckCircle className="h-3 w-3 text-emerald-500" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </EditorialPanel>
              </div>
            </div>
          </TabsContent>
        </Tabs>
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

export default PeerTutoringPage;
