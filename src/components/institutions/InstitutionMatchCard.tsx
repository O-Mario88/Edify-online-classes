import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ShieldCheck, Users, TrendingUp, GraduationCap, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export interface RecommendedInstitution {
  id: number;
  slug?: string | null;
  name: string;
  logo?: string | null;
  school_level: string;
  match_reason?: string | null;
  profile?: {
    location_city?: string;
    location_region?: string;
    admission_status?: string;
    boarding_options?: string;
    levels_offered?: string[];
    subjects_offered?: string[];
  } | null;
  score?: {
    maple_activeness_score: number;
    growth_index: number;
    exam_readiness_strength: number;
    peer_learning_activity: number;
    standby_teachers_available: number;
    explanation: string;
  } | null;
}

interface Props {
  inst: RecommendedInstitution;
  ctaLabel?: string;
  variant?: 'student' | 'parent';
}

export const InstitutionMatchCard: React.FC<Props> = ({ inst, ctaLabel = 'View profile', variant = 'student' }) => {
  const s = inst.score;
  const p = inst.profile;
  const admissionOpen = p?.admission_status === 'open';
  const activeness = s ? Math.round(s.maple_activeness_score) : null;

  return (
    <Card className="h-full border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all">
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
            {inst.logo ? (
              <img src={inst.logo} alt={inst.name} className="w-full h-full object-cover" />
            ) : (
              <GraduationCap className="w-6 h-6 text-slate-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 leading-tight truncate">{inst.name}</h3>
            {p?.location_city && (
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" /> {p.location_city}{p.location_region ? `, ${p.location_region}` : ''}
              </p>
            )}
          </div>
          {admissionOpen && (
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 shrink-0">Admissions open</Badge>
          )}
        </div>

        {/* Score strip */}
        {s && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <ScorePill label="Activeness" value={`${Math.round(s.maple_activeness_score)}`} tone="blue" />
            <ScorePill label="Growth" value={`${Math.round(s.growth_index)}`} tone="emerald" />
            <ScorePill label="Readiness" value={`${Math.round(s.exam_readiness_strength)}`} tone="amber" />
          </div>
        )}

        {/* Signals */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {s && s.standby_teachers_available > 0 && (
            <Badge variant="outline" className="bg-white text-slate-700 border-slate-200 text-xs">
              <Users className="w-3 h-3 mr-1" />{s.standby_teachers_available} standby teachers
            </Badge>
          )}
          {s && s.peer_learning_activity >= 50 && (
            <Badge variant="outline" className="bg-white text-slate-700 border-slate-200 text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />Active peer learning
            </Badge>
          )}
          <Badge variant="outline" className="bg-white text-slate-700 border-slate-200 text-xs">
            <ShieldCheck className="w-3 h-3 mr-1" />Maple Verified
          </Badge>
        </div>

        {inst.match_reason && (
          <p className="text-xs text-slate-600 leading-relaxed mb-4 italic">"{inst.match_reason}"</p>
        )}

        <div className="mt-auto flex gap-2">
          <Link to={`/schools/${inst.slug || inst.id}`} className="flex-1">
            <Button variant="outline" className="w-full justify-between">
              {ctaLabel} <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

const ScorePill: React.FC<{ label: string; value: string; tone: 'blue' | 'emerald' | 'amber' }> = ({ label, value, tone }) => {
  const toneClass =
    tone === 'blue' ? 'bg-blue-50 text-blue-700 border-blue-100' :
    tone === 'emerald' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
    'bg-amber-50 text-amber-700 border-amber-100';
  return (
    <div className={`rounded-lg border px-2 py-1.5 text-center ${toneClass}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">{label}</p>
      <p className="text-base font-extrabold leading-none mt-0.5">{value}</p>
    </div>
  );
};
