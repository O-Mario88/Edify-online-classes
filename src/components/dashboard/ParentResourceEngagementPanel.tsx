import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { BookOpen, AlertCircle, Clock, CheckCircle2, TrendingUp, Loader2 } from 'lucide-react';
import contentApi, { ParentContentDashboard } from '../../lib/contentApi';

export const ParentResourceEngagementPanel: React.FC = () => {
  const [dashboard, setDashboard] = useState<ParentContentDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    contentApi.dashboard.parent()
      .then(setDashboard)
      .catch(() => setError('Unable to load your child\'s learning data.'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <Card className="mb-8 border-indigo-100 shadow-sm bg-white">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </CardContent>
      </Card>
    );
  }

  if (error || !dashboard) {
    return (
      <Card className="mb-8 border-indigo-100 shadow-sm bg-white">
        <CardContent className="py-8 text-center text-sm text-slate-500">
          {error || 'No learning data available.'}
        </CardContent>
      </Card>
    );
  }

  const children = dashboard.children || [];

  return (
    <Card className="mb-8 border-indigo-100 shadow-sm bg-white">
      <CardHeader className="border-b pb-4 bg-slate-50">
        <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
          <BookOpen className="w-5 h-5 text-indigo-800" />
          Learning Materials Progress
        </CardTitle>
        <p className="text-sm text-slate-700">Track how your child is engaging with assigned reading and video materials.</p>
      </CardHeader>
      <CardContent className="p-0">
        {children.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">No assigned content data available.</div>
        ) : (
          children.map((child) => (
            <div key={child.child_id}>
              {children.length > 1 && (
                <div className="px-6 pt-4 pb-2 bg-slate-50 border-b">
                  <h3 className="font-bold text-slate-800">{child.child_name}</h3>
                  <p className="text-xs text-slate-600">
                    {child.total_assigned} assigned • {child.completed_count} completed • {child.not_started_count} not started
                  </p>
                </div>
              )}
              <div className="divide-y divide-slate-100">
                {child.assigned_content.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500">No assignments yet.</div>
                ) : (
                  child.assigned_content.map((resource) => {
                    const status = resource.engagement?.status || 'not_started';
                    const timeSpent = Math.round((resource.engagement?.active_time_seconds || 0) / 60);
                    const completion = resource.engagement?.completion_percentage || 0;

                    return (
                      <div key={resource.assignment_id} className="p-4 sm:p-6 flex flex-col md:flex-row gap-6 hover:bg-slate-50 transition-colors">
                        <div className="md:w-1/3">
                          <p className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-1">{resource.subject_name || 'General'}</p>
                          <h4 className="font-bold text-slate-900 leading-tight">{resource.content_title}</h4>
                          <div className="flex items-center gap-2 mt-2">
                            {status === 'not_started' && <StatusBadge className="text-orange-600 border-orange-200 bg-orange-50">Not Started</StatusBadge>}
                            {(status === 'started' || status === 'in_progress') && <StatusBadge className="text-blue-800 border-blue-200 bg-blue-50">In Progress</StatusBadge>}
                            {status === 'completed' && <StatusBadge className="text-emerald-800 border-green-200 bg-green-50">Completed</StatusBadge>}
                          </div>
                        </div>

                        <div className="md:w-2/3 space-y-4">
                          <div className={`p-3 rounded-lg flex gap-3 text-sm border ${
                            status === 'not_started' ? 'bg-orange-50 border-orange-100 text-orange-700' :
                            status === 'completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                            'bg-indigo-50 border-indigo-100 text-indigo-700'
                          }`}>
                            <div className="shrink-0 mt-0.5">
                              {status === 'not_started' && <AlertCircle className="w-4 h-4 text-orange-600" />}
                              {status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                              {(status === 'started' || status === 'in_progress') && <TrendingUp className="w-4 h-4 text-indigo-800" />}
                            </div>
                            <p className="leading-relaxed font-medium">
                              {status === 'not_started'
                                ? `Your child has not yet opened "${resource.content_title}".`
                                : status === 'completed'
                                ? `Your child completed this resource in ${timeSpent} minutes.`
                                : `Your child has spent ${timeSpent} minutes and is ${completion}% through this resource.`}
                            </p>
                          </div>

                          {status !== 'not_started' && (
                            <div className="flex items-center gap-6 text-xs text-slate-700 font-medium">
                              <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded">
                                <Clock className="w-3 h-3" /> {timeSpent} mins spent
                              </span>
                              <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded">
                                <CheckCircle2 className="w-3 h-3" /> {completion}% complete
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

const StatusBadge: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-semibold text-xs border ${className}`}>
    {children}
  </span>
);
