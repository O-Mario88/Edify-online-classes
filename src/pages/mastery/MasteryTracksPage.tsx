import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, GraduationCap } from 'lucide-react';
import { MasteryTrackCard, MasteryTrack } from '../../components/mastery/MasteryTrackCard';
import { apiGet } from '../../lib/apiClient';

interface EnrollmentLite {
  id: string;
  track: MasteryTrack;
  status: string;
  progress_percentage: number;
}

export const MasteryTracksPage: React.FC = () => {
  const [tracks, setTracks] = useState<MasteryTrack[]>([]);
  const [myTracks, setMyTracks] = useState<EnrollmentLite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [catalog, mine] = await Promise.all([
        apiGet<{ results?: MasteryTrack[] } | MasteryTrack[]>('/mastery/tracks/'),
        apiGet<EnrollmentLite[]>('/mastery/enrollments/my-tracks/').catch(() => ({ data: [] })),
      ]);
      if (catalog.data) {
        const arr = Array.isArray(catalog.data) ? catalog.data : (catalog.data.results || []);
        setTracks(arr);
      }
      if (Array.isArray(mine.data)) setMyTracks(mine.data);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Header */}
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-indigo-100 text-xs font-bold tracking-widest text-indigo-700 uppercase">
            <Sparkles className="w-3 h-3" /> Maple Mastery Studio
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight max-w-2xl">
            Prove what you can do — one Mastery Track at a time.
          </h1>
          <p className="text-slate-600 max-w-2xl">
            Each track is a guided pathway of lessons, practice labs, and a real project — with teacher feedback and a verified credential at the end.
          </p>
        </header>

        {/* Continue where you left off */}
        {myTracks.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Continue your tracks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myTracks.slice(0, 4).map(e => (
                <Link key={e.id} to={`/mastery/${e.track.slug}`} className="block bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{e.status}</p>
                      <h3 className="font-semibold text-slate-900 leading-tight mt-1">{e.track.title}</h3>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-2xl font-bold text-indigo-700 leading-none">{Math.round(e.progress_percentage)}%</p>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400">Complete</p>
                    </div>
                  </div>
                  <div className="h-1.5 mt-3 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-indigo-600" style={{ width: `${e.progress_percentage}%` }} />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Catalog */}
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <h2 className="text-lg font-semibold text-slate-900">All tracks</h2>
            <p className="text-xs text-slate-500">{tracks.length} available</p>
          </div>
          {loading ? (
            <p className="text-sm text-slate-500">Loading tracks…</p>
          ) : tracks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
              <GraduationCap className="w-8 h-8 text-indigo-500 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900">Mastery Tracks are launching soon.</h3>
              <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
                Your first track will show here the moment one is published for your class and subject — complete with practice labs, a real project, and teacher feedback.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {tracks.map(t => <MasteryTrackCard key={t.id} track={t} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MasteryTracksPage;
