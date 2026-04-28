import React from 'react';
import {
  BookOpen, Sparkles, AlertTriangle, Info, CheckCircle2, Dot,
  ListChecks, Quote as QuoteIcon, Activity,
} from 'lucide-react';
import type { ContentBlock, KeyPointColumn } from './types';
import { MathExpr } from './MathExpr';

const NAVY = '#0B1F3A';
const COPPER = '#C47A45';
const SOFT_BORDER = '#E6EAF2';
const READING_INK = '#1F2A3F';
const MUTED = '#64748B';

/* ────── Diagram registry — mapped via svgKey on `diagram` blocks ────── */
const DIAGRAMS: Record<string, React.ReactNode> = {
  parabola: <ParabolaSvg />,
  'animal-cell': <AnimalCellSvg />,
};

/* ────── Public API ────── */
export const ContentBlockRenderer: React.FC<{ blocks: ContentBlock[] }> = ({ blocks }) => (
  <>{blocks.map((b, i) => <Block key={i} block={b} />)}</>
);

const Block: React.FC<{ block: ContentBlock }> = ({ block }) => {
  switch (block.type) {
    case 'heading':       return <Heading block={block} />;
    case 'paragraph':     return <Paragraph block={block} />;
    case 'formula':       return <Formula block={block} />;
    case 'definition':    return <Definition block={block} />;
    case 'theorem':       return <Theorem block={block} />;
    case 'example':       return <ExampleBlock block={block} />;
    case 'diagram':       return <Diagram block={block} />;
    case 'list':          return <ListBlock block={block} />;
    case 'callout':       return <Callout block={block} />;
    case 'key_points':    return <KeyPoints block={block} />;
    case 'split':         return <Split block={block} />;
    case 'glossary':      return <Glossary block={block} />;
    case 'timeline':      return <Timeline block={block} />;
    case 'quote':         return <QuoteBlock block={block} />;
    case 'code':          return <CodeBlock block={block} />;
    case 'table':         return <TableBlock block={block} />;
    default:              return null;
  }
};

/* ────── Heading ────── */
const Heading: React.FC<{ block: Extract<ContentBlock, { type: 'heading' }> }> = ({ block }) => {
  const level = block.level ?? 2;
  if (level === 1) {
    return (
      <h1
        className="text-[44px] sm:text-[52px] leading-tight tracking-tight mb-4"
        style={{ color: NAVY, fontFamily: 'Fraunces, serif', fontWeight: 600 }}
      >
        {block.content}
      </h1>
    );
  }
  if (level === 3) {
    return <h3 className="text-[16px] font-extrabold mt-2 mb-2" style={{ color: NAVY }}>{block.content}</h3>;
  }
  return (
    <h2
      className="text-[24px] tracking-tight mt-6 mb-3"
      style={{ color: NAVY, fontFamily: 'Fraunces, serif', fontWeight: 600 }}
    >
      {block.content}
    </h2>
  );
};

/* ────── Paragraph (with optional emphasis substrings) ────── */
const Paragraph: React.FC<{ block: Extract<ContentBlock, { type: 'paragraph' }> }> = ({ block }) => {
  if (!block.emphasis || block.emphasis.length === 0) {
    return (
      <p className="text-[15px] leading-[1.7] mb-3" style={{ color: READING_INK }}>
        {block.content}
      </p>
    );
  }
  // Split content around emphasis tokens, preserving them.
  const tokens = block.emphasis.map((e) => e.word);
  const pattern = new RegExp(`(${tokens.map(escapeRegex).join('|')})`, 'g');
  const parts = block.content.split(pattern);
  return (
    <p className="text-[15px] leading-[1.7] mb-3" style={{ color: READING_INK }}>
      {parts.map((p, i) => {
        const hit = block.emphasis!.find((e) => e.word === p);
        if (!hit) return <React.Fragment key={i}>{p}</React.Fragment>;
        return (
          <span
            key={i}
            className="font-bold underline underline-offset-2 decoration-[1.5px]"
            style={{ color: hit.tone === 'navy' ? NAVY : COPPER, textDecorationColor: hit.tone === 'navy' ? NAVY : COPPER }}
          >
            {p}
          </span>
        );
      })}
    </p>
  );
};

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* ────── Formula (block / inline) ────── */
const Formula: React.FC<{ block: Extract<ContentBlock, { type: 'formula' }> }> = ({ block }) => {
  if (block.display === 'inline') {
    return <MathExpr tex={block.tex} />;
  }
  return (
    <div className="my-4 inline-block">
      <div
        className="rounded-lg px-5 py-2.5 text-[18px]"
        style={{ backgroundColor: '#FFFFFF', border: `1.5px solid ${SOFT_BORDER}`, color: NAVY }}
      >
        <MathExpr tex={block.tex} className="text-[18px]" />
      </div>
      {block.caption && <p className="mt-1 text-[12px]" style={{ color: MUTED }}>{block.caption}</p>}
    </div>
  );
};

/* ────── Definition ────── */
const Definition: React.FC<{ block: Extract<ContentBlock, { type: 'definition' }> }> = ({ block }) => (
  <div className="my-3 rounded-xl p-4" style={{ backgroundColor: '#F5F8FF', border: `1px solid #DCE6FA` }}>
    <p className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: '#3B5FCC' }}>Definition</p>
    <p className="mt-1 text-[14.5px] leading-relaxed" style={{ color: NAVY }}>
      <span className="font-extrabold">{block.term}.</span>{' '}{block.body}
    </p>
  </div>
);

/* ────── Theorem ────── */
const Theorem: React.FC<{ block: Extract<ContentBlock, { type: 'theorem' }> }> = ({ block }) => (
  <div className="my-3 rounded-xl p-4" style={{ backgroundColor: '#FFF7ED', border: `1px solid #F4D8B5` }}>
    <p className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: COPPER }}>Theorem · {block.title}</p>
    <p className="mt-1 text-[14.5px] leading-relaxed" style={{ color: NAVY }}>{block.body}</p>
  </div>
);

/* ────── Worked Example ────── */
const ExampleBlock: React.FC<{ block: Extract<ContentBlock, { type: 'example' }> }> = ({ block }) => (
  <div className="my-3 rounded-xl p-5" style={{ backgroundColor: '#FCFAF4', border: `1px solid #EDE2C9` }}>
    <div className="flex items-center gap-2 mb-2">
      <BookOpen className="w-4 h-4" style={{ color: COPPER }} />
      <p className="text-[14px] font-extrabold" style={{ color: NAVY }}>{block.title}</p>
    </div>
    <p className="text-[14px] mb-2" style={{ color: NAVY }}>
      {block.question}{' '}
      {block.questionTex && <MathExpr tex={block.questionTex} className="text-[15px]" />}
    </p>
    <ol className="space-y-2">
      {block.solutionSteps.map((step, i) => (
        <li key={i} className={step.label === 'Solution:' ? '' : 'flex items-baseline gap-2'}>
          {step.label && (
            <p className="text-[13px] font-extrabold" style={{ color: NAVY }}>{step.label}</p>
          )}
          {!step.label && step.text && (
            <span className="text-[13.5px]" style={{ color: NAVY }}>{step.text}</span>
          )}
          {step.tex && <MathExpr tex={step.tex} className="text-[15px]" />}
        </li>
      ))}
    </ol>
    {block.finalAnswer && (
      <div className="mt-3 rounded-lg px-3 py-2 inline-block" style={{ backgroundColor: '#EFF6FF' }}>
        <p className="text-[13.5px] italic" style={{ color: NAVY }}>
          {block.finalAnswer.split(/(x\s*=\s*[^\s.]+)/g).map((part, i) =>
            /^x\s*=/.test(part) ? <MathExpr key={i} tex={part} className="text-[14px] italic" /> : <React.Fragment key={i}>{part}</React.Fragment>,
          )}
        </p>
      </div>
    )}
  </div>
);

/* ────── Diagram ────── */
const Diagram: React.FC<{ block: Extract<ContentBlock, { type: 'diagram' }> }> = ({ block }) => (
  <figure className="my-3">
    <div className="rounded-xl p-4 bg-white" style={{ border: `1px solid ${SOFT_BORDER}` }}>
      {block.svgKey && DIAGRAMS[block.svgKey]}
      {block.src && <img src={block.src} alt={block.caption} className="w-full" />}
    </div>
    <figcaption className="mt-2 text-[12.5px]" style={{ color: MUTED }}>{block.caption}</figcaption>
  </figure>
);

/* ────── List ────── */
const ListBlock: React.FC<{ block: Extract<ContentBlock, { type: 'list' }> }> = ({ block }) => {
  const Tag: any = block.ordered ? 'ol' : 'ul';
  return (
    <Tag className="my-3 space-y-1.5 pl-1">
      {block.items.map((it, i) => (
        <li key={i} className="flex items-start gap-2 text-[14.5px] leading-relaxed" style={{ color: READING_INK }}>
          <Dot className="w-4 h-4 mt-1 shrink-0" style={{ color: COPPER }} />
          <span>{it}</span>
        </li>
      ))}
    </Tag>
  );
};

/* ────── Callout ────── */
const CALLOUT_TONES: Record<string, { bg: string; border: string; ink: string; icon: React.ComponentType<{ className?: string }>; label: string }> = {
  info:     { bg: '#EFF6FF', border: '#BFDBFE', ink: '#1D4ED8', icon: Info,           label: 'Note' },
  warning:  { bg: '#FFF6E0', border: '#FACC15', ink: '#92400E', icon: AlertTriangle,  label: 'Warning' },
  success:  { bg: '#ECFDF5', border: '#6EE7B7', ink: '#065F46', icon: CheckCircle2,    label: 'Tip' },
  note:     { bg: '#FFF7ED', border: '#FACC15', ink: COPPER,    icon: Sparkles,        label: 'Note' },
  practice: { bg: '#F5F0FF', border: '#C4B5FD', ink: '#5B21B6', icon: ListChecks,      label: 'Practice' },
};

const Callout: React.FC<{ block: Extract<ContentBlock, { type: 'callout' }> }> = ({ block }) => {
  const t = CALLOUT_TONES[block.tone];
  const Icon = t.icon;
  return (
    <aside className="my-3 rounded-xl p-4 flex items-start gap-3" style={{ backgroundColor: t.bg, border: `1px solid ${t.border}` }}>
      <span className="w-7 h-7 rounded-md bg-white flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5" style={{ color: t.ink }} />
      </span>
      <div className="min-w-0">
        <p className="text-[12px] font-extrabold tracking-[0.18em] uppercase" style={{ color: t.ink }}>{block.title || t.label}</p>
        <p className="mt-1 text-[14px] leading-relaxed" style={{ color: NAVY }}>{block.body}</p>
      </div>
    </aside>
  );
};

/* ────── Key Points (reference layout — 4 columns at the bottom) ────── */
const KEY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  check: CheckCircle2,
  discriminant: Activity,
  roots: ListChecks,
  method: Sparkles,
  note: Info,
  warn: AlertTriangle,
};

const KeyPoints: React.FC<{ block: Extract<ContentBlock, { type: 'key_points' }> }> = ({ block }) => (
  <section className="mt-6 rounded-xl p-5" style={{ backgroundColor: '#FFF7ED', border: `1px solid #F0DFC1` }}>
    <div className="flex items-center gap-2 mb-3">
      <Sparkles className="w-4 h-4" style={{ color: COPPER }} />
      <p className="text-[14px] font-extrabold" style={{ color: NAVY }}>{block.title || 'Key Points'}</p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {block.columns.map((col, i) => <KeyColumn key={i} col={col} />)}
    </div>
  </section>
);

const KeyColumn: React.FC<{ col: KeyPointColumn }> = ({ col }) => {
  const Icon = KEY_ICONS[col.icon || 'check'];
  return (
    <div>
      <div className="flex items-start gap-2">
        <Icon className="w-3.5 h-3.5 mt-1 shrink-0" style={{ color: COPPER }} />
        <p className="text-[12.5px] font-extrabold" style={{ color: NAVY }}>{col.title}</p>
      </div>
      <ul className="mt-2 space-y-1.5 ml-5">
        {col.items.map((it, i) => (
          <li key={i} className="text-[12.5px] leading-relaxed" style={{ color: NAVY }}>
            {it.label && <span className="font-bold">{it.label} </span>}
            {it.tex && <MathExpr tex={it.tex} className="text-[13px]" />}
            {it.body && <span> {it.body}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

/* ────── Split (two-column reading) ────── */
const Split: React.FC<{ block: Extract<ContentBlock, { type: 'split' }> }> = ({ block }) => (
  <div className="my-4 grid lg:grid-cols-2 gap-6">
    <div><ContentBlockRenderer blocks={block.left} /></div>
    <div><ContentBlockRenderer blocks={block.right} /></div>
  </div>
);

/* ────── Glossary ────── */
const Glossary: React.FC<{ block: Extract<ContentBlock, { type: 'glossary' }> }> = ({ block }) => (
  <dl className="my-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
    {block.terms.map((t) => (
      <div key={t.term} className="rounded-lg p-3 bg-white" style={{ border: `1px solid ${SOFT_BORDER}` }}>
        <dt className="text-[13.5px] font-extrabold" style={{ color: NAVY }}>{t.term}</dt>
        <dd className="mt-0.5 text-[12.5px]" style={{ color: MUTED }}>{t.meaning}</dd>
      </div>
    ))}
  </dl>
);

/* ────── Timeline ────── */
const Timeline: React.FC<{ block: Extract<ContentBlock, { type: 'timeline' }> }> = ({ block }) => (
  <ol className="my-4 relative">
    <span aria-hidden className="absolute left-3 top-2 bottom-2 w-px" style={{ backgroundColor: SOFT_BORDER }} />
    {block.events.map((e, i) => (
      <li key={i} className="relative pl-9 pb-4 last:pb-0">
        <span aria-hidden className="absolute left-1 top-1 w-5 h-5 rounded-full ring-2 ring-white" style={{ backgroundColor: COPPER }} />
        <p className="text-[11px] font-extrabold tracking-[0.18em] uppercase" style={{ color: COPPER }}>{e.date}</p>
        <p className="mt-0.5 text-[14px] font-extrabold" style={{ color: NAVY }}>{e.title}</p>
        {e.body && <p className="mt-0.5 text-[13px]" style={{ color: MUTED }}>{e.body}</p>}
      </li>
    ))}
  </ol>
);

/* ────── Quote ────── */
const QuoteBlock: React.FC<{ block: Extract<ContentBlock, { type: 'quote' }> }> = ({ block }) => (
  <blockquote className="my-4 pl-4" style={{ borderLeft: `3px solid ${COPPER}` }}>
    <div className="flex items-start gap-2">
      <QuoteIcon className="w-4 h-4 mt-1 shrink-0" style={{ color: COPPER }} />
      <div>
        <p
          className="text-[16px] leading-relaxed"
          style={{ color: NAVY, fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}
        >
          {block.text}
        </p>
        {block.attribution && <p className="mt-1 text-[12px]" style={{ color: MUTED }}>— {block.attribution}</p>}
      </div>
    </div>
  </blockquote>
);

/* ────── Code ────── */
const CodeBlock: React.FC<{ block: Extract<ContentBlock, { type: 'code' }> }> = ({ block }) => (
  <pre
    className="my-3 rounded-xl p-4 overflow-x-auto text-[13px] leading-relaxed"
    style={{ backgroundColor: '#0F172A', color: '#E2E8F0', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
  >
    <code>{block.content}</code>
  </pre>
);

/* ────── Table ────── */
const TableBlock: React.FC<{ block: Extract<ContentBlock, { type: 'table' }> }> = ({ block }) => (
  <div className="my-3 overflow-x-auto rounded-xl border" style={{ borderColor: SOFT_BORDER }}>
    <table className="w-full text-[13.5px]" style={{ color: NAVY }}>
      <thead style={{ backgroundColor: '#F8FAFC' }}>
        <tr>
          {block.headers.map((h) => (
            <th key={h} className="px-3 py-2 text-left font-extrabold border-b" style={{ borderColor: SOFT_BORDER }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {block.rows.map((row, i) => (
          <tr key={i} className="even:bg-slate-50/40">
            {row.map((c, j) => (
              <td key={j} className="px-3 py-2 border-b" style={{ borderColor: SOFT_BORDER }}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ──────────────────────────────────────────────────────────────────────
   DIAGRAM SVGS
   ──────────────────────────────────────────────────────────────────── */
function ParabolaSvg() {
  return (
    <svg viewBox="0 0 320 220" className="w-full h-auto" aria-hidden>
      <defs>
        <linearGradient id="parabolaCurve" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      {/* Grid */}
      <g stroke="#EAEEF6" strokeWidth="0.6">
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 32} y1="10" x2={i * 32} y2="190" />
        ))}
        {Array.from({ length: 7 }).map((_, i) => (
          <line key={`h${i}`} x1="10" y1={i * 30 + 10} x2="310" y2={i * 30 + 10} />
        ))}
      </g>
      {/* Axes */}
      <line x1="20" y1="160" x2="310" y2="160" stroke="#0B1F3A" strokeWidth="1.4" />
      <line x1="160" y1="20" x2="160" y2="200" stroke="#0B1F3A" strokeWidth="1.4" />
      <text x="305" y="155" fontSize="11" fontStyle="italic" fill="#0B1F3A">x</text>
      <text x="166" y="22" fontSize="11" fontStyle="italic" fill="#0B1F3A">y</text>
      {/* Parabola */}
      <path d="M 40 30 Q 160 240, 280 30" fill="none" stroke="url(#parabolaCurve)" strokeWidth="2.2" />
      {/* x-roots */}
      <circle cx="100" cy="160" r="4" fill="#C47A45" />
      <circle cx="220" cy="160" r="4" fill="#C47A45" />
      <text x="86" y="178" fontSize="11" fontStyle="italic" fill="#0B1F3A">x</text>
      <text x="94" y="180" fontSize="9" fontStyle="italic" fill="#0B1F3A">1</text>
      <text x="226" y="178" fontSize="11" fontStyle="italic" fill="#0B1F3A">x</text>
      <text x="234" y="180" fontSize="9" fontStyle="italic" fill="#0B1F3A">2</text>
      {/* Origin */}
      <text x="148" y="178" fontSize="11" fill="#64748B">0</text>
      {/* Vertex callout */}
      <g transform="translate(190, 130)">
        <rect x="0" y="0" width="110" height="44" rx="6" fill="white" stroke="#E6EAF2" />
        <text x="55" y="14" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0B1F3A">Vertex</text>
        <text x="55" y="32" textAnchor="middle" fontSize="11" fontStyle="italic" fill="#0B1F3A">(−b/2a, ƒ(−b/2a))</text>
      </g>
      <line x1="200" y1="174" x2="245" y2="146" stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="2 2" />
    </svg>
  );
}

function AnimalCellSvg() {
  return (
    <svg viewBox="0 0 320 220" className="w-full h-auto" aria-hidden>
      <ellipse cx="160" cy="110" rx="140" ry="90" fill="#FBE3D2" stroke="#C47A45" strokeWidth="1.6" />
      <ellipse cx="160" cy="110" rx="40" ry="32" fill="#7C3AED" opacity="0.18" stroke="#7C3AED" strokeWidth="1.4" />
      <circle cx="160" cy="110" r="10" fill="#7C3AED" />
      <ellipse cx="100" cy="80" rx="22" ry="10" fill="#12B76A" opacity="0.7" stroke="#0F5132" strokeWidth="1" />
      <ellipse cx="220" cy="80" rx="22" ry="10" fill="#12B76A" opacity="0.5" stroke="#0F5132" strokeWidth="1" />
      <circle cx="105" cy="150" r="6" fill="#2563EB" />
      <circle cx="220" cy="150" r="5" fill="#2563EB" />
      <circle cx="80" cy="120" r="3" fill="#0B1F3A" />
      <circle cx="240" cy="130" r="3" fill="#0B1F3A" />
      <text x="160" y="114" textAnchor="middle" fontSize="9" fill="white" fontWeight="700">DNA</text>
      <text x="160" y="32" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0B1F3A">Generalised animal cell</text>
    </svg>
  );
}
