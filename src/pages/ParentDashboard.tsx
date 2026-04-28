import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  // Sidebar
  LayoutDashboard, Users, BarChart3, FileText, MonitorPlay, ClipboardList,
  CalendarCheck, MessageSquare, CreditCard, Headphones, School, Bell,
  BookOpen, Settings, Crown, ChevronDown, ChevronRight, Plus,
  // Top bar
  Search, MessageCircle,
  // Body
  Sparkles, AlertTriangle, Calendar, Wallet, BookOpenCheck, Target,
  Sigma, FlaskConical, Atom, Globe2,
  GraduationCap, ClipboardCheck, MessageSquareText, Banknote, TrendingUp,
} from 'lucide-react';

/* ──────────────────────────────────────────────────────────────────────
   DESIGN TOKENS
   ──────────────────────────────────────────────────────────────────── */
const NAVY_DARK = '#071A33';
const NAVY = '#0B1F3A';
const NAVY_MED = '#102A43';
const COPPER = '#C47A45';
const COPPER_LIGHT = '#F4B860';
const SUCCESS = '#12B76A';
const WARN = '#F59E0B';
const DANGER = '#EF4444';
const PURPLE = '#7C3AED';
const BLUE = '#2563EB';
const TEXT_MUTED = '#64748B';
const BORDER = '#E6EAF2';
const CREAM_SOFT = '#FFF7ED';

/* ──────────────────────────────────────────────────────────────────────
   STATIC DEMO DATA
   ──────────────────────────────────────────────────────────────────── */
type NavItem = { label: string; icon: React.ComponentType<{ className?: string }>; badge?: string; tagText?: string; tagTone?: 'success' | 'danger'; active?: boolean };

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',    icon: LayoutDashboard, active: true },
  { label: 'My Children',  icon: Users },
  { label: 'Progress',     icon: BarChart3, tagText: 'New', tagTone: 'success' },
  { label: 'Reports',      icon: FileText },
  { label: 'Live Classes', icon: MonitorPlay },
  { label: 'Assignments',  icon: ClipboardList },
  { label: 'Attendance',   icon: CalendarCheck },
  { label: 'Messages',     icon: MessageSquare, badge: '8' },
  { label: 'Payments',     icon: CreditCard },
  { label: 'Support & Ask', icon: Headphones },
  { label: 'School Match', icon: School, tagText: 'New', tagTone: 'success' },
  { label: 'Applications', icon: ClipboardCheck },
  { label: 'Notifications', icon: Bell, badge: '6' },
  { label: 'Resources',    icon: BookOpen },
  { label: 'Settings',     icon: Settings },
];

interface Child {
  id: string;
  name: string;
  meta: string;
  progress: number;
  imgSeed: number;
  bg: string;
  ring: string;
}

const CHILDREN: Child[] = [
  { id: 'david', name: 'David Okello', meta: 'S4 • Uganda • NCDC', progress: 82, imgSeed: 14, bg: '#EEF4FF', ring: '#A6C0FF' },
  { id: 'alice', name: 'Alice Okello', meta: 'P7 • Uganda • NCDC', progress: 76, imgSeed: 47, bg: 'white', ring: '#FCE7C8' },
  { id: 'brian', name: 'Brian Okello', meta: 'S1 • Uganda • NCDC', progress: 68, imgSeed: 11, bg: 'white', ring: '#F8C6BC' },
];

const KPI_CARDS = [
  { label: 'Overall Progress',        value: '82%',     delta: '↑ 8% from last week', icon: TrendingUp,    iconBg: '#E5F6EC', iconInk: '#12B76A', spark: 'green'  as const },
  { label: 'Attendance (This Term)',   value: '94%',     delta: '↑ 6% from last week', icon: CalendarCheck, iconBg: '#FFF6E0', iconInk: '#F59E0B', spark: 'orange' as const },
  { label: 'Assignments Completed',    value: '18 / 22', delta: 'This term',           icon: ClipboardList, iconBg: '#EEEAFE', iconInk: '#7C3AED', spark: 'purple' as const },
  { label: 'Weak Topics',              value: '5',       delta: 'Needs attention',     icon: AlertTriangle, iconBg: '#FFE4E6', iconInk: '#EF4444', spark: 'pink'   as const },
  { label: 'Learning Streak',          value: '12 days', delta: 'Keep it up!',         icon: Sparkles,      iconBg: '#E0EBFF', iconInk: '#2563EB', spark: 'blue'   as const },
];

interface FocusItem {
  status: 'LIVE' | 'DUE SOON' | 'PRACTICE';
  subject: string;
  topic: string;
  meta: string;
  ctaLabel: string;
  statusBg: string; statusInk: string;
}

const FOCUS_ITEMS: FocusItem[] = [
  { status: 'LIVE',     subject: 'Mathematics – S4',           topic: 'Trigonometric Identities',  meta: '10:00 AM – 11:30 AM • Google Meet', ctaLabel: 'Join Class',       statusBg: '#E5F6EC', statusInk: '#1B7B49' },
  { status: 'DUE SOON', subject: 'Physics Assignment',         topic: 'Motion in 2D Problems',     meta: 'Due: Today, 5:00 PM',                ctaLabel: 'View Assignment',  statusBg: '#FCEFD8', statusInk: COPPER },
  { status: 'PRACTICE', subject: 'Recommended Practice',       topic: '5 questions on Trigonometry', meta: 'Est. 15 min',                       ctaLabel: 'Start Practice',   statusBg: '#EEEAFE', statusInk: PURPLE },
];

const SUBJECT_PROGRESS = [
  { name: 'Mathematics', value: 88, ink: SUCCESS, icon: Sigma,        tint: '#E0EBFF' },
  { name: 'Physics',     value: 76, ink: WARN,    icon: Atom,         tint: '#FFE9D6' },
  { name: 'Chemistry',   value: 82, ink: PURPLE,  icon: FlaskConical, tint: '#EEEAFE' },
  { name: 'English',     value: 72, ink: BLUE,    icon: BookOpen,     tint: '#E0EBFF' },
  { name: 'Geography',   value: 64, ink: WARN,    icon: Globe2,       tint: '#FFF6E0' },
];

const ALERTS = [
  { title: '5 weak topics need attention', body: 'Check David\'s weak areas', icon: AlertTriangle, tint: '#FEEBEB', ink: DANGER },
  { title: 'PTA Meeting',                  body: 'Sat, May 10, 2025 • 9:00 AM', icon: Calendar,     tint: '#FFF6E0', ink: WARN },
  { title: 'Subscription due in 7 days',   body: 'UGX 120,000 • Pay now to avoid interruption', icon: Banknote, tint: '#E5F6EC', ink: SUCCESS },
];

const RECENT_ACTIVITY = [
  { title: 'Live class attended',  body: 'Mathematics – Trigonometric Identities',  meta: 'Today, 10:15 AM',     icon: MonitorPlay,    tint: '#E0EBFF', ink: BLUE },
  { title: 'Assignment submitted', body: 'Physics Assignment: Motion in 2D',         meta: 'Yesterday, 4:45 PM',   icon: ClipboardCheck, tint: '#FCEFD8', ink: COPPER },
  { title: 'New grade posted',     body: 'Chemistry Quiz: Acids & Bases',            meta: 'Yesterday, 11:20 AM',  icon: BookOpenCheck,  tint: '#EEEAFE', ink: PURPLE },
  { title: 'Teacher message',      body: 'From: Mr. Okello David (Maths)',           meta: 'May 2, 2025, 8:30 PM', icon: MessageSquareText, tint: '#FEEBEB', ink: DANGER },
];

const TEACHER_MESSAGES = [
  { name: 'Mr. Okello David',      role: 'Mathematics Teacher', body: '"David is doing well in class. Let\'s work on..."', meta: 'Today, 8:30 AM',     unread: 2, imgSeed: 12 },
  { name: 'Mrs. Achieng Sarah',    role: 'Chemistry Teacher',   body: '"Great improvement in the last quiz!"',              meta: 'Yesterday, 6:15 PM', unread: 0, imgSeed: 47 },
  { name: 'Ms. Nansubuga Irene',   role: 'English Teacher',     body: '"Please encourage more practice in essays."',        meta: 'May 1, 2025',         unread: 0, imgSeed: 49 },
];

const QUICK_ACTIONS = [
  { label: 'Message Teacher',  icon: MessageSquare, tint: '#E5F6EC', ink: SUCCESS },
  { label: 'Remind Child',     icon: Bell,          tint: '#FFF6E0', ink: WARN },
  { label: 'Pay Fees',         icon: Wallet,        tint: '#FEE7EE', ink: '#DB2777' },
  { label: 'View Reports',     icon: BarChart3,     tint: '#E0EBFF', ink: BLUE },
  { label: 'Book Support',     icon: Headphones,    tint: '#EEEAFE', ink: PURPLE },
  { label: 'Apply to School',  icon: School,        tint: '#FCEFD8', ink: COPPER },
];

/* ──────────────────────────────────────────────────────────────────────
   PAGE
   ──────────────────────────────────────────────────────────────────── */
export const ParentDashboard: React.FC = () => {
  const [activeChild, setActiveChild] = useState('david');

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex">
      <ParentSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <ParentTopBar />

        <main className="flex-1 px-6 lg:px-10 xl:px-12 py-7 lg:py-9 space-y-6 max-w-[1480px] w-full mx-auto">
          {/* Greeting */}
          <div>
            <h1 className="text-[28px] lg:text-[30px] font-extrabold tracking-tight" style={{ color: NAVY }}>
              Good morning, Mary! <span aria-hidden>👋</span>
            </h1>
            <p className="mt-1 text-[14px]" style={{ color: TEXT_MUTED }}>
              Here&apos;s how your children are doing today.
            </p>
          </div>

          <div className="grid xl:grid-cols-[1fr,360px] gap-6">
            <div className="min-w-0 space-y-6">
              <ChildSelector active={activeChild} onChange={setActiveChild} />
              <KpiStrip />
              <div className="grid lg:grid-cols-[1.1fr,1fr] gap-5">
                <TodaysFocus />
                <TopSubjects />
              </div>
              <div className="grid lg:grid-cols-2 gap-5">
                <RecentActivity />
                <TeacherMessages />
              </div>
            </div>

            <aside className="space-y-6 min-w-0">
              <WeeklySummary />
              <AlertsReminders />
              <QuickActions />
              <NeedHelp />
            </aside>
          </div>
        </main>

        <DashboardFooter />
      </div>
    </div>
  );
};

export default ParentDashboard;

/* ──────────────────────────────────────────────────────────────────────
   FOOTER
   ──────────────────────────────────────────────────────────────────── */
const DashboardFooter: React.FC = () => (
  <footer className="border-t bg-white" style={{ borderColor: BORDER }}>
    <div className="px-6 lg:px-10 xl:px-12 py-5 max-w-[1480px] w-full mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${COPPER}1A` }}>
          <GraduationCap className="w-3.5 h-3.5" style={{ color: COPPER }} />
        </span>
        <p className="text-[12px] font-bold" style={{ color: NAVY }}>Maple OS</p>
        <span className="text-[11px]" style={{ color: TEXT_MUTED }}>· Parent Portal · v2.4.1</span>
      </div>
      <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] font-bold" style={{ color: TEXT_MUTED }}>
        <Link to="/support" className="hover:text-[#0B1F3A]">Help &amp; Support</Link>
        <Link to="/feedback" className="hover:text-[#0B1F3A]">Send Feedback</Link>
        <span className="hover:text-[#0B1F3A] cursor-pointer">Privacy</span>
        <span className="hover:text-[#0B1F3A] cursor-pointer">Terms</span>
        <span className="hover:text-[#0B1F3A] cursor-pointer">Family Safety</span>
      </nav>
      <p className="text-[11px]" style={{ color: TEXT_MUTED }}>&copy; 2026 Maple Online School. All rights reserved.</p>
    </div>
  </footer>
);

/* ──────────────────────────────────────────────────────────────────────
   SIDEBAR
   ──────────────────────────────────────────────────────────────────── */
const ParentSidebar: React.FC = () => (
  <aside className="hidden lg:flex flex-col w-[280px] shrink-0 sticky top-0 h-screen text-white" style={{ background: `linear-gradient(180deg, ${NAVY_DARK} 0%, ${NAVY} 100%)` }}>
    <div className="px-6 pt-6 pb-4 flex items-center gap-3">
      <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${COPPER}33` }}>
        <GraduationCap className="w-5 h-5" style={{ color: COPPER_LIGHT }} />
      </span>
      <div className="leading-tight">
        <p className="text-[20px] font-extrabold tracking-tight">Maple OS</p>
        <p className="mt-0.5 text-[10px] font-bold tracking-[0.28em]" style={{ color: COPPER_LIGHT }}>PARENT PORTAL</p>
      </div>
    </div>

    <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
      {NAV_ITEMS.map((it) => <NavRow key={it.label} item={it} />)}
    </nav>

    {/* Premium card */}
    <div className="p-3">
      <div className="rounded-2xl p-4 ring-1 ring-white/10" style={{ background: `linear-gradient(160deg, #1A1F45 0%, #0F1334 100%)` }}>
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4" style={{ color: COPPER_LIGHT }} />
          <p className="text-[13px] font-extrabold">Become Premium</p>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-300">
          Unlock advanced reports, weekly summaries, risk alerts and priority support.
        </p>
        <button type="button" className="mt-3 w-full rounded-xl text-white text-[12px] font-extrabold py-2.5 inline-flex items-center justify-center gap-1.5 shadow-lg" style={{ background: `linear-gradient(135deg, ${COPPER} 0%, #8B4F26 100%)` }}>
          Upgrade Now <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </aside>
);

const NavRow: React.FC<{ item: NavItem }> = ({ item }) => {
  const Icon = item.icon;
  const active = !!item.active;
  return (
    <button
      type="button"
      className={[
        'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-bold transition-colors',
        active ? 'text-white shadow-lg' : 'text-slate-300 hover:text-white hover:bg-white/[0.06]',
      ].join(' ')}
      style={active ? { background: `linear-gradient(135deg, ${COPPER} 0%, #8B4F26 100%)` } : undefined}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="flex-1 text-left">{item.label}</span>
      {item.tagText && (
        <span className="rounded-full px-1.5 py-0.5 text-[9px] font-extrabold" style={{ backgroundColor: item.tagTone === 'danger' ? '#FEE2E2' : '#DCFCE7', color: item.tagTone === 'danger' ? DANGER : SUCCESS }}>
          {item.tagText}
        </span>
      )}
      {item.badge && (
        <span className={['rounded-full px-1.5 py-0.5 text-[10px] font-extrabold', active ? 'bg-white/25 text-white' : 'bg-white/10 text-slate-200'].join(' ')}>
          {item.badge}
        </span>
      )}
    </button>
  );
};

/* ──────────────────────────────────────────────────────────────────────
   TOP BAR
   ──────────────────────────────────────────────────────────────────── */
const ParentTopBar: React.FC = () => {
  const [search, setSearch] = useState('');
  return (
    <header className="sticky top-0 z-30 bg-white border-b" style={{ borderColor: BORDER }}>
      <div className="px-6 lg:px-10 xl:px-12 h-[72px] max-w-[1480px] w-full mx-auto flex items-center gap-4">
        <div className="relative flex-1 max-w-[480px]">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: TEXT_MUTED }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students, classes, topics, teachers..."
            className="w-full bg-[#F8FAFC] border rounded-full py-2.5 pl-11 pr-4 text-[13px] outline-none placeholder:text-slate-400 focus:bg-white transition-all"
            style={{ borderColor: BORDER, color: NAVY }}
          />
        </div>

        <div className="flex items-center gap-2 ml-auto shrink-0">
          <button type="button" className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white border px-3 h-9 text-[12px] font-extrabold hover:bg-slate-50" style={{ borderColor: BORDER, color: '#1B7B49' }}>
            <span className="w-5 h-5 rounded-full bg-[#25D366] flex items-center justify-center"><MessageCircle className="w-3 h-3 text-white" /></span>
            WhatsApp
          </button>
          <IconButton ariaLabel="Notifications" badge={6}>
            <Bell className="w-5 h-5" />
          </IconButton>
          <IconButton ariaLabel="Messages">
            <MessageSquare className="w-5 h-5" />
          </IconButton>
          <span className="w-px h-8 mx-1" style={{ backgroundColor: BORDER }} />
          <Link to="/dashboard/parent" className="flex items-center gap-2.5 group">
            <img
              src="https://i.pravatar.cc/80?img=44"
              alt="Mary Okello"
              className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-white shadow-sm"
            />
            <div className="hidden sm:block leading-tight">
              <p className="text-[13px] font-extrabold" style={{ color: NAVY }}>Mary Okello</p>
              <p className="text-[11px] font-bold" style={{ color: TEXT_MUTED }}>Parent</p>
            </div>
            <ChevronDown className="w-4 h-4" style={{ color: TEXT_MUTED }} />
          </Link>
        </div>
      </div>
    </header>
  );
};

const IconButton: React.FC<React.PropsWithChildren<{ ariaLabel: string; badge?: number }>> = ({ ariaLabel, badge, children }) => (
  <button type="button" aria-label={ariaLabel} className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-50" style={{ color: NAVY }}>
    {children}
    {typeof badge === 'number' && (
      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-extrabold flex items-center justify-center" style={{ backgroundColor: DANGER }}>{badge}</span>
    )}
  </button>
);

/* ──────────────────────────────────────────────────────────────────────
   CHILD SELECTOR
   ──────────────────────────────────────────────────────────────────── */
const ChildSelector: React.FC<{ active: string; onChange: (id: string) => void }> = ({ active, onChange }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
    {CHILDREN.map((c) => {
      const isActive = active === c.id;
      return (
        <button
          key={c.id}
          type="button"
          onClick={() => onChange(c.id)}
          className="rounded-2xl bg-white border p-3 flex items-center gap-3 transition-all"
          style={{ borderColor: isActive ? '#A6C0FF' : BORDER, backgroundColor: isActive ? '#F4F8FF' : 'white', boxShadow: isActive ? '0 8px 24px -12px rgba(74,108,255,0.18)' : '0 1px 2px rgba(15,23,42,0.04)' }}
        >
          <img src={`https://i.pravatar.cc/80?img=${c.imgSeed}`} alt={c.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[13.5px] font-extrabold leading-tight truncate" style={{ color: NAVY }}>{c.name}</p>
            <p className="text-[11px] font-semibold mt-0.5 truncate" style={{ color: TEXT_MUTED }}>{c.meta}</p>
          </div>
          <ProgressBadge value={c.progress} />
        </button>
      );
    })}
    <button type="button" className="rounded-2xl border-2 border-dashed bg-white p-3 flex items-center gap-3 hover:bg-slate-50" style={{ borderColor: BORDER }}>
      <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#EEF4FF' }}>
        <Plus className="w-4 h-4" style={{ color: BLUE }} />
      </span>
      <span className="text-[13px] font-extrabold" style={{ color: BLUE }}>Add Child</span>
    </button>
  </div>
);

const ProgressBadge: React.FC<{ value: number }> = ({ value }) => {
  const r = 18;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  const ink = value >= 80 ? SUCCESS : value >= 70 ? WARN : DANGER;
  return (
    <svg viewBox="0 0 44 44" className="w-11 h-11 shrink-0" aria-hidden>
      <circle cx="22" cy="22" r={r} fill="none" stroke="#F1F5F9" strokeWidth="4" />
      <circle cx="22" cy="22" r={r} fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 22 22)" />
      <text x="22" y="26" textAnchor="middle" fontSize="11" fontWeight="800" fill={NAVY}>{value}%</text>
    </svg>
  );
};

/* ──────────────────────────────────────────────────────────────────────
   KPI STRIP
   ──────────────────────────────────────────────────────────────────── */
const KpiStrip: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
    {KPI_CARDS.map((c) => {
      const Icon = c.icon;
      return (
        <article key={c.label} className="rounded-2xl bg-white border p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.06)]" style={{ borderColor: BORDER }}>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: c.iconBg }}>
              <Icon className="w-4 h-4" style={{ color: c.iconInk }} />
            </span>
            <p className="text-[11.5px] font-bold" style={{ color: TEXT_MUTED }}>{c.label}</p>
          </div>
          <p className="mt-3 text-[24px] font-extrabold tracking-tight leading-none" style={{ color: NAVY }}>{c.value}</p>
          {c.delta && <p className="mt-1 text-[11px] font-bold" style={{ color: c.iconInk }}>{c.delta}</p>}
          <div className="mt-3 h-7">
            <Sparkline tone={c.spark} />
          </div>
        </article>
      );
    })}
  </div>
);

const Sparkline: React.FC<{ tone: 'green' | 'orange' | 'purple' | 'pink' | 'blue' }> = ({ tone }) => {
  const colours: Record<string, { stroke: string; fill: string }> = {
    green:  { stroke: '#12B76A', fill: 'rgba(18,183,106,0.15)' },
    orange: { stroke: '#F59E0B', fill: 'rgba(245,158,11,0.15)' },
    purple: { stroke: '#7C3AED', fill: 'rgba(124,58,237,0.15)' },
    pink:   { stroke: '#EC4899', fill: 'rgba(236,72,153,0.15)' },
    blue:   { stroke: '#2563EB', fill: 'rgba(37,99,235,0.15)' },
  };
  const c = colours[tone];
  const ys = [22, 17, 19, 13, 15, 8, 12, 5];
  return (
    <svg viewBox="0 0 120 28" preserveAspectRatio="none" className="w-full h-7" aria-hidden>
      <path d="M0 22 L18 17 L34 19 L52 13 L70 15 L88 8 L106 12 L120 5 L120 28 L0 28 Z" fill={c.fill} />
      <path d="M0 22 L18 17 L34 19 L52 13 L70 15 L88 8 L106 12 L120 5" stroke={c.stroke} strokeWidth="1.4" fill="none" />
      {[0, 18, 34, 52, 70, 88, 106, 120].map((x, i) => (
        <circle key={i} cx={x} cy={ys[i]} r="1.4" fill={c.stroke} />
      ))}
    </svg>
  );
};

/* ──────────────────────────────────────────────────────────────────────
   TODAY'S FOCUS / TOP SUBJECTS
   ──────────────────────────────────────────────────────────────────── */
const CardShell: React.FC<React.PropsWithChildren<{ title: string; trailing?: React.ReactNode; icon?: React.ComponentType<{ className?: string }>; iconInk?: string }>> = ({ title, trailing, icon: Icon, iconInk, children }) => (
  <section className="rounded-2xl bg-white border p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.06)]" style={{ borderColor: BORDER }}>
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" style={{ color: iconInk || COPPER }} />}
        <h3 className="text-[16px] font-extrabold tracking-tight" style={{ color: NAVY }}>{title}</h3>
      </div>
      {trailing}
    </div>
    {children}
  </section>
);

const TodaysFocus: React.FC = () => (
  <CardShell title="Today's Focus for David" icon={Target} iconInk={DANGER}>
    <ul className="divide-y" style={{ borderColor: BORDER }}>
      {FOCUS_ITEMS.map((f) => (
        <li key={f.subject} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          <span
            className="rounded-md px-2 py-0.5 text-[9.5px] font-extrabold tracking-wider shrink-0"
            style={{ backgroundColor: f.statusBg, color: f.statusInk, minWidth: 64, textAlign: 'center' }}
          >
            {f.status}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold" style={{ color: NAVY }}>{f.subject}</p>
            <p className="text-[12.5px] font-extrabold leading-tight" style={{ color: NAVY }}>{f.topic}</p>
            <p className="text-[11px]" style={{ color: TEXT_MUTED }}>{f.meta}</p>
          </div>
          <button type="button" className="w-8 h-8 rounded-md border flex items-center justify-center" style={{ borderColor: BORDER, color: TEXT_MUTED }} aria-label="Schedule">
            <Calendar className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            className="rounded-md text-white text-[11.5px] font-extrabold px-3.5 py-2 shrink-0"
            style={{ backgroundColor: f.status === 'LIVE' ? SUCCESS : NAVY }}
          >
            {f.ctaLabel}
          </button>
        </li>
      ))}
    </ul>
    <button type="button" className="mt-3 w-full text-center text-[12px] font-extrabold inline-flex items-center justify-center gap-0.5" style={{ color: COPPER }}>
      View Full Schedule <ChevronRight className="w-3.5 h-3.5" />
    </button>
  </CardShell>
);

const TopSubjects: React.FC = () => (
  <CardShell
    title="Top Subjects This Term"
    trailing={<button type="button" className="text-[11.5px] font-extrabold" style={{ color: COPPER }}>View All</button>}
  >
    <ul className="space-y-3">
      {SUBJECT_PROGRESS.map((s) => {
        const Icon = s.icon;
        return (
          <li key={s.name} className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: s.tint }}>
              <Icon className="w-4 h-4" style={{ color: s.ink }} />
            </span>
            <p className="text-[12.5px] font-extrabold w-[88px] shrink-0" style={{ color: NAVY }}>{s.name}</p>
            <progress
              value={s.value}
              max={100}
              className="block flex-1 h-1.5 rounded-full overflow-hidden appearance-none [&::-webkit-progress-bar]:bg-slate-100 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:rounded-full [&::-moz-progress-bar]:rounded-full"
              style={{ accentColor: s.ink }}
            />
            <p className="text-[12px] font-extrabold w-[40px] text-right shrink-0" style={{ color: NAVY }}>{s.value}%</p>
          </li>
        );
      })}
    </ul>
  </CardShell>
);

/* ──────────────────────────────────────────────────────────────────────
   RECENT ACTIVITY · TEACHER MESSAGES
   ──────────────────────────────────────────────────────────────────── */
const RecentActivity: React.FC = () => (
  <CardShell
    title="Recent Activity"
    trailing={<button type="button" className="text-[11.5px] font-extrabold inline-flex items-center gap-0.5" style={{ color: COPPER }}>View Full Activity <ChevronRight className="w-3.5 h-3.5" /></button>}
  >
    <ul className="space-y-2">
      {RECENT_ACTIVITY.map((a) => {
        const Icon = a.icon;
        return (
          <li key={a.title} className="flex items-center gap-3 px-1 py-1.5">
            <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: a.tint }}>
              <Icon className="w-4 h-4" style={{ color: a.ink }} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-extrabold leading-tight" style={{ color: NAVY }}>{a.title}</p>
              <p className="text-[11px] leading-tight truncate" style={{ color: TEXT_MUTED }}>{a.body}</p>
            </div>
            <p className="text-[10.5px] font-bold shrink-0" style={{ color: TEXT_MUTED }}>{a.meta}</p>
          </li>
        );
      })}
    </ul>
  </CardShell>
);

const TeacherMessages: React.FC = () => (
  <CardShell
    title="Teacher Messages"
    trailing={<button type="button" className="text-[11.5px] font-extrabold" style={{ color: COPPER }}>View All</button>}
  >
    <ul className="space-y-3">
      {TEACHER_MESSAGES.map((m) => (
        <li key={m.name} className="flex items-start gap-3">
          <img src={`https://i.pravatar.cc/80?img=${m.imgSeed}`} alt={m.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-[12.5px] font-extrabold leading-tight truncate" style={{ color: NAVY }}>{m.name}</p>
              <span className="ml-auto text-[10.5px] font-bold" style={{ color: TEXT_MUTED }}>{m.meta}</span>
            </div>
            <p className="text-[11px] font-bold" style={{ color: TEXT_MUTED }}>{m.role}</p>
            <p className="text-[12px] mt-0.5 leading-tight" style={{ color: NAVY }}>{m.body}</p>
          </div>
          {m.unread > 0 && (
            <span className="w-5 h-5 rounded-full text-white text-[10px] font-extrabold flex items-center justify-center shrink-0" style={{ backgroundColor: BLUE }}>{m.unread}</span>
          )}
        </li>
      ))}
    </ul>
  </CardShell>
);

/* ──────────────────────────────────────────────────────────────────────
   RIGHT RAIL: Weekly Summary · Alerts · Quick Actions · Help
   ──────────────────────────────────────────────────────────────────── */
const WeeklySummary: React.FC = () => (
  <section className="rounded-2xl border overflow-hidden p-5" style={{ borderColor: '#F1E0BC', background: 'linear-gradient(135deg, #FEF6E5 0%, #FFFBF1 100%)' }}>
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4" style={{ color: COPPER }} />
        <h3 className="text-[15px] font-extrabold" style={{ color: NAVY }}>Weekly Summary</h3>
      </div>
      <button type="button" className="inline-flex items-center gap-1.5 rounded-full bg-white border px-3 py-1.5 text-[11px] font-extrabold" style={{ borderColor: '#F1E0BC', color: '#1B7B49' }}>
        <span className="w-4 h-4 rounded-full bg-[#25D366] flex items-center justify-center">
          <MessageCircle className="w-2.5 h-2.5 text-white" />
        </span>
        Share on WhatsApp
      </button>
    </div>
    <p className="text-[12.5px] leading-relaxed" style={{ color: NAVY }}>
      David is showing great improvement in <b>Mathematics</b> and <b>Science</b>.
    </p>
    <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: NAVY }}>
      He&apos;s active in class, completing assignments on time, but needs more practice in <b>Trigonometry</b> and <b>Essay Writing</b>.
    </p>

    <div className="mt-4 flex justify-center">
      <BotIllustration />
    </div>

    <button type="button" className="mt-4 w-full rounded-xl bg-white border py-2.5 text-[12.5px] font-extrabold inline-flex items-center justify-center gap-1.5" style={{ color: NAVY, borderColor: '#F1E0BC' }}>
      View Full Summary <ChevronRight className="w-3.5 h-3.5" />
    </button>
  </section>
);

const BotIllustration: React.FC = () => (
  <svg viewBox="0 0 120 100" className="w-[120px] h-[100px]" aria-hidden>
    <defs>
      <linearGradient id="botBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#9CC0F4" />
        <stop offset="100%" stopColor="#5B86C7" />
      </linearGradient>
    </defs>
    {/* Antenna */}
    <line x1="60" y1="14" x2="60" y2="22" stroke="#5B86C7" strokeWidth="1.5" />
    <circle cx="60" cy="12" r="2.5" fill="#F4B860" />
    {/* Head */}
    <rect x="36" y="22" width="48" height="38" rx="10" fill="url(#botBody)" />
    {/* Eyes */}
    <ellipse cx="50" cy="40" rx="6" ry="7" fill="white" />
    <circle cx="50" cy="42" r="3" fill="#0B1F3A" />
    <ellipse cx="70" cy="40" rx="6" ry="7" fill="white" />
    <circle cx="70" cy="42" r="3" fill="#0B1F3A" />
    {/* Headphones */}
    <path d="M30 30 Q30 18, 60 18 Q90 18, 90 30" stroke="#5B86C7" strokeWidth="2" fill="none" />
    <rect x="26" y="28" width="6" height="14" rx="2" fill="#5B86C7" />
    <rect x="88" y="28" width="6" height="14" rx="2" fill="#5B86C7" />
    {/* Smile */}
    <path d="M52 52 Q60 56, 68 52" stroke="#0B1F3A" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    {/* Body/Neck */}
    <rect x="48" y="60" width="24" height="14" rx="3" fill="url(#botBody)" />
    {/* Arms (chair-like base lines) */}
    <line x1="34" y1="78" x2="86" y2="78" stroke="#94B3D6" strokeWidth="1" opacity="0.6" />
  </svg>
);

const AlertsReminders: React.FC = () => (
  <CardShell
    title="Alerts & Reminders"
    trailing={<button type="button" className="text-[11.5px] font-extrabold" style={{ color: COPPER }}>View All</button>}
  >
    <ul className="space-y-2">
      {ALERTS.map((a) => {
        const Icon = a.icon;
        return (
          <li key={a.title} className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer" style={{ backgroundColor: a.tint }}>
            <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-white">
              <Icon className="w-4 h-4" style={{ color: a.ink }} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-extrabold leading-tight" style={{ color: NAVY }}>{a.title}</p>
              <p className="text-[11px] leading-tight" style={{ color: TEXT_MUTED }}>{a.body}</p>
            </div>
            <ChevronRight className="w-4 h-4 shrink-0" style={{ color: TEXT_MUTED }} />
          </li>
        );
      })}
    </ul>
  </CardShell>
);

const QuickActions: React.FC = () => (
  <CardShell title="Quick Actions">
    <div className="grid grid-cols-3 gap-2">
      {QUICK_ACTIONS.map(({ label, icon: Icon, tint, ink }) => (
        <button key={label} type="button" className="rounded-xl border bg-white p-3 flex flex-col items-center gap-2 hover:shadow-md transition-shadow" style={{ borderColor: BORDER }}>
          <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: tint }}>
            <Icon className="w-4 h-4" style={{ color: ink }} />
          </span>
          <span className="text-[10.5px] font-extrabold text-center leading-tight" style={{ color: NAVY }}>{label}</span>
        </button>
      ))}
    </div>
  </CardShell>
);

const NeedHelp: React.FC = () => (
  <section className="rounded-2xl border flex items-center gap-3 px-4 py-3" style={{ borderColor: '#DBEAFE', backgroundColor: '#F0F6FF' }}>
    <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'white' }}>
      <Headphones className="w-4 h-4" style={{ color: BLUE }} />
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-[12.5px] font-extrabold leading-tight" style={{ color: NAVY }}>Need help?</p>
      <p className="text-[11px] font-semibold leading-tight" style={{ color: TEXT_MUTED }}>Chat with our support team</p>
    </div>
    <button type="button" className="rounded-md bg-white border text-[11px] font-extrabold px-3 py-1.5 shrink-0" style={{ color: NAVY, borderColor: BORDER }}>
      Start Chat
    </button>
  </section>
);
