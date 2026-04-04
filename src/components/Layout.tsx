import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap } from 'lucide-react';
import { AICopilotWidget } from './copilot/AICopilotWidget';
import { TopNavbar } from './navigation/TopNavbar';

export const Layout: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNavbar />

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <GraduationCap className="h-6 w-6 text-blue-400" />
                <span className="text-lg font-semibold">Maple Online School</span>
              </div>
              <p className="text-gray-400 text-sm">
                Empowering students worldwide with quality online education.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Classes</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/classes" className="hover:text-white">All Classes</Link></li>
                <li><Link to="/classes" className="hover:text-white">Primary Level</Link></li>
                <li><Link to="/classes" className="hover:text-white">Secondary Level</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">AI-Powered Learning</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/learning-path" className="hover:text-white">Personal Learning Path</Link></li>
                <li><Link to="/projects" className="hover:text-white">Collaborative Projects</Link></li>
                <li><Link to="/peer-tutoring" className="hover:text-white">Peer Tutoring</Link></li>
                <li><Link to="/ai-assistant" className="hover:text-white">AI Teaching Assistant</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/library" className="hover:text-white">Resource Center</Link></li>
                <li><Link to="/live-sessions" className="hover:text-white">Live Sessions</Link></li>
                <li><Link to="/forum" className="hover:text-white">Community Forum</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 Maple Online School. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      {/* AI Copilot Widget */}
      {user?.role === 'universal_student' && <AICopilotWidget />}
    </div>
  );
};
