import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  // Top nav
  Search, Bell, ChevronDown, ChevronRight, ArrowLeft,
  // Sidebar
  Home, GraduationCap, NotebookPen, BookOpen, Video, Download, FolderClosed,
  StickyNote, Clock, BookMarked, Calendar, CalendarDays, LifeBuoy,
  School, Crown, Check, FolderKanban, PlayCircle,
  // KPI
  CalendarRange, Users, Star, Flag,
  // Body
  CheckCircle2, FlaskConical, FileText, UploadCloud, X,
  Trash2, MessageSquare, FileCheck2, Sun, Recycle, Sprout, Leaf,
  Droplets, Building2, ScrollText,
  // Right rail
  Sparkles, MapPin, BookOpenCheck, ShieldCheck, Headphones, FileText as FilePdf,
} from 'lucide-react';

/* ────── DESIGN TOKENS ────── */
const NAVY = '#0B1F3A';
const COPPER = '#C47A45';
const SOFT_BORDER = '#E6EAF2';
const MUTED = '#64748B';
const SUCCESS = '#12B76A';
const BLUE = '#2563EB';
const PURPLE = '#7C3AED';

/* ────── DATA ────── */
const SIDEBAR_NAV: { label: string; icon: React.ComponentType<{ className?: string }>; active?: boolean }[] = [
  { label: 'Home',             icon: Home },
  { label: 'Primary',          icon: GraduationCap },
  { label: 'Secondary',        icon: School },
  { label: 'Revision Notes',   icon: NotebookPen },
  { label: 'Textbooks',        icon: BookOpen },
  { label: 'Syllabus',         icon: BookOpen },
  { label: 'Live Sessions',    icon: Video },
  { label: 'Video Lessons',    icon: PlayCircle },
  { label: 'Projects',         icon: FolderKanban, active: true },
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

const KPI_CARDS = [
  { label: 'Due Date',     value: 'May 28',     sub: '10 days left',  icon: CalendarRange, tint: '#FFF6E0', ink: '#F59E0B' },
  { label: 'Progress',     value: '72%',        sub: 'On Track',       icon: CheckCircle2,  tint: '#E5F6EC', ink: SUCCESS, subInk: SUCCESS },
  { label: 'Team Members', value: '4',          sub: 'Collaborating',  icon: Users,         tint: '#EEEAFE', ink: PURPLE },
  { label: 'Total Marks',  value: '40',         sub: 'Graded',         icon: Star,          tint: '#FFF6E0', ink: '#F59E0B' },
  { label: 'Status',       value: 'In Progress', sub: 'Active',         icon: Flag,          tint: '#E0EBFF', ink: BLUE, subInk: SUCCESS },
];

const DELIVERABLES = ['Research Notes', 'Prototype Sketch', 'Materials List', 'Final Report', 'Reflection'];

interface Milestone {
  title: string;
  meta: string;
  state: 'completed' | 'in_progress' | 'upcoming';
  pct: number;
}
const MILESTONES: Milestone[] = [
  { title: 'Research Completed', meta: 'Completed on May 5',          state: 'completed',   pct: 100 },
  { title: 'Prototype Design',   meta: 'Completed on May 12',         state: 'completed',   pct: 100 },
  { title: 'Testing & Results',  meta: 'In progress · Due May 24',    state: 'in_progress', pct: 60 },
  { title: 'Final Submission',   meta: 'Due May 28',                  state: 'upcoming',    pct: 0 },
];

const ATTACHED_FILES = [
  { name: 'water-filter-sketch.jpg',     size: '1.2 MB', icon: FileText, tint: '#FFE4E6', ink: '#EF4444' },
  { name: 'test-results.pdf',            size: '2.4 MB', icon: FilePdf,  tint: '#FDECEC', ink: '#EF4444' },
  { name: 'presentation-outline.docx',   size: '1.1 MB', icon: FileText, tint: '#E0EBFF', ink: BLUE },
];

const FEEDBACK = [
  { name: 'Dr. Amina Yusuf',  role: 'Science Teacher',  roleTint: '#E5F6EC', roleInk: SUCCESS, body: 'Great progress team! Your prototype design is clear and practical. Make sure to include photos of your testing process and record all data in a table for your final report.', meta: 'May 16, 2025 • 10:28 AM', img: 47 },
  { name: 'Mr. David Okello', role: 'Project Mentor',    roleTint: '#FCEFD8', roleInk: COPPER,  body: 'Excellent teamwork and initiative! Consider testing the flow rate of filtered water as well. Include error analysis in your conclusions.',                                  meta: 'May 15, 2025 • 4:18 PM',  img: 12 },
];

interface CompletedProject {
  title: string;
  subject: string;
  marks: string;
  date: string;
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
  ink: string;
}
const COMPLETED: CompletedProject[] = [
  { title: 'Solar Cooker Prototype',       subject: 'Science',          marks: '36 / 40', date: 'Apr 18', icon: Sun,     tint: '#FFF6E0', ink: '#F59E0B' },
  { title: 'Community Waste Audit',        subject: 'Geography',        marks: '32 / 40', date: 'Mar 30', icon: Recycle, tint: '#E5F6EC', ink: SUCCESS },
  { title: 'School Garden Irrigation Plan', subject: 'Agriculture',      marks: '38 / 40', date: 'Feb 22', icon: Sprout,  tint: '#E5F6EC', ink: SUCCESS },
  { title: 'Plastic Recycling Campaign',   subject: 'Entrepreneurship', marks: '35 / 40', date: 'Jan 28', icon: Recycle, tint: '#FCEFD8', ink: COPPER },
];

interface UpcomingProject {
  title: string;
  subject: string;
  starts: string;
  due: string;
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
  ink: string;
}
const UPCOMING: UpcomingProject[] = [
  { title: 'Rainwater Harvesting Model',  subject: 'Science',   starts: 'Starts Jun 2',  due: 'Due Jun 18', icon: Droplets,    tint: '#E0EBFF', ink: BLUE },
  { title: 'Local Market Survey Report',  subject: 'Economics', starts: 'Starts Jun 5',  due: 'Due Jun 20', icon: Building2,   tint: '#FCEFD8', ink: COPPER },
  { title: 'Wetland Conservation Poster', subject: 'Geography', starts: 'Starts Jun 8',  due: 'Due Jun 24', icon: Leaf,        tint: '#E5F6EC', ink: SUCCESS },
  { title: 'Nutrition Awareness Project', subject: 'Biology',   starts: 'Starts Jun 10', due: 'Due Jun 28', icon: BookOpenCheck, tint: '#E5F6EC', ink: SUCCESS },
];

const TEAM = [
  { name: 'Zainab Mohammed', role: 'Team Lead',     img: 47 },
  { name: 'Ken Mensah',      role: 'Research Lead', img: 12 },
  { name: 'Aisha Ibrahim',   role: 'Designer',      img: 49 },
  { name: 'Tendai Moyo',     role: 'Tester',        img: 33 },
];

const RUBRIC = [
  { label: 'Creativity & Innovation',    score: 8, max: 10 },
  { label: 'Scientific Accuracy',        score: 9, max: 10 },
  { label: 'Presentation Quality',       score: 6, max: 10 },
  { label: 'Teamwork & Collaboration',   score: 6, max: 10 },
];

const DEADLINES = [
  { dateMonth: 'MAY', day: 24, title: 'Testing & Results Report', sub: 'Submit test data and analysis',  daysLeft: '6 days' },
  { dateMonth: 'MAY', day: 26, title: 'Final Report Draft',       sub: 'Upload draft for review',         daysLeft: '8 days' },
  { dateMonth: 'MAY', day: 28, title: 'Final Submission',         sub: 'Submit complete project',         daysLeft: '10 days' },
];

const QUICK_RESOURCES = [
  { title: 'Study Guide: Water Purification Basics', icon: BookOpen,    tint: '#E0EBFF', ink: BLUE },
  { title: 'Sample Project Report',                  icon: FilePdf,     tint: '#EEEAFE', ink: PURPLE },
  { title: 'Water Safety Checklist',                 icon: ShieldCheck, tint: '#E5F6EC', ink: SUCCESS },
  { title: 'Watch: Filtration Methods Explained (Video)', icon: PlayCircle, tint: '#FCEFD8', ink: COPPER },
];

/* ────── PAGE ────── */
export const ProjectsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'submission' | 'rubric' | 'discussion'>('overview');
  const [notes, setNotes] = useState('We tested three filtration layers (sand, charcoal, and gravel). The water clarity improved significantly. Next step: measure turbidity and pH levels more accurately.');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FBFCFF' }}>
      <ProjectsTopBar />

      <div className="mx-auto max-w-[1500px] px-5 py-5">
        <div className="grid lg:grid-cols-[230px,1fr,320px] gap-6">
          <ProjectsSidebar />

          <main className="min-w-0 space-y-5">
            <Header />

            <KpiRow />

            <ProjectBriefCard />

            <MilestonesCard />

            <SubmissionWorkspaceCard
              activeTab={activeTab}
              onTabChange={setActiveTab}
              notes={notes}
              onNotesChange={setNotes}
              fileInputRef={fileInputRef}
            />

            <FeedbackCard />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <CompletedProjectsCard />
              <UpcomingProjectsCard />
            </div>
          </main>

          <aside className="space-y-5 min-w-0">
            <ProjectProgressCard />
            <TeamMembersCard />
            <RubricSummaryCard />
            <DeadlinesCard />
            <QuickResourcesCard />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;

/* ────── TOP BAR ────── */
const ProjectsTopBar: React.FC = () => {
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

          <div className="relative flex-1 max-w-[440px]">
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
            {['Library', 'Syllabus', 'Live Sessions', 'Video Lessons', 'Collections', 'My Learning'].map((label) => (
              <span key={label} className="text-[13.5px] font-bold cursor-pointer" style={{ color: NAVY }}>{label}</span>
            ))}
          </nav>

          <div className="flex items-center gap-3 ml-auto shrink-0">
            <button type="button" className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-50" aria-label="Notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center">8</span>
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
const ProjectsSidebar: React.FC = () => (
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
    <Link to="/projects" className="inline-flex items-center gap-1 text-[12.5px] font-bold mb-2" style={{ color: MUTED }}>
      <ArrowLeft className="w-3.5 h-3.5" /> Back to Projects
    </Link>
    <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-3">
      <div className="flex-1 min-w-0">
        <h1 className="text-[34px] lg:text-[38px] tracking-tight" style={{ color: NAVY, fontFamily: 'Fraunces, serif', fontWeight: 600 }}>
          Community Water Purification Project
        </h1>
        <p className="text-[12.5px] font-semibold mt-1" style={{ color: COPPER }}>
          Science • Secondary • Year 10
        </p>
        <p className="mt-3 max-w-3xl text-[13.5px] leading-relaxed" style={{ color: '#3D4E66' }}>
          Design and build a low-cost water purification solution for communities with limited access to clean water.
          Investigate the science behind filtration and purification methods and document your process and findings.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-white border-2 px-4 py-2.5 text-[12.5px] font-extrabold" style={{ color: COPPER, borderColor: COPPER }}>
          <Download className="w-3.5 h-3.5" /> Download Brief
        </button>
        <button type="button" className="inline-flex items-center gap-2 rounded-xl text-white px-5 py-2.5 text-[12.5px] font-extrabold shadow-md" style={{ backgroundColor: NAVY }}>
          Submit Project
        </button>
      </div>
    </div>
  </section>
);

/* ────── KPI ROW ────── */
const KpiRow: React.FC = () => (
  <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
    {KPI_CARDS.map((c) => {
      const Icon = c.icon;
      return (
        <div key={c.label} className="rounded-xl bg-white border px-4 py-3.5 flex items-center gap-3" style={{ borderColor: SOFT_BORDER }}>
          <span className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: c.tint }}>
            <Icon className="w-5 h-5" style={{ color: c.ink }} />
          </span>
          <div className="min-w-0">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: MUTED }}>{c.label}</p>
            <p className="text-[20px] font-extrabold leading-none mt-0.5" style={{ color: NAVY }}>{c.value}</p>
            <p className="text-[10.5px] font-bold mt-1" style={{ color: c.subInk || MUTED }}>{c.sub}</p>
          </div>
        </div>
      );
    })}
  </div>
);

/* ────── SECTION SHELL ────── */
const NumberedSection: React.FC<React.PropsWithChildren<{ num: number; title: string; trailing?: React.ReactNode }>> = ({ num, title, trailing, children }) => (
  <section className="rounded-2xl bg-white border p-6" style={{ borderColor: SOFT_BORDER }}>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <span className="w-7 h-7 rounded-full text-white flex items-center justify-center text-[12px] font-extrabold shrink-0" style={{ backgroundColor: NAVY }}>{num}</span>
        <h2 className="text-[18px] font-extrabold tracking-tight" style={{ color: NAVY }}>{title}</h2>
      </div>
      {trailing}
    </div>
    {children}
  </section>
);

/* ────── 1. PROJECT BRIEF ────── */
const ProjectBriefCard: React.FC = () => (
  <NumberedSection num={1} title="Project Brief">
    <div className="grid grid-cols-1 lg:grid-cols-[1fr,140px] gap-5 items-start">
      <div>
        <p className="text-[13.5px] leading-relaxed" style={{ color: '#3D4E66' }}>
          Your team will research, design and build a prototype water purification system using locally available materials.
          Test its effectiveness and present your findings with clear data and scientific explanations.
        </p>
        <p className="mt-4 text-[12.5px] font-extrabold" style={{ color: NAVY }}>Deliverables</p>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {DELIVERABLES.map((d) => (
            <div key={d} className="flex items-center gap-1.5 text-[12px] font-bold" style={{ color: NAVY }}>
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: SUCCESS }} />
              {d}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center lg:justify-end">
        <BriefIllustration />
      </div>
    </div>
  </NumberedSection>
);

const BriefIllustration: React.FC = () => (
  <svg viewBox="0 0 120 120" className="w-[110px] h-[110px]" aria-hidden>
    {/* Document */}
    <rect x="20" y="14" width="64" height="86" rx="6" fill="white" stroke={SOFT_BORDER} strokeWidth="1.4" />
    <line x1="30" y1="32" x2="74" y2="32" stroke="#CBD5E1" strokeWidth="1" />
    <line x1="30" y1="42" x2="68" y2="42" stroke="#CBD5E1" strokeWidth="1" />
    <line x1="30" y1="52" x2="74" y2="52" stroke="#CBD5E1" strokeWidth="1" />
    <line x1="30" y1="62" x2="62" y2="62" stroke="#CBD5E1" strokeWidth="1" />
    {/* Flask */}
    <g transform="translate(60, 52)">
      <path d="M22 10 L22 24 L42 56 Q44 60, 38 60 L6 60 Q0 60, 2 56 L22 24 L22 10 Z" fill={COPPER} fillOpacity="0.85" stroke={COPPER} strokeWidth="1.4" />
      <line x1="16" y1="6" x2="28" y2="6" stroke={COPPER} strokeWidth="2" />
      <circle cx="14" cy="44" r="2" fill="white" />
      <circle cx="26" cy="50" r="1.5" fill="white" />
    </g>
  </svg>
);

/* ────── 2. MILESTONES ────── */
const MilestonesCard: React.FC = () => (
  <NumberedSection num={2} title="Milestones">
    <ul className="space-y-3">
      {MILESTONES.map((m, i) => <MilestoneRow key={i} m={m} />)}
    </ul>
  </NumberedSection>
);

const MilestoneRow: React.FC<{ m: Milestone }> = ({ m }) => {
  const stateBadge = m.state === 'completed'
    ? { bg: '#E5F6EC', ink: SUCCESS, text: 'Completed' }
    : m.state === 'in_progress'
    ? { bg: '#E0EBFF', ink: BLUE, text: 'In Progress' }
    : { bg: '#F1F5F9', ink: MUTED, text: 'Upcoming' };

  return (
    <li className="grid grid-cols-[24px,180px,1fr,110px] gap-3 items-center">
      {m.state === 'completed' ? (
        <span className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: SUCCESS }}>
          <Check className="w-3.5 h-3.5 text-white" />
        </span>
      ) : m.state === 'in_progress' ? (
        <span className="w-6 h-6 rounded-full ring-2 flex items-center justify-center" style={{ backgroundColor: 'white', borderColor: BLUE, ['--tw-ring-color' as any]: BLUE, boxShadow: `inset 0 0 0 2px ${BLUE}` }}>
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BLUE }} />
        </span>
      ) : (
        <span className="w-6 h-6 rounded-full bg-slate-100 ring-1" style={{ ['--tw-ring-color' as any]: SOFT_BORDER }} />
      )}
      <div className="min-w-0">
        <p className="text-[13px] font-extrabold leading-tight" style={{ color: NAVY }}>{m.title}</p>
        <p className="text-[11px] font-semibold" style={{ color: MUTED }}>{m.meta}</p>
      </div>
      <progress
        value={m.pct}
        max={100}
        className="block w-full h-2 rounded-full overflow-hidden appearance-none [&::-webkit-progress-bar]:bg-slate-100 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:rounded-full [&::-moz-progress-bar]:rounded-full"
        style={{ accentColor: m.state === 'completed' ? SUCCESS : m.state === 'in_progress' ? BLUE : '#CBD5E1' }}
      />
      <span className="rounded-full px-2.5 py-1 text-[11px] font-extrabold text-center" style={{ backgroundColor: stateBadge.bg, color: stateBadge.ink }}>
        {stateBadge.text}
      </span>
    </li>
  );
};

/* ────── 3. SUBMISSION WORKSPACE ────── */
const SubmissionWorkspaceCard: React.FC<{
  activeTab: 'overview' | 'submission' | 'rubric' | 'discussion';
  onTabChange: (t: 'overview' | 'submission' | 'rubric' | 'discussion') => void;
  notes: string;
  onNotesChange: (v: string) => void;
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
}> = ({ activeTab, onTabChange, notes, onNotesChange, fileInputRef }) => {
  const TABS = ['overview', 'submission', 'rubric', 'discussion'] as const;
  const labelOf = (t: typeof TABS[number]) => t.charAt(0).toUpperCase() + t.slice(1);
  return (
    <NumberedSection num={3} title="Submission Workspace">
      <div className="flex items-center gap-5 -mt-2 mb-4 border-b" style={{ borderColor: SOFT_BORDER }}>
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onTabChange(t)}
            className="relative pb-2.5 text-[12.5px] font-extrabold transition-colors"
            style={{ color: activeTab === t ? NAVY : MUTED }}
          >
            {labelOf(t)}
            {activeTab === t && <span className="absolute -bottom-px left-0 right-0 h-[2.5px] rounded-full" style={{ backgroundColor: NAVY }} />}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-xl border-2 border-dashed bg-[#F8FAFC] hover:bg-white transition-colors p-7 flex flex-col items-center justify-center text-center"
          style={{ borderColor: '#D6DEE9', minHeight: 200 }}
        >
          <span className="w-12 h-12 rounded-full bg-white flex items-center justify-center" style={{ border: `1px solid ${SOFT_BORDER}` }}>
            <UploadCloud className="w-5 h-5" style={{ color: NAVY }} />
          </span>
          <p className="mt-3 text-[14px] font-extrabold" style={{ color: NAVY }}>Drag &amp; drop files here</p>
          <p className="mt-1 text-[12px]" style={{ color: COPPER }}>or click to browse</p>
          <p className="mt-2 text-[10.5px]" style={{ color: MUTED }}>Supports: PDF, DOCX, JPG, PNG, MP4 (Max 100MB)</p>
        </button>
        <input ref={fileInputRef} type="file" multiple className="hidden" />

        <div>
          <p className="text-[13px] font-extrabold mb-2" style={{ color: NAVY }}>Attached Files</p>
          <ul className="space-y-2">
            {ATTACHED_FILES.map((f) => {
              const Icon = f.icon;
              return (
                <li key={f.name} className="flex items-center gap-3 rounded-xl border bg-white px-3 py-2.5" style={{ borderColor: SOFT_BORDER }}>
                  <span className="w-8 h-8 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: f.tint }}>
                    <Icon className="w-4 h-4" style={{ color: f.ink }} />
                  </span>
                  <p className="text-[12.5px] font-extrabold flex-1 truncate" style={{ color: NAVY }}>{f.name}</p>
                  <p className="text-[11px] font-bold" style={{ color: MUTED }}>{f.size}</p>
                  <button type="button" className="w-6 h-6 rounded-md hover:bg-slate-50 flex items-center justify-center" aria-label="Remove">
                    <X className="w-3.5 h-3.5" style={{ color: MUTED }} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[12.5px] font-extrabold" style={{ color: NAVY }}>Project Notes</p>
          <p className="text-[11px]" style={{ color: MUTED }}>{notes.length} / 1000</p>
        </div>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value.slice(0, 1000))}
          rows={3}
          className="w-full rounded-xl border bg-[#F8FAFC] px-4 py-3 text-[13px] outline-none focus:bg-white focus:border-[#C47A45]"
          style={{ borderColor: SOFT_BORDER, color: NAVY }}
        />
      </div>
    </NumberedSection>
  );
};

/* ────── 4. FEEDBACK ────── */
const FeedbackCard: React.FC = () => (
  <NumberedSection num={4} title="Teacher Feedback / Mentor Notes">
    <ul className="space-y-4">
      {FEEDBACK.map((f) => (
        <li key={f.name} className="flex items-start gap-3">
          <img src={`https://i.pravatar.cc/80?img=${f.img}`} alt={f.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[13.5px] font-extrabold" style={{ color: NAVY }}>{f.name}</p>
              <span className="rounded-md px-2 py-0.5 text-[10px] font-extrabold tracking-wider" style={{ backgroundColor: f.roleTint, color: f.roleInk }}>{f.role}</span>
              <p className="ml-auto text-[10.5px] font-bold" style={{ color: MUTED }}>{f.meta}</p>
            </div>
            <p className="mt-1 text-[13px] leading-relaxed" style={{ color: '#3D4E66' }}>{f.body}</p>
          </div>
        </li>
      ))}
    </ul>
  </NumberedSection>
);

/* ────── COMPLETED PROJECTS ────── */
const CompletedProjectsCard: React.FC = () => (
  <section className="rounded-2xl bg-white border p-5" style={{ borderColor: SOFT_BORDER }}>
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: '#E5F6EC' }}>
          <FileCheck2 className="w-4 h-4" style={{ color: SUCCESS }} />
        </span>
        <h3 className="text-[15px] font-extrabold" style={{ color: NAVY }}>Completed Projects</h3>
      </div>
    </div>
    <ul className="divide-y" style={{ borderColor: SOFT_BORDER }}>
      {COMPLETED.map((p) => {
        const Icon = p.icon;
        return (
          <li key={p.title} className="grid grid-cols-[36px,1fr,90px,80px,60px] gap-3 items-center py-2.5">
            <span className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: p.tint }}>
              <Icon className="w-4 h-4" style={{ color: p.ink }} />
            </span>
            <div className="min-w-0">
              <p className="text-[12.5px] font-extrabold leading-tight truncate" style={{ color: NAVY }}>{p.title}</p>
              <p className="text-[11px] font-semibold" style={{ color: MUTED }}>{p.subject}</p>
            </div>
            <span className="rounded-md px-2 py-0.5 text-[10px] font-extrabold text-center" style={{ backgroundColor: '#E5F6EC', color: SUCCESS }}>Completed</span>
            <p className="text-[11.5px] font-extrabold text-center" style={{ color: NAVY }}>{p.marks}</p>
            <p className="text-[10.5px] font-bold text-right" style={{ color: MUTED }}>{p.date}</p>
          </li>
        );
      })}
    </ul>
    <div className="text-center mt-3">
      <button type="button" className="text-[12px] font-extrabold inline-flex items-center gap-1" style={{ color: COPPER }}>
        View all completed projects <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  </section>
);

/* ────── UPCOMING PROJECTS ────── */
const UpcomingProjectsCard: React.FC = () => (
  <section className="rounded-2xl bg-white border p-5" style={{ borderColor: SOFT_BORDER }}>
    <div className="flex items-center gap-2 mb-3">
      <span className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: '#E0EBFF' }}>
        <CalendarDays className="w-4 h-4" style={{ color: BLUE }} />
      </span>
      <h3 className="text-[15px] font-extrabold" style={{ color: NAVY }}>Upcoming Projects</h3>
    </div>
    <ul className="divide-y" style={{ borderColor: SOFT_BORDER }}>
      {UPCOMING.map((p) => {
        const Icon = p.icon;
        return (
          <li key={p.title} className="grid grid-cols-[36px,1fr,100px,90px,90px] gap-3 items-center py-2.5">
            <span className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: p.tint }}>
              <Icon className="w-4 h-4" style={{ color: p.ink }} />
            </span>
            <div className="min-w-0">
              <p className="text-[12.5px] font-extrabold leading-tight truncate" style={{ color: NAVY }}>{p.title}</p>
              <p className="text-[11px] font-semibold" style={{ color: MUTED }}>{p.subject}</p>
            </div>
            <p className="text-[10.5px] font-bold" style={{ color: MUTED }}>{p.starts}</p>
            <p className="text-[10.5px] font-bold" style={{ color: MUTED }}>{p.due}</p>
            <span className="rounded-md px-2 py-0.5 text-[10px] font-extrabold text-center" style={{ backgroundColor: '#E0EBFF', color: BLUE }}>Upcoming</span>
          </li>
        );
      })}
    </ul>
    <div className="text-center mt-3">
      <button type="button" className="text-[12px] font-extrabold inline-flex items-center gap-1" style={{ color: COPPER }}>
        View all upcoming projects <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  </section>
);

/* ────── RIGHT RAIL — PROJECT PROGRESS ────── */
const ProjectProgressCard: React.FC = () => (
  <section className="rounded-2xl bg-white border p-5" style={{ borderColor: SOFT_BORDER }}>
    <div className="flex items-center gap-2 mb-3">
      <span className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[12px] font-extrabold" style={{ backgroundColor: NAVY }}>1</span>
      <h3 className="text-[15px] font-extrabold" style={{ color: NAVY }}>Project Progress</h3>
    </div>
    <div className="grid grid-cols-[120px,1fr] gap-3 items-center">
      <ProgressDonut value={72} />
      <ul className="space-y-2 text-[12.5px]">
        <li className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: SUCCESS }} />
          <span className="font-bold" style={{ color: NAVY }}>Completed</span>
          <span className="ml-auto font-extrabold" style={{ color: NAVY }}>18 tasks</span>
        </li>
        <li className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full ring-2" style={{ ['--tw-ring-color' as any]: BLUE, backgroundColor: 'white', boxShadow: `inset 0 0 0 1.5px ${BLUE}` }} />
          <span className="font-bold" style={{ color: NAVY }}>In Progress</span>
          <span className="ml-auto font-extrabold" style={{ color: NAVY }}>6 tasks</span>
        </li>
        <li className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: '#FDECEC', border: `1.5px solid #EF4444` }} />
          <span className="font-bold" style={{ color: NAVY }}>Not Started</span>
          <span className="ml-auto font-extrabold" style={{ color: NAVY }}>1 task</span>
        </li>
      </ul>
    </div>
    <p className="mt-4 text-[11.5px] font-semibold" style={{ color: MUTED }}>Keep going! You&apos;re doing great. <span aria-hidden>✨</span></p>
  </section>
);

const ProgressDonut: React.FC<{ value: number }> = ({ value }) => {
  const r = 46;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <svg viewBox="0 0 120 120" className="w-[110px] h-[110px]" aria-hidden>
      <circle cx="60" cy="60" r={r} fill="none" stroke="#F1ECDF" strokeWidth="11" />
      <circle cx="60" cy="60" r={r} fill="none" stroke={SUCCESS} strokeWidth="11" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 60 60)" />
      <text x="60" y="62" textAnchor="middle" fontSize="22" fontWeight="800" fill={NAVY}>{value}%</text>
      <text x="60" y="80" textAnchor="middle" fontSize="9" fontWeight="700" fill={MUTED}>On Track</text>
    </svg>
  );
};

/* ────── TEAM MEMBERS ────── */
const TeamMembersCard: React.FC = () => (
  <section className="rounded-2xl bg-white border p-5" style={{ borderColor: SOFT_BORDER }}>
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[12px] font-extrabold" style={{ backgroundColor: NAVY }}>1</span>
        <h3 className="text-[15px] font-extrabold" style={{ color: NAVY }}>Team Members</h3>
      </div>
      <button type="button" className="text-[11.5px] font-extrabold" style={{ color: COPPER }}>Manage Team</button>
    </div>
    <ul className="space-y-2.5">
      {TEAM.map((m) => (
        <li key={m.name} className="flex items-center gap-3">
          <img src={`https://i.pravatar.cc/64?img=${m.img}`} alt={m.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-extrabold leading-tight" style={{ color: NAVY }}>{m.name}</p>
            <p className="text-[10.5px] font-bold" style={{ color: COPPER }}>{m.role}</p>
          </div>
          <input type="checkbox" className="w-4 h-4 rounded border" style={{ borderColor: SOFT_BORDER }} aria-label={`select ${m.name}`} />
        </li>
      ))}
    </ul>
  </section>
);

/* ────── RUBRIC SUMMARY ────── */
const RubricSummaryCard: React.FC = () => {
  const total = RUBRIC.reduce((acc, r) => acc + r.score, 0);
  const max = RUBRIC.reduce((acc, r) => acc + r.max, 0);
  return (
    <section className="rounded-2xl bg-white border p-5" style={{ borderColor: SOFT_BORDER }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[12px] font-extrabold" style={{ backgroundColor: NAVY }}>1</span>
          <h3 className="text-[15px] font-extrabold" style={{ color: NAVY }}>Rubric Summary</h3>
        </div>
        <p className="text-[11.5px] font-extrabold" style={{ color: NAVY }}>Total: {total} / {max}</p>
      </div>
      <ul className="space-y-3">
        {RUBRIC.map((r) => (
          <li key={r.label}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[12px] font-bold" style={{ color: NAVY }}>{r.label}</p>
              <p className="text-[12px] font-extrabold" style={{ color: NAVY }}>{r.score} / {r.max}</p>
            </div>
            <progress
              value={r.score}
              max={r.max}
              className="block w-full h-1.5 rounded-full overflow-hidden appearance-none [&::-webkit-progress-bar]:bg-slate-100 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:bg-[#C47A45] [&::-webkit-progress-value]:rounded-full [&::-moz-progress-bar]:bg-[#C47A45]"
            />
          </li>
        ))}
      </ul>
    </section>
  );
};

/* ────── DEADLINES ────── */
const DeadlinesCard: React.FC = () => (
  <section className="rounded-2xl bg-white border p-5" style={{ borderColor: SOFT_BORDER }}>
    <div className="flex items-center gap-2 mb-3">
      <span className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[12px] font-extrabold" style={{ backgroundColor: NAVY }}>1</span>
      <h3 className="text-[15px] font-extrabold" style={{ color: NAVY }}>Timeline / Upcoming Deadlines</h3>
    </div>
    <ul className="space-y-3">
      {DEADLINES.map((d) => (
        <li key={d.title} className="flex items-start gap-3">
          <div className="rounded-lg shrink-0 text-center px-2 py-1.5" style={{ backgroundColor: '#FFE4E6' }}>
            <p className="text-[9px] font-extrabold tracking-wider" style={{ color: '#EF4444' }}>{d.dateMonth}</p>
            <p className="text-[15px] font-extrabold leading-none" style={{ color: NAVY }}>{d.day}</p>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-extrabold leading-tight" style={{ color: NAVY }}>{d.title}</p>
            <p className="text-[10.5px] font-semibold" style={{ color: MUTED }}>{d.sub}</p>
          </div>
          <p className="text-[10.5px] font-bold shrink-0" style={{ color: MUTED }}>{d.daysLeft}</p>
        </li>
      ))}
    </ul>
  </section>
);

/* ────── QUICK RESOURCES ────── */
const QuickResourcesCard: React.FC = () => (
  <section className="rounded-2xl bg-white border p-5" style={{ borderColor: SOFT_BORDER }}>
    <div className="flex items-center gap-2 mb-3">
      <span className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[12px] font-extrabold" style={{ backgroundColor: NAVY }}>1</span>
      <h3 className="text-[15px] font-extrabold" style={{ color: NAVY }}>Quick Resources</h3>
    </div>
    <ul className="divide-y" style={{ borderColor: SOFT_BORDER }}>
      {QUICK_RESOURCES.map(({ title, icon: Icon, tint, ink }) => (
        <li key={title}>
          <button type="button" className="w-full flex items-center gap-3 px-1 py-3 hover:bg-slate-50 rounded-md text-left">
            <span className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: tint }}>
              <Icon className="w-4 h-4" style={{ color: ink }} />
            </span>
            <p className="text-[12.5px] font-extrabold flex-1 leading-tight" style={{ color: NAVY }}>{title}</p>
            <ChevronRight className="w-4 h-4 shrink-0" style={{ color: MUTED }} />
          </button>
        </li>
      ))}
    </ul>
  </section>
);

/* Imports kept alive even when branches change — see linter behaviour. */
export const _IconKeepalive = [Sparkles, MapPin, FlaskConical, MessageSquare, Trash2, Headphones, ScrollText];
