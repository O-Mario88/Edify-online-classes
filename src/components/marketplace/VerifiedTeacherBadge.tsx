import React from 'react';
import { ShieldCheck, MessageSquare, Clock, Star } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface VerifiedTeacherBadgeProps {
  isVerified: boolean;
  reputation?: {
    responseRate: number;
    avgResponseTimeMins: number;
    badges: string[];
    reviewCount: number;
  };
  compact?: boolean;
}

export const VerifiedTeacherBadge: React.FC<VerifiedTeacherBadgeProps> = ({ isVerified, reputation, compact = false }) => {
  if (!isVerified) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 flex items-center gap-1 cursor-help">
              <ShieldCheck size={compact ? 12 : 14} className="text-blue-600" />
              Verified Expert
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="bg-white p-3 border shadow-md text-sm text-gray-700 max-w-xs">
            <p><strong>Edify Verified</strong> <br/> This teacher's qualifications and identity have been fully vetted by our academic review board.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {!compact && reputation && (
        <>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-1 text-gray-500 cursor-help">
                  <MessageSquare size={14} />
                  <span>{reputation.responseRate}%</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>Response Rate</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-1 text-gray-500 cursor-help">
                  <Clock size={14} />
                  <span>&lt; {reputation.avgResponseTimeMins}m</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>Average Response Time</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {reputation.badges.slice(0, 2).map((b, i) => (
             <Badge key={i} variant="outline" className="text-xs bg-yellow-50 text-yellow-800 border-yellow-200">
                <Star size={10} className="mr-1 fill-yellow-500 text-yellow-500"/> {b}
             </Badge>
          ))}
        </>
      )}
    </div>
  );
};
