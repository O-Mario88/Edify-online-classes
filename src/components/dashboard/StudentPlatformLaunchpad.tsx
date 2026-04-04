import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { BookOpen, ShoppingBag, FolderGit2, Bot, ArrowRight, ShieldCheck } from 'lucide-react';
import { DashboardGrid } from './layout/DashboardGrid';
import { DashboardCard } from './layout/DashboardCard';
import { Link } from 'react-router-dom';

export const StudentPlatformLaunchpad: React.FC = () => {
  return (
    <DashboardGrid>
      {/* Exams Center */}
      <DashboardCard colSpan={1} mdColSpan={6} lgColSpan={3} variant="transparent">
        <Card className="h-full border border-white/10 bg-gradient-to-br from-white/5 to-white/0 hover:bg-white/10 transition-colors group">
          <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="font-bold text-white text-lg leading-tight mb-1">Exams & Registration</h3>
              <p className="text-sm text-slate-400 font-medium">Mid-Term exams approaching in 14 days.</p>
            </div>
            <Link to="/tools/exams">
              <Button variant="ghost" className="w-full justify-between hover:bg-white/10 text-indigo-300 font-bold px-0 p-0 hover:px-3 h-auto py-2 transition-all group-hover:px-3 group-hover:bg-indigo-500/10">
                View Timetable <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </DashboardCard>

      {/* Projects Engine */}
      <DashboardCard colSpan={1} mdColSpan={6} lgColSpan={3} variant="transparent">
        <Card className="h-full border border-white/10 bg-gradient-to-br from-white/5 to-white/0 hover:bg-white/10 transition-colors group">
          <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-4">
                <FolderGit2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="font-bold text-white text-lg leading-tight mb-1">Project Workspaces</h3>
              <p className="text-sm text-slate-400 font-medium">1 Active Collaboration: Renewable Energy Model.</p>
            </div>
            <Link to="/tools/projects">
              <Button variant="ghost" className="w-full justify-between hover:bg-white/10 text-emerald-300 font-bold px-0 p-0 hover:px-3 h-auto py-2 transition-all group-hover:px-3 group-hover:bg-emerald-500/10">
                Open Workspace <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </DashboardCard>

      {/* Marketplace */}
      <DashboardCard colSpan={1} mdColSpan={6} lgColSpan={3} variant="transparent">
        <Card className="h-full border border-white/10 bg-gradient-to-br from-white/5 to-white/0 hover:bg-white/10 transition-colors group">
          <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="font-bold text-white text-lg leading-tight mb-1">Academic Marketplace</h3>
              <p className="text-sm text-slate-400 font-medium">Missing 2 required textbooks for Term 2.</p>
            </div>
            <Link to="/marketplace">
              <Button variant="ghost" className="w-full justify-between hover:bg-white/10 text-amber-300 font-bold px-0 p-0 hover:px-3 h-auto py-2 transition-all group-hover:px-3 group-hover:bg-amber-500/10">
                Browse Materials <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </DashboardCard>

      {/* Edify AI Tutor */}
      <DashboardCard colSpan={1} mdColSpan={6} lgColSpan={3} variant="transparent">
        <Card className="h-full border border-white/10 bg-gradient-to-br from-white/5 to-white/0 hover:bg-white/10 transition-colors group">
          <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-4">
                <Bot className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-bold text-white text-lg leading-tight mb-1">Maple AI Tutor</h3>
              <p className="text-sm text-slate-400 font-medium">Your interactive agent for math and science.</p>
            </div>
            <Link to="/tools/ai-assistant">
              <Button variant="ghost" className="w-full justify-between hover:bg-white/10 text-blue-300 font-bold px-0 p-0 hover:px-3 h-auto py-2 transition-all group-hover:px-3 group-hover:bg-blue-500/10">
                Ask a Question <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </DashboardCard>
    </DashboardGrid>
  );
};
