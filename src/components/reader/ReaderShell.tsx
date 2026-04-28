import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, ChevronDown, ChevronRight, ChevronLeft,
  Bookmark, Highlighter, Download, Maximize2, Plus, Minus,
  Calculator as CalcIcon, BookOpen, FlaskConical, Atom, Leaf, Globe2,
  Columns3, Monitor, BookText, Briefcase, TrendingUp, Sigma, Target, Crosshair,
} from 'lucide-react';
import type { ChapterNode, ResourceContent, SubjectContent } from './types';

const NAVY = '#0B1F3A';
const COPPER = '#C47A45';
const CREAM = '#FFFDF9';
const SOFT_BORDER = '#E6EAF2';
const MUTED = '#64748B';

const SUBJECT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  mathematics: Sigma,
  english: BookOpen,
  biology: Leaf,
  chemistry: FlaskConical,
  physics: Atom,
  geography: Globe2,
  history: Columns3,
  ict: Monitor,
  literature: BookText,
  business: Briefcase,
  accountancy: CalcIcon,
  economics: TrendingUp,
};

/* ────── TOP BAR ────── */
export const ReaderTopBar: React.FC<{
  onSearchChange?: (v: string) => void;
}> = ({ onSearchChange }) => {
  const [search, setSearch] = useState('');
  return (
    <header className="sticky top-0 z-40 bg-white border-b" style={{ borderColor: SOFT_BORDER }}>
      <div className="mx-auto max-w-[1500px] px-5">
        <div className="flex items-center gap-6 h-[72px]">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-[20px]" aria-hidden>🍁</span>
            <div className="leading-none">
              <p className="text-[18px] font-extrabold tracking-tight" style={{ color: NAVY, fontFamily: 'Fraunces, serif' }}>MAPLE</p>
              <p className="text-[9px] font-bold tracking-[0.32em]" style={{ color: NAVY }}>ONLINE SCHOOL</p>
            </div>
          </Link>

          <div className="relative flex-1 max-w-[640px]">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); onSearchChange?.(e.target.value); }}
              placeholder="Search notes, topics, textbooks…"
              className="w-full bg-[#F8FAFC] border rounded-full py-2.5 pl-11 pr-14 text-[13.5px] outline-none placeholder:text-slate-400 focus:bg-white transition-all"
              style={{ borderColor: SOFT_BORDER, color: NAVY }}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold rounded-md border px-1.5 py-0.5" style={{ borderColor: SOFT_BORDER, color: MUTED }}>⌘ K</span>
          </div>

          <div className="flex items-center gap-3 ml-auto shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11.5px] font-extrabold border" style={{ color: NAVY, borderColor: SOFT_BORDER }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#12B76A', boxShadow: '0 0 0 3px #12B76A22' }} />
              Student
              <ChevronDown className="w-3.5 h-3.5" style={{ color: MUTED }} />
            </span>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-extrabold" style={{ backgroundColor: NAVY }}>
              S
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

/* ────── LEFT SIDEBAR — SUBJECT + CHAPTER TREE ────── */
export const ReaderSidebar: React.FC<{
  subject: SubjectContent;
  resource: ResourceContent | null;
  focusActive: boolean;
}> = ({ subject, resource, focusActive }) => {
  const navigate = useNavigate();
  const SubjectIcon = SUBJECT_ICONS[subject.subject] ?? BookOpen;

  return (
    <aside className="hidden lg:flex flex-col w-[260px] shrink-0 sticky top-[72px] self-start" style={{ height: 'calc(100vh - 72px)' }}>
      <div className="flex-1 overflow-y-auto pr-2 py-5">
        {/* Subject header */}
        <div className="rounded-xl bg-white border p-3 flex items-center gap-3" style={{ borderColor: SOFT_BORDER }}>
          <span className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FFF7ED' }}>
            <SubjectIcon className="w-4 h-4" style={{ color: COPPER }} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-extrabold leading-tight" style={{ color: NAVY }}>{subject.subjectLabel}</p>
            <p className="text-[10.5px] font-semibold" style={{ color: MUTED }}>{subject.level}</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5" style={{ color: MUTED }} />
        </div>

        {/* Chapter tree */}
        <p className="px-3 mt-4 mb-2 text-[10px] font-bold tracking-[0.22em] uppercase" style={{ color: MUTED }}>Chapters</p>
        <nav>
          {subject.chapters.map((c) => (
            <ChapterRow
              key={c.id}
              chapter={c}
              activeChapterId={resource?.chapterId}
              activeTopicId={resource?.topicId}
              onPickTopic={(topicId) => navigate(`/learn/${subject.subject}/${c.id}/${topicId}`)}
            />
          ))}
        </nav>

        {/* Focused reading mode card */}
        <div className="mt-6 rounded-xl border p-4 flex items-center gap-3" style={{ borderColor: SOFT_BORDER, backgroundColor: focusActive ? '#ECFDF5' : '#F8FAFC' }}>
          <span className="w-10 h-10 rounded-xl flex items-center justify-center bg-white" style={{ border: `1px solid ${SOFT_BORDER}` }}>
            <Crosshair className="w-4 h-4" style={{ color: COPPER }} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-extrabold" style={{ color: NAVY }}>Focused Reading Mode</p>
            <p className="text-[10.5px]" style={{ color: MUTED }}>Distractions minimized for deep study</p>
          </div>
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: focusActive ? '#12B76A' : '#CBD5E1' }} />
        </div>
      </div>
    </aside>
  );
};

const CHAPTER_ICON_TINTS: { tint: string; ink: string }[] = [
  { tint: '#EEEAFE', ink: '#7C3AED' },
  { tint: '#FFF7ED', ink: COPPER },
  { tint: '#E5F6EC', ink: '#12B76A' },
  { tint: '#E0EBFF', ink: '#2563EB' },
  { tint: '#FDECEC', ink: '#EF4444' },
  { tint: '#FFE4E6', ink: '#EC4899' },
];

const ChapterRow: React.FC<{
  chapter: ChapterNode;
  activeChapterId?: string;
  activeTopicId?: string;
  onPickTopic: (topicId: string) => void;
}> = ({ chapter, activeChapterId, activeTopicId, onPickTopic }) => {
  const isActiveChapter = activeChapterId === chapter.id;
  const [expanded, setExpanded] = useState(isActiveChapter);
  const tint = CHAPTER_ICON_TINTS[(chapter.num - 1) % CHAPTER_ICON_TINTS.length];

  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-left hover:bg-slate-50"
      >
        <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: tint.tint }}>
          <span className="text-[10px] font-extrabold" style={{ color: tint.ink }}>{chapter.num}</span>
        </span>
        <span className="flex-1 text-[12.5px] font-extrabold" style={{ color: NAVY }}>{chapter.title}</span>
        {chapter.topics && chapter.topics.length > 0 && (
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? '' : '-rotate-90'}`} style={{ color: MUTED }} />
        )}
      </button>
      {expanded && chapter.topics && (
        <ul className="ml-9 mt-0.5 mb-1 space-y-0.5">
          {chapter.topics.map((t) => {
            const isActive = isActiveChapter && t.id === activeTopicId;
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => onPickTopic(t.id)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[12.5px] transition-colors ${isActive ? 'font-extrabold' : 'font-semibold hover:bg-slate-50'}`}
                  style={isActive ? { backgroundColor: '#FFF1E0', color: NAVY } : { color: '#475569' }}
                >
                  <span className="w-1 h-1 rounded-full" style={{ backgroundColor: isActive ? COPPER : '#CBD5E1' }} />
                  <span className="text-left">{t.title}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

/* ────── READER TOOLBAR ────── */
export const ReaderToolbar: React.FC<{
  resource: ResourceContent;
  onPrev: () => void;
  onNext: () => void;
  zoom: number;
  onZoom: (z: number) => void;
  focusActive: boolean;
  onToggleFocus: () => void;
}> = ({ resource, onPrev, onNext, zoom, onZoom, focusActive, onToggleFocus }) => (
  <div className="rounded-xl bg-white border" style={{ borderColor: SOFT_BORDER, backgroundColor: CREAM }}>
    <div className="flex flex-wrap items-center gap-3 px-4 py-2.5">
      <button type="button" onClick={onPrev} className="inline-flex items-center gap-1 text-[12.5px] font-bold hover:bg-slate-50 rounded-md px-2 py-1" style={{ color: NAVY }}>
        <ChevronLeft className="w-3.5 h-3.5" /> Previous
      </button>
      <div className="inline-flex items-center gap-1 text-[12.5px] font-extrabold rounded-lg border bg-white px-2 py-1" style={{ color: NAVY, borderColor: SOFT_BORDER }}>
        <span>{resource.currentPage}</span>
        <span style={{ color: MUTED }}>/</span>
        <span style={{ color: MUTED }}>{resource.totalPages}</span>
      </div>
      <button type="button" onClick={onNext} className="inline-flex items-center gap-1 text-[12.5px] font-bold hover:bg-slate-50 rounded-md px-2 py-1" style={{ color: NAVY }}>
        Next <ChevronRight className="w-3.5 h-3.5" />
      </button>

      <div className="ml-auto inline-flex items-center gap-2">
        <button type="button" onClick={() => onZoom(Math.max(70, zoom - 10))} aria-label="Zoom out" className="w-7 h-7 rounded-md hover:bg-slate-50 flex items-center justify-center" style={{ color: NAVY }}>
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="text-[12.5px] font-extrabold w-12 text-center" style={{ color: NAVY }}>{zoom}%</span>
        <button type="button" onClick={() => onZoom(Math.min(160, zoom + 10))} aria-label="Zoom in" className="w-7 h-7 rounded-md hover:bg-slate-50 flex items-center justify-center" style={{ color: NAVY }}>
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <ToolbarBtn icon={Bookmark} label="Bookmark" />
      <ToolbarBtn icon={Highlighter} label="Highlight" />
      <ToolbarBtn icon={Download} label="Download PDF" />
      <button
        type="button"
        onClick={onToggleFocus}
        className="inline-flex items-center gap-1.5 text-[12px] font-extrabold rounded-md px-2.5 py-1.5"
        style={focusActive ? { backgroundColor: NAVY, color: 'white' } : { color: NAVY }}
      >
        <Maximize2 className="w-3.5 h-3.5" /> Focus Mode
      </button>
    </div>

    <div className="px-4 pb-3">
      <div className="rounded-full overflow-hidden h-1" style={{ backgroundColor: '#F1ECDF' }}>
        <div className="h-full" style={{ width: `${resource.progressPercent}%`, background: `linear-gradient(90deg, ${COPPER} 0%, #E8A06D 100%)` }} />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[11px]" style={{ color: MUTED }}>
        <span />
        <span>{resource.currentPage} / {resource.totalPages} pages • {resource.progressPercent}% complete</span>
      </div>
    </div>
  </div>
);

const ToolbarBtn: React.FC<{ icon: React.ComponentType<{ className?: string }>; label: string }> = ({ icon: Icon, label }) => (
  <button type="button" className="inline-flex items-center gap-1.5 text-[12px] font-extrabold rounded-md px-2.5 py-1.5 hover:bg-slate-50" style={{ color: NAVY }}>
    <Icon className="w-3.5 h-3.5" /> {label}
  </button>
);

/* Keep Target import alive for tree-shaking when sidebar adds a future indicator. */
export const _IconKeepalive = Target;
