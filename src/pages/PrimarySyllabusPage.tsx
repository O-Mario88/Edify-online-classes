import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Bell, ChevronDown, ChevronRight, Bookmark, BookOpen, Crown, Check,
  Home, GraduationCap, NotebookPen, Video, Download, FolderClosed,
  StickyNote, Clock, BookMarked, Calendar, CalendarDays, LifeBuoy,
  School, Lightbulb, TrendingUp, ClipboardCheck, FileDown,
  Sigma, Globe2, Monitor, FlaskConical, Palette, BookA, Heart, Cross, BookOpenCheck,
  FileText as FilePdf,
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
  { label: 'Primary',          icon: GraduationCap, active: true, href: '/primary' },
  { label: 'Secondary',        icon: School,        href: '/secondary' },
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
  { value: '7',    label: 'Levels',   sub: 'Primary 1 to Primary 7',    icon: GraduationCap, accent: NAVY },
  { value: '20+',  label: 'Subjects', sub: 'Across all levels',         icon: BookOpen,      accent: NAVY },
  { value: '140+', label: 'Units',    sub: 'Detailed unit guides',      icon: ClipboardCheck, accent: ORANGE },
  { value: '24/7', label: 'Access',   sub: 'Learn anytime, anywhere',   icon: Clock,         accent: NAVY },
];

interface LevelCard {
  badge: string;
  title: string;
  description: string;
  subjects: string[];
}

const LEVELS: LevelCard[] = [
  { badge: 'P1', title: 'Primary 1', description: 'Build curiosity and confidence through foundational learning.',  subjects: ['English Language', 'Mathematics', 'Literacy', 'Health Education', 'Creative Arts'] },
  { badge: 'P2', title: 'Primary 2', description: 'Develop essential skills with engaging and meaningful lessons.', subjects: ['English Language', 'Mathematics', 'Science', 'Social Studies', 'Creative Arts'] },
  { badge: 'P3', title: 'Primary 3', description: 'Strengthen core concepts and apply knowledge with confidence.',   subjects: ['English Language', 'Mathematics', 'Science', 'Social Studies', 'ICT'] },
  { badge: 'P4', title: 'Primary 4', description: 'Expand thinking and explore the world around us.',                subjects: ['English Language', 'Mathematics', 'Science', 'Social Studies', 'ICT'] },
  { badge: 'P5', title: 'Primary 5', description: 'Apply knowledge creatively and build independent learning.',      subjects: ['English Language', 'Mathematics', 'Science', 'Social Studies', 'ICT'] },
  { badge: 'P6', title: 'Primary 6', description: 'Deepen understanding and prepare for new challenges.',            subjects: ['English Language', 'Mathematics', 'Science', 'Social Studies', 'ICT'] },
  { badge: 'P7', title: 'Primary 7', description: 'Consolidate learning and step confidently into the next stage.',   subjects: ['English Language', 'Mathematics', 'Science', 'Social Studies', 'Religious Education'] },
];

interface SubjectChip {
  name: string;
  units: string;
  icon: React.ComponentType<{ className?: string }>;
  ink: string;
  bg: string;
}

const SUBJECTS: SubjectChip[] = [
  { name: 'Mathematics',        units: '142 Units', icon: Sigma,       ink: '#5B4391', bg: '#F2EAFB' },
  { name: 'English Language',   units: '138 Units', icon: BookOpen,    ink: '#7C4A1E', bg: '#FCEFD8' },
  { name: 'Science',            units: '124 Units', icon: FlaskConical, ink: '#3D5C3A', bg: '#EDE6F2' },
  { name: 'Social Studies',     units: '96 Units',  icon: Globe2,      ink: '#3F6F5A', bg: '#E8F1E8' },
  { name: 'ICT',                units: '88 Units',  icon: Monitor,     ink: '#1E4163', bg: '#E5EAF2' },
  { name: 'Creative Arts',      units: '76 Units',  icon: Palette,     ink: '#7B2D26', bg: '#F5E0DC' },
  { name: 'Literacy',           units: '92 Units',  icon: BookA,       ink: '#7C4A1E', bg: '#FCEFD8' },
  { name: 'Reading',            units: '110 Units', icon: BookOpenCheck, ink: '#3F6F5A', bg: '#E8F1E8' },
  { name: 'Religious Education', units: '84 Units',  icon: Cross,       ink: '#1E4163', bg: '#E5EAF2' },
  { name: 'Health Education',   units: '68 Units',  icon: Heart,       ink: '#7B2D26', bg: '#F5E0DC' },
];

const HIGHLIGHTS = [
  { title: 'Foundational Literacy', body: 'Build strong reading, writing and communication skills.',      icon: ClipboardCheck },
  { title: 'Numeracy Growth',       body: 'Develop number sense and problem-solving with confidence.',     icon: TrendingUp },
  { title: 'Progressive Learning',  body: 'Age-appropriate pathways that build knowledge year by year.',   icon: Lightbulb },
  { title: 'Downloadable Guides',   body: 'Access and save full syllabus PDFs for every level.',           icon: FileDown },
];

const RECENT_PDFS = [
  { title: 'Primary 7 Syllabus', meta: 'Updated 2 days ago' },
  { title: 'Primary 5 Syllabus', meta: 'Updated 4 days ago' },
  { title: 'Primary 3 Syllabus', meta: 'Updated 1 week ago' },
  { title: 'Primary 1 Syllabus', meta: 'Updated 1 week ago' },
];

/* ───────── PAGE ───────── */
export const PrimarySyllabusPage: React.FC = () => {
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

          <div className="min-w-0">
            <PrimaryHero />
            <StatStrip />
            <LevelCards />
            <SubjectCollections />
          </div>

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

export default PrimarySyllabusPage;

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
      <linearGradient id="m1p" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#0B1F35" />
        <stop offset="100%" stopColor="#163556" />
      </linearGradient>
    </defs>
    <path d="M5 9 L16 13 L27 9 L27 24 L16 28 L5 24 Z" fill="url(#m1p)" />
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
      const content = (
        <>
          <span className={`w-7 h-7 rounded-md flex items-center justify-center ${active ? 'bg-white/15' : 'bg-[#F0E9D8]'}`}>
            <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-[#0B1F35]'}`} />
          </span>
          {label}
        </>
      );
      const cls = `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-colors ${active ? 'text-white' : 'text-[#0B1F35] hover:bg-[#F0E9D8]'}`;
      const style: React.CSSProperties | undefined = active ? { backgroundColor: NAVY } : undefined;
      if (href) {
        return <Link key={label} to={href} className={cls} style={style}>{content}</Link>;
      }
      return <button key={label} type="button" className={cls} style={style}>{content}</button>;
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
const PrimaryHero: React.FC = () => (
  <section className="relative overflow-hidden rounded-[20px] border bg-white" style={{ borderColor: CARD_BORDER }}>
    <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #FCF1DD 0%, #F7E5C5 60%, #FFFFFF 100%)' }} />

    <div className="relative grid lg:grid-cols-12 gap-6 items-center px-9 lg:px-11 py-10 min-h-[300px]">
      <div className="lg:col-span-7">
        <h1 className="text-[44px] lg:text-[48px] leading-[1.05] tracking-tight" style={{ color: NAVY, fontWeight: 700 }}>
          Explore the<br />Primary Syllabus
        </h1>
        <p className="mt-4 text-[16px] font-bold" style={{ color: ORANGE }}>
          Structured curriculum pathways from Primary 1 to Primary 7.
        </p>
        <p className="mt-3 max-w-xl text-[14px] leading-relaxed" style={{ color: '#3D4E66' }}>
          Curated subject roadmaps, learning outcomes, and unit breakdowns designed to help young learners build strong foundations and grow with confidence.
        </p>
      </div>

      <div className="lg:col-span-5 flex justify-center lg:justify-end">
        <PrimaryHeroIllustration />
      </div>
    </div>
  </section>
);

/* Custom backpack + open book + tablet + pencils + maple emblem illustration */
const PrimaryHeroIllustration: React.FC = () => (
  <svg viewBox="0 0 380 290" className="w-[340px] lg:w-[380px] h-auto" aria-hidden>
    <defs>
      <linearGradient id="bagP" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#143553" />
        <stop offset="100%" stopColor="#0B1F35" />
      </linearGradient>
      <linearGradient id="strapP" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0F2A45" />
        <stop offset="100%" stopColor="#091830" />
      </linearGradient>
      <linearGradient id="tabletP" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1A3358" />
        <stop offset="100%" stopColor="#0F2440" />
      </linearGradient>
      <linearGradient id="leafP" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#E0925F" />
        <stop offset="100%" stopColor="#A85F2D" />
      </linearGradient>
      <linearGradient id="bookP" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFFDF7" />
        <stop offset="100%" stopColor="#F4EAD3" />
      </linearGradient>
    </defs>

    {/* Background doodles in soft amber */}
    <g opacity="0.22" stroke="#A85F2D" strokeWidth="1.2" fill="none">
      <text x="22" y="40" fontFamily="Fraunces, serif" fontSize="22" fontWeight="700" fill="#A85F2D" stroke="none">ABC</text>
      <circle cx="40" cy="74" r="4" />
      <path d="M14 110 H66" />
      <path d="M22 122 H58" />
      <path d="M340 60 l-4 4 l4 4 l4 -4 z" />
      <path d="M348 28 v 10 M343 33 h 10" />
      <path d="M310 250 q 14 -8, 28 0" />
      <circle cx="350" cy="160" r="6" />
      <path d="M22 220 c 6 -8, 18 -8, 24 0" />
      <path d="M50 244 q 8 -6, 16 0" />
      <text x="318" y="98" fontFamily="Fraunces, serif" fontSize="11" fontWeight="700" fill="#A85F2D" stroke="none">123</text>
    </g>

    {/* Backpack body */}
    <path d="M180 70 Q100 70, 95 130 L95 230 Q95 256, 122 256 L240 256 Q266 256, 266 230 L266 130 Q260 70, 180 70 Z" fill="url(#bagP)" />
    {/* Top handle */}
    <path d="M165 72 Q180 50, 195 72" stroke="#091830" strokeWidth="6" fill="none" />
    {/* Front pocket */}
    <path d="M115 168 Q115 152, 132 152 L228 152 Q244 152, 244 168 L244 222 Q244 238, 228 238 L132 238 Q115 238, 115 222 Z" fill="url(#strapP)" />
    <line x1="120" y1="195" x2="240" y2="195" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="0.6" />
    {/* Maple emblem on backpack */}
    <path d="M180 105 C 172 92, 158 92, 158 105 C 158 116, 168 122, 180 134 C 192 122, 202 116, 202 105 C 202 92, 188 92, 180 105 Z" fill="url(#leafP)" />
    <line x1="180" y1="134" x2="180" y2="148" stroke="#A85F2D" strokeWidth="2" />
    {/* Side accents */}
    <rect x="92" y="170" width="6" height="40" rx="2" fill="#091830" />
    <rect x="263" y="170" width="6" height="40" rx="2" fill="#091830" />
    {/* Zip */}
    <line x1="132" y1="185" x2="226" y2="185" stroke="#A85F2D" strokeWidth="1.4" />
    <circle cx="132" cy="185" r="3" fill="#E0925F" />

    {/* Open book in front-bottom */}
    <path d="M22 220 L116 240 L116 270 L22 252 Z" fill="url(#bookP)" stroke="#A85F2D" strokeWidth="1" />
    <path d="M116 240 L210 220 L210 252 L116 270 Z" fill="url(#bookP)" stroke="#A85F2D" strokeWidth="1" />
    <line x1="116" y1="240" x2="116" y2="270" stroke="#A85F2D" strokeWidth="0.8" />
    {[247, 253, 259].map((y) => (
      <React.Fragment key={y}>
        <line x1="36" y1={y - 17} x2="98" y2={y - 13} stroke="#A85F2D" strokeWidth="0.4" opacity="0.5" />
        <line x1="124" y1={y - 14} x2="194" y2={y - 22} stroke="#A85F2D" strokeWidth="0.4" opacity="0.5" />
      </React.Fragment>
    ))}

    {/* Pencil holder */}
    <rect x="244" y="170" width="44" height="60" rx="4" fill="#FFFFFF" stroke="#A85F2D" strokeWidth="1.2" />
    <line x1="252" y1="200" x2="280" y2="200" stroke="#A85F2D" strokeWidth="0.6" />
    {/* Pencils */}
    <rect x="251" y="138" width="6" height="38" fill="#E0925F" />
    <polygon points="251,138 257,138 254,128" fill="#0B1F35" />
    <rect x="261" y="130" width="6" height="46" fill="#143553" />
    <polygon points="261,130 267,130 264,120" fill="#A85F2D" />
    <rect x="271" y="142" width="6" height="34" fill="#A85F2D" />
    <polygon points="271,142 277,142 274,132" fill="#0B1F35" />
    <rect x="281" y="135" width="6" height="41" fill="#FFD9A0" />
    <polygon points="281,135 287,135 284,125" fill="#0B1F35" />

    {/* Tablet */}
    <rect x="290" y="180" width="74" height="100" rx="6" fill="url(#tabletP)" />
    <rect x="296" y="186" width="62" height="78" rx="3" fill="#0F2440" />
    <path d="M327 200 C 320 192, 308 192, 308 200 C 308 208, 318 213, 327 222 C 336 213, 346 208, 346 200 C 346 192, 334 192, 327 200 Z" fill="url(#leafP)" />
    <line x1="327" y1="222" x2="327" y2="234" stroke={ORANGE} strokeWidth="1.5" />
    <circle cx="327" cy="270" r="2" fill="#FFFFFF" opacity="0.7" />
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

/* ───────── LEVEL CARDS ───────── */
const LevelCards: React.FC = () => (
  <div className="mt-7 grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-2.5">
    {LEVELS.map((s) => (
      <article key={s.badge} className="rounded-2xl bg-white border p-3.5 flex flex-col" style={{ borderColor: CARD_BORDER }}>
        <div className="flex items-center gap-2">
          <ShieldBadge text={s.badge} />
          <h3 className="text-[15px] font-extrabold tracking-tight leading-none" style={{ color: NAVY, fontFamily: 'Fraunces, serif' }}>
            {s.title}
          </h3>
        </div>
        <p className="mt-2.5 text-[11px] leading-[1.45]" style={{ color: '#3D4E66' }}>{s.description}</p>

        <p className="mt-2.5 text-[10px] font-extrabold uppercase tracking-[0.18em]" style={{ color: NAVY }}>Core Subjects</p>
        <ul className="mt-1.5 space-y-0.5">
          {s.subjects.map((line) => (
            <li key={line} className="flex items-start gap-1.5 text-[10.5px] leading-[1.45]" style={{ color: '#3D4E66' }}>
              <span className="mt-[5px] w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: ORANGE }} />
              <span>{line}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-3 space-y-1.5">
          <button type="button" className="w-full inline-flex items-center justify-center gap-1 rounded-md text-white px-2 py-1.5 text-[11px] font-extrabold" style={{ backgroundColor: NAVY }}>
            View Syllabus <ChevronRight className="w-3 h-3" />
          </button>
          <button type="button" className="w-full inline-flex items-center justify-center gap-1 rounded-md bg-white px-2 py-1.5 text-[11px] font-extrabold border" style={{ color: NAVY, borderColor: ORANGE }}>
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
        <linearGradient id={`sh${text}p`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#163556" />
          <stop offset="100%" stopColor="#0B1F35" />
        </linearGradient>
      </defs>
      <path d="M2 4 L18 1 L34 4 L34 22 Q34 32, 18 39 Q2 32, 2 22 Z" fill={`url(#sh${text}p)`} stroke={ORANGE} strokeWidth="0.8" />
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
      Personalised picks to support your child&apos;s learning journey.
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
