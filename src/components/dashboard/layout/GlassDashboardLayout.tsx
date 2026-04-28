import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { TopNavbar } from '../../navigation/TopNavbar';
import { AICopilotWidget } from '../../copilot/AICopilotWidget';
import { useAuth } from '../../../contexts/AuthContext';
import { ErrorBoundary } from '../../ErrorBoundary';

export const GlassDashboardLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Pages that own their own full-bleed chrome (sidebar + top bar) and
  // therefore should not be wrapped in the dashboard glass shell. Their
  // top bars and sidebars are intentionally edge-to-edge to match the
  // reference designs.
  const path = location.pathname;
  const ownsChrome =
    path === '/dashboard/admin' || path === '/dashboard/admin/' ||
    path === '/dashboard/parent' || path === '/dashboard/parent/';

  // Enforce dark mode for the legacy glass dashboards. Pages that own
  // their own chrome use a light premium palette, so skip the dark
  // toggle for them to avoid washing out their colors.
  useEffect(() => {
    if (ownsChrome) return;
    document.documentElement.classList.add('dark');
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, [ownsChrome]);

  if (ownsChrome) {
    return (
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col relative overflow-x-hidden font-sans"
    >
      {/* Top Navigation */}
      <TopNavbar isGlass={true} />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* Footer can be omitted for dashboards or replaced with a minimal version */}
      <footer className="w-full border-t border-white/5 py-6 text-center text-sm text-slate-400 mt-auto bg-black/20 backdrop-blur-md">
        <p>&copy; 2026 Maple Online School. All rights reserved.</p>
      </footer>

      {/* Copilots */}
      {user?.role === 'universal_student' && <AICopilotWidget />}
    </div>
  );
};
