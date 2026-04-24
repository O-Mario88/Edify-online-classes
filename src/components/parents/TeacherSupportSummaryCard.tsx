import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { FolderCheck, MessageCircle, Video, UserCheck, Loader2 } from 'lucide-react';
import { apiGet } from '../../lib/apiClient';
import { DEMO_SAMPLES, isDemoModeOn } from '../../lib/demoSamples';

interface SupportSummary {
  projects_reviewed: number;
  questions_answered: number;
  live_classes_attended: number;
  most_recent_reviewer?: string | null;
  week_of?: string;
}

/**
 * Teacher Support Summary — Parent dashboard proof that a real teacher
 * interacted with their child this week. Aggregates across
 * mastery_projects reviews, standby_teachers responses, and
 * lessons/live_session attendance. Falls back to an informative empty
 * state if no data yet (e.g. first week).
 */
export const TeacherSupportSummaryCard: React.FC = () => {
  const [s, setS] = useState<SupportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showingDemo, setShowingDemo] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await apiGet<any>('/analytics/parent-dashboard/');
      const teacher_support = data?.teacher_support || {};
      const any_activity = (teacher_support.projects_reviewed || 0)
        + (teacher_support.questions_answered || 0)
        + (teacher_support.live_classes_attended || 0) > 0;

      if (!any_activity && isDemoModeOn()) {
        setS({
          projects_reviewed: DEMO_SAMPLES.teacherSupport.projects_reviewed,
          questions_answered: DEMO_SAMPLES.teacherSupport.questions_answered,
          live_classes_attended: DEMO_SAMPLES.teacherSupport.live_classes_attended,
          most_recent_reviewer: DEMO_SAMPLES.teacherSupport.most_recent_reviewer,
        });
        setShowingDemo(true);
      } else {
        setS({
          projects_reviewed: teacher_support.projects_reviewed || 0,
          questions_answered: teacher_support.questions_answered || 0,
          live_classes_attended: teacher_support.live_classes_attended || 0,
          most_recent_reviewer: teacher_support.most_recent_reviewer || null,
          week_of: teacher_support.week_of || undefined,
        });
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        </CardContent>
      </Card>
    );
  }

  const anyActivity = (s?.projects_reviewed || 0) + (s?.questions_answered || 0) + (s?.live_classes_attended || 0) > 0;

  return (
    <Card className="border-emerald-100">
      {showingDemo && (
        <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-1.5 tracking-wide">
          Preview — this is what the Teacher Support Summary looks like after a normal week.
        </div>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <UserCheck className="w-4 h-4 text-emerald-600" /> Teacher Support Summary
        </CardTitle>
        <p className="text-xs text-slate-600">
          Real teacher interactions with your child this week.
          {s?.week_of && <> · week of <span className="font-medium text-slate-700">{s.week_of}</span></>}
        </p>
      </CardHeader>
      <CardContent>
        {!anyActivity ? (
          <p className="text-sm text-slate-600">
            Teacher support moments will appear here the moment your child interacts with a teacher — a project review, a standby-teacher response, or a live class attended.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {s!.projects_reviewed > 0 && (
              <li className="flex items-center gap-3 text-sm">
                <FolderCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="flex-1 text-slate-700">
                  <strong className="text-slate-900">{s!.projects_reviewed}</strong> project{s!.projects_reviewed === 1 ? '' : 's'} reviewed
                  {s!.most_recent_reviewer && <> by <span className="font-semibold">{s!.most_recent_reviewer}</span></>}
                </span>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px]">Verified</Badge>
              </li>
            )}
            {s!.questions_answered > 0 && (
              <li className="flex items-center gap-3 text-sm">
                <MessageCircle className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="flex-1 text-slate-700">
                  <strong className="text-slate-900">{s!.questions_answered}</strong> question{s!.questions_answered === 1 ? '' : 's'} answered by standby teachers
                </span>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px]">Verified</Badge>
              </li>
            )}
            {s!.live_classes_attended > 0 && (
              <li className="flex items-center gap-3 text-sm">
                <Video className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="flex-1 text-slate-700">
                  <strong className="text-slate-900">{s!.live_classes_attended}</strong> live class{s!.live_classes_attended === 1 ? '' : 'es'} attended
                </span>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px]">Verified</Badge>
              </li>
            )}
          </ul>
        )}
        <p className="text-[11px] text-slate-500 mt-4 pt-3 border-t border-slate-100">
          Verified Teaching Delivery confirms that a lesson was delivered, attended, supported with learning material, and followed by assessment or feedback.
        </p>
      </CardContent>
    </Card>
  );
};

export default TeacherSupportSummaryCard;
