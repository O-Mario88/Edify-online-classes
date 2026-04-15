import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { 
  GraduationCap, BookOpen, Users, Video, CreditCard, LogOut, Menu, Brain,
  Target, Lightbulb, MessageSquare, Library, ChevronDown
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';

interface TopNavbarProps {
  isGlass?: boolean;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ isGlass = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardRoute = () => {
    const isPrimary = (user as any)?.school_level === 'primary';
    switch (user?.role) {
      case 'universal_student': return '/dashboard/student';
      case 'institution_student': return isPrimary ? '/dashboard/primary/student' : '/dashboard/student';
      case 'independent_teacher': return '/dashboard/teacher';
      case 'institution_teacher': return isPrimary ? '/dashboard/primary/teacher' : '/dashboard/teacher';
      case 'institution_admin': return '/dashboard/institution';
      case 'platform_admin': return '/dashboard/admin';
      case 'parent': return isPrimary ? '/dashboard/primary/parent' : '/dashboard/parent';
      default: return '/';
    }
  };

  // Nav Configuration
  const isPrimary = (user as any)?.school_level === 'primary';
  const primaryLinks = [
    { label: 'Home', href: '/', icon: GraduationCap },
    { label: 'Classes', href: isPrimary ? '/primary' : '/classes', icon: BookOpen },
    { label: 'Resource Center', href: '/library', icon: Library },
  ];

  const engageLinks = [
    { label: 'Live Sessions', href: '/live-sessions', icon: Video },
  ];

  const toolsLinks = [
    { label: 'Marketplace', href: '/marketplace', icon: BookOpen },
  ];

  if (user) {
    if (user.role === 'universal_student') {
      toolsLinks.push(
        { label: 'Learning Path', href: '/learning-path', icon: Target },
        { label: 'Exam Registration', href: '/exam-registration', icon: CreditCard }
      );
      engageLinks.push({ label: 'Peer Tutoring', href: '/peer-tutoring', icon: MessageSquare });
    } else if (user.role === 'institution_student') {
      if (isPrimary) {
        toolsLinks.push(
          { label: 'My Syllabus', href: `/primary/class/${(user as any).class_level || 'p7'}`, icon: BookOpen },
          { label: 'Learning Path', href: '/learning-path', icon: Target }
        );
      } else {
        toolsLinks.push(
          { label: 'Learning Path', href: '/learning-path', icon: Target },
          { label: 'Exam Registration', href: '/exam-registration', icon: CreditCard }
        );
      }
      engageLinks.push({ label: 'Peer Tutoring', href: '/peer-tutoring', icon: MessageSquare });
    } else if (user.role === 'independent_teacher') {
      toolsLinks.push({ label: 'AI Assistant', href: '/ai-assistant', icon: Brain });
      engageLinks.push({ label: 'Peer Tutoring', href: '/peer-tutoring', icon: MessageSquare });
    } else if (user.role === 'institution_admin') {
      toolsLinks.push(
        { label: 'AI Assistant', href: '/ai-assistant', icon: Brain },
        { label: 'Institution Management', href: '/institution-management', icon: Users }
      );
    } else if (user.role === 'platform_admin') {
      toolsLinks.push(
        { label: 'Institution Management', href: '/institution-management', icon: Users }
      );
    } else if (user.role === 'parent') {
      toolsLinks.push(
        { label: 'Parent Portal', href: '/dashboard/parent', icon: Users },
        { label: 'AI Assistant', href: '/ai-assistant', icon: Brain }
      );
    } else {
      toolsLinks.push({ label: 'Projects', href: '/projects', icon: Lightbulb });
      engageLinks.push({ label: 'Peer Tutoring', href: '/peer-tutoring', icon: MessageSquare });
    }
  } else {
    // Unauthenticated user
    engageLinks.push({ label: 'Peer Tutoring', href: '/peer-tutoring', icon: MessageSquare });
  }

  const isActive = (href: string) => location.pathname === href || (href !== '/' && location.pathname.startsWith(href));

  const NavLink = ({ item }: { item: any }) => (
    <Link
      to={item.href}
      className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
        isActive(item.href) 
          ? isGlass ? 'bg-white/10 text-white shadow-sm border border-white/20' : 'bg-indigo-100 text-indigo-700 shadow-sm border border-indigo-100/50' 
          : isGlass ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-800 hover:text-indigo-800 hover:bg-slate-50'
      }`}
    >
      <item.icon className={`h-4 w-4 ${isActive(item.href) ? isGlass ? 'text-blue-400' : 'text-indigo-800' : isGlass ? 'text-slate-800' : 'text-slate-800'}`} />
      <span>{item.label}</span>
    </Link>
  );

  return (
    <header className={`${isGlass ? 'bg-slate-900/60 border-white/10 text-white' : 'bg-white/80 border-slate-200/60'} backdrop-blur-xl sticky top-0 z-50 border-b shadow-[0_4px_24px_-12px_rgba(0,0,0,0.08)]`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 mr-6 shrink-0 group">
            <div className={`p-1.5 rounded-lg transition-colors shadow-sm ${isGlass ? 'bg-blue-600 group-hover:bg-blue-500' : 'bg-indigo-600 group-hover:bg-indigo-700'}`}>
               <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className={`text-xl font-extrabold tracking-tight ${isGlass ? 'text-white' : 'text-slate-900'}`}>Maple<span className={`font-bold ml-1 ${isGlass ? 'text-blue-400' : 'text-indigo-800'}`}>OS</span></span>
          </Link>

          {/* Nav Container (Desktop) */}
          <nav className="hidden xl:flex items-center space-x-1.5 flex-1">
            {primaryLinks.map(item => <NavLink key={item.href} item={item} />)}

            <div className="h-5 border-l border-slate-200 mx-1"></div>

            {/* Engage Dropdown */}
            {engageLinks.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all outline-none ${isGlass ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-800 hover:text-indigo-800 hover:bg-slate-50'}`}>
                  <span>Engage</span>
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 p-2 rounded-xl shadow-xl shadow-slate-900/5 border-slate-100 animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2">
                  <DropdownMenuLabel className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 px-2">Community & Live</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-100 mb-1" />
                  {engageLinks.map(item => (
                    <DropdownMenuItem key={item.href} asChild className="rounded-lg mb-0.5 cursor-pointer focus:bg-indigo-50 focus:text-indigo-700">
                      <Link to={item.href} className="flex items-center w-full">
                        <item.icon className="w-4 h-4 mr-2.5 opacity-70" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Tools Dropdown */}
            {toolsLinks.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all outline-none ${isGlass ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-800 hover:text-indigo-800 hover:bg-slate-50'}`}>
                  <span>Tools</span>
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 p-2 rounded-xl shadow-xl shadow-slate-900/5 border-slate-100 animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2">
                  <DropdownMenuLabel className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 px-2">Opportunities</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-100 mb-1" />
                  {toolsLinks.map(item => (
                    <DropdownMenuItem key={item.href} asChild className="rounded-lg mb-0.5 cursor-pointer focus:bg-indigo-50 focus:text-indigo-700">
                      <Link to={item.href} className="flex items-center w-full">
                        <item.icon className="w-4 h-4 mr-2.5 opacity-70" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-3 ml-auto">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to={getDashboardRoute()}
                  className={`hidden sm:flex items-center space-x-2.5 rounded-full py-1 pr-4 pl-1 transition-all border ${isGlass ? 'bg-white/10 hover:bg-white/20 border-white/20' : 'bg-slate-50 hover:bg-slate-100 border-slate-200/60'}`}
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-7 w-7 rounded-full object-cover shadow-sm bg-white"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=4F46E5&color=fff`;
                    }}
                  />
                  <span className={`text-sm font-bold ${isGlass ? 'text-slate-100' : 'text-slate-700'}`}>{user.name?.split(' ')[0] || 'User'}</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className={`hidden sm:flex rounded-full ${isGlass ? 'text-slate-800 hover:text-rose-400 hover:bg-rose-950/50' : 'text-slate-800 hover:text-rose-600 hover:bg-rose-50'}`}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" className={`font-semibold rounded-xl ${isGlass ? 'text-slate-300 hover:text-white hover:bg-white/10 bg-transparent' : 'text-slate-800 hover:text-slate-900 bg-transparent hover:bg-slate-50'}`}>
                    Sign In
                  </Button>
                </Link>
                <Link to="/login">
                  <Button className={`font-bold text-white shadow-md rounded-xl px-5 ${isGlass ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/50' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'}`}>
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile / Tablet Menu Trapper */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="xl:hidden p-2 rounded-xl text-slate-800 hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-indigo-500">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] sm:w-[350px] p-0 flex flex-col bg-slate-50 border-l border-slate-200/60">
                <SheetHeader className="p-5 border-b border-slate-200/60 bg-white text-left">
                  <SheetTitle className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center">
                    <GraduationCap className="h-6 w-6 text-indigo-800 mr-2" />
                    Maple<span className="text-indigo-800">OS</span>
                  </SheetTitle>
                </SheetHeader>
                
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
                  {/* Primary Mobile Links */}
                  <div className="space-y-1">
                    <p className="px-3 text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Core Hub</p>
                    {primaryLinks.map(item => (
                       <Link
                         key={item.href}
                         to={item.href}
                         onClick={() => setMobileMenuOpen(false)}
                         className={`flex items-center space-x-3 px-3 py-3 rounded-xl text-base font-semibold transition-colors ${isActive(item.href) ? 'bg-indigo-100/50 text-indigo-700' : 'text-slate-700 hover:bg-slate-100'}`}
                       >
                         <item.icon className={`h-5 w-5 ${isActive(item.href) ? 'text-indigo-800' : 'text-slate-800'}`} />
                         <span>{item.label}</span>
                       </Link>
                    ))}
                  </div>

                  {/* Engage Mobile Links */}
                  {engageLinks.length > 0 && (
                    <div className="space-y-1">
                      <p className="px-3 text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Community</p>
                      {engageLinks.map(item => (
                         <Link
                           key={item.href}
                           to={item.href}
                           onClick={() => setMobileMenuOpen(false)}
                           className={`flex items-center space-x-3 px-3 py-3 rounded-xl text-base font-semibold transition-colors ${isActive(item.href) ? 'bg-indigo-100/50 text-indigo-700' : 'text-slate-700 hover:bg-slate-100'}`}
                         >
                           <item.icon className={`h-5 w-5 ${isActive(item.href) ? 'text-indigo-800' : 'text-slate-800'}`} />
                           <span>{item.label}</span>
                         </Link>
                      ))}
                    </div>
                  )}

                  {/* Tools Mobile Links */}
                  {toolsLinks.length > 0 && (
                    <div className="space-y-1">
                      <p className="px-3 text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Tools & Opportunities</p>
                      {toolsLinks.map(item => (
                         <Link
                           key={item.href}
                           to={item.href}
                           onClick={() => setMobileMenuOpen(false)}
                           className={`flex items-center space-x-3 px-3 py-3 rounded-xl text-base font-semibold transition-colors ${isActive(item.href) ? 'bg-indigo-100/50 text-indigo-700' : 'text-slate-700 hover:bg-slate-100'}`}
                         >
                           <item.icon className={`h-5 w-5 ${isActive(item.href) ? 'text-indigo-800' : 'text-slate-800'}`} />
                           <span>{item.label}</span>
                         </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile Footer Auth */}
                <div className="p-4 bg-white border-t border-slate-200/60 shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.05)] mt-auto">
                  {user ? (
                    <div className="space-y-3">
                      <Link
                        to={getDashboardRoute()}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200/50"
                      >
                        <img
                          src={user.avatar}
                          alt={user.name || 'User'}
                          className="h-10 w-10 rounded-full object-cover bg-white shadow-sm"
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-none">{user.name || 'User'}</p>
                          <p className="text-xs font-medium text-slate-700 mt-1 capitalize">{user.role?.replace('_', ' ') || 'User'}</p>
                        </div>
                      </Link>
                      <Button
                        variant="destructive"
                        className="w-full font-bold shadow-sm"
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full font-bold border-slate-200">
                          Sign In
                        </Button>
                      </Link>
                      <Link to="/login" className="flex-[2_2_0%]" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20">
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};
