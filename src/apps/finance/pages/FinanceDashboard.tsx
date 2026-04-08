import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Receipt, 
  Users, 
  Building2, 
  ArrowUpRight, 
  BarChart3, 
  DollarSign,
  FileText
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { apiClient } from '../../../lib/apiClient';
import { Loader2 } from 'lucide-react';

const KPICard = ({ title, value, subValue, trend, trendLabel, icon: Icon, color }: any) => (
  <GlassCard className="relative overflow-hidden group hover:bg-white/[0.05] transition-all duration-300">
    <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none group-hover:bg-${color}-500/20 transition-all`} />
    
    <div className="flex justify-between items-start mb-6">
      <div className={`p-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-${color}-400 shadow-inner`}>
        <Icon size={24} strokeWidth={1.5} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
          trend === 'up' ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20' : 
          'text-rose-400 bg-rose-400/10 border border-rose-400/20'
        }`}>
          {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {trendLabel}
        </div>
      )}
    </div>
    
    <div>
      <h3 className="text-slate-400 font-medium text-sm mb-1">{title}</h3>
      <div className="flex items-baseline gap-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">{value}</h2>
        {subValue && <span className="text-slate-500 font-medium text-sm">{subValue}</span>}
      </div>
    </div>
  </GlassCard>
);

export const FinanceDashboard: React.FC = () => {
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const institution_id = 1; // MVP hardcode
        const { data } = await apiClient.get<any>(`/institutions/${institution_id}/finance/analytics/dashboard/`);
        if (data?.kpis) {
          setKpis(data.kpis);
        }
      } catch (e) {
        console.error("Failed to load Finance Executive KPIs:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchKPIs();
  }, []);

  // Formatter for large numbers e.g. 1.2M, 45K
  const formatAmount = (num: number) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">
      
      {/* Welcome Header Container */}
      <GlassCard className="flex items-center justify-between !py-8 bg-gradient-to-r from-white/[0.05] to-transparent">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
            Financial Command Center
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold border border-indigo-500/20">LIVE</span>
          </h1>
          <p className="text-slate-400 text-sm">Kampala Model High School • Term 1, 2024</p>
        </div>
        <div className="flex gap-4">
          <button className="h-[44px] px-6 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-white text-sm font-medium transition-all flex items-center gap-2">
            <FileText size={16} /> Print Trial Balance
          </button>
          <button className="h-[44px] px-6 rounded-full bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-sm font-semibold transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] flex items-center gap-2">
            Create Invoice <ArrowUpRight size={16} />
          </button>
        </div>
      </GlassCard>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-12 flex justify-center items-center">
             <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <>
            <KPICard 
              title="Total Billed YTD" 
              value={kpis?.totalInvoiced ? formatAmount(kpis.totalInvoiced) : "0"} 
              subValue="UGX"
              trend="up" 
              trendLabel="Healthy" 
              icon={Receipt} 
              color="indigo" 
            />
            <KPICard 
              title="Total Collected YTD" 
              value={kpis?.totalPaid ? formatAmount(kpis.totalPaid) : "0"} 
              subValue="UGX"
              trend="up" 
              trendLabel={`${kpis?.collectionRate || 0}%`} 
              icon={Wallet} 
              color="emerald" 
            />
            <KPICard 
              title="Total Outstanding" 
              value={kpis?.totalArrears ? formatAmount(kpis.totalArrears) : "0"} 
              subValue="UGX"
              trend="down" 
              trendLabel="Arrears" 
              icon={BarChart3} 
              color="rose" 
            />
            <KPICard 
              title="Active Locks" 
              value={kpis?.lockedStudents || "0"} 
              subValue="Suspended"
              icon={Users} 
              color="amber" 
            />
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart Area */}
        <GlassCard className="lg:col-span-2 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-white font-bold text-lg">Revenue vs Target</h3>
              <p className="text-slate-400 text-xs mt-1">Monthly collection efficiency comparison</p>
            </div>
            <div className="flex bg-white/[0.04] border border-white/[0.08] rounded-full p-1">
              <button className="px-4 py-1.5 rounded-full bg-white/[0.1] text-white text-xs font-semibold shadow-sm">Monthly</button>
              <button className="px-4 py-1.5 rounded-full text-slate-400 hover:text-white text-xs font-medium">Termly</button>
            </div>
          </div>

          <div className="flex-1 flex items-end justify-between relative px-2">
            {/* Ambient Chart Lines */}
            <div className="absolute inset-0 flex flex-col justify-between py-10 pointer-events-none">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-full h-[1px] bg-white/[0.03]" />
              ))}
            </div>
            
            {/* Pseudo-chart bars representing the premium spline feel */}
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => (
              <div key={month} className="relative flex flex-col items-center gap-4 w-12 group">
                <div className="w-full flex justify-center items-end h-[220px] gap-1 z-10">
                  <div 
                    className="w-3 bg-[#E8DCC4] rounded-t-sm shadow-[0_0_10px_rgba(232,220,196,0.3)] transition-all group-hover:bg-white" 
                    style={{ height: `${30 + Math.random() * 50}%` }} 
                  />
                  <div 
                    className="w-3 bg-indigo-500 rounded-t-sm opacity-50" 
                    style={{ height: `${50 + Math.random() * 40}%` }} 
                  />
                </div>
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">{month}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Operational Widgets Panel */}
        <div className="space-y-6">
          
          <GlassCard>
            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
              <Building2 size={18} className="text-slate-400" /> Bank Balances
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-2xl hover:bg-white/[0.03] transition-colors cursor-pointer border border-transparent hover:border-white/[0.05]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <span className="text-blue-400 font-bold text-xs">STA</span>
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-medium">Stanbic Main</h4>
                    <p className="text-slate-500 text-xs">...4590</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-sm">184.2M</p>
                  <p className="text-emerald-400 text-xs">Synced</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-2xl hover:bg-white/[0.03] transition-colors cursor-pointer border border-transparent hover:border-white/[0.05]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                    <span className="text-yellow-400 font-bold text-xs">MTN</span>
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-medium">MoMo Collections</h4>
                    <p className="text-slate-500 text-xs">Merchant: 44093</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-sm">45.8M</p>
                  <p className="text-emerald-400 text-xs">Live</p>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-bold">Action Queue</h3>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold">4 PENDING</span>
            </div>
            
            <div className="space-y-3">
              {[
                { label: 'Unmatched Bank Deposits', count: 12, color: 'blue' },
                { label: 'Pending Discount Approvals', count: kpis?.pendingApprovals || 0, color: 'amber' },
                { label: 'Suspicious Reversed Receipts', count: 1, color: 'rose' }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-2.5 border-b border-white/[0.05] last:border-0">
                  <span className="text-sm text-slate-300">{item.label}</span>
                  <div className={`w-6 h-6 rounded-full bg-${item.color}-500/10 border border-${item.color}-500/20 text-${item.color}-400 text-xs font-bold flex items-center justify-center`}>
                    {item.count}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

        </div>

      </div>
    </div>
  );
};
