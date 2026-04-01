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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            {icon}
          </div>
        )}
      </div>

      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-2">
          <span
            className={`flex items-center text-sm font-medium ${
              isPositive ? 'text-emerald-600' : isNegative ? 'text-red-600' : 'text-gray-500'
            }`}
          >
            {isPositive && <ArrowUpRight className="w-4 h-4 mr-1" />}
            {isNegative && <ArrowDownRight className="w-4 h-4 mr-1" />}
            {isNeutral && <Minus className="w-4 h-4 mr-1" />}
            {Math.abs(trend)}%
          </span>
          <span className="text-sm text-gray-500">{trendLabel}</span>
        </div>
      )}
    </div>
  );
};
