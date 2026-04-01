import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading peer learning platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span className="text-blue-600 font-medium">Uganda Peer Learning Network</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Peer Tutoring & Study Groups</h1>
          <p className="text-lg text-gray-600">
            Learn from and teach fellow students across Uganda's secondary education system
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="tutors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tutors" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Find Tutors
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Study Groups
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Community
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tutors">
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tutors by name, subject, or specialization..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Levels</option>
                    <option value="O'level">O'level</option>
                    <option value="A'level">A'level</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Gift className="h-5 w-5 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-blue-900">Your Learning Points</h3>
                      <p className="text-sm text-blue-700">Earn points by helping others, spend them on tutoring</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{userPoints}</div>
                    <p className="text-sm text-blue-700">points available</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredTutors().map((tutor) => (
                  <Card key={tutor.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {tutor.name}
                        {tutor.verified && (
                          <Shield className="h-4 w-4 text-blue-500" />
                        )}
                      </CardTitle>
                      <p className="text-sm text-gray-600">{tutor.class} • {tutor.level}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm font-medium">{tutor.rating}</span>
                        <span className="text-sm text-gray-500">({tutor.reviews} reviews)</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Subjects:</h4>
                          <div className="flex flex-wrap gap-1">
                            {tutor.subjects.map((subject, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {subject}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-bold text-green-600">{tutor.sessions}</div>
                            <div className="text-xs text-gray-600">Sessions</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-bold text-blue-600">{tutor.rating}</div>
                            <div className="text-xs text-gray-600">Rating</div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="flex-1"
                            disabled={userPoints < 20}
                          >
                            <Calendar className="mr-1 h-3 w-3" />
                            Book Session (20 pts)
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="groups">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex-1 relative mr-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search study groups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Group
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getFilteredStudyGroups().map((group) => {
                  const spotsLeft = group.maxMembers - group.members;
                  
                  return (
                    <Card key={group.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {group.name}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <Badge variant={group.level === "O'level" ? 'default' : 'secondary'}>
                            {group.level}
                          </Badge>
                          <span>{group.subject}</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <p className="text-sm text-gray-600">{group.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-500" />
                              <span>{group.members}/{group.maxMembers} members</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span>{group.nextSession}</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            {spotsLeft > 0 ? (
                              <Button size="sm" className="flex-1">
                                <UserPlus className="mr-1 h-3 w-3" />
                                Join Group ({spotsLeft} spots left)
                              </Button>
                            ) : (
                              <Button size="sm" className="flex-1" disabled>
                                Group Full
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="leaderboard">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-yellow-500" />
                      Top Contributors This Month
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {leaderboard.map((person, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0 ? 'bg-yellow-100 text-yellow-800' :
                              index === 1 ? 'bg-gray-100 text-gray-800' :
                              index === 2 ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {person.rank}
                            </div>
                            <div>
                              <div className="font-medium">{person.name}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-blue-600">{person.points}</div>
                            <div className="text-xs text-gray-600">points</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-purple-500" />
                      Achievement Badges
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { name: 'Bronze Tutor', description: '10 sessions completed', badge: '🥉', earned: true },
                        { name: 'Silver Tutor', description: '25 sessions with 4.5+ rating', badge: '🥈', earned: true },
                        { name: 'Gold Tutor', description: '50 sessions with 4.8+ rating', badge: '🥇', earned: false },
                        { name: 'Community Helper', description: 'Help 100 students in forums', badge: '🤝', earned: true }
                      ].map((achievement, index) => (
                        <div key={index} className={`text-center p-4 border rounded-lg ${
                          achievement.earned ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="text-2xl mb-2">{achievement.badge}</div>
                          <div className={`font-medium text-sm ${
                            achievement.earned ? 'text-yellow-800' : 'text-gray-600'
                          }`}>
                            {achievement.name}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {achievement.description}
                          </div>
                          {achievement.earned && (
                            <CheckCircle className="h-4 w-4 text-green-500 mx-auto mt-2" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PeerTutoringPage;
