import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck, BookOpen, GraduationCap, X, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';

export function TeacherAssignmentManager() {
  const [selectedClass, setSelectedClass] = useState('Senior 3');
  
  // Mock data representing current teachers and assignments
  const teachers = [
    { id: '1', name: 'Peter Kato', specialty: 'Physics, Mathematics' },
    { id: '2', name: 'Sarah Musa', specialty: 'Geography, History' },
    { id: '3', name: 'James Okot', specialty: 'English Literature' },
    { id: '4', name: 'Jane Nakato', specialty: 'Biology, Chemistry' },
  ];

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Geography'];

  const [assignments, setAssignments] = useState<Record<string, string>>({
    'Mathematics': '1', // Peter Kato teaches Math
    'Physics': '1',     // Peter Kato teaches Physics
    'Geography': '2',   // Sarah Musa teaches Geography
  });

  const handleAssign = (subject: string, teacherId: string) => {
    setAssignments({
      ...assignments,
      [subject]: teacherId
    });
    toast.success(`Teacher successfully assigned to ${subject} for ${selectedClass}.`);
  };

  const removeAssignment = (subject: string) => {
    const newAssignments = { ...assignments };
    delete newAssignments[subject];
    setAssignments(newAssignments);
    toast.info(`Assignment removed for ${subject}.`);
  };

  return (
    <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 mt-6">
      <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
          <div>
             <CardTitle className="flex items-center gap-2">
               <LayoutGrid className="w-5 h-5 text-indigo-800" /> Subject & Teacher Allocation
             </CardTitle>
             <CardDescription>Assign teaching staff to specific subjects and classes to build the master academic roster.</CardDescription>
          </div>
          <Select defaultValue={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-[180px] bg-white dark:bg-slate-950 font-medium">
              <GraduationCap className="w-4 h-4 mr-2 text-slate-700" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Senior 1">Senior 1</SelectItem>
              <SelectItem value="Senior 2">Senior 2</SelectItem>
              <SelectItem value="Senior 3">Senior 3</SelectItem>
              <SelectItem value="Senior 4">Senior 4</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800 border-b border-slate-100 dark:border-slate-800">
           {subjects.map((subject) => {
             const assignedTeacherId = assignments[subject];
             const assignedTeacher = teachers.find(t => t.id === assignedTeacherId);

             return (
               <div key={subject} className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`p-2 rounded-lg ${assignedTeacher ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800'}`}>
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{subject}</h3>
                  </div>

                  {assignedTeacher ? (
                    <div className="flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl p-3">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                           {assignedTeacher.name.charAt(0)}
                         </div>
                         <div>
                           <p className="text-sm font-bold text-slate-900 dark:text-white">{assignedTeacher.name}</p>
                           <p className="text-xs text-slate-700 dark:text-slate-800 truncate w-24 sm:w-32">{assignedTeacher.specialty}</p>
                         </div>
                       </div>
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         className="text-slate-800 hover:text-red-700 hover:bg-red-50 rounded-full h-8 w-8"
                         onClick={() => removeAssignment(subject)}
                       >
                         <X className="w-4 h-4" />
                       </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Select onValueChange={(val) => handleAssign(subject, val)}>
                        <SelectTrigger className="w-full bg-white dark:bg-slate-950 border-dashed border-slate-300 dark:border-slate-700 text-slate-700">
                          <SelectValue placeholder="Assign a teacher..." />
                        </SelectTrigger>
                        <SelectContent>
                          {teachers.map(t => (
                            <SelectItem key={t.id} value={t.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{t.name}</span>
                                <span className="text-xs text-slate-800 ml-2">({t.specialty.split(',')[0]})</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
               </div>
             );
           })}
        </div>
      </CardContent>
    </Card>
  );
}
