import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { TopNavbar } from '../../navigation/TopNavbar';
import { AICopilotWidget } from '../../copilot/AICopilotWidget';
import { useAuth } from '../../../contexts/AuthContext';
import { ErrorBoundary } from '../../ErrorBoundary';

export const GlassDashboardLayout: React.FC = () => {
  const { user } = useAuth();

  // Enforce dark mode for dashboards on mount
  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => {
      // Clean up the dark class so public landing pages reset correctly
      document.documentElement.classList.remove('dark');
    };
  }, []);

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
