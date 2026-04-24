import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { GraduationCap, MapPin, CheckCircle2, XCircle, ArrowLeft, Loader2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { apiGet } from '../../lib/apiClient';

interface School {
  id: number;
  slug?: string;
  name: string;
  logo?: string;
  profile?: {
    location_city?: string;
    admission_status?: string;
    boarding_options?: string;
    levels_offered?: string[];
    subjects_offered?: string[];
  };
  score?: {
    maple_activeness_score: number;
    growth_index: number;
    exam_readiness_strength: number;
    peer_learning_activity: number;
    parent_reporting: number;
    standby_teachers_available: number;
  };
}

const MAX_SLOTS = 3;


export const SchoolComparePage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const initial = (params.get('slugs') || '').split(',').filter(Boolean);
  const [slots, setSlots] = useState<string[]>(initial);
  const [schools, setSchools] = useState<Record<string, School>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const fetched: Record<string, School> = {};
      for (const slug of slots) {
        if (schools[slug]) { fetched[slug] = schools[slug]; continue; }
        const { data } = await apiGet<School>(`/institution-discovery/institutions/${slug}/`);
        if (data) fetched[slug] = data;
      }
      if (active) setSchools(fetched);
      setLoading(false);
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots.join(',')]);

  const removeSlot = (slug: string) => {
    const next = slots.filter(s => s !== slug);
    setSlots(next);
    setParams(next.length ? { slugs: next.join(',') } : {});
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4 space-y-6">
        <Link to="/schools" className="text-sm text-slate-500 inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to School Match
        </Link>
        <header className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Compare up to 3 schools</h1>
          <p className="text-sm text-slate-600">Side-by-side Maple Activeness, admissions, and support signals — so the decision has evidence behind it.</p>
        </header>

        {loading && <Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto" />}

        <div className="grid md:grid-cols-3 gap-4">
          {Array.from({ length: MAX_SLOTS }).map((_, i) => {
            const slug = slots[i];
            const s = slug ? schools[slug] : null;
            if (!s) {
              return (
                <Card key={i} className="border-dashed border-slate-200 bg-white/60">
                  <CardContent className="p-6 flex flex-col items-center justify-center min-h-[220px] text-center">
                    <Plus className="w-6 h-6 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600">Open any school profile and press "Compare" to add it here.</p>
                    <Link to="/schools" className="mt-3 text-xs font-semibold text-blue-700 hover:text-blue-800">
                      Browse schools
                    </Link>
                  </CardContent>
                </Card>
              );
            }
            const sc = s.score;
            const p = s.profile;
            return (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{s.name}</CardTitle>
                    {p?.location_city && <p className="text-xs text-slate-500 mt-1 inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.location_city}</p>}
                  </div>
                  <button onClick={() => removeSlot(slug)} className="text-xs text-slate-400 hover:text-slate-700">Remove</button>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Row label="Activeness" value={sc ? `${Math.round(sc.maple_activeness_score)}/100` : '—'} />
                  <Row label="Growth" value={sc ? `${Math.round(sc.growth_index)}/100` : '—'} />
                  <Row label="Exam readiness" value={sc ? `${Math.round(sc.exam_readiness_strength)}/100` : '—'} />
                  <Row label="Peer learning" value={sc ? `${Math.round(sc.peer_learning_activity)}/100` : '—'} />
                  <Row label="Parent reporting" value={sc ? `${Math.round(sc.parent_reporting)}/100` : '—'} />
                  <Row label="Standby teachers" value={sc ? `${sc.standby_teachers_available}` : '—'} />
                  <Row label="Admissions" value={p?.admission_status || '—'} />
                  <Row label="Mode" value={p?.boarding_options || '—'} />
                  <div className="pt-3 border-t border-slate-100">
                    <Link to={`/schools/${slug}`} className="text-xs font-semibold text-blue-700 hover:text-blue-800">View full profile →</Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="text-xs text-slate-500 text-center pt-3 max-w-2xl mx-auto">
          Every score has an explanation on the school profile. Maple does not rank institutions as "best"; these are evidence-based match signals you can interpret for your child's needs.
        </p>
      </div>
    </div>
  );
};


const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-slate-500">{label}</span>
    <span className="font-semibold text-slate-900">{value}</span>
  </div>
);

export default SchoolComparePage;
