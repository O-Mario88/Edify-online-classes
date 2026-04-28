import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Bell, ChevronDown, Menu, X, LogOut, LifeBuoy } from 'lucide-react';
import { NotificationsDrawer } from '../dashboard/NotificationsDrawer';

/* ───────── DESIGN TOKENS (matched to /classes & /library reference) ───────── */
const NAVY = '#0B1F35';
const ORANGE = '#C97849';

interface TopNavbarProps {
  /** Kept for backwards-compat with callers; no longer flips visuals. */
  isGlass?: boolean;
}

const NAV: { label: string; href: string }[] = [
  { label: 'Library',       href: '/library' },
  { label: 'Syllabus',      href: '/classes' },
  { label: 'Past Papers',   href: '/library?view=past-papers' },
  { label: 'Video Lessons', href: '/live-sessions' },
  { label: 'Collections',   href: '/library?view=collections' },
  { label: 'My Learning',   href: '/learning-path' },
];

export const TopNavbar: React.FC<TopNavbarProps> = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');

  const dashboardRoute = (() => {
    const isPrimary = (user as any)?.school_level === 'primary';
    switch (user?.role) {
      case 'universal_student':   return '/dashboard/student';
      case 'institution_student': return isPrimary ? '/dashboard/primary/student' : '/dashboard/student';
      case 'independent_teacher': return '/dashboard/teacher';
      case 'institution_teacher': return isPrimary ? '/dashboard/primary/teacher' : '/dashboard/teacher';
      case 'institution_admin':   return '/dashboard/institution';
      case 'platform_admin':      return '/dashboard/admin';
      case 'parent':              return isPrimary ? '/dashboard/primary/parent' : '/dashboard/parent';
      default:                    return '/';
    }
  })();

  const isActive = (href: string) => {
    if (href === '/classes') return location.pathname === '/classes' || location.pathname.startsWith('/secondary');
    if (href === '/library') return location.pathname.startsWith('/library');
    return location.pathname === href || (href !== '/' && location.pathname.startsWith(href));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#EFE7D6]">
      <div className="mx-auto max-w-[1500px] px-5">
        <div className="flex items-center gap-6 h-[88px]">
          {/* Brand lockup — MAPLE / ONLINE SCHOOL */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${ORANGE}1A` }}>
              <MapleBookIcon className="w-7 h-7" />
            </div>
            <div className="leading-none hidden sm:block">
              <p className="text-[24px] font-extrabold tracking-[0.04em]" style={{ color: NAVY }}>MAPLE</p>
              <p className="mt-1 text-[10px] font-bold tracking-[0.32em]" style={{ color: NAVY }}>ONLINE SCHOOL</p>
            </div>
          </Link>

          {/* Search */}
          <div className="relative flex-1 max-w-[460px] hidden md:block">
            <Search className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-[#A89C82] pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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

          {/* Primary nav */}
          <nav className="hidden xl:flex items-center gap-7">
            {NAV.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="relative inline-flex items-center text-[13.5px] font-bold transition-colors"
                style={{ color: isActive(item.href) ? ORANGE : NAVY }}
              >
                <span>{item.label}</span>
                {isActive(item.href) && (
                  <span className="absolute -bottom-2 left-0 right-0 h-[3px] rounded-full" style={{ backgroundColor: ORANGE }} />
                )}
              </Link>
            ))}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <Link to="/support" className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center hover:bg-[#F7F2E8]" aria-label="Help">
              <LifeBuoy className="w-5 h-5" style={{ color: NAVY }} />
            </Link>
            {user ? (
              <>
                <NotificationsDrawer variant="light" />
                <Link to={dashboardRoute} className="hidden sm:flex items-center gap-2.5 group">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[14px] font-extrabold overflow-hidden shrink-0" style={{ backgroundColor: NAVY }}>
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name || 'User'} className="w-full h-full object-cover" />
                    ) : (
                      (user.name?.[0] || 'M').toUpperCase()
                    )}
                  </div>
                  <div className="hidden lg:block leading-tight pr-1">
                    <p className="text-[13px] font-extrabold" style={{ color: NAVY }}>My Account</p>
                    <p className="text-[11px] font-bold capitalize" style={{ color: ORANGE }}>{user.role?.replace(/_/g, ' ') || 'Member'}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[#A89C82] group-hover:text-[#0B1F35] hidden lg:block" />
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center hover:bg-rose-50"
                  aria-label="Sign out"
                >
                  <LogOut className="w-5 h-5 text-rose-600" />
                </button>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="px-3 py-2 text-[13px] font-bold rounded-full" style={{ color: NAVY }}>
                  Sign in
                </Link>
                <Link
                  to="/login"
                  className="rounded-full px-5 py-2.5 text-[13px] font-extrabold shadow-md text-white"
                  style={{ backgroundColor: ORANGE }}
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile burger */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="xl:hidden w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#F7F2E8]"
              aria-label="Open menu"
            >
              {mobileOpen ? <X className="w-5 h-5" style={{ color: NAVY }} /> : <Menu className="w-5 h-5" style={{ color: NAVY }} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="xl:hidden border-t border-[#EFE7D6] py-3">
            <div className="md:hidden mb-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-[#A89C82] pointer-events-none" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="w-full bg-[#F7F2E8] border border-[#EAE0C9] rounded-full py-2.5 pl-12 pr-4 text-[13px] outline-none placeholder:text-[#A89C82]"
                />
              </div>
            </div>
            <nav className="grid">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-[13.5px] font-bold rounded-md hover:bg-[#F7F2E8]"
                  style={{ color: isActive(item.href) ? ORANGE : NAVY }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            {!user && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="rounded-full border text-center py-2 text-[13px] font-bold" style={{ borderColor: ORANGE, color: NAVY }}>
                  Sign in
                </Link>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="rounded-full text-center py-2 text-[13px] font-extrabold text-white" style={{ backgroundColor: ORANGE }}>
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

/* MAPLE book icon — open book + Maple-leaf accent (matches /classes & /library) */
const MapleBookIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden>
    <defs>
      <linearGradient id="mTopNav" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#0B1F35" />
        <stop offset="100%" stopColor="#163556" />
      </linearGradient>
    </defs>
    <path d="M5 9 L16 13 L27 9 L27 24 L16 28 L5 24 Z" fill="url(#mTopNav)" />
    <path d="M16 13 L16 28" stroke="white" strokeOpacity="0.35" strokeWidth="0.6" />
    <path d="M16 7 C 14 4, 11 4, 11 7 C 11 10, 14 11, 16 13 C 18 11, 21 10, 21 7 C 21 4, 18 4, 16 7 Z" fill={ORANGE} />
  </svg>
);
