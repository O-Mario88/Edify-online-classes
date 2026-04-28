import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  // Sidebar
  LayoutDashboard, Activity, Users, Building2, GraduationCap, BookOpen,
  Wallet, Video, FileCheck2, Inbox, MessageSquareText, Crown,
  BarChart3, ShieldAlert, BookMarked, Sparkles, FileText,
  Bell, Smartphone, Megaphone, Settings, Cog,
  // Top bar
  Search, Plus, MessageSquare, ChevronDown, ChevronRight, ShieldCheck,
  // Cards
  HeartPulse, School, Tv2, Receipt,
  AlertTriangle, AlertCircle, CreditCard, Wrench,
  ListChecks, FilePlus2,
  Send, Megaphone as MegaphoneIcon, RefreshCw, FileBarChart2, UserPlus, BookOpenCheck,
  Globe2,
  TrendingUp, ArrowUpRight, Download as DownloadIcon,
} from 'lucide-react';

/* ──────────────────────────────────────────────────────────────────────
   DESIGN TOKENS — matched to the Maple OS Institution dashboard reference
   ──────────────────────────────────────────────────────────────────── */
const NAVY_DARK = '#071A33';
const NAVY = '#0B1F3A';
const NAVY_MED = '#102A43';
const COPPER = '#C47A45';
const COPPER_LIGHT = '#F4B860';
const GOLD = '#FFD166';
const SUCCESS = '#12B76A';
const DANGER = '#EF4444';
const PURPLE = '#6D5DFB';
const TEXT_MUTED = '#64748B';
const BORDER = '#E6EAF2';

/* ──────────────────────────────────────────────────────────────────────
   STATIC DEMO DATA
   ──────────────────────────────────────────────────────────────────── */
const KPI_CARDS = [
  {
    label: 'Platform Health Score',
    value: '94', suffix: '/100', tag: 'Excellent',
    delta: '↑ 4 pts from last week',
    icon: HeartPulse, iconBg: '#E7F8EE', iconInk: '#12B76A',
    spark: 'green' as const,
  },
  {
    label: 'Active Learners',
    value: '24,860',
    delta: '↑ 1,248 this month',
    icon: Users, iconBg: '#EEEAFE', iconInk: '#6D5DFB',
    spark: 'purple' as const,
  },
  {
    label: 'Active Institutions',
    value: '186',
    delta: '14 new this term',
    icon: School, iconBg: '#FEF3E7', iconInk: '#C47A45',
    spark: 'copper' as const,
  },
  {
    label: 'Teacher Delivery',
    value: '91%',
    delta: '↑ 6% from last month',
    icon: GraduationCap, iconBg: '#E6F1FE', iconInk: '#2A66C1',
    spark: 'blue' as const,
  },
  {
    label: 'Revenue Collected',
    value: 'UGX 428M',
    delta: '82% of term target',
    icon: Wallet, iconBg: '#FDECEC', iconInk: '#EF4444',
    progress: 82,
  },
  {
    label: 'Live Sessions Today',
    value: '342',
    delta: '51 live now',
    icon: Tv2, iconBg: '#E7F8EE', iconInk: '#12B76A',
    spark: 'green' as const,
  },
];

const HEALTH_BREAKDOWN = [
  { label: 'System Uptime',     value: 99, ink: '#12B76A' },
  { label: 'Payment Success',   value: 96, ink: '#12B76A' },
  { label: 'Live Delivery',     value: 91, ink: '#12B76A' },
  { label: 'Content Quality',   value: 88, ink: '#F59E0B' },
  { label: 'Parent Engagement', value: 79, ink: '#F59E0B' },
  { label: 'Teacher Response',  value: 84, ink: '#F59E0B' },
];

const CRITICAL_ALERTS = [
  { title: '18 students at high academic risk',  body: 'Immediate attention required', icon: AlertTriangle, tint: '#FDECEC', ink: '#EF4444' },
  { title: '7 institutions behind on payments',  body: 'Follow up required',           icon: CreditCard,   tint: '#FFF6E0', ink: '#F59E0B' },
  { title: '12 teachers pending verification',   body: 'Review documents',             icon: FileCheck2,   tint: '#EEEAFE', ink: '#6D5DFB' },
  { title: 'Payment webhook delays detected',    body: 'Pesapal sync needs review',    icon: Wrench,       tint: '#FFF6E0', ink: '#F59E0B' },
  { title: '42 feedback tickets unresolved',     body: 'Support team action needed',   icon: AlertCircle,  tint: '#F1F5F9', ink: '#64748B' },
];

const TASKS = [
  { title: 'Review upgrade requests',         meta: '34 pending',         icon: ListChecks,  tint: '#EEEAFE', ink: '#6D5DFB' },
  { title: 'Approve teacher payouts',         meta: 'UGX 18.6M queued',   icon: Wallet,      tint: '#E7F8EE', ink: '#12B76A' },
  { title: 'Moderate reported forum posts',   meta: '12 flagged',         icon: AlertCircle, tint: '#FDECEC', ink: '#EF4444' },
  { title: 'Verify institution applications', meta: '9 pending',          icon: Building2,   tint: '#FEF3E7', ink: '#C47A45' },
  { title: 'Publish curriculum update',       meta: 'Term 2 draft',       icon: BookOpen,    tint: '#E6F1FE', ink: '#2A66C1' },
];

const QUICK_ACTIONS = [
  { label: 'Add Institution', icon: Building2,     tint: '#FEF3E7', ink: '#C47A45' },
  { label: 'Verify Teacher',  icon: UserPlus,      tint: '#E7F8EE', ink: '#12B76A' },
  { label: 'Publish Notice',  icon: MegaphoneIcon, tint: '#FDECEC', ink: '#EF4444' },
  { label: 'Sync Data',       icon: RefreshCw,     tint: '#EEEAFE', ink: '#6D5DFB' },
  { label: 'Review Payments', icon: Receipt,       tint: '#FFF6E0', ink: '#F59E0B' },
  { label: 'Generate Report', icon: FileBarChart2, tint: '#E6F1FE', ink: '#2A66C1' },
];

const COUNTRY_PERFORMANCE = [
  { name: 'Uganda', flag: '🇺🇬', learners: '18,420', institutions: '126',     activity: 92 },
  { name: 'Kenya',  flag: '🇰🇪', learners: '5,870',  institutions: '54',      activity: 88 },
  { name: 'Rwanda', flag: '🇷🇼', learners: '570',    institutions: '6 pilot', activity: 74 },
];

const LIVE_OPS_LIST = [
  { title: 'Mathematics S4',             meta: 'Live · 86 viewers',   tone: 'success' as const },
  { title: 'P7 Science',                 meta: 'Starts in 12 min',    tone: 'warn' as const },
  { title: 'Teacher onboarding webinar', meta: 'Live · 142 viewers',  tone: 'success' as const },
  { title: 'Chemistry replay sync',      meta: 'Provisioning issue',  tone: 'danger' as const },
];

const CURRICULUM_COVERAGE = [
  { label: 'Primary',   value: 86, ink: '#12B76A' },
  { label: 'Secondary', value: 92, ink: '#12B76A' },
  { label: 'Exam Prep', value: 79, ink: '#F59E0B' },
];

const RECENT_ACTIVITY = [
  { title: 'New institution registered',         body: 'Bright Future Academy', meta: '4 minutes ago',  icon: Building2,    tint: '#FEF3E7', ink: '#C47A45' },
  { title: 'Teacher payout approved',            body: 'UGX 450,000',           meta: '18 minutes ago', icon: Wallet,       tint: '#E7F8EE', ink: '#12B76A' },
  { title: '1,204 learners completed lessons',   body: 'Across 38 institutions', meta: '36 minutes ago', icon: BookOpenCheck, tint: '#EEEAFE', ink: '#6D5DFB' },
  { title: 'New content uploaded',               body: 'Biology S4 — Genetics', meta: '1 hour ago',     icon: BookOpen,     tint: '#E6F1FE', ink: '#2A66C1' },
  { title: 'Pesapal IPN processed successfully', body: 'Webhook 200 OK · 78ms', meta: '2 hours ago',    icon: ShieldCheck,  tint: '#E7F8EE', ink: '#12B76A' },
  { title: 'Admin exported weekly report',       body: 'platform-week-19.xlsx', meta: '3 hours ago',    icon: DownloadIcon, tint: '#F1F5F9', ink: '#64748B' },
];

type NavItem = { label: string; icon: React.ComponentType<{ className?: string }>; badge?: string; active?: boolean };
const SIDEBAR: { label: string; items: NavItem[] }[] = [
  {
    label: 'MAIN',
    items: [
      { label: 'Dashboard',       icon: LayoutDashboard, active: true },
      { label: 'Platform Health', icon: Activity },
      { label: 'Users',           icon: Users },
      { label: 'Institutions',    icon: Building2,    badge: '186' },
      { label: 'Teachers',        icon: GraduationCap },
      { label: 'Students',        icon: Users },
      { label: 'Content Library', icon: BookOpen },
    ],
  },
  {
    label: 'OPERATIONS',
    items: [
      { label: 'Payments & Payouts', icon: Wallet,           badge: '34' },
      { label: 'Live Sessions',      icon: Video,            badge: '51' },
      { label: 'Admissions',         icon: FileCheck2 },
      { label: 'Support Inbox',      icon: Inbox,            badge: '42' },
      { label: 'Feedback Inbox',     icon: MessageSquareText },
      { label: 'Upgrade Requests',   icon: Crown,            badge: '34' },
    ],
  },
  {
    label: 'INTELLIGENCE',
    items: [
      { label: 'Analytics & Reports', icon: BarChart3 },
      { label: 'Risk Monitor',        icon: ShieldAlert,  badge: '21' },
      { label: 'Curriculum Health',   icon: BookMarked },
      { label: 'AI Jobs',             icon: Sparkles },
      { label: 'System Logs',         icon: FileText },
    ],
  },
  {
    label: 'COMMUNICATION',
    items: [
      { label: 'Notifications',  icon: Bell,        badge: '23' },
      { label: 'WhatsApp / SMS', icon: Smartphone },
      { label: 'Announcements',  icon: Megaphone },
      { label: 'Settings',       icon: Settings },
    ],
  },
];

/* ──────────────────────────────────────────────────────────────────────
   PAGE
   ──────────────────────────────────────────────────────────────────── */
export const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex">
      <AdminSidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <AdminTopBar />

        <main className="flex-1 px-6 lg:px-10 xl:px-12 py-7 lg:py-9 space-y-6 max-w-[1480px] w-full mx-auto">
          {/* Greeting */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h1 className="text-[28px] lg:text-[30px] font-extrabold tracking-tight" style={{ color: NAVY }}>
                Good morning, Admin <span aria-hidden>👋</span>
              </h1>
              <p className="mt-1 text-[14px]" style={{ color: TEXT_MUTED }}>
                Here&apos;s what&apos;s happening across Maple Online School today.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button type="button" className="inline-flex items-center gap-2 rounded-full text-white px-4 h-10 text-[12.5px] font-extrabold shadow-md" style={{ backgroundColor: NAVY }}>
                View Platform Report <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <button type="button" className="inline-flex items-center gap-2 rounded-full bg-white border px-4 h-10 text-[12.5px] font-extrabold" style={{ color: NAVY, borderColor: BORDER }}>
                <DownloadIcon className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>
          </div>

          <KpiStrip />

          <div className="grid xl:grid-cols-[1fr,360px] gap-6">
            <PlatformHealthOverview />
            <div className="space-y-6 min-w-0">
              <CriticalAlerts />
              <TasksApprovals />
              <QuickActions />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <CountryPerformance />
            <RevenuePayments />
            <LiveLearningOps />
            <CurriculumContentHealth />
            <InstitutionRiskOverview />
            <RecentActivity />
          </div>

          <CommandCenterCTA />
        </main>

        <DashboardFooter />
      </div>
    </div>
  );
};

export default AdminDashboard;

/* ──────────────────────────────────────────────────────────────────────
   FOOTER
   ──────────────────────────────────────────────────────────────────── */
const DashboardFooter: React.FC = () => (
  <footer className="border-t bg-white" style={{ borderColor: BORDER }}>
    <div className="px-6 lg:px-10 xl:px-12 py-5 max-w-[1480px] w-full mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${COPPER}1A` }}>
          <ShieldCheck className="w-3.5 h-3.5" style={{ color: COPPER }} />
        </span>
        <p className="text-[12px] font-bold" style={{ color: NAVY }}>Maple OS</p>
        <span className="text-[11px]" style={{ color: TEXT_MUTED }}>· Platform Admin · v2.4.1</span>
      </div>
      <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] font-bold" style={{ color: TEXT_MUTED }}>
        <Link to="/support" className="hover:text-[#0B1F3A]">Help &amp; Support</Link>
        <Link to="/feedback" className="hover:text-[#0B1F3A]">Send Feedback</Link>
        <span className="hover:text-[#0B1F3A] cursor-pointer">API Status</span>
        <span className="hover:text-[#0B1F3A] cursor-pointer">Privacy</span>
        <span className="hover:text-[#0B1F3A] cursor-pointer">Terms</span>
      </nav>
      <p className="text-[11px]" style={{ color: TEXT_MUTED }}>&copy; 2026 Maple Online School. All rights reserved.</p>
    </div>
  </footer>
);

/* ──────────────────────────────────────────────────────────────────────
   SIDEBAR
   ──────────────────────────────────────────────────────────────────── */
const AdminSidebar: React.FC = () => (
  <aside
    className="hidden lg:flex flex-col w-[280px] shrink-0 sticky top-0 h-screen text-white"
    style={{ background: `linear-gradient(180deg, ${NAVY_DARK} 0%, ${NAVY} 100%)` }}
  >
    {/* Brand */}
    <div className="px-6 pt-6 pb-4 flex items-center gap-3">
      <MapleLeafIcon className="w-9 h-9" />
      <div className="leading-tight">
        <p className="text-[20px] font-extrabold tracking-tight">Maple OS</p>
        <p className="mt-0.5 text-[10px] font-bold tracking-[0.28em]" style={{ color: COPPER_LIGHT }}>PLATFORM ADMIN</p>
      </div>
    </div>

    {/* Scope card */}
    <div className="mx-4 mb-2 rounded-xl bg-white/[0.04] ring-1 ring-white/10 px-3 py-2.5 flex items-center gap-2.5">
      <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${COPPER}33` }}>
        <ShieldCheck className="w-4 h-4" style={{ color: COPPER_LIGHT }} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-extrabold leading-tight">Maple Command Center</p>
        <p className="text-[10.5px] text-slate-300 leading-tight">Uganda • Kenya • Rwanda</p>
      </div>
      <ChevronDown className="w-4 h-4 text-slate-300" />
    </div>

    {/* Nav */}
    <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
      {SIDEBAR.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-1.5 text-[10px] font-bold tracking-[0.22em] text-slate-400">{group.label}</p>
          <div className="space-y-0.5">
            {group.items.map((it) => <NavRow key={it.label} item={it} />)}
          </div>
        </div>
      ))}
    </nav>

    {/* Profile / status */}
    <div className="p-3 mt-auto space-y-3">
      <div className="rounded-xl bg-white/[0.04] ring-1 ring-white/10 px-3 py-2.5 flex items-center gap-2.5">
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C47A45] to-[#8B4F26] flex items-center justify-center text-white text-[13px] font-extrabold">A</div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 bg-[#12B76A]" style={{ borderColor: NAVY }} />
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-[12.5px] font-extrabold">Platform Admin</p>
          <p className="text-[10.5px] text-slate-300">Maple HQ</p>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-300" />
      </div>

      <div className="rounded-xl bg-white/[0.04] ring-1 ring-white/10 px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SUCCESS, boxShadow: `0 0 0 4px ${SUCCESS}33` }} />
          <p className="text-[12px] font-extrabold">System Status</p>
        </div>
        <p className="mt-1 text-[10.5px] text-slate-300">All services operational</p>
      </div>

      <button type="button" className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white/[0.04] ring-1 ring-white/10 hover:bg-white/[0.08] transition-colors py-2.5 text-[12.5px] font-extrabold">
        <Cog className="w-4 h-4" /> Settings
      </button>
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
      {item.badge && (
        <span
          className={[
            'rounded-full px-1.5 py-0.5 text-[10px] font-extrabold',
            active ? 'bg-white/25 text-white' : 'bg-white/10 text-slate-200',
          ].join(' ')}
        >
          {item.badge}
        </span>
      )}
    </button>
  );
};

const MapleLeafIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 40 40" className={className} aria-hidden>
    <defs>
      <linearGradient id="mapleAdmin" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFD166" />
        <stop offset="100%" stopColor="#C47A45" />
      </linearGradient>
    </defs>
    <path
      d="M20 4 L23 13 L33 11 L29 19 L36 24 L26 25 L27 33 L20 28 L13 33 L14 25 L4 24 L11 19 L7 11 L17 13 Z"
      fill="url(#mapleAdmin)"
      stroke="#8B4F26"
      strokeWidth="0.6"
    />
    <line x1="20" y1="28" x2="20" y2="36" stroke="#8B4F26" strokeWidth="1.5" />
  </svg>
);

/* ──────────────────────────────────────────────────────────────────────
   TOP BAR
   ──────────────────────────────────────────────────────────────────── */
const AdminTopBar: React.FC = () => {
  const [search, setSearch] = useState('');
  return (
    <header className="sticky top-0 z-30 bg-white border-b" style={{ borderColor: BORDER }}>
      <div className="px-6 lg:px-10 xl:px-12 h-[72px] max-w-[1480px] w-full mx-auto flex items-center gap-4">
        <button type="button" className="hidden md:flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-slate-50 shrink-0">
          <span className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${COPPER}1A` }}>
            <ShieldCheck className="w-4 h-4" style={{ color: COPPER }} />
          </span>
          <div className="text-left leading-tight">
            <p className="text-[13.5px] font-extrabold" style={{ color: NAVY }}>Maple Command Center</p>
            <p className="text-[11px]" style={{ color: TEXT_MUTED }}>Uganda • Kenya • Rwanda</p>
          </div>
          <ChevronDown className="w-4 h-4" style={{ color: TEXT_MUTED }} />
        </button>

        <div className="relative flex-1 max-w-[640px]">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: TEXT_MUTED }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users, schools, payments, content, logs..."
            className="w-full bg-white border rounded-full py-2.5 pl-11 pr-16 text-[13px] outline-none placeholder:text-slate-400 focus:border-[#C47A45] focus:ring-2 focus:ring-[#C47A45]/20 transition-all shadow-sm"
            style={{ borderColor: BORDER, color: NAVY }}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10.5px] font-bold rounded-md border px-1.5 py-0.5" style={{ borderColor: BORDER, color: TEXT_MUTED }}>⌘ K</span>
        </div>

        <div className="flex items-center gap-2 ml-auto shrink-0">
          <button type="button" className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white border px-3 h-9 text-[12.5px] font-extrabold hover:bg-slate-50" style={{ borderColor: BORDER, color: NAVY }}>
            <Plus className="w-4 h-4" /> Quick Add
          </button>
          <IconButton ariaLabel="Notifications" badge={23}>
            <Bell className="w-5 h-5" />
          </IconButton>
          <IconButton ariaLabel="Messages">
            <MessageSquare className="w-5 h-5" />
          </IconButton>
          <button type="button" className="inline-flex items-center gap-2 rounded-full bg-white border px-3 h-10 text-[12.5px] font-extrabold hover:bg-slate-50" style={{ borderColor: BORDER, color: NAVY }}>
            Term 2, 2025 <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

const IconButton: React.FC<React.PropsWithChildren<{ ariaLabel: string; badge?: number }>> = ({ ariaLabel, badge, children }) => (
  <button type="button" aria-label={ariaLabel} className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-50" style={{ color: NAVY }}>
    {children}
    {typeof badge === 'number' && (
      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-extrabold flex items-center justify-center" style={{ backgroundColor: DANGER }}>
        {badge}
      </span>
    )}
  </button>
);

/* ──────────────────────────────────────────────────────────────────────
   KPI STRIP
   ──────────────────────────────────────────────────────────────────── */
const KpiStrip: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
    {KPI_CARDS.map((c) => {
      const Icon = c.icon;
      return (
        <article key={c.label} className="rounded-2xl bg-white border p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)]" style={{ borderColor: BORDER }}>
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: c.iconBg }}>
              <Icon className="w-4 h-4" style={{ color: c.iconInk }} />
            </span>
            <p className="text-[12.5px] font-bold" style={{ color: TEXT_MUTED }}>{c.label}</p>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <p className="text-[26px] font-extrabold tracking-tight leading-none" style={{ color: NAVY }}>{c.value}</p>
            {c.suffix && <span className="text-[14px] font-extrabold" style={{ color: TEXT_MUTED }}>{c.suffix}</span>}
            {c.tag && (
              <span className="ml-auto inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold" style={{ backgroundColor: '#E7F8EE', color: '#067647' }}>
                {c.tag}
              </span>
            )}
          </div>
          {c.delta && <p className="mt-1 text-[11px] font-bold" style={{ color: SUCCESS }}>{c.delta}</p>}
          <div className="mt-3 h-8">
            {typeof c.progress === 'number' ? (
              <progress
                value={c.progress}
                max={100}
                className="block w-full h-2 rounded-full overflow-hidden appearance-none [&::-webkit-progress-bar]:bg-[#FDECEC] [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:bg-[#EF4444] [&::-webkit-progress-value]:rounded-full [&::-moz-progress-bar]:bg-[#EF4444]"
              />
            ) : (
              <Sparkline tone={c.spark!} />
            )}
          </div>
        </article>
      );
    })}
  </div>
);

const Sparkline: React.FC<{ tone: 'green' | 'purple' | 'copper' | 'blue' }> = ({ tone }) => {
  const colours: Record<string, { stroke: string; fill: string }> = {
    green:  { stroke: '#12B76A', fill: 'rgba(18,183,106,0.15)' },
    purple: { stroke: '#6D5DFB', fill: 'rgba(109,93,251,0.15)' },
    copper: { stroke: '#C47A45', fill: 'rgba(196,122,69,0.15)' },
    blue:   { stroke: '#2A66C1', fill: 'rgba(42,102,193,0.15)' },
  };
  const c = colours[tone];
  const ys = [26, 22, 24, 16, 18, 10, 14, 6];
  return (
    <svg viewBox="0 0 120 32" preserveAspectRatio="none" className="w-full h-8" aria-hidden>
      <path d="M0 26 L18 22 L34 24 L52 16 L70 18 L88 10 L106 14 L120 6 L120 32 L0 32 Z" fill={c.fill} />
      <path d="M0 26 L18 22 L34 24 L52 16 L70 18 L88 10 L106 14 L120 6" stroke={c.stroke} strokeWidth="1.6" fill="none" />
      {[0, 18, 34, 52, 70, 88, 106, 120].map((x, i) => (
        <circle key={i} cx={x} cy={ys[i]} r="1.6" fill={c.stroke} />
      ))}
    </svg>
  );
};

/* ──────────────────────────────────────────────────────────────────────
   PLATFORM HEALTH OVERVIEW
   ──────────────────────────────────────────────────────────────────── */
const PlatformHealthOverview: React.FC = () => (
  <section className="rounded-2xl bg-white border p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)]" style={{ borderColor: BORDER }}>
    <div className="flex items-center justify-between mb-5">
      <div>
        <h2 className="text-[18px] font-extrabold tracking-tight" style={{ color: NAVY }}>Platform Health Overview</h2>
        <p className="text-[12px]" style={{ color: TEXT_MUTED }}>Live signal across infrastructure, delivery, and engagement.</p>
      </div>
      <button type="button" className="inline-flex items-center gap-1 text-[12px] font-extrabold" style={{ color: COPPER }}>
        View full report <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>

    <div className="grid lg:grid-cols-[200px,1fr,200px] gap-6 items-center">
      <div className="flex flex-col items-center">
        <ScoreDonut value={94} />
        <p className="mt-3 text-[13px] font-extrabold" style={{ color: NAVY }}>Excellent Health</p>
        <span className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-extrabold" style={{ backgroundColor: '#E7F8EE', color: '#067647' }}>
          <TrendingUp className="w-3 h-3" /> 4 points from last week
        </span>
      </div>

      <div className="space-y-3">
        {HEALTH_BREAKDOWN.map((b) => (
          <div key={b.label}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[12.5px] font-bold" style={{ color: NAVY }}>{b.label}</p>
              <p className="text-[12.5px] font-extrabold" style={{ color: b.ink }}>{b.value}%</p>
            </div>
            <progress
              value={b.value}
              max={100}
              className="block w-full h-1.5 rounded-full overflow-hidden appearance-none [&::-webkit-progress-bar]:bg-slate-100 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:rounded-full [&::-moz-progress-bar]:rounded-full"
              style={{ accentColor: b.ink }}
            />
          </div>
        ))}
      </div>

      <div className="hidden lg:block">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: TEXT_MUTED }}>Health Trend</p>
        <p className="mt-1 text-[12px]" style={{ color: TEXT_MUTED }}>Last 6 months</p>
        <div className="mt-3 rounded-xl bg-[#F8FAFC] p-3">
          <Sparkline tone="green" />
          <p className="mt-2 text-[11px] font-extrabold" style={{ color: SUCCESS }}>+12 pts trend</p>
        </div>
        <button type="button" className="mt-3 inline-flex items-center gap-1 text-[12px] font-extrabold" style={{ color: COPPER }}>
          View Full Analysis <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </section>
);

const ScoreDonut: React.FC<{ value: number }> = ({ value }) => {
  const r = 56;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <svg viewBox="0 0 140 140" className="w-[150px] h-[150px]" aria-hidden>
      <circle cx="70" cy="70" r={r} fill="none" stroke="#EAF6EE" strokeWidth="14" />
      <circle
        cx="70" cy="70" r={r}
        fill="none"
        stroke={SUCCESS}
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={off}
        transform="rotate(-90 70 70)"
      />
      <text x="70" y="74" textAnchor="middle" fontSize="32" fontWeight="800" fill={NAVY}>{value}</text>
      <text x="70" y="92" textAnchor="middle" fontSize="10" fontWeight="700" fill={TEXT_MUTED}>/ 100</text>
    </svg>
  );
};

/* ──────────────────────────────────────────────────────────────────────
   CRITICAL ALERTS · TASKS · QUICK ACTIONS
   ──────────────────────────────────────────────────────────────────── */
const CardShell: React.FC<React.PropsWithChildren<{ title: string; trailing?: React.ReactNode; subtle?: string }>> = ({ title, trailing, subtle, children }) => (
  <section className="rounded-2xl bg-white border p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)]" style={{ borderColor: BORDER }}>
    <div className="flex items-center justify-between mb-3">
      <div>
        <h3 className="text-[15px] font-extrabold tracking-tight" style={{ color: NAVY }}>{title}</h3>
        {subtle && <p className="text-[11px]" style={{ color: TEXT_MUTED }}>{subtle}</p>}
      </div>
      {trailing}
    </div>
    {children}
  </section>
);

const CriticalAlerts: React.FC = () => (
  <CardShell
    title="Critical Alerts"
    trailing={<button type="button" className="text-[11.5px] font-extrabold inline-flex items-center gap-0.5" style={{ color: COPPER }}>View all (5) <ChevronRight className="w-3.5 h-3.5" /></button>}
  >
    <ul className="space-y-2">
      {CRITICAL_ALERTS.map((a) => {
        const Icon = a.icon;
        return (
          <li key={a.title} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50 cursor-pointer">
            <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: a.tint }}>
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

const TasksApprovals: React.FC = () => (
  <CardShell
    title="Tasks & Approvals"
    trailing={<button type="button" className="text-[11.5px] font-extrabold inline-flex items-center gap-0.5" style={{ color: COPPER }}>View all (18) <ChevronRight className="w-3.5 h-3.5" /></button>}
  >
    <ul className="space-y-2">
      {TASKS.map((t) => {
        const Icon = t.icon;
        return (
          <li key={t.title} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50 cursor-pointer">
            <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: t.tint }}>
              <Icon className="w-4 h-4" style={{ color: t.ink }} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-extrabold leading-tight" style={{ color: NAVY }}>{t.title}</p>
              <p className="text-[11px] leading-tight" style={{ color: TEXT_MUTED }}>{t.meta}</p>
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
    <div className="grid grid-cols-2 gap-2">
      {QUICK_ACTIONS.map(({ label, icon: Icon, tint, ink }) => (
        <button key={label} type="button" className="rounded-xl border bg-white p-3 flex flex-col items-center gap-2 hover:shadow-md transition-shadow" style={{ borderColor: BORDER }}>
          <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: tint }}>
            <Icon className="w-4 h-4" style={{ color: ink }} />
          </span>
          <span className="text-[11.5px] font-extrabold text-center leading-tight" style={{ color: NAVY }}>{label}</span>
        </button>
      ))}
    </div>
  </CardShell>
);

/* ──────────────────────────────────────────────────────────────────────
   COUNTRY · REVENUE · LIVE OPS · CURRICULUM · RISK · ACTIVITY
   ──────────────────────────────────────────────────────────────────── */
const CountryPerformance: React.FC = () => {
  const [active, setActive] = useState<'Uganda' | 'Kenya' | 'Rwanda'>('Uganda');
  const tabs = ['Uganda', 'Kenya', 'Rwanda'] as const;
  return (
    <CardShell
      title="Country Performance"
      subtle="Activity index across active markets"
      trailing={<Globe2 className="w-4 h-4" style={{ color: COPPER }} />}
    >
      <div className="flex items-center gap-1.5 mb-3">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            type="button"
            className="px-3 py-1.5 rounded-full text-[11.5px] font-extrabold transition-colors"
            style={active === t ? { backgroundColor: NAVY, color: 'white' } : { backgroundColor: '#F1F5F9', color: NAVY }}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {COUNTRY_PERFORMANCE.map((row) => (
          <div key={row.name} className="rounded-xl border p-3" style={{ borderColor: BORDER, backgroundColor: row.name === active ? '#FFF6E0' : 'white' }}>
            <div className="flex items-center gap-2">
              <span className="text-[18px]" aria-hidden>{row.flag}</span>
              <p className="text-[13px] font-extrabold" style={{ color: NAVY }}>{row.name}</p>
              <span className="ml-auto text-[11px] font-extrabold" style={{ color: SUCCESS }}>{row.activity}% activity</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
              <span style={{ color: TEXT_MUTED }}><span className="font-extrabold" style={{ color: NAVY }}>{row.learners}</span> learners</span>
              <span style={{ color: TEXT_MUTED }}><span className="font-extrabold" style={{ color: NAVY }}>{row.institutions}</span> institutions</span>
            </div>
            <progress
              value={row.activity}
              max={100}
              className="mt-2 block w-full h-1.5 rounded-full overflow-hidden appearance-none [&::-webkit-progress-bar]:bg-slate-100 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:bg-[#C47A45] [&::-webkit-progress-value]:rounded-full [&::-moz-progress-bar]:bg-[#C47A45]"
            />
          </div>
        ))}
      </div>
    </CardShell>
  );
};

const RevenuePayments: React.FC = () => (
  <CardShell title="Revenue & Payments" subtle="Term 2, 2025">
    <div className="grid grid-cols-[140px,1fr] gap-4 items-center">
      <RingSummary collected={428} target={520} />
      <ul className="text-[12.5px] space-y-2">
        <Legend dot="#12B76A" label="Collected"     value="UGX 428M" />
        <Legend dot="#EF4444" label="Outstanding"   value="UGX 64M" />
        <Legend dot="#F59E0B" label="Pending"       value="UGX 28M" />
        <Legend dot="#0F172A" label="Total Target"  value="UGX 520M" muted />
      </ul>
    </div>
    <button type="button" className="mt-4 inline-flex items-center gap-1 text-[12px] font-extrabold" style={{ color: COPPER }}>
      View financial report <ChevronRight className="w-3.5 h-3.5" />
    </button>
  </CardShell>
);

const RingSummary: React.FC<{ collected: number; target: number }> = ({ collected, target }) => {
  const r = 50;
  const c = 2 * Math.PI * r;
  const pct = collected / target;
  const off = c - pct * c;
  return (
    <svg viewBox="0 0 140 140" className="w-[140px] h-[140px]" aria-hidden>
      <circle cx="70" cy="70" r={r} fill="none" stroke="#FDECEC" strokeWidth="16" />
      <circle cx="70" cy="70" r={r} fill="none" stroke={SUCCESS} strokeWidth="16" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 70 70)" />
      <text x="70" y="68" textAnchor="middle" fontSize="11" fontWeight="700" fill={TEXT_MUTED}>UGX</text>
      <text x="70" y="86" textAnchor="middle" fontSize="22" fontWeight="800" fill={NAVY}>{collected}M</text>
      <text x="70" y="100" textAnchor="middle" fontSize="9" fontWeight="700" fill={TEXT_MUTED}>{Math.round(pct * 100)}% collected</text>
    </svg>
  );
};

const Legend: React.FC<{ dot: string; label: string; value: string; muted?: boolean }> = ({ dot, label, value, muted }) => (
  <li className="flex items-center gap-2">
    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dot }} />
    <span className="font-bold" style={{ color: muted ? TEXT_MUTED : NAVY }}>{label}</span>
    <span className="ml-auto font-extrabold" style={{ color: NAVY }}>{value}</span>
  </li>
);

const LiveLearningOps: React.FC = () => (
  <CardShell title="Live Learning Operations" subtle="Today">
    <div className="grid grid-cols-2 gap-2 mb-3">
      {[
        { value: 342, label: 'Scheduled', tint: '#E6F1FE', ink: '#2A66C1' },
        { value: 51,  label: 'Live now',  tint: '#E7F8EE', ink: '#12B76A' },
        { value: 286, label: 'Completed', tint: '#EEEAFE', ink: '#6D5DFB' },
        { value: 5,   label: 'Issues',    tint: '#FDECEC', ink: '#EF4444' },
      ].map((s) => (
        <div key={s.label} className="rounded-xl px-3 py-2.5" style={{ backgroundColor: s.tint }}>
          <p className="text-[20px] font-extrabold leading-none" style={{ color: s.ink }}>{s.value}</p>
          <p className="mt-1 text-[11px] font-bold" style={{ color: NAVY }}>{s.label}</p>
        </div>
      ))}
    </div>
    <ul className="space-y-1.5">
      {LIVE_OPS_LIST.map((l) => {
        const tone = l.tone === 'success' ? '#12B76A' : l.tone === 'warn' ? '#F59E0B' : '#EF4444';
        return (
          <li key={l.title} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tone }} />
            <p className="text-[12px] font-extrabold flex-1 truncate" style={{ color: NAVY }}>{l.title}</p>
            <p className="text-[10.5px] font-bold" style={{ color: TEXT_MUTED }}>{l.meta}</p>
          </li>
        );
      })}
    </ul>
  </CardShell>
);

const CurriculumContentHealth: React.FC = () => (
  <CardShell title="Curriculum & Content Health" trailing={<FilePlus2 className="w-4 h-4" style={{ color: COPPER }} />}>
    <div className="grid grid-cols-3 gap-2 mb-4">
      {[
        { value: '12,480', label: 'Published',      tint: '#E7F8EE', ink: '#12B76A' },
        { value: '214',    label: 'Pending review', tint: '#FFF6E0', ink: '#F59E0B' },
        { value: '18',     label: 'Flagged',        tint: '#FDECEC', ink: '#EF4444' },
      ].map((s) => (
        <div key={s.label} className="rounded-xl px-3 py-2.5 text-center" style={{ backgroundColor: s.tint }}>
          <p className="text-[18px] font-extrabold" style={{ color: s.ink }}>{s.value}</p>
          <p className="mt-1 text-[10.5px] font-bold" style={{ color: NAVY }}>{s.label}</p>
        </div>
      ))}
    </div>
    <div className="space-y-2.5">
      {CURRICULUM_COVERAGE.map((c) => (
        <div key={c.label}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-[12px] font-bold" style={{ color: NAVY }}>{c.label} coverage</p>
            <p className="text-[12px] font-extrabold" style={{ color: c.ink }}>{c.value}%</p>
          </div>
          <progress
            value={c.value}
            max={100}
            className="block w-full h-1.5 rounded-full overflow-hidden appearance-none [&::-webkit-progress-bar]:bg-slate-100 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:rounded-full [&::-moz-progress-bar]:rounded-full"
            style={{ accentColor: c.ink }}
          />
        </div>
      ))}
    </div>
  </CardShell>
);

const InstitutionRiskOverview: React.FC = () => {
  const total = 21 + 44 + 121;
  const segs = [
    { label: 'Healthy',     value: 121, ink: '#12B76A' },
    { label: 'Medium risk', value: 44,  ink: '#F59E0B' },
    { label: 'High risk',   value: 21,  ink: '#EF4444' },
  ];
  return (
    <CardShell title="Institution Risk Overview" subtle={`${total} institutions monitored`} trailing={<ShieldAlert className="w-4 h-4" style={{ color: COPPER }} />}>
      <div className="grid grid-cols-[120px,1fr] gap-4 items-center">
        <RiskRing segs={segs} total={total} />
        <ul className="space-y-1.5 text-[12px]">
          {segs.map((s) => (
            <li key={s.label} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.ink }} />
              <span className="font-bold" style={{ color: NAVY }}>{s.label}</span>
              <span className="ml-auto font-extrabold" style={{ color: NAVY }}>{s.value}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: TEXT_MUTED }}>Top risk factors</p>
      <ul className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1 text-[11.5px]" style={{ color: NAVY }}>
        <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" />Low parent engagement</li>
        <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />Poor attendance</li>
        <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" />Payment arrears</li>
        <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />Weak teacher delivery</li>
      </ul>
    </CardShell>
  );
};

const RiskRing: React.FC<{ segs: { label: string; value: number; ink: string }[]; total: number }> = ({ segs, total }) => {
  const r = 44;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <svg viewBox="0 0 120 120" className="w-[120px] h-[120px]" aria-hidden>
      <circle cx="60" cy="60" r={r} fill="none" stroke="#F1F5F9" strokeWidth="14" />
      {segs.map((s, i) => {
        const len = (s.value / total) * c;
        const dash = `${len} ${c - len}`;
        const off = -acc;
        acc += len;
        return (
          <circle
            key={i}
            cx="60" cy="60" r={r}
            fill="none"
            stroke={s.ink}
            strokeWidth="14"
            strokeDasharray={dash}
            strokeDashoffset={off}
            transform="rotate(-90 60 60)"
          />
        );
      })}
      <text x="60" y="58" textAnchor="middle" fontSize="20" fontWeight="800" fill={NAVY}>{total}</text>
      <text x="60" y="74" textAnchor="middle" fontSize="9" fontWeight="700" fill={TEXT_MUTED}>schools</text>
    </svg>
  );
};

const RecentActivity: React.FC = () => (
  <CardShell
    title="Recent Platform Activity"
    trailing={<button type="button" className="text-[11.5px] font-extrabold inline-flex items-center gap-0.5" style={{ color: COPPER }}>View all <ChevronRight className="w-3.5 h-3.5" /></button>}
  >
    <ul className="space-y-2">
      {RECENT_ACTIVITY.map((r) => {
        const Icon = r.icon;
        return (
          <li key={r.title} className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-slate-50">
            <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: r.tint }}>
              <Icon className="w-4 h-4" style={{ color: r.ink }} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-extrabold leading-tight truncate" style={{ color: NAVY }}>{r.title}</p>
              <p className="text-[11px] leading-tight" style={{ color: TEXT_MUTED }}>{r.body}</p>
            </div>
            <p className="text-[10.5px] font-bold shrink-0" style={{ color: TEXT_MUTED }}>{r.meta}</p>
          </li>
        );
      })}
    </ul>
  </CardShell>
);

/* ──────────────────────────────────────────────────────────────────────
   COMMAND CTA
   ──────────────────────────────────────────────────────────────────── */
const CommandCenterCTA: React.FC = () => (
  <section className="relative overflow-hidden rounded-2xl text-white p-7 lg:p-8" style={{ background: `linear-gradient(135deg, ${NAVY_DARK} 0%, ${NAVY_MED} 100%)` }}>
    <div aria-hidden className="absolute -top-24 -right-24 w-96 h-96 rounded-full" style={{ background: `radial-gradient(circle, ${COPPER}40, transparent 60%)` }} />
    <div aria-hidden className="absolute -bottom-32 -left-24 w-80 h-80 rounded-full" style={{ background: `radial-gradient(circle, ${PURPLE}33, transparent 60%)` }} />

    <svg aria-hidden className="absolute right-10 top-6 w-40 h-32 opacity-90 hidden md:block" viewBox="0 0 160 110">
      {[
        [10, 70, 16, 30], [34, 60, 16, 40], [58, 50, 16, 50], [82, 38, 16, 62], [106, 28, 16, 72], [130, 16, 16, 84],
      ].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill={`url(#barG${i})`} />
      ))}
      <defs>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <linearGradient key={i} id={`barG${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GOLD} />
            <stop offset="100%" stopColor={COPPER} />
          </linearGradient>
        ))}
      </defs>
    </svg>

    <div className="relative max-w-2xl">
      <p className="text-[10.5px] font-bold tracking-[0.28em]" style={{ color: COPPER_LIGHT }}>MAPLE COMMAND CENTER</p>
      <h3 className="mt-2 text-[26px] lg:text-[30px] font-extrabold tracking-tight">Run Maple with confidence.</h3>
      <p className="mt-2 text-[13.5px] text-slate-300 max-w-xl leading-relaxed">
        Monitor schools, learning, payments, live sessions, and risks from one premium command center.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" className="inline-flex items-center gap-2 rounded-full px-5 h-11 text-[13px] font-extrabold shadow-xl" style={{ background: `linear-gradient(180deg, ${GOLD} 0%, ${COPPER_LIGHT} 100%)`, color: NAVY }}>
          Open Command Center <ArrowUpRight className="w-4 h-4" />
        </button>
        <Link to="/dashboard/admin/intelligence" className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/15 ring-1 ring-white/15 px-5 h-11 text-[13px] font-bold backdrop-blur transition-colors">
          <Send className="w-4 h-4" /> Download Executive Report
        </Link>
      </div>
    </div>
  </section>
);
