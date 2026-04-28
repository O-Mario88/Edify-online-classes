import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Users, Video, Sparkles, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { apiGet, apiPost, API_BASE_URL } from '../../lib/apiClient';

interface ClassRow {
  id: number | string;
  title?: string;
  name?: string;
  class_level_name?: string;
  subject_name?: string;
}

const arr = <T,>(d: any): T[] => (Array.isArray(d) ? d : (d?.results || []));

/**
 * Live Lesson Scheduling form. Creates a Lesson + linked LiveSession
 * in two server calls, then optionally provisions a Google Meet link
 * via the /live-sessions/provision-webinar/ action.
 *
 * Route: /dashboard/teacher/live-lessons/new
 */
export const LiveLessonScheduler: React.FC = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  const [classId, setClassId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [capacity, setCapacity] = useState(40);
  const [provider, setProvider] = useState<'google_meet' | 'zoom'>('google_meet');
  const [meetingLink, setMeetingLink] = useState('');
  const [autoProvision, setAutoProvision] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ sessionId: number; meetingUrl: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await apiGet<any>(`${API_BASE_URL}/api/v1/classes/?mine=true`);
      if (cancelled) return;
      if (!r.error) {
        setClasses(arr<ClassRow>(r.data));
      }
      setLoadingClasses(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const validate = (): string | null => {
    if (!title.trim()) return 'Title is required.';
    if (!classId) return 'Pick a class for this lesson.';
    if (!date || !time) return 'Set the date and time.';
    if (!autoProvision && !meetingLink.trim()) return 'Paste a meeting link or enable auto-provision.';
    if (duration < 15) return 'Duration must be at least 15 minutes.';
    if (capacity < 1) return 'Capacity must be at least 1 seat.';
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const err = validate();
    if (err) { setError(err); return; }

    setSubmitting(true);
    const scheduledAt = new Date(`${date}T${time}`).toISOString();

    // Step 1 — create the Lesson row that the LiveSession links to.
    const lessonResp = await apiPost<any>(`${API_BASE_URL}/api/v1/lessons/lesson/`, {
      parent_class: classId,
      title: title.trim(),
      access_mode: 'live',
      scheduled_at: scheduledAt,
    });
    if (lessonResp.error || !lessonResp.data?.id) {
      setSubmitting(false);
      setError(lessonResp.error?.message || 'Could not create the lesson.');
      return;
    }
    const lessonId = lessonResp.data.id;

    // Step 2 — provision the meeting link (if auto) and create the
    // LiveSession row.
    let resolvedLink = meetingLink.trim();
    if (autoProvision && provider === 'google_meet') {
      const provResp = await apiPost<any>(
        `${API_BASE_URL}/api/v1/live-sessions/live-session/provision-webinar/`,
        {
          title: title.trim(),
          scheduled_start: scheduledAt,
          duration_minutes: duration,
        },
      );
      if (!provResp.error && provResp.data?.meetingUrl) {
        resolvedLink = provResp.data.meetingUrl;
      }
      // If provisioning fails, we still let the teacher save with a
      // blank link — they can paste one later from the lesson detail.
    }

    const sessionResp = await apiPost<any>(`${API_BASE_URL}/api/v1/live-sessions/live-session/`, {
      lesson: lessonId,
      scheduled_start: scheduledAt,
      duration_minutes: duration,
      capacity,
      provider,
      meeting_link: resolvedLink,
      status: 'scheduled',
    });

    setSubmitting(false);
    if (sessionResp.error) {
      setError(sessionResp.error.message);
      return;
    }
    setSuccess({
      sessionId: sessionResp.data.id,
      meetingUrl: resolvedLink,
    });
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-xl">
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Lesson scheduled</h1>
            <p className="mt-2 text-slate-600">
              Students enrolled in the class will see this lesson on their Today plan.
            </p>
            {success.meetingUrl && (
              <div className="mt-5 rounded-xl bg-slate-50 border border-slate-200 p-4 text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Meeting link</p>
                <a href={success.meetingUrl} target="_blank" rel="noopener noreferrer" className="mt-1 block text-sm font-semibold text-slate-900 break-all underline">
                  {success.meetingUrl}
                </a>
              </div>
            )}
            <div className="mt-7 flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={() => navigate('/live-sessions')} className="rounded-full">
                See all sessions
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSuccess(null);
                  setTitle('');
                  setDescription('');
                  setDate('');
                  setTime('');
                  setMeetingLink('');
                }}
                className="rounded-full"
              >
                Schedule another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link
        to="/dashboard/teacher"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>

      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Lessons</p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Schedule a live lesson</h1>
        <p className="mt-2 text-slate-600">
          Pick the class, date, and time. Maple provisions a Google Meet link automatically — or paste your own.
        </p>
      </header>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Title</Label>
              <Input
                className="mt-1.5"
                placeholder="e.g. Fractions and Word Problems"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Class picker */}
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Class</Label>
              <Select value={classId} onValueChange={setClassId} disabled={loadingClasses}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder={loadingClasses ? 'Loading classes…' : 'Pick a class'} />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.title || c.name || 'Class'}
                      {c.class_level_name ? ` · ${c.class_level_name}` : ''}
                      {c.subject_name ? ` · ${c.subject_name}` : ''}
                    </SelectItem>
                  ))}
                  {classes.length === 0 && !loadingClasses && (
                    <SelectItem value="__none" disabled>No classes yet — create one first.</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Date / time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Calendar className="w-3.5 h-3.5 inline mr-1" /> Date
                </Label>
                <Input
                  type="date"
                  className="mt-1.5"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Clock className="w-3.5 h-3.5 inline mr-1" /> Time
                </Label>
                <Input
                  type="time"
                  className="mt-1.5"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            {/* Duration / capacity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Duration (min)</Label>
                <Input
                  type="number"
                  min={15}
                  step={5}
                  className="mt-1.5"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Users className="w-3.5 h-3.5 inline mr-1" /> Seats
                </Label>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  className="mt-1.5"
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Provider */}
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                <Video className="w-3.5 h-3.5 inline mr-1" /> Meeting platform
              </Label>
              <Select value={provider} onValueChange={(v) => setProvider(v as 'google_meet' | 'zoom')}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="google_meet">Google Meet</SelectItem>
                  <SelectItem value="zoom">Zoom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Auto-provision toggle */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoProvision}
                  onChange={(e) => setAutoProvision(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-700"
                />
                <span>
                  <span className="text-sm font-bold text-slate-900 inline-flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Auto-provision Google Meet link
                  </span>
                  <span className="block text-xs text-slate-600 mt-1">
                    Maple creates the meeting space + Calendar event automatically. Disable to paste your own link.
                  </span>
                </span>
              </label>
              {!autoProvision && (
                <Input
                  className="mt-3"
                  placeholder="https://meet.google.com/..."
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                />
              )}
            </div>

            {/* Description (optional) */}
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Notes for students (optional)</Label>
              <Textarea
                className="mt-1.5"
                placeholder="What should students prepare? Pages, materials, etc."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <p className="text-sm text-rose-700">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-slate-900 hover:bg-slate-800 text-white h-11 font-bold"
            >
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Calendar className="w-4 h-4 mr-2" />}
              Schedule live lesson
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveLessonScheduler;
