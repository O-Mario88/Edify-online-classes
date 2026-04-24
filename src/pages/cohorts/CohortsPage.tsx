import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, Clock, ArrowRight, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { apiGet, apiPost } from '../../lib/apiClient';
import { toast } from 'sonner';

interface Cohort {
  id: string;
  slug: string;
  title: string;
  tagline?: string;
  description?: string;
  teacher_name?: string | null;
  subject_name?: string | null;
  class_level_name?: string | null;
  exam_track?: string;
  start_date: string;
  end_date: string;
  max_seats: number;
  seat_count: number;
  is_premium: boolean;
  cover_image?: string;
}

interface Enrollment {
  id: string;
  status: string;
  progress_pct: number;
  cohort: Cohort;
}

export const CohortsPage: React.FC = () => {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [my, setMy] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  const load = async () => {
    const [c, m] = await Promise.all([
      apiGet<{ results?: Cohort[] } | Cohort[]>('/cohorts/cohorts/'),
      apiGet<Enrollment[]>('/cohorts/enrollments/my/').catch(() => ({ data: [] })),
    ]);
    if (c.data) {
      const arr = Array.isArray(c.data) ? c.data : (c.data.results || []);
      setCohorts(arr);
    }
    if (Array.isArray(m.data)) setMy(m.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const enroll = async (slug: string) => {
    setEnrolling(slug);
    const { data, error } = await apiPost<Enrollment>(`/cohorts/cohorts/${slug}/enroll/`, {});
    setEnrolling(null);
    if (error) {
      const msg = (error as any)?.data?.detail || 'Could not enroll in this cohort.';
      toast.error(msg);
      return;
    }
    toast.success('Enrolled! Your cohort will appear on your dashboard.');
    await load();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  const enrolledSlugs = new Set(my.map(e => e.cohort.slug));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/20">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-indigo-100 text-xs font-bold tracking-widest text-indigo-700 uppercase">
            <Users className="w-3 h-3" /> Learning Cohorts
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">Learn together. Finish on time.</h1>
          <p className="text-slate-600 max-w-2xl">Teacher-led journeys with a clear start date, a weekly plan, live classes, a project, and a certificate at the end.</p>
        </header>

        {my.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">My cohorts</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {my.map(e => (
                <div key={e.id} className="bg-white rounded-xl border border-slate-100 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">{e.status}</Badge>
                    <span className="text-xs text-slate-500">{e.cohort.start_date} → {e.cohort.end_date}</span>
                  </div>
                  <h3 className="font-semibold text-slate-900">{e.cohort.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">Led by {e.cohort.teacher_name || 'Maple'}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Upcoming cohorts</h2>
          {cohorts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
              <Sparkles className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <h3 className="font-semibold text-slate-900">No cohorts published yet.</h3>
              <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">Teacher-led cohorts launch every month. Check back soon or enroll in a <Link to="/mastery" className="text-indigo-700 font-semibold">Mastery Track</Link> to keep momentum.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {cohorts.map(c => {
                const isEnrolled = enrolledSlugs.has(c.slug);
                const full = c.max_seats > 0 && c.seat_count >= c.max_seats;
                return (
                  <Card key={c.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5 flex flex-col h-full">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex flex-wrap gap-1.5">
                          {c.exam_track && <Badge className="bg-blue-50 text-blue-700 border-blue-100">{c.exam_track}</Badge>}
                          {c.subject_name && <Badge variant="outline">{c.subject_name}</Badge>}
                          {c.is_premium && <Badge className="bg-amber-100 text-amber-800 border-amber-200">Premium</Badge>}
                        </div>
                      </div>
                      <h3 className="font-bold text-slate-900 leading-tight">{c.title}</h3>
                      {c.tagline && <p className="text-sm text-slate-600 mt-1">{c.tagline}</p>}
                      <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-4">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{c.start_date} → {c.end_date}</span>
                        {c.teacher_name && <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />Led by {c.teacher_name}</span>}
                        {c.max_seats > 0 && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{c.seat_count}/{c.max_seats} seats</span>}
                      </div>
                      <div className="mt-auto pt-5 flex items-center justify-between">
                        {isEnrolled ? (
                          <span className="text-sm text-emerald-700 font-semibold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> You're in this cohort
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => enroll(c.slug)}
                            disabled={enrolling === c.slug || full}
                            className="bg-indigo-600 hover:bg-indigo-700"
                          >
                            {full ? 'Cohort full' : enrolling === c.slug ? 'Enrolling…' : 'Enroll'}
                            {!full && enrolling !== c.slug && <ArrowRight className="w-4 h-4 ml-1" />}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          <p className="text-xs text-slate-500 pt-2">
            Cohorts run for a fixed window so learners finish on time. Progress is tracked from lessons, projects, and live class attendance.
          </p>
        </section>
      </div>
    </div>
  );
};

export default CohortsPage;
