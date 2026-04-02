import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: number; // percentage change
  trendLabel?: string;
  icon?: React.ReactNode;
  subtitle?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trend,
  trendLabel = "vs last month",
  icon,
  subtitle
}) => {
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;
  const isNeutral = trend === 0;

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-6 sm:p-7 flex flex-col hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
      <div className="flex justify-between items-start w-full">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-500 tracking-wide mb-1.5">{title}</span>
          <span className="text-4xl font-semibold tracking-tight text-gray-900">{value}</span>
          {subtitle && (
            <span className="text-xs text-gray-400 mt-2 font-medium">{subtitle}</span>
          )}
        </div>
        
        {trend !== undefined ? (
          <div className="flex flex-col items-end">
             <div className={`flex items-center text-sm font-bold ${
               isPositive ? 'text-emerald-500' : isNegative ? 'text-rose-500' : 'text-gray-400'
             }`}>
               {isPositive ? '+' : ''}{trend}% 
               {isPositive && <ArrowUpRight className="w-4 h-4 ml-1" />}
               {isNegative && <ArrowDownRight className="w-4 h-4 ml-1" />}
               {isNeutral && <Minus className="w-4 h-4 ml-1" />}
             </div>
             <span className="text-[11px] font-medium text-gray-400 mt-0.5">{trendLabel}</span>
          </div>
        ) : icon ? (
          <div className="p-3 bg-blue-50/50 text-blue-600 rounded-[14px]">
            {icon}
          </div>
        ) : null}
      </div>

      {/* Decorative generic mini-chart representation for premium feel if no extra content */}
      {!subtitle && trend !== undefined && (
        <div className="mt-8 h-12 flex items-end gap-1.5 opacity-60">
          {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
             <div key={i} className={`w-full rounded-t-sm ${isPositive ? 'bg-emerald-100' : isNegative ? 'bg-rose-100' : 'bg-gray-100'}`} style={{ height: `${h}%` }}>
                <div className={`w-full rounded-t-sm ${isPositive ? 'bg-emerald-400' : isNegative ? 'bg-rose-400' : 'bg-gray-400'}`} style={{ height: `${h * 0.4}%` }}></div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
};
