import React, { useEffect, useState } from 'react';
import { Timer, Clock, Target, BookOpen, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { apiGet } from '../../lib/apiClient';

interface Exam {
  id: string;
  slug: string;
  title: string;
  exam_track: string;
  subject_name?: string | null;
  class_level_name?: string | null;
  duration_minutes: number;
  is_premium: boolean;
  question_count: number;
}

interface Readiness {
  tracks: Array<{ exam_track: string; attempts: number; avg_pct: number; readiness_band: string }>;
  open_mistakes: number;
  trust_note: string;
}

export const ExamSimulatorPage: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [list, report] = await Promise.all([
        apiGet<{ results?: Exam[] } | Exam[]>('/exam-simulator/exams/'),
        apiGet<Readiness>('/exam-simulator/readiness/summary/'),
      ]);
      if (list.data) {
        const arr = Array.isArray(list.data) ? list.data : (list.data.results || []);
        setExams(arr);
      }
      if (report.data) setReadiness(report.data);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4 space-y-6">
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-indigo-100 text-xs font-bold tracking-widest text-indigo-700 uppercase">
            <Timer className="w-3 h-3" /> Exam Simulator
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Train like you're sitting the real exam.</h1>
          <p className="text-slate-600 max-w-2xl">Timed mocks with auto-marked questions. Every mistake auto-lands in your Mistake Notebook so revision is effortless.</p>
        </header>

        {/* Readiness rollup */}
        {readiness && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-4 h-4 text-indigo-600" /> Your Exam Readiness</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {readiness.tracks.length === 0 ? (
                <p className="text-sm text-slate-600">Readiness bands appear here after your first exam simulation. Take a mock below to get started.</p>
              ) : (
                readiness.tracks.map(t => (
                  <div key={t.exam_track}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-semibold">{t.exam_track}</span>
                      <span>
                        <Badge variant="outline" className={`mr-2 ${t.readiness_band === 'strong' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : t.readiness_band === 'moderate' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                          {t.readiness_band}
                        </Badge>
                        {t.attempts} attempts · {t.avg_pct}%
                      </span>
                    </div>
                    <Progress value={t.avg_pct} className="h-2" />
                  </div>
                ))
              )}
              {readiness.open_mistakes > 0 && (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3">
                  You have <strong>{readiness.open_mistakes}</strong> open entries in your Mistake Notebook. Working through them lifts your readiness quickly.
                </p>
              )}
              <p className="text-xs text-slate-500">{readiness.trust_note}</p>
            </CardContent>
          </Card>
        )}

        {/* Exam catalog */}
        <div className="grid md:grid-cols-2 gap-4">
          {exams.map(e => (
            <Card key={e.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900">{e.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{e.subject_name} · {e.class_level_name}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0 bg-blue-50 text-blue-700 border-blue-100">{e.exam_track}</Badge>
                </div>
                <div className="flex gap-4 text-xs text-slate-500 mt-4">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{e.duration_minutes} min</span>
                  <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{e.question_count} questions</span>
                </div>
                <Button size="sm" className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700" disabled>
                  Start mock · coming in-app <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
          {exams.length === 0 && (
            <div className="md:col-span-2 rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
              <Target className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <h3 className="font-semibold text-slate-900">No exam simulations published yet.</h3>
              <p className="text-sm text-slate-600 mt-1">New mocks land here every week. Keep practising in the meantime — every attempt sharpens the readiness estimate.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamSimulatorPage;
