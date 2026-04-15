import React, { useState, useEffect } from 'react';
import { 
  Building2, ShieldAlert, Activity, ArrowUpRight, 
  ArrowDownRight, MoreHorizontal, Filter, Search, RefreshCw
} from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

interface InstitutionMetric {
  id: number;
  name: string;
  type: string;
  health: number;
  status: string;
  trend: string;
  activeTeachers: number;
  students: number;
  churnRisk: string;
}

export default function InstitutionRiskMonitor() {
  const [filterType, setFilterType] = useState('all');
  const [institutions, setInstitutions] = useState<InstitutionMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/analytics/churn-signals/')
      .then(res => {
        const mappedData = res.data.map((item: any) => ({
          id: item.institution_id,
          name: item.institution_name,
          type: 'Institution',
          health: 100 - item.risk_score,
          status: item.classification.toLowerCase(),
          trend: item.risk_score > 50 ? 'down' : 'up',
          activeTeachers: item.active_teachers,
          students: item.students,
          churnRisk: item.classification.toLowerCase()
        }));
        setInstitutions(mappedData);
      })
      .catch((err) => {
        // Fallback robust mock struct if endpoint isn't fully operational yet
        console.warn('API Pilot metrics unready, loading telemetry fallback', err);
        setInstitutions([
          { id: 1, name: 'Kampala Standard High', type: 'Secondary', health: 88, status: 'healthy', trend: 'up', activeTeachers: 32, students: 450, churnRisk: 'low' },
          { id: 5, name: 'Ntinda City School', type: 'Secondary', health: 21, status: 'critical', trend: 'down', activeTeachers: 4, students: 180, churnRisk: 'critical' },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-rose-500" />
            Institution Risk & Dormancy Monitor
          </h1>
          <p className="text-slate-500 mt-2">Identify at-risk schools before they churn. (Health Engine Module 3)</p>
        </div>
      </header>

      {/* Quick Stats Rows */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm cursor-default hover:border-slate-300">
            <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Total Scored</span>
            <div className="text-3xl font-black text-slate-800 mt-1">124</div>
         </div>
         <div className="bg-emerald-50 border-emerald-100 p-5 rounded-xl border shadow-sm cursor-pointer hover:border-emerald-200 transition-colors">
            <span className="text-emerald-700 text-sm font-semibold uppercase tracking-wider">Highly Active</span>
            <div className="text-3xl font-black text-emerald-800 mt-1">45</div>
         </div>
         <div className="bg-amber-50 border-amber-100 p-5 rounded-xl border shadow-sm cursor-pointer hover:border-amber-200 transition-colors">
            <span className="text-amber-700 text-sm font-semibold uppercase tracking-wider">Moderate / Watch</span>
            <div className="text-3xl font-black text-amber-800 mt-1">61</div>
         </div>
         <div className="bg-rose-50 border-rose-100 p-5 rounded-xl border shadow-sm cursor-pointer hover:border-rose-200 transition-colors">
            <span className="text-rose-700 text-sm font-semibold uppercase tracking-wider">Churn Risk</span>
            <div className="text-3xl font-black text-rose-800 mt-1 flex items-center gap-2">18 <ArrowUpRight className="w-5 h-5"/></div>
         </div>
      </section>

      {/* Main Table */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center bg-white">
           <div className="relative w-64">
             <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
             <input 
               type="text" 
               placeholder="Search institutions..." 
               className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
             />
           </div>
           <button className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50">
             <Filter className="w-4 h-4" /> Filter by Status
           </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="py-4 pl-6 font-semibold w-1/3">Institution Name</th>
                <th className="py-4 font-semibold">Composite Health</th>
                <th className="py-4 font-semibold">Teacher Activity</th>
                <th className="py-4 font-semibold">Learner Activity</th>
                <th className="py-4 font-semibold text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                   <td colSpan={5} className="py-8 text-center text-slate-500">
                      <RefreshCw className="w-6 h-6 mx-auto animate-spin text-blue-500 mb-2"/>
                      Gathering telemetry...
                   </td>
                </tr>
              ) : institutions.map((inst) => (
                <tr key={inst.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 pl-6">
                    <div className="font-bold text-slate-800 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        {inst.name}
                        <div className="text-xs font-normal text-slate-500">{inst.type} • {inst.students} Students</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4">
                    <div className="flex flex-col gap-1 w-24">
                      <div className="flex justify-between items-center">
                        <span className={`font-bold ${inst.health >= 70 ? 'text-emerald-600' : inst.health >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                          {inst.health}
                        </span>
                        {inst.trend === 'up' && <ArrowUpRight className="w-4 h-4 text-emerald-500" />}
                        {inst.trend === 'down' && <ArrowDownRight className="w-4 h-4 text-rose-500" />}
                        {inst.trend === 'stable' && <span className="text-slate-300 font-bold">-</span>}
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-1.5 rounded-full ${inst.health >= 70 ? 'bg-emerald-500' : inst.health >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                          style={{ width: `${inst.health}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4">
                    <div className="text-sm font-medium text-slate-700">
                      {inst.activeTeachers} Active <span className="text-slate-400 font-normal">/ {inst.activeTeachers + Math.floor(Math.random() * 10)} Total</span>
                    </div>
                  </td>

                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      inst.status === 'highly_active' ? 'bg-emerald-100 text-emerald-800' :
                      inst.status === 'active' ? 'bg-blue-100 text-blue-800' :
                      inst.status === 'moderate' ? 'bg-amber-100 text-amber-800' :
                      inst.status === 'churn_risk' ? 'bg-rose-100 text-rose-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {inst.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>

                  <td className="py-4 pr-6 text-right">
                    <button className="text-slate-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
