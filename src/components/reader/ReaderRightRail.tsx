import React from 'react';
import {
  ChevronRight, Copy, FileText, Sparkles, ListChecks, Video, FlaskConical, Map as MapIcon,
  Bookmark, Headphones, ScrollText, BookText,
} from 'lucide-react';
import type { ResourceContent } from './types';
import { MathExpr } from './MathExpr';

const NAVY = '#0B1F3A';
const COPPER = '#C47A45';
const SOFT_BORDER = '#E6EAF2';
const MUTED = '#64748B';

/* ────── PROGRESS CARD ────── */
export const ReadingProgressCard: React.FC<{ resource: ResourceContent }> = ({ resource }) => (
  <section className="rounded-2xl bg-white border p-5" style={{ borderColor: SOFT_BORDER }}>
    <p className="text-[14px] font-extrabold mb-3" style={{ color: NAVY }}>Reading Progress</p>
    <div className="grid grid-cols-[110px,1fr] gap-3 items-center">
      <ProgressDonut value={resource.progressPercent} />
      <div>
        <p className="text-[13px] font-extrabold leading-tight" style={{ color: NAVY }}>{resource.motivationalMessage || "You're making progress!"}</p>
        <p className="mt-1 text-[11px]" style={{ color: MUTED }}>{resource.currentPage} of {resource.totalPages} pages read</p>
      </div>
    </div>
    <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#F1ECDF' }}>
      <div className="h-full" style={{ width: `${resource.progressPercent}%`, background: `linear-gradient(90deg, ${COPPER} 0%, #E8A06D 100%)` }} />
    </div>
    <button type="button" className="mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-md border bg-white py-2 text-[12px] font-extrabold" style={{ color: NAVY, borderColor: SOFT_BORDER }}>
      Continue where you left off <ChevronRight className="w-3.5 h-3.5" />
    </button>
  </section>
);

const ProgressDonut: React.FC<{ value: number }> = ({ value }) => {
  const r = 38;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <svg viewBox="0 0 100 100" className="w-[100px] h-[100px]" aria-hidden>
      <circle cx="50" cy="50" r={r} fill="none" stroke="#F1ECDF" strokeWidth="9" />
      <circle cx="50" cy="50" r={r} fill="none" stroke={COPPER} strokeWidth="9" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 50 50)" />
      <text x="50" y="56" textAnchor="middle" fontSize="20" fontWeight="800" fill={NAVY}>{value}%</text>
    </svg>
  );
};

/* ────── QUICK REFERENCE — adapts to subject content ────── */
export const QuickReferenceCard: React.FC<{ resource: ResourceContent }> = ({ resource }) => {
  const card = resource.quickReference;
  if (!card) return null;
  return (
    <section className="rounded-2xl bg-white border p-5" style={{ borderColor: SOFT_BORDER }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[14px] font-extrabold" style={{ color: NAVY }}>{card.title}</p>
        <button type="button" className="w-7 h-7 rounded-md hover:bg-slate-50 flex items-center justify-center" aria-label="Copy reference">
          <Copy className="w-3.5 h-3.5" style={{ color: MUTED }} />
        </button>
      </div>
      <ul className="space-y-2.5">
        {card.items.map((it, i) => (
          <li key={i}>
            <p className="text-[11.5px] font-extrabold" style={{ color: MUTED }}>{it.label}</p>
            <div className="text-[14px] mt-0.5" style={{ color: NAVY }}>
              {it.kind === 'formula' ? (
                <MathExpr tex={it.value} className="text-[14px]" />
              ) : (
                <span className="font-semibold">{it.value}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

/* ────── RELATED RESOURCES ────── */
const KIND_VISUAL: Record<string, { icon: React.ComponentType<{ className?: string }>; tint: string; ink: string }> = {
  practice:    { icon: ListChecks,  tint: '#EEEAFE', ink: '#7C3AED' },
  examples:    { icon: FileText,    tint: '#FFF7ED', ink: COPPER },
  video:       { icon: Video,       tint: '#FFE4E6', ink: '#EF4444' },
  past_paper:  { icon: ScrollText,  tint: '#E0EBFF', ink: '#2563EB' },
  summary:     { icon: BookText,    tint: '#E5F6EC', ink: '#12B76A' },
  mind_map:    { icon: MapIcon,     tint: '#FCEFD8', ink: COPPER },
  flashcard:   { icon: Bookmark,    tint: '#FCEFD8', ink: COPPER },
  textbook:    { icon: FileText,    tint: '#E0EBFF', ink: '#2563EB' },
  lab:         { icon: FlaskConical, tint: '#EEEAFE', ink: '#7C3AED' },
  audio:       { icon: Headphones,   tint: '#E5F6EC', ink: '#12B76A' },
};

export const RelatedResourcesCard: React.FC<{ resource: ResourceContent }> = ({ resource }) => {
  if (!resource.relatedResources || resource.relatedResources.length === 0) return null;
  return (
    <section className="rounded-2xl bg-white border p-5" style={{ borderColor: SOFT_BORDER }}>
      <p className="text-[14px] font-extrabold mb-3" style={{ color: NAVY }}>Related Resources</p>
      <ul className="divide-y" style={{ borderColor: SOFT_BORDER }}>
        {resource.relatedResources.map((r) => {
          const v = KIND_VISUAL[r.kind] ?? KIND_VISUAL.examples;
          const Icon = v.icon;
          return (
            <li key={r.id}>
              <button type="button" className="w-full flex items-center gap-3 px-1 py-3 hover:bg-slate-50 rounded-md text-left">
                <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: v.tint }}>
                  <Icon className="w-4 h-4" style={{ color: v.ink }} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-extrabold leading-tight" style={{ color: NAVY }}>{r.title}</p>
                  <p className="text-[10.5px] font-semibold" style={{ color: MUTED }}>{r.meta}</p>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0" style={{ color: MUTED }} />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

/* ────── EMPTY-STATE FOR TOPICS WITHOUT CONTENT ────── */
export const ReaderComingSoon: React.FC<{ topicTitle: string }> = ({ topicTitle }) => (
  <div className="rounded-2xl bg-white border p-10 text-center" style={{ borderColor: SOFT_BORDER }}>
    <Sparkles className="w-6 h-6 mx-auto" style={{ color: COPPER }} />
    <p className="mt-3 text-[18px] font-extrabold" style={{ color: NAVY, fontFamily: 'Fraunces, serif' }}>{topicTitle}</p>
    <p className="mt-1 text-[13px]" style={{ color: MUTED }}>This topic's notes are being prepared by our editors.</p>
    <p className="mt-1 text-[12px]" style={{ color: MUTED }}>Pick another topic from the chapter tree on the left to keep reading.</p>
  </div>
);
