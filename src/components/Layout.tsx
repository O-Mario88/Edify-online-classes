import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap } from 'lucide-react';
import { AICopilotWidget } from './copilot/AICopilotWidget';
import { TopNavbar } from './navigation/TopNavbar';

export const Layout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  // Pages that own their own top navigation. Suppressing the global
  // TopNavbar on these routes avoids stacking two headers and lets the
  // page wear its own brand chrome.
  // Pages that own their own top navigation. Suppressing the global
  // TopNavbar on these routes avoids stacking two headers and lets the
  // page wear its own brand chrome.
  const path = location.pathname;
  const ownsNav =
    path === '/' ||
    path.startsWith('/library') ||
    path.startsWith('/secondary') ||
    path === '/primary' ||
    path === '/primary/' || // primary syllabus owns its own chrome (deeper /primary/* routes keep the global nav)
    path === '/classes' ||
    path === '/classes/' ||
    path.startsWith('/live-sessions') ||
    path.startsWith('/peer-learning') ||
    path.startsWith('/syllabus') ||
    /\/subject\/[^/]+$/.test(path) || // /classes/:classId/subject/:subjectId — topical arrangement page
    path.startsWith('/learn') || // unified content reader (notes / textbooks / topics)
    path.startsWith('/exercises') || // assessment / exercise page owns its own chrome
    path.startsWith('/projects') || // projects workspace owns its own chrome
    path.startsWith('/video-lessons') || // video lesson player owns its own chrome
    path === '/dashboard/admin' ||
    path === '/dashboard/admin/' ||
    path === '/dashboard/parent' ||
    path === '/dashboard/parent/';

  // Pages that ship their own footer (and therefore don't want the
  // global Maple Online School footer stacked underneath).
  const ownsFooter = path.startsWith('/peer-learning');

  return (
    <div className="min-h-screen bg-slate-50">
      {!ownsNav && <TopNavbar />}

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      {!ownsFooter && (
      <footer className="bg-[#0f2a45] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-8 md:gap-8">
            
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-2 lg:mb-0">
              <div className="flex items-center space-x-2 mb-3">
                <GraduationCap className="h-6 w-6 text-white" />
                <span className="text-base md:text-lg font-bold text-white tracking-wide">Maple Online School</span>
              </div>
              <p className="text-white text-xs md:text-sm leading-relaxed max-w-sm">
                Empowering students worldwide with quality online education.
              </p>
            </div>
            
            {/* Links Columns */}
            <div>
              <h4 className="font-bold text-sm mb-4 text-white uppercase tracking-wider">Classes</h4>
              <ul className="space-y-2.5 text-xs md:text-sm text-white">
                <li><Link to="/classes" className="hover:text-white transition-colors">All Classes</Link></li>
                <li><Link to="/classes" className="hover:text-white transition-colors">Primary Level</Link></li>
                <li><Link to="/classes" className="hover:text-white transition-colors">Secondary Level</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-sm mb-4 text-white uppercase tracking-wider">AI Learning</h4>
              <ul className="space-y-2.5 text-xs md:text-sm text-white">
                <li><Link to="/learning-path" className="hover:text-white transition-colors">Personal Path</Link></li>
                <li><Link to="/projects" className="hover:text-white transition-colors">Collaborative</Link></li>
                <li><Link to="/peer-tutoring" className="hover:text-white transition-colors">Peer Tutoring</Link></li>
                <li><Link to="/ai-assistant" className="hover:text-white transition-colors">AI Assistant</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-sm mb-4 text-white uppercase tracking-wider">Community</h4>
              <ul className="space-y-2.5 text-xs md:text-sm text-white">
                <li><Link to="/library" className="hover:text-white transition-colors">Resource Center</Link></li>
                <li><Link to="/live-sessions" className="hover:text-white transition-colors">Live Sessions</Link></li>
                <li><Link to="/forum" className="hover:text-white transition-colors">Community Forum</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-sm mb-4 text-white uppercase tracking-wider">Support</h4>
              <ul className="space-y-2.5 text-xs md:text-sm text-white">
                <li><Link to="/support" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/forum" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-white/20 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <p className="text-xs md:text-sm text-white font-medium">&copy; 2025 Maple Online School. All rights reserved.</p>
            <div className="flex justify-center md:justify-end gap-4 text-white text-xs font-medium">
               <Link to="/" className="hover:text-white transition-colors">Terms</Link>
               <Link to="/" className="hover:text-white transition-colors">Privacy</Link>
               <Link to="/" className="hover:text-white transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
      )}

      {/* AI Copilot Widget */}
      {user?.role === 'universal_student' && <AICopilotWidget />}
    </div>
  );
};
