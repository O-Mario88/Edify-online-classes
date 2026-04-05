import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Clock, PlayCircle, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { DashboardGrid } from './layout/DashboardGrid';
import { DashboardCard } from './layout/DashboardCard';
import { Link } from 'react-router-dom';

const MOCK_ACTIONS = [
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
  }
];

export const StudentActionCenter: React.FC = () => {
  return (
    <DashboardGrid>
      {MOCK_ACTIONS.map((action) => {
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

          slate: 'border-slate-500/30 bg-slate-500/5 hover:bg-slate-500/10 text-slate-400',
          slateBg: 'bg-slate-500',
          slateBadge: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
          slateBtn: 'bg-slate-600 hover:bg-slate-500 shadow-slate-900/20 group-hover:shadow-slate-900/40',

          red: 'border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-500',
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
                  <p className="text-sm text-slate-400 font-medium mb-1">{action.subtitle}</p>
                  <p className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">Teacher: {action.postedBy}</p>
                </div>
                <Button className={`w-full text-white shadow-lg ${action.colorMode === 'orange' ? 'bg-orange-600 hover:bg-orange-500 shadow-orange-900/20 group-hover:shadow-orange-900/40' : 
                                                                 action.colorMode === 'blue' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20 group-hover:shadow-blue-900/40' : 
                                                                 action.colorMode === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20 group-hover:shadow-emerald-900/40' : 
                                                                 action.colorMode === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20 group-hover:shadow-indigo-900/40' : 
                                                                 action.colorMode === 'slate' ? 'bg-slate-600 hover:bg-slate-500 shadow-slate-900/20 group-hover:shadow-slate-900/40' : 
                                                                 'bg-red-600 hover:bg-red-500 shadow-red-900/20 group-hover:shadow-red-900/40'}`}>
                  {action.actionText} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </DashboardCard>
        );
      })}
    </DashboardGrid>
  );
};
