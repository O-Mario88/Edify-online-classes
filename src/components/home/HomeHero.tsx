import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Sparkles } from 'lucide-react';
import type { CountryCode } from './types';

interface Props {
  country: CountryCode;
  onCountryChange: (c: CountryCode) => void;
}

/**
 * Public hero. Two-column at desktop (copy left, photo right), stacked
 * at mobile. Premium serif headline with an amber italic accent on the
 * closing phrase, social-proof avatars cluster, and floating cards on
 * the photo (live status + AI hint + cohort stat).
 */
export const HomeHero: React.FC<Props> = () => {
  return (
    <section className="relative bg-[#FAF6F0] overflow-hidden">
      {/* Soft amber halo behind the copy */}
      <div
        aria-hidden
        className="absolute -top-40 -left-32 w-[640px] h-[640px] rounded-full bg-[radial-gradient(circle,rgba(245,193,118,0.28),transparent_60%)] blur-3xl"
      />
      {/* Subtle navy halo behind photo */}
      <div
        aria-hidden
        className="absolute -bottom-32 right-[-10%] w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle,rgba(15,42,69,0.10),transparent_60%)] blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Copy column */}
          <div className="lg:col-span-7">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-800/90">
              <Sparkles className="w-3.5 h-3.5" /> Maple Africa
            </p>

            <h1 className="mt-4 text-[44px] leading-[1.04] sm:text-[56px] sm:leading-[1.02] lg:text-[68px] lg:leading-[1.0] tracking-tight text-[#0B1F35]">
              <span className="block">Learn with real teachers.</span>
              <span className="block mt-1">Follow your country&apos;s curriculum.</span>
              <span className="block mt-1">
                Prepare for exams.{' '}
                <span className="italic font-medium text-amber-700">Prove your progress.</span>
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base sm:text-lg text-slate-600 leading-relaxed">
              A mobile-first online school for African learners, parents, teachers, and institutions —
              starting with{' '}
              <span className="font-semibold text-slate-900">Uganda</span> and{' '}
              <span className="font-semibold text-slate-900">Kenya</span>.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-[#0B1F35] px-7 h-12 text-[14px] font-extrabold shadow-xl shadow-amber-500/30 transition-colors"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/classes"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-[#0B1F35] border border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-7 h-12 text-[14px] font-bold transition-colors shadow-sm"
              >
                Explore Lessons
              </Link>
            </div>

            {/* Social-proof cluster */}
            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-2">
                {AVATARS.map((a, i) => (
                  <div
                    key={i}
                    className={`w-9 h-9 rounded-full ring-2 ring-[#FAF6F0] shadow-sm flex items-center justify-center text-[11px] font-extrabold text-white ${a.bg}`}
                    aria-hidden
                  >
                    {a.initials}
                  </div>
                ))}
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1 text-[12px] font-semibold text-slate-900">
                  <span className="flex items-center gap-0.5 text-amber-500">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </span>
                  <span className="ml-1">4.9 / 5</span>
                </div>
                <p className="text-[12px] text-slate-600">Loved by 1,000+ students across UG &amp; KE</p>
              </div>
            </div>
          </div>

          {/* Photo column */}
          <div className="lg:col-span-5 relative">
            {/* Halo blur behind */}
            <div
              aria-hidden
              className="absolute -inset-6 sm:-inset-8 bg-gradient-to-br from-amber-100/70 via-amber-50/40 to-transparent rounded-[3rem] blur-2xl"
            />

            {/* Decorative dots */}
            <svg
              aria-hidden
              className="absolute -top-6 -left-6 w-24 h-24 text-amber-300/60"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              {Array.from({ length: 5 }).map((_, r) =>
                Array.from({ length: 5 }).map((_, c) => (
                  <circle key={`${r}-${c}`} cx={10 + c * 18} cy={10 + r * 18} r={2} />
                )),
              )}
            </svg>

            <div className="relative">
              {/* Main photo card */}
              <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-amber-50 to-white shadow-2xl ring-1 ring-slate-900/10">
                <img
                  src="/images/hero-young-girl-studying.png"
                  alt="A young African learner studying online with Maple"
                  className="w-full h-auto object-cover aspect-[4/5]"
                  loading="eager"
                  decoding="async"
                />

                {/* Bottom-left LIVE badge */}
                <div className="absolute bottom-4 left-4 right-20 sm:right-32 rounded-2xl bg-white/95 backdrop-blur p-3 shadow-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Live now</p>
                    <p className="text-[13px] font-semibold text-slate-900 truncate">
                      12 lessons in session · UG · KE
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating top-right stat card */}
              <div className="absolute -top-3 -right-3 sm:top-4 sm:-right-6 rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5 px-3.5 py-2.5 flex items-center gap-2.5">
                <div className="flex -space-x-2">
                  {AVATARS.slice(0, 3).map((a, i) => (
                    <div
                      key={i}
                      className={`w-7 h-7 rounded-full ring-2 ring-white text-[10px] font-extrabold text-white flex items-center justify-center ${a.bg}`}
                      aria-hidden
                    >
                      {a.initials}
                    </div>
                  ))}
                </div>
                <div className="leading-tight">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">In class</p>
                  <p className="text-[13px] font-extrabold text-slate-900">+ 92 students</p>
                </div>
              </div>

              {/* Floating bottom-right AI tutor card */}
              <div className="absolute -bottom-4 right-4 sm:-bottom-5 sm:right-6 rounded-2xl bg-[#0B1F35] text-white shadow-2xl px-3.5 py-2.5 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-[#0B1F35] flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="leading-tight">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300/90">Study Buddy</p>
                  <p className="text-[12px] font-semibold">Need a hint? Ask anytime.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const AVATARS = [
  { initials: 'AO', bg: 'bg-indigo-500' },
  { initials: 'NK', bg: 'bg-rose-500' },
  { initials: 'JM', bg: 'bg-emerald-500' },
  { initials: 'LM', bg: 'bg-amber-600' },
];
