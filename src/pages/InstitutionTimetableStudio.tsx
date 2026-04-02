import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, AlertTriangle, UserMinus, Plus, CalendarDays, ServerCrash, Search, DoorOpen, Users, MapPin } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

// Major Uganda Public Holidays (2026/Calendar Agnostic)
const UGANDA_HOLIDAYS = [
  { date: 'Jan 1', name: "New Year's Day", type: 'Statutory' },
  { date: 'Jan 26', name: 'NRM Liberation Day', type: 'National' },
  { date: 'Feb 16', name: 'Archbishop Janani Luwum Memorial Day', type: 'National' },
  { date: 'Mar 8', name: "International Women's Day", type: 'National' },
  { date: 'Mar 20*', name: 'Eid al-Fitr', type: 'Religious (Variable)' },
  { date: 'Apr 3', name: 'Good Friday', type: 'Religious' },
  { date: 'Apr 6', name: 'Easter Monday', type: 'Religious' },
  { date: 'May 1', name: 'Labour Day', type: 'Statutory' },
  { date: 'May 28*', name: 'Eid al-Adha', type: 'Religious (Variable)' },
  { date: 'Jun 3', name: "Uganda Martyrs' Day", type: 'National' },
  { date: 'Jun 9', name: "National Heroes' Day", type: 'National' },
  { date: 'Oct 9', name: 'Independence Day', type: 'National' },
  { date: 'Dec 25', name: 'Christmas Day', type: 'Religious' },
  { date: 'Dec 26', name: 'Boxing Day', type: 'Statutory' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = ['8:00 AM', '9:30 AM', '11:00 AM', '12:30 PM (Lunch)', '1:30 PM', '3:00 PM'];

const MOCK_GRID = [
  ['Math (S3-A) - Kintu', 'Physics (S4) - Kato', 'Biology (S2) - Nakato', 'LUNCH', 'English (S1) - Okot', 'Free Block'],
  ['History (S2) - Lwanga', 'Math (S3-A) - Kintu', 'Chemistry (S4) - Kato', 'LUNCH', 'Free Block', 'Biology (S2) - Nakato'],
  ['Geography - Musa', 'English (S1) - Okot', 'Physics (S4) - Kato', 'LUNCH', 'Math (S3-A) - Kintu', 'History (S2) - Lwanga'],
  ['Biology (S2) - Nakato', 'Free Block', 'History (S2) - Lwanga', 'LUNCH', 'Geography - Musa', 'Chemistry (S4) - Kato'],
  ['Physics (S4) - Kato', 'English (S1) - Okot', 'Math (S3-A) - Kintu', 'LUNCH', 'Free Block', 'Staff Meeting']
];

export function InstitutionTimetableStudio() {
  const [activeTab, setActiveTab] = useState('master-grid');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
             <CalendarDays className="w-8 h-8 text-blue-600" /> Master Timetable Studio
          </h1>
          <p className="text-slate-500 mt-1">Resolve scheduling conflicts and orchestrate teacher substitutions.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-white dark:bg-slate-900 border-slate-200">
            Export PDF
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4" /> Save Master Schedule
          </Button>
        </div>
      </div>

      <Tabs defaultValue="master-grid" onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <TabsTrigger value="master-grid">Class Allocation Grid</TabsTrigger>
          <TabsTrigger value="cover-engine" className="gap-2">
             Sub/Cover Assignments <Badge className="bg-red-500 hover:bg-red-600 border-none">1 Action Required</Badge>
          </TabsTrigger>
          <TabsTrigger value="holidays">Academic Calendar & Holidays</TabsTrigger>
          <TabsTrigger value="rooms">Room Tracker</TabsTrigger>
        </TabsList>

        <TabsContent value="master-grid" className="mt-0 space-y-4">
          <Card className="border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
             <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Weekly Period Allocation</CardTitle>
                  <Select defaultValue="s3-a">
                    <SelectTrigger className="w-[180px] bg-white dark:bg-slate-950">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="s1-a">Form 1 - A</SelectItem>
                      <SelectItem value="s2">Form 2 - Main</SelectItem>
                      <SelectItem value="s3-a">Form 3 - A</SelectItem>
                      <SelectItem value="s4">Form 4 - Candidates</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
             </CardHeader>
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                 <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                   <tr>
                     <th className="px-6 py-4 w-32 border-r border-slate-200 dark:border-slate-700">Day</th>
                     {PERIODS.map(p => (
                       <th key={p} className="px-4 py-4 text-center border-r border-slate-200 dark:border-slate-700 min-w-[150px]">
                         <span className="flex items-center justify-center gap-1"><Clock className="w-3 h-3"/> {p}</span>
                       </th>
                     ))}
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                   {DAYS.map((day, rowIndex) => (
                     <tr key={day} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                       <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                         {day}
                       </td>
                       {MOCK_GRID[rowIndex].map((cell, colIndex) => (
                         <td key={colIndex} className={`px-4 py-3 text-center border-r border-slate-200 dark:border-slate-700 ${cell === 'LUNCH' ? 'bg-slate-100 dark:bg-slate-900/80 font-bold text-slate-400' : 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}>
                           {cell === 'LUNCH' ? (
                             <span>Break</span>
                           ) : cell === 'Free Block' ? (
                             <span className="text-slate-400 italic">Unassigned</span>
                           ) : (
                             <div className="flex flex-col items-center justify-center space-y-1">
                               <Badge variant="outline" className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 font-normal">
                                 {cell.split(' - ')[0]}
                               </Badge>
                               <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center">
                                  <Users className="w-3 h-3 mr-1 text-slate-400"/> {cell.split(' - ')[1]}
                               </span>
                             </div>
                           )}
                         </td>
                       ))}
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </Card>
        </TabsContent>

        <TabsContent value="cover-engine" className="mt-0">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 space-y-4">
                 <Card className="border border-red-200 dark:border-red-900/30 shadow-sm bg-red-50/50 dark:bg-red-900/10">
                   <CardHeader className="pb-3 border-b border-red-100 dark:border-red-900/20">
                     <CardTitle className="text-red-800 dark:text-red-400 flex items-center gap-2">
                       <UserMinus className="w-5 h-5" /> Absent Teacher Alert
                     </CardTitle>
                   </CardHeader>
                   <CardContent className="pt-4 space-y-4">
                      
                      <div className="flex items-start justify-between p-4 bg-white dark:bg-slate-950 border border-red-100 dark:border-red-900/30 rounded-xl shadow-sm">
                         <div className="flex gap-4">
                           <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 font-bold text-lg">
                             P
                           </div>
                           <div>
                             <h4 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Peter Kato</h4>
                             <p className="text-sm text-slate-500 mb-2">Subject: Physics • Status: Medical Leave</p>
                             
                             <div className="space-y-2 mt-4">
                               <p className="text-xs font-semibold uppercase text-slate-400">Impacted Blocks Today</p>
                               <div className="flex gap-2 flex-wrap">
                                 <Badge variant="destructive" className="bg-red-500 text-white">Period 2 (S4)</Badge>
                                 <Badge variant="destructive" className="bg-red-500 text-white">Period 4 (S4)</Badge>
                               </div>
                             </div>
                           </div>
                         </div>
                         
                         <div className="w-64 space-y-3 p-3 bg-red-50/50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                           <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Assign Substitute</p>
                           <Select>
                             <SelectTrigger className="bg-white dark:bg-slate-950">
                               <SelectValue placeholder="Select available teacher" />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="okot">James Okot (Free Period 2)</SelectItem>
                               <SelectItem value="musa">Sarah Musa (Free Period 2, 4)</SelectItem>
                             </SelectContent>
                           </Select>
                           <Button 
                             className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                             onClick={() => toast.success("Cover assignment dispatched! Push notification sent to Sarah Musa.")}
                           >
                             Dispatch Cover Update
                           </Button>
                         </div>
                      </div>

                   </CardContent>
                 </Card>
              </div>

              <div className="space-y-4">
                 <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
                   <CardHeader>
                     <CardTitle className="text-lg flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        <ServerCrash className="w-5 h-5 text-amber-500" /> Conflict Engine
                     </CardTitle>
                   </CardHeader>
                   <CardContent>
                     <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-3 rounded-lg border border-green-200 dark:border-green-900/30 text-sm flex items-center gap-2">
                       All physical room allocations map correctly. No double bookings.
                     </div>
                   </CardContent>
                 </Card>
              </div>
           </div>
        </TabsContent>

        <TabsContent value="holidays" className="mt-0">
          <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
             <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
               <CardTitle className="text-lg flex items-center gap-2">
                 <MapPin className="w-5 h-5 text-indigo-500" /> Ugandan National Holidays Tracker
               </CardTitle>
               <CardDescription>
                 The Master Timetable automatically suspends class period generation on these gazetted dates.
               </CardDescription>
             </CardHeader>
             <CardContent className="p-0">
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                   <thead className="bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                     <tr>
                       <th className="px-6 py-4">Date</th>
                       <th className="px-6 py-4">Holiday</th>
                       <th className="px-6 py-4">Classification</th>
                       <th className="px-6 py-4 text-center">Timetable Status</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                     {UGANDA_HOLIDAYS.map((holiday, idx) => (
                       <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                         <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">{holiday.date}</td>
                         <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100">{holiday.name}</td>
                         <td className="px-6 py-4">
                           <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 font-normal">
                             {holiday.type}
                           </Badge>
                         </td>
                         <td className="px-6 py-4 text-center">
                           <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-none">
                             Classes Suspended
                           </Badge>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rooms" className="mt-0">
          <Card className="border border-slate-200 dark:border-slate-800 shadow-sm h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 text-slate-400">
             <div className="text-center">
               <DoorOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
               <p>Physical Resource Mapper initialized.</p>
               <p className="text-xs">Attach classroom strings strictly to subjects to avoid collisions.</p>
             </div>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
}
