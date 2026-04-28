import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Bell, ChevronDown, ChevronRight, Bookmark, BookOpen, Crown, Check,
  Home, GraduationCap, NotebookPen, Video, Download, FolderClosed,
  StickyNote, Clock, BookMarked, Calendar, CalendarDays, LifeBuoy,
  School, Lightbulb, TrendingUp, ClipboardCheck, FileDown,
  Sigma, Atom, FlaskConical, Leaf, Globe2, Monitor, BookText, Briefcase,
  FileText as FilePdf, Columns3,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/* ───────── DESIGN TOKENS ───────── */
const NAVY = '#0B1F35';
const ORANGE = '#C97849';
const CREAM = '#F7F2E8';
const CARD_BORDER = '#E8DFCC';

/* ───────── DATA ───────── */
const SIDEBAR_BROWSE: { label: string; icon: React.ComponentType<{ className?: string }>; active?: boolean; href?: string }[] = [
  { label: 'Home',             icon: Home },
  { label: 'Primary',          icon: GraduationCap, href: '/primary' },
  { label: 'Secondary',        icon: School, active: true, href: '/secondary' },
  { label: 'Revision Notes',   icon: NotebookPen },
  { label: 'Textbooks',        icon: BookOpen },
  { label: 'Recorded Lessons', icon: Video },
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

const STATS = [
  { value: '6',    label: 'Levels',   sub: 'Senior 1 – Senior 6',     icon: GraduationCap, accent: NAVY },
  { value: '40+',  label: 'Subjects', sub: 'Across all levels',        icon: BookOpen,     accent: NAVY },
  { value: '120+', label: 'Units',    sub: 'Detailed unit guides',     icon: ClipboardCheck, accent: ORANGE },
  { value: '24/7', label: 'Access',   sub: 'Learn anytime, anywhere',  icon: Clock,        accent: NAVY },
];

interface SeniorCard {
  badge: string;
  title: string;
  description: string;
  subjects: string[];
}

const SENIORS: SeniorCard[] = [
  { badge: 'S1', title: 'Senior 1', description: 'Build strong foundations and explore core concepts.',           subjects: ['English, Mathematics', 'Integrated Science', 'ICT'] },
  { badge: 'S2', title: 'Senior 2', description: 'Strengthen skills and deepen understanding.',                   subjects: ['English, Mathematics', 'Integrated Science', 'Social Studies'] },
  { badge: 'S3', title: 'Senior 3', description: 'Prepare for key assessments with confidence.',                  subjects: ['English, Mathematics', 'Integrated Science', 'ICT'] },
  { badge: 'S4', title: 'Senior 4', description: 'Advance your knowledge and critical thinking.',                 subjects: ['English, Mathematics', 'Biology, Chemistry', 'Physics'] },
  { badge: 'S5', title: 'Senior 5', description: 'Specialize and refine for academic excellence.',                subjects: ['English, Mathematics', 'Biology, Chemistry', 'Physics'] },
  { badge: 'S6', title: 'Senior 6', description: 'Excel and achieve your university aspirations.',                subjects: ['English, Mathematics', 'Biology, Chemistry', 'Physics'] },
];

interface SubjectChip {
  name: string;
  units: string;
  icon: React.ComponentType<{ className?: string }>;
  ink: string;
  bg: string;
}

const SUBJECTS: SubjectChip[] = [
  { name: 'Mathematics',     units: '24 Units', icon: Sigma,        ink: '#5B4391', bg: '#F2EAFB' },
  { name: 'English Language', units: '20 Units', icon: BookOpen,     ink: '#7C4A1E', bg: '#FCEFD8' },
  { name: 'Biology',         units: '18 Units', icon: Leaf,         ink: '#3F6F5A', bg: '#E8F1E8' },
  { name: 'Chemistry',       units: '18 Units', icon: FlaskConical, ink: '#3D5C3A', bg: '#EDE6F2' },
  { name: 'Physics',         units: '18 Units', icon: Atom,         ink: '#1E4163', bg: '#E5EAF2' },
  { name: 'Geography',       units: '16 Units', icon: Globe2,       ink: '#3F6F5A', bg: '#E8F1E8' },
  { name: 'History',         units: '16 Units', icon: Columns3,     ink: '#7C4A1E', bg: '#FCEFD8' },
  { name: 'ICT',             units: '14 Units', icon: Monitor,      ink: '#1E4163', bg: '#E5EAF2' },
  { name: 'Literature',      units: '12 Units', icon: BookText,     ink: '#7B2D26', bg: '#F5E0DC' },
  { name: 'Entrepreneurship', units: '10 Units', icon: Briefcase,    ink: '#7C4A1E', bg: '#FCEFD8' },
];

const HIGHLIGHTS = [
  { title: 'Competency-Based Learning', body: 'Aligned with modern education standards.',                 icon: Lightbulb },
  { title: 'Progressive Pathways',      body: 'Structured learning from foundations to mastery.',          icon: TrendingUp },
  { title: 'Assessment Ready',          body: 'Supports exams, projects, and real-world application.',     icon: ClipboardCheck },
  { title: 'Downloadable Guides',       body: 'Access and save syllabus documents anytime.',               icon: FileDown },
];

const RECENT_PDFS = [
  { title: 'S4 Physics Syllabus',           meta: 'Updated 2 days ago' },
  { title: 'S3 Mathematics Syllabus',       meta: 'Updated 5 days ago' },
  { title: 'S5 Chemistry Syllabus',         meta: 'Updated 1 week ago' },
  { title: 'S2 English Language Syllabus',  meta: 'Updated 1 week ago' },
];

/* ───────── PAGE ───────── */
export const SecondarySyllabusPage: React.FC = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen text-[#0B1F35] antialiased" style={{ backgroundColor: CREAM }}>
      <SchoolTopBar
        avatarUrl={user?.avatar}
        name={user?.name}
        search={search}
        onSearchChange={setSearch}
      />

      <div className="mx-auto max-w-[1500px] px-5 py-5">
        <div className="grid lg:grid-cols-[232px,1fr,300px] gap-6">
          <SchoolSidebar />

          {/* Main column */}
          <div className="min-w-0">
            <SecondaryHero />
            <StatStrip />
            <SeniorCards />
            <SubjectCollections />
          </div>

          {/* Right rail */}
          <aside className="space-y-6 min-w-0">
            <CurriculumHighlights />
            <RecentlyUpdated />
            <RecommendedForYou />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default SecondarySyllabusPage;

/* ───────── TOP BAR ───────── */
const SchoolTopBar: React.FC<{
  avatarUrl?: string;
  name?: string;
  search: string;
  onSearchChange: (v: string) => void;
}> = ({ avatarUrl, name, search, onSearchChange }) => (
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
          <button
            type="button"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center shadow-md"
            style={{ backgroundColor: ORANGE }}
            aria-label="Search"
          >
            <Search className="w-4 h-4 text-white" />
          </button>
        </div>

        <nav className="hidden xl:flex items-center gap-7">
          <NavTab label="Library"        href="/library" />
          <NavTab label="Syllabus"       active />
          <NavTab label="Past Papers" />
          <NavTab label="Video Lessons" />
          <NavTab label="Collections" />
          <NavTab label="My Learning" />
        </nav>

        <div className="flex items-center gap-3 shrink-0 ml-auto xl:ml-2">
          <button type="button" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#F7F2E8]" aria-label="Notifications">
            <Bell className="w-5 h-5" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[14px] font-extrabold overflow-hidden shrink-0" style={{ backgroundColor: NAVY }}>
              {avatarUrl ? <img src={avatarUrl} alt={name || 'Student'} className="w-full h-full object-cover" /> : (name?.[0] || 'M').toUpperCase()}
            </div>
            <div className="hidden sm:block leading-tight pr-2">
              <p className="text-[13px] font-extrabold" style={{ color: NAVY }}>My Account</p>
              <p className="text-[11px] font-bold" style={{ color: ORANGE }}>Premium</p>
            </div>
            <ChevronDown className="w-4 h-4 text-[#A89C82] group-hover:text-[#0B1F35]" />
          </Link>
        </div>
      </div>
    </div>
  </header>
);

const NavTab: React.FC<{ label: string; active?: boolean; href?: string }> = ({ label, active, href }) => {
  const Tag: any = href ? Link : 'button';
  const tagProps = href ? { to: href } : { type: 'button' as const };
  return (
    <Tag
      {...tagProps}
      className="relative inline-flex items-center gap-1 text-[13.5px] font-bold transition-colors"
      style={{ color: active ? ORANGE : NAVY }}
    >
      <span>{label}</span>
      {active && <span className="absolute -bottom-2 left-0 right-0 h-[3px] rounded-full" style={{ backgroundColor: ORANGE }} />}
    </Tag>
  );
};

const MapleBookIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden>
    <defs>
      <linearGradient id="m1s" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#0B1F35" />
        <stop offset="100%" stopColor="#163556" />
      </linearGradient>
    </defs>
    <path d="M5 9 L16 13 L27 9 L27 24 L16 28 L5 24 Z" fill="url(#m1s)" />
    <path d="M16 13 L16 28" stroke="white" strokeOpacity="0.35" strokeWidth="0.6" />
    <path d="M16 7 C 14 4, 11 4, 11 7 C 11 10, 14 11, 16 13 C 18 11, 21 10, 21 7 C 21 4, 18 4, 16 7 Z" fill={ORANGE} />
  </svg>
);

/* ───────── SIDEBAR ───────── */
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
          {['Unlimited Downloads', 'Offline Access', 'Exclusive Content', 'Advanced Analytics'].map((t) => (
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

/* ───────── HERO ───────── */
const SecondaryHero: React.FC = () => (
  <section className="relative overflow-hidden rounded-[20px] border bg-white" style={{ borderColor: CARD_BORDER }}>
    <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #F9F3E5 0%, #F4EAD3 60%, #FFFFFF 100%)' }} />

    <div className="relative grid lg:grid-cols-12 gap-6 items-center px-9 lg:px-11 py-10 min-h-[300px]">
      <div className="lg:col-span-7">
        <h1 className="text-[44px] lg:text-[48px] leading-[1.05] tracking-tight" style={{ color: NAVY, fontWeight: 700 }}>
          Explore the<br />Secondary Syllabus
        </h1>
        <p className="mt-4 text-[16px] font-bold" style={{ color: ORANGE }}>
          Structured curriculum pathways for Senior 1 to Senior 6.
        </p>
        <p className="mt-3 max-w-xl text-[14px] leading-relaxed" style={{ color: '#3D4E66' }}>
          Curated subject roadmaps, learning outcomes, and unit breakdowns designed to help you learn with clarity and achieve with confidence.
        </p>
      </div>

      <div className="lg:col-span-5 flex justify-center lg:justify-end">
        <SecondaryHeroIllustration />
      </div>
    </div>
  </section>
);

const SecondaryHeroIllustration: React.FC = () => (
  <svg viewBox="0 0 360 280" className="w-[320px] lg:w-[360px] h-auto" aria-hidden>
    <defs>
      <linearGradient id="bookA" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0F2A45" />
        <stop offset="100%" stopColor="#091A2C" />
      </linearGradient>
      <linearGradient id="bookB" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#143553" />
        <stop offset="100%" stopColor="#0B233E" />
      </linearGradient>
      <linearGradient id="cap" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#D9874E" />
        <stop offset="100%" stopColor="#A85F2D" />
      </linearGradient>
      <linearGradient id="leaf" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#E0925F" />
        <stop offset="100%" stopColor="#A85F2D" />
      </linearGradient>
      <linearGradient id="screen" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1A3358" />
        <stop offset="100%" stopColor="#0F2440" />
      </linearGradient>
    </defs>

    {/* Background decorative books in soft amber */}
    <g opacity="0.18">
      <rect x="22"  y="26"  width="72" height="14" rx="2" fill="#A85F2D" />
      <rect x="32"  y="46"  width="58" height="14" rx="2" fill="#A85F2D" />
      <rect x="270" y="22"  width="68" height="14" rx="2" fill="#A85F2D" />
      <rect x="282" y="42"  width="52" height="14" rx="2" fill="#A85F2D" />
      <circle cx="42" cy="100" r="4" fill="#A85F2D" />
      <circle cx="320" cy="92" r="3" fill="#A85F2D" />
      <path d="M40 142 H110 M40 152 H92" stroke="#A85F2D" strokeWidth="1" />
      <path d="M260 200 H330 M270 210 H322" stroke="#A85F2D" strokeWidth="1" />
    </g>

    {/* Bottom book stack */}
    <rect x="80"  y="232" width="200" height="22" rx="3" fill="url(#bookA)" />
    <rect x="78"  y="232" width="6"  height="22" fill={ORANGE} />
    <rect x="92"  y="208" width="176" height="22" rx="3" fill="url(#bookB)" />
    <rect x="90"  y="208" width="6"  height="22" fill={ORANGE} />
    <rect x="100" y="184" width="160" height="22" rx="3" fill="url(#bookA)" />
    <rect x="98"  y="184" width="6"  height="22" fill={ORANGE} />

    {/* Maple-leaf book emblem on the stack */}
    <rect x="138" y="118" width="84" height="62" rx="4" fill="url(#screen)" />
    <rect x="138" y="118" width="84" height="62" rx="4" fill="none" stroke={ORANGE} strokeWidth="1.5" opacity="0.6" />
    <path d="M180 130 C 168 116, 150 116, 150 130 C 150 142, 165 148, 180 162 C 195 148, 210 142, 210 130 C 210 116, 192 116, 180 130 Z" fill="url(#leaf)" />
    <line x1="180" y1="162" x2="180" y2="178" stroke={ORANGE} strokeWidth="2" />

    {/* WiFi signals above the screen */}
    <path d="M170 110 Q180 102, 190 110" stroke={ORANGE} strokeWidth="1.8" fill="none" />
    <path d="M164 102 Q180 90, 196 102" stroke={ORANGE} strokeWidth="1.8" fill="none" opacity="0.7" />
    <path d="M158 94 Q180 78, 202 94" stroke={ORANGE} strokeWidth="1.8" fill="none" opacity="0.4" />

    {/* Graduation cap */}
    <polygon points="120,80 240,80 180,55" fill="url(#cap)" />
    <rect x="155" y="82" width="50" height="10" fill="url(#cap)" />
    <line x1="180" y1="55" x2="180" y2="48" stroke={NAVY} strokeWidth="2" />
    <circle cx="180" cy="46" r="3" fill={NAVY} />
    <path d="M180 80 L240 80 L240 96 Q235 100, 230 96" stroke={ORANGE} strokeWidth="2" fill="none" />
  </svg>
);

/* ───────── STATS ───────── */
const StatStrip: React.FC = () => (
  <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
    {STATS.map(({ value, label, sub, icon: Icon, accent }) => (
      <div key={label} className="rounded-2xl bg-white border px-5 py-4 flex items-center gap-4" style={{ borderColor: CARD_BORDER }}>
        <span className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}14` }}>
          <Icon className="w-5 h-5" style={{ color: accent }} />
        </span>
        <div className="min-w-0">
          <p className="text-[26px] font-extrabold leading-none" style={{ color: NAVY }}>{value}</p>
          <p className="mt-1 text-[13px] font-extrabold" style={{ color: NAVY }}>{label}</p>
          <p className="text-[11px] font-semibold text-[#7B7058]">{sub}</p>
        </div>
      </div>
    ))}
  </div>
);

/* ───────── SENIOR CARDS ───────── */
const SeniorCards: React.FC = () => (
  <div className="mt-7 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
    {SENIORS.map((s) => (
      <article
        key={s.badge}
        className="rounded-2xl bg-white border p-4 flex flex-col"
        style={{ borderColor: CARD_BORDER }}
      >
        <div className="flex items-center gap-2.5">
          <ShieldBadge text={s.badge} />
          <h3 className="text-[16px] font-extrabold tracking-tight leading-none" style={{ color: NAVY, fontFamily: 'Fraunces, serif' }}>
            {s.title}
          </h3>
        </div>
        <p className="mt-3 text-[11.5px] leading-[1.45]" style={{ color: '#3D4E66' }}>{s.description}</p>

        <p className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.18em]" style={{ color: NAVY }}>Core Subjects</p>
        <ul className="mt-1.5 space-y-0.5">
          {s.subjects.map((line) => (
            <li key={line} className="flex items-start gap-1.5 text-[11px] leading-[1.45]" style={{ color: '#3D4E66' }}>
              <span className="mt-[5px] w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: ORANGE }} />
              <span>{line}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-4 space-y-1.5">
          <button type="button" className="w-full inline-flex items-center justify-center gap-1 rounded-md text-white px-2.5 py-1.5 text-[11.5px] font-extrabold" style={{ backgroundColor: NAVY }}>
            View Syllabus <ChevronRight className="w-3 h-3" />
          </button>
          <button type="button" className="w-full inline-flex items-center justify-center gap-1 rounded-md bg-white px-2.5 py-1.5 text-[11.5px] font-extrabold border" style={{ color: NAVY, borderColor: ORANGE }}>
            Download PDF <Download className="w-3 h-3" />
          </button>
        </div>
      </article>
    ))}
  </div>
);

const ShieldBadge: React.FC<{ text: string }> = ({ text }) => (
  <span className="relative flex items-center justify-center w-9 h-10 shrink-0">
    <svg viewBox="0 0 36 40" className="absolute inset-0 w-full h-full" aria-hidden>
      <defs>
        <linearGradient id={`sh${text}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#163556" />
          <stop offset="100%" stopColor="#0B1F35" />
        </linearGradient>
      </defs>
      <path d="M2 4 L18 1 L34 4 L34 22 Q34 32, 18 39 Q2 32, 2 22 Z" fill={`url(#sh${text})`} stroke={ORANGE} strokeWidth="0.8" />
    </svg>
    <span className="relative text-[11px] font-extrabold text-white tracking-tight">{text}</span>
  </span>
);

/* ───────── SUBJECT COLLECTIONS ───────── */
const SubjectCollections: React.FC = () => (
  <section className="mt-8">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-[20px] font-extrabold" style={{ color: NAVY }}>Explore Subject Collections</h2>
      <button type="button" className="inline-flex items-center gap-0.5 text-[12.5px] font-extrabold" style={{ color: ORANGE }}>
        View All Subjects <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {SUBJECTS.map(({ name, units, icon: Icon, ink, bg }) => (
        <button
          key={name}
          type="button"
          className="rounded-xl bg-white border px-4 py-3.5 flex items-center gap-3 text-left transition-shadow hover:shadow-md"
          style={{ borderColor: CARD_BORDER }}
        >
          <span className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
            <Icon className="w-5 h-5" style={{ color: ink }} />
          </span>
          <div className="min-w-0">
            <p className="text-[13.5px] font-extrabold tracking-tight leading-tight" style={{ color: NAVY }}>{name}</p>
            <p className="mt-0.5 text-[11.5px] font-semibold text-[#7B7058]">{units}</p>
          </div>
        </button>
      ))}
    </div>
  </section>
);

/* ───────── RIGHT RAIL ───────── */
const CurriculumHighlights: React.FC = () => (
  <section className="rounded-2xl bg-white border p-5" style={{ borderColor: CARD_BORDER }}>
    <div className="flex items-center gap-2 mb-3">
      <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${NAVY}10` }}>
        <School className="w-4 h-4" style={{ color: NAVY }} />
      </span>
      <h3 className="text-[15px] font-extrabold" style={{ color: NAVY }}>Curriculum Highlights</h3>
    </div>
    <ul className="space-y-3.5">
      {HIGHLIGHTS.map(({ title, body, icon: Icon }) => (
        <li key={title} className="flex items-start gap-3">
          <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${ORANGE}1A` }}>
            <Icon className="w-4 h-4" style={{ color: ORANGE }} />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-extrabold leading-tight" style={{ color: NAVY }}>{title}</p>
            <p className="mt-0.5 text-[11.5px] leading-relaxed" style={{ color: '#7B7058' }}>{body}</p>
          </div>
        </li>
      ))}
    </ul>
    <button type="button" className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-extrabold" style={{ color: ORANGE }}>
      Learn more about our curriculum <ChevronRight className="w-3.5 h-3.5" />
    </button>
  </section>
);

const RecentlyUpdated: React.FC = () => (
  <section className="rounded-2xl bg-white border p-5" style={{ borderColor: CARD_BORDER }}>
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-[15px] font-extrabold" style={{ color: NAVY }}>Recently Updated</h3>
      <button type="button" className="text-[12px] font-extrabold inline-flex items-center gap-0.5" style={{ color: ORANGE }}>
        View All <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
    <ul className="space-y-3">
      {RECENT_PDFS.map((p) => (
        <li key={p.title} className="flex items-center gap-3">
          <span className="w-8 h-10 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: '#F5E6D8' }}>
            <FilePdf className="w-4 h-4" style={{ color: ORANGE }} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-extrabold leading-tight" style={{ color: NAVY }}>{p.title}</p>
            <p className="mt-0.5 text-[11px] font-semibold text-[#7B7058]">{p.meta}</p>
          </div>
          <Bookmark className="w-4 h-4 text-[#A89C82] shrink-0" />
        </li>
      ))}
    </ul>
  </section>
);

const RecommendedForYou: React.FC = () => (
  <section className="rounded-2xl bg-white border p-5" style={{ borderColor: CARD_BORDER }}>
    <div className="flex items-center gap-2 mb-2">
      <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${ORANGE}1A` }}>
        <School className="w-4 h-4" style={{ color: ORANGE }} />
      </span>
      <h3 className="text-[15px] font-extrabold" style={{ color: NAVY }}>Recommended for You</h3>
    </div>
    <p className="text-[12.5px] leading-relaxed" style={{ color: '#7B7058' }}>
      Personalized picks to support your learning journey.
    </p>
    <button
      type="button"
      className="mt-4 w-full rounded-md text-white text-[12.5px] font-extrabold py-2.5 inline-flex items-center justify-center gap-1.5"
      style={{ backgroundColor: NAVY }}
    >
      Explore Recommendations <ChevronRight className="w-3.5 h-3.5" />
    </button>
  </section>
);
