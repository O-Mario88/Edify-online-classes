import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Menu, X, ChevronDown } from 'lucide-react';
import type { CountryCode } from './types';

interface Props {
  country: CountryCode;
  onCountryChange: (c: CountryCode) => void;
}

const NAV: { label: string; href: string }[] = [
  { label: 'Library', href: '/library' },
  { label: 'Syllabus', href: '/classes' },
  { label: 'Past Papers', href: '/library?view=past-papers' },
  { label: 'Video Lessons', href: '/live-sessions' },
  { label: 'Collections', href: '/library?view=collections' },
  { label: 'My Learning', href: '/learning-path' },
];

const FLAG: Record<NonNullable<CountryCode>, string> = {
  UG: '🇺🇬',
  KE: '🇰🇪',
  OTHER: '🌍',
};

const LABEL: Record<NonNullable<CountryCode>, string> = {
  UG: 'Uganda',
  KE: 'Kenya',
  OTHER: 'Other',
};

export const HomePublicNavbar: React.FC<Props> = ({ country, onCountryChange }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);

  return (
    <header className="bg-[#0B1F35] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 lg:h-[72px]">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <GraduationCap className="w-5 h-5 text-[#0B1F35]" />
            </div>
            <span className="text-[15px] font-extrabold tracking-tight text-white">
              Maple <span className="font-semibold text-amber-200/90">Online School</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-10">
            {NAV.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="px-3 py-2 text-[13.5px] font-semibold text-slate-200 hover:text-white rounded-md transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            {/* Country pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCountryOpen((v) => !v)}
                onBlur={() => setTimeout(() => setCountryOpen(false), 120)}
                className="flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 px-3 py-1.5 text-xs font-semibold transition-colors"
                aria-haspopup="listbox"
                aria-expanded={countryOpen ? true : false}
              >
                <span aria-hidden>{country ? FLAG[country] : '🌍'}</span>
                <span className="hidden sm:inline">{country ? LABEL[country] : 'Pick country'}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>
              {countryOpen && (
                <div
                  className="absolute right-0 mt-2 w-44 rounded-xl bg-white text-slate-800 shadow-2xl ring-1 ring-slate-900/10 overflow-hidden z-50"
                >
                  {(['UG', 'KE', 'OTHER'] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        onCountryChange(c);
                        setCountryOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 text-sm font-medium hover:bg-slate-50 flex items-center gap-2 ${
                        country === c ? 'bg-amber-50/80 text-slate-900' : ''
                      }`}
                    >
                      <span aria-hidden>{FLAG[c]}</span>
                      {LABEL[c]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sign in (text link) */}
            <Link
              to="/login"
              className="hidden sm:inline-flex px-3 py-1.5 text-[13.5px] font-semibold text-slate-200 hover:text-white"
            >
              Sign in
            </Link>

            {/* Get Started — amber pill */}
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-[#0B1F35] px-4 py-2 text-[13px] font-extrabold shadow-lg shadow-amber-500/20 transition-colors"
            >
              Get Started
            </Link>

            {/* Mobile burger */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden p-2 -mr-2 rounded-md text-slate-200 hover:text-white hover:bg-white/10"
              aria-label="Open menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-white/10 py-3">
            <nav className="grid">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-2 py-2.5 text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/5 rounded-md"
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full border border-white/20 text-white text-center text-sm font-semibold py-2"
                >
                  Sign in
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full bg-amber-400 hover:bg-amber-300 text-[#0B1F35] text-center text-sm font-extrabold py-2"
                >
                  Get Started
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
