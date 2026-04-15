import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { X, Map, BarChart3, TrendingUp, AlertTriangle, Users } from 'lucide-react';

interface CurriculumDistributionMapProps {
  topicName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CurriculumDistributionMap: React.FC<CurriculumDistributionMapProps> = ({ 
  topicName = "Sample Topic Data", 
  isOpen, 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'curve' | 'heatmap'>('curve');

  if (!isOpen) return null;

  // Mock data for the bell curve
  const curveData = [
    { grade: 'F (0-39)', count: 1200, percentage: 8, height: 'h-12', color: 'bg-red-500' },
    { grade: 'E (40-49)', count: 2100, percentage: 14, height: 'h-24', color: 'bg-orange-500' },
    { grade: 'D (50-59)', count: 3400, percentage: 22, height: 'h-40', color: 'bg-amber-400' },
    { grade: 'C (60-69)', count: 4200, percentage: 28, height: 'h-48', color: 'bg-blue-400' },
    { grade: 'B (70-79)', count: 2800, percentage: 18, height: 'h-32', color: 'bg-emerald-400' },
    { grade: 'A (80-100)', count: 1500, percentage: 10, height: 'h-16', color: 'bg-emerald-600' },
  ];

  // Mock data for the heatmap
  const heatmapData = [
    { region: 'Central Hub', status: 'healthy', orgs: 42, avg: 74 },
    { region: 'Northern Cluster', status: 'warning', orgs: 18, avg: 52 },
    { region: 'Western Cluster', status: 'danger', orgs: 12, avg: 38 },
    { region: 'Eastern Hub', status: 'healthy', orgs: 29, avg: 68 },
    { region: 'Remote Alpha', status: 'danger', orgs: 4, avg: 31 },
    { region: 'City Premium', status: 'excellent', orgs: 8, avg: 86 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl border-0 overflow-hidden bg-white">
        <CardHeader className="bg-slate-50 border-b border-slate-200 pb-4 shrink-0 flex flex-row items-center justify-between">
           <div>
              <div className="flex items-center gap-2 mb-1">
                 <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">National Analytics</Badge>
                 <span className="text-sm font-medium text-slate-700">Master Distribution Map</span>
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                 {topicName}
              </CardTitle>
           </div>
           <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-200 shrink-0">
             <X className="w-5 h-5 text-slate-700" />
           </Button>
        </CardHeader>
        
        <CardContent className="p-0 flex-1 overflow-auto flex flex-col">
           {/* Tab Navigation */}
           <div className="flex border-b border-slate-100 px-6 shrink-0 pt-2">
              <button 
                className={`py-3 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'curve' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-700 hover:text-slate-700'}`}
                onClick={() => setActiveTab('curve')}
              >
                 <BarChart3 className="w-4 h-4" /> National Grade Curve
              </button>
              <button 
                className={`py-3 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'heatmap' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-700 hover:text-slate-700'}`}
                onClick={() => setActiveTab('heatmap')}
              >
                 <Map className="w-4 h-4" /> Institutional Heatmap
              </button>
           </div>

           {/* Content Area */}
           <div className="p-6 flex-1 flex flex-col bg-slate-50/30">
              {activeTab === 'curve' ? (
                <div className="flex-1 flex flex-col">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 shrink-0">
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                         <p className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-1">Total Students</p>
                         <p className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                            15,200 <Users className="w-5 h-5 text-indigo-400" />
                         </p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                         <p className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-1">National Average</p>
                         <p className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                            62% <TrendingUp className="w-5 h-5 text-emerald-500" />
                         </p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm">
                         <p className="text-sm font-bold text-red-700 uppercase tracking-widest mb-1">Critical Failure Cohort</p>
                         <p className="text-3xl font-bold text-red-900 flex items-center gap-2">
                            1,200 <AlertTriangle className="w-5 h-5 text-red-700" />
                         </p>
                      </div>
                   </div>

                   {/* The Abstract CSS Bell Curve */}
                   <div className="flex-1 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-end relative h-64 md:h-auto min-h-[300px]">
                      <div className="absolute top-4 left-6 text-sm font-bold text-slate-800 uppercase tracking-widest">Student Volume</div>
                      
                      <div className="flex items-end justify-between gap-2 h-full pb-8 pt-12">
                         {curveData.map((bar, idx) => (
                           <div key={idx} className="flex-1 flex flex-col items-center justify-end group">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-2 text-center">
                                <Badge variant="outline" className="bg-slate-800 text-white border-slate-800 shadow-lg mb-1">
                                  {bar.count.toLocaleString()} students
                                </Badge>
                                <div className="text-xs font-bold text-slate-800">{bar.percentage}%</div>
                              </div>
                              <div className={`w-full max-w-[80px] rounded-t-lg transition-all duration-500 ${bar.height} ${bar.color} opacity-80 group-hover:opacity-100`} />
                           </div>
                         ))}
                      </div>

                      {/* X Axis Labels */}
                      <div className="absolute bottom-0 left-0 right-0 h-10 border-t border-slate-200 flex justify-between px-6 pt-2">
                         {curveData.map((bar, idx) => (
                           <div key={idx} className="flex-1 text-center text-xs font-bold text-slate-700">
                             {bar.grade}
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                   <div className="mb-4">
                     <p className="text-slate-800">Visualizing 113 active institutions currently engaged with this topic. Institutions in red are driving down the national average.</p>
                   </div>
                   
                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 flex-1">
                      {heatmapData.map((region, idx) => {
                         let bgClass = "bg-white border-slate-200";
                         let textClass = "text-slate-800";
                         let icon = null;
                         
                         if (region.status === 'danger') {
                           bgClass = "bg-red-50 border-red-200";
                           textClass = "text-red-900";
                           icon = <AlertTriangle className="w-8 h-8 text-red-200 absolute right-2 bottom-2" />;
                         } else if (region.status === 'warning') {
                           bgClass = "bg-amber-50 border-amber-200";
                           textClass = "text-amber-900";
                         } else if (region.status === 'excellent') {
                           bgClass = "bg-emerald-50 border-emerald-200";
                           textClass = "text-emerald-900";
                         }

                         return (
                           <div key={idx} className={`${bgClass} border rounded-xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[140px]`}>
                             {icon}
                             <div className="relative z-10">
                               <h4 className={`font-bold ${textClass}`}>{region.region}</h4>
                               <p className="text-xs text-slate-700 mb-3">{region.orgs} Institutions</p>
                             </div>
                             <div className="relative z-10">
                               <p className="text-xs uppercase font-bold text-slate-800 mb-1">Local Avg</p>
                               <p className={`text-3xl font-black ${textClass}`}>{region.avg}%</p>
                             </div>
                           </div>
                         );
                      })}
                   </div>
                </div>
              )}
           </div>
        </CardContent>
      </Card>
    </div>
  );
};
