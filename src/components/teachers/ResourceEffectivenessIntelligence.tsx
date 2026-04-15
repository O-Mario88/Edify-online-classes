import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { BarChart3, TrendingUp, TrendingDown, Video, FileText, AlertTriangle } from 'lucide-react';

export interface ResourceEffectivenessItem {
  id: string;
  title: string;
  type: 'video' | 'note' | 'quiz' | 'discussion';
  views: number;
  avgCompletionRate: number;
  impactScore: number; // e.g. +14% score improvement
  status: 'highly_effective' | 'ignored' | 'needs_revision' | 'standard';
}

interface ResourceEffectivenessIntelligenceProps {
  resources: ResourceEffectivenessItem[];
  subjectContext: string;
}

export const ResourceEffectivenessIntelligence: React.FC<ResourceEffectivenessIntelligenceProps> = ({ resources, subjectContext }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4 text-red-700" />;
      case 'note': return <FileText className="w-4 h-4 text-blue-700" />;
      default: return <FileText className="w-4 h-4 text-slate-700" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'highly_effective':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Highly Effective</Badge>;
      case 'ignored':
        return <Badge className="bg-slate-100 text-slate-800 border-slate-200">Ignored</Badge>;
      case 'needs_revision':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Poor Recovery</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="h-full flex flex-col justify-between shadow-sm border-slate-200">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-800" />
              Resource Effectiveness
            </CardTitle>
            <p className="text-sm text-slate-800 mt-1">Impact analysis for {subjectContext}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="divide-y divide-slate-100 flex-1 flex flex-col">
          {resources.map(res => (
            <div key={res.id} className="flex-1 p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-1 bg-white p-2 rounded-lg shadow-sm border border-slate-100">
                  {getIcon(res.type)}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-1">{res.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-700">
                    <span className="font-medium bg-slate-100 px-2 py-0.5 rounded-full">{res.views} uses</span>
                    <span>{res.avgCompletionRate}% completion</span>
                  </div>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                {getStatusBadge(res.status)}
                {res.impactScore > 0 ? (
                  <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" /> +{res.impactScore}% score jump
                  </span>
                ) : res.impactScore < 0 ? (
                  <span className="text-sm font-bold text-red-800 flex items-center gap-1">
                    <TrendingDown className="w-4 h-4" /> {res.impactScore}% score drop
                  </span>
                ) : (
                  <span className="text-sm font-medium text-slate-800 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> No clear impact
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
