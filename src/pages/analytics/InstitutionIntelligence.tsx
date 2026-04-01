import React from 'react';
import { Users, GraduationCap, Clock, BookOpen, AlertCircle, Calendar } from 'lucide-react';
import { MetricCard } from '../../components/dashboard/MetricCard';
import { AlertBanner } from '../../components/dashboard/AlertBanner';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export const InstitutionIntelligence = () => {
  // Mock Data
  const attendanceData = [
    { week: 'W1', attendance: 98 },
    { week: 'W2', attendance: 96 },
    { week: 'W3', attendance: 92 },
    { week: 'W4', attendance: 88 },
    { week: 'W5', attendance: 85 },
    { week: 'W6', attendance: 81 },
  ];

  return (
    <div className="space-y-8">
      
      {/* Smart Alerts Engine */}
      <div className="space-y-3">
        <AlertBanner 
          type="error" 
          title="Chronic Absenteeism Warning" 
          message="14 students in S2 have missed more than 3 consecutive live sessions this week."
          action={<button className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 font-medium">View List</button>}
        />
        <AlertBanner 
          type="warning" 
          title="Teacher Operations Backlog" 
          message="Marking turnaround time for Biology mid-terms has exceeded the 48-hour SLA."
        />
      </div>

      {/* Primary KPI Ribbon - Enrollment & Staffing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Students"
          value="1,240"
          trend={2.4}
          icon={<Users />}
        />
        <MetricCard
          title="Student-Teacher Ratio"
          value="31:1"
          trend={-1.2}
          trendLabel="vs last term"
          icon={<SchoolIcon />}
        />
        <MetricCard
          title="Today's Attendance"
          value="91.4%"
          trend={-4.1}
          trendLabel="vs yesterday"
          icon={<Calendar />}
        />
        <MetricCard
          title="Students Needing Intervention"
          value="42"
          trend={18.0}
          trendLabel="new this week"
          icon={<AlertCircle />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Attendance Degradation Trend */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Term Attendance Trend</h3>
            <select className="px-3 py-1 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600">
              <option>All Classes</option>
              <option>S1 Only</option>
              <option>S4 Candidates</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceData}>
                <defs>
                  <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" axisLine={false} tickLine={false} />
                <YAxis domain={['auto', 100]} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="attendance" stroke="#ef4444" fillOpacity={1} fill="url(#colorAttendance)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Finance & Parent Ops */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-400 capitalize mb-4 tracking-wider">Financial Health</h3>
            
            <div className="flex justify-between items-end mb-2">
              <span className="text-3xl font-bold text-gray-900">72%</span>
              <span className="text-sm font-medium text-amber-600">Arrears: UGX 14M</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '72%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Term 1 Fee Collection Progress</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-400 capitalize mb-4 tracking-wider">Parent Engagement</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Linked Parents</span>
                <span className="text-sm font-bold text-gray-900">840 (67%)</span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Unread Alerts</span>
                <span className="text-sm font-bold text-red-600">114</span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Weekly Summary Opens</span>
                <span className="text-sm font-bold text-gray-900">42%</span>
              </div>
            </div>
          </div>
        </div>

      </div>
      
      {/* Operational Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Academic Performance Snapshot */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg font-semibold text-gray-900">Academic Performance Gaps</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 text-red-600 rounded-md"><BookOpen className="w-4 h-4" /></div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">S4 Physics (Mechanics)</p>
                  <p className="text-xs text-gray-500">Average: 42% Mastery</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">Critical</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-md"><GraduationCap className="w-4 h-4" /></div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">S3 Chemistry (Moles)</p>
                  <p className="text-xs text-gray-500">Average: 51% Mastery</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded">Monitor</span>
            </div>
          </div>
        </div>

        {/* Teacher Operations Dashboard */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg font-semibold text-gray-900">Teacher Operations</h3>
          </div>
          <div className="p-6 space-y-4">
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">Marking Completion</span>
                <span className="text-amber-600 font-bold">84%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '84%' }}></div>
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">Lesson Publication Rate</span>
                <span className="text-green-600 font-bold">96%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '96%' }}></div>
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">Live Session Delivery</span>
                <span className="text-blue-600 font-bold">92%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper internal icon 
const SchoolIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>;
export default InstitutionIntelligence;
