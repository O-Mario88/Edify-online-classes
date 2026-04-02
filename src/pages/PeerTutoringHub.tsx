import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MapPin, Star, GraduationCap, Video, Users, CheckCircle, Flame, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const mockTutoringRequests = [
  { id: 1, student: 'Sarah Namubiru', subject: 'S3 Mathematics', topic: 'Quadratic Equations', urgency: 'High', points: 50 },
  { id: 2, student: 'David Lwanga', subject: 'S4 Physics', topic: 'Circular Motion', urgency: 'Medium', points: 30 },
];

const mockTeacherDirected = [
  { id: 101, teacher: 'Mr. Sekabira', subject: 'A-Level Math', topic: 'Calculus: Limits & Continuity', urgency: 'Institutional Intervention', points: 150, assignedStudents: 14 }
];

export default function PeerTutoringHub() {
  const [activeTab, setActiveTab] = useState('find-tutor');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-20 w-40 h-40 bg-indigo-900/40 rounded-full blur-2xl -mb-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white">
            <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
              <Users className="w-8 h-8 opacity-80" /> Peer Tutoring Network
            </h1>
            <p className="text-blue-100 text-lg max-w-xl">
              Learn from top-performing students or share your own expertise to earn Platform Reputation Points.
            </p>
          </div>
          <div className="flex gap-4">
             <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl p-4 text-center text-white">
                <div className="flex items-center justify-center gap-2 text-amber-300">
                  <Flame className="w-5 h-5" />
                  <span className="text-3xl font-bold">120</span>
                </div>
                <span className="text-xs font-medium uppercase tracking-wider opacity-80">Reputation Points</span>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <Tabs defaultValue="find-tutor" onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 w-full md:w-auto h-auto rounded-xl">
            <TabsTrigger value="find-tutor" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:text-blue-400">
              Find a Tutor
            </TabsTrigger>
            <TabsTrigger value="become-tutor" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/30 dark:data-[state=active]:text-indigo-400">
              Accept Bounties (Earn)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="find-tutor" className="space-y-6 mt-0">
             
             {/* Action Bar */}
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="relative w-full md:w-96">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input className="pl-10 h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" placeholder="Search for subjects or topics..." />
                </div>
                <Button className="h-12 w-full md:w-auto gap-2 bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-5 h-5" /> Post Help Bounty
                </Button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <Card className="border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                 <div className="h-2 w-full bg-green-500"></div>
                 <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-3 items-center">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-500">M</div>
                        <div>
                          <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Martin K.</h3>
                          <div className="flex items-center text-sm text-slate-500 gap-1">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> 4.9 (42 sessions)
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3 mb-6">
                      <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800">Mathematics</Badge>
                      <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 ml-2">Physics</Badge>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        I topped the S4 Mock exams in Central region. I heavily specialize in organic chemistry and circular motion mechanics.
                      </p>
                    </div>
                    <Button className="w-full gap-2 border-slate-200 dark:border-slate-800" variant="outline" onClick={() => toast.success("Match request sent to Martin!")}>
                      <Video className="w-4 h-4" /> Request Session
                    </Button>
                 </CardContent>
               </Card>
               
               <Card className="border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                 <div className="h-2 w-full bg-blue-500"></div>
                 <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-3 items-center">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-500">J</div>
                        <div>
                          <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Juliet N.</h3>
                          <div className="flex items-center text-sm text-slate-500 gap-1">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> 4.7 (18 sessions)
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3 mb-6">
                      <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800">English Literature</Badge>
                      <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 ml-2">History</Badge>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        Happy to review essays and debate NCDC literature set books. Free on weekends!
                      </p>
                    </div>
                    <Button className="w-full gap-2 border-slate-200 dark:border-slate-800" variant="outline" onClick={() => toast.success("Match request sent to Juliet!")}>
                      <Video className="w-4 h-4" /> Request Session
                    </Button>
                 </CardContent>
               </Card>

             </div>
          </TabsContent>

          <TabsContent value="become-tutor" className="space-y-6 mt-0">
             
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
               <Star className="w-5 h-5 text-indigo-600" /> Teacher-Assigned Interventions
            </h2>
            <p className="text-sm text-slate-500 mb-4">You have been selected by your teachers to lead these peer recovery sessions based on your mastery score.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {mockTeacherDirected.map(req => (
                <Card key={req.id} className="border-indigo-200 dark:border-indigo-800 shadow-md bg-indigo-50/50 dark:bg-indigo-900/20">
                  <CardHeader className="pb-3 border-b border-indigo-100 dark:border-indigo-800/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant="outline" className="mb-2 bg-indigo-100 text-indigo-800 border-none dark:bg-indigo-900 dark:text-indigo-200">
                          {req.subject}
                        </Badge>
                        <CardTitle className="text-lg text-indigo-950 dark:text-indigo-100">{req.topic}</CardTitle>
                      </div>
                      <div className="flex flex-col items-center justify-center bg-indigo-100 dark:bg-indigo-900 px-3 py-1.5 rounded-lg">
                        <Flame className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mb-0.5" />
                        <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">+{req.points}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                      Assigned by <span className="font-medium text-slate-900 dark:text-slate-300">{req.teacher}</span> for <span className="font-bold text-red-600">{req.assignedStudents} struggling students</span>.
                    </p>
                    <Button 
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                      onClick={() => toast.success(`You launched the Intervention Session. Calendar invites sent to ${req.assignedStudents} students.`)}
                    >
                      <Video className="w-4 h-4" /> Initialize Session
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="w-full h-px bg-slate-200 dark:bg-slate-800 my-8"></div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Open Community Requests (Bounties)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockTutoringRequests.map(req => (
                <Card key={req.id} className="border-slate-200 dark:border-slate-800 shadow-sm">
                  <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant="outline" className="mb-2 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                          {req.subject}
                        </Badge>
                        <CardTitle className="text-lg">{req.topic}</CardTitle>
                      </div>
                      <div className="flex flex-col items-center justify-center bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800">
                        <Flame className="w-4 h-4 text-amber-500 mb-0.5" />
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-400">+{req.points}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                      Requested by <span className="font-medium text-slate-900 dark:text-slate-300">{req.student}</span>. 
                      Urgency level is marked as <span className="font-medium text-red-600">{req.urgency}</span>.
                    </p>
                    <Button 
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                      onClick={() => toast.success(`You accepted ${req.student}'s bounty. A meet room has been created in your planner!`)}
                    >
                      <CheckCircle className="w-4 h-4" /> Accept Bounty
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
