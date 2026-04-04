import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Clock, PlayCircle, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { DashboardGrid } from './layout/DashboardGrid';
import { DashboardCard } from './layout/DashboardCard';
import { Link } from 'react-router-dom';

export const StudentActionCenter: React.FC = () => {
  return (
    <DashboardGrid>
      {/* Pending Assignment Card */}
      <DashboardCard colSpan={1} mdColSpan={4} lgColSpan={4} variant="transparent">
        <Card className="h-full border border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10 transition-colors relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
          <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
            <div>
              <div className="flex justify-between items-start mb-2">
                <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30 font-semibold uppercase tracking-wider text-[10px]">Due in 14 Hours</Badge>
                <Clock className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="font-bold text-white text-lg leading-tight mb-1">Thermodynamics Lab Report</h3>
              <p className="text-sm text-slate-400 font-medium">Physics • S4 Core</p>
            </div>
            <Button className="w-full bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-900/20 group-hover:shadow-orange-900/40">
              Submit Homework <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </DashboardCard>

      {/* Missed Session Recovery */}
      <DashboardCard colSpan={1} mdColSpan={4} lgColSpan={4} variant="transparent">
        <Card className="h-full border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 transition-colors relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
            <div>
              <div className="flex justify-between items-start mb-2">
                <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold uppercase tracking-wider text-[10px]">Attendance Gap</Badge>
                <PlayCircle className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="font-bold text-white text-lg leading-tight mb-1">Cellular Respiration</h3>
              <p className="text-sm text-slate-400 font-medium">Biology • Missed Yesterday</p>
            </div>
            <Link to="/tools/missed-session-recovery">
              <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 group-hover:shadow-blue-900/40">
                Watch Recording <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </DashboardCard>

      {/* Peer Collaboration Match */}
      <DashboardCard colSpan={1} mdColSpan={4} lgColSpan={4} variant="transparent">
        <Card className="h-full border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
          <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
            <div>
              <div className="flex justify-between items-start mb-2">
                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold uppercase tracking-wider text-[10px]">Peer Tutoring Match</Badge>
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-bold text-white text-lg leading-tight mb-1">Help Samuel with History</h3>
              <p className="text-sm text-slate-400 font-medium">You scored 92% in this topic</p>
            </div>
            <Link to="/tools/peer-tutoring">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 group-hover:shadow-emerald-900/40">
                Accept Request <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </DashboardCard>
    </DashboardGrid>
  );
};
