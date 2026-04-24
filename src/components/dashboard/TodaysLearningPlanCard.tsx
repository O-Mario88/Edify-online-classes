import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, PlayCircle, Wrench, FolderKanban, Video, FileText, Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useStudyPlanner } from '../../hooks/useIntelligence';
import { DEMO_SAMPLES, isDemoModeOn } from '../../lib/demoSamples';

/**
 * Today's Learning Plan — the hero card at the top of the Student Dashboard.
 *
 * Pulls from the existing SmartStudyPlanner data and turns it into a
 * scannable "do these 3-5 things next" list. Every prompt is linked to
 * the right inline experience (practice lab, live class, project,
 * mistake notebook), never a dead route.
 */

const TASK_META: Record<string, { icon: any; tint: string; label: string }> = {
  practice:     { icon: Wrench,      tint: 'bg-emerald-50 text-emerald-600 border-emerald-100', label: 'Practice Lab' },
  video:        { icon: PlayCircle,  tint: 'bg-blue-50 text-blue-600 border-blue-100',           label: 'Video Lesson' },
  reading:      { icon: FileText,    tint: 'bg-amber-50 text-amber-600 border-amber-100',        label: 'Reading' },
  assignment:   { icon: FolderKanban,tint: 'bg-indigo-50 text-indigo-600 border-indigo-100',     label: 'Assignment' },
  project:      { icon: FolderKanban,tint: 'bg-indigo-50 text-indigo-600 border-indigo-100',     label: 'Mastery Project' },
  live_session: { icon: Video,       tint: 'bg-rose-50 text-rose-600 border-rose-100',           label: 'Live Class' },
  revision:     { icon: Sparkles,    tint: 'bg-violet-50 text-violet-600 border-violet-100',     label: 'Revise' },
  intervention: { icon: Sparkles,    tint: 'bg-violet-50 text-violet-600 border-violet-100',     label: 'Support' },
};

const DEFAULT_META = { icon: Sparkles, tint: 'bg-slate-50 text-slate-600 border-slate-100', label: 'Task' };


export const TodaysLearningPlanCard: React.FC = () => {
  const { dailyPlan } = useStudyPlanner();
  const [today, setToday] = useState<any[]>([]);
  const [showingDemo, setShowingDemo] = useState(false);

  useEffect(() => {
    if (Array.isArray(dailyPlan) && dailyPlan.length > 0) {
      const first = dailyPlan[0];
      const tasks = Array.isArray(first?.tasks) ? first.tasks : (Array.isArray(first) ? first : []);
      setToday(tasks.slice(0, 5));
    } else if (isDemoModeOn()) {
      setToday(DEMO_SAMPLES.todaysPlan);
      setShowingDemo(true);
    }
  }, [dailyPlan]);

  const empty = !today || today.length === 0;

  return (
    <Card className="border-indigo-100 bg-gradient-to-br from-white via-indigo-50/40 to-blue-50/40 shadow-sm overflow-hidden">
      {showingDemo && (
        <div className="bg-indigo-600 text-white text-xs font-semibold px-4 py-1.5 tracking-wide">
          Preview — this is what Today's Learning Plan looks like once you start.
        </div>
      )}
      <CardContent className="p-6 md:p-7">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-indigo-700 mb-1">Today's Learning Plan</p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">Do these {empty ? 'few things' : today.length} things next.</h2>
            <p className="text-sm text-slate-600 mt-2 max-w-xl">Personalised from your diagnostic, enrolled tracks, and upcoming live classes. Finish the list and your progress ticks up.</p>
          </div>
          <Sparkles className="w-8 h-8 text-indigo-500 shrink-0 hidden md:block" />
        </div>

        {empty ? (
          <div className="rounded-xl bg-white border border-dashed border-slate-200 p-6 text-center">
            <p className="text-sm text-slate-700 font-medium">Take a diagnostic test to unlock a personalized weekly study plan.</p>
            <Link to="/diagnostic">
              <Button size="sm" className="mt-4 bg-indigo-600 hover:bg-indigo-700">
                Start 10-minute diagnostic <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        ) : (
          <ol className="space-y-2">
            {today.map((t: any, i: number) => {
              const type = (t.task_type || t.type || 'practice').toString();
              const meta = TASK_META[type] || DEFAULT_META;
              const Icon = meta.icon;
              const done = t.status === 'completed';
              return (
                <li key={i} className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${done ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-slate-100'}`}>
                  <span className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${meta.tint}`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${done ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                      {t.title || t.description || meta.label}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-white">{meta.label}</Badge>
                      {(t.estimated_minutes || t.duration) && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {t.estimated_minutes || t.duration} min
                        </span>
                      )}
                      {t.subject_name && <span>· {t.subject_name}</span>}
                    </div>
                  </div>
                  {done && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                </li>
              );
            })}
          </ol>
        )}

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">Progress insights are built from lessons completed, practice activity, attendance, assessments, and teacher feedback.</p>
          <Link to="/learning-path" className="text-xs font-semibold text-indigo-700 hover:text-indigo-800 inline-flex items-center gap-1 whitespace-nowrap ml-4">
            Full plan <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default TodaysLearningPlanCard;
