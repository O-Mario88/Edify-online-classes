import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Globe, TrendingUp, TrendingDown, ShieldAlert, BarChart } from 'lucide-react';
import { Badge } from '../ui/badge';

export const GlobalInstitutionComparison: React.FC = () => {
  const institutions = [
    { name: 'Kampala Model High', health: 92, trend: '+4%', alert: false, status: 'Premium' },
    { name: 'Entebbe International', health: 88, trend: '+1%', alert: false, status: 'Premium' },
    { name: 'Valley View Academy', health: 85, trend: '-2%', alert: false, status: 'Standard' },
    { name: 'Northern Lights School', health: 58, trend: '-12%', alert: true, status: 'Standard' },
    { name: 'Lakeside College', health: 45, trend: '-5%', alert: true, status: 'Trial' },
  ];

  return (
    <Card className="shadow-sm border-slate-200">
       <CardHeader className="bg-slate-50 border-b border-slate-100 pb-3">
          <div className="flex justify-between items-center">
             <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
               <Globe className="w-5 h-5 text-indigo-600" />
               Global Institution Health
             </CardTitle>
             <Button variant="outline" size="sm" className="h-8">Full Analysis</Button>
          </div>
       </CardHeader>
       <CardContent className="p-0">
          <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 text-slate-500 font-medium">
                   <tr>
                      <th className="px-6 py-4 border-b border-slate-100">Institution</th>
                      <th className="px-6 py-4 border-b border-slate-100">Tier</th>
                      <th className="px-6 py-4 border-b border-slate-100">Health Index</th>
                      <th className="px-6 py-4 border-b border-slate-100">Trend</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {institutions.map((inst, i) => (
                     <tr key={i} className={`hover:bg-slate-50 ${inst.alert ? 'bg-red-50/30' : ''}`}>
                        <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                           {inst.alert && <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />}
                           {inst.name}
                        </td>
                        <td className="px-6 py-4">
                           <Badge variant="outline" className={inst.status === 'Premium' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-600'}>
                             {inst.status}
                           </Badge>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2">
                              <span className={`font-bold ${inst.health < 60 ? 'text-red-600' : 'text-slate-800'}`}>{inst.health}</span>
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                                 <div className={`h-full ${inst.health < 60 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${inst.health}%` }}></div>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`flex items-center font-bold text-xs ${inst.trend.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>
                             {inst.trend.startsWith('+') ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                             {inst.trend}
                           </span>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </CardContent>
    </Card>
  );
};

// Extracted button just for this file context if not imported
function Button({ children, className, variant, size }: any) {
  return <button className={`px-3 py-1 border rounded-md font-medium text-xs text-slate-600 hover:bg-slate-100 ${className}`}>{children}</button>;
}
