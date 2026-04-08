import React, { InputHTMLAttributes } from 'react';
import { Calendar, ChevronDown, DollarSign } from 'lucide-react';

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, error, leftIcon, className = '', ...props }, ref) => {
    return (
      <div className={`w-full flex flex-col gap-1.5 ${className}`}>
        <label className="text-[13px] font-medium text-slate-300 ml-1">{label}</label>
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full h-[46px] bg-white/[0.04] backdrop-blur-md border border-white/[0.1] rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:bg-white/[0.08] transition-all shadow-inner
              ${leftIcon ? 'pl-11' : 'pl-4'} pr-4
              ${error ? 'border-rose-500/50 focus:ring-rose-500/50' : ''}
            `}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-rose-400 ml-1 mt-0.5">{error}</span>}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';

interface GlassSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
}

export const GlassSelect = React.forwardRef<HTMLSelectElement, GlassSelectProps>(
  ({ label, options, error, className = '', ...props }, ref) => {
    return (
      <div className={`w-full flex flex-col gap-1.5 ${className}`}>
        <label className="text-[13px] font-medium text-slate-300 ml-1">{label}</label>
        <div className="relative group">
          <select
            ref={ref}
            className={`w-full h-[46px] bg-white/[0.04] backdrop-blur-md border border-white/[0.1] rounded-xl text-white appearance-none text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:bg-white/[0.08] transition-all shadow-inner pl-4 pr-10
              ${error ? 'border-rose-500/50 focus:ring-rose-500/50' : ''}
              /* Targeting option styling in supported browsers, though custom divs are often needed for complete glassmorphism */
            `}
            {...props}
          >
            <option value="" disabled className="bg-[#1a1a24] text-slate-400">Select an option</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#1a1a24] text-white">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-400 transition-colors">
            <ChevronDown size={16} />
          </div>
        </div>
        {error && <span className="text-xs text-rose-400 ml-1 mt-0.5">{error}</span>}
      </div>
    );
  }
);

GlassSelect.displayName = 'GlassSelect';


export const CurrencyInput = (props: Omit<GlassInputProps, 'leftIcon'>) => (
  <GlassInput {...props} leftIcon={<span className="text-sm font-bold text-slate-400">UGX</span>} />
);

export const DatePickerInput = (props: Omit<GlassInputProps, 'leftIcon' | 'type'>) => (
  <GlassInput {...props} type="date" leftIcon={<Calendar size={16} />} />
);
