import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Bell, ChevronDown, ChevronRight, ChevronLeft, ArrowLeft,
  Home, GraduationCap, ClipboardList, Trophy, ListChecks, CalendarDays,
  Calendar, Award, Bookmark, HelpCircle, NotebookPen, Clock, Star,
  ScrollText, Calculator, Sigma, Crown, Check,
  CircleHelp, BadgeCheck, Gauge,
  Camera, Trash2, CheckCircle2,
  FlaskConical, BookOpen,
} from 'lucide-react';
import { MathExpr } from '../components/reader/MathExpr';

/* ────── DESIGN TOKENS ────── */
const NAVY = '#0B1F3A';
const COPPER = '#C47A45';
const SOFT_BORDER = '#E6EAF2';
const MUTED = '#64748B';
const SUCCESS = '#12B76A';
const REVIEW_ORANGE = '#F97316';

const SIDEBAR_NAV: { label: string; icon: React.ComponentType<{ className?: string }>; active?: boolean }[] = [
  { label: 'Home',           icon: Home },
  { label: 'Primary',        icon: GraduationCap },
  { label: 'Assessments',    icon: ClipboardList, active: true },
  { label: 'My Results',     icon: Trophy },
  { label: 'Practice Tests', icon: ListChecks },
  { label: 'Exam Timetable', icon: CalendarDays },
  { label: 'Study Planner',  icon: Calendar },
  { label: 'Leaderboard',    icon: Trophy },
  { label: 'Achievements',   icon: Award },
  { label: 'Bookmarks',      icon: Bookmark },
  { label: 'Doubt Solver',   icon: HelpCircle },
];

const SIDEBAR_LIBRARY = [
  { label: 'My Notes',        icon: NotebookPen },
  { label: 'Recently Viewed', icon: Clock },
  { label: 'Saved Questions', icon: Star },
];

const SIDEBAR_QUICK = [
  { label: 'Revision Notes', icon: NotebookPen },
  { label: 'Past Papers',    icon: ScrollText },
  { label: 'Calculator',     icon: Calculator },
  { label: 'Formula Sheet',  icon: Sigma },
];

type QStatus = 'answered' | 'review' | 'unanswered' | 'active';
const TOTAL_QUESTIONS = 20;
const INITIAL_STATUSES: QStatus[] = Array.from({ length: TOTAL_QUESTIONS }, (_, i) => {
  if (i < 4) return 'answered';
  if (i === 4) return 'active';
  if (i === 10) return 'review';
  return 'unanswered';
});

const TOOLS = [
  { label: 'Calculator',       icon: Calculator,    tint: '#E0EBFF', ink: '#2563EB' },
  { label: 'Formula Sheet',    icon: Sigma,         tint: '#EEEAFE', ink: '#7C3AED' },
  { label: 'Periodic Table',   icon: FlaskConical,  tint: '#FFE4E6', ink: '#EF4444' },
  { label: 'Maths Reference',  icon: BookOpen,      tint: '#FCEFD8', ink: COPPER },
];

/* ────── PAGE ────── */
export const ExercisePage: React.FC = () => {
  const [statuses, setStatuses] = useState<QStatus[]>(INITIAL_STATUSES);
  const [currentIdx, setCurrentIdx] = useState(4);
  const [answer, setAnswer] = useState('');
  const [workingImage, setWorkingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Mock countdown — purely cosmetic.
  const [timeLeft, setTimeLeft] = useState(48 * 60 + 32);
  useEffect(() => {
    const id = window.setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, []);
  const totalSeconds = 60 * 60;
  const elapsed = totalSeconds - timeLeft;
  const timePct = Math.max(0, Math.min(100, (elapsed / totalSeconds) * 100));

  const bump = (oldIdx: number, newIdx: number, markAnswered = false) => {
    setStatuses((prev) => {
      const next = [...prev];
      if (next[oldIdx] === 'active') next[oldIdx] = markAnswered || answer.trim() ? 'answered' : 'unanswered';
      next[newIdx] = 'active';
      return next;
    });
  };
  const onPrev = () => setCurrentIdx((i) => { if (i === 0) return i; const n = i - 1; bump(i, n); return n; });
  const onNext = (markAnswered = false) => setCurrentIdx((i) => { const n = Math.min(TOTAL_QUESTIONS - 1, i + 1); bump(i, n, markAnswered); return n; });
  const onPickQuestion = (idx: number) => setCurrentIdx((i) => { bump(i, idx); return idx; });
  const onMarkReview = () => setStatuses((prev) => prev.map((s, i) => (i === currentIdx ? 'review' : s)));

  const onPickFile = () => fileInputRef.current?.click();
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setWorkingImage(URL.createObjectURL(file));
  };
  const onClearImage = () => {
    if (workingImage) URL.revokeObjectURL(workingImage);
    setWorkingImage(null);
  };

  const breakdown = useBreakdown(statuses);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FBFCFF' }}>
      <ExerciseTopBar />

      <div className="mx-auto max-w-[1500px] px-5 py-5">
        <div className="grid lg:grid-cols-[230px,1fr,320px] gap-6">
          <ExerciseSidebar />

          <main className="min-w-0 space-y-5">
            <Header />
            <StatRow timeLeft={timeLeft} answered={breakdown.answered} score={68} />
            <QuestionNavigator statuses={statuses} onPick={onPickQuestion} />
            <QuestionCard
              questionNum={currentIdx + 1}
              answer={answer}
              onAnswerChange={setAnswer}
              workingImage={workingImage}
              onPickFile={onPickFile}
              onClearImage={onClearImage}
              fileInputRef={fileInputRef}
              onFileChange={onFileChange}
            />
            <ActionRow
              onPrev={onPrev}
              onMarkReview={onMarkReview}
              onNext={() => onNext(answer.trim().length > 0 || workingImage != null)}
            />
          </main>

          <aside className="space-y-5 min-w-0">
            <AssessmentProgress {...breakdown} />
            <TimeManagement timeLeft={timeLeft} pct={timePct} />
            <ToolsCard />
            <QuestionPalette statuses={statuses} onPick={onPickQuestion} />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ExercisePage;

/* ────── TOP BAR ────── */
const ExerciseTopBar: React.FC = () => {
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

          <div className="relative flex-1 max-w-[480px]">
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
            {['Library', 'Syllabus', 'Past Papers', 'Live Sessions', 'Video Lessons', 'Collections', 'My Learning'].map((label) => (
              <span key={label} className="text-[13.5px] font-bold cursor-pointer" style={{ color: NAVY }}>{label}</span>
            ))}
          </nav>

          <div className="flex items-center gap-3 ml-auto shrink-0">
            <button type="button" className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-50" aria-label="Notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center">3</span>
            </button>
            <button type="button" className="flex items-center gap-2.5 group">
              <img src="https://i.pravatar.cc/80?img=12" alt="David Okello" className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm" />
              <div className="hidden sm:block leading-tight text-left">
                <p className="text-[13px] font-extrabold" style={{ color: NAVY }}>David Okello</p>
                <p className="text-[11px] font-bold" style={{ color: MUTED }}>Student</p>
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
const ExerciseSidebar: React.FC = () => (
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
          {['Unlimited Assessments', 'Detailed Solutions', 'Performance Analytics', 'Priority Support'].map((t) => (
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
      <ArrowLeft className="w-3.5 h-3.5" /> Back to Assessments
    </Link>
    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
      <div>
        <h1 className="text-[34px] lg:text-[36px] tracking-tight" style={{ color: NAVY, fontFamily: 'Fraunces, serif', fontWeight: 600 }}>
          Quadratic Equations – Exercise 1
        </h1>
        <p className="text-[12.5px] font-semibold mt-1" style={{ color: COPPER }}>Mathematics • Secondary • Year 10</p>
      </div>
      <button type="button" className="self-start xl:self-auto inline-flex items-center gap-2 rounded-xl bg-white border-2 px-4 py-2.5 text-[12.5px] font-extrabold" style={{ color: COPPER, borderColor: COPPER }}>
        Finish Assessment
      </button>
    </div>
  </section>
);

/* ────── STAT ROW ────── */
const StatRow: React.FC<{ timeLeft: number; answered: number; score: number }> = ({ timeLeft, answered, score }) => {
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');
  const items = [
    { label: 'Time Left',  value: `${mm}:${ss}`,         icon: Clock,        tint: '#E0EBFF', ink: '#2563EB' },
    { label: 'Questions',  value: `${answered} / ${TOTAL_QUESTIONS}`, icon: CircleHelp, tint: '#FFF6E0', ink: '#F59E0B' },
    { label: 'Score',      value: `${score}%`,           icon: BadgeCheck,   tint: '#E5F6EC', ink: SUCCESS },
    { label: 'Difficulty', value: 'Medium',              icon: Gauge,        tint: '#FCEFD8', ink: COPPER, valueInk: COPPER },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="rounded-xl bg-white border px-4 py-3 flex items-center gap-3" style={{ borderColor: SOFT_BORDER }}>
            <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: s.tint }}>
              <Icon className="w-4 h-4" style={{ color: s.ink }} />
            </span>
            <div>
              <p className="text-[11px] font-bold" style={{ color: MUTED }}>{s.label}</p>
              <p className="text-[18px] font-extrabold" style={{ color: s.valueInk || NAVY }}>{s.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ────── QUESTION NAVIGATOR ────── */
const QuestionNavigator: React.FC<{ statuses: QStatus[]; onPick: (i: number) => void }> = ({ statuses, onPick }) => (
  <div className="flex items-center gap-1.5 overflow-x-auto py-1">
    {statuses.map((s, i) => <NavBubble key={i} num={i + 1} status={s} onClick={() => onPick(i)} />)}
    <button type="button" className="ml-2 w-8 h-8 rounded-full bg-white border flex items-center justify-center shrink-0" style={{ borderColor: SOFT_BORDER }} aria-label="More">
      <ChevronRight className="w-3.5 h-3.5" style={{ color: MUTED }} />
    </button>
  </div>
);

const NavBubble: React.FC<{ num: number; status: QStatus; onClick: () => void }> = ({ num, status, onClick }) => {
  const size = 'w-9 h-9';
  if (status === 'active') {
    return (
      <button type="button" onClick={onClick} className={`relative ${size} rounded-full flex items-center justify-center shrink-0 bg-white`} style={{ border: `2px solid ${REVIEW_ORANGE}` }}>
        <span className="text-[13px] font-extrabold" style={{ color: NAVY }}>{num}</span>
        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: REVIEW_ORANGE }} />
      </button>
    );
  }
  if (status === 'answered') {
    return (
      <button type="button" onClick={onClick} className={`${size} rounded-full flex items-center justify-center shrink-0 relative`} style={{ backgroundColor: '#E5F6EC' }}>
        <span className="text-[12.5px] font-extrabold" style={{ color: SUCCESS }}>{num}</span>
        <CheckCircle2 className="w-3 h-3 absolute -bottom-0.5 -right-0.5" style={{ color: SUCCESS }} />
      </button>
    );
  }
  if (status === 'review') {
    return (
      <button type="button" onClick={onClick} className={`${size} rounded-full flex items-center justify-center shrink-0`} style={{ backgroundColor: '#FFEEDD', border: `1.5px solid ${REVIEW_ORANGE}` }}>
        <span className="text-[12.5px] font-extrabold" style={{ color: REVIEW_ORANGE }}>{num}</span>
      </button>
    );
  }
  return (
    <button type="button" onClick={onClick} className={`${size} rounded-full flex items-center justify-center shrink-0`} style={{ backgroundColor: '#F1F5F9' }}>
      <span className="text-[12.5px] font-extrabold" style={{ color: '#94A3B8' }}>{num}</span>
    </button>
  );
};

/* ────── QUESTION CARD ────── */
const QuestionCard: React.FC<{
  questionNum: number;
  answer: string;
  onAnswerChange: (v: string) => void;
  workingImage: string | null;
  onPickFile: () => void;
  onClearImage: () => void;
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ questionNum, answer, onAnswerChange, workingImage, onPickFile, onClearImage, fileInputRef, onFileChange }) => (
  <section className="rounded-2xl bg-white border p-7" style={{ borderColor: SOFT_BORDER }}>
    <div className="flex items-center justify-between">
      <p className="text-[13px] font-extrabold" style={{ color: COPPER }}>Question {questionNum}</p>
      <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-extrabold" style={{ color: NAVY }}>5 marks</span>
    </div>

    <p className="mt-4 text-[15px]" style={{ color: NAVY }}>Solve the quadratic equation:</p>
    <div className="my-5 flex justify-center">
      <MathExpr tex="2x^2 - 5x - 3 = 0" className="text-[28px]" />
    </div>

    <p className="mt-2 text-[13.5px] font-extrabold" style={{ color: NAVY }}>Your Answer</p>
    <input
      value={answer}
      onChange={(e) => onAnswerChange(e.target.value)}
      placeholder="Type your final answer here (e.g. x = 3, x = -1/2)"
      className="mt-2 w-full rounded-xl border bg-white px-4 py-4 text-[14px] outline-none focus:border-[#C47A45] focus:ring-2 focus:ring-[#C47A45]/20"
      style={{ borderColor: SOFT_BORDER, color: NAVY }}
    />

    <p className="mt-6 text-[14px] font-extrabold" style={{ color: NAVY }}>Show Your Working <span className="font-semibold" style={{ color: MUTED }}>(Step-by-step solution)</span></p>
    <p className="text-[12px]" style={{ color: MUTED }}>Upload a clear photo of your working / solution steps</p>

    <div className="mt-3 grid lg:grid-cols-2 gap-4">
      <button
        type="button"
        onClick={onPickFile}
        className="rounded-xl border-2 border-dashed bg-[#F8FAFC] hover:bg-white transition-colors p-8 flex flex-col items-center justify-center text-center"
        style={{ borderColor: '#D6DEE9', minHeight: 240 }}
      >
        <span className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EEF4FF' }}>
          <Camera className="w-7 h-7" style={{ color: NAVY }} />
        </span>
        <p className="mt-3 text-[14px] font-extrabold" style={{ color: NAVY }}>Take a Photo</p>
        <p className="mt-1 text-[12px]" style={{ color: MUTED }}>Capture your working using your camera</p>
        <p className="mt-2 text-[10.5px]" style={{ color: MUTED }}>PNG, JPG up to 10MB</p>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFileChange}
        className="hidden"
      />

      <div className="relative rounded-xl overflow-hidden border" style={{ borderColor: SOFT_BORDER, minHeight: 240 }}>
        {workingImage ? (
          <>
            <img src={workingImage} alt="Your handwritten working" className="w-full h-full object-cover" />
            <span className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" style={{ color: SUCCESS }} />
            </span>
            <button
              type="button"
              onClick={onClearImage}
              className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-slate-50"
              aria-label="Remove image"
            >
              <Trash2 className="w-4 h-4" style={{ color: '#EF4444' }} />
            </button>
          </>
        ) : (
          <DemoWorkingPreview />
        )}
      </div>
    </div>
  </section>
);

/* Realistic placeholder of handwritten working — pure SVG so it always renders. */
const DemoWorkingPreview: React.FC = () => (
  <div className="absolute inset-0">
    <svg viewBox="0 0 480 360" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="paperBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FBF7EF" />
          <stop offset="100%" stopColor="#F0E7D2" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="480" height="360" fill="url(#paperBg)" />
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={i} x1="14" y1={36 + i * 26} x2="466" y2={36 + i * 26} stroke="#9CC0F4" strokeOpacity="0.55" strokeWidth="0.6" />
      ))}
      <line x1="56" y1="0" x2="56" y2="360" stroke="#EF4444" strokeOpacity="0.55" strokeWidth="0.8" />

      <g fill="#1E3A6A" style={{ fontFamily: '"Caveat", "Comic Sans MS", cursive', fontWeight: 600 }}>
        <text x="80" y="56" fontSize="22">2x² − 5x − 3 = 0</text>
        <text x="80" y="86" fontSize="18">Using quadratic formula</text>
        <text x="115" y="118" fontSize="20">x =</text>
        <g transform="translate(160, 102)">
          <text x="0" y="14" fontSize="18">−b ± √(b² − 4ac)</text>
          <line x1="-6" y1="22" x2="178" y2="22" stroke="#1E3A6A" strokeWidth="1.2" />
          <text x="80" y="40" fontSize="18">2a</text>
        </g>
        <text x="80" y="184" fontSize="18">a = 2, b = −5, c = −3</text>
        <text x="115" y="216" fontSize="20">x =</text>
        <g transform="translate(160, 200)">
          <text x="0" y="14" fontSize="17">−(−5) ± √((−5)² − 4(2)(−3))</text>
          <line x1="-6" y1="22" x2="234" y2="22" stroke="#1E3A6A" strokeWidth="1.2" />
          <text x="100" y="40" fontSize="18">2(2)</text>
        </g>
        <g transform="translate(160, 252)">
          <text x="0" y="14" fontSize="18">= 5 ± √(25 + 24)</text>
          <line x1="40" y1="22" x2="170" y2="22" stroke="#1E3A6A" strokeWidth="1.2" />
          <text x="90" y="40" fontSize="18">4</text>
        </g>
        <g transform="translate(180, 296)">
          <text x="0" y="14" fontSize="18">= 5 ± √49</text>
          <line x1="32" y1="22" x2="142" y2="22" stroke="#1E3A6A" strokeWidth="1.2" />
          <text x="78" y="40" fontSize="18">4</text>
        </g>
        <text x="80" y="346" fontSize="18">x₁ = 12/4 = 3 ,   x₂ = −2/4 = −1/2</text>
      </g>
    </svg>
    <span className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center">
      <CheckCircle2 className="w-4 h-4" style={{ color: SUCCESS }} />
    </span>
    <button
      type="button"
      className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-slate-50"
      aria-label="Remove demo image"
    >
      <Trash2 className="w-4 h-4" style={{ color: '#EF4444' }} />
    </button>
  </div>
);

/* ────── ACTION ROW ────── */
const ActionRow: React.FC<{ onPrev: () => void; onMarkReview: () => void; onNext: () => void }> = ({ onPrev, onMarkReview, onNext }) => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    <button type="button" onClick={onPrev} className="inline-flex items-center gap-1.5 rounded-xl bg-white border px-4 py-2.5 text-[12.5px] font-extrabold" style={{ color: NAVY, borderColor: SOFT_BORDER }}>
      <ChevronLeft className="w-3.5 h-3.5" /> Previous
    </button>
    <div className="flex items-center gap-3 ml-auto">
      <button type="button" onClick={onMarkReview} className="inline-flex items-center gap-1.5 rounded-xl bg-white border px-4 py-2.5 text-[12.5px] font-extrabold" style={{ color: NAVY, borderColor: SOFT_BORDER }}>
        Save &amp; Review
      </button>
      <button type="button" onClick={onNext} className="inline-flex items-center gap-1.5 rounded-xl text-white px-5 py-2.5 text-[12.5px] font-extrabold shadow-md" style={{ backgroundColor: NAVY }}>
        Save &amp; Next <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
);

/* ────── ASSESSMENT PROGRESS ────── */
const AssessmentProgress: React.FC<{ answered: number; review: number; unanswered: number; pct: number }> = ({ answered, review, unanswered, pct }) => (
  <section className="rounded-2xl bg-white border p-5" style={{ borderColor: SOFT_BORDER }}>
    <p className="text-[14px] font-extrabold" style={{ color: NAVY }}>Assessment Progress</p>
    <div className="mt-3 flex justify-center">
      <ProgressDonut value={pct} />
    </div>
    <ul className="mt-4 space-y-2 text-[12.5px]">
      <li className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SUCCESS }} />
        <span className="font-bold" style={{ color: NAVY }}>Answered</span>
        <span className="ml-auto font-extrabold" style={{ color: NAVY }}>{answered}</span>
      </li>
      <li className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: REVIEW_ORANGE }} />
        <span className="font-bold" style={{ color: NAVY }}>Review</span>
        <span className="ml-auto font-extrabold" style={{ color: NAVY }}>{review}</span>
      </li>
      <li className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
        <span className="font-bold" style={{ color: NAVY }}>Unanswered</span>
        <span className="ml-auto font-extrabold" style={{ color: NAVY }}>{unanswered}</span>
      </li>
    </ul>
  </section>
);

const ProgressDonut: React.FC<{ value: number }> = ({ value }) => {
  const r = 50;
  const c = 2 * Math.PI * r;
  const off = c - (Math.max(0, Math.min(100, value)) / 100) * c;
  return (
    <svg viewBox="0 0 140 140" className="w-[140px] h-[140px]" aria-hidden>
      <circle cx="70" cy="70" r={r} fill="none" stroke="#F1F5F9" strokeWidth="12" />
      <circle cx="70" cy="70" r={r} fill="none" stroke={SUCCESS} strokeWidth="12" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 70 70)" />
      <text x="70" y="72" textAnchor="middle" fontSize="26" fontWeight="800" fill={NAVY}>{Math.round(value)}%</text>
      <text x="70" y="92" textAnchor="middle" fontSize="11" fontWeight="700" fill={MUTED}>Completed</text>
    </svg>
  );
};

/* ────── TIME MANAGEMENT ────── */
const TimeManagement: React.FC<{ timeLeft: number; pct: number }> = ({ timeLeft, pct }) => {
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');
  return (
    <section className="rounded-2xl bg-white border p-5" style={{ borderColor: SOFT_BORDER }}>
      <p className="text-[14px] font-extrabold mb-3" style={{ color: NAVY }}>Time Management</p>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[13px] font-bold" style={{ color: MUTED }}>Total Time</p>
        <p className="text-[13px] font-extrabold" style={{ color: NAVY }}>60:00</p>
      </div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[13px] font-bold" style={{ color: NAVY }}>Time Left</p>
        <p className="text-[13px] font-extrabold" style={{ color: SUCCESS }}>{mm}:{ss}</p>
      </div>
      <progress value={Math.max(1, 100 - pct)} max={100} className="block w-full h-2 rounded-full overflow-hidden appearance-none [&::-webkit-progress-bar]:bg-slate-100 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:bg-[#12B76A] [&::-webkit-progress-value]:rounded-full [&::-moz-progress-bar]:bg-[#12B76A]" />
      <p className="mt-3 text-[11.5px]" style={{ color: MUTED }}>
        Stay calm and pace yourself. You&apos;re doing great! <span aria-hidden>✨</span>
      </p>
    </section>
  );
};

/* ────── TOOLS ────── */
const ToolsCard: React.FC = () => (
  <section className="rounded-2xl bg-white border p-5" style={{ borderColor: SOFT_BORDER }}>
    <p className="text-[14px] font-extrabold mb-3" style={{ color: NAVY }}>Tools</p>
    <ul className="divide-y" style={{ borderColor: SOFT_BORDER }}>
      {TOOLS.map(({ label, icon: Icon, tint, ink }) => (
        <li key={label}>
          <button type="button" className="w-full flex items-center gap-3 px-1 py-3 hover:bg-slate-50 rounded-md text-left">
            <span className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: tint }}>
              <Icon className="w-4 h-4" style={{ color: ink }} />
            </span>
            <span className="text-[12.5px] font-extrabold flex-1" style={{ color: NAVY }}>{label}</span>
            <ChevronRight className="w-4 h-4 shrink-0" style={{ color: MUTED }} />
          </button>
        </li>
      ))}
    </ul>
  </section>
);

/* ────── QUESTION PALETTE ────── */
const QuestionPalette: React.FC<{ statuses: QStatus[]; onPick: (i: number) => void }> = ({ statuses, onPick }) => (
  <section className="rounded-2xl bg-white border p-5" style={{ borderColor: SOFT_BORDER }}>
    <p className="text-[14px] font-extrabold mb-3" style={{ color: NAVY }}>Question Palette</p>
    <div className="grid grid-cols-5 gap-2">
      {statuses.map((s, i) => <NavBubble key={i} num={i + 1} status={s} onClick={() => onPick(i)} />)}
    </div>
    <div className="mt-4 grid grid-cols-3 gap-2 text-[10.5px] font-bold" style={{ color: MUTED }}>
      <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: SUCCESS }} />Answered</span>
      <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: REVIEW_ORANGE }} />Review</span>
      <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300" />Unanswered</span>
    </div>
  </section>
);

/* ────── helpers ────── */
function useBreakdown(statuses: QStatus[]) {
  const answered = statuses.filter((s) => s === 'answered').length;
  const review = statuses.filter((s) => s === 'review').length;
  const active = statuses.filter((s) => s === 'active').length;
  const unanswered = statuses.length - answered - review - active;
  const pct = (answered / statuses.length) * 100;
  return { answered, review, unanswered: unanswered + active, pct };
}
