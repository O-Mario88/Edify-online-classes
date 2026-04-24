import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Clock, BookOpen, Award, Sparkles, CheckCircle2, Circle,
  Video, FileText, Wrench, FolderKanban, CalendarDays, Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { toast } from 'sonner';
import { apiGet, apiPost } from '../../lib/apiClient';

interface TrackItem {
  id: string;
  item_type: 'content' | 'assessment' | 'practice_lab' | 'project' | 'live_session';
  order: number;
  required_for_completion: boolean;
  display_title: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  items: TrackItem[];
}

interface TrackDetail {
  id: string;
  slug: string;
  title: string;
  tagline?: string;
  description?: string;
  outcome_statement?: string;
  cover_image?: string;
  level: string;
  exam_track?: string;
  subject_name?: string | null;
  class_level_name?: string | null;
  estimated_duration_weeks: number;
  estimated_hours_per_week: number;
  is_premium: boolean;
  total_items: number;
  total_required_items: number;
  modules: Module[];
}

interface Enrollment {
  id: string;
  status: string;
  progress_percentage: number;
  completed_item_ids: string[];
  started_at?: string;
  completed_at?: string | null;
}

const ITEM_ICONS: Record<TrackItem['item_type'], any> = {
  content: BookOpen,
  assessment: FileText,
  practice_lab: Wrench,
  project: FolderKanban,
  live_session: Video,
};

const ITEM_LABELS: Record<TrackItem['item_type'], string> = {
  content: 'Lesson',
  assessment: 'Quiz',
  practice_lab: 'Practice Lab',
  project: 'Mastery Project',
  live_session: 'Live Class',
};

export const MasteryTrackDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [track, setTrack] = useState<TrackDetail | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data, error } = await apiGet<TrackDetail>(`/mastery/tracks/${slug}/`);
      if (error || !data) {
        toast.error('We could not load this Mastery Track.');
        setLoading(false);
        return;
      }
      setTrack(data);
      // Check if the learner is already enrolled (via my-tracks).
      const my = await apiGet<Array<{ id: string; track: { slug: string }; status: string; progress_percentage: number; completed_item_ids: string[]; started_at?: string; completed_at?: string | null }>>('/mastery/enrollments/my-tracks/').catch(() => ({ data: [] as any }));
      if (Array.isArray(my.data)) {
        const match = my.data.find(e => e.track.slug === slug);
        if (match) {
          setEnrollment({
            id: match.id,
            status: match.status,
            progress_percentage: match.progress_percentage,
            completed_item_ids: match.completed_item_ids || [],
            started_at: match.started_at,
            completed_at: match.completed_at,
          });
        }
      }
      setLoading(false);
    })();
  }, [slug]);

  const handleEnroll = async () => {
    if (!slug) return;
    setEnrolling(true);
    const { data, error } = await apiPost<Enrollment>(`/mastery/tracks/${slug}/enroll/`, {});
    if (error || !data) {
      toast.error("Couldn't enroll just now. Please try again.");
    } else {
      setEnrollment(data);
      toast.success('You\'re enrolled. Start with the first lesson below.');
    }
    setEnrolling(false);
  };

  const handleMarkComplete = async (itemId: string) => {
    if (!enrollment) return;
    const { data, error } = await apiPost<Enrollment>(
      `/mastery/enrollments/${enrollment.id}/mark-item-complete/`,
      { item_id: itemId },
    );
    if (error || !data) {
      toast.error("Couldn't mark complete. Check your connection.");
      return;
    }
    setEnrollment(data);
    if (data.status === 'completed') {
      toast.success('Track complete! Your Learning Passport has been updated.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }
  if (!track) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">We couldn't find this track.</p>
          <Button onClick={() => navigate('/mastery')} variant="outline" className="mt-3">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to all tracks
          </Button>
        </div>
      </div>
    );
  }

  const completedSet = new Set(enrollment?.completed_item_ids || []);
  const progress = enrollment?.progress_percentage ?? 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <button onClick={() => navigate('/mastery')} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> All Mastery Tracks
        </button>

        {/* Hero */}
        <Card className="overflow-hidden">
          <div className="h-32 bg-gradient-to-br from-indigo-700 to-blue-800 relative">
            {track.cover_image && (
              <img src={track.cover_image} alt={track.title} className="absolute inset-0 w-full h-full object-cover opacity-60" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/60 to-transparent" />
          </div>
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              {track.subject_name && <Badge variant="outline" className="bg-white">{track.subject_name}</Badge>}
              {track.class_level_name && <Badge variant="outline" className="bg-white">{track.class_level_name}</Badge>}
              {track.exam_track && <Badge className="bg-blue-50 text-blue-700 border-blue-100">{track.exam_track}</Badge>}
              {track.is_premium && <Badge className="bg-amber-100 text-amber-800 border-amber-200">Premium</Badge>}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{track.title}</h1>
              {track.tagline && <p className="text-slate-600 mt-1">{track.tagline}</p>}
            </div>
            <div className="flex flex-wrap gap-5 text-sm text-slate-600">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{track.estimated_duration_weeks} weeks · {track.estimated_hours_per_week} hrs/wk</span>
              <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" />{track.total_items} items</span>
              <span className="flex items-center gap-1.5"><Award className="w-4 h-4" />{track.level}</span>
            </div>
            {enrollment ? (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-indigo-900">Your progress</p>
                  <p className="text-sm font-bold text-indigo-900">{Math.round(progress)}% complete</p>
                </div>
                <Progress value={progress} className="h-2" />
                {enrollment.status === 'completed' && (
                  <p className="text-xs text-emerald-700 mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Track completed — Learning Passport updated.
                  </p>
                )}
              </div>
            ) : (
              <Button onClick={handleEnroll} disabled={enrolling} size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                {enrolling ? 'Enrolling…' : 'Enroll in this Mastery Track'}
              </Button>
            )}
          </CardContent>
        </Card>

        {track.outcome_statement && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-600" /> What you'll be able to do</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-slate-700">{track.outcome_statement}</p></CardContent>
          </Card>
        )}

        {track.description && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">About this track</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{track.description}</p></CardContent>
          </Card>
        )}

        {/* Modules + items */}
        <div className="space-y-4">
          {track.modules.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center space-y-2">
                <CalendarDays className="w-8 h-8 text-indigo-500 mx-auto" />
                <h3 className="font-semibold text-slate-900">Module content is being finalised.</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">The author of this track is preparing the lessons, practice labs, and project. Check back shortly.</p>
              </CardContent>
            </Card>
          ) : (
            track.modules.map(mod => (
              <Card key={mod.id}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{mod.title}</span>
                    <Badge variant="outline" className="bg-white text-xs">{mod.items.length} items</Badge>
                  </CardTitle>
                  {mod.description && <p className="text-xs text-slate-500">{mod.description}</p>}
                </CardHeader>
                <CardContent>
                  <ul className="divide-y divide-slate-100">
                    {mod.items.map(item => {
                      const Icon = ITEM_ICONS[item.item_type] || BookOpen;
                      const done = completedSet.has(item.id);
                      return (
                        <li key={item.id} className="py-3 flex items-center gap-3">
                          <Icon className="w-5 h-5 text-indigo-600 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${done ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{item.display_title}</p>
                            <p className="text-xs text-slate-500">{ITEM_LABELS[item.item_type]}{!item.required_for_completion ? ' · Optional' : ''}</p>
                          </div>
                          {enrollment ? (
                            <Button
                              size="sm"
                              variant={done ? 'outline' : 'default'}
                              disabled={done}
                              onClick={() => handleMarkComplete(item.id)}
                              className={done ? '' : 'bg-indigo-600 hover:bg-indigo-700'}
                            >
                              {done ? (<><CheckCircle2 className="w-4 h-4 mr-1" /> Done</>) : 'Mark complete'}
                            </Button>
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300" />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <p className="text-xs text-slate-500 text-center">
          Mastery Tracks are estimates of effort and depth. Your final credential is earned through completed lessons, practice labs, and a reviewed Mastery Project — not just time spent.
        </p>
      </div>
    </div>
  );
};

export default MasteryTrackDetailPage;
