import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, GraduationCap, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { apiGet } from '../../lib/apiClient';

interface MyEnrollment {
  id: string;
  status: string;
  progress_percentage: number;
  track: {
    id: string;
    slug: string;
    title: string;
    tagline?: string;
    exam_track?: string;
    subject_name?: string | null;
    class_level_name?: string | null;
  };
}

/**
 * Student dashboard card for Maple Mastery Studio.
 *
 * Shows the learner's active tracks (up to 3) or an onboarding prompt
 * if they haven't enrolled yet. Keeps the full catalog one click away.
 */
export const StudentMasteryTracksCard: React.FC = () => {
  const [enrollments, setEnrollments] = useState<MyEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await apiGet<MyEnrollment[]>('/mastery/enrollments/my-tracks/');
      if (!error && Array.isArray(data)) setEnrollments(data);
      setLoading(false);
    })();
  }, []);

  const active = enrollments.filter(e => e.status !== 'completed').slice(0, 3);

  return (
    <Card className="border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="w-4 h-4 text-indigo-600" /> Maple Mastery Studio
        </CardTitle>
        <p className="text-xs text-slate-600">Guided tracks that prove what you can do — with real projects and teacher feedback.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <p className="text-sm text-slate-500">Loading your tracks…</p>
        ) : active.length === 0 ? (
          <div className="rounded-xl bg-white border border-dashed border-indigo-200 p-5 text-center">
            <GraduationCap className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-900">No track enrolled yet.</p>
            <p className="text-xs text-slate-600 mt-1 mb-3">Pick a Mastery Track to start earning a verified credential.</p>
            <Link to="/mastery">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">Browse Mastery Tracks</Button>
            </Link>
          </div>
        ) : (
          <>
            <ul className="space-y-3">
              {active.map(e => (
                <li key={e.id}>
                  <Link to={`/mastery/${e.track.slug}`} className="block rounded-lg border border-slate-100 bg-white p-3 hover:border-indigo-200 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{e.track.title}</p>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {e.track.subject_name && (
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-white">{e.track.subject_name}</Badge>
                          )}
                          {e.track.exam_track && (
                            <Badge className="text-[10px] py-0 px-1.5 bg-blue-50 text-blue-700 border-blue-100">{e.track.exam_track}</Badge>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-bold text-indigo-700 shrink-0">{Math.round(e.progress_percentage)}%</span>
                    </div>
                    <Progress value={e.progress_percentage} className="h-1.5" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="/mastery" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-800">
              Browse all tracks <ArrowRight className="w-3 h-3" />
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentMasteryTracksCard;
