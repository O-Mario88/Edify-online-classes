import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { Permission } from '../lib/permissions.matrix';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredPermission?: Permission;
  requireAnyPermission?: Permission[];
  requireAllPermissions?: Permission[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  requiredPermission,
  requireAnyPermission,
  requireAllPermissions
}) => {
  const { user, isLoading } = useAuth();
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Legacy role check
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Granular RBAC Checks
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/" replace />; // Alternatively: /unauthorized
  }

  if (requireAnyPermission && !hasAnyPermission(requireAnyPermission)) {
    return <Navigate to="/" replace />;
  }

  if (requireAllPermissions && !hasAllPermissions(requireAllPermissions)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
