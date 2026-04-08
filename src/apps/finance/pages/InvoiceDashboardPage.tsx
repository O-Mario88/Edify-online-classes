import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { GlassInput, GlassSelect, CurrencyInput, DatePickerInput } from '../components/GlassFormComponents';
import { Plus, Search, Filter, MoreHorizontal, ExternalLink } from 'lucide-react';

export const InvoiceDashboardPage: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 flex gap-6">
      
      {/* LEFT AREA: Invoice List and Controls */}
      <div className={`transition-all duration-500 ease-in-out ${isCreating ? 'w-2/3' : 'w-full'} flex flex-col gap-6`}>
        
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Receivables & Invoicing</h1>
            <p className="text-slate-400 text-sm mt-1">Manage termly fee billings and student accounts.</p>
          </div>
          {!isCreating && (
            <button 
              onClick={() => setIsCreating(true)}
              className="h-[44px] px-6 rounded-full bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-sm font-semibold transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] flex items-center gap-2"
            >
              <Plus size={18} /> New Invoice
            </button>
          )}
        </div>

        <GlassCard className="flex-1 min-h-[600px] flex flex-col p-0 overflow-hidden">
          {/* Table Control Bar */}
          <div className="p-4 border-b border-white/[0.05] flex gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search by student name, invoice ID..." 
                className="w-full h-[36px] bg-white/[0.03] border border-white/[0.08] rounded-lg pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              />
            </div>
            <button className="flex items-center gap-2 h-[36px] px-4 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-slate-300 hover:text-white transition-colors">
              <Filter size={16} /> Filter
            </button>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left text-sm text-slate-300 border-collapse">
              <thead className="sticky top-0 bg-[#161622]/90 backdrop-blur-md z-10 text-xs uppercase tracking-wider text-slate-500 border-b border-white/[0.08]">
                <tr>
                  <th className="px-6 py-4 font-medium">Invoice ID</th>
                  <th className="px-6 py-4 font-medium">Student / Payer</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Total Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {[...Array(6)].map((_, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap text-white font-medium">INV-24-{1042 + i}</td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">Musoke John</div>
                      <div className="text-xs text-slate-500">Senior 4 • S4-SCI</div>
                    </td>
                    <td className="px-6 py-4">Oct 24, 2024</td>
                    <td className="px-6 py-4 font-medium text-white">1,450,000 UGX</td>
                    <td className="px-6 py-4">
                      {i % 3 === 0 ? (
                        <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">Overdue</span>
                      ) : i % 2 === 0 ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">Partial</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">Paid</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.08] transition-colors opacity-0 group-hover:opacity-100">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* RIGHT AREA: Slide-in Creation Form */}
      {isCreating && (
        <div className="w-1/3 flex flex-col animation-slide-in-right">
          <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden relative">
            
            {/* Form Header */}
            <div className="px-6 py-5 border-b border-white/[0.05] flex justify-between items-center bg-white/[0.02]">
              <h2 className="text-lg font-bold text-white">Create New Invoice</h2>
              <button 
                onClick={() => setIsCreating(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>

            {/* Form Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {/* Group 1 */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Billing Identity</h3>
                <GlassSelect 
                  label="Select Student / Family" 
                  options={[
                    { value: 'john', label: 'Musoke John (S4)' },
                    { value: 'mary', label: 'Nalwanga Mary (S2)' }
                  ]}
                />
                <GlassSelect 
                  label="Financial Period" 
                  options={[
                    { value: 't1_2024', label: 'Term 1, 2024 (Active)' },
                    { value: 't2_2024', label: 'Term 2, 2024' }
                  ]}
                />
              </div>

              {/* Group 2 */}
              <div className="space-y-4 pt-4 border-t border-white/[0.05]">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <DatePickerInput label="Issue Date" defaultValue="2024-10-24" />
                  <DatePickerInput label="Due Date" defaultValue="2024-11-24" />
                </div>
                <GlassSelect 
                  label="Fee Template Base" 
                  options={[
                    { value: 's4_standard', label: 'S4 Standard Tuition (Day)' },
                    { value: 's4_boarding', label: 'S4 Target Tuition (Boarding)' }
                  ]}
                />
                <GlassInput label="Narration / Note" placeholder="Standard termly billing..." />
              </div>

              {/* Pseudo Grid for adding specific lines */}
              <div className="space-y-4 pt-4 border-t border-white/[0.05]">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Line Items</h3>
                  <button className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">Add Custom Charge</button>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 flex justify-between items-center group cursor-pointer hover:border-white/[0.1]">
                  <div>
                    <h4 className="text-sm font-medium text-white">Term 1 Tuition Fee</h4>
                    <span className="text-xs text-slate-500">Linked to Account 4001</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">850,000</p>
                  </div>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 flex justify-between items-center group cursor-pointer hover:border-white/[0.1]">
                  <div>
                    <h4 className="text-sm font-medium text-white">UNEB Registration</h4>
                    <span className="text-xs text-slate-500">Linked to Account 4005</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">225,000</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Form Footer Action */}
            <div className="p-6 border-t border-white/[0.05] bg-white/[0.02] space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium text-sm">Total Value</span>
                <span className="text-2xl font-bold text-emerald-400">1,075,000 <span className="text-sm">UGX</span></span>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsCreating(false)}
                  className="flex-1 h-[44px] rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-white text-sm font-medium transition-all"
                >
                  Save Draft
                </button>
                <button className="flex-1 h-[44px] rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-sm font-semibold transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  Post Invoice
                </button>
              </div>
            </div>

          </GlassCard>
        </div>
      )}

    </div>
  );
};
