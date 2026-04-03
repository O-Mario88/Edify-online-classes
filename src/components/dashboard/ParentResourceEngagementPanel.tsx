import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { BookOpen, AlertCircle, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

const MOCK_CHILD_RESOURCES = [
  {
    id: 'res-1',
    title: 'Calculus: Limits summary',
    subject: 'Mathematics',
    status: 'not_started',
    timeSpent: 0,
    completion: 0,
    teacherMessage: 'Your child has not yet opened the assigned Calculus note.'
  },
  {
    id: 'vid-2',
    title: 'Biology Practical: Dissection',
    subject: 'Biology',
    status: 'in_progress',
    timeSpent: 42,
    completion: 80,
    teacherMessage: 'Great progress! Your child spent 42 minutes on the Biology revision resource this week and completed 80%.'
  },
  {
    id: 'pdf-3',
    title: 'History: Early Migrations',
    subject: 'History',
    status: 'completed',
    timeSpent: 15,
    completion: 100,
    teacherMessage: 'Your child quickly reviewed this document, but the teacher recommends revising this resource again before Friday.'
  }
];

export const ParentResourceEngagementPanel: React.FC = () => {
  return (
    <Card className="mb-8 border-indigo-100 shadow-sm bg-white">
      <CardHeader className="border-b pb-4 bg-slate-50">
        <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          Learning Materials Progress
        </CardTitle>
        <p className="text-sm text-slate-500">Track how your child is engaging with assigned reading and video materials.</p>
      </CardHeader>
      <CardContent className="p-0">
         <div className="divide-y divide-slate-100">
           {MOCK_CHILD_RESOURCES.map((resource, idx) => (
             <div key={idx} className="p-4 sm:p-6 flex flex-col md:flex-row gap-6 hover:bg-slate-50 transition-colors">
               
               <div className="md:w-1/3">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{resource.subject}</p>
                 <h4 className="font-bold text-slate-900 leading-tight">{resource.title}</h4>
                 <div className="flex items-center gap-2 mt-2">
                   {resource.status === 'not_started' && <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 text-xs">Not Started</Badge>}
                   {resource.status === 'in_progress' && <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 text-xs">In Progress</Badge>}
                   {resource.status === 'completed' && <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-xs">Completed</Badge>}
                 </div>
               </div>

               <div className="md:w-2/3 space-y-4">
                 <div className={`p-3 rounded-lg flex gap-3 text-sm border ${
                   resource.status === 'not_started' ? 'bg-orange-50 border-orange-100 text-orange-900' :
                   resource.status === 'completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-900' :
                   'bg-indigo-50 border-indigo-100 text-indigo-900'
                 }`}>
                   <div className="shrink-0 mt-0.5">
                     {resource.status === 'not_started' && <AlertCircle className="w-4 h-4 text-orange-600" />}
                     {resource.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                     {resource.status === 'in_progress' && <TrendingUp className="w-4 h-4 text-indigo-600" />}
                   </div>
                   <p className="leading-relaxed font-medium">"{resource.teacherMessage}"</p>
                 </div>
                 
                 {resource.status !== 'not_started' && (
                   <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
                     <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded">
                       <Clock className="w-3 h-3" /> {resource.timeSpent} mins spent
                     </span>
                     <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded">
                       <CheckCircle2 className="w-3 h-3" /> {resource.completion}% complete
                     </span>
                   </div>
                 )}
               </div>

             </div>
           ))}
         </div>
      </CardContent>
    </Card>
  );
};

// Use a simple local component for Badge to keep it self-contained
const Badge: React.FC<{ children: React.ReactNode, variant?: string, className?: string }> = ({ children, className }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-semibold ${className}`}>
      {children}
    </span>
  );
};
