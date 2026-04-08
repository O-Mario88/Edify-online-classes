import React, { useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { 
  Building2, 
  LayoutDashboard, 
  Users, 
  FileText, 
  CreditCard, 
  Bus, 
  Package, 
  DollarSign, 
  Briefcase, 
  LineChart, 
  FileCheck, 
  Settings,
  Search,
  Bell,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export const FinanceERPLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);

  const NAV_ITEMS = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard/finance' },
    { name: 'Accounting', icon: <Briefcase size={20} />, path: '/dashboard/finance/accounting' },
    { name: 'Invoices', icon: <FileText size={20} />, path: '/dashboard/finance/invoices' },
    { name: 'Payments', icon: <CreditCard size={20} />, path: '/dashboard/finance/payments' },
    { name: 'Students', icon: <Users size={20} />, path: '/dashboard/finance/students' },
    { name: 'Transport', icon: <Bus size={20} />, path: '/dashboard/finance/transport' },
    { name: 'Inventory', icon: <Package size={20} />, path: '/dashboard/finance/inventory' },
    { name: 'Payroll', icon: <DollarSign size={20} />, path: '/dashboard/finance/payroll' },
    { name: 'Reports', icon: <LineChart size={20} />, path: '/dashboard/finance/reports' },
    { name: 'Audit', icon: <FileCheck size={20} />, path: '/dashboard/finance/audit' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/dashboard/finance/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#101014] text-slate-100 flex overflow-hidden font-sans relative selection:bg-indigo-500/30">
      
      {/* --- AMBIENT LIGHTING BACKGROUND --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-emerald-600/5 blur-[100px]" />
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      {/* --- FLOATING LEFT NAVIGATION RAIL --- */}
      <aside className="relative z-20 w-[280px] p-6 flex flex-col h-screen">
        <div className="h-full bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 flex flex-col shadow-2xl overflow-y-auto">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E8DCC4] to-[#c7bca7] flex items-center justify-center shadow-lg">
              <Building2 size={22} className="text-[#101014]" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-white leading-tight">Maple Finance</h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">Institution ERP</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1">
            <h3 className="px-3 text-xs font-semibold text-slate-500 mb-4 tracking-wider uppercase">Menu</h3>
            
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group
                    ${isActive 
                      ? 'bg-white/[0.08] text-white border border-white/[0.1] shadow-lg scale-[1.02]' 
                      : 'text-slate-400 hover:bg-white/[0.04] hover:text-white border border-transparent'
                    }
                  `}
                >
                  <div className={`transition-colors ${isActive ? 'text-[#E8DCC4]' : 'text-slate-500 group-hover:text-slate-300'}`}>
                    {item.icon}
                  </div>
                  <span className="font-medium text-sm">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-1 h-5 bg-[#E8DCC4] rounded-full shadow-[0_0_8px_rgba(232,220,196,0.6)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Profile Bug */}
          <div className="mt-8 pt-6 border-t border-white/[0.08]">
            <Link to="/dashboard/finance/settings" className="flex items-center gap-3 px-2 group">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                <span className="font-semibold text-indigo-300 text-sm">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="truncate pr-2">
                <p className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors truncate">
                  {user?.email || 'User Profile'}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.role?.replace('_', ' ').toUpperCase()}</p>
              </div>
            </Link>
          </div>
        </div>
      </aside>

      {/* --- MAIN CANVAS MODULE --- */}
      <main className="flex-1 flex flex-col h-screen relative z-10 p-6 pl-0">
        
        {/* TOP UTILITY GLASS BAR */}
        <header className="h-[72px] bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-3xl mb-6 flex items-center justify-between px-6 shadow-sm">
          
          <div className="flex items-center gap-4">
            {/* Action Bar / Search */}
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search transactions, students, invoices..." 
                className="w-[320px] h-[40px] bg-white/[0.04] border border-white/[0.08] rounded-full pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:bg-white/[0.06] transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-5">
            {/* Period Selector Box */}
            <button className="flex items-center gap-2 h-[40px] px-4 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-full text-sm font-medium transition-colors">
              <span className="text-slate-400">Period:</span>
              <span className="text-white">Q1 - 2024</span>
              <ChevronDown size={16} className="text-slate-500 ml-1" />
            </button>

            {/* Notifications */}
            <button className="relative w-[40px] h-[40px] flex items-center justify-center rounded-full hover:bg-white/[0.08] transition-colors border border-transparent hover:border-white/[0.05]">
              <Bell size={20} className="text-slate-400" />
              <div className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
            </button>
          </div>
        </header>

        {/* DYNAMIC DASHBOARD SCROLL AREA */}
        <div className="flex-1 overflow-y-auto pb-10 custom-scrollbar pr-2">
          <Outlet />
        </div>
      </main>

    </div>
  );
};
