import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, UserX, Activity, BookOpen, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

export const InterventionsHub = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const { data, error } = await apiClient.get<any[] | { results?: any[] }>('/interventions/alerts/');
        if (!error && data) {
           setAlerts(Array.isArray(data) ? data : data.results || []);
        }
      } catch (err) {
        console.error("Failed to fetch alerts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <Card className="border-t-4 border-t-red-500">
             <CardContent className="pt-6">
               <div className="flex justify-between items-start">
                 <div>
                   <p className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-1">Critical Risks</p>
                   <p className="text-3xl font-black text-gray-900">{alerts.filter(a => a.severity === 'red').length}</p>
                 </div>
                 <div className="p-3 bg-red-50 text-red-600 rounded-lg"><AlertTriangle className="w-6 h-6" /></div>
               </div>
             </CardContent>
           </Card>

           <Card className="border-t-4 border-t-amber-500">
             <CardContent className="pt-6">
               <div className="flex justify-between items-start">
                 <div>
                   <p className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-1">Active Plans</p>
                   <p className="text-3xl font-black text-gray-900">{alerts.filter(a => a.status === 'active').length}</p>
                 </div>
                 <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><Activity className="w-6 h-6" /></div>
               </div>
             </CardContent>
           </Card>

           <Card className="border-t-4 border-t-emerald-500">
             <CardContent className="pt-6">
               <div className="flex justify-between items-start">
                 <div>
                   <p className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-1">Recovered</p>
                   <p className="text-3xl font-black text-gray-900">{alerts.filter(a => a.status === 'resolved').length}</p>
                 </div>
                 <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><BookOpen className="w-6 h-6" /></div>
               </div>
             </CardContent>
           </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Needs Immediate Action</CardTitle>
            <CardDescription>Students flagged by the diagnostic radar for high absenteeism or failing grades.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="divide-y divide-gray-100">
                {loading ? (
                  <div className="py-8 text-center text-gray-500 flex justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>
                ) : alerts.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">No learners flagged for intervention right now. Risk alerts will appear here the moment a drop in attendance, scores, or engagement is detected.</div>
                ) : alerts.map((alert: any) => (
                  <div key={alert.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full ${alert.severity === 'red' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'} flex items-center justify-center font-bold`}>
                          {alert.student_name ? alert.student_name.slice(0,2).toUpperCase() : 'SN'}
                        </div>
                        <div>
                           <h4 className="font-bold text-gray-900">{alert.student_name || 'Student'}</h4>
                           <p className="text-sm text-gray-500">{alert.flagged_reason}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 w-full md:w-auto">
                        <Badge variant="outline" className={`${alert.severity === 'red' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          {alert.severity === 'red' ? 'Critical Academic Risk' : 'Elevated Risk'}
                        </Badge>
                        <Button size="sm" variant="outline">View Profile</Button>
                        <Button size="sm">Create Plan</Button>
                     </div>
                  </div>
                ))}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default InterventionsHub;
