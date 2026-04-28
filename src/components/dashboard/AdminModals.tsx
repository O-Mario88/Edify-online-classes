import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ShieldAlert, RefreshCw, X, Download, ServerCrash } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../lib/apiClient';

interface LogEntry {
  level: 'ERROR' | 'WARN' | 'INFO';
  timestamp: string;
  message: string;
}

export const ErrorLogsPanel: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
  const [clearing, setClearing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      apiClient.get<{ logs: Array<{ id: number; level: string; message: string; created_at: string; source?: string }> }>('/admin/logs/')
        .then(res => {
          if (res.error) {
            toast.error(`Could not load logs: ${res.error.message}`);
            setLogs([]);
            return;
          }
          const rows = res.data?.logs || [];
          setLogs(rows.map(r => ({
            level: r.level.toUpperCase() as LogEntry['level'],
            timestamp: r.created_at,
            message: r.source ? `[${r.source}] ${r.message}` : r.message,
          })));
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClearLogs = async () => {
    setClearing(true);
    try {
      const resp = await apiClient.post<{ status: string; deleted_count: number }>('/admin/logs/clear/', {});
      if (resp.error) {
        toast.error(`Failed to clear logs: ${resp.error.message}`);
      } else {
        const count = resp.data?.deleted_count ?? 0;
        toast.success(`Cleared ${count} log entr${count === 1 ? 'y' : 'ies'}.`);
        // Re-fetch to show what's left (recent entries plus the
        // "admin cleared logs" entry the backend just wrote).
        const refresh = await apiClient.get<{ logs: Array<{ id: number; level: string; message: string; created_at: string; source?: string }> }>('/admin/logs/');
        const rows = refresh.data?.logs || [];
        setLogs(rows.map(r => ({
          level: r.level.toUpperCase() as LogEntry['level'],
          timestamp: r.created_at,
          message: r.source ? `[${r.source}] ${r.message}` : r.message,
        })));
      }
    } catch (err: any) {
      toast.error(`Failed to clear logs: ${err?.message || 'network error'}`);
    } finally {
      setClearing(false);
    }
  };

  const handleExport = () => {
    if (logs.length === 0) {
      toast.error('No logs available to export.');
      return;
    }
    const logContent = logs.map(l => `[${l.level}] ${l.timestamp} - ${l.message}`).join('\n');
    const blob = new Blob([logContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `edify_telemetry_${Date.now()}.log`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Log blob exported cleanly.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl bg-slate-900 border-slate-700 shadow-2xl overflow-hidden flex flex-col">
        <CardHeader className="border-b border-slate-800 bg-slate-950 flex justify-between flex-row items-center">
          <CardTitle className="flex items-center gap-2 text-rose-400"><ShieldAlert className="w-5 h-5"/> Telemetry & Error Logs</CardTitle>
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={onClose}><X className="w-4 h-4"/></Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-64 overflow-y-auto bg-black p-4 font-mono text-xs text-slate-300 space-y-2">
            {loading ? (
               <div className="flex items-center text-slate-500 animate-pulse"><RefreshCw className="w-4 h-4 mr-2 animate-spin"/> Fetching telemetry layer from nodes...</div>
            ) : logs.length === 0 ? (
               <div className="text-emerald-500 flex items-center"><ShieldAlert className="w-4 h-4 mr-2"/> All nodes nominal. No error logs recorded.</div>
            ) : (
               logs.map((log, i) => (
                 <div key={i}>
                   <span className={log.level === 'ERROR' ? 'text-rose-500' : log.level === 'WARN' ? 'text-amber-500' : 'text-slate-500'}>
                     [{log.level}]
                   </span> {log.timestamp} - {log.message}
                 </div>
               ))
            )}
          </div>
          <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-between items-center">
            <p className="text-xs text-slate-500">Showing last {logs.length} entries</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport} className="border-slate-700 text-slate-300 bg-transparent hover:bg-slate-800">
                <Download className="w-4 h-4 mr-2" /> Download Dump
              </Button>
              <Button variant="destructive" onClick={handleClearLogs} disabled={clearing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${clearing ? 'animate-spin' : ''}`} /> {clearing ? 'Flushing...' : 'Flush Logs'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
