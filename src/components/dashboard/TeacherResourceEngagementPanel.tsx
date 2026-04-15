import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { FileText, Video, AlertCircle, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import contentApi, { TeacherContentDashboard } from '../../lib/contentApi';

export const TeacherResourceEngagementPanel: React.FC = () => {
  const [dashboard, setDashboard] = useState<TeacherContentDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    contentApi.dashboard.teacher()
      .then(setDashboard)
      .catch(() => setError('Unable to load resource analytics.'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <Card className="mb-8 border-indigo-100 shadow-sm">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </CardContent>
      </Card>
    );
  }

  if (error || !dashboard) {
    return (
      <Card className="mb-8 border-indigo-100 shadow-sm">
        <CardContent className="py-8 text-center text-sm text-slate-500">
          {error || 'No resource analytics available.'}
        </CardContent>
      </Card>
    );
  }

  const resources = dashboard.resources || [];

  return (
    <Card className="mb-8 border-indigo-100 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-800" />
              Assigned Resource Engagement
            </CardTitle>
            <p className="text-sm text-slate-700 mt-1">Track how long students are actively reading or watching assigned materials.</p>
          </div>
          <Button variant="outline" size="sm">View Full Analytics</Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {resources.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">No assigned resources yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {resources.map((analytics) => {
              const avgTimeMins = Math.round(analytics.avg_time_seconds / 60);
              const totalAssigned = analytics.assigned_count;

              return (
                <div key={analytics.content_item_id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Resource Info */}
                    <div className="md:w-1/3 space-y-2">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg shrink-0 ${analytics.content_type === 'video' ? 'bg-red-50' : 'bg-blue-50'}`}>
                          {analytics.content_type === 'video' ? <Video className="w-5 h-5 text-red-800" /> : <FileText className="w-5 h-5 text-blue-800" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{analytics.title}</h4>
                          <div className="flex gap-2 mt-1">
                            {analytics.subject_name && (
                              <Badge variant="outline" className="text-xs bg-white text-slate-800 border-slate-200">
                                {analytics.subject_name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Engagement Metrics */}
                    <div className="md:w-1/3 grid grid-cols-2 gap-4">
                      <div className="bg-white border rounded-lg p-3 text-center">
                        <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Started</p>
                        <p className="text-2xl font-black text-slate-800">
                          {analytics.started + analytics.in_progress + analytics.completed}
                          <span className="text-sm font-medium text-slate-800">/{totalAssigned}</span>
                        </p>
                      </div>
                      <div className="bg-white border rounded-lg p-3 text-center">
                        <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Avg Active Time</p>
                        <p className="text-2xl font-black text-slate-800">{avgTimeMins}<span className="text-sm font-medium text-slate-800">m</span></p>
                      </div>
                    </div>

                    {/* Completion & Issues */}
                    <div className="md:w-1/3 space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-slate-700">Completion</span>
                          <span className="font-bold text-slate-900">{Math.round(analytics.avg_completion)}%</span>
                        </div>
                        <Progress value={analytics.avg_completion} className="h-2 bg-slate-100" />
                      </div>

                      {analytics.missing_students.length > 0 ? (
                        <div className="bg-amber-500/20 text-amber-100 p-3 text-sm rounded-lg border border-amber-400/40 border-l-4 border-l-amber-400 flex items-start gap-3 shadow-sm">
                          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
                          <div>
                            <span className="font-extrabold text-amber-200">{analytics.missing_students.length} students</span>{' '}
                            <span className="font-medium">have not opened this yet</span>{' '}
                            {analytics.missing_students[0] && (
                              <span className="text-amber-300/80">(e.g. {analytics.missing_students[0]})</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-emerald-500/20 text-emerald-100 p-3 text-sm rounded-lg border border-emerald-400/40 border-l-4 border-l-emerald-400 flex items-center gap-3 shadow-sm">
                          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                          <div className="font-bold text-emerald-200">✨ All students have accessed this resource!</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
