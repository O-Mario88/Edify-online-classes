import React from 'react';
import { Link } from 'react-router-dom';
import {
  // Top nav
  Bell, ChevronDown, GraduationCap,
  // Hero mockup
  Send, UserCircle2, Settings as SettingsIcon, MoreHorizontal, Upload, FileText,
  // Stats
  Users, Sparkles, MessageSquare, Library as LibraryIcon, TrendingUp,
  // Process
  UserPlus, MessagesSquare, Share2, Trophy,
  // Roles
  GraduationCap as GradCap, Heart, School, Briefcase,
  // CTA
  ShieldCheck, ArrowRight,
  // Footer
  Facebook, Twitter, Instagram, Youtube,
  // Subjects
  Sigma, BookOpen, Leaf, FlaskConical, Monitor,
} from 'lucide-react';

/* ────── DESIGN TOKENS ────── */
const NAVY_DARK = '#071A33';
const NAVY = '#0B1F3A';
const NAVY_MED = '#102A43';
const COPPER = '#C47A45';
const COPPER_LIGHT = '#E6A15C';
const GOLD = '#FFD166';
const TEXT_MUTED = '#64748B';
const BORDER = '#E6EAF2';
const SUCCESS = '#12B76A';
const PURPLE = '#6D5DFB';

/* ────── DATA ────── */
const NAV_LINKS = [
  { label: 'Home',          href: '/',              active: true },
  { label: 'Library',       href: '/library' },
  { label: 'Syllabus',      href: '/secondary' },
  { label: 'Past Papers',   href: '/library?view=past-papers' },
  { label: 'Live Sessions', href: '/live-sessions' },
  { label: 'Video Lessons', href: '/library?view=video' },
  { label: 'Collections',   href: '/library?view=collections' },
  { label: 'My Learning',   href: '/learning-path' },
];

const TRUST_AVATARS = [11, 12, 47, 49, 33, 44];

const CHAT_MESSAGES: { name: string; img: number; text: string; time: string; isYou?: boolean }[] = [
  { name: 'Chiamaka O.', img: 47, text: 'Can someone explain how to factor x² - 5x + 6?', time: '10:24 AM' },
  { name: 'Kwame A.',    img: 12, text: 'Sure! Let\'s break it down together.',           time: '10:25 AM' },
  { name: 'Amina K.',    img: 49, text: 'Here\'s a quick method that works.',             time: '10:26 AM' },
  { name: 'You',         img: 44, text: 'Thanks! This makes so much sense now.',          time: '10:27 AM', isYou: true },
  { name: 'Tendai M.',   img: 33, text: 'Great explanation! 🙌',                          time: '10:28 AM' },
];

const PARTICIPANTS = [
  { name: 'Amina K.',    img: 49, bg: 'linear-gradient(135deg,#FFE0B5,#E89C5A)' },
  { name: 'Kwame A.',    img: 12, bg: 'linear-gradient(135deg,#A6C0FF,#6B8AD9)' },
  { name: 'Chiamaka O.', img: 47, bg: 'linear-gradient(135deg,#F8C6BC,#D97A6B)' },
  { name: 'Tendai M.',   img: 33, bg: 'linear-gradient(135deg,#C5D9C0,#7BA572)' },
];

const RESOURCES = [
  { name: 'Quadratic Factorisation.pdf', size: '245 KB', tint: '#FDECEC', ink: '#EF4444' },
  { name: 'Practice Questions.docx',     size: '126 KB', tint: '#E0EBFF', ink: '#2563EB' },
  { name: 'Algebra Cheatsheet.pdf',      size: '310 KB', tint: '#FDECEC', ink: '#EF4444' },
];

const STATS = [
  { value: '2,845', label: 'Active Study Groups',  icon: Users,         tint: '#EEEAFE', ink: PURPLE },
  { value: '1,236', label: 'Peer Tutors',          icon: GradCap,       tint: '#FCEFD8', ink: COPPER },
  { value: '215',   label: 'Live Discussion Rooms', icon: MessageSquare, tint: '#FDECEC', ink: '#EF4444', live: true },
  { value: '8,672', label: 'Resources Shared',     icon: LibraryIcon,   tint: '#E5F6EC', ink: SUCCESS },
  { value: '92%',   label: 'Success Rate',         sub: 'Improved scores', icon: TrendingUp, tint: '#E0EBFF', ink: '#2563EB' },
];

interface StudyRoom {
  subject: string;
  subjectIcon: React.ComponentType<{ className?: string }>;
  subjectInk: string;
  subjectBg: string;
  title: string;
  topic: string;
  level: string;
  members: number;
  liveNow?: boolean;
  scheduledAt?: string;
}

const STUDY_ROOMS: StudyRoom[] = [
  { subject: 'Mathematics', subjectIcon: Sigma,        subjectInk: '#5B4391', subjectBg: '#EEEAFE', title: 'Problem Solving Circle', topic: 'Algebra & Equations',     level: 'Secondary • Grade 7-10',  members: 18, liveNow: true },
  { subject: 'English',     subjectIcon: BookOpen,     subjectInk: COPPER,    subjectBg: '#FCEFD8', title: 'Composition Circle',     topic: 'Essay Writing & Grammar', level: 'Secondary • Grade 6-12',  members: 15, scheduledAt: 'Today, 4:00 PM' },
  { subject: 'Biology',     subjectIcon: Leaf,         subjectInk: '#3F6F5A', subjectBg: '#E5F6EC', title: 'Revision Group',         topic: 'Human Biology',           level: 'Secondary • Grade 8-12',  members: 22, liveNow: true },
  { subject: 'Chemistry',   subjectIcon: FlaskConical, subjectInk: '#7C3AED', subjectBg: '#EEEAFE', title: 'Practicals Discussion',  topic: 'Acids, Bases & Salts',    level: 'Secondary • Grade 9-12',  members: 12, scheduledAt: 'Tomorrow, 5:00 PM' },
  { subject: 'ICT',         subjectIcon: Monitor,      subjectInk: '#1E4163', subjectBg: '#E0EBFF', title: 'Coding Buddies',         topic: 'Python & Algorithms',     level: 'Secondary • Grade 8-12',  members: 16, liveNow: true },
];

const PEER_STEPS = [
  { num: 1, title: 'Join a Group',       body: 'Find or create a study group that matches your subject and goals.', icon: UserPlus,      tint: '#FCEFD8', ink: COPPER },
  { num: 2, title: 'Discuss & Practice', body: 'Share questions, solve problems and learn together in real time.',  icon: MessagesSquare, tint: '#FCEFD8', ink: COPPER },
  { num: 3, title: 'Share Resources',    body: 'Exchange notes, past papers, and helpful study materials.',         icon: Share2,        tint: '#FCEFD8', ink: COPPER },
  { num: 4, title: 'Grow Together',      body: 'Support each other, track progress and achieve more.',              icon: Trophy,        tint: '#FCEFD8', ink: COPPER },
];

const ROLE_CARDS = [
  { title: 'For Students',   body: 'Learn better with peers, get help faster, and build confidence.',    icon: GradCap,    tint: '#E0EBFF', ink: '#2563EB' },
  { title: 'For Peer Tutors', body: 'Help others, strengthen your knowledge, and earn recognition.',     icon: Heart,      tint: '#FFE4E6', ink: '#EF4444' },
  { title: 'For Parents',    body: 'See your child grow through safe and positive learning communities.', icon: Briefcase,  tint: '#EEEAFE', ink: PURPLE },
  { title: 'For Schools',    body: 'Empower learners with collaborative, 24/7 learning support.',         icon: School,     tint: '#FCEFD8', ink: COPPER },
];

const FOOTER_COLUMNS = [
  { title: 'CLASSES',        items: ['All Classes', 'Primary Level', 'Secondary Level', 'Exam Preparation'] },
  { title: 'LEARNING TOOLS', items: ['Personal Path', 'AI Assistant', 'Video Lessons', 'Collections'] },
  { title: 'COMMUNITY',      items: ['Discussion Rooms', 'Peer Tutoring', 'Study Groups', 'Success Stories'] },
  { title: 'SUPPORT',        items: ['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'] },
];

/* ────── PAGE ────── */
export const PeerLearningPage: React.FC = () => (
  <div className="min-h-screen bg-[#FBFCFF] text-[#0F172A] antialiased font-sans">
    <PeerTopNav />
    <main>
      <Hero />
      <StatsStrip />
      <FeaturedStudyRooms />
      <FindCircle />
      <HowItWorks />
      <RoleCards />
      <CtaBanner />
    </main>
    <PeerFooter />
  </div>
);

export default PeerLearningPage;

/* ────── TOP NAV ────── */
const PeerTopNav: React.FC = () => (
  <header className="bg-white border-b sticky top-0 z-40" style={{ borderColor: BORDER }}>
    <div className="mx-auto max-w-[1500px] px-6 lg:px-10 h-16 flex items-center gap-6">
      <Link to="/" className="flex items-center gap-2 shrink-0">
        <span className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${PURPLE}, #4C3DDB)` }}>
          <GraduationCap className="w-4 h-4 text-white" />
        </span>
        <span className="text-[18px] font-extrabold tracking-tight" style={{ color: NAVY }}>
          Maple <span className="font-semibold" style={{ color: TEXT_MUTED }}>Online School</span>
        </span>
      </Link>

      <nav className="hidden xl:flex items-center gap-1 ml-6">
        {NAV_LINKS.map((n) => (
          <Link
            key={n.label}
            to={n.href}
            className="px-3.5 py-1.5 rounded-full text-[13px] font-bold transition-colors"
            style={n.active ? { backgroundColor: '#EEEFFF', color: PURPLE } : { color: NAVY }}
          >
            {n.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3 ml-auto shrink-0">
        <button type="button" className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-50" aria-label="Notifications">
          <Bell className="w-5 h-5" style={{ color: NAVY }} />
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center">3</span>
        </button>
        <button type="button" className="flex items-center gap-2.5 group">
          <img src="https://i.pravatar.cc/80?img=49" alt="Amina" className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm" />
          <div className="hidden sm:block leading-tight text-left">
            <p className="text-[10.5px] font-extrabold inline-flex items-center gap-1" style={{ color: COPPER }}>
              <span className="text-[12px]">★</span> Premium
            </p>
            <p className="text-[13px] font-extrabold" style={{ color: NAVY }}>Amina</p>
          </div>
          <ChevronDown className="w-4 h-4" style={{ color: TEXT_MUTED }} />
        </button>
      </div>
    </div>
  </header>
);

/* ────── HERO ────── */
const Hero: React.FC = () => (
  <section className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #FBFCFF 0%, #FFF8EE 100%)' }}>
    <div className="mx-auto max-w-[1500px] px-6 lg:px-10 py-12 lg:py-14 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
      <div>
        <p className="text-[11px] font-extrabold tracking-[0.22em] uppercase" style={{ color: COPPER }}>
          Peer-to-Peer Learning Platform
        </p>
        <h1 className="mt-5 text-[56px] lg:text-[72px] leading-[1.02] tracking-tight" style={{ fontFamily: 'Fraunces, serif', fontWeight: 600 }}>
          <span className="block" style={{ color: NAVY }}>Learn together.</span>
          <span className="block" style={{ color: COPPER }}>Grow faster.</span>
        </h1>
        <p className="mt-5 max-w-lg text-[15px] leading-relaxed" style={{ color: TEXT_MUTED }}>
          Join discussion circles, study groups, peer tutoring and learning communities. Share ideas, solve problems, and succeed together.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <button type="button" className="inline-flex items-center gap-2 rounded-full text-white px-6 h-12 text-[13px] font-extrabold shadow-md" style={{ backgroundColor: NAVY }}>
            Join a Study Group <ArrowRight className="w-4 h-4" />
          </button>
          <button type="button" className="inline-flex items-center gap-2 rounded-full bg-white border px-6 h-12 text-[13px] font-extrabold" style={{ color: NAVY, borderColor: BORDER }}>
            Explore Discussions
          </button>
        </div>

        <div className="mt-9">
          <p className="text-[12.5px]" style={{ color: TEXT_MUTED }}>Trusted by thousands of learners across Africa</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex -space-x-2">
              {TRUST_AVATARS.map((id) => (
                <img key={id} src={`https://i.pravatar.cc/60?img=${id}`} alt="" aria-hidden className="w-8 h-8 rounded-full ring-2 ring-white object-cover" />
              ))}
            </div>
            <span className="rounded-full bg-white border px-2.5 py-1 text-[11px] font-extrabold" style={{ color: NAVY, borderColor: BORDER }}>+25K</span>
          </div>
        </div>
      </div>

      <HeroMockup />
    </div>
  </section>
);

/* ────── HERO MOCKUP ────── */
const HeroMockup: React.FC = () => (
  <div className="relative">
    <div className="grid grid-cols-12 gap-3">
      {/* Discussion Room — left column, spans 2 rows */}
      <div className="col-span-12 sm:col-span-5 row-span-2 rounded-2xl bg-white border p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_44px_-18px_rgba(15,23,42,0.18)]" style={{ borderColor: BORDER }}>
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold" style={{ color: TEXT_MUTED }}>Discussion Room</p>
        </div>
        <p className="mt-1 text-[14px] font-extrabold" style={{ color: NAVY }}>Algebra Problem Solvers</p>
        <p className="mt-1 inline-flex items-center gap-1 text-[10.5px] font-bold" style={{ color: SUCCESS }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: SUCCESS }} /> 12 online
        </p>

        <ul className="mt-3 space-y-2.5">
          {CHAT_MESSAGES.map((m) => (
            <li key={m.name} className="flex items-start gap-2">
              <img src={`https://i.pravatar.cc/60?img=${m.img}`} alt="" aria-hidden className="w-7 h-7 rounded-full object-cover shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-extrabold" style={{ color: m.isYou ? COPPER : NAVY }}>{m.name}</p>
                  <p className="text-[9.5px] font-bold" style={{ color: TEXT_MUTED }}>{m.time}</p>
                </div>
                <p className="text-[11px] leading-snug" style={{ color: NAVY }}>{m.text}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-3 flex items-center gap-2 rounded-full bg-[#F1F5F9] px-3 py-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-[11.5px] outline-none"
            style={{ color: NAVY }}
          />
          <button type="button" className="w-7 h-7 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: PURPLE }} aria-label="Send">
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Video & Participants — top right */}
      <div className="col-span-12 sm:col-span-7 rounded-2xl bg-white border p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_44px_-18px_rgba(15,23,42,0.18)]" style={{ borderColor: BORDER }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold" style={{ color: TEXT_MUTED }}>Video &amp; Participants</p>
          <div className="flex items-center gap-1.5 text-slate-400">
            <UserCircle2 className="w-3.5 h-3.5" />
            <SettingsIcon className="w-3.5 h-3.5" />
            <MoreHorizontal className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PARTICIPANTS.map((p) => (
            <div key={p.name} className="relative aspect-[3/4] rounded-lg overflow-hidden" style={{ backgroundImage: p.bg }}>
              <img src={`https://i.pravatar.cc/240?img=${p.img}`} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 px-2 py-1 bg-gradient-to-t from-black/65 to-transparent">
                <p className="text-[9.5px] font-extrabold text-white truncate">{p.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shared Notes — bottom center */}
      <div className="col-span-12 sm:col-span-5 rounded-2xl bg-white border p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_44px_-18px_rgba(15,23,42,0.18)]" style={{ borderColor: BORDER }}>
        <p className="text-[11px] font-bold mb-2" style={{ color: TEXT_MUTED }}>Shared Notes</p>
        <div className="rounded-xl bg-[#FFFEF7] border p-3" style={{ borderColor: '#F0E5C8' }}>
          <p className="text-[14px]" style={{ color: '#1E4163', fontFamily: 'Fraunces, serif', fontWeight: 600, fontStyle: 'italic' }}>
            Factorising&nbsp; <span style={{ color: '#EF4444' }}>x² - 5x + 6</span>
          </p>
          <ol className="mt-2 space-y-1.5 text-[11.5px] leading-relaxed" style={{ color: '#1E4163', fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>
            <li>1. Find two numbers that multiply to <span style={{ color: '#EF4444' }}>6</span> and add to <span style={{ color: '#EF4444' }}>-5</span>.</li>
            <li>2. The numbers are <span style={{ color: '#EF4444' }}>-2</span> and <span style={{ color: '#EF4444' }}>-3</span>.</li>
            <li>3. Therefore: <span className="font-bold">x² - 5x + 6 = <span style={{ color: SUCCESS }}>(x-2)(x-3)</span></span></li>
          </ol>
        </div>
      </div>

      {/* Resources — bottom right */}
      <div className="col-span-12 sm:col-span-2 rounded-2xl bg-white border p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_44px_-18px_rgba(15,23,42,0.18)] flex flex-col" style={{ borderColor: BORDER }}>
        <p className="text-[11px] font-bold mb-2" style={{ color: TEXT_MUTED }}>Resources</p>
        <ul className="space-y-2 flex-1">
          {RESOURCES.map((r) => (
            <li key={r.name} className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: r.tint }}>
                <FileText className="w-3.5 h-3.5" style={{ color: r.ink }} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold leading-tight truncate" style={{ color: NAVY }}>{r.name}</p>
                <p className="text-[9px] font-bold" style={{ color: TEXT_MUTED }}>{r.size}</p>
              </div>
            </li>
          ))}
        </ul>
        <button type="button" className="mt-3 w-full inline-flex items-center justify-center gap-1 rounded-full bg-white border px-2 py-1.5 text-[10px] font-extrabold" style={{ color: NAVY, borderColor: BORDER }}>
          <Upload className="w-3 h-3" /> Upload Resource
        </button>
      </div>
    </div>
  </div>
);

/* ────── STATS STRIP ────── */
const StatsStrip: React.FC = () => (
  <section className="mx-auto max-w-[1500px] px-6 lg:px-10 -mt-2">
    <div className="rounded-2xl bg-white border shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: BORDER, borderColor: BORDER }}>
      {STATS.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="flex items-center gap-3 px-5 py-4">
            <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: s.tint }}>
              <Icon className="w-4 h-4" style={{ color: s.ink }} />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {s.live && (
                  <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider" style={{ backgroundColor: '#FDECEC', color: '#EF4444' }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#EF4444' }} /> Live
                  </span>
                )}
                <p className="text-[20px] font-extrabold leading-none tracking-tight" style={{ color: NAVY }}>{s.value}</p>
              </div>
              <p className="mt-1 text-[11.5px] font-bold" style={{ color: TEXT_MUTED }}>{s.label}</p>
              {s.sub && <p className="text-[10px] font-bold" style={{ color: TEXT_MUTED }}>{s.sub}</p>}
            </div>
          </div>
        );
      })}
    </div>
  </section>
);

/* ────── FEATURED STUDY ROOMS ────── */
const FeaturedStudyRooms: React.FC = () => (
  <section className="mx-auto max-w-[1500px] px-6 lg:px-10 mt-10">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-[20px] font-extrabold tracking-tight" style={{ color: NAVY }}>Featured Study Rooms</h2>
      <button type="button" className="inline-flex items-center gap-1 text-[12.5px] font-extrabold" style={{ color: COPPER }}>
        View all rooms <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
      {STUDY_ROOMS.map((r) => <StudyRoomCard key={r.title} room={r} />)}
    </div>
  </section>
);

const StudyRoomCard: React.FC<{ room: StudyRoom }> = ({ room }) => {
  const Icon = room.subjectIcon;
  return (
    <article className="rounded-2xl bg-white border p-4 flex flex-col shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.06)]" style={{ borderColor: BORDER }}>
      <div className="inline-flex items-center gap-1.5 self-start rounded-md px-2 py-0.5" style={{ backgroundColor: room.subjectBg }}>
        <Icon className="w-3 h-3" style={{ color: room.subjectInk }} />
        <span className="text-[10px] font-extrabold tracking-wide" style={{ color: room.subjectInk }}>{room.subject}</span>
      </div>
      <h3 className="mt-2.5 text-[15px] font-extrabold tracking-tight" style={{ color: NAVY }}>{room.title}</h3>
      <p className="text-[11.5px]" style={{ color: TEXT_MUTED }}>{room.topic}</p>
      <p className="mt-1 text-[11px] font-semibold" style={{ color: TEXT_MUTED }}>{room.level}</p>

      <div className="mt-3 flex items-center gap-2">
        <div className="flex -space-x-1.5">
          {[11, 12, 47].map((id) => (
            <img key={id} src={`https://i.pravatar.cc/40?img=${id}`} alt="" aria-hidden className="w-6 h-6 rounded-full ring-2 ring-white object-cover" />
          ))}
        </div>
        <p className="text-[11px] font-bold" style={{ color: NAVY }}>{room.members} members</p>
        {room.liveNow ? (
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-extrabold" style={{ color: SUCCESS }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: SUCCESS }} /> Live now
          </span>
        ) : (
          <span className="ml-auto text-[10px] font-bold" style={{ color: TEXT_MUTED }}>{room.scheduledAt}</span>
        )}
      </div>

      <button type="button" className="mt-3 w-full rounded-md text-white text-[12px] font-extrabold py-2.5" style={{ backgroundColor: NAVY }}>
        Join Room
      </button>
    </article>
  );
};

/* ────── FIND CIRCLE ────── */
const FindCircle: React.FC = () => {
  const filters = [
    { label: 'Subject', value: 'All Subjects', icon: BookOpen },
    { label: 'Class / Level', value: 'All Levels', icon: GradCap },
    { label: 'Learning Goal', value: 'All Goals', icon: Sparkles },
    { label: 'Country / Curriculum', value: 'All Countries', icon: ShieldCheck },
    { label: 'Study Preference', value: 'Any Preference', icon: Heart },
  ];
  return (
    <section className="mx-auto max-w-[1500px] px-6 lg:px-10 mt-10">
      <div className="rounded-2xl bg-white border p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.06)]" style={{ borderColor: BORDER }}>
        <div className="grid lg:grid-cols-[1fr,auto] gap-4 items-end">
          <div>
            <h3 className="text-[18px] font-extrabold tracking-tight" style={{ color: NAVY }}>Find Your Learning Circle</h3>
            <p className="text-[12.5px]" style={{ color: TEXT_MUTED }}>Match with the perfect peers for your learning goals.</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 items-center">
          {filters.map(({ label, value, icon: Icon }) => (
            <button key={label} type="button" className="flex items-center gap-2 rounded-lg bg-white border px-3 py-2.5 text-left flex-1 min-w-[180px]" style={{ borderColor: BORDER }}>
              <span className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: '#F8FAFC' }}>
                <Icon className="w-3.5 h-3.5" style={{ color: TEXT_MUTED }} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold" style={{ color: TEXT_MUTED }}>{label}</p>
                <p className="text-[12px] font-extrabold leading-none" style={{ color: NAVY }}>{value}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5" style={{ color: TEXT_MUTED }} />
            </button>
          ))}
          <button type="button" className="inline-flex items-center gap-2 rounded-md text-white px-5 h-[52px] text-[12.5px] font-extrabold whitespace-nowrap shrink-0" style={{ backgroundColor: NAVY }}>
            Find My Circle <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

/* ────── HOW IT WORKS ────── */
const HowItWorks: React.FC = () => (
  <section className="mx-auto max-w-[1500px] px-6 lg:px-10 mt-10">
    <h2 className="text-[20px] font-extrabold tracking-tight mb-3" style={{ color: NAVY }}>How Peer Learning Works</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {PEER_STEPS.map(({ num, title, body, icon: Icon, tint, ink }) => (
        <article key={title} className="rounded-2xl bg-white border p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]" style={{ borderColor: BORDER }}>
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[12px] font-extrabold shrink-0" style={{ backgroundColor: COPPER }}>{num}</span>
            <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: tint }}>
              <Icon className="w-4 h-4" style={{ color: ink }} />
            </span>
            <h4 className="text-[13.5px] font-extrabold tracking-tight" style={{ color: NAVY }}>{title}</h4>
          </div>
          <p className="mt-3 text-[12px] leading-relaxed" style={{ color: TEXT_MUTED }}>{body}</p>
        </article>
      ))}
    </div>
  </section>
);

/* ────── ROLE CARDS ────── */
const RoleCards: React.FC = () => (
  <section className="mx-auto max-w-[1500px] px-6 lg:px-10 mt-3">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {ROLE_CARDS.map(({ title, body, icon: Icon, tint, ink }) => (
        <article key={title} className="rounded-2xl bg-white border p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]" style={{ borderColor: BORDER }}>
          <span className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: tint }}>
            <Icon className="w-4 h-4" style={{ color: ink }} />
          </span>
          <h4 className="mt-3 text-[14px] font-extrabold tracking-tight" style={{ color: NAVY }}>{title}</h4>
          <p className="mt-1 text-[12px] leading-relaxed" style={{ color: TEXT_MUTED }}>{body}</p>
        </article>
      ))}
    </div>
  </section>
);

/* ────── CTA BANNER ────── */
const CtaBanner: React.FC = () => (
  <section className="mx-auto max-w-[1500px] px-6 lg:px-10 mt-12 mb-12">
    <div className="relative overflow-hidden rounded-2xl text-white p-5 lg:p-6 grid lg:grid-cols-[260px,1fr,auto,260px] gap-5 items-center" style={{ background: `linear-gradient(135deg, ${NAVY_DARK} 0%, ${NAVY_MED} 100%)` }}>
      <div aria-hidden className="absolute -top-24 -right-24 w-80 h-80 rounded-full" style={{ background: `radial-gradient(circle, ${COPPER}33, transparent 60%)` }} />

      {/* Photo strip */}
      <div className="relative rounded-xl overflow-hidden h-[120px] hidden lg:block" style={{ backgroundImage: 'linear-gradient(135deg,#1A3358,#0B2845)' }}>
        <img src="/images/african_students_computer_lab.png" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
      </div>

      {/* Copy */}
      <div className="relative">
        <h3 className="text-[20px] lg:text-[22px] font-extrabold tracking-tight">Stronger together. Smarter together. Succeed together.</h3>
        <p className="mt-1 text-[12.5px] text-slate-300 leading-relaxed max-w-xl">
          Join thousands of learners across Africa already learning, collaborating and achieving more—together.
        </p>
      </div>

      {/* CTA */}
      <button type="button" className="relative inline-flex items-center gap-2 rounded-full px-5 h-12 text-[13px] font-extrabold shadow-xl shrink-0" style={{ background: `linear-gradient(180deg, ${GOLD} 0%, ${COPPER_LIGHT} 100%)`, color: NAVY }}>
        Start Learning Together <ArrowRight className="w-4 h-4" />
      </button>

      {/* Safety block */}
      <div className="relative flex items-start gap-3 border-l border-white/15 pl-4">
        <ShieldCheck className="w-5 h-5 mt-0.5" style={{ color: GOLD }} />
        <div className="leading-tight">
          <p className="text-[11.5px] font-extrabold" style={{ color: GOLD }}>Safe • Supportive • Inclusive</p>
          <p className="mt-1 text-[10.5px] text-slate-300">Our community is moderated to keep learning safe and respectful for everyone.</p>
        </div>
      </div>
    </div>
  </section>
);

/* ────── FOOTER ────── */
const PeerFooter: React.FC = () => (
  <footer className="text-white" style={{ background: `linear-gradient(180deg, ${NAVY_DARK} 0%, ${NAVY} 100%)` }}>
    <div className="mx-auto max-w-[1500px] px-6 lg:px-10 py-10">
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-8">
        <div className="col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg,${PURPLE},#4C3DDB)` }}>
              <GraduationCap className="w-4 h-4 text-white" />
            </span>
            <p className="text-[15px] font-extrabold">Maple <span className="font-semibold text-slate-300">Online School</span></p>
          </div>
          <p className="mt-3 text-[12px] text-slate-300 leading-relaxed">
            Empowering students across Africa with quality online education.
          </p>
          <div className="mt-4 flex items-center gap-3">
            {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
              <button key={i} type="button" className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center" aria-label="social">
                <Icon className="w-3.5 h-3.5 text-slate-200" />
              </button>
            ))}
          </div>
          <p className="mt-6 text-[10.5px] text-slate-400">© 2025 Maple Online School. All rights reserved.</p>
        </div>

        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-[10.5px] font-extrabold tracking-[0.18em] text-slate-300">{col.title}</p>
            <ul className="mt-3 space-y-2">
              {col.items.map((it) => (
                <li key={it}>
                  <a href="#" className="text-[12px] text-slate-200 hover:text-white">{it}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <p className="text-[10.5px] font-extrabold tracking-[0.18em] text-slate-300">GET THE APP</p>
          <div className="mt-3 space-y-2">
            <StoreBadge line1="GET IT ON" line2="Google Play" />
            <StoreBadge line1="Download on the" line2="App Store" />
          </div>
        </div>
      </div>

      <div className="mt-8 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-slate-400">
        <p>© 2025 Maple Online School. All rights reserved.</p>
        <div className="flex items-center gap-4 font-bold">
          <a href="#" className="hover:text-white">Terms</a>
          <a href="#" className="hover:text-white">Privacy</a>
          <a href="#" className="hover:text-white">Cookies</a>
        </div>
      </div>
    </div>
  </footer>
);

const StoreBadge: React.FC<{ line1: string; line2: string }> = ({ line1, line2 }) => (
  <button type="button" className="flex items-center gap-2 rounded-lg bg-black/60 hover:bg-black/70 ring-1 ring-white/10 px-3 py-1.5 w-full">
    <span className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-white text-[10px] font-extrabold">▸</span>
    <span className="leading-tight text-left">
      <span className="block text-[8px] uppercase tracking-wider text-slate-400">{line1}</span>
      <span className="block text-[11px] font-extrabold text-white">{line2}</span>
    </span>
  </button>
);
