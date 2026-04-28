import React from 'react';
import { Video, ClipboardCheck, ShieldCheck } from 'lucide-react';

/**
 * Three-column feature strip below the hero. Each card frames a single
 * pillar of the platform: live teacher contact, structured assessment,
 * and verifiable progress. Cards are intentionally clean — small icon
 * tile + tight title + body — to read fast on a marketing landing.
 */
export const JoinTeachersSection: React.FC = () => (
  <section className="bg-white py-16 sm:py-20">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-800/90">Real teachers. Real cohorts.</p>
        <h2 className="mt-3 text-3xl sm:text-4xl tracking-tight text-[#0B1F35] leading-tight">
          Join real teachers, live and on schedule.
        </h2>
        <p className="mt-3 text-slate-600 text-[15px] leading-relaxed max-w-2xl">
          Maple is a school, not a content library. Every learner is in a cohort, every lesson has a teacher, and every term ends with proof of progress.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <FeatureCard
          icon={<Video className="w-5 h-5 text-emerald-700" />}
          tint="bg-emerald-50 ring-emerald-100"
          eyebrow="Live cohort lessons"
          title="A real teacher every week"
          body="Scheduled live classes you can join from a phone or laptop, plus replays and lesson notes ready the moment class ends."
        />
        <FeatureCard
          icon={<ClipboardCheck className="w-5 h-5 text-indigo-700" />}
          tint="bg-indigo-50 ring-indigo-100"
          eyebrow="Structured assessment"
          title="Practice, mock, master"
          body="Practice labs, mock exams in the real format, and a mistake notebook that turns each error into your next study session."
        />
        <FeatureCard
          icon={<ShieldCheck className="w-5 h-5 text-amber-800" />}
          tint="bg-amber-50 ring-amber-100"
          eyebrow="Verified progress"
          title="A passport you can share"
          body="Every badge, certificate, and reviewed project goes into your Learning Passport — verifiable to schools and bursaries."
        />
      </div>
    </div>
  </section>
);

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  tint: string;
  eyebrow: string;
  title: string;
  body: string;
}> = ({ icon, tint, eyebrow, title, body }) => (
  <article className="group relative rounded-3xl bg-white border border-slate-100 p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_30px_-12px_rgba(15,23,42,0.10)] hover:shadow-[0_2px_4px_rgba(15,23,42,0.04),0_18px_50px_-18px_rgba(15,23,42,0.18)] transition-shadow">
    <div className={`w-11 h-11 rounded-2xl ring-1 flex items-center justify-center ${tint}`}>
      {icon}
    </div>
    <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p>
    <h3 className="mt-1.5 text-[18px] font-extrabold text-[#0B1F35] tracking-tight">{title}</h3>
    <p className="mt-2 text-[14px] text-slate-600 leading-relaxed">{body}</p>
  </article>
);
