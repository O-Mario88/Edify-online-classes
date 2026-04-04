import React from 'react';
import { Button } from './button';
import { Lock, Crown } from 'lucide-react';

interface PremiumLockStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  mockContent?: React.ReactNode;
}

export const PremiumLockState: React.FC<PremiumLockStateProps> = ({
  title,
  description,
  actionLabel = 'Unlock Feature',
  onAction,
  mockContent
}) => {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm min-h-[400px]">
      
      {/* Obscured Mock Sub-layer */}
      <div className="absolute inset-0 opacity-40 select-none pointer-events-none grayscale[50%] transition-all">
         {mockContent ? mockContent : (
           <div className="w-full h-full p-8 gap-4 flex flex-col">
             <div className="h-8 w-1/3 bg-slate-200 rounded-md"></div>
             <div className="h-32 w-full bg-slate-100 rounded-xl"></div>
             <div className="flex gap-4">
               <div className="h-24 w-1/2 bg-slate-100 rounded-xl"></div>
               <div className="h-24 w-1/2 bg-slate-100 rounded-xl"></div>
             </div>
           </div>
         )}
      </div>

      {/* Frosted Glass Overlay */}
      <div className="absolute inset-0 backdrop-blur-md bg-white/70 flex flex-col items-center justify-center p-8 text-center z-10 transition-colors">
        
        <div className="relative mb-6 group">
           <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full scale-[2.0] transition-transform group-hover:scale-[2.5]" />
           <div className="relative bg-gradient-to-br from-amber-100 to-amber-50 p-4 rounded-full shadow-lg border border-amber-200/50 flex items-center justify-center">
             <Lock className="w-8 h-8 text-amber-600 mb-0.5 absolute opacity-0 group-hover:opacity-100 transition-opacity" />
             <Crown className="w-8 h-8 text-amber-600 group-hover:opacity-0 transition-opacity" />
           </div>
        </div>

        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3 drop-shadow-sm">{title}</h3>
        <p className="text-slate-600 font-medium max-w-md mx-auto mb-8 leading-relaxed">
          {description}
        </p>

        {onAction && (
          <Button 
            onClick={onAction} 
            size="lg"
            className="bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10 font-bold px-8 tracking-wide group"
          >
            {actionLabel}
            <div className="ml-2 w-1.5 h-1.5 rounded-full bg-amber-400 group-hover:animate-ping" />
          </Button>
        )}
      </div>
    </div>
  );
};
