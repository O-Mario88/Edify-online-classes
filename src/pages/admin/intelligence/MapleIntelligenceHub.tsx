import React, { useState } from 'react';
import { 
  Building2, Users, AlertTriangle, TrendingUp, TrendingDown,
  Activity, BookOpen, GraduationCap, ShieldAlert, HeartPulse, Brain
} from 'lucide-react';

export default function MapleIntelligenceHub() {
  const [activeTab, setActiveTab] = useState<'overview' | 'ecosystem' | 'resources'>('overview');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-600" />
            Maple Intelligence OS
          </h1>
          <p className="text-slate-500 mt-2">Platform-wide Growth, Activity, and Impact Engine</p>
        </div>
        
        <div className="flex bg-white rounded-lg p-1 shadow-sm border border-slate-200 border-b-4">
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
            onClick={() => setActiveTab('overview')}
          >
            Growth & Health Funnel
          </button>
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'ecosystem' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
            onClick={() => setActiveTab('ecosystem')}
          >
            Ecosystem Comparison
          </button>
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'resources' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
            onClick={() => setActiveTab('resources')}
          >
            Resource Impact
          </button>
        </div>
      </header>

      {/* INTELLIGENCE STORY CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-md relative overflow-hidden">
          <TrendingUp className="absolute -right-4 -top-4 w-24 h-24 text-white opacity-10" />
          <h3 className="text-blue-100 font-medium text-sm flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4" /> AI INSIGHT: GROWTH
          </h3>
          <p className="text-lg leading-relaxed font-medium">Platform showing 14% WoW independent teacher conversion growth from rural districts.</p>
        </div>
        
        <div className="bg-white border-l-4 border-amber-500 rounded-xl p-6 shadow-sm">
          <h3 className="text-amber-600 font-medium text-sm flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4" /> AI INSIGHT: CHURN RISK
          </h3>
          <p className="text-slate-700 text-lg leading-relaxed">Institution dormancy risk detected across 3 locations: Teacher assignment activity dropped by 30% in last two weeks.</p>
        </div>
        
        <div className="bg-white border-l-4 border-emerald-500 rounded-xl p-6 shadow-sm">
          <h3 className="text-emerald-600 font-medium text-sm flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4" /> AI INSIGHT: OUTCOMES
          </h3>
          <p className="text-slate-700 text-lg leading-relaxed">Offline test scores translating to <span className="text-emerald-600 font-bold">+12% lift</span> for students completing online Biology interventions.</p>
        </div>
      </section>

      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* FUNNEL KPIs */}
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-slate-400" /> Platform Adoption Funnel
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <span className="text-slate-500 text-sm font-medium">Onboarded Institutions</span>
                <span className="text-3xl font-black text-slate-800 mt-2">124</span>
                <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium mt-2 bg-emerald-50 w-max px-2 py-1 rounded">
                  <TrendingUp className="w-3 h-3" /> 8% vs last month
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-slate-500 text-sm font-medium">Activated / Paid</span>
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">68%</div>
                </div>
                <span className="text-3xl font-black text-blue-600 mt-2">84</span>
                <div className="flex items-center gap-1 text-slate-500 text-sm mt-3">
                  <span className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '68%' }}></div></span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-rose-200 shadow-sm flex flex-col justify-between">
                <span className="text-slate-500 text-sm font-medium">Churn Risk / Dormant</span>
                <span className="text-3xl font-black text-rose-600 mt-2">18</span>
                <div className="flex items-center gap-1 text-rose-600 text-sm font-medium mt-2 bg-rose-50 w-max px-2 py-1 rounded">
                  <ShieldAlert className="w-3 h-3" /> Critical Attention
                </div>
              </div>
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl shadow-lg flex flex-col justify-between">
                <span className="text-slate-300 text-sm font-medium">Independent Learners</span>
                <span className="text-3xl font-black text-white mt-2">2,104</span>
                <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium mt-2">
                  <TrendingUp className="w-3 h-3" /> Expanding rapidly
                </div>
              </div>
            </div>
          </section>

          {/* DUAL CHART AREA */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 line-chart-placeholder">
              <h3 className="text-lg font-bold text-slate-800 mb-6">30-Day Growth Funnel</h3>
              <div className="h-64 flex items-end justify-between px-4">
                {/* Mock Bar Chart - Activity Trends */}
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="w-8 bg-blue-100 rounded-t-md relative flex items-end justify-center group" style={{ height: `${Math.random() * 80 + 20}%` }}>
                    <div className="absolute bottom-0 w-full bg-blue-500 rounded-t-md transition-all group-hover:bg-blue-600" style={{ height: `${Math.random() * 70 + 30}%` }}></div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-6 mt-4 text-sm font-medium text-slate-500">
                <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-100"></div> Onboarded</span>
                <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Activated</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-rose-500" /> Platform Health Metrics
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-slate-700">Average Composite Health Score</span>
                    <span className="font-bold text-emerald-600">76 / 100</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '76%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-slate-700">Student Attendance Index</span>
                    <span className="font-bold text-blue-600">82 / 100</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '82%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-slate-700">Parent Engagement Translation</span>
                    <span className="font-bold text-amber-600">45 / 100</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 italic">Parent linkage coverage remains the biggest platform bottleneck.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'ecosystem' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-400" /> Institution vs Independent Ecosystem
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-sm">
                    <th className="pb-4 font-semibold uppercase tracking-wider">Metric Dimension</th>
                    <th className="pb-4 font-semibold uppercase tracking-wider pl-4">Institution Base</th>
                    <th className="pb-4 font-semibold uppercase tracking-wider pl-4">Independent Base</th>
                    <th className="pb-4 font-semibold uppercase tracking-wider text-right">Delta / Winner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-5 font-medium flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><GraduationCap className="w-4 h-4 text-blue-600" /></div>
                      Teacher Activity Rate
                    </td>
                    <td className="py-5 pl-4 font-bold text-slate-800">83.4%</td>
                    <td className="py-5 pl-4 font-bold text-slate-800">48.2%</td>
                    <td className="py-5 text-right font-bold text-emerald-600">+35.2% (Institution)</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-5 font-medium flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center"><Activity className="w-4 h-4 text-indigo-600" /></div>
                      Student Engagement Rate
                    </td>
                    <td className="py-5 pl-4 font-bold text-slate-800">76.8%</td>
                    <td className="py-5 pl-4 font-bold text-slate-800">82.1%</td>
                    <td className="py-5 text-right font-bold text-indigo-600">+5.3% (Independent)</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-5 font-medium flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center"><BookOpen className="w-4 h-4 text-amber-600" /></div>
                      Resource Access Rate
                    </td>
                    <td className="py-5 pl-4 font-bold text-slate-800">92.0%</td>
                    <td className="py-5 pl-4 font-bold text-slate-800">65.4%</td>
                    <td className="py-5 text-right font-bold text-emerald-600">+26.6% (Institution)</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-5 font-medium flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center"><Building2 className="w-4 h-4 text-orange-600" /></div>
                      Primary vs Secondary Uptake
                    </td>
                    <td className="py-5 pl-4 font-bold text-slate-800">42 Primary Orgs</td>
                    <td className="py-5 pl-4 font-bold text-slate-800">82 Secondary Orgs</td>
                    <td className="py-5 text-right font-bold text-slate-600">Secondary Dominant</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-8 bg-slate-50 rounded-lg p-5 border border-slate-100 flex gap-4">
              <Brain className="w-6 h-6 text-slate-400 shrink-0" />
              <p className="text-sm text-slate-600 leading-relaxed">
                <strong>Intelligence Conclusion:</strong> Independent learners are <span className="text-indigo-600 font-semibold">more self-motivated</span> (higher engagement without supervision), but Institution-based students benefit heavily from <span className="text-emerald-600 font-semibold">high teacher curation</span> (massively higher resource access and structured activity).
              </p>
            </div>
        </div>
      )}
    </div>
  );
}
