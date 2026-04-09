import React, { useState, useEffect } from 'react';
import { 
  Building, BookOpen, AlertCircle, CheckCircle2, 
  TrendingUp, Activity, Users, FileText, Upload
} from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '@/lib/apiClient';

interface HealthData {
  score: number;
  institution_name: string;
  student_count: number;
  teacher_count: number;
  status_label: string;
  attendance_pct: number;
  teacher_activity_pct: number;
  resource_engagement_pct: number;
  parent_involvement_pct: number;
  ai_insight: string;
}

const DEFAULT_HEALTH: HealthData = {
  score: 88.5,
  institution_name: 'Kampala Standard High',
  student_count: 450,
  teacher_count: 32,
  status_label: 'Highly Active',
  attendance_pct: 92,
  teacher_activity_pct: 84,
  resource_engagement_pct: 76,
  parent_involvement_pct: 32,
  ai_insight: '"Kampala Standard High improved overall Mathematics mastery by 14% WoW after increasing targeted revision usage in upper secondary tiers. Dormancy risk is virtually zero, though Parent App engagement remains an unresolved blocker for fee collection."',
};

export default function InstitutionHealthView() {
  const [activeTab, setActiveTab] = useState<'health' | 'offline_online' | 'interventions'>('health');
  const [health, setHealth] = useState<HealthData>(DEFAULT_HEALTH);

  useEffect(() => {
    const loadHealth = async () => {
      try {
        const res = await apiClient.get(API_ENDPOINTS.INTELLIGENCE_HEALTH);
        if (res.data) {
          const d = res.data as any;
          setHealth({
            score: d.health_score ?? d.score ?? DEFAULT_HEALTH.score,
            institution_name: d.institution_name ?? DEFAULT_HEALTH.institution_name,
            student_count: d.student_count ?? d.total_students ?? DEFAULT_HEALTH.student_count,
            teacher_count: d.teacher_count ?? d.total_teachers ?? DEFAULT_HEALTH.teacher_count,
            status_label: d.status_label ?? d.status ?? DEFAULT_HEALTH.status_label,
            attendance_pct: d.attendance_pct ?? d.student_attendance_rate ?? DEFAULT_HEALTH.attendance_pct,
            teacher_activity_pct: d.teacher_activity_pct ?? d.teacher_activity_rate ?? DEFAULT_HEALTH.teacher_activity_pct,
            resource_engagement_pct: d.resource_engagement_pct ?? d.resource_engagement_rate ?? DEFAULT_HEALTH.resource_engagement_pct,
            parent_involvement_pct: d.parent_involvement_pct ?? d.parent_engagement_rate ?? DEFAULT_HEALTH.parent_involvement_pct,
            ai_insight: d.ai_insight ?? d.ai_story ?? DEFAULT_HEALTH.ai_insight,
          });
        }
      } catch {
        // Fallback to defaults
      }
    };
    loadHealth();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen border border-slate-100 shadow-sm rounded-lg">
      
      {/* Header Profile */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center border border-blue-200">
            <Building className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{health.institution_name}</h1>
            <div className="flex gap-4 mt-2 text-sm font-medium">
              <span className="flex items-center gap-1 text-slate-500"><Users className="w-4 h-4" /> {health.student_count} Students</span>
              <span className="flex items-center gap-1 text-slate-500"><BookOpen className="w-4 h-4" /> {health.teacher_count} Teachers</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 bg-emerald-50 border border-emerald-200 px-5 py-3 rounded-lg text-right">
          <p className="text-emerald-700 text-sm font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {health.status_label}
          </p>
          <div className="text-2xl font-black text-emerald-800">{health.score} / 100 <span className="text-sm font-medium text-emerald-600">Health</span></div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-6">
        <button 
          onClick={() => setActiveTab('health')}
          className={`pb-3 font-semibold text-sm border-b-2 transition-all ${activeTab === 'health' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Overall Health Profile
        </button>
        <button 
          onClick={() => setActiveTab('offline_online')}
          className={`pb-3 font-semibold text-sm border-b-2 transition-all ${activeTab === 'offline_online' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Offline vs Online Performance
        </button>
        <button 
          onClick={() => setActiveTab('interventions')}
          className={`pb-3 font-semibold text-sm border-b-2 transition-all ${activeTab === 'interventions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Interventions & Impact
        </button>
      </div>

      {activeTab === 'health' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-slate-500 text-sm font-medium">Student Attendance</span>
              <span className="text-2xl font-bold text-slate-800 mt-2">{health.attendance_pct}%</span>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3"><div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${health.attendance_pct}%` }}></div></div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-slate-500 text-sm font-medium">Teacher Activity</span>
              <span className="text-2xl font-bold text-slate-800 mt-2">{health.teacher_activity_pct}%</span>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3"><div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${health.teacher_activity_pct}%` }}></div></div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-slate-500 text-sm font-medium">Resource Engagement</span>
              <span className="text-2xl font-bold text-slate-800 mt-2">{health.resource_engagement_pct}%</span>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3"><div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${health.resource_engagement_pct}%` }}></div></div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-rose-200 shadow-sm flex flex-col justify-between">
              <span className="text-slate-500 text-sm font-medium">Parent Involvement</span>
              <span className="text-2xl font-bold text-rose-600 mt-2">{health.parent_involvement_pct}%</span>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3"><div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${health.parent_involvement_pct}%` }}></div></div>
              <p className="text-xs text-rose-600 mt-2 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Critical Action Priority</p>
            </div>
          </section>

          <section className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-xl p-6 shadow-md text-white">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2"><Activity className="text-blue-200"/> AI Insight Story</h3>
                <span className="bg-blue-600/50 px-3 py-1 rounded-full text-xs font-semibold uppercase">Outcome Driver</span>
             </div>
             <p className="text-xl leading-relaxed text-blue-50 max-w-4xl">
               {health.ai_insight}
             </p>
          </section>
        </div>
      )}

      {activeTab === 'offline_online' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           
           <div className="flex justify-between items-center">
             <h2 className="text-lg font-bold text-slate-800">Academic Score Translation</h2>
             <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm">
               <Upload className="w-4 h-4"/> Bulk Upload Offline Term Results
             </button>
           </div>

           <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
             <table className="w-full text-left">
               <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                 <tr>
                   <th className="py-4 pl-6 font-semibold uppercase">Subject Area</th>
                   <th className="py-4 font-semibold uppercase">Online Mastery (Average)</th>
                   <th className="py-4 font-semibold uppercase">Latest Offline Test (BOT)</th>
                   <th className="py-4 font-semibold uppercase">Translation Delta</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 <tr className="hover:bg-slate-50">
                    <td className="py-4 pl-6 font-bold text-slate-800 flex flex-col">Mathematics <span className="font-normal text-xs text-slate-500">Sr. 4</span></td>
                    <td className="py-4 font-medium text-slate-600 text-lg">72%</td>
                    <td className="py-4 font-medium text-slate-600 text-lg">68%</td>
                    <td className="py-4 font-bold text-rose-500">-4%</td>
                 </tr>
                 <tr className="hover:bg-slate-50">
                    <td className="py-4 pl-6 font-bold text-slate-800 flex flex-col">Biology <span className="font-normal text-xs text-slate-500">Sr. 4</span></td>
                    <td className="py-4 font-medium text-slate-600 text-lg">65%</td>
                    <td className="py-4 font-medium text-slate-600 text-lg">74%</td>
                    <td className="py-4 font-bold text-emerald-600">+9%</td>
                 </tr>
               </tbody>
             </table>
           </div>

           <div className="bg-slate-100 border border-slate-200 rounded-xl p-5 mt-4">
              <h3 className="text-sm font-bold text-slate-700 mb-2">Translation Warning:</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Students are mastering Mathematics online concepts rapidly, but this is translating poorly into the physical BOT 1 written exams. Consider reinforcing long-form written mathematical exercises rather than online multiple choice.</p>
           </div>

        </div>
      )}

      {activeTab === 'interventions' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-16">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700">Intervention Effectiveness View</h3>
            <p className="text-slate-500 max-w-md mx-auto">This dashboard integrates the Intervention ROI metrics, tracking how specific teacher interventions translated into direct physical score lifts.</p>
            <div className="mt-6 flex justify-center gap-4">
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-xl text-center shadow-sm">
                   <div className="text-sm font-semibold uppercase tracking-wide opacity-80">Highest ROI Strategy</div>
                   <div className="text-xl font-bold mt-1">Peer Tutoring Pairing</div>
                   <div className="text-sm font-medium mt-1 text-emerald-600">+ 18% offline score lift</div>
                </div>
                <div className="bg-rose-50 border border-rose-200 text-rose-800 px-6 py-4 rounded-xl text-center shadow-sm">
                   <div className="text-sm font-semibold uppercase tracking-wide opacity-80">Lowest ROI Strategy</div>
                   <div className="text-xl font-bold mt-1">Parent SMS Alerts</div>
                   <div className="text-sm font-medium mt-1 text-rose-600">- 2% offline score change</div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}
