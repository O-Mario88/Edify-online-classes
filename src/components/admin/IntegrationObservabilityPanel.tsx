import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { RefreshCw, Webhook, MessageSquare, AlertCircle, CheckCircle2, ShieldCheck, Mail, Smartphone, BellRing } from 'lucide-react';
import { EcosystemIntegrationService } from '../../lib/integrations/EcosystemIntegrationService';
import { NotificationEngine, NotificationPayload } from '../../lib/integrations/NotificationEngine';

export const IntegrationObservabilityPanel = () => {
   const [paymentStats, setPaymentStats] = useState(EcosystemIntegrationService.getIntegrationObservabilityLogs());
   const [notificationStats, setNotificationStats] = useState(NotificationEngine.getStats());
   const [notificationLogs, setNotificationLogs] = useState<NotificationPayload[]>([]);
   const [lastRefresh, setLastRefresh] = useState(new Date().toLocaleTimeString());

   const refreshData = () => {
      setPaymentStats(EcosystemIntegrationService.getIntegrationObservabilityLogs());
      setNotificationStats(NotificationEngine.getStats());
      setNotificationLogs(NotificationEngine.getLogs().slice(0, 5)); // Last 5
      setLastRefresh(new Date().toLocaleTimeString());
   };

   // Auto poll every 5s for dashboard real-time feel
   useEffect(() => {
      refreshData();
      const interval = setInterval(refreshData, 5000);
      return () => clearInterval(interval);
   }, []);

   return (
     <Card className="shadow-sm border-slate-200">
       <CardHeader className="border-b bg-slate-50/50 flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
              <Webhook className="w-5 h-5 text-indigo-600" /> API Integrations & External Connectivity
            </CardTitle>
            <CardDescription>Real-time telemetry for Webhooks, Payments, and Notifications</CardDescription>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-xs text-slate-400">Last poll: {lastRefresh}</span>
             <button onClick={refreshData} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <RefreshCw className="w-4 h-4 text-slate-500" />
             </button>
          </div>
       </CardHeader>
       <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             
             {/* Webhook Status */}
             <div className="space-y-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                   <ShieldCheck className="w-4 h-4 text-emerald-600" /> Core Systems Callbacks
                </h3>
                <div className="grid grid-cols-2 gap-3">
                   <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col items-center justify-center text-center">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Payment Webhooks (Total)</span>
                      <span className="text-3xl font-black text-slate-900">{paymentStats.paymentWebhooks.total}</span>
                   </div>
                   <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex flex-col items-center justify-center text-center">
                      <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-1">Confirmed Drops</span>
                      <span className="text-3xl font-black text-emerald-700">{paymentStats.paymentWebhooks.confirmed}</span>
                   </div>
                   <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex flex-col items-center justify-center text-center">
                      <span className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">Pending Sync</span>
                      <span className="text-3xl font-black text-amber-700">{paymentStats.paymentWebhooks.pending}</span>
                   </div>
                   <div className="bg-rose-50 rounded-xl p-4 border border-rose-100 flex flex-col items-center justify-center text-center">
                      <span className="text-xs font-bold text-rose-700 uppercase tracking-widest mb-1">Dropped / Failed</span>
                      <span className="text-3xl font-black text-rose-700">{paymentStats.paymentWebhooks.failed}</span>
                   </div>
                </div>
             </div>

             {/* Outbound Messaging Queue */}
             <div className="space-y-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                   <MessageSquare className="w-4 h-4 text-blue-600" /> Outbound Notification Queue
                </h3>
                
                <div className="flex gap-4 mb-4">
                   <Badge variant="outline" className="bg-slate-100 border-none text-slate-700"><Mail className="w-3 h-3 mr-1"/> Email: {notificationStats.total}</Badge>
                   <Badge variant="outline" className="bg-slate-100 border-none text-slate-700"><Smartphone className="w-3 h-3 mr-1"/> SMS: {notificationStats.total}</Badge>
                   <Badge variant="outline" className="bg-slate-100 border-none text-slate-700"><BellRing className="w-3 h-3 mr-1"/> Push: 0</Badge>
                </div>

                <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 font-mono text-xs overflow-hidden h-[180px] flex flex-col gap-2">
                   {notificationLogs.length === 0 ? (
                      <div className="text-slate-500 m-auto">No recent notifications logged in the sandbox.</div>
                   ) : (
                      notificationLogs.map(log => (
                         <div key={log.id} className="flex flex-col gap-1 border-b border-slate-800 pb-2">
                            <div className="flex justify-between items-center text-slate-300">
                               <span><strong className="text-blue-400">[{log.channel.toUpperCase()}]</strong> {log.templateType} to <em>{log.recipientContact}</em></span>
                               {log.status === 'delivered' ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> :
                                log.status === 'failed' ? <AlertCircle className="w-3 h-3 text-rose-500" /> :
                                <RefreshCw className="w-3 h-3 text-amber-500 animate-spin" />}
                            </div>
                            <div className="text-slate-500 truncate">{log.content}</div>
                         </div>
                      ))
                   )}
                </div>
             </div>
             
          </div>
       </CardContent>
     </Card>
   );
};
