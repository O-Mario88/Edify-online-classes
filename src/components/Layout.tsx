import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Video, 
  CreditCard,
  User,
  LogOut,
  Menu,
  X,
  Brain,
  Target,
  Lightbulb,
  MessageSquare,
  Library
} from 'lucide-react';
import { useState } from 'react';
import { AICopilotWidget } from './copilot/AICopilotWidget';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardRoute = () => {
    switch (user?.role) {
      case 'universal_student':
        return '/dashboard/student';
      case 'independent_teacher':
        return '/dashboard/teacher';
      case 'institution_admin':
        return '/dashboard/institution';
      case 'platform_admin':
        return '/dashboard/admin';
      case 'parent':
        return '/dashboard/parent';
      default:
        return '/';
    }
  };

  const getNavigationItems = () => {
    const baseItems = [
      { label: 'Home', href: '/', icon: GraduationCap },
      { label: 'Classes', href: '/classes', icon: BookOpen },
      { label: 'Resource Center', href: '/library', icon: Library },
      { label: 'Live Sessions', href: '/live-sessions', icon: Video },
      { label: 'Marketplace', href: '/marketplace', icon: BookOpen },
    ];

    // Add role-specific navigation items
    if (user) {
      if (user.role === 'universal_student') {
        baseItems.push(
          { label: 'Learning Path', href: '/learning-path', icon: Target },
          { label: 'Peer Tutoring', href: '/peer-tutoring', icon: MessageSquare },
          { label: 'Exam Registration', href: '/exam-registration', icon: CreditCard }
        );
      } else if (user.role === 'independent_teacher') {
        baseItems.push(
          { label: 'AI Assistant', href: '/ai-assistant', icon: Brain },
          { label: 'Peer Tutoring', href: '/peer-tutoring', icon: MessageSquare }
        );
      } else if (user.role === 'institution_admin') {
        baseItems.push(
          { label: 'AI Assistant', href: '/ai-assistant', icon: Brain },
          { label: 'Institution Management', href: '/institution-management', icon: Users }
        );
      } else if (user.role === 'platform_admin') {
        baseItems.push(
          { label: 'Platform Analytics', href: '/platform-analytics', icon: Brain },
          { label: 'Institution Management', href: '/institution-management', icon: Users }
        );
      } else if (user.role === 'parent') {
        baseItems.push(
          { label: 'Parent Portal', href: '/dashboard/parent', icon: Users },
          { label: 'AI Assistant', href: '/ai-assistant', icon: Brain }
        );
      } else {
        // For general users
        baseItems.push(
          { label: 'Projects', href: '/projects', icon: Lightbulb },
          { label: 'Peer Tutoring', href: '/peer-tutoring', icon: MessageSquare }
        );
      }
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Maple Online School</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* User Menu / Auth Buttons */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to={getDashboardRoute()}
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3B82F6&color=fff`;
                      }}
                    />
                    <span className="hidden sm:block">{user.name}</span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <Button variant="outline" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="sm">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

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
