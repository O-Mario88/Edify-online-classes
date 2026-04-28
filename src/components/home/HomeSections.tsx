import React from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays, Users, GraduationCap, Award,
  Heart, BriefcaseBusiness, School, ArrowRight,
} from 'lucide-react';
import { WHY_MAPLE } from './types';

const ICON_MAP = {
  CalendarDays, Users, GraduationCap, Award,
} as const;

/**
 * "Why Maple works" — four value-prop cards explaining the core
 * platform pillars: today's plan, real teachers, exam readiness, and
 * the Learning Passport.
 */
export const WhyMapleWorksSection: React.FC = () => (
  <section className="bg-white py-16 sm:py-20">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12 max-w-2xl mx-auto">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-800/90">Why Maple works</p>
        <h2 className="mt-3 text-3xl sm:text-4xl tracking-tight text-[#0B1F35] leading-tight">
          A guided platform, not a content dump.
        </h2>
        <p className="mt-3 text-slate-600 text-[15px] leading-relaxed">
          Every Maple feature is built around the way real African schools teach — live classes, structured syllabus, real assessment, and verifiable progress.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {WHY_MAPLE.map((w) => {
          const Icon = ICON_MAP[w.icon];
          return (
            <div
              key={w.title}
              className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_30px_-12px_rgba(15,23,42,0.08)] hover:shadow-[0_2px_4px_rgba(15,23,42,0.04),0_18px_50px_-18px_rgba(15,23,42,0.16)] transition-shadow"
            >
              <div className="w-11 h-11 rounded-2xl bg-amber-100 ring-1 ring-amber-200/60 flex items-center justify-center">
                <Icon className="w-5 h-5 text-amber-800" />
              </div>
              <h3 className="mt-5 text-[16px] font-extrabold text-[#0B1F35] tracking-tight">{w.title}</h3>
              <p className="mt-2 text-[14px] text-slate-600 leading-relaxed">{w.body}</p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

/**
 * "For every role" — four role-targeted cards. Each card frames Maple
 * for a different audience (students, parents, teachers, institutions)
 * with a CTA into the matching onboarding flow.
 */
export const RoleAudienceSection: React.FC = () => (
  <section className="bg-slate-50 py-16 sm:py-20">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12 max-w-2xl mx-auto">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-800/90">For every role</p>
        <h2 className="mt-3 text-3xl sm:text-4xl tracking-tight text-[#0B1F35] leading-tight">
          Maple serves the whole learning circle.
        </h2>
        <p className="mt-3 text-slate-600 text-[15px] leading-relaxed">
          Whether you&apos;re studying, parenting, teaching, or running a school — there&apos;s a tailored experience built for you.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <RoleCard
          icon={<GraduationCap className="w-5 h-5 text-indigo-700" />}
          tint="bg-indigo-50 ring-indigo-100"
          eyebrow="Students"
          title="Learn with structure"
          body="Live classes, daily plan, exam prep — and a verified record of your work."
          cta="Start as a student"
          href="/register?role=student"
        />
        <RoleCard
          icon={<Heart className="w-5 h-5 text-rose-700" />}
          tint="bg-rose-50 ring-rose-100"
          eyebrow="Parents"
          title="See progress, not vibes"
          body="Weekly briefs, attendance, results, and one-tap nudges to your child."
          cta="Start as a parent"
          href="/register?role=parent"
        />
        <RoleCard
          icon={<BriefcaseBusiness className="w-5 h-5 text-emerald-700" />}
          tint="bg-emerald-50 ring-emerald-100"
          eyebrow="Teachers"
          title="Teach beyond your classroom"
          body="Live class earnings, mentor reviews, standby Q&A, and your own storefront."
          cta="Apply as a teacher"
          href="/independent-teacher-onboarding"
        />
        <RoleCard
          icon={<School className="w-5 h-5 text-amber-800" />}
          tint="bg-amber-50 ring-amber-100"
          eyebrow="Institutions"
          title="Run your school online"
          body="Enrol learners, manage classes, see risk alerts, and connect with families."
          cta="Register institution"
          href="/institution-onboarding"
        />
      </div>
    </div>
  </section>
);

const RoleCard: React.FC<{
  icon: React.ReactNode;
  tint: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  href: string;
}> = ({ icon, tint, eyebrow, title, body, cta, href }) => (
  <div className="group rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_30px_-12px_rgba(15,23,42,0.08)] hover:shadow-[0_2px_4px_rgba(15,23,42,0.04),0_18px_50px_-18px_rgba(15,23,42,0.18)] transition-shadow flex flex-col">
    <div className={`w-11 h-11 rounded-2xl ring-1 flex items-center justify-center ${tint}`}>
      {icon}
    </div>
    <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p>
    <h3 className="mt-1.5 text-[17px] font-extrabold text-[#0B1F35] tracking-tight">{title}</h3>
    <p className="mt-2 text-[14px] text-slate-600 leading-relaxed flex-1">{body}</p>
    <Link
      to={href}
      className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-[#0B1F35] hover:text-amber-700 group-hover:gap-2 transition-all"
    >
      {cta} <ArrowRight className="w-4 h-4" />
    </Link>
  </div>
);

/**
 * Institution sub-CTA — cream/peach hero band with a subtle dashboard
 * mock illustrated via stacked cards on the right. Targets headteachers
 * and DOSes specifically with the platform-fee + parent-payment hook
 * from the institution onboarding flow.
 */
export const InstitutionCTASection: React.FC = () => (
  <section className="bg-white py-16 sm:py-20">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#FFE9CC] via-[#FCE3BC] to-[#F4D5A6] shadow-[0_2px_4px_rgba(15,23,42,0.04),0_24px_60px_-24px_rgba(15,23,42,0.20)]">
        {/* Subtle radial accents */}
        <div aria-hidden className="absolute -top-32 -left-16 w-80 h-80 rounded-full bg-white/40 blur-3xl" />
        <div aria-hidden className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-amber-300/50 blur-3xl" />

        <div className="relative grid lg:grid-cols-2 gap-8 items-center p-8 sm:p-12 lg:p-14">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-900/80">For institutions</p>
            <h3 className="mt-3 text-3xl sm:text-4xl lg:text-[42px] leading-[1.08] tracking-tight text-[#0B1F35]">
              Bring your school online. Quality learning, country-wide.
            </h3>
            <p className="mt-4 text-[15px] text-slate-700/90 leading-relaxed max-w-xl">
              Register learners, initiate platform fee payments from a parent or sponsor phone, track progress, and send parent reports — all from one dashboard.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link
                to="/institution-onboarding"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0B1F35] hover:bg-[#0F2A45] text-white px-7 h-12 text-[13.5px] font-extrabold shadow-lg shadow-[#0B1F35]/20 transition-colors"
              >
                Register Institution
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white/80 hover:bg-white text-[#0B1F35] border border-white/60 px-7 h-12 text-[13.5px] font-bold transition-colors"
              >
                See pricing
              </Link>
            </div>
          </div>

          {/* Dashboard mockup card stack */}
          <div className="relative h-[280px] sm:h-[320px] lg:h-[360px]">
            {/* Back card */}
            <div className="absolute right-0 top-4 w-[88%] h-[88%] rounded-2xl bg-white/70 backdrop-blur-sm shadow-2xl ring-1 ring-white/60 -rotate-2" />
            {/* Mid card */}
            <div className="absolute right-2 top-2 w-[88%] h-[88%] rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5 rotate-1" />
            {/* Front card with content */}
            <div className="absolute right-4 top-0 w-[88%] h-[88%] rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5 p-5 flex flex-col">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0B1F35] flex items-center justify-center">
                  <School className="w-4 h-4 text-amber-300" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">School OS</p>
                  <p className="text-sm font-extrabold text-[#0B1F35] -mt-0.5">Maple High · UG</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold ring-1 ring-emerald-100">
                  HEALTHY
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2.5">
                {[
                  { label: 'Attendance', value: '94%' },
                  { label: 'Delivery', value: '88%' },
                  { label: 'Engagement', value: '76%' },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl bg-slate-50 p-2.5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{m.label}</p>
                    <p className="mt-0.5 text-base font-extrabold text-[#0B1F35]">{m.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex-1 flex flex-col justify-end gap-2">
                {[
                  { name: 'S2 · Maths', count: '32 learners', tint: 'bg-indigo-50 text-indigo-700' },
                  { name: 'S4 · Biology', count: '28 learners', tint: 'bg-emerald-50 text-emerald-700' },
                  { name: 'P7 · Revision', count: '40 learners', tint: 'bg-amber-50 text-amber-800' },
                ].map((row) => (
                  <div key={row.name} className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-extrabold ${row.tint}`}>
                      {row.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-[12px] font-bold text-[#0B1F35]">{row.name}</p>
                      <p className="text-[10px] text-slate-500">{row.count}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700">↑ stable</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/**
 * Final CTA strip — dark navy with twin CTAs and faux app-store badges
 * (Apple + Google) so users see Maple as a serious mobile-first app.
 */
export const HomeFinalCTA: React.FC = () => (
  <section className="bg-[#0B1F35] text-white py-20 sm:py-24 relative overflow-hidden">
    {/* Decorative halos */}
    <div aria-hidden className="absolute -top-24 left-1/2 -translate-x-1/2 w-[640px] h-[640px] rounded-full bg-[radial-gradient(circle,rgba(245,193,118,0.18),transparent_60%)] blur-3xl" />
    <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300">Don&apos;t wait — start today</p>
      <h2 className="mt-3 text-4xl sm:text-5xl lg:text-[56px] leading-[1.05] tracking-tight">
        Start learning with Maple today.
      </h2>
      <p className="mt-4 text-slate-300 text-[15px] sm:text-[16px] leading-relaxed max-w-2xl mx-auto">
        Real teachers. Country-aware curriculum. One platform fee per term — paid by parent or sponsor. No tuition lock-in.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/login"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-[#0B1F35] px-8 h-12 text-[14px] font-extrabold shadow-2xl shadow-amber-500/30 transition-colors"
        >
          Get Started
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/institution-onboarding"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/15 px-8 h-12 text-[14px] font-bold transition-colors"
        >
          Register Institution
        </Link>
      </div>

      {/* Faux store badges */}
      <div className="mt-10 flex items-center justify-center gap-3">
        <StoreBadge
          line1="Download on the"
          line2="App Store"
          icon={
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M16.365 1.43c0 1.14-.46 2.23-1.21 3-.84.86-2.21 1.52-3.34 1.43-.13-1.13.45-2.32 1.18-3.06.83-.84 2.27-1.49 3.37-1.37zM20.5 17.13c-.55 1.27-.81 1.84-1.52 2.96-.99 1.56-2.39 3.5-4.13 3.51-1.55.02-1.95-1-4.05-.99-2.1.01-2.54 1.01-4.09.99-1.74-.01-3.07-1.77-4.06-3.33-2.78-4.36-3.07-9.48-1.36-12.2 1.21-1.93 3.13-3.07 4.93-3.07 1.84 0 3 1.01 4.51 1.01 1.47 0 2.36-1.01 4.49-1.01 1.61 0 3.31.88 4.51 2.4-3.96 2.17-3.32 7.83.77 9.73z" />
            </svg>
          }
        />
        <StoreBadge
          line1="Get it on"
          line2="Google Play"
          icon={
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M3.5 20.5V3.5c0-.6.34-1.1.84-1.36L14.16 12 4.34 21.86c-.5-.26-.84-.76-.84-1.36zm12.7-7.94l2.96 1.71c.7.4.7 1.41 0 1.81l-2.96 1.71L12.92 14l3.28-1.44zM5.7 2.27 15.5 11.06l-2.7 2.7L5.7 2.27zm0 19.46 7.1-11.49 2.7 2.7L5.7 21.73z" />
            </svg>
          }
        />
      </div>
    </div>
  </section>
);

const StoreBadge: React.FC<{ line1: string; line2: string; icon: React.ReactNode }> = ({ line1, line2, icon }) => (
  <button
    type="button"
    className="inline-flex items-center gap-3 rounded-2xl bg-black/60 hover:bg-black/70 ring-1 ring-white/10 px-4 py-2 text-left transition-colors"
  >
    <span className="text-white/90">{icon}</span>
    <span className="leading-tight">
      <span className="block text-[10px] uppercase tracking-wider text-slate-400">{line1}</span>
      <span className="block text-[14px] font-extrabold text-white">{line2}</span>
    </span>
  </button>
);
