import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  // Top nav
  Search, Bell, ChevronDown, ChevronRight, ArrowLeft,
  // Sidebar
  Home, GraduationCap, NotebookPen, BookOpen, Video, Download, FolderClosed,
  StickyNote, Clock, BookMarked, Calendar, CalendarDays, LifeBuoy,
  School, Crown, Check, PlayCircle,
  // Lesson header
  Bookmark, Share2, MoreVertical,
  // Player chrome
  Play, Pause, SkipForward, SkipBack, Volume2, Maximize, Captions, Settings,
  // Tabs / body
  FileText, ListChecks, Folder, MessageSquare,
  Bold, Italic, Underline, List as ListIcon, Image as ImageIcon,
  // CTA + right rail
  ArrowUpRight, HelpCircle, AlertTriangle, CheckCircle2, Activity,
} from 'lucide-react';

/* ────── DESIGN TOKENS ────── */
const NAVY = '#0B1F3A';
const COPPER = '#C47A45';
const SOFT_BORDER = '#E6EAF2';
const MUTED = '#64748B';
const SUCCESS = '#12B76A';

/* ────── DATA ────── */
const SIDEBAR_NAV: { label: string; icon: React.ComponentType<{ className?: string }>; active?: boolean }[] = [
  { label: 'Home',             icon: Home },
  { label: 'Primary',          icon: GraduationCap },
  { label: 'Secondary',        icon: School },
  { label: 'Revision Notes',   icon: NotebookPen },
  { label: 'Textbooks',        icon: BookOpen },
  { label: 'Syllabus',         icon: BookOpen },
  { label: 'Live Sessions',    icon: Video },
  { label: 'Video Lessons',    icon: PlayCircle, active: true },
  { label: 'Downloads',        icon: Download },
  { label: 'Saved Resources',  icon: FolderClosed },
];

const SIDEBAR_LIBRARY = [
  { label: 'My Notes',        icon: StickyNote },
  { label: 'Recently Viewed', icon: Clock },
  { label: 'Bookmarks',       icon: BookMarked },
];

const SIDEBAR_QUICK = [
  { label: 'Study Planner',   icon: Calendar },
  { label: 'Exam Timetable',  icon: CalendarDays },
  { label: 'Help & Support',  icon: LifeBuoy },
];

interface RelatedLesson {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  thumb: 'equation' | 'factor' | 'parabola' | 'formula' | 'mistakes';
}
const RELATED: RelatedLesson[] = [
  { id: 'r1', title: 'Quadratic Equations: Introduction', subtitle: 'Core concept overview',  duration: '12 min', thumb: 'equation' },
  { id: 'r2', title: 'Solving by Factorisation',           subtitle: 'Worked example lesson', duration: '18 min', thumb: 'factor' },
  { id: 'r3', title: 'Completing the Square',              subtitle: 'Step-by-step method',   duration: '21 min', thumb: 'parabola' },
  { id: 'r4', title: 'Quadratic Formula',                  subtitle: 'Formula application',   duration: '16 min', thumb: 'formula' },
  { id: 'r5', title: 'Common Mistakes in Quadratics',      subtitle: 'Exam tips',             duration: '9 min',  thumb: 'mistakes' },
];

const TABS = [
  { key: 'overview',    label: 'Overview',     icon: FileText },
  { key: 'transcript',  label: 'Transcript',   icon: ListChecks },
  { key: 'notes',       label: 'Lesson Notes', icon: NotebookPen },
  { key: 'resources',   label: 'Resources',    icon: Folder },
  { key: 'discussion',  label: 'Discussion (24)', icon: MessageSquare },
] as const;

const OBJECTIVES = [
  'Understand the concept of factorisation in quadratics',
  'Identify factor pairs that multiply and add to given values',
  'Solve quadratic equations using factorisation',
  'Apply the method to different types of problems',
];

const LESSON_CHAPTERS = [
  { time: '01:35', title: 'Introduction',         state: 'completed' as const },
  { time: '05:30', title: 'Worked Example 1',     state: 'active'    as const },
  { time: '12:20', title: 'Factorisation Method', state: 'pending'   as const },
  { time: '18:05', title: 'Common Mistakes',      state: 'pending'   as const },
  { time: '21:10', title: 'Practice Task',        state: 'pending'   as const },
];

const QUICK_RESOURCES = [
  { name: 'Factorisation Notes',     ext: 'PDF', size: '4.2 MB', icon: FileText, tint: '#FDECEC', ink: '#EF4444' },
  { name: 'Worked Examples Worksheet', ext: '',   size: '1.8 MB', icon: FileText, tint: '#E5F6EC', ink: SUCCESS },
  { name: 'Quadratic Formula Sheet', ext: '',   size: '1.1 MB', icon: FileText, tint: '#E0EBFF', ink: '#2563EB' },
];

/* ────── PAGE ────── */
export const VideoLessonPlayerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]['key']>('transcript');
  const [note, setNote] = useState('');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FBFCFF' }}>
      <PlayerTopBar />

      <div className="mx-auto max-w-[1500px] px-5 py-5">
        <div className="grid lg:grid-cols-[230px,1fr,320px] gap-6">
          <PlayerSidebar />

          <main className="min-w-0 space-y-5">
            <Header />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-5">
              <VideoCard />
              <RelatedVideoLessonsPanel />
            </div>

            <TabBar activeTab={activeTab} onChange={setActiveTab} />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr,1fr,360px] gap-5">
              <LessonSummaryCard />
              <KeyObjectivesCard />
              <TakeNotesCard note={note} onChange={setNote} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <PracticeAfterWatchingCard />
              <RelatedQuestionsCard />
            </div>
          </main>

          <aside className="space-y-5 min-w-0">
            <LessonChaptersCard />
            <QuickResourcesCard />
            <ContinueLearningCard />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default VideoLessonPlayerPage;

/* ────── TOP BAR ────── */
const PlayerTopBar: React.FC = () => {
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

          <div className="relative flex-1 max-w-[460px]">
            <Search className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-[#A89C82] pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for books, notes, past papers, videos…"
              className="w-full bg-[#F8FAFC] border rounded-full py-2.5 pl-11 pr-14 text-[13.5px] outline-none placeholder:text-slate-400 focus:bg-white transition-all"
              style={{ borderColor: SOFT_BORDER, color: NAVY }}
            />
            <button type="button" className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: COPPER }} aria-label="Search">
              <Search className="w-4 h-4 text-white" />
            </button>
          </div>

          <nav className="hidden xl:flex items-center gap-7">
            {[
              { label: 'Library' },
              { label: 'Syllabus' },
              { label: 'Past Papers' },
              { label: 'Live Sessions' },
              { label: 'Video Lessons', active: true },
              { label: 'Collections' },
              { label: 'My Learning' },
            ].map((t) => (
              <span key={t.label} className="relative inline-flex items-center text-[13.5px] font-bold cursor-pointer" style={{ color: t.active ? COPPER : NAVY }}>
                {t.label}
                {t.active && <span className="absolute -bottom-2 left-0 right-0 h-[3px] rounded-full" style={{ backgroundColor: COPPER }} />}
              </span>
            ))}
          </nav>

          <div className="flex items-center gap-3 ml-auto shrink-0">
            <button type="button" className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-50" aria-label="Notifications">
              <Bell className="w-5 h-5" />
            </button>
            <button type="button" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-extrabold" style={{ backgroundColor: NAVY }}>M</div>
              <div className="hidden sm:block leading-tight text-left">
                <p className="text-[13px] font-extrabold" style={{ color: NAVY }}>My Account</p>
                <p className="text-[11px] font-bold" style={{ color: COPPER }}>Premium</p>
              </div>
              <ChevronDown className="w-4 h-4" style={{ color: MUTED }} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

/* ────── SIDEBAR ────── */
const PlayerSidebar: React.FC = () => (
  <aside className="hidden lg:block">
    <div className="sticky top-[88px] space-y-5 pb-6">
      <SidebarList items={SIDEBAR_NAV} />
      <SidebarLabeled label="My Library" items={SIDEBAR_LIBRARY} />
      <SidebarLabeled label="Quick Links" items={SIDEBAR_QUICK} />

      <div className="rounded-2xl p-5 text-white shadow-xl" style={{ background: `linear-gradient(160deg, ${NAVY} 0%, #163556 100%)` }}>
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4" style={{ color: COPPER }} />
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
        <button type="button" className="mt-4 w-full rounded-full text-white font-extrabold text-[12px] py-2.5" style={{ backgroundColor: COPPER }}>
          Go Premium
        </button>
      </div>
    </div>
  </aside>
);

const SidebarList: React.FC<{ items: { label: string; icon: React.ComponentType<{ className?: string }>; active?: boolean }[] }> = ({ items }) => (
  <nav className="space-y-1">
    {items.map(({ label, icon: Icon, active }) => (
      <button
        key={label}
        type="button"
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-colors ${active ? 'text-white' : 'text-[#0B1F35] hover:bg-slate-50'}`}
        style={active ? { backgroundColor: NAVY } : undefined}
      >
        <span className={`w-7 h-7 rounded-md flex items-center justify-center ${active ? 'bg-white/15' : 'bg-slate-100'}`}>
          <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-[#0B1F35]'}`} />
        </span>
        {label}
      </button>
    ))}
  </nav>
);

const SidebarLabeled: React.FC<{
  label: string;
  items: { label: string; icon: React.ComponentType<{ className?: string }> }[];
}> = ({ label, items }) => (
  <div>
    <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: COPPER }}>{label}</p>
    <SidebarList items={items} />
  </div>
);

/* ────── HEADER ────── */
const Header: React.FC = () => (
  <section>
    <Link to="/" className="inline-flex items-center gap-1 text-[12.5px] font-bold mb-2" style={{ color: MUTED }}>
      <ArrowLeft className="w-3.5 h-3.5" /> Back to Video Lessons
    </Link>
    <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-[30px] lg:text-[34px] tracking-tight" style={{ color: NAVY, fontFamily: 'Fraunces, serif', fontWeight: 600 }}>
          Quadratic Equations: Solving by Factorisation
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {[
            { label: 'Mathematics', tint: '#FCEFD8', ink: COPPER },
            { label: 'Secondary',   tint: '#E0EBFF', ink: '#2563EB' },
            { label: 'Year 10',     tint: '#EEEAFE', ink: '#7C3AED' },
          ].map((c) => (
            <span key={c.label} className="rounded-md px-2 py-0.5 text-[11px] font-extrabold tracking-wide" style={{ backgroundColor: c.tint, color: c.ink }}>{c.label}</span>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <img src="https://i.pravatar.cc/64?img=12" alt="Mr. Daniel Smith" className="w-7 h-7 rounded-full object-cover" />
          <p className="text-[12.5px] font-extrabold" style={{ color: NAVY }}>Mr. Daniel Smith</p>
          <span className="inline-flex items-center gap-1 text-[12px] font-bold" style={{ color: MUTED }}>
            <Clock className="w-3.5 h-3.5" /> 24 min
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E5F6EC] px-2.5 py-0.5 text-[10.5px] font-extrabold" style={{ color: SUCCESS }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: SUCCESS }} />
            Lesson in progress
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button type="button" className="inline-flex items-center gap-1.5 rounded-md bg-white border px-3 py-2 text-[12px] font-extrabold" style={{ color: NAVY, borderColor: SOFT_BORDER }}>
          <Bookmark className="w-3.5 h-3.5" /> Save
        </button>
        <button type="button" className="inline-flex items-center gap-1.5 rounded-md bg-white border px-3 py-2 text-[12px] font-extrabold" style={{ color: NAVY, borderColor: SOFT_BORDER }}>
          <Share2 className="w-3.5 h-3.5" /> Share
        </button>
        <button type="button" className="w-9 h-9 rounded-md bg-white border flex items-center justify-center" style={{ borderColor: SOFT_BORDER }} aria-label="More">
          <MoreVertical className="w-4 h-4" style={{ color: NAVY }} />
        </button>
      </div>
    </div>
  </section>
);

/* ────── VIDEO PLAYER ────── */
const VideoCard: React.FC = () => (
  <div className="relative rounded-2xl overflow-hidden shadow-[0_2px_4px_rgba(15,23,42,0.05),0_18px_44px_-18px_rgba(15,23,42,0.20)]" style={{ minHeight: 420 }}>
    {/* Video frame: classroom + teacher placeholder + board content */}
    <div className="relative w-full aspect-video bg-[#0B1F3A] overflow-hidden">
      <ClassroomScene />
      {/* Transcript pill */}
      <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/65 backdrop-blur-sm px-3 py-1 text-[11px] font-extrabold text-white">
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COPPER }} />
        Transcript on
      </span>

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-0">
        <div className="px-4 pb-3 pt-6 bg-gradient-to-t from-black/70 to-transparent">
          <div className="flex items-center gap-3 text-white">
            <button type="button" aria-label="Pause" className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center">
              <Pause className="w-4 h-4 fill-white" />
            </button>
            <button type="button" aria-label="Rewind" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
              <SkipBack className="w-4 h-4" />
            </button>
            <button type="button" aria-label="Skip" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
              <SkipForward className="w-4 h-4" />
            </button>
            <button type="button" aria-label="Volume" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
              <Volume2 className="w-4 h-4" />
            </button>
            <p className="text-[11.5px] font-extrabold tracking-wider">01:48 / 24:00</p>
            <div className="ml-auto flex items-center gap-2">
              <button type="button" aria-label="CC" className="px-2.5 h-8 rounded-md bg-white/15 hover:bg-white/25 flex items-center justify-center">
                <Captions className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 h-8 rounded-md bg-white/15 flex items-center text-[11.5px] font-extrabold">1.25x</span>
              <button type="button" aria-label="Settings" className="w-8 h-8 rounded-md bg-white/15 hover:bg-white/25 flex items-center justify-center">
                <Settings className="w-3.5 h-3.5" />
              </button>
              <button type="button" aria-label="Fullscreen" className="w-8 h-8 rounded-md bg-white/15 hover:bg-white/25 flex items-center justify-center">
                <Maximize className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-1 rounded-full bg-white/15 relative">
            <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: '7.5%', background: COPPER }} />
            <span className="absolute -top-1 w-3 h-3 rounded-full bg-white" style={{ left: '7%' }} />
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* Classroom scene SVG — teacher silhouette + lesson board with quadratic example. */
const ClassroomScene: React.FC = () => (
  <svg viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full" aria-hidden>
    <defs>
      <linearGradient id="vlBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1B2840" />
        <stop offset="100%" stopColor="#0B1428" />
      </linearGradient>
      <linearGradient id="vlBoard" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FBF8EE" />
        <stop offset="100%" stopColor="#F0E7CF" />
      </linearGradient>
      <radialGradient id="vlFloor" cx="50%" cy="100%" r="80%">
        <stop offset="0%" stopColor="#33415A" />
        <stop offset="100%" stopColor="#0B1428" />
      </radialGradient>
    </defs>
    <rect width="1280" height="720" fill="url(#vlBg)" />
    {/* shelves on left */}
    <rect x="60" y="100" width="220" height="260" rx="6" fill="#2A3954" opacity="0.65" />
    <line x1="60" y1="180" x2="280" y2="180" stroke="#566378" strokeWidth="1.4" />
    <line x1="60" y1="240" x2="280" y2="240" stroke="#566378" strokeWidth="1.4" />
    <line x1="60" y1="300" x2="280" y2="300" stroke="#566378" strokeWidth="1.4" />
    {/* books */}
    {[
      [80, 130, 14, 50, '#C47A45'], [98, 124, 14, 56, '#7C3AED'], [116, 132, 14, 48, '#12B76A'], [134, 128, 14, 52, '#F97316'],
      [80, 192, 14, 48, '#2563EB'], [98, 188, 14, 52, '#EF4444'], [116, 196, 14, 44, '#C47A45'], [134, 190, 14, 50, '#7C3AED'],
    ].map(([x, y, w, h, c], i) => (
      <rect key={i} x={x as number} y={y as number} width={w as number} height={h as number} rx="2" fill={c as string} opacity="0.85" />
    ))}
    {/* potted plant */}
    <ellipse cx="200" cy="430" rx="40" ry="14" fill="#0B1428" opacity="0.5" />
    <rect x="170" y="395" width="60" height="40" rx="6" fill="#3A4A6B" />
    <path d="M180 400 Q200 360 220 400 Q210 380 200 380 Q190 380 180 400 Z" fill="#3F8C58" />
    <path d="M186 396 Q200 350 214 396" fill="#56AF6F" />

    {/* Lesson board (right portion) */}
    <rect x="640" y="120" width="540" height="340" rx="10" fill="url(#vlBoard)" stroke="#A89C82" strokeWidth="2" />
    <rect x="640" y="120" width="540" height="34" fill="#0B1F3A" rx="10" />
    <text x="670" y="142" fontSize="18" fontWeight="800" fill="white">Example 1</text>
    <text x="670" y="190" fontSize="22" fill="#1F2A3F" fontFamily="Fraunces, serif">Solve by factorisation:</text>
    <text x="670" y="240" fontSize="36" fill="#0B1F3A" fontFamily="Fraunces, serif" fontStyle="italic" fontWeight="700">2x² − 5x − 3 = 0</text>
    <g fill="#1F2A3F" fontFamily="Fraunces, serif" fontSize="20">
      <text x="670" y="290">1.</text>
      <text x="700" y="290">Find two numbers that multiply to <tspan fontStyle="italic">2 × (−3) = −6</tspan></text>
      <text x="700" y="318">and add to −5.</text>
      <text x="670" y="350">2.</text>
      <text x="700" y="350">The numbers are −6 and 1.</text>
      <text x="670" y="382">3.</text>
      <text x="700" y="382">Rewrite the middle term:</text>
      <text x="800" y="412" fontStyle="italic" fontWeight="700" fill="#0B1F3A">2x² − 6x + x − 3 = 0</text>
      <text x="670" y="444">4.</text>
      <text x="700" y="444">Factor by grouping:</text>
    </g>

    {/* Teacher silhouette */}
    <g transform="translate(360, 280)">
      <ellipse cx="80" cy="380" rx="120" ry="14" fill="#0B1428" opacity="0.6" />
      {/* Body */}
      <path d="M40 220 Q80 180 120 220 L160 360 Q160 380 140 380 L20 380 Q0 380 0 360 Z" fill="#0F2440" />
      {/* Shirt collar accent */}
      <path d="M70 220 L80 240 L90 220 Z" fill="white" />
      {/* Head */}
      <ellipse cx="80" cy="160" rx="42" ry="50" fill="#9A6B47" />
      <path d="M44 130 Q80 90 116 130 Q116 158 80 158 Q44 158 44 130 Z" fill="#1F1B19" />
      {/* Glasses */}
      <circle cx="64" cy="172" r="9" fill="none" stroke="#0B1F3A" strokeWidth="2.5" />
      <circle cx="96" cy="172" r="9" fill="none" stroke="#0B1F3A" strokeWidth="2.5" />
      <line x1="73" y1="172" x2="87" y2="172" stroke="#0B1F3A" strokeWidth="2" />
      {/* Smile */}
      <path d="M68 198 Q80 208 92 198" stroke="#1F1B19" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Arms */}
      <path d="M0 230 Q-30 280 -10 320" stroke="#0F2440" strokeWidth="22" strokeLinecap="round" fill="none" />
      <path d="M160 230 Q190 280 170 330" stroke="#0F2440" strokeWidth="22" strokeLinecap="round" fill="none" />
    </g>

    {/* Floor */}
    <rect x="0" y="600" width="1280" height="120" fill="url(#vlFloor)" />
  </svg>
);

/* ────── RELATED VIDEO LESSONS ────── */
const RelatedVideoLessonsPanel: React.FC = () => (
  <section className="rounded-2xl bg-white border p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.06)] flex flex-col" style={{ borderColor: SOFT_BORDER }}>
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-[15px] font-extrabold" style={{ color: NAVY }}>Related Video Lessons</h3>
      <button type="button" className="w-7 h-7 rounded-md hover:bg-slate-50 flex items-center justify-center" aria-label="More">
        <MoreVertical className="w-4 h-4" style={{ color: MUTED }} />
      </button>
    </div>
    <ul className="flex-1 divide-y" style={{ borderColor: SOFT_BORDER }}>
      {RELATED.map((r) => <RelatedRow key={r.id} r={r} />)}
    </ul>
  </section>
);

const RelatedRow: React.FC<{ r: RelatedLesson }> = ({ r }) => (
  <li>
    <button type="button" className="w-full flex items-center gap-3 px-1 py-2.5 hover:bg-slate-50 rounded-md text-left">
      <RelatedThumb kind={r.thumb} />
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-extrabold leading-tight" style={{ color: NAVY }}>{r.title}</p>
        <p className="text-[10.5px] font-semibold" style={{ color: MUTED }}>{r.subtitle}</p>
      </div>
      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold shrink-0" style={{ color: NAVY }}>{r.duration}</span>
    </button>
  </li>
);

const RelatedThumb: React.FC<{ kind: RelatedLesson['thumb'] }> = ({ kind }) => {
  const wrapper = 'relative w-[68px] h-[44px] rounded-md overflow-hidden shrink-0';
  if (kind === 'equation') {
    return (
      <div className={wrapper} style={{ background: 'linear-gradient(135deg,#1F4030,#0F2519)' }}>
        <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-extrabold" style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>ax²+bx+c=0</span>
        <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-white/85 flex items-center justify-center"><Play className="w-2.5 h-2.5 fill-[#0B1F3A]" /></span>
      </div>
    );
  }
  if (kind === 'factor') {
    return (
      <div className={wrapper} style={{ background: 'linear-gradient(135deg,#1B3157,#10213C)' }}>
        <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-extrabold" style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>(x+2)(x-3)=0</span>
        <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-white/85 flex items-center justify-center"><Play className="w-2.5 h-2.5 fill-[#0B1F3A]" /></span>
      </div>
    );
  }
  if (kind === 'parabola') {
    return (
      <div className={wrapper} style={{ background: '#FBF7EF' }}>
        <svg viewBox="0 0 68 44" className="absolute inset-0 w-full h-full" aria-hidden>
          <path d="M2 38 H66" stroke="#0B1F3A" strokeWidth="0.8" />
          <path d="M34 4 L34 42" stroke="#0B1F3A" strokeWidth="0.8" />
          <path d="M8 6 Q34 60, 60 6" fill="none" stroke="#2563EB" strokeWidth="1.6" />
          <circle cx="20" cy="34" r="1.5" fill="#C47A45" />
          <circle cx="48" cy="34" r="1.5" fill="#C47A45" />
        </svg>
        <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#0B1F3A] flex items-center justify-center"><Play className="w-2.5 h-2.5 fill-white" /></span>
      </div>
    );
  }
  if (kind === 'formula') {
    return (
      <div className={wrapper} style={{ background: 'linear-gradient(135deg,#10243F,#091830)' }}>
        <span className="absolute inset-0 flex flex-col items-center justify-center text-white" style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>
          <span className="text-[9px] font-extrabold">x = −b ± √b²−4ac</span>
          <span className="text-[9px] font-extrabold">2a</span>
        </span>
        <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-white/85 flex items-center justify-center"><Play className="w-2.5 h-2.5 fill-[#0B1F3A]" /></span>
      </div>
    );
  }
  return (
    <div className={wrapper} style={{ background: 'linear-gradient(135deg,#FCEFD8,#F5DAB1)' }}>
      <span className="absolute inset-0 flex items-center justify-center"><AlertTriangle className="w-5 h-5" style={{ color: '#7C4A1E' }} /></span>
      <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#0B1F3A] flex items-center justify-center"><Play className="w-2.5 h-2.5 fill-white" /></span>
    </div>
  );
};

/* ────── TAB BAR ────── */
const TabBar: React.FC<{ activeTab: typeof TABS[number]['key']; onChange: (t: typeof TABS[number]['key']) => void }> = ({ activeTab, onChange }) => (
  <div className="flex items-center gap-6 border-b" style={{ borderColor: SOFT_BORDER }}>
    {TABS.map((t) => {
      const Icon = t.icon;
      const active = activeTab === t.key;
      return (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className="relative inline-flex items-center gap-1.5 pb-3 pt-2 text-[12.5px] font-extrabold transition-colors"
          style={{ color: active ? COPPER : MUTED }}
        >
          <Icon className="w-3.5 h-3.5" /> {t.label}
          {active && <span className="absolute -bottom-px left-0 right-0 h-[2.5px] rounded-full" style={{ backgroundColor: COPPER }} />}
        </button>
      );
    })}
  </div>
);

/* ────── LESSON SUMMARY ────── */
const LessonSummaryCard: React.FC = () => (
  <section className="rounded-2xl bg-white border p-5" style={{ borderColor: SOFT_BORDER }}>
    <h3 className="text-[15px] font-extrabold mb-2" style={{ color: NAVY }}>Lesson Summary</h3>
    <p className="text-[13px] leading-relaxed" style={{ color: '#3D4E66' }}>
      In this lesson, we learn how to solve quadratic equations by factorisation. We apply the factorisation method step by step with clear examples and practice problems.
    </p>
    <div className="mt-4 grid grid-cols-3 gap-2">
      {[
        { label: 'Level',    value: 'Intermediate', icon: Activity },
        { label: 'Duration', value: '24 min',       icon: Clock },
        { label: 'Language', value: 'English',      icon: BookOpen },
      ].map(({ label, value, icon: Icon }) => (
        <div key={label} className="rounded-xl bg-[#F8FAFC] px-3 py-2 flex items-center gap-2">
          <Icon className="w-3.5 h-3.5" style={{ color: COPPER }} />
          <div className="leading-tight">
            <p className="text-[10px] font-bold" style={{ color: MUTED }}>{label}</p>
            <p className="text-[12px] font-extrabold" style={{ color: NAVY }}>{value}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

/* ────── KEY OBJECTIVES ────── */
const KeyObjectivesCard: React.FC = () => (
  <section className="rounded-2xl bg-white border p-5" style={{ borderColor: SOFT_BORDER }}>
    <h3 className="text-[15px] font-extrabold mb-3" style={{ color: NAVY }}>Key Learning Objectives</h3>
    <ul className="space-y-2.5">
      {OBJECTIVES.map((o) => (
        <li key={o} className="flex items-start gap-2 text-[13px]" style={{ color: '#3D4E66' }}>
          <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: COPPER }} />
          <span>{o}</span>
        </li>
      ))}
    </ul>
  </section>
);

/* ────── TAKE NOTES ────── */
const TakeNotesCard: React.FC<{ note: string; onChange: (v: string) => void }> = ({ note, onChange }) => (
  <section className="rounded-2xl bg-white border p-5" style={{ borderColor: SOFT_BORDER }}>
    <h3 className="text-[15px] font-extrabold mb-3" style={{ color: NAVY }}>Take Notes</h3>
    <textarea
      value={note}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Write your notes here…"
      rows={3}
      className="w-full rounded-xl border bg-[#F8FAFC] px-3 py-2.5 text-[13px] outline-none focus:bg-white focus:border-[#C47A45]"
      style={{ borderColor: SOFT_BORDER, color: NAVY }}
    />
    <div className="mt-2 flex items-center gap-2 text-[#0B1F3A]">
      {[Bold, Italic, Underline, ListIcon, ImageIcon].map((Icon, i) => (
        <button key={i} type="button" className="w-7 h-7 rounded-md hover:bg-slate-50 flex items-center justify-center" aria-label="format">
          <Icon className="w-3.5 h-3.5" />
        </button>
      ))}
    </div>
    <button type="button" className="mt-3 w-full rounded-md text-white text-[12.5px] font-extrabold py-2.5" style={{ backgroundColor: COPPER }}>
      Save Note
    </button>
  </section>
);

/* ────── BOTTOM CTA CARDS ────── */
const PracticeAfterWatchingCard: React.FC = () => (
  <section className="rounded-2xl bg-white border p-5 flex items-center gap-4" style={{ borderColor: SOFT_BORDER }}>
    <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#FCEFD8' }}>
      <NotebookPen className="w-5 h-5" style={{ color: COPPER }} />
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-[14px] font-extrabold" style={{ color: NAVY }}>Practice After Watching</p>
      <p className="text-[12px]" style={{ color: MUTED }}>Strengthen your skills with practice questions based on this lesson.</p>
    </div>
    <button type="button" className="inline-flex items-center gap-1.5 rounded-md bg-white border-2 px-4 py-2 text-[12px] font-extrabold shrink-0" style={{ color: COPPER, borderColor: COPPER }}>
      <FileText className="w-3.5 h-3.5" /> Start Practice (10 Questions) <ArrowUpRight className="w-3.5 h-3.5" />
    </button>
  </section>
);

const RelatedQuestionsCard: React.FC = () => (
  <section className="rounded-2xl bg-white border p-5 flex items-center gap-4" style={{ borderColor: SOFT_BORDER }}>
    <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#FCEFD8' }}>
      <HelpCircle className="w-5 h-5" style={{ color: COPPER }} />
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-[14px] font-extrabold" style={{ color: NAVY }}>Related Questions</p>
      <p className="text-[12px]" style={{ color: MUTED }}>Handpicked questions recommended for you.</p>
    </div>
    <button type="button" className="inline-flex items-center gap-1.5 rounded-md bg-white border-2 px-4 py-2 text-[12px] font-extrabold shrink-0" style={{ color: COPPER, borderColor: COPPER }}>
      View Questions <ArrowUpRight className="w-3.5 h-3.5" />
    </button>
  </section>
);

/* ────── RIGHT RAIL — LESSON CHAPTERS ────── */
const LessonChaptersCard: React.FC = () => (
  <section className="rounded-2xl bg-white border p-5" style={{ borderColor: SOFT_BORDER }}>
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-[15px] font-extrabold" style={{ color: NAVY }}>Lesson Chapters</h3>
      <Clock className="w-4 h-4" style={{ color: MUTED }} />
    </div>
    <ul className="space-y-2.5 relative">
      <span aria-hidden className="absolute left-[8px] top-2 bottom-2 w-px" style={{ backgroundColor: SOFT_BORDER }} />
      {LESSON_CHAPTERS.map((c) => (
        <li key={c.title} className="relative pl-7 flex items-center justify-between">
          {c.state === 'completed' ? (
            <span className="absolute left-0 top-1.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: SUCCESS }}>
              <Check className="w-2.5 h-2.5 text-white" />
            </span>
          ) : c.state === 'active' ? (
            <span className="absolute left-0 top-1.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: COPPER }}>
              <Play className="w-2 h-2 fill-white" />
            </span>
          ) : (
            <span className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-white border-2" style={{ borderColor: SOFT_BORDER }} />
          )}
          <p className="text-[12px] font-extrabold" style={{ color: c.state === 'active' ? COPPER : MUTED }}>{c.time}</p>
          <p className="text-[12.5px] font-extrabold flex-1 ml-3" style={{ color: c.state === 'active' ? COPPER : NAVY }}>{c.title}</p>
          {c.state === 'completed' && <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: SUCCESS }} />}
        </li>
      ))}
    </ul>
    <button type="button" className="mt-4 w-full rounded-md border bg-white py-2.5 text-[12px] font-extrabold" style={{ color: NAVY, borderColor: SOFT_BORDER }}>
      View All Chapters
    </button>
  </section>
);

/* ────── QUICK RESOURCES ────── */
const QuickResourcesCard: React.FC = () => (
  <section className="rounded-2xl bg-white border p-5" style={{ borderColor: SOFT_BORDER }}>
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-[15px] font-extrabold" style={{ color: NAVY }}>Quick Resources</h3>
      <Download className="w-4 h-4" style={{ color: MUTED }} />
    </div>
    <ul className="space-y-3">
      {QUICK_RESOURCES.map((r) => {
        const Icon = r.icon;
        return (
          <li key={r.name} className="flex items-center gap-3">
            <span className="w-9 h-10 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: r.tint }}>
              <Icon className="w-4 h-4" style={{ color: r.ink }} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-extrabold leading-tight" style={{ color: NAVY }}>
                {r.name} {r.ext && <span style={{ color: MUTED }}>({r.ext})</span>}
              </p>
              <p className="text-[10.5px] font-semibold" style={{ color: MUTED }}>{r.size}</p>
            </div>
          </li>
        );
      })}
    </ul>
    <button type="button" className="mt-4 w-full rounded-md border bg-white py-2.5 text-[12px] font-extrabold" style={{ color: NAVY, borderColor: SOFT_BORDER }}>
      Download All
    </button>
  </section>
);

/* ────── CONTINUE LEARNING ────── */
const ContinueLearningCard: React.FC = () => (
  <section className="rounded-2xl bg-white border p-5" style={{ borderColor: SOFT_BORDER }}>
    <h3 className="text-[15px] font-extrabold mb-3" style={{ color: NAVY }}>Continue Learning</h3>
    <p className="text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: MUTED }}>Next Lesson</p>
    <div className="mt-2 flex items-center gap-3">
      <div className="relative w-[78px] h-[52px] rounded-md overflow-hidden shrink-0" style={{ background: 'linear-gradient(135deg,#1B3157,#10213C)' }}>
        <span className="absolute inset-0 flex flex-col items-center justify-center text-white" style={{ fontFamily: 'Fraunces, serif' }}>
          <span className="text-[9px] font-extrabold">Quadratic</span>
          <span className="text-[9px] font-extrabold">Equations</span>
        </span>
        <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-white/85 flex items-center justify-center"><Play className="w-2.5 h-2.5 fill-[#0B1F3A]" /></span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-extrabold leading-tight" style={{ color: NAVY }}>Quadratic Equations: Solving by Formula</p>
        <p className="mt-1 text-[10.5px] font-bold inline-flex items-center gap-1" style={{ color: MUTED }}><Clock className="w-3 h-3" /> 24 min</p>
      </div>
    </div>
    <button type="button" className="mt-4 w-full rounded-md border-2 bg-white py-2.5 text-[12px] font-extrabold inline-flex items-center justify-center gap-1.5" style={{ color: NAVY, borderColor: NAVY }}>
      Go to Next Lesson <ChevronRight className="w-3.5 h-3.5" />
    </button>
  </section>
);

