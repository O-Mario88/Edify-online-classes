import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, AlertOctagon, Award, MessageSquareHeart, UserCheck, CheckCircle2, FileText, Send, User } from 'lucide-react';
import { toast } from 'sonner';

const mockTimeline = [
  {
    id: 1,
    type: 'commendation',
    title: 'Science Fair Excellence',
    description: 'Awarded 50 House Points for designing an exceptional water filtration prototype.',
    staff: 'Mr. Okello (Biology)',
    date: 'Today, 10:30 AM',
    icon: <Award className="w-5 h-5 text-indigo-500" />,
    bg: 'bg-indigo-50 dark:bg-indigo-900/20'
  },
  {
    id: 2,
    type: 'private_note',
    title: 'Counseling Session: Academic Stress',
    description: 'Student expressed intense anxiety surrounding the upcoming Mathematics mock exams. Recommended peer tutoring support and granted a 3-day extension on current assignments.',
    staff: 'Mrs. Namaganda (Counselor)',
    date: 'Yesterday, 2:15 PM',
    icon: <Heart className="w-5 h-5 text-rose-500" />,
    bg: 'bg-rose-50 dark:bg-rose-900/20'
  },
  {
    id: 3,
    type: 'incident',
    title: 'Classroom Disruption',
    description: 'Repeatedly interrupted the Physics practical. Issued verbal warning. 10 Demerits assigned.',
    staff: 'Mr. Kato (Physics)',
    date: 'Mar 15, 2026',
    icon: <AlertOctagon className="w-5 h-5 text-amber-500" />,
    bg: 'bg-amber-50 dark:bg-amber-900/20'
  }
];

export function PastoralTimeline() {
  const [entryType, setEntryType] = useState('commendation');

  return (
    <div className="space-y-6">
      
      {/* Action / Entry Bar */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquareHeart className="w-5 h-5 text-teal-600" /> Secure Pastoral Logging
          </CardTitle>
          <CardDescription>Log a behavioral incident, commendation, or private counseling note.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Entry Type</label>
               <Select defaultValue="commendation" onValueChange={setEntryType}>
                 <SelectTrigger className="bg-slate-50 dark:bg-slate-950">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="commendation">Commendation / House Points</SelectItem>
                   <SelectItem value="incident">Behavioral Incident / Demerit</SelectItem>
                   <SelectItem value="counseling">Private Counseling Note</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             {entryType === 'commendation' && (
               <div className="space-y-2">
                 <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">House Points Assigned</label>
                 <Input type="number" defaultValue="10" className="bg-slate-50 dark:bg-slate-950" />
               </div>
             )}
             {entryType === 'incident' && (
               <div className="space-y-2">
                 <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Demerits Assigned</label>
                 <Input type="number" defaultValue="5" className="bg-slate-50 dark:bg-slate-950" />
               </div>
             )}
           </div>

           <div className="space-y-2">
             <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Narrative Log</label>
             <Textarea 
               rows={3} 
               placeholder="Describe the incident or reason for commendation securely..."
               className="bg-slate-50 dark:bg-slate-950 resize-none"
             />
           </div>

           <div className="flex justify-between items-center pt-2">
             <div className="text-xs text-slate-500 flex items-center gap-1">
               {entryType === 'counseling' ? (
                 <span className="text-rose-600 flex items-center gap-1 font-medium"><Heart className="w-3 h-3"/> Restricted Visibility (Counselor/Admin only)</span>
               ) : (
                 <span className="flex items-center gap-1"><UserCheck className="w-3 h-3"/> Visible to Teachers & Parents (Summarized)</span>
               )}
             </div>
             <Button 
               className="gap-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
               onClick={() => toast.success("Pastoral log securely added to the student's timeline.")}
             >
               <Send className="w-4 h-4" /> Save Entry
             </Button>
           </div>
        </CardContent>
      </Card>

      {/* Timeline View */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-slate-50/50 dark:bg-slate-900/50">
        <CardHeader>
           <CardTitle className="text-lg">Behavioral & Pastoral Timeline</CardTitle>
        </CardHeader>
        <CardContent>
           <div className="relative border-l border-slate-200 dark:border-slate-700 ml-3 space-y-8 pb-4">
             
             {mockTimeline.map((item) => (
               <div key={item.id} className="relative pl-8">
                 {/* Timeline Node */}
                 <div className="absolute -left-4 top-1 w-8 h-8 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
                   {item.icon}
                 </div>
                 
                 {/* Content block */}
                 <div className={`p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm ${item.bg}`}>
                   <div className="flex justify-between items-start mb-2">
                     <h4 className="font-bold text-slate-900 dark:text-slate-100">{item.title}</h4>
                     <Badge variant="outline" className="bg-white/50 dark:bg-black/20 text-xs">
                       {item.date}
                     </Badge>
                   </div>
                   <p className="text-sm text-slate-700 dark:text-slate-300 mb-3 leading-relaxed">
                     {item.description}
                   </p>
                   <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
                     <User className="w-3 h-3" /> Logged by: {item.staff}
                   </div>
                 </div>
               </div>
             ))}

             <div className="relative pl-8">
                <div className="absolute -left-3 top-1 w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                   <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                </div>
                <p className="text-xs text-slate-400 font-medium pt-1.5">End of timeline</p>
             </div>
           </div>
        </CardContent>
      </Card>
      
    </div>
  );
}
