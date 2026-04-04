import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AlertTriangle, FileCheck, DollarSign, Users, AlertCircle, ArrowRight, Play, CheckCircle } from 'lucide-react';
import { WhatsAppCommunicationHub } from '../dashboard/WhatsAppCommunicationHub';

export interface ActionQueueItem {
  id: string;
  title: string;
  description: string;
  type: 'urgent_academic' | 'attendance_risk' | 'grading_blocker' | 'payout_blocker' | 'peer_support' | 'followup';
  priority: 'high' | 'medium' | 'low';
  actionLabel: string;
  isIndependentContext?: boolean; // Whether the item is tailored for independent teachers
}

interface NextBestActionQueueProps {
  actions: ActionQueueItem[];
}

export const NextBestActionQueue: React.FC<NextBestActionQueueProps> = ({ actions }) => {
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [whatsappRecipient, setWhatsappRecipient] = useState<{id: string, name: string, role: string, phone: string, context?: string} | undefined>(undefined);

  // Sort actions: high -> medium -> low
  const priorityWeight = { high: 3, medium: 2, low: 1 };
  const sortedActions = [...actions].sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'urgent_academic': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'attendance_risk': return <Users className="w-5 h-5 text-orange-500" />;
      case 'grading_blocker': return <FileCheck className="w-5 h-5 text-indigo-500" />;
      case 'payout_blocker': return <DollarSign className="w-5 h-5 text-green-500" />;
      case 'peer_support': return <Play className="w-5 h-5 text-blue-500" />;
      default: return <AlertCircle className="w-5 h-5 text-slate-500" />;
    }
  };

  const getBgStyle = (priority: string) => {
    if (priority === 'high') return 'bg-red-50/30 border-red-100 hover:border-red-200';
    if (priority === 'medium') return 'bg-orange-50/30 border-orange-100 hover:border-orange-200';
    return 'bg-white border-slate-100 hover:border-slate-200';
  };

  const handleActionClick = (action: ActionQueueItem) => {
    if (action.actionLabel === 'Message Parents') {
      setWhatsappRecipient({
         id: action.id,
         name: 'Group: S2 Parents (5 absentees)',
         role: 'Parents Group',
         phone: 'Broadcast List',
         context: action.description
      });
      setIsWhatsAppOpen(true);
    } else {
      // standard handling (navigation, etc)
      console.log('Action triggered:', action.title);
    }
  };

  return (
    <>
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            Prioritized Action Queue
            <Badge className="bg-indigo-600 ml-2">{actions.length} Pending</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {sortedActions.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p>You're all caught up! No urgent actions required.</p>
              </div>
            ) : (
              sortedActions.map(action => (
                <div key={action.id} className={`p-4 transition-colors border-l-4 group ${getBgStyle(action.priority)} ${action.priority === 'high' ? 'border-l-red-500' : action.priority === 'medium' ? 'border-l-orange-400' : 'border-l-indigo-400'}`}>
                  <div className="flex items-start gap-4">
                    <div className="mt-1 bg-white p-2 rounded-full shadow-sm">
                      {getIcon(action.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-slate-900 truncate">{action.title}</h4>
                        {action.priority === 'high' && (
                          <span className="text-[10px] uppercase font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full whitespace-nowrap ml-2">Urgent</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{action.description}</p>
                      
                      <Button 
                        size="sm" 
                        className={`shadow-sm ${action.priority === 'high' ? 'bg-red-600 hover:bg-red-700' : action.actionLabel.includes('Message') ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                        onClick={() => handleActionClick(action)}
                      >
                        {action.actionLabel}
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      
      <WhatsAppCommunicationHub 
         isOpen={isWhatsAppOpen}
         onClose={() => setIsWhatsAppOpen(false)}
         defaultRecipient={whatsappRecipient}
      />
    </>
  );
};
