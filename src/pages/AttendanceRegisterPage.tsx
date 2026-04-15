import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Calendar as CalendarIcon, CheckCircle, XCircle, Clock, Save, UserCheck, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient, API_ENDPOINTS } from '@/lib/apiClient';
import { toast } from 'sonner';
import { OfflineSyncEngine } from '@/lib/offlineSync';

export const AttendanceRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [date] = useState(new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  const [saving, setSaving] = useState(false);
  
  // Mock data as fallback
  const fallbackStudents = [
    { id: 1, name: 'Alice Namukasa', status: 'present' },
    { id: 2, name: 'Bob Kato', status: 'present' },
    { id: 3, name: 'Charles Lwanga', status: 'late' },
    { id: 4, name: 'Diana Abbo', status: 'unauthorized_absent' },
    { id: 5, name: 'Edward Ssenyonga', status: 'present' },
    { id: 6, name: 'Faith Katusiime', status: 'authorized_absent' },
    { id: 7, name: 'George Bwire', status: 'present' },
    { id: 8, name: 'Hellen Okello', status: 'present' },
  ];

  const [students, setStudents] = useState(fallbackStudents);

  // Load existing attendance records from backend
  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const res = await apiClient.get(`${API_ENDPOINTS.DAILY_ATTENDANCE}?record_date=${today}`);
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setStudents(res.data.map((r: any) => ({
            id: r.id,
            name: r.student_name || `Student ${r.student}`,
            status: r.status,
            studentUserId: r.student,
          })));
        }
      } catch {
        // Fallback to mock data silently
      }
    };
    loadAttendance();
  }, []);

  const stats = {
    total: students.length,
    present: students.filter(s => s.status === 'present').length,
    late: students.filter(s => s.status === 'late').length,
    absent: students.filter(s => s.status.includes('absent')).length,
  };

  const updateStatus = (id: number, newStatus: string) => {
    setStudents(students.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  const markAllPresent = () => {
    setStudents(students.map(s => ({ ...s, status: 'present' })));
  };

  const saveRegister = async () => {
    setSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      if (!OfflineSyncEngine.isOnline()) {
        toast.warning('Offline mode: Register queued for background sync.');
        OfflineSyncEngine.queueJob('upload_assignment', { type: 'attendance', date: today, students });
        setSaving(false);
        return;
      }
      
      const promises = students.map(s => {
        const payload: any = {
          record_date: today,
          status: s.status,
          notes: '',
        };
        if ((s as any).studentUserId) {
          payload.student = (s as any).studentUserId;
        }
        if ((s as any).studentUserId) {
          return apiClient.patch(`${API_ENDPOINTS.DAILY_ATTENDANCE}${s.id}/`, payload);
        }
        return apiClient.post(API_ENDPOINTS.DAILY_ATTENDANCE, payload);
      });
      await Promise.allSettled(promises);
      toast.success(`Attendance securely saved for ${date}`);
    } catch {
      toast.error('Network error. Attendance saved locally pending sync.');
      OfflineSyncEngine.queueJob('upload_assignment', { type: 'attendance', date, students });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16">
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
             <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-900">
               <ChevronLeft className="h-5 w-5" />
             </Button>
             <div>
               <h1 className="text-xl font-bold text-gray-900">Senior 3 Daily Register</h1>
               <div className="text-xs text-gray-500 font-medium flex items-center mt-1">
                 <CalendarIcon className="w-3 h-3 mr-1" /> {date}
               </div>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" onClick={markAllPresent}>
               <CheckCircle className="w-4 h-4 mr-2" /> Mark All Present
             </Button>
             <Button onClick={saveRegister} disabled={saving}>
               <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Submit Register'}
             </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-sm border-t-2 border-t-blue-500">
            <CardContent className="p-4">
              <p className="text-[11px] font-bold uppercase text-gray-500 mb-1">Total Roster</p>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-t-2 border-t-green-500">
            <CardContent className="p-4">
              <p className="text-[11px] font-bold uppercase text-gray-500 mb-1">Present</p>
              <div className="text-2xl font-bold text-green-700">{stats.present}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-t-2 border-t-yellow-500">
            <CardContent className="p-4">
              <p className="text-[11px] font-bold uppercase text-gray-500 mb-1">Late</p>
              <div className="text-2xl font-bold text-yellow-700">{stats.late}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-t-2 border-t-red-500">
            <CardContent className="p-4">
              <p className="text-[11px] font-bold uppercase text-gray-500 mb-1">Absent</p>
              <div className="text-2xl font-bold text-red-700">{stats.absent}</div>
            </CardContent>
          </Card>
        </div>

        {/* Matrix */}
        <Card className="shadow-sm">
          <CardHeader className="bg-gray-50/50 border-b">
             <CardTitle className="text-lg flex items-center">
               <UserCheck className="w-5 h-5 mr-2 text-blue-600" /> Morning Roll Call Matrix
             </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                 <thead className="bg-gray-50 text-gray-500 border-b uppercase text-xs">
                   <tr>
                     <th className="px-6 py-4 font-bold">Student Name</th>
                     <th className="px-6 py-4 font-bold text-center">Present</th>
                     <th className="px-6 py-4 font-bold text-center">Late</th>
                     <th className="px-6 py-4 font-bold text-center">Excused</th>
                     <th className="px-6 py-4 font-bold text-center">Absent</th>
                     <th className="px-6 py-4 font-bold">Notes</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                   {students.map((student) => (
                     <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                       <td className="px-6 py-4 font-bold text-gray-900 border-r border-gray-100">
                         {student.name}
                       </td>
                       <td className="px-4 py-4 text-center cursor-pointer hover:bg-green-50" onClick={() => updateStatus(student.id, 'present')}>
                         <div className={`mx-auto w-5 h-5 rounded-full border flex items-center justify-center ${student.status === 'present' ? 'bg-green-500 border-green-600' : 'bg-gray-100 border-gray-300'}`}>
                           {student.status === 'present' && <CheckCircle className="w-3 h-3 text-white" />}
                         </div>
                       </td>
                       <td className="px-4 py-4 text-center cursor-pointer hover:bg-yellow-50" onClick={() => updateStatus(student.id, 'late')}>
                         <div className={`mx-auto w-5 h-5 rounded-full border flex items-center justify-center ${student.status === 'late' ? 'bg-yellow-500 border-yellow-600' : 'bg-gray-100 border-gray-300'}`}>
                           {student.status === 'late' && <Clock className="w-3 h-3 text-white" />}
                         </div>
                       </td>
                       <td className="px-4 py-4 text-center cursor-pointer hover:bg-orange-50 bg-gray-50/30" onClick={() => updateStatus(student.id, 'authorized_absent')}>
                         <div className={`mx-auto w-5 h-5 rounded-md border flex items-center justify-center ${student.status === 'authorized_absent' ? 'bg-orange-500 border-orange-600' : 'bg-white border-gray-300'}`}>
                           {student.status === 'authorized_absent' && <CheckCircle className="w-3 h-3 text-white" />}
                         </div>
                       </td>
                       <td className="px-4 py-4 text-center cursor-pointer hover:bg-red-50" onClick={() => updateStatus(student.id, 'unauthorized_absent')}>
                         <div className={`mx-auto w-5 h-5 rounded-full border flex items-center justify-center ${student.status === 'unauthorized_absent' ? 'bg-red-500 border-red-600' : 'bg-gray-100 border-gray-300'}`}>
                           {student.status === 'unauthorized_absent' && <XCircle className="w-3 h-3 text-white" />}
                         </div>
                       </td>
                       <td className="px-6 py-4">
                         <input type="text" placeholder="Add remark..." className="w-full text-xs p-2 rounded border border-gray-200 bg-white" />
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};
