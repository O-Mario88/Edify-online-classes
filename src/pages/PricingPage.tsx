import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2, Sparkles, GraduationCap, Heart, BriefcaseBusiness, School,
  ArrowRight, ShieldCheck, Award, Loader2,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../contexts/AuthContext';
import { apiPost } from '../lib/apiClient';
import { toast } from 'sonner';

interface Tier {
  id: string;
  name: string;
  kicker: string;
  price: string;
  cadence: string;
  promise: string;
  audience: 'learner' | 'parent' | 'teacher' | 'school' | 'free';
  includes: string[];
  cta: { label: string; to: string };
  featured?: boolean;
}

const TIERS: Tier[] = [
  {
    id: 'free',
    name: 'Free',
    kicker: 'Try Maple',
    price: 'UGX 0',
    cadence: 'forever',
    audience: 'free',
    promise: 'See what Maple can do for your learner, parent, or teaching journey — no payment needed.',
    includes: [
      'Browse teachers, courses, and classes',
      'Take one diagnostic test',
      'View a limited Learning Level Report',
      'Access limited free content and live sessions',
      'Preview the Parent Weekly Progress Brief',
      'Basic Learning Passport',
    ],
    cta: { label: 'Create free account', to: '/register' },
  },
  {
    id: 'learner_plus',
    name: 'Learner Plus',
    kicker: 'For learners',
    price: 'UGX 20,000',
    cadence: '/month',
    audience: 'learner',
    promise: 'Know what to study next, prove mastery, and prepare for exams with teacher-supported learning.',
    includes: [
      'Full personalised study plan',
      'All Mastery Tracks with projects + teacher reviews',
      'Guided Practice Labs with badges',
      'Exam Simulator with Mistake Notebook',
      'Ask Maple Study Buddy',
      'Live class access from verified teachers',
      'Learning Passport with certificates',
    ],
    cta: { label: 'Unlock Learner Plus', to: '/payment?plan=learner_plus' },
    featured: true,
  },
  {
    id: 'parent_premium',
    name: 'Parent Premium',
    kicker: 'For parents',
    price: 'UGX 15,000',
    cadence: '/month',
    audience: 'parent',
    promise: 'See your child\'s progress clearly and know what to do next — every week.',
    includes: [
      'Weekly Child Progress Brief',
      'Parent Confidence Report',
      'Attendance + assessment alerts',
      'Teacher feedback visibility',
      'Exam readiness reports',
      'Downloadable reports',
      'Parent action recommendations',
      'School Match insights when ready',
    ],
    cta: { label: 'See what parents receive', to: '/register?intent=parent-preview' },
  },
  {
    id: 'teacher_pro',
    name: 'Teacher Pro',
    kicker: 'For teachers',
    price: 'UGX 0',
    cadence: '+ 20% platform fee',
    audience: 'teacher',
    promise: 'Teach online, build your reputation, support learners on standby, and earn from your knowledge.',
    includes: [
      'Public teacher storefront + verified badge',
      'Paid courses + live paid classes',
      'AI Lesson Assistant',
      'Student analytics + quality score',
      'Earnings dashboard + payout requests',
      'Project review earnings',
      'Standby Teacher Network opt-in',
    ],
    cta: { label: 'Create teacher storefront', to: '/independent-teacher-onboarding' },
  },
  {
    id: 'school_os',
    name: 'School OS',
    kicker: 'For schools',
    price: 'Custom',
    cadence: 'talk to us',
    audience: 'school',
    promise: 'Run a modern, transparent, data-informed school that parents trust.',
    includes: [
      'Branded school portal',
      'Learner registration + timetable + attendance',
      'Assessments + digital report cards',
      'Parent communication hub',
      'School health dashboard',
      'Verified Teaching Delivery tracking',
    ],
    cta: { label: 'Book a school demo', to: '/institution-onboarding' },
  },
  {
    id: 'school_os_plus',
    name: 'School OS Plus',
    kicker: 'Intelligence add-on',
    price: 'Custom',
    cadence: 'per-school',
    audience: 'school',
    promise: 'Everything in School OS, plus the Maple Intelligence layer — risk alerts, health history, impact comparison, and school-match visibility.',
    includes: [
      'All of School OS, plus:',
      'Student risk alerts + intervention packs',
      'Institution health history',
      'Exam readiness analytics',
      'AI-generated leadership insights',
      'Impact comparison vs peer schools',
      'School Match visibility + admissions CRM',
    ],
    cta: { label: 'Book a school demo', to: '/institution-onboarding' },
  },
];

const AUDIENCE_META: Record<Tier['audience'], { icon: any; tint: string; label: string }> = {
  free: { icon: Sparkles, tint: 'bg-slate-50 text-slate-600', label: 'Start here' },
  learner: { icon: GraduationCap, tint: 'bg-blue-50 text-blue-600', label: 'For learners' },
  parent: { icon: Heart, tint: 'bg-rose-50 text-rose-600', label: 'For parents' },
  teacher: { icon: BriefcaseBusiness, tint: 'bg-emerald-50 text-emerald-600', label: 'For teachers' },
  school: { icon: School, tint: 'bg-amber-50 text-amber-600', label: 'For schools' },
};


const PAID_PLAN_IDS = new Set(['learner_plus', 'parent_premium']);


export const PricingPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTier, setActiveTier] = useState<Tier | null>(null);
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState('mtn_momo');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!activeTier) return;
    setSubmitting(true);
    const { error } = await apiPost('/pilot-payments/upgrade-requests/', {
      plan: activeTier.id,
      contact_phone: phone,
      preferred_method: method,
      note,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't send the request. Please try again.");
      return;
    }
    toast.success("Request received. Maple will confirm your payment and unlock your plan shortly.");
    setActiveTier(null);
    setPhone(''); setNote('');
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 min-h-screen pb-20">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-indigo-100 text-xs font-bold tracking-widest text-indigo-700 uppercase">
            <ShieldCheck className="w-3 h-3" /> Maple Packages
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">Pay for outcomes, not features.</h1>
          <p className="text-slate-600 text-lg">
            Start free. Unlock the pieces that help a learner improve, a parent stay confident, a teacher earn, or a school grow.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TIERS.map(t => {
            const meta = AUDIENCE_META[t.audience];
            const Icon = meta.icon;
            return (
              <Card key={t.id} className={`relative flex flex-col border ${t.featured ? 'border-indigo-300 shadow-xl shadow-indigo-500/10' : 'border-slate-100'}`}>
                {t.featured && (
                  <Badge className="absolute -top-3 left-5 bg-indigo-600 hover:bg-indigo-600 text-white border-none">Most popular</Badge>
                )}
                <CardContent className="p-6 flex flex-col h-full">
                  <div className={`w-11 h-11 rounded-xl ${meta.tint} flex items-center justify-center mb-4`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-slate-400">{meta.label}</p>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">{t.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-900">{t.price}</span>
                    <span className="text-xs text-slate-500">{t.cadence}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-3 leading-relaxed">{t.promise}</p>

                  <ul className="mt-5 space-y-2 flex-1">
                    {t.includes.map((line, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>

                  {user && PAID_PLAN_IDS.has(t.id) ? (
                    <Button
                      onClick={() => setActiveTier(t)}
                      className={`w-full mt-6 ${t.featured ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                      variant={t.featured ? 'default' : 'outline'}
                    >
                      {t.cta.label} <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Link to={t.cta.to} className="mt-6">
                      <Button className={`w-full ${t.featured ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`} variant={t.featured ? 'default' : 'outline'}>
                        {t.cta.label} <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Trust strip */}
        <div className="mt-14 bg-white rounded-3xl border border-slate-100 p-6 md:p-8 grid md:grid-cols-3 gap-6 text-sm text-slate-700">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Progress is evidence-based</p>
              <p className="text-slate-600 text-sm">Every report is generated from lessons completed, practice activity, assessments, attendance, and teacher feedback — not opinions.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Verified credentials</p>
              <p className="text-slate-600 text-sm">Every badge and certificate in the Learning Passport carries a public verification code anyone can check.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <GraduationCap className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Real teachers, not just content</p>
              <p className="text-slate-600 text-sm">Mastery Projects are reviewed by teachers. The Standby Teacher Network answers questions when you're stuck.</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500 text-center mt-6 max-w-2xl mx-auto">
          Maple does not promise guaranteed exam outcomes. Pricing reflects access to teacher-supported learning tools that have been shown to help learners prepare more consistently.
        </p>
      </section>

      {activeTier && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setActiveTier(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg">Unlock {activeTier.name}</h3>
              </div>
              <p className="text-sm text-slate-600">
                {activeTier.promise} We'll confirm your payment and activate your plan within 24 hours.
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block uppercase tracking-wider">Your phone (for confirmation)</label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+256 700 000 000" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block uppercase tracking-wider">Preferred payment method</label>
                <div className="grid grid-cols-2 gap-2">
                  {([['mtn_momo', 'MTN Mobile Money'], ['airtel_money', 'Airtel Money'], ['cash', 'Cash / Transfer'], ['other', 'Other']] as const).map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setMethod(val)}
                      className={`px-3 py-2 rounded-lg text-sm border text-left transition-colors ${method === val ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block uppercase tracking-wider">Anything we should know (optional)</label>
                <Textarea rows={2} value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Preparing for PLE in November." />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Maple confirms every upgrade manually during the pilot — no surprise charges. You can cancel anytime by emailing us.
              </p>
            </div>
            <div className="p-6 border-t border-slate-100 flex items-center justify-between">
              <Button variant="outline" onClick={() => setActiveTier(null)}>Cancel</Button>
              <Button onClick={submit} disabled={submitting || !phone.trim()} className="bg-indigo-600 hover:bg-indigo-700">
                {submitting ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Sending…</> : 'Send upgrade request'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingPage;
