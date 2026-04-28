import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, ShieldCheck, Users, GraduationCap, Mail, Phone, Globe,
  TrendingUp, Calendar, MessageCircle, CheckCircle2, Lock, Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { apiGet } from '../../lib/apiClient';
import { toast } from 'sonner';

interface InstitutionDetail {
  id: number;
  slug?: string;
  name: string;
  logo?: string;
  school_level: string;
  primary_color?: string;
  profile?: {
    location_city?: string;
    location_region?: string;
    about?: string;
    admission_blurb?: string;
    boarding_options?: string;
    admission_status?: string;
    levels_offered?: string[];
    subjects_offered?: string[];
    admission_contact_email?: string;
    admission_contact_phone?: string;
    website?: string;
  };
  score?: {
    maple_activeness_score: number;
    growth_index: number;
    verified_lesson_delivery: number;
    assessment_activity: number;
    attendance_tracking: number;
    parent_reporting: number;
    teacher_responsiveness: number;
    peer_learning_activity: number;
    student_engagement: number;
    platform_consistency: number;
    exam_readiness_strength: number;
    standby_teachers_available: number;
    explanation: string;
    last_computed_at?: string;
  };
}

export const InstitutionProfilePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [inst, setInst] = useState<InstitutionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await apiGet<InstitutionDetail>(`/institution-discovery/institutions/${slug}/`);
      if (error || !data) {
        setNotFound(true);
      } else {
        setInst(data);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading profile…</div>;
  }
  if (notFound || !inst) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <p className="text-slate-600">We couldn't find this school's profile.</p>
          <Button onClick={() => navigate(-1)} variant="outline"><ArrowLeft className="w-4 h-4 mr-1" /> Go back</Button>
        </div>
      </div>
    );
  }

  const p = inst.profile || {};
  const s = inst.score;
  const admissionOpen = p.admission_status === 'open';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Header */}
        <Card className="overflow-hidden">
          <div className="h-24 bg-gradient-to-br from-blue-600 to-indigo-700" />
          <CardContent className="p-6 pt-0 -mt-10">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-2xl bg-white border border-slate-100 shadow flex items-center justify-center overflow-hidden shrink-0">
                {inst.logo ? (
                  <img src={inst.logo} alt={inst.name} className="w-full h-full object-cover" />
                ) : (
                  <GraduationCap className="w-10 h-10 text-slate-500" />
                )}
              </div>
              <div className="flex-1 pt-10">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{inst.name}</h1>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-100"><ShieldCheck className="w-3 h-3 mr-1" />Maple Verified</Badge>
                  {admissionOpen && (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Admissions open</Badge>
                  )}
                </div>
                {(p.location_city || p.location_region) && (
                  <p className="text-sm text-slate-600 mt-1 flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {p.location_city}{p.location_region ? `, ${p.location_region}` : ''}
                  </p>
                )}
                {p.boarding_options && (
                  <p className="text-sm text-slate-600 mt-1">{p.boarding_options.replace(/_/g, ' ')}</p>
                )}
              </div>
              <div className="flex flex-col gap-2 pt-10">
                <Button disabled title="Coming in phase 2" className="bg-blue-600 hover:bg-blue-700">
                  <MessageCircle className="w-4 h-4 mr-1" /> Ping Institution
                </Button>
                <Button disabled variant="outline" title="Coming in phase 3">
                  Apply for Admission <Lock className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scoring breakdown */}
        {s && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Sparkles className="w-4 h-4 text-blue-600" /> Why Maple recommends this school</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <HeadlineStat label="Activeness" value={Math.round(s.maple_activeness_score)} tone="blue" />
                <HeadlineStat label="Growth" value={Math.round(s.growth_index)} tone="emerald" />
                <HeadlineStat label="Exam readiness" value={Math.round(s.exam_readiness_strength)} tone="amber" />
                <HeadlineStat label="Standby teachers" value={s.standby_teachers_available} tone="slate" suffix="" />
              </div>
              <div className="space-y-2">
                <ComponentRow label="Verified lesson delivery" value={s.verified_lesson_delivery} />
                <ComponentRow label="Assessment + grading activity" value={s.assessment_activity} />
                <ComponentRow label="Attendance tracking" value={s.attendance_tracking} />
                <ComponentRow label="Parent reporting" value={s.parent_reporting} />
                <ComponentRow label="Teacher responsiveness" value={s.teacher_responsiveness} />
                <ComponentRow label="Peer learning activity" value={s.peer_learning_activity} />
                <ComponentRow label="Student engagement" value={s.student_engagement} />
                <ComponentRow label="Platform consistency" value={s.platform_consistency} />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
                {s.explanation}
                {' '}Scores are estimates from platform signals — they're never "guaranteed" rankings.
              </p>
            </CardContent>
          </Card>
        )}

        {/* About */}
        {p.about && (
          <Card>
            <CardHeader><CardTitle className="text-base">About</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 leading-relaxed">{p.about}</p>
            </CardContent>
          </Card>
        )}

        {/* Levels + subjects */}
        {(p.levels_offered?.length || p.subjects_offered?.length) ? (
          <div className="grid md:grid-cols-2 gap-4">
            {p.levels_offered && p.levels_offered.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Levels offered</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {p.levels_offered.map(l => (
                      <Badge key={l} variant="outline" className="bg-white">{l}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {p.subjects_offered && p.subjects_offered.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Subjects supported</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {p.subjects_offered.map(sub => (
                      <Badge key={sub} variant="outline" className="bg-white">{sub}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}

        {/* Admission blurb + contacts */}
        {(p.admission_blurb || p.admission_contact_email || p.admission_contact_phone || p.website) && (
          <Card>
            <CardHeader><CardTitle className="text-base">Admissions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {p.admission_blurb && <p className="text-sm text-slate-700 leading-relaxed">{p.admission_blurb}</p>}
              <div className="grid md:grid-cols-3 gap-3 pt-2">
                {p.admission_contact_email && (
                  <ContactCard icon={Mail} label="Email" value={p.admission_contact_email} />
                )}
                {p.admission_contact_phone && (
                  <ContactCard icon={Phone} label="Phone" value={p.admission_contact_phone} />
                )}
                {p.website && (
                  <ContactCard icon={Globe} label="Website" value={p.website} href={p.website} />
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

const HeadlineStat: React.FC<{ label: string; value: number; tone: 'blue' | 'emerald' | 'amber' | 'slate'; suffix?: string }>= ({ label, value, tone, suffix = '/100' }) => {
  const toneClass =
    tone === 'blue' ? 'bg-blue-50 text-blue-700 border-blue-100' :
    tone === 'emerald' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
    tone === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-100' :
    'bg-slate-50 text-slate-700 border-slate-100';
  return (
    <div className={`rounded-xl border p-3 text-center ${toneClass}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-extrabold leading-tight mt-1">{value}{suffix}</p>
    </div>
  );
};

const ComponentRow: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-slate-700">{label}</span>
      <span className="font-semibold text-slate-900">{Math.round(value)}/100</span>
    </div>
    <Progress value={value} className="h-1.5" />
  </div>
);

const ContactCard: React.FC<{ icon: any; label: string; value: string; href?: string }> = ({ icon: Icon, label, value, href }) => {
  const content = (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-white">
      <Icon className="w-4 h-4 text-slate-500" />
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-900 truncate">{value}</p>
      </div>
    </div>
  );
  return href ? <a href={href} target="_blank" rel="noreferrer">{content}</a> : content;
};

export default InstitutionProfilePage;
