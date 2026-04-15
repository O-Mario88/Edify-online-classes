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
  let trendColor = 'text-gray-800';
  if (trendDirection === 'up') trendColor = trendIsGood ? 'text-emerald-600' : 'text-rose-600';
  if (trendDirection === 'down') trendColor = trendIsGood ? 'text-rose-600' : 'text-emerald-600';

  // Determine Risk Styling
  let riskBg = 'bg-white/5 backdrop-blur-lg border-[#1E293B] shadow-[0_4px_24px_rgba(0,0,0,0.2)]';
  let alertIcon = null;
  let alertClass = '';
  
  switch (riskLevel) {
    case 'critical':
      riskBg = 'bg-rose-500/5 backdrop-blur-lg border-rose-900/50 shadow-[0_4px_24px_rgba(244,63,94,0.1)]';
      alertIcon = <AlertTriangle className="w-4 h-4 text-rose-500 mr-1.5 flex-shrink-0" />;
      alertClass = 'text-rose-400';
      break;
    case 'warning':
      riskBg = 'bg-amber-500/5 backdrop-blur-lg border-amber-900/50 shadow-[0_4px_24px_rgba(251,189,35,0.05)]';
      alertIcon = <AlertCircle className="w-4 h-4 text-[#FBBD23] mr-1.5 flex-shrink-0" />;
      alertClass = 'text-[#FBBD23] font-bold';
      break;
    case 'healthy':
      riskBg = 'bg-[#36D399]/5 backdrop-blur-lg border-emerald-900/50 shadow-[0_4px_24px_rgba(16,185,129,0.05)]';
      alertIcon = <CheckCircle className="w-4 h-4 text-[#36D399] mr-1.5 flex-shrink-0" />;
      alertClass = 'text-[#36D399] font-bold';
      break;
    default:
      alertIcon = <Minus className="w-4 h-4 text-slate-700 mr-1.5 flex-shrink-0" />;
      alertClass = 'text-slate-800';
      break;
  }

  // Define actual action component rendering logic to keep layout clean
  const renderAction = () => {
    if (!actionLabel) return null;
    
    if (actionLink) {
      return (
        <Link to={actionLink} className="p-0 m-0 leading-none w-full flex justify-center">
          <Button size="sm" variant={actionVariant} className="w-[85%] text-[13px] font-semibold py-1.5 h-9 rounded-full shadow-sm hover:w-[90%] transition-all">
            {actionVariant === 'default' && <Zap className="w-3.5 h-3.5 mr-1.5" />}
            {actionLabel}
          </Button>
        </Link>
      );
    }
    
    return (
      <Button size="sm" variant={actionVariant} onClick={actionCallback} className="w-[85%] text-[13px] font-semibold py-1.5 h-9 rounded-full shadow-sm hover:w-[90%] transition-all">
         {actionVariant === 'default' && <Zap className="w-3.5 h-3.5 mr-1.5" />}
         {actionLabel}
      </Button>
    );
  };

  return (
    <Card className={`h-full transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden relative rounded-2xl group ${riskBg}`}>
      <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
        <p className="text-[13px] font-medium text-slate-800 truncate max-w-full" title={title}>{title}</p>
        {icon && <div className="text-slate-700 group-hover:text-[#3ABFF8] transition-colors opacity-70">{icon}</div>}
      </CardHeader>
      
      <CardContent className="p-5 pt-1 flex-grow">
        {/* Live Status & Trend */}
        <div className="flex justify-between items-center mb-4 gap-2">
          <div className="text-xl md:text-[22px] font-medium text-[#3ABFF8] tracking-tight shrink-0 mr-2 max-w-[65%] break-words">{value}</div>
          
          {trendValue !== undefined && (
            <div className={`flex flex-col items-end flex-shrink-0`}>
               <div className={`flex items-center text-[15px] font-medium ${trendColor.includes('emerald') ? 'text-[#36D399]' : trendColor.includes('rose') ? 'text-rose-500' : 'text-slate-300'}`}>
                 {trendDirection === 'up' && '+'}
                 {trendDirection === 'down' && '-'}
                 {Math.abs(trendValue)}{typeof trendValue === 'number' && trendValue < 1000 ? '%' : ''}
                 {trendDirection === 'up' && <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />}
                 {trendDirection === 'down' && <ArrowDownRight className="w-3.5 h-3.5 ml-0.5" />}
               </div>
               {trendLabel && <span className="text-[11px] text-slate-700 mt-1 text-right whitespace-nowrap">{trendLabel}</span>}
            </div>
          )}
        </div>

        {/* Intelligence Alert/Context */}
        {alertText && (
          <div className="mb-4">
             {riskLevel !== 'neutral' && (
                <div className={`flex items-center mb-2 text-[15px] ${alertClass}`}>
                  {alertIcon}
                  <span>{riskLevel === 'warning' ? 'Attention Needed!' : riskLevel === 'healthy' ? 'New Record Achieved!' : 'Alert Triggered!'}</span>
                </div>
             )}
             <p className="text-[15px] leading-relaxed text-slate-800 font-normal">
               {alertText}
             </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 mt-auto flex flex-col items-center gap-3 w-full">
         {drillDownLink && drillDownText && (
            <div className="w-full flex justify-center">
               <Link to={drillDownLink} className="text-[12px] font-bold text-indigo-700 hover:text-indigo-800 flex items-center hover:underline">
                 {drillDownText} <ChevronRight className="w-3 h-3 ml-0.5" />
               </Link>
            </div>
         )}
         
         {actionLabel && (
            <div className="w-full flex justify-center">
              {renderAction()}
            </div>
         )}
         
         {/* Navigation Dots if slider logic applied elsewhere */}
         <div className="flex gap-1.5 mx-auto mt-1">
           <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
           <div className="w-1.5 h-1.5 rounded-full bg-slate-400/50"></div>
           <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
         </div>
      </CardFooter>
    </Card>
  );
};
