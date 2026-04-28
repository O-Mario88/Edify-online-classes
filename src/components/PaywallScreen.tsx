import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Clock, Hourglass, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import type { LockReason } from '../hooks/useAccess';

interface Props {
  lockReason: LockReason;
  pendingPlan?: string | null;
  blockedSurface?: string;
}

const COPY: Record<NonNullable<LockReason>, { eyebrow: string; title: string; body: string; cta: string; ctaHref: string; icon: React.ComponentType<{ className?: string }> }> = {
  no_subscription: {
    eyebrow: 'PLATFORM ACCESS',
    title: 'Pay your platform fee to unlock',
    body: 'The Maple homepage is free. To open {surface}, register and pay the platform fee. Real teachers, full curriculum, exam prep, and the Learning Passport are all included.',
    cta: 'Pay platform fee',
    ctaHref: '/pricing',
    icon: Lock,
  },
  expired: {
    eyebrow: 'PLATFORM ACCESS',
    title: 'Your access has expired',
    body: "Renew the platform fee to re-open {surface}. Your progress, badges, and Learning Passport are kept safely while you're away.",
    cta: 'Renew platform fee',
    ctaHref: '/pricing',
    icon: Clock,
  },
  pending_approval: {
    eyebrow: 'ALMOST THERE',
    title: 'Awaiting payment confirmation',
    body: 'Your upgrade request is in. A Maple admin will confirm the platform fee within 24 hours. {surface} unlocks the moment payment lands.',
    cta: 'See payment status',
    ctaHref: '/payment',
    icon: Hourglass,
  },
};

const VALUE_PROPS = [
  'Live classes with real teachers',
  'Full curriculum lessons + practice labs',
  'Mock exams + mistake notebook',
  'AI Study Buddy — hints, never answers',
  'Verified Learning Passport',
];

/**
 * Full-screen paywall takeover for the webapp. Mirrors the mobile
 * PaywallScreen — same copy variants, same value list, same primary
 * action shape — so the paywall reads identically across surfaces.
 */
export const PaywallScreen: React.FC<Props> = ({
  lockReason,
  pendingPlan,
  blockedSurface = 'this part of Maple',
}) => {
  const copy = COPY[lockReason || 'no_subscription'];
  const Icon = copy.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="rounded-3xl bg-white border border-slate-100 p-8 sm:p-10 shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mb-5">
            <Icon className="w-6 h-6 text-amber-800" />
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800/80">{copy.eyebrow}</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{copy.title}</h1>
          <p className="mt-3 text-slate-600 leading-relaxed">
            {copy.body.replace('{surface}', blockedSurface)}
          </p>

          {pendingPlan && (
            <div className="mt-6 rounded-2xl bg-amber-50 border border-amber-100 p-4 flex items-start gap-3">
              <Hourglass className="w-5 h-5 text-amber-800 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-900">
                  Request submitted — {pendingPlan.replace('_', ' ')}
                </p>
                <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                  A Maple admin will confirm payment within 24 hours.
                </p>
              </div>
            </div>
          )}

          <div className="mt-7 rounded-2xl bg-slate-50 border border-slate-100 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">WHAT YOU UNLOCK</p>
            <ul className="space-y-2">
              {VALUE_PROPS.map((v) => (
                <li key={v} className="flex items-center gap-2.5 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  {v}
                </li>
              ))}
            </ul>
          </div>

          <Link to={copy.ctaHref} className="block mt-7">
            <Button size="lg" className="w-full rounded-full bg-slate-900 text-white hover:bg-slate-800 h-12 text-sm font-bold shadow-md">
              {copy.cta} <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>

          <p className="mt-5 text-center text-xs text-slate-500">
            Want to see what's behind the paywall? <Link to="/" className="font-bold underline">Back to homepage</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
