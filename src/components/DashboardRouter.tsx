import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const DashboardRouter: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    switch (user.role as string) {
      case 'universal_student':
      case 'institution_student':
      case 'student':
        navigate('/dashboard/student', { replace: true });
        break;
      case 'independent_teacher':
      case 'institution_teacher':
      case 'universal_teacher':
      case 'teacher':
        navigate('/dashboard/teacher', { replace: true });
        break;
      case 'platform_admin':
      case 'superadmin':
        navigate('/dashboard/admin', { replace: true });
        break;
      case 'institution_admin':
        navigate('/dashboard/institution', { replace: true });
        break;
      case 'parent_guardian':
      case 'parent':
        navigate('/dashboard/parent', { replace: true });
        break;
      default:
        navigate('/dashboard/student', { replace: true });
        break;
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    </div>
  );
};
