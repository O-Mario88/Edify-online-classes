import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  // Top nav
  Search, Bell, ChevronDown, ChevronRight, ArrowLeft,
  // Sidebar
  Home, GraduationCap, NotebookPen, BookOpen, Video,
  Download, FolderClosed, StickyNote, Clock, BookMarked,
  Calendar, CalendarDays, LifeBuoy, School, Crown, Check,
  // Page
  List, FolderOpen, HelpCircle, Sigma, BookA, Leaf, FlaskConical, Atom,
  Globe2, Columns3, Monitor, BookText, Briefcase, Calculator, TrendingUp,
  Grid3x3, FileText,
  Map as MapIcon, Sparkles, PlayCircle, ListChecks,
  CheckCircle2, Circle, MinusCircle,
} from 'lucide-react';

/* ────── DESIGN TOKENS ────── */
const NAVY = '#0B1F35';
const ORANGE = '#C97849';
const CREAM = '#F7F2E8';
const CARD_BORDER = '#E8DFCC';
const TEXT_MUTED = '#64748B';

/* ────── DATA ────── */
const SIDEBAR_BROWSE: { label: string; icon: React.ComponentType<{ className?: string }>; active?: boolean; href?: string }[] = [
  { label: 'Home',             icon: Home },
  { label: 'Primary',          icon: GraduationCap, href: '/primary' },
  { label: 'Secondary',        icon: School,        href: '/secondary' },
  { label: 'Revision Notes',   icon: NotebookPen },
  { label: 'Textbooks',        icon: BookOpen },
  { label: 'Syllabus',         icon: BookOpen,      active: true,    href: '/syllabus' },
  { label: 'Live Sessions',    icon: Video,         href: '/live-sessions' },
  { label: 'Video Lessons',    icon: PlayCircle },
  { label: 'Downloads',        icon: Download },
  { label: 'Saved Resources',  icon: FolderClosed },
];

const SIDEBAR_MY_LIBRARY = [
  { label: 'My Notes',        icon: StickyNote },
  { label: 'Recently Viewed', icon: Clock },
  { label: 'Bookmarks',       icon: BookMarked },
];

const SIDEBAR_QUICK = [
  { label: 'Study Planner',   icon: Calendar },
  { label: 'Exam Timetable',  icon: CalendarDays },
  { label: 'Help & Support',  icon: LifeBuoy },
];

interface SubjectInfo {
  key: string;
  name: string;
  level: string;
  icon: React.ComponentType<{ className?: string }>;
  ink: string;
  bg: string;
}

const SUBJECTS: SubjectInfo[] = [
  { key: 'mathematics',    name: 'Mathematics',     level: 'Secondary • Year 9', icon: Sigma,        ink: '#5B4391', bg: '#EEEAFE' },
  { key: 'english',        name: 'English Language', level: 'Secondary • Year 9', icon: BookA,        ink: '#7C4A1E', bg: '#FCEFD8' },
  { key: 'biology',        name: 'Biology',         level: 'Secondary • Year 9', icon: Leaf,         ink: '#3F6F5A', bg: '#E5F6EC' },
  { key: 'chemistry',      name: 'Chemistry',       level: 'Secondary • Year 9', icon: FlaskConical, ink: '#7C3AED', bg: '#EEEAFE' },
  { key: 'physics',        name: 'Physics',         level: 'Secondary • Year 9', icon: Atom,         ink: '#1E4163', bg: '#E0EBFF' },
  { key: 'geography',      name: 'Geography',       level: 'Secondary • Year 9', icon: Globe2,       ink: '#3F6F5A', bg: '#E5F6EC' },
  { key: 'history',        name: 'History',         level: 'Secondary • Year 9', icon: Columns3,     ink: '#7C4A1E', bg: '#FCEFD8' },
  { key: 'ict',            name: 'ICT',             level: 'Secondary • Year 9', icon: Monitor,      ink: '#1E4163', bg: '#E0EBFF' },
  { key: 'literature',     name: 'Literature',      level: 'Secondary • Year 9', icon: BookText,     ink: '#7B2D26', bg: '#FFE4E6' },
  { key: 'business',       name: 'Business Studies', level: 'Secondary • Year 9', icon: Briefcase,   ink: '#1E4163', bg: '#E0EBFF' },
  { key: 'accountancy',    name: 'Accountancy',     level: 'Secondary • Year 9', icon: Calculator,   ink: '#7C3AED', bg: '#EEEAFE' },
  { key: 'economics',      name: 'Economics',       level: 'Secondary • Year 9', icon: TrendingUp,   ink: '#3F6F5A', bg: '#E5F6EC' },
];

const STATS = [
  { value: '10',  label: 'Chapters',          icon: BookOpen,   tint: '#FCEFD8', ink: ORANGE },
  { value: '86',  label: 'Topics',            icon: List,       tint: '#FFE4E6', ink: '#EF4444' },
  { value: '124', label: 'Resources',         icon: FolderOpen, tint: '#FCEFD8', ink: ORANGE },
  { value: '48',  label: 'Practice Questions', icon: HelpCircle, tint: '#EEEAFE', ink: '#7C3AED' },
];

interface ChapterRow {
  num: number;
  title: string;
  topics: number;
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
  ink: string;
}

const CHAPTERS: ChapterRow[] = [
  { num: 1,  title: 'Number and Algebra',                topics: 12, icon: Sigma,        tint: '#EEEAFE', ink: '#7C3AED' },
  { num: 2,  title: 'Patterns, Sequences and Functions', topics: 8,  icon: TrendingUp,   tint: '#FFE4E6', ink: '#EF4444' },
  { num: 3,  title: 'Geometry and Measurement',          topics: 10, icon: Calculator,   tint: '#FCEFD8', ink: ORANGE },
  { num: 4,  title: 'Statistics and Probability',        topics: 9,  icon: TrendingUp,   tint: '#E0EBFF', ink: '#2563EB' },
  { num: 5,  title: 'Ratio, Proportion and Rates',       topics: 7,  icon: Sigma,        tint: '#FFE4E6', ink: '#EC4899' },
  { num: 6,  title: 'Equations and Inequalities',        topics: 9,  icon: Calculator,   tint: '#FFF6E0', ink: '#F59E0B' },
  { num: 7,  title: 'Lines, Angles and Polygons',        topics: 8,  icon: Atom,         tint: '#E5F6EC', ink: '#12B76A' },
  { num: 8,  title: 'Transformations and Constructions', topics: 6,  icon: Sparkles,     tint: '#FCEFD8', ink: ORANGE },
  { num: 9,  title: 'Areas and Volumes',                 topics: 7,  icon: Calculator,   tint: '#E0EBFF', ink: '#2563EB' },
  { num: 10, title: 'Trigonometry',                      topics: 10, icon: Sigma,        tint: '#FFE4E6', ink: '#EF4444' },
];

const QUICK_RESOURCES = [
  { title: 'Study Guide',   sub: 'Complete topic summaries', icon: FileText, tint: '#E0EBFF', ink: '#2563EB' },
  { title: 'Formula Sheet', sub: 'Key formulas & concepts',  icon: Sigma,    tint: '#EEEAFE', ink: '#7C3AED' },
  { title: 'Past Papers',   sub: 'Exam-style questions',     icon: FileText, tint: '#FFE4E6', ink: '#EF4444' },
  { title: 'Mind Maps',     sub: 'Visual topic breakdowns',  icon: MapIcon,  tint: '#E5F6EC', ink: '#12B76A' },
];

/* ────── PAGE ────── */
export const SubjectTopicsPage: React.FC = () => {
  const { subjectKey, subjectId } = useParams<{ subjectKey?: string; subjectId?: string }>();
  const requestedKey = (subjectKey || subjectId || 'mathematics').toLowerCase();
  const [search, setSearch] = useState('');

  const initialIndex = useMemo(() => {
    const ix = SUBJECTS.findIndex((s) => s.key === requestedKey);
    return ix >= 0 ? ix : 0;
  }, [requestedKey]);
  const [activeSubjectIdx, setActiveSubjectIdx] = useState(initialIndex);

  const subject = SUBJECTS[activeSubjectIdx];

  return (
    <div className="min-h-screen text-[#0B1F35] antialiased" style={{ backgroundColor: CREAM }}>
      <SchoolTopBar search={search} onSearchChange={setSearch} />

      <div className="mx-auto max-w-[1500px] px-5 py-5">
        <div className="grid lg:grid-cols-[232px,1fr] gap-6">
          <SchoolSidebar />

          <div className="min-w-0">
            <PageHeader subject={subject} />

            <div className="mt-6 grid xl:grid-cols-[260px,1fr,320px] gap-5">
              <SubjectListPanel activeIdx={activeSubjectIdx} onChange={setActiveSubjectIdx} />
              <ChaptersPanel />
              <aside className="space-y-5 min-w-0">
                <SyllabusOverview />
                <QuickResources />
                <RecommendedForYou />
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectTopicsPage;

/* ────── TOP BAR ────── */
const SchoolTopBar: React.FC<{ search: string; onSearchChange: (v: string) => void }> = ({ search, onSearchChange }) => (
  <header className="sticky top-0 z-40 bg-white border-b border-[#EFE7D6]">
    <div className="mx-auto max-w-[1500px] px-5">
      <div className="flex items-center gap-6 h-[88px]">
        <Link to="/" className="flex items-center gap-3 shrink-0 w-[210px]">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${ORANGE}1A` }}>
            <MapleBookIcon className="w-7 h-7" />
          </div>
          <div className="leading-none">
            <p className="text-[26px] font-extrabold tracking-[0.04em]" style={{ color: NAVY }}>MAPLE</p>
            <p className="mt-1 text-[10px] font-bold tracking-[0.32em]" style={{ color: NAVY }}>ONLINE SCHOOL</p>
          </div>
        </Link>

        <div className="relative flex-1 max-w-[480px]">
          <Search className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-[#A89C82] pointer-events-none" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search for books, notes, past papers, videos…"
            className="w-full bg-[#F7F2E8] border border-[#EAE0C9] rounded-full py-3 pl-12 pr-14 text-[13.5px] outline-none placeholder:text-[#A89C82] focus:border-[#C97849] focus:ring-2 focus:ring-[#C97849]/20 transition-all"
          />
          <button type="button" className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: ORANGE }} aria-label="Search">
            <Search className="w-4 h-4 text-white" />
          </button>
        </div>

        <nav className="hidden xl:flex items-center gap-7">
          <NavTab label="Library"        href="/library" />
          <NavTab label="Syllabus"       active />
          <NavTab label="Past Papers" />
          <NavTab label="Live Sessions"  href="/live-sessions" />
          <NavTab label="Video Lessons" />
          <NavTab label="Collections" />
          <NavTab label="My Learning" />
        </nav>

        <div className="flex items-center gap-3 shrink-0 ml-auto xl:ml-2">
          <button type="button" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#F7F2E8]" aria-label="Notifications">
            <Bell className="w-5 h-5" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[14px] font-extrabold shrink-0" style={{ backgroundColor: NAVY }}>M</div>
            <div className="hidden sm:block leading-tight pr-2">
              <p className="text-[13px] font-extrabold" style={{ color: NAVY }}>My Account</p>
              <p className="text-[11px] font-bold" style={{ color: ORANGE }}>Premium</p>
            </div>
            <ChevronDown className="w-4 h-4 text-[#A89C82]" />
          </Link>
        </div>
      </div>
    </div>
  </header>
);

const NavTab: React.FC<{ label: string; active?: boolean; href?: string }> = ({ label, active, href }) => {
  const Tag: any = href ? Link : 'button';
  const props = href ? { to: href } : { type: 'button' as const };
  return (
    <Tag {...props} className="relative inline-flex items-center text-[13.5px] font-bold transition-colors" style={{ color: active ? ORANGE : NAVY }}>
      <span>{label}</span>
      {active && <span className="absolute -bottom-2 left-0 right-0 h-[3px] rounded-full" style={{ backgroundColor: ORANGE }} />}
    </Tag>
  );
};

const MapleBookIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden>
    <defs>
      <linearGradient id="mST" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#0B1F35" />
        <stop offset="100%" stopColor="#163556" />
      </linearGradient>
    </defs>
    <path d="M5 9 L16 13 L27 9 L27 24 L16 28 L5 24 Z" fill="url(#mST)" />
    <path d="M16 13 L16 28" stroke="white" strokeOpacity="0.35" strokeWidth="0.6" />
    <path d="M16 7 C 14 4, 11 4, 11 7 C 11 10, 14 11, 16 13 C 18 11, 21 10, 21 7 C 21 4, 18 4, 16 7 Z" fill={ORANGE} />
  </svg>
);

/* ────── SIDEBAR ────── */
const SchoolSidebar: React.FC = () => (
  <aside className="hidden lg:block">
    <div className="sticky top-[104px] space-y-5 pb-6">
      <SidebarList items={SIDEBAR_BROWSE} />
      <SidebarLabeledList label="My Library" items={SIDEBAR_MY_LIBRARY} />
      <SidebarLabeledList label="Quick Links" items={SIDEBAR_QUICK} />

      <div className="rounded-2xl p-5 text-white shadow-xl" style={{ background: `linear-gradient(160deg, ${NAVY} 0%, #163556 100%)` }}>
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4" style={{ color: ORANGE }} />
          <p className="text-[13px] font-extrabold">Upgrade to Premium</p>
        </div>
        <ul className="mt-3 space-y-1.5">
          {['Unlimited Access', 'Download Notes', 'Offline Reading', 'Exclusive Content'].map((t) => (
            <li key={t} className="flex items-center gap-2 text-[12px] text-slate-200">
              <Check className="w-3.5 h-3.5 shrink-0" style={{ color: '#7BCFA0' }} />
              {t}
            </li>
          ))}
        </ul>
        <button type="button" className="mt-4 w-full rounded-full text-white font-extrabold text-[12px] py-2.5" style={{ backgroundColor: ORANGE }}>
          Go Premium
        </button>
      </div>
    </div>
  </aside>
);

const SidebarList: React.FC<{ items: { label: string; icon: React.ComponentType<{ className?: string }>; active?: boolean; href?: string }[] }> = ({ items }) => (
  <nav className="space-y-1">
    {items.map(({ label, icon: Icon, active, href }) => {
      const cls = `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-colors ${active ? 'text-white' : 'text-[#0B1F35] hover:bg-[#F0E9D8]'}`;
      const style: React.CSSProperties | undefined = active ? { backgroundColor: NAVY } : undefined;
      const inner = (
        <>
          <span className={`w-7 h-7 rounded-md flex items-center justify-center ${active ? 'bg-white/15' : 'bg-[#F0E9D8]'}`}>
            <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-[#0B1F35]'}`} />
          </span>
          {label}
        </>
      );
      if (href) return <Link key={label} to={href} className={cls} style={style}>{inner}</Link>;
      return <button key={label} type="button" className={cls} style={style}>{inner}</button>;
    })}
  </nav>
);

const SidebarLabeledList: React.FC<{
  label: string;
  items: { label: string; icon: React.ComponentType<{ className?: string }> }[];
}> = ({ label, items }) => (
  <div>
    <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#A89C82]">{label}</p>
    <SidebarList items={items} />
  </div>
);

/* ────── PAGE HEADER ────── */
const PageHeader: React.FC<{ subject: SubjectInfo }> = ({ subject }) => (
  <section>
    <Link to="/secondary" className="inline-flex items-center gap-1 text-[12.5px] font-bold mb-3" style={{ color: TEXT_MUTED }}>
      <ArrowLeft className="w-3.5 h-3.5" /> Back to Syllabus
    </Link>

    <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
      <div>
        <h1 className="text-[44px] lg:text-[48px] leading-tight tracking-tight" style={{ color: NAVY, fontFamily: 'Fraunces, serif', fontWeight: 600 }}>
          {subject.name}
        </h1>
        <span className="inline-flex items-center rounded-full bg-white border px-3 py-1 text-[11px] font-extrabold mt-2" style={{ borderColor: CARD_BORDER, color: NAVY }}>
          {subject.level}
        </span>
        <p className="mt-3 max-w-xl text-[13px] leading-relaxed" style={{ color: TEXT_MUTED }}>
          Explore all topics arranged as per the latest syllabus. Click any topic to view notes, textbooks, video lessons, and past papers.
        </p>
      </div>

      <div className="flex items-end gap-3 flex-wrap">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {STATS.map(({ value, label, icon: Icon, tint, ink }) => (
            <div key={label} className="rounded-xl bg-white border px-4 py-3 flex items-center gap-2.5" style={{ borderColor: CARD_BORDER }}>
              <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: tint }}>
                <Icon className="w-4 h-4" style={{ color: ink }} />
              </span>
              <div>
                <p className="text-[18px] font-extrabold leading-none" style={{ color: NAVY }}>{value}</p>
                <p className="text-[10.5px] font-bold mt-1" style={{ color: TEXT_MUTED }}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="mt-5 flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-bold ml-auto" style={{ color: TEXT_MUTED }}>Syllabus Year</span>
      <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-white border px-3 py-2 text-[12px] font-extrabold" style={{ color: NAVY, borderColor: CARD_BORDER }}>
        2024 – 2025 <ChevronDown className="w-3.5 h-3.5" />
      </button>
      <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-white border-2 px-4 py-2 text-[12px] font-extrabold" style={{ color: ORANGE, borderColor: ORANGE }}>
        <Download className="w-3.5 h-3.5" /> Download Full Syllabus
      </button>
    </div>
  </section>
);

/* ────── SUBJECT LIST PANEL ────── */
const SubjectListPanel: React.FC<{ activeIdx: number; onChange: (i: number) => void }> = ({ activeIdx, onChange }) => (
  <section className="rounded-2xl bg-white border p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.06)] self-start" style={{ borderColor: CARD_BORDER }}>
    <h3 className="text-[15px] font-extrabold mb-3" style={{ color: NAVY }}>All Subjects</h3>
    <ul className="space-y-1">
      {SUBJECTS.map((s, i) => {
        const Icon = s.icon;
        const active = i === activeIdx;
        return (
          <li key={s.key}>
            <button
              type="button"
              onClick={() => onChange(i)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-colors ${active ? 'text-white' : 'text-[#0B1F35] hover:bg-[#F8F4ED]'}`}
              style={active ? { backgroundColor: NAVY } : undefined}
            >
              <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: active ? 'rgba(255,255,255,0.16)' : s.bg }}>
                <Icon className="w-4 h-4" style={{ color: active ? 'white' : s.ink }} />
              </span>
              {s.name}
            </button>
          </li>
        );
      })}
    </ul>
    <button type="button" className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-[12px] font-extrabold" style={{ color: NAVY, borderColor: CARD_BORDER, backgroundColor: '#F8F4ED' }}>
      <Grid3x3 className="w-3.5 h-3.5" /> View All Subjects
    </button>
  </section>
);

/* ────── CHAPTERS PANEL ────── */
const ChaptersPanel: React.FC = () => (
  <section className="rounded-2xl bg-white border p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.06)]" style={{ borderColor: CARD_BORDER }}>
    <h3 className="text-[18px] font-extrabold mb-4" style={{ color: NAVY }}>Topical Arrangement</h3>
    <ul className="space-y-2">
      {CHAPTERS.map((c) => {
        const Icon = c.icon;
        return (
          <li key={c.num}>
            <button type="button" className="w-full flex items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left hover:shadow-md transition-shadow" style={{ borderColor: CARD_BORDER }}>
              <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: c.tint }}>
                <Icon className="w-4 h-4" style={{ color: c.ink }} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10.5px] font-extrabold tracking-[0.18em] uppercase" style={{ color: ORANGE }}>Chapter {c.num}</p>
                <p className="text-[14px] font-extrabold leading-tight" style={{ color: NAVY }}>{c.title}</p>
              </div>
              <p className="text-[11.5px] font-bold shrink-0" style={{ color: TEXT_MUTED }}>{c.topics} topics</p>
              <ChevronDown className="w-4 h-4 shrink-0" style={{ color: TEXT_MUTED }} />
            </button>
          </li>
        );
      })}
    </ul>
  </section>
);

/* ────── SYLLABUS OVERVIEW ────── */
const SyllabusOverview: React.FC = () => (
  <section className="rounded-2xl bg-white border p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.06)]" style={{ borderColor: CARD_BORDER }}>
    <h3 className="text-[15px] font-extrabold mb-4" style={{ color: NAVY }}>Syllabus Overview</h3>
    <div className="grid grid-cols-[120px,1fr] gap-3 items-center">
      <ProgressDonut value={82} />
      <ul className="space-y-2.5 text-[12px]">
        <li className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: '#12B76A' }} />
          <div className="min-w-0">
            <p className="font-extrabold leading-tight" style={{ color: NAVY }}>Completed</p>
            <p className="font-bold" style={{ color: TEXT_MUTED }}>71 / 86</p>
          </div>
        </li>
        <li className="flex items-center gap-2">
          <Circle className="w-3.5 h-3.5 shrink-0" style={{ color: '#F59E0B' }} />
          <div className="min-w-0">
            <p className="font-extrabold leading-tight" style={{ color: NAVY }}>In Progress</p>
            <p className="font-bold" style={{ color: TEXT_MUTED }}>18</p>
          </div>
        </li>
        <li className="flex items-center gap-2">
          <MinusCircle className="w-3.5 h-3.5 shrink-0" style={{ color: '#EF4444' }} />
          <div className="min-w-0">
            <p className="font-extrabold leading-tight" style={{ color: NAVY }}>Not Started</p>
            <p className="font-bold" style={{ color: TEXT_MUTED }}>—</p>
          </div>
        </li>
      </ul>
    </div>
    <p className="mt-4 text-[11.5px] font-semibold" style={{ color: TEXT_MUTED }}>
      Keep going! You&apos;re doing great. <span aria-hidden>✨</span>
    </p>
  </section>
);

const ProgressDonut: React.FC<{ value: number }> = ({ value }) => {
  const r = 42;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <svg viewBox="0 0 110 110" className="w-[110px] h-[110px]" aria-hidden>
      <circle cx="55" cy="55" r={r} fill="none" stroke="#F1F5F9" strokeWidth="10" />
      <circle cx="55" cy="55" r={r} fill="none" stroke={ORANGE} strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 55 55)" />
      <text x="55" y="56" textAnchor="middle" fontSize="22" fontWeight="800" fill={NAVY}>{value}%</text>
      <text x="55" y="72" textAnchor="middle" fontSize="9" fontWeight="700" fill={TEXT_MUTED}>Topics Covered</text>
    </svg>
  );
};

/* ────── QUICK RESOURCES ────── */
const QuickResources: React.FC = () => (
  <section className="rounded-2xl bg-white border p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.06)]" style={{ borderColor: CARD_BORDER }}>
    <h3 className="text-[15px] font-extrabold mb-3" style={{ color: NAVY }}>Quick Resources</h3>
    <ul className="divide-y" style={{ borderColor: CARD_BORDER }}>
      {QUICK_RESOURCES.map(({ title, sub, icon: Icon, tint, ink }) => (
        <li key={title}>
          <button type="button" className="w-full flex items-center gap-3 px-1 py-3 hover:bg-slate-50 rounded-md text-left">
            <span className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: tint }}>
              <Icon className="w-4 h-4" style={{ color: ink }} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-extrabold leading-tight" style={{ color: NAVY }}>{title}</p>
              <p className="text-[10.5px] font-semibold" style={{ color: TEXT_MUTED }}>{sub}</p>
            </div>
            <ChevronRight className="w-4 h-4 shrink-0" style={{ color: TEXT_MUTED }} />
          </button>
        </li>
      ))}
    </ul>
  </section>
);

/* ────── RECOMMENDED FOR YOU ────── */
const RecommendedForYou: React.FC = () => (
  <section className="rounded-2xl bg-white border p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.06)]" style={{ borderColor: CARD_BORDER }}>
    <h3 className="text-[15px] font-extrabold mb-3" style={{ color: NAVY }}>Recommended For You</h3>

    <div className="rounded-xl overflow-hidden border mb-3 flex items-center gap-3 p-2" style={{ borderColor: CARD_BORDER }}>
      <div className="relative w-[68px] h-[44px] rounded-md overflow-hidden shrink-0" style={{ background: 'linear-gradient(135deg,#5B4391,#3D2D5C)' }}>
        <img src="https://i.pravatar.cc/120?img=12" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-90" />
        <span className="absolute inset-0 flex items-center justify-center">
          <PlayCircle className="w-6 h-6 text-white" />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-extrabold leading-tight" style={{ color: NAVY }}>Algebra Made Easy</p>
        <p className="text-[10.5px] font-semibold" style={{ color: TEXT_MUTED }}>Video Lesson • 24 min</p>
      </div>
      <button type="button" className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: ORANGE }} aria-label="Play">
        <PlayCircle className="w-4 h-4" />
      </button>
    </div>

    <button type="button" className="w-full flex items-center gap-3 rounded-xl border p-2 text-left mb-3" style={{ borderColor: CARD_BORDER }}>
      <span className="w-10 h-10 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: '#E5F6EC' }}>
        <ListChecks className="w-4 h-4" style={{ color: '#12B76A' }} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-extrabold leading-tight" style={{ color: NAVY }}>Mastering Equations</p>
        <p className="text-[10.5px] font-semibold" style={{ color: TEXT_MUTED }}>Practice Set • 20 Questions</p>
      </div>
      <ChevronRight className="w-4 h-4 shrink-0" style={{ color: TEXT_MUTED }} />
    </button>

    <button type="button" className="w-full rounded-md border py-2.5 text-[12px] font-extrabold" style={{ color: NAVY, borderColor: CARD_BORDER }}>
      View More Recommendations
    </button>
  </section>
);
