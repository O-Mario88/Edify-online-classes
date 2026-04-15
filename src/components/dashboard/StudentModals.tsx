import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Calendar, Clock, BookOpen, AlertTriangle, CheckCircle } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const StudentScheduleModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      // Simulate fetch schedule
      setTimeout(() => {
        setSchedule([
          { day: 'Monday', sessions: [{ time: '08:00 AM', subject: 'Mathematics', type: 'Live Class' }, { time: '10:00 AM', subject: 'Physics', type: 'Lab' }] },
          { day: 'Tuesday', sessions: [{ time: '09:00 AM', subject: 'Chemistry', type: 'Live Class' }] },
          { day: 'Wednesday', sessions: [{ time: '11:00 AM', subject: 'Biology', type: 'Discussion' }, { time: '02:00 PM', subject: 'English', type: 'Reading' }] }
        ]);
        setLoading(false);
      }, 600);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <CardHeader className="border-b bg-gray-50 flex justify-between flex-row items-center sticky top-0 z-10">
          <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5 text-indigo-600"/> My Weekly Timetable</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </CardHeader>
        <CardContent className="overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
          ) : schedule.length > 0 ? (
            <div className="space-y-6">
              {schedule.map((dayObj: any, idx: number) => (
                <div key={idx} className="space-y-3">
                  <h4 className="font-bold text-gray-900 border-b pb-1">{dayObj.day}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dayObj.sessions.map((session: any, sIdx: number) => (
                      <div key={sIdx} className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg flex items-center gap-3">
                        <div className="bg-white p-2 rounded-md shadow-sm text-indigo-700">
                          <Clock className="w-4 h-4"/>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 leading-tight">{session.subject}</p>
                          <p className="text-xs text-gray-600">{session.time} • {session.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No scheduled sessions found for this week.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export const OverdueTasksModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setTimeout(() => {
        setTasks([
          { id: '1', title: 'Calculus Assignment 4', subject: 'Mathematics', daysOverdue: 2 },
          { id: '2', title: 'Cell Division Lab Report', subject: 'Biology', daysOverdue: 5 }
        ]);
        setLoading(false);
      }, 500);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-lg bg-white shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <CardHeader className="border-b bg-rose-50 flex justify-between flex-row items-center sticky top-0 z-10">
          <CardTitle className="flex items-center gap-2 text-rose-700"><AlertTriangle className="w-5 h-5"/> Overdue Tasks</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </CardHeader>
        <CardContent className="overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div></div>
          ) : tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map((task: any, idx: number) => (
                <div key={idx} className="bg-white border border-rose-100 p-4 rounded-xl flex items-center justify-between shadow-sm hover:border-rose-300 transition-colors">
                  <div>
                    <h4 className="font-bold text-gray-900">{task.title}</h4>
                    <p className="text-xs text-gray-600">{task.subject}</p>
                    <Badge variant="outline" className="mt-2 text-rose-700 bg-rose-50 border-rose-200">
                      {task.daysOverdue} days overdue
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => {
                    onClose();
                    toast.success('Redirecting to assignment...');
                    navigate('/projects?filter=overdue');
                  }}>Review</Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-400 opacity-50" />
              <p>You have no overdue tasks! Great job.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
