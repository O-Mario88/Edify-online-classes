import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Clock, PlayCircle, Users, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { DashboardGrid } from './layout/DashboardGrid';
import { DashboardCard } from './layout/DashboardCard';
import { Link, useNavigate } from 'react-router-dom';
import { apiGet, API_ENDPOINTS } from '../../lib/apiClient';

// Fallback mock actions if API is unavailable
const DEFAULT_MOCK_ACTIONS = [
  {
    id: 'act-1',
    type: 'project',
    title: 'Computer Science Final Project',
    subtitle: 'Build a Next.js Web App',
    postedBy: 'Mr. Emmanuel Kato',
    status: 'urgent',
    statusLabel: 'Due in 14 Hours',
    colorMode: 'orange',
    actionText: 'Submit Project',
    icon: 'clock'
  },
  {
    id: 'act-2',
    type: 'exercise',
    title: 'Thermodynamics Lab Report',
    subtitle: 'Physics • S4 Core',
    postedBy: 'Dr. Sarah Jenkins',
    status: 'normal',
    statusLabel: 'Due in 2 Days',
    colorMode: 'indigo',
    actionText: 'Start Exercise',
    icon: 'check'
  },
  {
    id: 'act-3',
    type: 'missed',
    title: 'Cellular Respiration',
    subtitle: 'Biology • Missed Yesterday',
    postedBy: 'System',
    status: 'warning',
    statusLabel: 'Attendance Gap',
    colorMode: 'blue',
    actionText: 'Watch Recording',
    icon: 'play'
  },
  {
    id: 'act-4',
    type: 'peer',
    title: 'Help Samuel with History',
    subtitle: 'You scored 92% in this topic',
    postedBy: 'Samuel K.',
    status: 'neutral',
    statusLabel: 'Peer Tutoring Match',
    colorMode: 'emerald',
    actionText: 'Accept Request',
    icon: 'users'
  },
  {
    id: 'act-5',
    type: 'completed',
    title: 'Sets, Logic and Reasoning',
    subtitle: 'Mathematics • Graded: 94%',
    postedBy: 'Mr. Obura',
    status: 'success',
    statusLabel: 'Completed',
    colorMode: 'slate',
    actionText: 'Review Feedback',
    icon: 'check'
  },
  {
    id: 'act-6',
    type: 'missed',
    title: 'Geography Map Reading Quiz',
    subtitle: '0/10 Score • Deadline Passed',
    postedBy: 'Madam Ruth',
    status: 'critical',
    statusLabel: 'Missed Deadline',
    colorMode: 'red',
    actionText: 'Request Extension',
    icon: 'clock'
  },
  {
    id: 'act-7',
    type: 'exercise',
    title: 'Atomic Structure Basics',
    subtitle: 'Chemistry • Teacher Requested Re-review',
    postedBy: 'Dr. Sarah Jenkins',
    status: 'warning',
    statusLabel: 'Review Priority',
    colorMode: 'orange',
    actionText: 'Retry Practice',
    icon: 'users'
  }
];

interface StudentAction {
  id: string | number;
  type: string;
  title: string;
  subtitle: string;
  postedBy: string;
  status: string;
  statusLabel: string;
  colorMode: string;
  actionText: string;
  icon: string;
}

export const StudentActionCenter = () => {
  const [actions, setActions] = useState<StudentAction[]>(DEFAULT_MOCK_ACTIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  // Modal state for peer/missed actions (expand as needed)
  const [modalAction, setModalAction] = useState<StudentAction | null>(null);

  useEffect(() => {
    const fetchActions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch assessments for action items
        const assessmentsResponse = await apiGet<any>(API_ENDPOINTS.ASSESSMENTS);
        
        if (assessmentsResponse.data?.results) {
          // Transform API data to action format
          const apiActions = assessmentsResponse.data.results.map((assessment: any, index: number) => ({
            id: assessment.id,
            type: 'assignment',
            title: assessment.title || 'Untitled Assessment',
            subtitle: `${assessment.get_difficulty_display || 'Assessment'} • ${index + 1} of ${assessmentsResponse.data.results.length}`,
            postedBy: 'System',
            status: assessment.is_complete ? 'success' : 'normal',
            statusLabel: assessment.is_complete ? 'Completed' : 'Pending',
            colorMode: assessment.is_complete ? 'slate' : 'blue',
            actionText: assessment.is_complete ? 'Review' : 'Start',
            icon: assessment.is_complete ? 'check' : 'play'
          }));
          
          // Mix API data with some default mock actions for better UX
          setActions(apiActions.length > 0 ? apiActions : DEFAULT_MOCK_ACTIONS);
        } else {
          setActions(DEFAULT_MOCK_ACTIONS);
        }
      } catch (err) {
        console.error('Error fetching actions:', err);
        // Fall back to mock data on error
        setActions(DEFAULT_MOCK_ACTIONS);
      } finally {
        setLoading(false);
      }
    };

    fetchActions();
  }, []);

  return (
    <>
      <DashboardGrid>
        {error && (
        <DashboardCard colSpan={1} mdColSpan={12} lgColSpan={12}>
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <p className="text-sm text-amber-300">{error}</p>
            </CardContent>
          </Card>
        </DashboardCard>
      )}
      
      {actions.map((action) => {
        // Handler for action button
        const handleAction = () => {
          if (action.type === 'exercise') {
            navigate(`/exercises/${action.id}`);
          } else if (action.type === 'project') {
            navigate(`/projects`);
          } else if (action.type === 'assignment') {
            navigate(`/assignments/${action.id}`);
          } else if (action.type === 'completed') {
            navigate(`/assignments/${action.id}/feedback`);
          } else if (action.type === 'missed') {
            navigate(`/dashboard/sessions/recover/${action.id}`);
          } else if (action.type === 'peer') {
            navigate(`/peer-tutoring`);
          } else {
            setModalAction(action);
          }
        };
        // Dynamic styling based on colorMode
        const colorStyles = {
          orange: 'border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10 text-orange-400',
          orangeBg: 'bg-orange-500',
          orangeBadge: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
          orangeBtn: 'bg-orange-600 hover:bg-orange-500 shadow-orange-900/20 group-hover:shadow-orange-900/40',
          
          blue: 'border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 text-blue-400',
          blueBg: 'bg-blue-500',
          blueBadge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          blueBtn: 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20 group-hover:shadow-blue-900/40',
          
          emerald: 'border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400',
          emeraldBg: 'bg-emerald-500',
          emeraldBadge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          emeraldBtn: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20 group-hover:shadow-emerald-900/40',

          indigo: 'border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400',
          indigoBg: 'bg-indigo-500',
          indigoBadge: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
          indigoBtn: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20 group-hover:shadow-indigo-900/40',

          slate: 'border-slate-500/30 bg-slate-500/5 hover:bg-slate-500/10 text-slate-800',
          slateBg: 'bg-slate-500',
          slateBadge: 'bg-slate-500/20 text-slate-800 border-slate-500/30',
          slateBtn: 'bg-slate-600 hover:bg-slate-500 shadow-slate-900/20 group-hover:shadow-slate-900/40',

          red: 'border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-700',
          redBg: 'bg-red-500',
          redBadge: 'bg-red-500/20 text-red-400 border-red-500/30',
          redBtn: 'bg-red-600 hover:bg-red-500 shadow-red-900/20 group-hover:shadow-red-900/40'
        }[action.colorMode] as any || {};

        return (
          <DashboardCard key={action.id} colSpan={1} mdColSpan={4} lgColSpan={4} variant="transparent">
            <Card className={`h-full border transition-colors relative overflow-hidden group ${colorStyles.match(/border-[a-z]+-500\/30/)?.[0]} ${colorStyles.match(/bg-[a-z]+-500\/5/)?.[0]} ${colorStyles.match(/hover:bg-[a-z]+-500\/10/)?.[0]}`}>
              <div className={`absolute top-0 left-0 w-1 h-full ${action.colorMode === 'orange' ? 'bg-orange-500' : action.colorMode === 'blue' ? 'bg-blue-500' : action.colorMode === 'emerald' ? 'bg-emerald-500' : action.colorMode === 'indigo' ? 'bg-indigo-500' : action.colorMode === 'slate' ? 'bg-slate-500' : 'bg-red-500'}`}></div>
              <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={`border font-semibold uppercase tracking-wider text-[10px] ${action.colorMode === 'orange' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 
                                                                                                  action.colorMode === 'blue' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 
                                                                                                  action.colorMode === 'emerald' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                                                                                                  action.colorMode === 'indigo' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 
                                                                                                  action.colorMode === 'slate' ? 'bg-slate-500/30 text-slate-300 border-slate-500/40' : 
                                                                                                  'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                      {action.statusLabel}
                    </Badge>
                    {action.icon === 'clock' && <Clock className={`w-5 h-5 text-${action.colorMode}-400`} />}
                    {action.icon === 'play' && <PlayCircle className={`w-5 h-5 text-${action.colorMode}-400`} />}
                    {action.icon === 'users' && <Users className={`w-5 h-5 text-${action.colorMode}-400`} />}
                    {action.icon === 'check' && <CheckCircle className={`w-5 h-5 text-${action.colorMode}-400`} />}
                  </div>
                  <h3 className="font-bold text-white text-lg leading-tight mb-1">{action.title}</h3>
                  <p className="text-sm text-slate-800 font-medium mb-1">{action.subtitle}</p>
                  <p className="text-[11px] text-slate-700 uppercase tracking-wider font-bold">Teacher: {action.postedBy}</p>
                </div>
                <Button
                  className={`w-full text-white shadow-lg ${action.colorMode === 'orange' ? 'bg-orange-600 hover:bg-orange-500 shadow-orange-900/20 group-hover:shadow-orange-900/40' : 
                                                                 action.colorMode === 'blue' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20 group-hover:shadow-blue-900/40' : 
                                                                 action.colorMode === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20 group-hover:shadow-emerald-900/40' : 
                                                                 action.colorMode === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20 group-hover:shadow-indigo-900/40' : 
                                                                 action.colorMode === 'slate' ? 'bg-slate-600 hover:bg-slate-500 shadow-slate-900/20 group-hover:shadow-slate-900/40' : 
                                                                 'bg-red-600 hover:bg-red-500 shadow-red-900/20 group-hover:shadow-red-900/40'}`}
                  onClick={handleAction}
                >
                  {action.actionText} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </DashboardCard>
        );
      })}
    </DashboardGrid>
    {/* Modal for peer/missed actions (placeholder) */}
    {modalAction && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
          <h2 className="text-lg font-bold mb-4">{modalAction.title}</h2>
          <p className="mb-4">This action requires a custom modal implementation.</p>
          <Button onClick={() => setModalAction(null)}>Close</Button>
        </div>
      </div>
    )}
    </>
  );
};
