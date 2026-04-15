import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { BookOpen, FileText, PlayCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import contentApi, { StudentContentDashboard, ContentAssignment, ContinueLearningItem } from '../../lib/contentApi';

export const StudentResourceEngagementPanel: React.FC = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<StudentContentDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    contentApi.dashboard.student()
      .then(setDashboard)
      .catch(() => setError('Unable to load your learning data.'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <Card className="mb-8 shadow-sm">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  if (error || !dashboard) {
    return (
      <Card className="mb-8 shadow-sm">
        <CardContent className="py-8 text-center text-sm text-slate-500">
          {error || 'No learning data available.'}
        </CardContent>
      </Card>
    );
  }

  // Merge assignments and continue_learning into a unified display list
  const items: Array<{
    id: string;
    title: string;
    type: string;
    subject: string;
    completionPercentage: number;
    dueDate: string | null;
    status: string;
  }> = [];

  dashboard.assignments.forEach((a: ContentAssignment) => {
    items.push({
      id: a.content_item,
      title: a.content_title,
      type: a.content_type,
      subject: a.subject_name || '',
      completionPercentage: a.engagement?.completion_percentage ?? 0,
      dueDate: a.due_date,
      status: a.engagement?.status || 'not_started',
    });
  });

  // Add continue_learning items that aren't already shown via assignments
  const assignedIds = new Set(items.map(i => i.id));
  dashboard.continue_learning.forEach((cl: ContinueLearningItem) => {
    if (!assignedIds.has(cl.content_item_id)) {
      items.push({
        id: cl.content_item_id,
        title: cl.title,
        type: cl.content_type,
        subject: cl.subject_name || '',
        completionPercentage: cl.completion_percentage,
        dueDate: null,
        status: cl.status,
      });
    }
  });

  const isVideo = (type: string) => type === 'video';

  return (
    <Card className="mb-8 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-700" />
          Continue Learning
        </CardTitle>
        <p className="text-sm text-slate-700">Pick up where you left off on your assigned reading and video materials.</p>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">No assigned resources yet. Check back later!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((resource) => (
              <div key={resource.id} className="bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-sm hover:border-indigo-300 dark:hover:border-blue-400 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className={`p-2 rounded-lg shrink-0 ${isVideo(resource.type) ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
                      {isVideo(resource.type) ? <PlayCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    <span className="text-xs font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full">{resource.subject}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 leading-tight mb-1">{resource.title}</h4>
                  <p className="text-xs text-slate-700 mb-4">
                    {resource.dueDate ? `Assigned • Due ${resource.dueDate}` : 'In Progress'}
                  </p>

                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-xs font-medium text-slate-800">
                      <span>Progress</span>
                      <span>{resource.completionPercentage}%</span>
                    </div>
                    <Progress value={resource.completionPercentage} className={`h-1.5 ${isVideo(resource.type) ? '[&>div]:bg-red-500' : '[&>div]:bg-blue-500'}`} />
                  </div>
                </div>

                <Button
                  onClick={() => navigate('/library')}
                  className={`w-full gap-2 ${isVideo(resource.type) ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {isVideo(resource.type) ? 'Continue Watching' : 'Continue Reading'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
