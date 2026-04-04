import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * DashboardRouter – only runs at the EXACT `/dashboard` index route.
 * It reads the user's role and redirects to the correct sub-dashboard.
 *
 * On a page refresh at e.g. `/dashboard/teacher`, this component does NOT
 * render because React Router matches the more specific child route instead.
 * The previous bug was that useEffect always fired and overrode the URL.
 *
 * Safety: if the user is already on a valid sub-route (e.g. they navigated
 * here via browser back-button), we bail out and don't redirect.
 */
export const DashboardRouter: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    // Only redirect when we're exactly on /dashboard (the index route).
    // If the user is already on a sub-route like /dashboard/teacher, do nothing.
    const path = location.pathname.replace(/\/+$/, ''); // trim trailing slashes
    if (path !== '/dashboard') {
      return;
    }

    const role = (user.role || '').toString().toLowerCase();

    if (role.includes('student')) {
      navigate('/dashboard/student', { replace: true });
    } else if (role.includes('teacher')) {
      navigate('/dashboard/teacher', { replace: true });
    } else if (role.includes('admin') && !role.includes('institution')) {
      navigate('/dashboard/admin', { replace: true });
    } else if (role.includes('institution')) {
      navigate('/dashboard/institution', { replace: true });
    } else if (role.includes('parent')) {
      navigate('/dashboard/parent', { replace: true });
    } else {
      // Safe fallback — go to student dashboard
      navigate('/dashboard/student', { replace: true });
    }
  }, [user, isLoading, navigate, location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    </div>
  );
};
