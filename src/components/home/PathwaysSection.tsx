import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, BookOpenText, FlaskConical, Globe2, Sparkles, Languages, Atom } from 'lucide-react';
import type { CountryCode } from './types';

interface Props {
  country: CountryCode;
}

/**
 * Consolidated syllabus pathway block. Two oversized cards — Secondary
 * and Primary — each stamped with country-aware metadata (curriculum
 * + exam track) and a tight subject icon row. Replaces the previous
 * two-stack `SyllabusSection` so the homepage scans cleaner.
 *
 * Country labels are derived inline (rather than from `syllabusFor`)
 * because we only need top-line copy here; the full pathway pages
 * still consume the rich syllabus data structures.
 */
export const PathwaysSection: React.FC<Props> = ({ country }) => {
  const labels = labelsFor(country);

  return (
    <section className="bg-[#FAF6F0] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-800/90">
            Structured syllabus · Stronger futures
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-[44px] leading-[1.1] tracking-tight text-[#0B1F35]">
            One platform. Every level. Real curriculum.
          </h2>
          <p className="mt-3 text-slate-600 text-[15px] leading-relaxed">
            Pathways calibrated to your country&apos;s curriculum and exam board. Pick a stage to see lessons, practice labs, projects, and exam prep.
          </p>
        </div>

        <div className="mt-12 grid lg:grid-cols-2 gap-6">
          <PathwayCard
            tone="navy"
            eyebrow={labels.secondaryEyebrow}
            title="Secondary Pathway"
            stage={labels.secondaryStage}
            description="Lessons, practice labs, mock exams, and mentor reviews — calibrated to your exam board."
            subjects={SECONDARY_SUBJECTS}
            cta="Explore Secondary Syllabus"
            href="/classes"
          />
          <PathwayCard
            tone="amber"
            eyebrow={labels.primaryEyebrow}
            title="Primary Pathway"
            stage={labels.primaryStage}
            description="Reading, mathematics, science, and writing — strong foundations from early years to candidate class."
            subjects={PRIMARY_SUBJECTS}
            cta="Explore Primary Syllabus"
            href="/primary"
          />
        </div>
      </div>
    </section>
  );
};

const SECONDARY_SUBJECTS = [
  { icon: Calculator, label: 'Mathematics' },
  { icon: FlaskConical, label: 'Sciences' },
  { icon: BookOpenText, label: 'Languages' },
  { icon: Globe2, label: 'Humanities' },
  { icon: Atom, label: 'Physics' },
];

const PRIMARY_SUBJECTS = [
  { icon: BookOpenText, label: 'Reading' },
  { icon: Calculator, label: 'Numeracy' },
  { icon: FlaskConical, label: 'Science' },
  { icon: Languages, label: 'Writing' },
  { icon: Sparkles, label: 'Foundations' },
];

interface PathwayCardProps {
  tone: 'navy' | 'amber';
  eyebrow: string;
  title: string;
  stage: string;
  description: string;
  subjects: { icon: React.ComponentType<{ className?: string }>; label: string }[];
  cta: string;
  href: string;
}

const PathwayCard: React.FC<PathwayCardProps> = ({ tone, eyebrow, title, stage, description, subjects, cta, href }) => {
  const isNavy = tone === 'navy';
  return (
    <article
      className={`relative overflow-hidden rounded-[28px] p-7 sm:p-8 lg:p-10 shadow-[0_2px_4px_rgba(15,23,42,0.04),0_24px_60px_-24px_rgba(15,23,42,0.25)] ${
        isNavy
          ? 'bg-gradient-to-br from-[#0F2A45] to-[#163556] text-white'
          : 'bg-white border border-slate-100'
      }`}
    >
      {/* Decorative corner halo */}
      <div
        aria-hidden
        className={`absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-40 ${
          isNavy ? 'bg-amber-400' : 'bg-amber-200'
        }`}
      />

      <div className="relative">
        <p
          className={`text-[11px] font-bold uppercase tracking-[0.22em] ${
            isNavy ? 'text-amber-300' : 'text-amber-800/90'
          }`}
        >
          {eyebrow}
        </p>
        <h3
          className={`mt-3 text-[28px] sm:text-[32px] leading-tight tracking-tight ${
            isNavy ? 'text-white' : 'text-[#0B1F35]'
          }`}
        >
          {title}
        </h3>
        <p className={`mt-1 text-[13.5px] font-semibold ${isNavy ? 'text-slate-300' : 'text-slate-500'}`}>
          {stage}
        </p>
        <p className={`mt-4 text-[15px] leading-relaxed max-w-md ${isNavy ? 'text-slate-200' : 'text-slate-600'}`}>
          {description}
        </p>

        {/* Subject chips */}
        <div className="mt-6 flex flex-wrap gap-2.5">
          {subjects.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold ${
                isNavy
                  ? 'bg-white/10 text-white ring-1 ring-white/15'
                  : 'bg-amber-50 text-amber-900 ring-1 ring-amber-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </span>
          ))}
        </div>

        <Link
          to={href}
          className={`mt-8 inline-flex items-center gap-2 rounded-full px-5 h-11 text-[13px] font-extrabold transition-colors ${
            isNavy
              ? 'bg-amber-300 hover:bg-amber-200 text-[#0B1F35]'
              : 'bg-[#0B1F35] hover:bg-[#0F2A45] text-white'
          }`}
        >
          {cta}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
};

function labelsFor(country: CountryCode) {
  if (country === 'UG') {
    return {
      secondaryEyebrow: 'Uganda · UCE / UACE',
      secondaryStage: 'S1 · S2 · S3–S4 · S5–S6',
      primaryEyebrow: 'Uganda · NCDC · PLE',
      primaryStage: 'P1 · P2 · P3 · P4 · P5 · P6 · P7',
    };
  }
  if (country === 'KE') {
    return {
      secondaryEyebrow: 'Kenya · CBC · KCSE',
      secondaryStage: 'Grade 7 · Grade 8–9 · Senior School · KCSE',
      primaryEyebrow: 'Kenya · CBC',
      primaryStage: 'Grade 1 · 2 · 3 · 4 · 5 · 6',
    };
  }
  return {
    secondaryEyebrow: 'Junior · Senior secondary',
    secondaryStage: 'Foundation · Mid · Exam Prep · Senior',
    primaryEyebrow: 'Lower · Upper primary',
    primaryStage: 'Early Years · Core · Mastery · Candidate',
  };
}
