import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { GlassInput, GlassSelect } from '../components/GlassFormComponents';
import { Search, Plus, Filter, CreditCard, Banknote, ShieldCheck, FileDown, MoreHorizontal, CheckCircle2 } from 'lucide-react';

export function FeeCollectionDashboardPage() {
  const [isSlidePanelOpen, setIsSlidePanelOpen] = useState(false);

  return (
    <>
      <div className="space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Fee Collection</h1>
            <p className="text-slate-400 mt-1">Record, match, and reconcile incoming student clearing payments.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-xl text-slate-300 font-medium transition-all">
              <FileDown className="w-4 h-4" />
              Statement Export
            </button>
            <button 
              onClick={() => setIsSlidePanelOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-medium shadow-lg shadow-blue-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Record Payment
            </button>
          </div>
        </div>

        {/* Global Stats / Pulse Component */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <GlassCard className="p-4" noPadding hoverEffect>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Daily Collection</span>
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                 <Banknote className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">4,250,000</p>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1"><span className="font-semibold">+15%</span> vs yesterday</p>
          </GlassCard>
          <GlassCard className="p-4" noPadding hoverEffect>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Pending Approvals</span>
              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                 <ShieldCheck className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">12</p>
            <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">Requires Bursar Review</p>
          </GlassCard>
          <GlassCard className="p-4 md:col-span-2 flex items-center gap-4 bg-gradient-to-r from-blue-900/20 to-transparent border-blue-500/20" noPadding>
             <div className="flex-1">
               <h3 className="text-white font-medium mb-1">MTN / Airtel Sync Active</h3>
               <p className="text-sm text-slate-400">Mobile Money hooks are live. 3 payments matched automatically in the last hour.</p>
             </div>
             <CreditCard className="w-8 h-8 text-blue-400 opacity-80" />
          </GlassCard>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search receipt no, student id, or bank ref..." 
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl text-slate-300 transition-all">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <div className="w-40 border border-slate-700/50 rounded-xl overflow-hidden">
               <select className="w-full bg-slate-800/50 text-slate-300 py-2.5 px-3 focus:outline-none appearance-none">
                 <option>All Methods</option>
                 <option>Mobile Money</option>
                 <option>Bank Transfer</option>
                 <option>Cash</option>
               </select>
            </div>
          </div>
        </div>

        {/* The Matrix Table */}
        <GlassCard className="overflow-hidden" noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                  <th className="py-4 px-6 text-xs text-slate-400 font-medium uppercase tracking-wider">Date & Ref</th>
                  <th className="py-4 px-6 text-xs text-slate-400 font-medium uppercase tracking-wider">Student</th>
                  <th className="py-4 px-6 text-xs text-slate-400 font-medium uppercase tracking-wider">Method</th>
                  <th className="py-4 px-6 text-xs text-slate-400 font-medium uppercase tracking-wider text-right">Amount (UGX)</th>
                  <th className="py-4 px-6 text-xs text-slate-400 font-medium uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-xs text-slate-400 font-medium uppercase tracking-wider w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                <tr className="hover:bg-white/[0.02] transition-colors group">
                  <td className="py-4 px-6">
                    <p className="text-white font-medium">RCT-24-0019</p>
                    <p className="text-xs text-slate-400">10 mins ago</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-slate-200">Kato Paul</p>
                    <p className="text-xs text-slate-500">S3 • Science</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-yellow-500/10 text-yellow-400 text-xs font-medium border border-yellow-500/10">
                      MTN Mobile Money
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right font-medium text-white">
                    450,000
                  </td>
                  <td className="py-4 px-6">
                     <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Reconciled
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="p-1.5 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-slate-700">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
                {/* Second Row */}
                <tr className="hover:bg-white/[0.02] transition-colors group">
                  <td className="py-4 px-6">
                    <p className="text-white font-medium">RCT-24-0018</p>
                    <p className="text-xs text-slate-400">2 hours ago</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-slate-200">Nakato Sarah</p>
                    <p className="text-xs text-slate-500">S5 • Arts</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/10">
                      Stanbic Bank
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right font-medium text-white">
                    1,200,000
                  </td>
                  <td className="py-4 px-6">
                     <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-400 text-xs font-medium border border-slate-500/20">
                      Pending Allocation
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="p-1.5 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-slate-700">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </GlassCard>

      </div>

      {/* Slide-out Side Panel for Record Payment */}
      {isSlidePanelOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" 
            onClick={() => setIsSlidePanelOpen(false)}
          />
          
          {/* Panel */}
          <div className="fixed top-0 right-0 h-full w-[450px] bg-slate-900/95 backdrop-blur-xl border-l border-white/10 z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Record Manual Payment</h2>
                <p className="text-sm text-slate-400 mt-1">Allocate funds directly to student accounts.</p>
              </div>
              <button 
                onClick={() => setIsSlidePanelOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <p className="text-sm text-orange-300 font-medium">Over-the-counter Transaction</p>
                <p className="text-xs text-orange-400/80 mt-1">This will instantly credit the student ledger. It requires a hard receipt printout.</p>
              </div>

              {/* Form Array */}
              <GlassSelect 
                label="Student Account" 
                options={[
                  { value: 'student_1', label: '1004 - Kato Paul (S3)' },
                  { value: 'student_2', label: '1005 - Nakato Sarah (S5)' },
                ]}
              />

              <div className="grid grid-cols-2 gap-4">
                <GlassInput 
                  label="Amount Paid" 
                  type="number"
                  placeholder="0.00"
                />
                <GlassSelect 
                  label="Method" 
                  options={[
                    { value: 'cash', label: 'Cash' },
                    { value: 'cheque', label: 'Cheque' },
                    { value: 'bank', label: 'Bank Drop' },
                  ]}
                />
              </div>

              <GlassInput 
                 label="Transaction Reference" 
                 placeholder="E.g Bank slip number or Cheque number"
              />

              <GlassInput 
                 label="Notes / Narratives" 
                 placeholder="Deposited by Guardian..."
              />
              
            </div>
            
            {/* Action Bar */}
            <div className="p-6 border-t border-white/10 bg-slate-900/50 flex gap-3">
              <button 
                onClick={() => setIsSlidePanelOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-white/10 text-slate-300 font-medium hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all">
                Post Payment
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
