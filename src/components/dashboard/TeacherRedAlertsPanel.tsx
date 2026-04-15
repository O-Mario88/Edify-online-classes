import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, FilePlus, Calendar as CalendarIcon, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockAlerts = [
  {
    id: 1,
    studentName: "Michael Kintu",
    severity: "red",
    reason: "Failed 3 consecutive offline Biology tests & missed 2 live sessions",
    status: "active",
    date: "2 hours ago"
  },
  {
    id: 2,
    studentName: "Sarah Namubiru",
    severity: "amber",
    reason: "Online attendance dropped below 40% in Mathematics",
    status: "active",
    date: "Yesterday"
  }
];

import { NotificationEngine } from "../../lib/integrations/NotificationEngine";

import { useState, useEffect } from "react";
import { apiClient } from "../../lib/apiClient";

export function TeacherRedAlertsPanel() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
         // This will hook into Epic 9's InterventionViewSet
         const { data, error } = await apiClient.get('/interventions/plans/');
         if (data && data.length > 0) {
            setAlerts(data);
         } else {
            setAlerts(mockAlerts);
         }
      } catch (err) {
         setAlerts(mockAlerts);
      }
    };
    fetchAlerts();
  }, []);

  const handleMessageParent = (alert: any) => {
    NotificationEngine.send(
      'sms',
      `parent_${alert.id}`,
      '+256700000000', // Mock parent number
      'academic_risk_alert',
      `Maple Alert: ${alert.studentName} has been flagged for academic risk (${alert.reason}). Please connect with the school.`
    );
  };

  return (
    <Card className="border-red-500/20 bg-red-500/5 dark:bg-red-500/10 shadow-lg mb-6">
      <CardHeader className="pb-3 border-b border-red-500/10 dark:border-red-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-500/20 rounded-xl relative">
              <AlertCircle className="w-5 h-5 text-red-800 dark:text-red-400" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-600 rounded-full animate-ping" />
            </div>
            <div>
              <CardTitle className="text-red-900 dark:text-red-200">Intervention Required</CardTitle>
              <CardDescription className="text-red-700/70 dark:text-red-300/70">
                The Academic Risk Engine has flagged {mockAlerts.length} students in your cohort.
              </CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" className="bg-white dark:bg-slate-900 border-red-500/30 text-red-700 hover:bg-red-50 dark:hover:bg-red-900/40">
            View Intervention History
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="grid gap-4">
          {alerts.map(alert => (
            <div key={alert.id} className="flex flex-col md:flex-row items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
              <div className="flex-1 w-full mb-4 md:mb-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{alert.studentName}</span>
                  <Badge variant="outline" className={
                    alert.severity === 'red' 
                      ? 'border-red-500 text-red-800 bg-red-50 dark:bg-red-900/20' 
                      : 'border-amber-500 text-amber-800 bg-amber-50 dark:bg-amber-900/20'
                  }>
                    {alert.severity === 'red' ? 'Critical Risk' : 'High Risk'}
                  </Badge>
                  <span className="text-xs text-slate-800">{alert.date}</span>
                </div>
                <p className="text-sm text-slate-800 dark:text-slate-800">
                  {alert.reason}
                </p>
              </div>
              
              <div className="flex gap-2 w-full md:w-auto">
                <Button 
                   size="sm" 
                   variant="secondary" 
                   className="gap-2 flex-1 md:flex-none bg-blue-50 text-blue-700 hover:bg-blue-100"
                   onClick={() => handleMessageParent(alert)}
                >
                  <MessageSquare className="w-4 h-4" /> Message Parent
                </Button>
                <Button size="sm" variant="secondary" className="gap-2 flex-1 md:flex-none" onClick={() => navigate('/dashboard/teacher/targeting')}>
                  <FilePlus className="w-4 h-4" /> Draft Remedial Task
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
