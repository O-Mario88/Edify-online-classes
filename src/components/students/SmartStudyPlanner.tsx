import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Calendar, AlertTriangle, CheckCircle, Clock, Plus, X } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export interface StudyTask {
  id: string;
  title: string;
  type: 'weak_topic' | 'deadline' | 'missed_work' | 'exam_prep' | 'custom';
  subject: string;
  durationMinutes: number;
  isCompleted: boolean;
}

interface SmartStudyPlannerProps {
  dailyPlan: {
    dayOfWeek: string;
    date: string;
    tasks: StudyTask[];
  }[];
  mode?: 'interactive' | 'readonly' | 'assign';
  titleOverride?: string;
  descriptionOverride?: string;
}

export const SmartStudyPlanner: React.FC<SmartStudyPlannerProps> = ({ 
  dailyPlan, 
  mode = 'interactive',
  titleOverride,
  descriptionOverride
}) => {
  const [plans, setPlans] = useState(dailyPlan);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', subject: '', duration: 30 });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'weak_topic': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'deadline': return 'bg-red-100 text-red-800 border-red-200';
      case 'missed_work': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'exam_prep': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'custom': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'weak_topic': return <AlertTriangle className="w-3.5 h-3.5 mr-1" />;
      case 'deadline': return <Clock className="w-3.5 h-3.5 mr-1" />;
      case 'missed_work': return <AlertTriangle className="w-3.5 h-3.5 mr-1" />;
      case 'exam_prep': return <CheckCircle className="w-3.5 h-3.5 mr-1" />;
      case 'custom': return <Plus className="w-3.5 h-3.5 mr-1" />;
      default: return null;
    }
  };

  const handleToggleTask = (dayIndex: number, taskId: string) => {
    if (mode !== 'interactive') return;
    const newPlans = [...plans];
    const task = newPlans[dayIndex].tasks.find(t => t.id === taskId);
    if (task) {
      task.isCompleted = !task.isCompleted;
      setPlans(newPlans);
    }
  };

  const handleAddTask = () => {
    if (!newTask.title || !newTask.subject) return;
    const newPlans = [...plans];
    newPlans[0].tasks.push({
      id: Math.random().toString(36).substr(2, 9),
      title: newTask.title,
      type: 'custom',
      subject: newTask.subject,
      durationMinutes: newTask.duration,
      isCompleted: false
    });
    setPlans(newPlans);
    setIsAddingTask(false);
    setNewTask({ title: '', subject: '', duration: 30 });
  };

  const getDefaultTitle = () => {
    if (mode === 'readonly') return "Student Study Plan";
    if (mode === 'assign') return "Assign Study Tasks";
    return "My Study Planner";
  };

  const getDefaultDescription = () => {
    if (mode === 'readonly') return "Monitor revision tasks and completion";
    if (mode === 'assign') return "Assign manual tasks to this student's planner";
    return "Based on diagnostics & personal goals";
  };

  return (
    <Card className="h-full flex flex-col shadow-sm border-white/10 bg-white/5 backdrop-blur-md">
      <CardHeader className="bg-white/5 border-b border-white/10 pb-4">
         <div className="flex justify-between items-start">
            <div>
               <CardTitle className="text-lg flex items-center gap-2 text-slate-100">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  {titleOverride || getDefaultTitle()}
               </CardTitle>
               <CardDescription className="text-slate-400 mt-1">
                 {descriptionOverride || getDefaultDescription()}
               </CardDescription>
            </div>
            {mode !== 'readonly' && (
              <Button size="sm" variant="outline" className="border-white/20 hover:bg-white/10 text-slate-200 shadow-sm" onClick={() => setIsAddingTask(!isAddingTask)}>
                <Plus className="w-4 h-4 mr-1" /> {mode === 'assign' ? 'Assign Task' : 'Add Task'}
              </Button>
            )}
         </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="divide-y divide-white/10 flex-1 flex flex-col">
           {isAddingTask && mode !== 'readonly' && (
             <div className="p-4 bg-white/5">
               <div className="flex justify-between items-center mb-2">
                 <h4 className="text-sm font-bold text-slate-100">{mode === 'assign' ? 'Assign Custom Task' : 'Create Custom Task'}</h4>
                 <button onClick={() => setIsAddingTask(false)} className="text-slate-400 hover:text-red-500"><X className="w-4 h-4"/></button>
               </div>
               <div className="space-y-3">
                 <input 
                   placeholder="Task description (e.g. Read Chapter 5)" 
                   className="w-full text-sm p-2 border border-white/20 rounded-md bg-white/10 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
                   value={newTask.title}
                   onChange={e => setNewTask({...newTask, title: e.target.value})}
                 />
                 <div className="flex gap-2">
                   <input 
                     placeholder="Subject" 
                     className="w-1/2 text-sm p-2 border border-white/20 rounded-md bg-white/10 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
                     value={newTask.subject}
                     onChange={e => setNewTask({...newTask, subject: e.target.value})}
                   />
                   <input 
                     type="number"
                     placeholder="Mins" 
                     className="w-1/2 text-sm p-2 border border-white/20 rounded-md bg-white/10 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
                     value={newTask.duration}
                     onChange={e => setNewTask({...newTask, duration: Number(e.target.value)})}
                   />
                 </div>
                 <Button className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-sm" size="sm" onClick={handleAddTask}>
                   {mode === 'assign' ? 'Push to Student Plan' : "Save to Today's Plan"}
                 </Button>
               </div>
             </div>
           )}

           {plans.map((day, idx) => {
              const isToday = idx === 0;
              return (
                 <div key={day.date} className={`p-4 ${isToday ? 'bg-blue-900/10' : ''}`}>
                    <div className="flex items-end gap-2 mb-3">
                       <span className={`font-bold ${isToday ? 'text-blue-300' : 'text-slate-300'}`}>
                         {isToday ? 'Today' : day.dayOfWeek}
                       </span>
                       <span className="text-xs text-slate-400 mb-0.5">{day.date}</span>
                    </div>

                    <div className="space-y-2">
                       {day.tasks.length === 0 ? (
                         <p className="text-sm text-slate-400 italic">Rest day scheduled.</p>
                       ) : (
                         day.tasks.map(task => (
                           <div key={task.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${task.isCompleted ? 'bg-white/5 border-white/5 opacity-60' : 'bg-white/10 border-white/10 shadow-sm'} ${mode === 'interactive' && !task.isCompleted ? 'hover:border-indigo-400/30 cursor-pointer' : ''}`} onClick={() => mode === 'interactive' && handleToggleTask(idx, task.id)}>
                              <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${task.isCompleted ? 'bg-green-500 border-green-500 text-white' : 'border-slate-500'}`}>
                                 {task.isCompleted && <CheckCircle className="w-3.5 h-3.5" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className={`text-sm font-semibold truncate ${task.isCompleted ? 'line-through text-slate-500' : 'text-slate-100'}`}>{task.title}</p>
                                 <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                    <Badge variant="outline" className={`text-[10px] uppercase font-bold py-0 ${getTypeColor(task.type)}`}>
                                      {getIconForType(task.type)} {task.type.replace('_', ' ')}
                                    </Badge>
                                    <span className="text-xs text-slate-400 font-medium">{task.subject}</span>
                                    <span className="text-xs text-slate-500 flex items-center"><Clock className="w-3 h-3 mr-0.5"/> {task.durationMinutes}m</span>
                                 </div>
                              </div>
                           </div>
                         ))
                       )}
                    </div>
                 </div>
              );
           })}
        </div>
      </CardContent>
    </Card>
  );
};
