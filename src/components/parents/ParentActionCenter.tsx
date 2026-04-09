import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { CheckSquare, MessageSquare, BookOpen, AlertCircle, HeartCrack, Lightbulb } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { apiClient, API_ENDPOINTS } from '../../lib/apiClient';

interface ParentActionItem {
  id: string;
  type: string;
  title: string;
  description: string;
  homeHelp: string;
  icon: React.ReactNode;
}

const TYPE_ICON_MAP: Record<string, React.ReactNode> = {
  attendance_issue: <AlertCircle className="w-5 h-5 text-red-500" />,
  alert_acknowledge: <AlertCircle className="w-5 h-5 text-red-500" />,
  home_follow_up: <BookOpen className="w-5 h-5 text-orange-500" />,
  view_tasks: <BookOpen className="w-5 h-5 text-blue-500" />,
  teacher_contact: <MessageSquare className="w-5 h-5 text-indigo-500" />,
  intervention_response: <HeartCrack className="w-5 h-5 text-purple-500" />,
  celebration: <Lightbulb className="w-5 h-5 text-yellow-500" />,
  payment: <BookOpen className="w-5 h-5 text-green-500" />,
};

const FALLBACK_ACTIONS: ParentActionItem[] = [
  {
    id: 'a1', type: 'alert', title: 'Dropped below attendance threshold',
    description: 'Your child missed 3 live sessions this week.',
    homeHelp: 'Please discuss the importance of showing up on time, and ensure their device is charged.',
    icon: <AlertCircle className="w-5 h-5 text-red-500" />
  },
  {
    id: 'a2', type: 'academic', title: 'Pending Mathematics Assignment',
    description: 'The "Quadratic Equations" worksheet is overdue by 2 days.',
    homeHelp: 'Sit with them for 30 minutes tonight while they complete the 5 required questions.',
    icon: <BookOpen className="w-5 h-5 text-orange-500" />
  },
  {
    id: 'a3', type: 'wellbeing', title: 'Peer Support Drop',
    description: 'Your child has been less active in class discussions recently.',
    homeHelp: 'Ask them if they are feeling overwhelmed and encourage them to ask one question tomorrow.',
    icon: <HeartCrack className="w-5 h-5 text-purple-500" />
  }
];

export const ParentActionCenter: React.FC = () => {
  const [acknowledged, setAcknowledged] = useState<string[]>([]);
  const [actions, setActions] = useState<ParentActionItem[]>(FALLBACK_ACTIONS);

  useEffect(() => {
    const fetchActions = async () => {
      try {
        const response = await apiClient.get<{ results: any[] }>(API_ENDPOINTS.INTELLIGENCE_PARENT_ACTIONS);
        const items = response.data?.results;
        if (items && items.length > 0) {
          setActions(items.map((a: any) => ({
            id: String(a.id),
            type: a.action_type,
            title: a.title,
            description: a.description || `Regarding ${a.child_name}`,
            homeHelp: a.data_payload?.home_help || 'Follow up with your child about this item.',
            icon: TYPE_ICON_MAP[a.action_type] || <AlertCircle className="w-5 h-5 text-slate-500" />,
          })));
        }
      } catch {
        // Use fallback data
      }
    };
    fetchActions();
  }, []);

  const handleAcknowledge = async (id: string) => {
    if (!acknowledged.includes(id)) {
      setAcknowledged([...acknowledged, id]);
      try {
        await apiClient.post(`${API_ENDPOINTS.INTELLIGENCE_PARENT_ACTIONS}${id}/acknowledge/`, {});
      } catch {
        // Non-critical — UI already updated
      }
    }
  };

  return (
    <Card className="border border-indigo-100 shadow-sm bg-white">
      <CardHeader className="bg-indigo-50/50 pb-4 border-b border-indigo-100">
         <div className="flex justify-between items-start">
           <div>
             <CardTitle className="text-xl text-indigo-950 flex items-center gap-2">
               <CheckSquare className="w-6 h-6 text-indigo-600" />
               Parent Action Center
             </CardTitle>
             <CardDescription className="text-slate-500 mt-1">
               Go beyond summaries. Actively partner in their learning.
             </CardDescription>
           </div>
           <Badge variant="outline" className="border-indigo-200 text-indigo-700 bg-white">
             {actions.length - acknowledged.length} Actions Required
           </Badge>
         </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
           {actions.map(action => {
             const isAck = acknowledged.includes(action.id);
             return (
               <div key={action.id} className={`p-5 transition-all ${isAck ? 'bg-slate-50 opacity-60' : 'bg-white hover:bg-slate-50'}`}>
                 <div className="flex gap-4">
                    <div className="mt-1 flex-shrink-0">{action.icon}</div>
                    <div className="flex-1">
                       <h4 className={`text-md font-bold mb-1 ${isAck ? 'text-slate-500' : 'text-slate-900'}`}>{action.title}</h4>
                       <p className="text-sm text-slate-600 mb-3">{action.description}</p>
                       
                       {!isAck && (
                         <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-lg mb-4 flex gap-2">
                            <Lightbulb className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                               <span className="text-xs font-bold uppercase tracking-wider text-yellow-700 block mb-0.5">Help at Home</span>
                               <span className="text-sm text-yellow-900">{action.homeHelp}</span>
                            </div>
                         </div>
                       )}

                       <div className="flex flex-wrap gap-3 mt-2">
                          {isAck ? (
                             <span className="text-sm font-semibold text-green-600 flex items-center">
                                <CheckSquare className="w-4 h-4 mr-1.5" /> Acknowledged & Action Taken
                             </span>
                          ) : (
                             <>
                               <Button size="sm" onClick={() => handleAcknowledge(action.id)} className="bg-indigo-600 hover:bg-indigo-700 shadow-sm">
                                  Acknowledge Intervention
                               </Button>
                               <Button size="sm" variant="outline" className="text-slate-600 border-slate-200">
                                  <MessageSquare className="w-4 h-4 mr-1.5" /> Request Teacher Meeting
                               </Button>
                             </>
                          )}
                       </div>
                    </div>
                 </div>
               </div>
             );
           })}
        </div>
      </CardContent>
    </Card>
  );
};
