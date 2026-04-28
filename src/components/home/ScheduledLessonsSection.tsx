import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, ArrowRight, Video } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { apiGet, API_BASE_URL } from '../../lib/apiClient';
import { DEMO_LESSONS, type ScheduledLesson, type CountryCode } from './types';

interface Props {
  country: CountryCode;
}

interface ApiSession {
  id: number | string;
  title?: string;
  subject?: string;
  class_level?: string;
  country?: string;
  curriculum?: string;
  scheduled_start?: string;
  duration_minutes?: number;
  teacher_name?: string;
  seats_left?: number;
}

const arr = <T,>(d: any): T[] => (Array.isArray(d) ? d : (d?.results || []));

const initials = (name: string): string =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

/**
 * "Live and scheduled lessons" section — the proof that Maple is alive
 * before a visitor even logs in. Tries to fetch real upcoming sessions
 * from /live-sessions/. Falls back to a curated four-card demo set so
 * the section never renders empty.
 *
 * Mobile: horizontal scroll snap-x (one card per viewport).
 * Desktop: 4-column grid.
 */
export const ScheduledLessonsSection: React.FC<Props> = ({ country }) => {
  const [lessons, setLessons] = useState<ScheduledLesson[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await apiGet<any>(`${API_BASE_URL}/api/v1/live-sessions/live-session/?upcoming=true&limit=8`);
        if (cancelled) return;
        if (r.error || !r.data) {
          setLessons(DEMO_LESSONS);
          return;
        }
        const items = arr<ApiSession>(r.data).slice(0, 4);
        if (items.length === 0) {
          setLessons(DEMO_LESSONS);
          return;
        }
        setLessons(items.map(toLesson));
      } catch {
        if (!cancelled) setLessons(DEMO_LESSONS);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Filter by selected country if applicable
  const filtered = lessons
    ? country === 'UG'
      ? lessons.filter((l) => l.country === 'Uganda')
      : country === 'KE'
        ? lessons.filter((l) => l.country === 'Kenya')
        : lessons
    : null;

  // If a country filter narrowed too aggressively, fall back to all
  const display = filtered && filtered.length >= 2 ? filtered : (lessons || DEMO_LESSONS);

  return (
    <section className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Live and Scheduled Lessons</h2>
            <p className="mt-2 text-slate-600 max-w-xl">
              Join upcoming lessons taught by real teachers across Uganda and Kenya — live, on schedule.
            </p>
          </div>
          <Link
            to="/live-sessions"
            className="inline-flex items-center self-start sm:self-end gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 shadow-sm"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile: horizontal scroll · Desktop: 4-column grid */}
        <div
          className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto md:overflow-visible -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory pb-2"
          style={{ scrollbarWidth: 'none' }}
        >
          {display.slice(0, 4).map((l) => (
            <div key={l.id} className="snap-start shrink-0 w-[80vw] sm:w-[60vw] md:w-auto">
              <LessonCard lesson={l} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const LessonCard: React.FC<{ lesson: ScheduledLesson }> = ({ lesson }) => (
  <article className="h-full rounded-2xl bg-white border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
    {/* Header: subject icon + lesson type pill */}
    <div className="flex items-start justify-between gap-2">
      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl">
        {lesson.subjectIcon}
      </div>
      <Badge
        className={[
          'text-[10px] font-bold uppercase tracking-wider border-0',
          lesson.lessonType === 'Live Lesson'
            ? 'bg-rose-50 text-rose-700'
            : lesson.lessonType === 'Revision'
            ? 'bg-amber-50 text-amber-800'
            : 'bg-indigo-50 text-indigo-700',
        ].join(' ')}
      >
        {lesson.lessonType === 'Live Lesson' && <Video className="w-3 h-3 mr-1" />}
        {lesson.lessonType}
      </Badge>
    </div>

    {/* Subject / level / country */}
    <div className="mt-4 flex flex-wrap items-center gap-1.5">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{lesson.subject}</span>
    </div>
    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
      <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-600">
        {lesson.classLevel}
      </Badge>
      <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-600">
        {lesson.curriculum}
      </Badge>
    </div>

    {/* Title */}
    <h3 className="mt-3 text-base font-bold text-slate-900 leading-snug line-clamp-2">{lesson.title}</h3>

    {/* Teacher */}
    <div className="mt-3 flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
        {lesson.teacherInitials}
      </div>
      <p className="text-xs font-semibold text-slate-700">{lesson.teacherName}</p>
    </div>

    {/* Meta row: time + seats */}
    <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
      <span className="inline-flex items-center gap-1">
        <Clock className="w-3.5 h-3.5" /> {lesson.startTime}
      </span>
      {typeof lesson.seatsLeft === 'number' && (
        <span className="inline-flex items-center gap-1">
          <Users className="w-3.5 h-3.5" /> {lesson.seatsLeft} seats left
        </span>
      )}
    </div>

    {/* CTA */}
    <div className="mt-auto pt-4">
      <Link to="/register">
        <Button size="sm" className="w-full rounded-full bg-slate-900 text-white hover:bg-slate-800 font-semibold">
          {lesson.ctaLabel}
        </Button>
      </Link>
    </div>
  </article>
);

function toLesson(s: ApiSession): ScheduledLesson {
  const country = (s.country || '').toLowerCase().includes('ke') ? 'Kenya' : 'Uganda';
  return {
    id: String(s.id),
    subject: s.subject || 'Lesson',
    subjectIcon: pickIcon(s.subject || ''),
    classLevel: s.class_level || '—',
    country,
    curriculum: s.curriculum || (country === 'Kenya' ? 'Kenya CBC' : 'Uganda NCDC'),
    lessonType: 'Live Lesson',
    title: s.title || 'Live Lesson',
    teacherName: s.teacher_name || 'Maple Teacher',
    teacherInitials: initials(s.teacher_name || 'Maple Teacher'),
    startTime: s.scheduled_start
      ? new Date(s.scheduled_start).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' })
      : 'TBA',
    seatsLeft: s.seats_left,
    ctaLabel: 'Reserve seat',
  };
}

function pickIcon(subject: string): string {
  const s = subject.toLowerCase();
  if (s.includes('math')) return '🧮';
  if (s.includes('eng')) return '✍️';
  if (s.includes('sci')) return '🔬';
  if (s.includes('phys')) return '⚛️';
  if (s.includes('chem')) return '🧪';
  if (s.includes('bio')) return '🧬';
  if (s.includes('hist')) return '📜';
  if (s.includes('geo')) return '🗺️';
  return '📘';
}
