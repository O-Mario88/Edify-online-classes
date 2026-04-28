import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Bell, ChevronDown, ChevronRight, Crown, Check,
  Home, GraduationCap, NotebookPen, Video, Download, FolderClosed,
  StickyNote, Clock, BookMarked, Calendar, CalendarDays, LifeBuoy,
  School, BookOpen, Radio, PlayCircle, Play, Sigma, FlaskConical, Leaf, Atom,
  BookText, Monitor, Download as DownloadIcon,
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
  { label: 'Secondary',        icon: School,        href: '/secondary' },
  { label: 'Revision Notes',   icon: NotebookPen },
  { label: 'Textbooks',        icon: BookOpen },
  { label: 'Live Sessions',    icon: Radio, active: true, href: '/live-sessions' },
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

type SubjectKey = 'math' | 'english' | 'biology' | 'chemistry' | 'ict' | 'literature' | 'physics';

const SUBJECT_TILE: Record<SubjectKey, { icon: React.ComponentType<{ className?: string }>; bg: string; ink: string }> = {
  math:       { icon: Sigma,        bg: '#F2EAFB', ink: '#5B4391' },
  english:    { icon: BookOpen,     bg: '#FCEFD8', ink: '#7C4A1E' },
  biology:    { icon: Leaf,         bg: '#E8F1E8', ink: '#3F6F5A' },
  chemistry:  { icon: FlaskConical, bg: '#EDE6F2', ink: '#3D5C3A' },
  ict:        { icon: Monitor,      bg: '#E5EAF2', ink: '#1E4163' },
  literature: { icon: BookText,     bg: '#F5E0DC', ink: '#7B2D26' },
  physics:    { icon: Atom,         bg: '#E5EAF2', ink: '#1E4163' },
};

const STATS = [
  { value: '12',   label: 'Upcoming Classes', sub: 'Next 7 days',         icon: Radio,    accent: ORANGE },
  { value: '86',   label: 'Recorded Lessons', sub: 'Available to watch',  icon: PlayCircle, accent: '#3F6F5A' },
  { value: '24',   label: 'Live This Week',   sub: 'Across all subjects', icon: Calendar, accent: NAVY },
  { value: '06',   label: 'Subjects',         sub: 'Active this week',    icon: BookOpen, accent: NAVY },
  { value: '24/7', label: 'Flexible Access',  sub: 'Learn anytime',       icon: Clock,    accent: NAVY },
];

interface UpcomingClass {
  id: string;
  subject: string;
  topic: string;
  subjectKey: SubjectKey;
  teacher: string;
  teacherImg: string;
  date: string;
  time: string;
  level: string;
  status: 'LIVE' | 'UPCOMING';
}

const UPCOMING: UpcomingClass[] = [
  { id: '1', subject: 'Mathematics',     subjectKey: 'math',       topic: 'Quadratic Equations & Graphs',   teacher: 'Mr. Daniel Smith',   teacherImg: 'https://i.pravatar.cc/80?img=12', date: 'Today, May 21', time: '09:00 AM', level: 'Secondary Year 10', status: 'LIVE' },
  { id: '2', subject: 'English Language', subjectKey: 'english',    topic: 'Analysing Non-Fiction Texts',     teacher: 'Ms. Sarah Khan',     teacherImg: 'https://i.pravatar.cc/80?img=49', date: 'Today, May 21', time: '11:00 AM', level: 'Secondary Year 9',  status: 'UPCOMING' },
  { id: '3', subject: 'Biology',          subjectKey: 'biology',    topic: 'Cell Structure & Function',       teacher: 'Dr. Aisha Rahman',   teacherImg: 'https://i.pravatar.cc/80?img=47', date: 'Today, May 21', time: '01:00 PM', level: 'Secondary Year 10', status: 'UPCOMING' },
  { id: '4', subject: 'Chemistry',        subjectKey: 'chemistry',  topic: 'Chemical Reactions',              teacher: 'Mr. James Wilson',   teacherImg: 'https://i.pravatar.cc/80?img=15', date: 'Today, May 21', time: '03:00 PM', level: 'Secondary Year 11', status: 'UPCOMING' },
  { id: '5', subject: 'ICT',              subjectKey: 'ict',        topic: 'Python Basics – Variables',        teacher: 'Mr. Ali Raza',       teacherImg: 'https://i.pravatar.cc/80?img=33', date: 'Today, May 21', time: '05:00 PM', level: 'Secondary Year 8',  status: 'UPCOMING' },
  { id: '6', subject: 'Literature',       subjectKey: 'literature', topic: 'Poetry – Theme & Tone',           teacher: 'Ms. Emily Johnson',  teacherImg: 'https://i.pravatar.cc/80?img=44', date: 'Today, May 21', time: '07:00 PM', level: 'Secondary Year 9',  status: 'UPCOMING' },
];

interface RecordedLesson {
  id: string;
  subject: string;
  subjectKey: SubjectKey;
  title: string;
  teacher: string;
  duration: string;
}

const RECORDED: RecordedLesson[] = [
  { id: '1', subject: 'Mathematics',     subjectKey: 'math',      title: 'Linear Equations',     teacher: 'Mr. Daniel Smith',   duration: '45:20' },
  { id: '2', subject: 'English Language', subjectKey: 'english',   title: 'Writing a Good Essay', teacher: 'Ms. Sarah Khan',     duration: '50:15' },
  { id: '3', subject: 'Biology',         subjectKey: 'biology',   title: 'Enzymes & Reactions',  teacher: 'Dr. Aisha Rahman',   duration: '47:10' },
  { id: '4', subject: 'Chemistry',       subjectKey: 'chemistry', title: 'Acids, Bases & Salts', teacher: 'Mr. James Wilson',   duration: '52:30' },
  { id: '5', subject: 'ICT',             subjectKey: 'ict',       title: 'Introduction to Python', teacher: 'Mr. Ali Raza',     duration: '46:05' },
];

const WEEKLY_SCHEDULE = [
  { day: 'Mon',  date: 'May 19', count: '4 Classes', state: 'done' as const },
  { day: 'Tue',  date: 'May 20', count: '5 Classes', state: 'done' as const },
  { day: 'Today', date: 'May 21', count: '6 Classes', state: 'today' as const },
  { day: 'Thu',  date: 'May 22', count: '5 Classes', state: 'future' as const },
  { day: 'Fri',  date: 'May 23', count: '4 Classes', state: 'future' as const },
  { day: 'Sat',  date: 'May 24', count: '2 Classes', state: 'future' as const },
  { day: 'Sun',  date: 'May 25', count: '0 Classes', state: 'future' as const },
];

const RECENTLY_UPLOADED: { subjectKey: SubjectKey; subject: string; title: string; meta: string }[] = [
  { subjectKey: 'physics', subject: 'Physics', title: 'Laws of Motion',      meta: 'May 20, 2025 • 48:15' },
  { subjectKey: 'english', subject: 'English', title: 'Story Elements',      meta: 'May 20, 2025 • 42:10' },
  { subjectKey: 'math',    subject: 'Maths',   title: 'Coordinate Geometry', meta: 'May 19, 2025 • 44:08' },
];

/* ───────── PAGE ───────── */
export const LiveSessionsPage: React.FC = () => {
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
        <div className="grid lg:grid-cols-[232px,1fr,320px] gap-6">
          <SchoolSidebar />

          <div className="min-w-0 space-y-6">
            <LiveHero />
            <StatStrip />
            <UpcomingLiveClasses />
            <RecordedAndCompleted />
          </div>

          <aside className="space-y-5 min-w-0">
            <YourNextClass />
            <WeeklySchedule />
            <RecentlyUploaded />
            <ContinueLearning />
            <PremiumStrip />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default LiveSessionsPage;

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
          <NavTab label="Syllabus"       href="/secondary" />
          <NavTab label="Live Sessions"  active />
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
      <linearGradient id="m1l" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#0B1F35" />
        <stop offset="100%" stopColor="#163556" />
      </linearGradient>
    </defs>
    <path d="M5 9 L16 13 L27 9 L27 24 L16 28 L5 24 Z" fill="url(#m1l)" />
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
          {['Unlimited Live Classes', 'Access All Replays', 'Download Notes', 'Priority Support'].map((t) => (
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
const LiveHero: React.FC = () => (
  <section className="relative overflow-hidden rounded-[20px] border bg-white" style={{ borderColor: CARD_BORDER }}>
    <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #FCF1DD 0%, #F7E5C5 60%, #FFFFFF 100%)' }} />

    <div className="relative grid lg:grid-cols-12 gap-6 items-center px-9 lg:px-11 py-9 min-h-[260px]">
      <div className="lg:col-span-7">
        <h1 className="text-[40px] lg:text-[44px] leading-[1.05] tracking-tight" style={{ color: NAVY, fontWeight: 700 }}>
          Attend Live Classes &amp;<br />Rewatch Anytime
        </h1>
        <p className="mt-3 max-w-xl text-[14px] leading-relaxed" style={{ color: '#3D4E66' }}>
          Join interactive live sessions with expert teachers and revisit recordings anytime for better learning.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" className="inline-flex items-center gap-2 rounded-full text-white px-5 h-11 text-[13px] font-extrabold shadow-lg" style={{ backgroundColor: NAVY }}>
            View Weekly Schedule <ChevronRight className="w-4 h-4" />
          </button>
          <button type="button" className="inline-flex items-center gap-2 rounded-full bg-white px-5 h-11 text-[13px] font-extrabold border-2" style={{ color: NAVY, borderColor: ORANGE }}>
            <Play className="w-3.5 h-3.5 fill-current" style={{ color: ORANGE }} /> How Live Classes Work
          </button>
        </div>
      </div>

      <div className="lg:col-span-5 flex justify-center lg:justify-end">
        <LiveHeroIllustration />
      </div>
    </div>
  </section>
);

const LiveHeroIllustration: React.FC = () => (
  <svg viewBox="0 0 380 260" className="w-[340px] lg:w-[380px] h-auto" aria-hidden>
    <defs>
      <linearGradient id="laptopL" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#143553" />
        <stop offset="100%" stopColor="#0B1F35" />
      </linearGradient>
      <linearGradient id="screenL" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1A3358" />
        <stop offset="100%" stopColor="#0F2440" />
      </linearGradient>
      <linearGradient id="capL" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#143553" />
        <stop offset="100%" stopColor="#0B1F35" />
      </linearGradient>
      <linearGradient id="bookL" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFFDF7" />
        <stop offset="100%" stopColor="#F4EAD3" />
      </linearGradient>
    </defs>

    {/* Background doodles */}
    <g opacity="0.22" stroke="#A85F2D" strokeWidth="1.2" fill="none">
      <circle cx="40" cy="36" r="4" />
      <path d="M345 28 v 10 M340 33 h 10" />
      <path d="M22 220 q 14 -8, 28 0" />
      <circle cx="350" cy="200" r="6" />
      <path d="M50 244 q 8 -6, 16 0" />
    </g>

    {/* Laptop */}
    <rect x="58" y="60" width="240" height="148" rx="8" fill="url(#laptopL)" />
    <rect x="68" y="70" width="220" height="128" rx="4" fill="url(#screenL)" />
    {/* Laptop base */}
    <rect x="40" y="208" width="276" height="14" rx="4" fill="#0F2440" />
    <rect x="160" y="208" width="40" height="6" rx="2" fill="#091830" />

    {/* LIVE pill on top right of screen */}
    <rect x="238" y="80" width="40" height="16" rx="3" fill={ORANGE} />
    <text x="258" y="92" textAnchor="middle" fontSize="9" fontWeight="800" fill="white" fontFamily="Inter, sans-serif">LIVE</text>
    <circle cx="244" cy="88" r="2" fill="white" />

    {/* Inner play scene */}
    <circle cx="178" cy="138" r="36" fill="rgba(255,255,255,0.06)" />
    <circle cx="178" cy="138" r="28" fill="rgba(255,255,255,0.12)" />
    {/* Play triangle */}
    <polygon points="170,124 170,152 196,138" fill="white" />

    {/* Tiny teacher avatar bottom-left of screen */}
    <rect x="76" y="160" width="38" height="32" rx="3" fill="#163556" />
    <circle cx="95" cy="174" r="6" fill="#FFD9A0" />
    <rect x="86" y="180" width="18" height="9" rx="2" fill="#0B1F35" />

    {/* Notebook tabs */}
    <g opacity="0.7">
      <rect x="234" y="124" width="38" height="34" rx="2" fill="#FFD9A0" />
      <line x1="240" y1="132" x2="266" y2="132" stroke="#A85F2D" strokeWidth="0.6" />
      <line x1="240" y1="138" x2="266" y2="138" stroke="#A85F2D" strokeWidth="0.6" />
      <line x1="240" y1="144" x2="260" y2="144" stroke="#A85F2D" strokeWidth="0.6" />
      <line x1="240" y1="150" x2="262" y2="150" stroke="#A85F2D" strokeWidth="0.6" />
      <circle cx="271" cy="128" r="1.5" fill="#A85F2D" />
      <circle cx="271" cy="138" r="1.5" fill="#A85F2D" />
      <circle cx="271" cy="148" r="1.5" fill="#A85F2D" />
    </g>

    {/* Graduation cap on left */}
    <polygon points="60,228 138,228 99,212" fill="url(#capL)" />
    <rect x="80" y="230" width="38" height="6" fill="url(#capL)" />
    <line x1="99" y1="212" x2="99" y2="206" stroke={ORANGE} strokeWidth="2" />
    <circle cx="99" cy="204" r="3" fill={ORANGE} />

    {/* Open book front-right */}
    <path d="M204 232 L292 220 L292 248 L204 252 Z" fill="url(#bookL)" stroke="#A85F2D" strokeWidth="0.8" />
    <path d="M292 220 L350 232 L350 252 L292 248 Z" fill="url(#bookL)" stroke="#A85F2D" strokeWidth="0.8" />
    <line x1="292" y1="220" x2="292" y2="248" stroke="#A85F2D" strokeWidth="0.6" />
    {[230, 236, 242].map((y) => (
      <React.Fragment key={y}>
        <line x1="216" y1={y} x2="288" y2={y - 4} stroke="#A85F2D" strokeWidth="0.4" opacity="0.55" />
        <line x1="296" y1={y - 4} x2="346" y2={y} stroke="#A85F2D" strokeWidth="0.4" opacity="0.55" />
      </React.Fragment>
    ))}

    {/* Pencil holder right */}
    <rect x="318" y="146" width="38" height="60" rx="3" fill="#FFFFFF" stroke="#A85F2D" strokeWidth="1.2" />
    <rect x="324" y="120" width="5" height="32" fill="#E0925F" />
    <polygon points="324,120 329,120 326,112" fill="#0B1F35" />
    <rect x="333" y="115" width="5" height="38" fill="#143553" />
    <polygon points="333,115 338,115 335,108" fill="#A85F2D" />
    <rect x="342" y="124" width="5" height="29" fill="#A85F2D" />
    <polygon points="342,124 347,124 344,116" fill="#0B1F35" />
  </svg>
);

/* ───────── STATS ───────── */
const StatStrip: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
    {STATS.map(({ value, label, sub, icon: Icon, accent }) => (
      <div key={label} className="rounded-2xl bg-white border px-4 py-3.5 flex items-center gap-3" style={{ borderColor: CARD_BORDER }}>
        <span className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}1A` }}>
          <Icon className="w-5 h-5" style={{ color: accent }} />
        </span>
        <div className="min-w-0">
          <p className="text-[22px] font-extrabold leading-none" style={{ color: NAVY }}>{value}</p>
          <p className="mt-1 text-[12px] font-extrabold" style={{ color: NAVY }}>{label}</p>
          <p className="text-[10.5px] font-semibold text-[#7B7058]">{sub}</p>
        </div>
      </div>
    ))}
  </div>
);

/* ───────── UPCOMING LIVE CLASSES ───────── */
const UpcomingLiveClasses: React.FC = () => {
  const [filter, setFilter] = useState<'Today' | 'This Week' | 'All Classes'>('Today');
  const FILTERS = ['Today', 'This Week', 'All Classes'] as const;
  return (
    <section>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h2 className="text-[20px] font-extrabold" style={{ color: NAVY }}>Upcoming Live Classes</h2>
        <div className="flex items-center gap-1.5 ml-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-full text-[11.5px] font-extrabold transition-colors"
              style={filter === f ? { backgroundColor: NAVY, color: 'white' } : { backgroundColor: 'white', color: NAVY, border: `1px solid ${CARD_BORDER}` }}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <FilterPill label="All Subjects" />
          <FilterPill label="All Levels" />
          <button type="button" className="text-[12.5px] font-extrabold inline-flex items-center gap-0.5" style={{ color: ORANGE }}>
            View Full Schedule <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white border divide-y" style={{ borderColor: CARD_BORDER }}>
        {UPCOMING.map((c) => (
          <UpcomingRow key={c.id} c={c} />
        ))}
      </div>

      <div className="text-center mt-3">
        <button type="button" className="inline-flex items-center gap-1 text-[12.5px] font-extrabold" style={{ color: ORANGE }}>
          View All Upcoming Classes <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
};

const FilterPill: React.FC<{ label: string }> = ({ label }) => (
  <button type="button" className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[11.5px] font-bold border" style={{ color: NAVY, borderColor: CARD_BORDER }}>
    {label} <ChevronDown className="w-3 h-3" />
  </button>
);

const UpcomingRow: React.FC<{ c: UpcomingClass }> = ({ c }) => {
  const tile = SUBJECT_TILE[c.subjectKey];
  const Icon = tile.icon;
  const isLive = c.status === 'LIVE';
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.6fr,1.2fr,1fr,0.8fr,1fr,0.7fr,auto] gap-3 lg:gap-4 items-center px-4 py-3.5">
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: tile.bg }}>
          <Icon className="w-5 h-5" style={{ color: tile.ink }} />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-extrabold leading-tight" style={{ color: NAVY }}>{c.subject}</p>
          <p className="text-[11.5px] font-semibold text-[#7B7058] truncate">{c.topic}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 min-w-0">
        <img src={c.teacherImg} alt={c.teacher} className="w-7 h-7 rounded-full object-cover shrink-0" />
        <p className="text-[12px] font-bold truncate" style={{ color: NAVY }}>{c.teacher}</p>
      </div>
      <p className="text-[12px] font-bold inline-flex items-center gap-1.5" style={{ color: NAVY }}>
        <Calendar className="w-3.5 h-3.5" style={{ color: ORANGE }} /> {c.date}
      </p>
      <p className="text-[12px] font-bold inline-flex items-center gap-1.5" style={{ color: NAVY }}>
        <Clock className="w-3.5 h-3.5" style={{ color: ORANGE }} /> {c.time}
      </p>
      <p className="text-[11.5px] font-semibold text-[#7B7058]">{c.level.split(' ').slice(0, 1).join(' ')}<br /><span className="font-bold" style={{ color: NAVY }}>{c.level.split(' ').slice(1).join(' ')}</span></p>
      <span className="inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider" style={isLive ? { backgroundColor: '#E5F6EC', color: '#1B7B49' } : { backgroundColor: '#FCEFD8', color: ORANGE }}>
        {c.status}
      </span>
      <button type="button" className="rounded-md text-white text-[12px] font-extrabold px-4 py-2 shrink-0" style={{ backgroundColor: NAVY }}>
        Join Class
      </button>
    </div>
  );
};

/* ───────── RECORDED & COMPLETED ───────── */
const RecordedAndCompleted: React.FC = () => (
  <section>
    <div className="flex items-end justify-between mb-3">
      <div>
        <h2 className="text-[20px] font-extrabold" style={{ color: NAVY }}>Recorded &amp; Completed Lessons</h2>
        <p className="text-[12.5px]" style={{ color: '#7B7058' }}>Rewatch previous classes and strengthen your understanding.</p>
      </div>
      <button type="button" className="inline-flex items-center gap-0.5 text-[12.5px] font-extrabold" style={{ color: ORANGE }}>
        View All Replays <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>

    <div className="relative">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {RECORDED.map((r) => <RecordedCard key={r.id} r={r} />)}
      </div>
      <button type="button" className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border items-center justify-center shadow-md" aria-label="Next" style={{ borderColor: CARD_BORDER }}>
        <ChevronRight className="w-4 h-4" style={{ color: NAVY }} />
      </button>
    </div>

    <div className="text-center mt-3">
      <button type="button" className="inline-flex items-center gap-1 text-[12.5px] font-extrabold" style={{ color: ORANGE }}>
        View All Upcoming Classes <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  </section>
);

const RecordedCard: React.FC<{ r: RecordedLesson }> = ({ r }) => {
  const tile = SUBJECT_TILE[r.subjectKey];
  const Icon = tile.icon;
  const thumbBg: Record<SubjectKey, string> = {
    math:       'linear-gradient(135deg, #1F4030 0%, #152C22 100%)',
    english:    'linear-gradient(135deg, #5C2222 0%, #3F1414 100%)',
    biology:    'linear-gradient(135deg, #1F4030 0%, #152C22 100%)',
    chemistry:  'linear-gradient(135deg, #2A1A4D 0%, #1A0F33 100%)',
    ict:        'linear-gradient(135deg, #15294A 0%, #0B1A33 100%)',
    literature: 'linear-gradient(135deg, #5C2222 0%, #3F1414 100%)',
    physics:    'linear-gradient(135deg, #15294A 0%, #0B1A33 100%)',
  };
  return (
    <article className="rounded-xl bg-white border overflow-hidden hover:shadow-md transition-shadow" style={{ borderColor: CARD_BORDER }}>
      <div className="relative aspect-[16/10] overflow-hidden" style={{ backgroundImage: thumbBg[r.subjectKey] }}>
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.18),transparent_60%)]" />
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <span className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}>
            <Icon className="w-3.5 h-3.5 text-white" />
          </span>
          <span className="text-[10px] font-extrabold tracking-wider text-white">{r.subject}</span>
        </div>
        <div className="absolute inset-x-2 bottom-2">
          <p className="text-[12px] font-extrabold leading-tight text-white line-clamp-2" style={{ fontFamily: 'Fraunces, serif' }}>{r.title}</p>
        </div>
        <span className="absolute bottom-2 right-2 inline-flex items-center rounded-md bg-black/45 backdrop-blur-sm text-white text-[9.5px] font-extrabold px-1.5 py-0.5">
          {r.duration}
        </span>
      </div>
      <div className="px-3 pt-2 pb-2.5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-slate-200 shrink-0" />
          <p className="text-[10.5px] font-bold truncate" style={{ color: NAVY }}>{r.teacher}</p>
        </div>
        <div className="flex gap-1.5">
          <button type="button" className="flex-1 rounded-md text-[10.5px] font-extrabold border py-1.5 inline-flex items-center justify-center gap-1" style={{ color: NAVY, borderColor: CARD_BORDER }}>
            <Play className="w-3 h-3 fill-current" /> Watch Replay
          </button>
          <button type="button" className="flex-1 rounded-md text-[10.5px] font-extrabold border py-1.5 inline-flex items-center justify-center gap-1" style={{ color: NAVY, borderColor: CARD_BORDER }}>
            <DownloadIcon className="w-3 h-3" /> Notes
          </button>
        </div>
      </div>
    </article>
  );
};

/* ───────── RIGHT RAIL ───────── */
const YourNextClass: React.FC = () => (
  <section className="rounded-2xl bg-white border p-5" style={{ borderColor: CARD_BORDER }}>
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-[14.5px] font-extrabold" style={{ color: NAVY }}>Your Next Class</h3>
      <button type="button" className="text-[11.5px] font-extrabold" style={{ color: ORANGE }}>View All</button>
    </div>
    <p className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: '#7B7058' }}>Starts in</p>
    <div className="mt-2 flex items-center gap-3">
      <CountdownChunk value="00" label="HRS" />
      <span className="text-[24px] font-extrabold" style={{ color: NAVY }}>:</span>
      <CountdownChunk value="45" label="MINS" />
      <span className="text-[24px] font-extrabold" style={{ color: NAVY }}>:</span>
      <CountdownChunk value="30" label="SECS" />
    </div>

    <div className="mt-4 pt-4 border-t" style={{ borderColor: CARD_BORDER }}>
      <p className="text-[14px] font-extrabold" style={{ color: NAVY, fontFamily: 'Fraunces, serif' }}>Mathematics</p>
      <p className="text-[12px] font-semibold text-[#7B7058]">Quadratic Equations &amp; Graphs</p>
      <div className="mt-3 flex items-center gap-2">
        <img src="https://i.pravatar.cc/80?img=12" alt="Mr. Daniel Smith" className="w-6 h-6 rounded-full" />
        <p className="text-[12px] font-bold" style={{ color: NAVY }}>Mr. Daniel Smith</p>
      </div>
      <p className="mt-2 text-[11.5px] font-bold inline-flex items-center gap-1.5" style={{ color: NAVY }}>
        <Calendar className="w-3.5 h-3.5" style={{ color: ORANGE }} /> Today, May 21 • 09:00 AM
      </p>
    </div>

    <button type="button" className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-md text-white py-2.5 text-[12.5px] font-extrabold" style={{ backgroundColor: NAVY }}>
      <Video className="w-4 h-4" /> Join Class Now
    </button>
  </section>
);

const CountdownChunk: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="text-center">
    <p className="text-[28px] font-extrabold leading-none tracking-tight" style={{ color: NAVY }}>{value}</p>
    <p className="mt-0.5 text-[9px] font-bold tracking-[0.18em]" style={{ color: '#7B7058' }}>{label}</p>
  </div>
);

const WeeklySchedule: React.FC = () => (
  <section className="rounded-2xl bg-white border p-5" style={{ borderColor: CARD_BORDER }}>
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-[14.5px] font-extrabold" style={{ color: NAVY }}>Weekly Schedule</h3>
      <button type="button" className="text-[11.5px] font-extrabold" style={{ color: ORANGE }}>View Calendar</button>
    </div>
    <ul className="space-y-1.5">
      {WEEKLY_SCHEDULE.map((d) => {
        const today = d.state === 'today';
        return (
          <li
            key={d.day + d.date}
            className="flex items-center gap-3 px-2.5 py-2 rounded-lg"
            style={today ? { backgroundColor: '#FCEFD8' } : undefined}
          >
            <p className="text-[12.5px] font-extrabold w-[58px] shrink-0" style={{ color: today ? ORANGE : NAVY }}>{d.day}</p>
            <p className="text-[12px] font-bold flex-1" style={{ color: today ? ORANGE : '#7B7058' }}>{d.date}</p>
            <p className="text-[11.5px] font-extrabold" style={{ color: NAVY }}>{d.count}</p>
            {d.state === 'done' && (
              <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E5F6EC' }}>
                <Check className="w-3 h-3" style={{ color: '#1B7B49' }} />
              </span>
            )}
            {d.state === 'today' && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ORANGE }} />}
            {d.state === 'future' && <ChevronRight className="w-4 h-4" style={{ color: '#A89C82' }} />}
          </li>
        );
      })}
    </ul>
  </section>
);

const RecentlyUploaded: React.FC = () => (
  <section className="rounded-2xl bg-white border p-5" style={{ borderColor: CARD_BORDER }}>
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-[14.5px] font-extrabold" style={{ color: NAVY }}>Recently Uploaded</h3>
      <button type="button" className="text-[11.5px] font-extrabold" style={{ color: ORANGE }}>View All</button>
    </div>
    <ul className="space-y-3">
      {RECENTLY_UPLOADED.map((r) => {
        const tile = SUBJECT_TILE[r.subjectKey];
        const Icon = tile.icon;
        return (
          <li key={r.title} className="flex items-center gap-3">
            <span className="w-9 h-10 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: tile.bg }}>
              <Icon className="w-4 h-4" style={{ color: tile.ink }} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-extrabold leading-tight" style={{ color: NAVY }}>{r.subject}: {r.title}</p>
              <p className="mt-0.5 text-[10.5px] font-semibold text-[#7B7058]">{r.meta}</p>
            </div>
          </li>
        );
      })}
    </ul>
  </section>
);

const ContinueLearning: React.FC = () => (
  <section className="rounded-2xl bg-white border p-5" style={{ borderColor: CARD_BORDER }}>
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-[14.5px] font-extrabold" style={{ color: NAVY }}>Continue Learning</h3>
      <button type="button" className="text-[11.5px] font-extrabold" style={{ color: ORANGE }}>View All</button>
    </div>
    <div className="flex items-center gap-3">
      <span className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: SUBJECT_TILE.chemistry.bg }}>
        <Play className="w-4 h-4 fill-current" style={{ color: SUBJECT_TILE.chemistry.ink }} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: '#7B7058' }}>Chemistry</p>
        <p className="text-[12.5px] font-extrabold" style={{ color: NAVY }}>Chemical Reactions</p>
        <progress
          value={65}
          max={100}
          className="mt-1.5 block w-full h-1.5 rounded-full overflow-hidden appearance-none [&::-webkit-progress-bar]:bg-slate-100 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:bg-[#0B1F35] [&::-webkit-progress-value]:rounded-full [&::-moz-progress-bar]:bg-[#0B1F35]"
        />
        <p className="mt-1 text-[10.5px] font-extrabold" style={{ color: NAVY }}>65% Complete</p>
      </div>
    </div>
  </section>
);

const PremiumStrip: React.FC = () => (
  <section className="rounded-2xl border flex items-center gap-3 px-4 py-3" style={{ borderColor: CARD_BORDER, backgroundColor: '#FFF7ED' }}>
    <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${ORANGE}26` }}>
      <Crown className="w-4 h-4" style={{ color: ORANGE }} />
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-[12.5px] font-extrabold leading-tight" style={{ color: NAVY }}>Go Premium for Unlimited Access</p>
      <p className="text-[10.5px] font-semibold leading-tight text-[#7B7058]">Unlock all live classes, replays, notes and premium resources.</p>
    </div>
    <button type="button" className="rounded-md text-white text-[11px] font-extrabold px-3 py-1.5 shrink-0" style={{ backgroundColor: NAVY }}>
      Upgrade Now
    </button>
  </section>
);
