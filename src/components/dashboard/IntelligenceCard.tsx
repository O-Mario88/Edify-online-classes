import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, AlertTriangle, AlertCircle, CheckCircle, ChevronRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export interface IntelligenceCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  
  // Trend
  trendValue?: number;
  trendLabel?: string;
  trendDirection?: 'up' | 'down' | 'flat'; // To allow for inverted metrics (e.g. churn up = bad)
  trendIsGood?: boolean; // If true, up is green. If false, up is red.
  
  // Alert/Risk
  riskLevel?: 'critical' | 'warning' | 'healthy' | 'neutral';
  alertText?: string;
  
  // Drill Down
  drillDownText?: string;
  drillDownLink?: string;
  
  // Action
  actionLabel?: string;
  actionCallback?: () => void;
  actionLink?: string;
  actionVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export const IntelligenceCard: React.FC<IntelligenceCardProps> = ({
  title,
  value,
  icon,
  trendValue,
  trendLabel,
  trendDirection,
  trendIsGood = true,
  riskLevel = 'neutral',
  alertText,
  drillDownText,
  drillDownLink,
  actionLabel,
  actionCallback,
  actionLink,
  actionVariant = 'default'
}) => {
  
  // Determine Trend Styling
  let trendColor = 'text-gray-400';
  if (trendDirection === 'up') trendColor = trendIsGood ? 'text-emerald-600' : 'text-rose-600';
  if (trendDirection === 'down') trendColor = trendIsGood ? 'text-rose-600' : 'text-emerald-600';

  // Determine Risk Styling
  let riskBg = 'bg-white border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]';
  let alertIcon = null;
  let alertClass = '';
  
  switch (riskLevel) {
    case 'critical':
      riskBg = 'bg-rose-50/20 border-rose-100/50';
      alertIcon = <AlertTriangle className="w-4 h-4 text-rose-500 mr-1.5 flex-shrink-0" />;
      alertClass = 'text-rose-700 bg-rose-50/50 border border-rose-100/50';
      break;
    case 'warning':
      riskBg = 'bg-amber-50/20 border-amber-100/50';
      alertIcon = <AlertCircle className="w-4 h-4 text-amber-500 mr-1.5 flex-shrink-0" />;
      alertClass = 'text-amber-800 bg-amber-50/50 border border-amber-100/50';
      break;
    case 'healthy':
      riskBg = 'bg-emerald-50/10 border-emerald-100/50';
      alertIcon = <CheckCircle className="w-4 h-4 text-emerald-500 mr-1.5 flex-shrink-0" />;
      alertClass = 'text-emerald-700 bg-emerald-50/50 border border-emerald-100/50';
      break;
    default:
      alertIcon = <Minus className="w-4 h-4 text-gray-400 mr-1.5 flex-shrink-0" />;
      alertClass = 'text-gray-600 bg-gray-50 border border-gray-100';
      break;
  }

  // Define actual action component rendering logic to keep layout clean
  const renderAction = () => {
    if (!actionLabel) return null;
    
    if (actionLink) {
      return (
        <Link to={actionLink} className="p-0 m-0 leading-none">
          <Button size="sm" variant={actionVariant} className="w-full text-xs font-semibold py-1 h-8">
            {actionVariant === 'default' && <Zap className="w-3 h-3 mr-1" />}
            {actionLabel}
          </Button>
        </Link>
      );
    }
    
    return (
      <Button size="sm" variant={actionVariant} onClick={actionCallback} className="w-full text-xs font-semibold py-1 h-8">
         {actionVariant === 'default' && <Zap className="w-3 h-3 mr-1" />}
         {actionLabel}
      </Button>
    );
  };

  return (
    <Card className={`transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.08)] flex flex-col justify-between ${riskBg}`}>
      <CardHeader className="p-5 pb-0 flex flex-row items-center justify-between">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest truncate max-w-full" title={title}>{title}</p>
        {icon && <div className="text-slate-400 opacity-60">{icon}</div>}
      </CardHeader>
      
      <CardContent className="p-5 pt-3 flex-grow">
        {/* Live Status & Trend */}
        <div className="flex justify-between items-end mb-4">
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none break-all mr-2">{value}</div>
          
          {trendValue !== undefined && (
            <div className={`flex flex-col items-end`}>
               <div className={`flex items-center text-sm font-bold ${trendColor}`}>
                 {trendDirection === 'up' && '+'}
                 {trendDirection === 'down' && '-'}
                 {Math.abs(trendValue)}%
                 {trendDirection === 'up' && <ArrowUpRight className="w-4 h-4 ml-0.5" />}
                 {trendDirection === 'down' && <ArrowDownRight className="w-4 h-4 ml-0.5" />}
                 {trendDirection === 'flat' && <Minus className="w-4 h-4 ml-0.5" />}
               </div>
               {trendLabel && <span className="text-[10px] uppercase font-bold text-gray-400 mt-0.5 text-right max-w-[120px] leading-tight break-words">{trendLabel}</span>}
            </div>
          )}
        </div>

        {/* Intelligence Alert/Context */}
        {alertText && (
          <div className={`flex items-start p-2.5 rounded-lg text-xs font-medium leading-relaxed mb-1 ${alertClass}`}>
             {alertIcon}
             <span>{alertText}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-3 flex flex-col gap-3 border-t border-black/5 bg-white/40">
        <div className="flex w-full items-center justify-between">
           {/* Drill Down */}
           {drillDownLink && drillDownText ? (
              <Link to={drillDownLink} className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center hover:underline">
                {drillDownText} <ChevronRight className="w-3 h-3 ml-0.5" />
              </Link>
           ) : (
              <div></div> // Empty flex spacer
           )}
           
           {/* Action */}
           {actionLabel && (
              <div className="flex-shrink-0">
                {renderAction()}
              </div>
           )}
        </div>
      </CardFooter>
    </Card>
  );
};
