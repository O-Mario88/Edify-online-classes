import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Bell, ChevronDown, ChevronRight, Bookmark, BookOpen, Crown, Check,
  Home, GraduationCap, NotebookPen, FileCheck2, Video, Headphones,
  StickyNote, Download, Clock, Calendar, LifeBuoy,
  Users, ShieldCheck, BookMarked, Atom, FlaskConical, Leaf, Globe2, Monitor, BookText, Calculator, BookA,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ResourceViewer } from '../components/academic/ResourceViewer';
import VideoPlayer from '../components/academic/VideoPlayer';
import { contentApi, type ContentItem } from '../lib/contentApi';

/* ───────── DESIGN TOKENS ───────── */
const NAVY = '#0B1F35';
const ORANGE = '#C97849';
const CREAM = '#F7F2E8';
const CARD_BORDER = '#E8DFCC';

/* ───────── DATA ───────── */
function mapContentToResource(item: ContentItem): any {
  return {
    id: item.id,
    title: item.title,
    subject: item.subject_name || item.school_level || 'General',
    category: (item.content_type || 'pdf').toUpperCase(),
    file_url: item.file_url || item.thumbnail_url,
    vimeo_video_id: item.vimeo_video_id,
    rating: 4.5 + Math.random() * 0.5,
  };
}

const SIDEBAR_BROWSE: { label: string; icon: React.ComponentType<{ className?: string }>; active?: boolean }[] = [
  { label: 'Home', icon: Home, active: true },
  { label: 'Primary', icon: GraduationCap },
  { label: 'Secondary', icon: GraduationCap },
  { label: 'Revision Notes', icon: NotebookPen },
  { label: 'Textbooks', icon: BookOpen },
  { label: 'Mock Exams', icon: FileCheck2 },
  { label: 'Recorded Lessons', icon: Video },
  { label: 'Audiobooks', icon: Headphones },
];

const SIDEBAR_MY_LIBRARY = [
  { label: 'Saved Resources', icon: Bookmark },
  { label: 'My Notes', icon: StickyNote },
  { label: 'Downloads', icon: Download },
  { label: 'Recently Viewed', icon: Clock },
];

const SIDEBAR_QUICK = [
  { label: 'Study Planner', icon: Calendar },
  { label: 'Bookmarks', icon: BookMarked },
  { label: 'Help & Support', icon: LifeBuoy },
];

const STATS = [
  { value: '12,500+', label: 'Resources', icon: BookOpen },
  { value: '35', label: 'Subjects', icon: GraduationCap },
  { value: '24/7', label: 'Access', icon: Clock },
  { value: '2.4M+', label: 'Active Learners', icon: Users },
  { value: '99.9%', label: 'Uptime', icon: ShieldCheck },
];

type CoverVariant =
  | 'math' | 'english' | 'biology' | 'chemistry' | 'physics'
  | 'geography' | 'ict' | 'literature' | 'business' | 'accounting';

interface FeaturedBook {
  cover: CoverVariant;
  coverHeading: string;       // Top serif on the cover
  coverSubheading: string;    // FOR SECONDARY SCHOOLS / FUNDAMENTALS etc
  tag: 'PDF' | 'Notes' | 'Video';
  title: string;              // Footer title
  rating: number;
  saves: string;
}

const FEATURED: FeaturedBook[] = [
  { cover: 'math',      coverHeading: 'MATHEMATICS',          coverSubheading: 'FOR SECONDARY SCHOOLS', tag: 'PDF',   title: 'Mathematics Complete Revision Guide', rating: 4.8, saves: '12.4K saved' },
  { cover: 'english',   coverHeading: 'ENGLISH LANGUAGE',     coverSubheading: '& LITERATURE',          tag: 'PDF',   title: 'English Language Exam Preparation',   rating: 4.7, saves: '9.8K saved'  },
  { cover: 'biology',   coverHeading: 'BIOLOGY',              coverSubheading: 'FOR SECONDARY SCHOOLS', tag: 'PDF',   title: 'Biology Notes and Practice',           rating: 4.9, saves: '8.6K saved'  },
  { cover: 'chemistry', coverHeading: 'CHEMISTRY',            coverSubheading: 'FUNDAMENTALS',          tag: 'Video', title: 'Chemistry Video Lessons Bundle',       rating: 4.9, saves: '7.2K saved'  },
  { cover: 'physics',   coverHeading: 'PHYSICS',              coverSubheading: 'CONCEPTS & APPLICATIONS', tag: 'Notes', title: 'Physics Formulas & Notes',           rating: 4.7, saves: '6.1K saved'  },
];

const RECENTLY: FeaturedBook[] = [
  { cover: 'geography',  coverHeading: 'GEOGRAPHY',                coverSubheading: 'FOR SECONDARY SCHOOLS', tag: 'PDF',   title: 'Geography Revision Notes',     rating: 4.6, saves: '4.4K saved' },
  { cover: 'ict',        coverHeading: 'ICT',                      coverSubheading: 'PRACTICAL HANDBOOK',    tag: 'PDF',   title: 'ICT Practical Handbook',       rating: 4.7, saves: '3.9K saved' },
  { cover: 'literature', coverHeading: 'LITERATURE',               coverSubheading: 'IN CONTEXT',            tag: 'PDF',   title: 'Literature in Context',         rating: 4.8, saves: '5.1K saved' },
  { cover: 'business',   coverHeading: 'BUSINESS',                 coverSubheading: 'STUDIES MADE EASY',     tag: 'Notes', title: 'Business Studies Notes',       rating: 4.6, saves: '4.2K saved' },
  { cover: 'accounting', coverHeading: 'ACCOUNTING',               coverSubheading: 'PRINCIPLES & PRACTICE', tag: 'PDF',   title: 'Accounting Principles Guide',  rating: 4.7, saves: '3.6K saved' },
];

const POPULAR: { rank: number; title: string; tag: string; views: string; cover: CoverVariant }[] = [
  { rank: 1, title: 'Mathematics Past Papers 2018-2023 (All Boards)', tag: 'PDF', views: '12.1K views', cover: 'math' },
  { rank: 2, title: 'Biology Diagrams Workbook',                       tag: 'PDF', views: '9.3K views',  cover: 'biology' },
  { rank: 3, title: 'IGCSE Chemistry Topical Questions',                tag: 'PDF', views: '8.7K views',  cover: 'chemistry' },
  { rank: 4, title: 'English Essay Writing Guide',                      tag: 'PDF', views: '7.6K views',  cover: 'english' },
  { rank: 5, title: 'Physics Practical Workbook',                       tag: 'PDF', views: '6.4K views',  cover: 'physics' },
];

const CONTINUE = [
  { title: 'Chemical Reactions and Equations', progress: 65, cover: 'chemistry' as CoverVariant },
  { title: 'Quadratic Equations and Functions', progress: 40, cover: 'math' as CoverVariant },
];

const COLLECTIONS: {
  name: string; count: string; icon: React.ComponentType<{ className?: string }>;
  bg: string; ink: string; iconWrap: string;
}[] = [
  { name: 'Mathematics', count: '1,245 Resources', icon: Calculator,    bg: 'bg-[#E0D4ED]', ink: 'text-[#3F2E66]',  iconWrap: 'bg-[#5B4391] text-white' },
  { name: 'English',     count: '1,102 Resources', icon: BookA,         bg: 'bg-[#D9874E]', ink: 'text-white',       iconWrap: 'bg-white/25 text-white' },
  { name: 'Biology',     count: '987 Resources',   icon: Leaf,          bg: 'bg-[#5C8A65]', ink: 'text-white',       iconWrap: 'bg-white/25 text-white' },
  { name: 'Chemistry',   count: '876 Resources',   icon: FlaskConical,  bg: 'bg-[#0F4338]', ink: 'text-white',       iconWrap: 'bg-white/15 text-white' },
  { name: 'Physics',     count: '765 Resources',   icon: Atom,          bg: 'bg-[#0B2845]', ink: 'text-white',       iconWrap: 'bg-white/15 text-white' },
  { name: 'Geography',   count: '654 Resources',   icon: Globe2,        bg: 'bg-[#0F4D43]', ink: 'text-white',       iconWrap: 'bg-white/15 text-white' },
  { name: 'ICT',         count: '543 Resources',   icon: Monitor,       bg: 'bg-[#3D2D5C]', ink: 'text-white',       iconWrap: 'bg-white/15 text-white' },
  { name: 'Literature',  count: '498 Resources',   icon: BookText,      bg: 'bg-[#7B2D26]', ink: 'text-white',       iconWrap: 'bg-white/15 text-white' },
];

/* ───────── PAGE ───────── */
export function AcademicLibraryPage() {
  const { user } = useAuth();
  const [activeResource, setActiveResource] = useState<any>(null);
  const [videoPlayer, setVideoPlayer] = useState<{ vimeoId: string; title: string } | null>(null);
  const [search, setSearch] = useState('');
  const [, setResources] = useState<any[]>([]);

  const fetchResources = useCallback(async () => {
    try {
      const r = await contentApi.library({ ordering: '-created_at' });
      const items = (r?.results || []).map(mapContentToResource);
      setResources(items);
    } catch {
      setResources([]);
    }
  }, []);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  const handleResourceClick = (resource: any) => {
    if (resource?.vimeo_video_id) {
      setVideoPlayer({ vimeoId: resource.vimeo_video_id, title: resource.title });
    } else if (resource?.id) {
      setActiveResource(resource);
    }
  };

  return (
    <div className="min-h-screen text-[#0B1F35] antialiased" style={{ backgroundColor: CREAM }}>
      <LibraryTopBar
        avatarUrl={user?.avatar}
        name={user?.name}
        search={search}
        onSearchChange={setSearch}
      />

      <div className="mx-auto max-w-[1500px] px-5 py-5">
        <div className="grid lg:grid-cols-[232px,1fr] gap-6">
          <LibrarySidebar />

          <div className="min-w-0">
            <LibraryHero />
            <LibraryStats />

            <div className="mt-7 grid xl:grid-cols-[1fr,360px] gap-6">
              <div className="min-w-0 space-y-7">
                <Section title="Featured Resources" cta="View All">
                  <BookGrid books={FEATURED} onOpen={handleResourceClick} />
                </Section>

                <Section title="Recently Added" cta="View All">
                  <BookGrid books={RECENTLY} onOpen={handleResourceClick} />
                </Section>
              </div>

              <aside className="space-y-7 min-w-0">
                <PopularThisWeek items={POPULAR} />
                <ContinueLearning items={CONTINUE} />
              </aside>
            </div>

            <SubjectCollections />
          </div>
        </div>
      </div>

      {activeResource && (
        <ResourceViewer
          resource={activeResource}
          studentId={user?.id || 'anonymous'}
          onClose={() => setActiveResource(null)}
        />
      )}
      {videoPlayer && (
        <VideoPlayer
          isOpen={!!videoPlayer}
          onClose={() => setVideoPlayer(null)}
          vimeoVideoId={videoPlayer.vimeoId}
          title={videoPlayer.title}
        />
      )}
    </div>
  );
}

export default AcademicLibraryPage;

/* ───────── TOP BAR ───────── */
const LibraryTopBar: React.FC<{
  avatarUrl?: string;
  name?: string;
  search: string;
  onSearchChange: (v: string) => void;
}> = ({ avatarUrl, name, search, onSearchChange }) => (
  <header className="sticky top-0 z-40 bg-white border-b border-[#EFE7D6]">
    <div className="mx-auto max-w-[1500px] px-5">
      <div className="flex items-center gap-6 h-[88px]">
        {/* Brand lockup */}
        <Link to="/library" className="flex items-center gap-3 shrink-0 w-[200px]">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${ORANGE}1A` }}>
            <MapleBookIcon className="w-7 h-7" />
          </div>
          <div className="leading-none">
            <p className="text-[26px] font-extrabold tracking-[0.04em]" style={{ color: NAVY }}>MAPLE</p>
            <p className="mt-1 text-[10px] font-bold tracking-[0.32em]" style={{ color: NAVY }}>ONLINE LIBRARY</p>
          </div>
        </Link>

        {/* Search */}
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

        {/* Top nav */}
        <nav className="hidden xl:flex items-center gap-7">
          <NavTab label="Library" active />
          <NavTab label="Subjects" hasChevron />
          <NavTab label="Past Papers" />
          <NavTab label="Video Lessons" />
          <NavTab label="Collections" />
          <NavTab label="My Learning" />
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-3 shrink-0 ml-auto xl:ml-2">
          <button type="button" className="w-10 h-10 rounded-full flex items-center justify-center text-[#0B1F35] hover:bg-[#F7F2E8]" aria-label="Notifications">
            <Bell className="w-5 h-5" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[14px] font-extrabold overflow-hidden shrink-0" style={{ backgroundColor: NAVY }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt={name || 'Reader'} className="w-full h-full object-cover" />
              ) : (
                (name?.[0] || 'M').toUpperCase()
              )}
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

const NavTab: React.FC<{ label: string; active?: boolean; hasChevron?: boolean }> = ({ label, active, hasChevron }) => (
  <button type="button" className="relative inline-flex items-center gap-1 text-[13.5px] font-bold transition-colors" style={{ color: active ? ORANGE : NAVY }}>
    <span>{label}</span>
    {hasChevron && <ChevronDown className="w-3.5 h-3.5 opacity-70" />}
    {active && <span className="absolute -bottom-2 left-0 right-0 h-[3px] rounded-full" style={{ backgroundColor: ORANGE }} />}
  </button>
);

/* Custom MAPLE book icon — open book with leaf accent */
const MapleBookIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden>
    <defs>
      <linearGradient id="m1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#0B1F35" />
        <stop offset="100%" stopColor="#163556" />
      </linearGradient>
    </defs>
    <path d="M5 9 L16 13 L27 9 L27 24 L16 28 L5 24 Z" fill="url(#m1)" />
    <path d="M16 13 L16 28" stroke="white" strokeOpacity="0.35" strokeWidth="0.6" />
    <path d="M16 7 C 14 4, 11 4, 11 7 C 11 10, 14 11, 16 13 C 18 11, 21 10, 21 7 C 21 4, 18 4, 16 7 Z" fill={ORANGE} />
  </svg>
);

/* ───────── SIDEBAR ───────── */
const LibrarySidebar: React.FC = () => (
  <aside className="hidden lg:block">
    <div className="sticky top-[104px] space-y-5 pb-6">
      <SidebarList items={SIDEBAR_BROWSE} />
      <SidebarLabeledList label="My Library" items={SIDEBAR_MY_LIBRARY} />
      <SidebarLabeledList label="Quick Links" items={SIDEBAR_QUICK} />

      {/* Upgrade card */}
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
        <button
          type="button"
          className="mt-4 w-full rounded-full text-white font-extrabold text-[12px] py-2.5"
          style={{ backgroundColor: ORANGE }}
        >
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
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-colors ${active ? 'text-white' : 'text-[#0B1F35] hover:bg-[#F0E9D8]'}`}
        style={active ? { backgroundColor: NAVY } : undefined}
      >
        <span className={`w-7 h-7 rounded-md flex items-center justify-center ${active ? 'bg-white/15' : 'bg-[#F0E9D8]'}`}>
          <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-[#0B1F35]'}`} />
        </span>
        {label}
      </button>
    ))}
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
const LibraryHero: React.FC = () => (
  <section className="relative overflow-hidden rounded-[20px] border" style={{ borderColor: CARD_BORDER, backgroundColor: '#F4E9D5' }}>
    {/* Background photo right side */}
    <div className="absolute inset-y-0 right-0 w-[62%]">
      <img
        src="/images/library-hero.png"
        alt=""
        aria-hidden
        className="w-full h-full object-cover"
      />
      {/* Cream gradient fading into photo from left */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #F4E9D5 0%, rgba(244,233,213,0.85) 18%, rgba(244,233,213,0) 50%)' }} />
    </div>

    <div className="relative grid lg:grid-cols-12 gap-6 items-center p-9 lg:p-11 min-h-[300px]">
      <div className="lg:col-span-7 relative z-10">
        <h1 className="text-[44px] lg:text-[48px] leading-[1.05] tracking-tight" style={{ color: NAVY, fontWeight: 700 }}>
          Explore the<br />Maple Online Library
        </h1>
        <p className="mt-3 text-[15px]" style={{ color: '#3D4E66' }}>
          Premium digital resources for modern learners.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full text-white px-6 h-11 text-[13px] font-extrabold shadow-lg"
            style={{ backgroundColor: NAVY }}
          >
            Browse Resources <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 h-11 text-[13px] font-extrabold border-2"
            style={{ color: NAVY, borderColor: ORANGE }}
          >
            Continue Learning <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Pagination dots */}
        <div className="mt-6 flex items-center gap-1.5">
          <span className="h-1 w-6 rounded-full" style={{ backgroundColor: ORANGE }} />
          <span className="h-1 w-2 rounded-full bg-[#D7CDB6]" />
        </div>
      </div>

      {/* Premium Access pill — top right */}
      <div className="lg:col-span-5 lg:justify-self-end relative z-10">
        <div className="rounded-2xl text-white p-4 w-[280px] shadow-2xl" style={{ backgroundColor: NAVY }}>
          <div className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: ORANGE }}>
              <Crown className="w-4 h-4 text-white" />
            </span>
            <div className="min-w-0">
              <p className="text-[13.5px] font-extrabold leading-tight">Premium Access</p>
              <p className="mt-1 text-[11.5px] text-slate-300 leading-relaxed">You have full access to all premium resources.</p>
              <button type="button" className="mt-2 inline-flex items-center gap-1 text-[12px] font-extrabold" style={{ color: ORANGE }}>
                View Benefits <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ───────── STATS ───────── */
const LibraryStats: React.FC = () => (
  <div className="mt-5 rounded-2xl bg-white border" style={{ borderColor: CARD_BORDER }}>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x" style={{ borderColor: CARD_BORDER }}>
      {STATS.map(({ value, label, icon: Icon }) => (
        <div key={label} className="flex items-center gap-3 px-5 py-5">
          <span className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${ORANGE}1A` }}>
            <Icon className="w-5 h-5" style={{ color: ORANGE }} />
          </span>
          <div className="min-w-0">
            <p className="text-[20px] font-extrabold leading-none" style={{ color: NAVY }}>{value}</p>
            <p className="mt-1 text-[12px] font-semibold text-[#7B7058]">{label}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ───────── SECTION SHELL ───────── */
const Section: React.FC<{ title: string; cta?: string; children: React.ReactNode }> = ({ title, cta, children }) => (
  <section>
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-[20px] font-extrabold" style={{ color: NAVY }}>{title}</h2>
      {cta && (
        <button type="button" className="inline-flex items-center gap-0.5 text-[12.5px] font-extrabold" style={{ color: ORANGE }}>
          {cta} <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
    {children}
  </section>
);

/* ───────── BOOK GRID + COVER ART ───────── */
const BookGrid: React.FC<{ books: FeaturedBook[]; onOpen?: (b: any) => void }> = ({ books, onOpen }) => (
  <div className="relative">
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {books.map((b, i) => (
        <BookCard key={i} book={b} onOpen={() => onOpen?.(b)} />
      ))}
    </div>
    {/* Right side carousel arrow */}
    <button
      type="button"
      aria-label="Next"
      className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border items-center justify-center shadow-md hover:bg-[#F7F2E8]"
      style={{ borderColor: CARD_BORDER }}
    >
      <ChevronRight className="w-4 h-4" style={{ color: NAVY }} />
    </button>
  </div>
);

const BookCard: React.FC<{ book: FeaturedBook; onOpen: () => void }> = ({ book, onOpen }) => (
  <article
    onClick={onOpen}
    className="group cursor-pointer rounded-xl overflow-hidden bg-white border shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.10)] hover:-translate-y-0.5 transition-all"
    style={{ borderColor: CARD_BORDER }}
  >
    {/* Cover */}
    <div className="relative aspect-[3/4]">
      <BookCoverArt variant={book.cover} heading={book.coverHeading} subheading={book.coverSubheading} />
      <span
        className="absolute top-2.5 left-2.5 inline-flex items-center rounded-md px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider"
        style={{ backgroundColor: 'rgba(255,255,255,0.92)', color: NAVY }}
      >
        {book.tag}
      </span>
    </div>

    {/* Footer */}
    <div className="px-3 py-3">
      <h3 className="text-[12px] font-extrabold leading-tight line-clamp-2 min-h-[28px]" style={{ color: NAVY }}>{book.title}</h3>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-[11px]" style={{ color: '#F1A52E' }}>★</span>
          <span className="text-[11px] font-bold" style={{ color: NAVY }}>{book.rating}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-semibold text-[#7B7058]">
          <Bookmark className="w-3 h-3" />
          <span>{book.saves}</span>
        </div>
      </div>
    </div>
  </article>
);

/* Cover art per subject — CSS + SVG. Designed to evoke editorial textbook covers. */
const BookCoverArt: React.FC<{ variant: CoverVariant; heading: string; subheading: string }> = ({ variant, heading, subheading }) => {
  switch (variant) {
    case 'math':
      return (
        <CoverFrame bg="linear-gradient(180deg,#E0CFA8 0%,#D9C396 100%)">
          <CoverTitle ink="#5C3A1F" heading={heading} subheading={subheading} />
          <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 140" aria-hidden>
            <text x="12" y="80" fontFamily="Fraunces, serif" fontSize="14" fill="#5C3A1F" fontWeight="700">∫</text>
            <text x="78" y="60" fontFamily="Fraunces, serif" fontSize="11" fill="#5C3A1F" fontWeight="700">π</text>
            <text x="20" y="115" fontFamily="Fraunces, serif" fontSize="9" fill="#5C3A1F" fontWeight="700">x²</text>
            <text x="68" y="120" fontFamily="Fraunces, serif" fontSize="9" fill="#5C3A1F" fontWeight="700">√</text>
            <circle cx="50" cy="95" r="14" fill="none" stroke="#5C3A1F" strokeWidth="0.6" />
            <circle cx="50" cy="95" r="9" fill="none" stroke="#5C3A1F" strokeWidth="0.4" />
          </svg>
        </CoverFrame>
      );
    case 'english':
      return (
        <CoverFrame bg="linear-gradient(180deg,#E5C7A0 0%,#D9B585 100%)">
          <CoverTitle ink="#4D2E12" heading={heading} subheading={subheading} />
          <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 100 140" aria-hidden>
            <path d="M20 90 L50 78 L50 122 L20 110 Z" fill="#4D2E12" opacity="0.18" />
            <path d="M50 78 L80 90 L80 122 L50 122 Z" fill="#4D2E12" opacity="0.12" />
            <path d="M50 78 L50 122" stroke="#4D2E12" strokeWidth="0.4" />
            {[82, 88, 94, 100, 106].map((y) => (
              <line key={y} x1="22" x2="48" y1={y} y2={y} stroke="#4D2E12" strokeWidth="0.4" opacity="0.5" />
            ))}
            {[82, 88, 94, 100, 106].map((y) => (
              <line key={`r${y}`} x1="52" x2="78" y1={y} y2={y} stroke="#4D2E12" strokeWidth="0.4" opacity="0.5" />
            ))}
          </svg>
        </CoverFrame>
      );
    case 'biology':
      return (
        <CoverFrame bg="linear-gradient(180deg,#1F4030 0%,#152C22 100%)">
          <CoverTitle ink="#E2D7B0" heading={heading} subheading={subheading} />
          <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 140" aria-hidden>
            <path d="M30 78 Q42 90, 30 110" stroke="#A8C19A" strokeWidth="0.7" fill="none" />
            <path d="M70 78 Q58 90, 70 110" stroke="#A8C19A" strokeWidth="0.7" fill="none" />
            {[82, 90, 98, 106].map((y) => (
              <line key={y} x1="34" x2="66" y1={y} y2={y} stroke="#A8C19A" strokeWidth="0.6" />
            ))}
            <path d="M50 70 C 56 76, 60 82, 50 88 C 40 82, 44 76, 50 70 Z" fill="#A8C19A" opacity="0.5" />
            <path d="M50 88 L50 120" stroke="#A8C19A" strokeWidth="0.6" />
          </svg>
        </CoverFrame>
      );
    case 'chemistry':
      return (
        <CoverFrame bg="linear-gradient(180deg,#1B3157 0%,#10213C 100%)">
          <CoverTitle ink="#E2D7B0" heading={heading} subheading={subheading} />
          <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 100 140" aria-hidden>
            {[
              [30, 88], [50, 78], [70, 88], [50, 100], [30, 108], [70, 108],
            ].map(([cx, cy], i) => (
              <polygon
                key={i}
                points={hexPoints(cx, cy, 6)}
                fill="none"
                stroke="#7DB1E5"
                strokeWidth="0.6"
              />
            ))}
            <line x1="36" y1="88" x2="44" y2="78" stroke="#7DB1E5" strokeWidth="0.5" />
            <line x1="56" y1="78" x2="64" y2="88" stroke="#7DB1E5" strokeWidth="0.5" />
            <line x1="64" y1="88" x2="56" y2="100" stroke="#7DB1E5" strokeWidth="0.5" />
            <line x1="44" y1="100" x2="36" y2="88" stroke="#7DB1E5" strokeWidth="0.5" />
            <line x1="36" y1="108" x2="44" y2="100" stroke="#7DB1E5" strokeWidth="0.5" />
            <line x1="56" y1="100" x2="64" y2="108" stroke="#7DB1E5" strokeWidth="0.5" />
          </svg>
        </CoverFrame>
      );
    case 'physics':
      return (
        <CoverFrame bg="linear-gradient(180deg,#10243F 0%,#091830 100%)">
          <CoverTitle ink="#E2D7B0" heading={heading} subheading={subheading} />
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 140" aria-hidden>
            <defs>
              <radialGradient id="planet" cx="0.4" cy="0.4">
                <stop offset="0%" stopColor="#5B7CA8" />
                <stop offset="100%" stopColor="#1A2E50" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="100" r="18" fill="url(#planet)" />
            <ellipse cx="50" cy="100" rx="28" ry="6" fill="none" stroke="#7DB1E5" strokeWidth="0.5" opacity="0.7" />
            <ellipse cx="50" cy="100" rx="32" ry="9" fill="none" stroke="#7DB1E5" strokeWidth="0.4" opacity="0.5" />
            {[[28, 60], [78, 70], [22, 95], [80, 110], [72, 50]].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="0.7" fill="#E5D7A8" />
            ))}
          </svg>
        </CoverFrame>
      );
    case 'geography':
      return (
        <CoverFrame bg="linear-gradient(180deg,#274D6E 0%,#1A3954 100%)">
          <CoverTitle ink="#E2D7B0" heading={heading} subheading={subheading} />
          <svg className="absolute inset-0 w-full h-full opacity-50" viewBox="0 0 100 140" aria-hidden>
            <circle cx="50" cy="100" r="22" fill="none" stroke="#A8C19A" strokeWidth="0.6" />
            <circle cx="50" cy="100" r="22" fill="#3F6F5A" opacity="0.55" />
            <path d="M40 90 Q50 84, 60 92 Q66 100, 60 110 Q48 116, 40 108 Z" fill="#A8C19A" opacity="0.7" />
            <ellipse cx="50" cy="100" rx="22" ry="6" fill="none" stroke="#A8C19A" strokeWidth="0.4" />
          </svg>
        </CoverFrame>
      );
    case 'ict':
      return (
        <CoverFrame bg="linear-gradient(180deg,#15294A 0%,#0B1A33 100%)">
          <CoverTitle ink="#E2D7B0" heading={heading} subheading={subheading} />
          <svg className="absolute inset-0 w-full h-full opacity-50" viewBox="0 0 100 140" aria-hidden>
            {[78, 86, 94, 102, 110].map((y) => (
              <line key={y} x1="20" x2="80" y1={y} y2={y} stroke="#7DB1E5" strokeWidth="0.4" />
            ))}
            {[28, 40, 52, 64, 76].map((x) => (
              <line key={x} x1={x} x2={x} y1="78" y2="110" stroke="#7DB1E5" strokeWidth="0.4" />
            ))}
            {[[28, 78], [52, 86], [64, 102], [40, 94], [76, 110]].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="1.5" fill="#7DB1E5" />
            ))}
          </svg>
        </CoverFrame>
      );
    case 'literature':
      return (
        <CoverFrame bg="linear-gradient(180deg,#E0C6A0 0%,#D4B383 100%)">
          <CoverTitle ink="#4D2E12" heading={heading} subheading={subheading} />
          <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 100 140" aria-hidden>
            {[78, 84, 90, 96, 102, 108, 114].map((y) => (
              <line key={y} x1="20" x2="80" y1={y} y2={y} stroke="#4D2E12" strokeWidth="0.3" />
            ))}
            <path d="M30 78 L70 78 L70 116 L30 116 Z" fill="none" stroke="#4D2E12" strokeWidth="0.5" />
          </svg>
        </CoverFrame>
      );
    case 'business':
      return (
        <CoverFrame bg="linear-gradient(180deg,#15294A 0%,#0B1A33 100%)">
          <CoverTitle ink="#E2D7B0" heading={heading} subheading={subheading} />
          <svg className="absolute inset-0 w-full h-full opacity-55" viewBox="0 0 100 140" aria-hidden>
            <line x1="22" x2="78" y1="115" y2="115" stroke="#7DB1E5" strokeWidth="0.5" />
            {[
              [28, 110, 6, 5], [40, 100, 6, 15], [52, 92, 6, 23], [64, 84, 6, 31], [76, 76, 6, 39],
            ].map(([x, y, w, h], i) => (
              <rect key={i} x={x} y={y} width={w} height={h} fill="#7DB1E5" opacity={0.55 + i * 0.08} />
            ))}
            <path d="M28 105 L40 95 L52 88 L64 80 L76 72" stroke="#E5D7A8" strokeWidth="0.7" fill="none" />
          </svg>
        </CoverFrame>
      );
    case 'accounting':
      return (
        <CoverFrame bg="linear-gradient(180deg,#5C2222 0%,#3F1414 100%)">
          <CoverTitle ink="#E2D7B0" heading={heading} subheading={subheading} />
          <svg className="absolute inset-0 w-full h-full opacity-50" viewBox="0 0 100 140" aria-hidden>
            <rect x="22" y="80" width="56" height="34" fill="none" stroke="#E5D7A8" strokeWidth="0.5" />
            <line x1="22" y1="90" x2="78" y2="90" stroke="#E5D7A8" strokeWidth="0.4" />
            <line x1="50" y1="80" x2="50" y2="114" stroke="#E5D7A8" strokeWidth="0.4" />
            <text x="29" y="88" fontFamily="Fraunces, serif" fontSize="6" fill="#E5D7A8" fontWeight="700">$</text>
            <text x="58" y="88" fontFamily="Fraunces, serif" fontSize="6" fill="#E5D7A8" fontWeight="700">€</text>
          </svg>
        </CoverFrame>
      );
  }
};

const CoverFrame: React.FC<{ bg: string; children: React.ReactNode }> = ({ bg, children }) => (
  <div className="relative w-full h-full" style={{ backgroundImage: bg }}>
    <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,rgba(255,255,255,0.22),transparent_55%)]" />
    {children}
  </div>
);

const CoverTitle: React.FC<{ ink: string; heading: string; subheading: string }> = ({ ink, heading, subheading }) => (
  <div className="absolute inset-x-0 top-0 px-4 pt-5 text-center">
    <p className="text-[14px] font-extrabold tracking-[0.04em] leading-tight" style={{ color: ink, fontFamily: 'Fraunces, serif' }}>{heading}</p>
    <p className="mt-0.5 text-[8px] font-bold tracking-[0.22em]" style={{ color: ink, opacity: 0.78 }}>{subheading}</p>
  </div>
);

function hexPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
  }
  return pts.join(' ');
}

/* ───────── POPULAR THIS WEEK ───────── */
const PopularThisWeek: React.FC<{ items: typeof POPULAR }> = ({ items }) => (
  <section className="rounded-2xl bg-white border p-5" style={{ borderColor: CARD_BORDER }}>
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-[16px] font-extrabold" style={{ color: NAVY }}>Popular This Week</h3>
      <button type="button" className="text-[12px] font-extrabold inline-flex items-center gap-0.5" style={{ color: ORANGE }}>
        View All <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
    <ul className="space-y-2.5">
      {items.map((it) => (
        <li key={it.rank} className="flex items-center gap-3">
          <span className="text-[13px] font-extrabold w-3 text-center" style={{ color: NAVY }}>{it.rank}</span>
          <span className="w-9 h-12 rounded-md overflow-hidden shrink-0">
            <BookCoverArt variant={it.cover} heading="" subheading="" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-extrabold leading-tight line-clamp-2" style={{ color: NAVY }}>{it.title}</p>
          </div>
          <div className="flex flex-col items-end gap-0.5 shrink-0">
            <span className="rounded px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider" style={{ backgroundColor: '#F0E9D8', color: NAVY }}>{it.tag}</span>
            <span className="text-[10px] font-bold text-[#7B7058]">{it.views}</span>
          </div>
          <Bookmark className="w-4 h-4 text-[#A89C82] shrink-0" />
        </li>
      ))}
    </ul>
  </section>
);

/* ───────── CONTINUE LEARNING ───────── */
const ContinueLearning: React.FC<{ items: typeof CONTINUE }> = ({ items }) => (
  <section className="rounded-2xl bg-white border p-5" style={{ borderColor: CARD_BORDER }}>
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-[16px] font-extrabold" style={{ color: NAVY }}>Continue Learning</h3>
      <button type="button" className="text-[12px] font-extrabold inline-flex items-center gap-0.5" style={{ color: ORANGE }}>
        View All <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
    <ul className="space-y-3">
      {items.map((it, i) => (
        <li key={i} className="flex items-center gap-3">
          <span className="w-9 h-12 rounded-md overflow-hidden shrink-0">
            <BookCoverArt variant={it.cover} heading="" subheading="" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-extrabold leading-tight line-clamp-2" style={{ color: NAVY }}>{it.title}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <progress
                value={it.progress}
                max={100}
                className="block flex-1 h-1.5 rounded-full overflow-hidden appearance-none [&::-webkit-progress-bar]:bg-[#F0E9D8] [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:bg-[#0B1F35] [&::-webkit-progress-value]:rounded-full [&::-moz-progress-bar]:bg-[#0B1F35]"
              />
              <span className="text-[10px] font-extrabold" style={{ color: NAVY }}>{it.progress}%</span>
            </div>
          </div>
          <button type="button" className="rounded-md text-white text-[11px] font-extrabold px-3 py-1.5 shrink-0" style={{ backgroundColor: NAVY }}>
            Continue
          </button>
        </li>
      ))}
    </ul>
  </section>
);

/* ───────── SUBJECT COLLECTIONS ───────── */
const SubjectCollections: React.FC = () => (
  <section className="mt-8">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-[20px] font-extrabold" style={{ color: NAVY }}>Subject Collections</h2>
      <button type="button" className="inline-flex items-center gap-0.5 text-[12.5px] font-extrabold" style={{ color: ORANGE }}>
        View All Collections <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {COLLECTIONS.map(({ name, count, icon: Icon, bg, ink, iconWrap }) => (
        <button
          key={name}
          type="button"
          className={`group relative h-[78px] rounded-xl ${bg} ${ink} px-3 flex items-center gap-3 overflow-hidden text-left shadow-[0_2px_4px_rgba(15,23,42,0.06),0_8px_22px_-12px_rgba(15,23,42,0.20)]`}
        >
          <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconWrap}`}>
            <Icon className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-extrabold tracking-tight leading-tight">{name}</p>
            <p className="mt-0.5 text-[10px] font-semibold opacity-80">{count}</p>
          </div>
        </button>
      ))}
    </div>
  </section>
);
