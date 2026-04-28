import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { SyllabusPathway } from './types';

interface Props {
  /** Section heading — already country-localised by the caller. */
  heading: string;
  /** Subtitle copy. */
  subtitle: string;
  pathways: SyllabusPathway[];
  /** Footer link href, e.g. /classes or /primary. */
  exploreHref: string;
  /** Footer link label. */
  exploreLabel: string;
  /** Section background tone — alternates with adjacent sections. */
  tone?: 'white' | 'slate';
}

/**
 * Reusable syllabus pathway grid. Used for both the secondary and the
 * primary section — same shape, different content. Cards rendered in
 * a 4-column grid on desktop, horizontal-scroll on mobile.
 */
export const SyllabusSection: React.FC<Props> = ({
  heading,
  subtitle,
  pathways,
  exploreHref,
  exploreLabel,
  tone = 'white',
}) => (
  <section className={[
    'py-16 sm:py-20',
    tone === 'slate' ? 'bg-slate-50' : 'bg-white',
  ].join(' ')}>
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{heading}</h2>
          <p className="mt-2 text-slate-600 max-w-xl">{subtitle}</p>
        </div>
        <Link
          to={exploreHref}
          className="inline-flex items-center self-start sm:self-end gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 shadow-sm"
        >
          {exploreLabel} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div
        className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto md:overflow-visible -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory pb-2"
        style={{ scrollbarWidth: 'none' }}
      >
        {pathways.map((p) => (
          <div key={p.id} className="snap-start shrink-0 w-[80vw] sm:w-[60vw] md:w-auto">
            <PathwayCard pathway={p} />
          </div>
        ))}
      </div>
    </div>
  </section>
);

const PathwayCard: React.FC<{ pathway: SyllabusPathway }> = ({ pathway }) => (
  <article className="h-full rounded-2xl bg-white border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{pathway.label}</p>
      <h3 className="mt-1 text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
        {pathway.title}
      </h3>
    </div>

    <div className="mt-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Focus</p>
      <ul className="space-y-1.5">
        {pathway.focus.slice(0, 4).map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
            <Check className="w-3.5 h-3.5 text-emerald-600 mt-1 flex-shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>

    <div className="mt-4 flex flex-wrap gap-1.5">
      {pathway.features.map((feat) => (
        <Badge key={feat} variant="outline" className="text-[10px] border-slate-200 text-slate-600">
          {feat}
        </Badge>
      ))}
    </div>

    <div className="mt-auto pt-5">
      <Link to={pathway.href}>
        <Button variant="outline" size="sm" className="w-full rounded-full border-slate-300 hover:bg-slate-100 font-semibold">
          View Syllabus
        </Button>
      </Link>
    </div>
  </article>
);
