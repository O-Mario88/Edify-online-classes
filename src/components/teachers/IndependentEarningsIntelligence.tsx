import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Video, Book, Library, Users, ArrowUpRight } from 'lucide-react';
import { Badge } from '../ui/badge';

export const IndependentEarningsIntelligence: React.FC = () => {
  return (
    <Card className="h-full flex flex-col shadow-sm border-slate-200">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
         <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Library className="w-5 h-5 text-blue-600" />
            Content Statistics
            <Badge variant="outline" className="ml-auto bg-blue-50 text-blue-700 text-xs border-blue-200">
               Marketplace Impact
            </Badge>
         </CardTitle>
      </CardHeader>
      <CardContent className="p-5 flex-1 flex flex-col justify-between">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white border text-center border-slate-100 rounded-xl p-4 shadow-sm hover:border-slate-200 transition-colors">
             <Video className="w-5 h-5 text-indigo-500 mx-auto mb-2" />
             <div className="text-2xl font-black text-slate-800">42</div>
             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Videos</div>
          </div>
          <div className="bg-white border text-center border-slate-100 rounded-xl p-4 shadow-sm hover:border-slate-200 transition-colors">
             <Book className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
             <div className="text-2xl font-black text-slate-800">18</div>
             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Notes</div>
          </div>
          <div className="bg-white border text-center border-slate-100 rounded-xl p-4 shadow-sm hover:border-slate-200 transition-colors">
             <Library className="w-5 h-5 text-amber-500 mx-auto mb-2" />
             <div className="text-2xl font-black text-slate-800">3</div>
             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Books</div>
          </div>
        </div>

        <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100 mb-4 flex-1 flex flex-col justify-center shadow-inner">
           <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                 <Users className="w-5 h-5 text-blue-600" />
                 Global Student Impact
              </h4>
           </div>
           <div className="flex items-end gap-2 mb-3">
              <span className="text-5xl font-black text-blue-700 tracking-tighter">1,240</span>
              <span className="text-sm font-semibold text-blue-600 mb-1 flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4" /> +15% this mon
              </span>
           </div>
           <p className="text-sm text-slate-600 leading-relaxed font-medium mb-3">
             Active students accessing your materials across 45 institutions on Edify.
           </p>
           <div className="bg-blue-100/70 border border-blue-200 p-3 rounded-lg">
             <p className="text-sm text-blue-800 font-semibold leading-snug">
               🌟 Exceptional reach! Your expertly crafted resources are transforming how students learn. Keep creating—you're making a profound difference in their academic journey every single day.
             </p>
           </div>
        </div>

        <div className="pt-2 mt-auto">
           <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-md font-semibold tracking-wide h-12">
              Upload New Resource
           </Button>
        </div>
      </CardContent>
    </Card>
  );
};
