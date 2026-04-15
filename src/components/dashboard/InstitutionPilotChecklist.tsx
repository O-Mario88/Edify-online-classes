import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, AlertCircle, Rocket } from 'lucide-react';
import { toast } from 'sonner';

export const InstitutionPilotChecklist: React.FC = () => {
  const [tasks, setTasks] = useState([
    { id: 'setup', label: 'Institution base infrastructure created', completed: true },
    { id: 'classes', label: 'Primary/Secondary classes configured', completed: true },
    { id: 'teachers', label: 'Teachers onboarded & verified', completed: false },
    { id: 'students', label: 'Students active & enrolled', completed: false },
    { id: 'parents', label: 'Parents linked to accounts', completed: false },
    { id: 'timetable', label: 'Timetable uploaded & verified', completed: false },
  ]);

  const [pilotStatus, setPilotStatus] = useState<'onboarding' | 'live'>('onboarding');

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const allCompleted = tasks.every(t => t.completed);

  const handleGoLive = () => {
    if (!allCompleted) {
      toast.error('Cannot go live. Please complete all pilot requirements first.');
      return;
    }
    setPilotStatus('live');
    toast.success('Institution is now marked as PILOT LIVE.');
  };

  if (pilotStatus === 'live') {
    return (
      <div className="bg-emerald-500/10 border-l-4 border-emerald-500/50 p-4 rounded-r-lg shadow-sm text-emerald-700 text-sm backdrop-blur mb-6">
        <strong className="font-bold flex items-center"><CheckCircle2 className="w-5 h-5 mr-2 text-emerald-500"/> Pilot Live Configuration Complete</strong> 
        This institution has successfully cleared all deployment checks and is actively monitored in the live pilot ring.
      </div>
    );
  }

  return (
    <Card className="border-indigo-200 bg-indigo-50/10 shadow-sm mb-6">
      <CardHeader className="pb-3 border-b border-indigo-100 bg-white/50">
        <CardTitle className="text-lg flex items-center gap-2 text-indigo-900">
          <Rocket className="w-5 h-5 text-indigo-600" />
          Pilot Operations Launch Flow
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <p className="text-sm text-slate-600 mb-4">Complete the following internal checks before engaging Live Pilot operations. These ensure data-integrity is established for reporting.</p>
        <div className="space-y-3">
          {tasks.map(task => (
            <div 
              key={task.id} 
              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-indigo-300 transition-colors"
              onClick={() => toggleTask(task.id)}
            >
              {task.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : <Circle className="w-5 h-5 text-slate-300 shrink-0" />}
              <span className={`text-sm font-medium ${task.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                {task.label}
              </span>
            </div>
          ))}
        </div>
        
        <div className="pt-4 flex justify-between items-center border-t border-indigo-100">
           <div className="flex items-center text-xs font-semibold text-slate-500">
             <AlertCircle className="w-4 h-4 mr-1 text-amber-500" /> False verification masks reporting blanks.
           </div>
           <Button 
             onClick={handleGoLive} 
             disabled={!allCompleted}
             className={`${allCompleted ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-300 cursor-not-allowed'} transition-colors`}
           >
             Lock Configuration & Go Live
           </Button>
        </div>
      </CardContent>
    </Card>
  );
};
