import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  School, 
  BookOpen, 
  GraduationCap, 
  Store, 
  Activity 
} from 'lucide-react';
import { PermissionGuard } from '../components/auth/PermissionGuard';
import { Permission } from '../lib/permissions.matrix';

export const AnalyticsLayout = () => {
  const location = useLocation();

  const navItems = [
    {
      to: '/analytics/platform',
      icon: <BarChart3 className="w-5 h-5" />,
      label: 'Executive Overview',
      permission: Permission.VIEW_GLOBAL_ANALYTICS,
    },
    {
      to: '/analytics/institution',
      icon: <School className="w-5 h-5" />,
      label: 'Institution Intelligence',
      permission: Permission.VIEW_INSTITUTION_DASHBOARD,
    },
    {
      to: '/analytics/learning',
      icon: <BookOpen className="w-5 h-5" />,
      label: 'Learning & Assessment',
      permission: Permission.VIEW_ALL_GRADES,
    },
    {
      to: '/analytics/exams',
      icon: <GraduationCap className="w-5 h-5" />,
      label: 'National Exams',
      permission: Permission.MANAGE_EXAMS,
    },
    {
      to: '/analytics/marketplace',
      icon: <Store className="w-5 h-5" />,
      label: 'Marketplace & Revenue',
      permission: Permission.MANAGE_BILLING,
    },
    {
      to: '/analytics/system',
      icon: <Activity className="w-5 h-5" />,
      label: 'System Health',
      permission: Permission.MANAGE_PLATFORM_SETTINGS,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden pt-16">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
            Command Center
          </h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <PermissionGuard key={item.to} require={item.permission}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            </PermissionGuard>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header block for context */}
          <div className="flex items-center justify-between pb-6 border-b border-gray-200">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 capitalize">
                {location.pathname.split('/').pop()?.replace('-', ' ')} Analytics
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Real-time operational metrics and diagnostic signals.
              </p>
            </div>
            
            {/* Context Filters could go here */}
            <div className="flex items-center gap-4">
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                <option>Last 30 Days</option>
                <option>This Term</option>
                <option>Year to Date</option>
              </select>
            </div>
          </div>

          <Outlet />
        </div>
      </main>
    </div>
  );
};
