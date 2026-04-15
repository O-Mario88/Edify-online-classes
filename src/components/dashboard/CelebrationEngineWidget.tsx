import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Trophy, Star, Sparkles, Award } from 'lucide-react';

export const CelebrationEngineWidget: React.FC = () => {
  return (
    <Card className="border-0 shadow-none bg-gradient-to-br from-yellow-50 to-orange-50 overflow-hidden relative border border-orange-100">
      <div className="absolute -top-10 -right-10 opacity-10">
        <Sparkles className="w-40 h-40 text-orange-500" />
      </div>
      
      <CardContent className="p-6 relative z-10 flex flex-col md:flex-row gap-6 items-center">
         
         <div className="flex-1 space-y-4">
            <h3 className="text-xl font-black flex items-center gap-2 text-[#7c2d12] border-b border-[#fed7aa]/50 pb-2">
               <Trophy className="w-6 h-6 text-[#f97316]" /> Platform Celebrations
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-[#ffedd5] flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#dbeafe] text-[#1e40af] flex items-center justify-center shrink-0">
                     <Star className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                     <p className="text-xs uppercase font-bold text-[#1e40af] tracking-wider">Student of the Week</p>
                     <p className="text-lg font-black text-[#1e293b] leading-tight mt-0.5">Joan Doe</p>
                     <p className="text-xs text-[#334155] mt-1">For outstanding peer support</p>
                  </div>
               </div>

               <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-[#ffedd5] flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#fee2e2] text-[#991b1b] flex items-center justify-center shrink-0">
                     <Award className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                     <p className="text-xs uppercase font-bold text-[#991b1b] tracking-wider">House Leaders</p>
                     <p className="text-lg font-black text-[#1e293b] leading-tight mt-0.5">Crane House</p>
                     <p className="text-xs text-[#334155] mt-1">Winning the Study Sprint</p>
                  </div>
               </div>
            </div>
         </div>

      </CardContent>
    </Card>
  );
};
