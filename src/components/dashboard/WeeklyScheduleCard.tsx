import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Calendar, Video, Clock } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';

interface RawSession {
  id: number | string;
  scheduled_start?: string;
  duration_minutes?: number;
  status?: string;
  lesson?: { title?: string; subject_name?: string; parent_class?: { subject?: { name?: string } } };
  meeting_link?: string;
}

interface WeekDay {
  label: string;
  date: Date;
  iso: string;
  sessions: Array<{
    id: string;
    title: string;
    subject: string;
    time: string;
    duration: number;
    meetingLink?: string;
  }>;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Renders this week (Mon-Sun) with each day's live sessions laid out
 * inline. Replaces the single-session "Next Live Session" card that
 * couldn't show students what was happening Tuesday or Thursday.
 *
 * Empty days render as a thin "Free" row so the learner can scan the
 * whole week without scrolling. Past days for the current week are
 * dimmed.
 */
export const WeeklyScheduleCard: React.FC = () => {
  const [sessions, setSessions] = useState<RawSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await apiClient.get<RawSession[]>('/live-sessions/live-session/');
      setSessions(Array.isArray(data) ? data : []);
      setLoading(false);
    };
    load();
  }, []);

  const week: WeekDay[] = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Find Monday of this week
    const monday = new Date(today);
    const dayIdx = monday.getDay(); // 0=Sun
    const daysSinceMonday = (dayIdx + 6) % 7;
    monday.setDate(monday.getDate() - daysSinceMonday);

    const days: WeekDay[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push({
        label: WEEKDAYS[d.getDay()],
        date: d,
        iso: d.toISOString().slice(0, 10),
        sessions: [],
      });
    }

    sessions.forEach((s) => {
      if (!s.scheduled_start || s.status === 'cancelled') return;
      const start = new Date(s.scheduled_start);
      const iso = start.toISOString().slice(0, 10);
      const slot = days.find((d) => d.iso === iso);
      if (!slot) return; // outside this week
      slot.sessions.push({
        id: String(s.id),
        title: s.lesson?.title || 'Live Session',
        subject: s.lesson?.subject_name || s.lesson?.parent_class?.subject?.name || 'Class',
        time: start.toTimeString().slice(0, 5),
        duration: s.duration_minutes ?? 60,
        meetingLink: s.meeting_link,
      });
    });

    days.forEach((d) => d.sessions.sort((a, b) => a.time.localeCompare(b.time)));
    return days;
  }, [sessions]);

  const totalSessions = week.reduce((acc, d) => acc + d.sessions.length, 0);
  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-100">
        <CardTitle className="text-md flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          This Week's Schedule
          <Badge variant="outline" className="ml-2">{totalSessions} session{totalSessions === 1 ? '' : 's'}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        {loading && <div className="py-6 text-center text-sm text-slate-500">Loading schedule…</div>}
        {!loading && totalSessions === 0 && (
          <div className="py-6 text-center">
            <p className="text-sm font-semibold text-slate-700 mb-1">No live sessions this week.</p>
            <p className="text-xs text-slate-500">When your teachers schedule a live class, it will land here.</p>
          </div>
        )}
        {!loading && totalSessions > 0 && (
          <div className="divide-y divide-slate-100">
            {week.map((day) => {
              const isToday = day.iso === todayIso;
              const isPast = day.iso < todayIso;
              return (
                <div key={day.iso} className={`py-2.5 flex flex-col sm:flex-row sm:gap-4 sm:items-start ${isPast ? 'opacity-60' : ''}`}>
                  {/* Mobile (flex-col): day label sits as a narrow inline strip
                      above the sessions so the session title isn't squeezed by
                      a fixed 56px gutter. Tablet+ (flex-row): label in its own
                      column on the left. */}
                  <div className="flex sm:flex-col items-baseline sm:items-start gap-2 sm:gap-0 sm:w-14 sm:shrink-0 sm:pt-0.5 mb-1.5 sm:mb-0">
                    <p className={`text-xs font-bold uppercase tracking-wider ${isToday ? 'text-indigo-600' : 'text-slate-500'}`}>{day.label}</p>
                    <p className="text-[11px] sm:text-xs text-slate-500">
                      {day.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    {day.sessions.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No live class</p>
                    ) : (
                      day.sessions.map((s) => (
                        <div key={s.id} className="flex items-center justify-between gap-2 bg-slate-50 rounded-md px-3 py-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Video className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">{s.title}</p>
                              <p className="text-[11px] text-slate-500 flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                {s.time} · {s.duration} min · {s.subject}
                              </p>
                            </div>
                          </div>
                          {s.meetingLink && !isPast && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-9 sm:h-8 px-3 text-xs shrink-0"
                              onClick={() => window.open(s.meetingLink, '_blank')}
                            >
                              Join
                            </Button>
                          )}
                        </div>
                      ))
                    )}
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
