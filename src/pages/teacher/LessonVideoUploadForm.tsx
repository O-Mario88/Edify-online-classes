import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, Video, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { apiGet, apiPost, API_BASE_URL } from '../../lib/apiClient';

interface Lesson { id: number; title: string }

/**
 * Lesson video upload form. Attaches a recording (URL + duration) to
 * an existing Lesson via the LessonRecordingViewSet. URL-based
 * uploads only for the pilot — direct file upload to S3/cloud
 * storage lands in a follow-up.
 *
 * Route: /dashboard/teacher/lessons/:lessonId/video
 */
export const LessonVideoUploadForm: React.FC = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  const [videoUrl, setVideoUrl] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!lessonId) return;
    let cancelled = false;
    (async () => {
      const r = await apiGet<Lesson>(`${API_BASE_URL}/api/v1/lessons/lesson/${lessonId}/`);
      if (cancelled) return;
      if (!r.error && r.data) setLesson(r.data);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [lessonId]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!videoUrl.trim()) { setError('Paste a video URL.'); return; }
    if (durationMinutes < 1) { setError('Duration must be at least 1 minute.'); return; }
    setSubmitting(true);
    const r = await apiPost<any>(`${API_BASE_URL}/api/v1/lessons/lesson-recording/`, {
      lesson: lessonId,
      url: videoUrl.trim(),
      duration: durationMinutes * 60, // backend stores seconds
    });
    setSubmitting(false);
    if (r.error) { setError(r.error.message); return; }
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-xl">
        <Card><CardContent className="p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Video attached</h1>
          <p className="mt-2 text-slate-600">Students enrolled in this lesson's class will see it on the lesson detail page.</p>
          <div className="mt-7 flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={() => navigate(`/classes/${lessonId}`)} className="rounded-full">View lesson</Button>
            <Button variant="outline" onClick={() => { setSuccess(false); setVideoUrl(''); }} className="rounded-full">Add another video</Button>
          </div>
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link to="/dashboard/teacher" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Lesson video</p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Attach a recording</h1>
        <p className="mt-2 text-slate-600">
          {loading ? 'Loading lesson…' : lesson ? `Video for "${lesson.title}".` : 'Lesson not found.'}
        </p>
      </header>

      <Card><CardContent className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500"><Video className="w-3.5 h-3.5 inline mr-1" /> Video URL *</Label>
            <Input
              type="url"
              className="mt-1.5"
              placeholder="https://drive.google.com/..., https://www.youtube.com/..., or your recording link"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            <p className="mt-1.5 text-xs text-slate-500">YouTube, Vimeo, Google Drive (publicly shared), or any HTTPS URL. File-upload coming soon.</p>
          </div>
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Duration (minutes) *</Label>
            <Input type="number" min={1} step={1} className="mt-1.5 w-32" value={durationMinutes} onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)} />
          </div>
          {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-rose-600" /><p className="text-sm text-rose-700">{error}</p></div>}
          <Button type="submit" disabled={submitting} className="w-full rounded-full bg-slate-900 hover:bg-slate-800 text-white h-11 font-bold">
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Attach video
          </Button>
        </form>
      </CardContent></Card>
    </div>
  );
};

export default LessonVideoUploadForm;
