import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { Shield, TrendingUp, AlertTriangle, Users, BookOpen } from "lucide-react";

const dualAttendanceData = [
  { name: 'S1', onlineAttendance: 85, offlineAttendance: 92 },
  { name: 'S2', onlineAttendance: 78, offlineAttendance: 88 },
  { name: 'S3', onlineAttendance: 65, offlineAttendance: 85 },
  { name: 'S4', onlineAttendance: 90, offlineAttendance: 95 },
  { name: 'S5', onlineAttendance: 72, offlineAttendance: 80 },
  { name: 'S6', onlineAttendance: 88, offlineAttendance: 91 },
];

const teacherPerformanceData = [
  { term: 'Term 1', ClassAverage: 62, BaselineDifficulty: 58 },
  { term: 'Term 2', ClassAverage: 65, BaselineDifficulty: 60 },
  { term: 'Term 3', ClassAverage: 71, BaselineDifficulty: 64 },
];

export function InstitutionIntelligenceHub() {
  return (
    <div className="space-y-6">
      
      {/* Risk KPI Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Critical Interventions</p>
              <div className="flex items-end gap-2 mt-1">
                <h3 className="text-3xl font-black text-red-600 dark:text-red-400">14</h3>
                <span className="text-xs text-slate-500 mb-1">Active</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Dual Attendance Discrepancy</p>
              <div className="flex items-end gap-2 mt-1">
                <h3 className="text-3xl font-black text-amber-600 dark:text-amber-400">12%</h3>
                <span className="text-xs text-slate-500 mb-1">Gap</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Institutional Success Rate</p>
              <div className="flex items-end gap-2 mt-1">
                <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400">76%</h3>
                <span className="text-xs text-slate-500 mb-1">Overall Avg</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Dual Attendance Tracking */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm col-span-1 border-t-4 border-t-blue-600">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" /> Dual Attendance Matrix
                </CardTitle>
                <CardDescription>Offline vs Online Engagement Overlap</CardDescription>
              </div>
              <Badge variant="outline" className="bg-slate-50 dark:bg-slate-900">Live Term Data</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dualAttendanceData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{fill: '#64748b'}} tickLine={false} axisLine={false} />
                  <YAxis tick={{fill: '#64748b'}} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" />
                  <Bar dataKey="offlineAttendance" name="Physical School Check-in %" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="onlineAttendance" name="Platform Live Session %" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Teacher Performance Fairness Baseline */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm col-span-1 border-t-4 border-t-emerald-600">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-600" /> Pedagogical Performance Snapshots
                </CardTitle>
                <CardDescription>Faculty Output scaled against Cohort Baseline</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={teacherPerformanceData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="term" tick={{fill: '#64748b'}} tickLine={false} axisLine={false} />
                  <YAxis tick={{fill: '#64748b'}} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" />
                  <Line type="monotone" dataKey="BaselineDifficulty" name="Cohort Baseline Difficulty %" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  <Line type="monotone" dataKey="ClassAverage" name="Teacher Generated Output %" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
