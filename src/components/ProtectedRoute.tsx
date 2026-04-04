import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { Permission } from '../lib/permissions.matrix';

/**
 * Canonical role-family mapping.
 * When allowedRoles includes a short alias like "student" or "teacher",
 * we expand it to also match the concrete role variants the login system assigns.
 * This prevents the mismatch where login sets "universal_student" but the
 * route only lists "student".
 */
const ROLE_FAMILIES: Record<string, string[]> = {
  student: ['universal_student', 'institution_student', 'student'],
  teacher: ['independent_teacher', 'institution_teacher', 'universal_teacher', 'teacher'],
  admin: ['platform_admin', 'admin', 'superadmin'],
  institution: ['institution_admin', 'institution'],
  parent: ['parent'],
};

function expandAllowedRoles(allowedRoles: string[]): string[] {
  const expanded = new Set<string>();
  for (const role of allowedRoles) {
    const normalized = role.toLowerCase().trim();
    expanded.add(normalized);
    // If the role is a family key, add all variants
    if (ROLE_FAMILIES[normalized]) {
      for (const variant of ROLE_FAMILIES[normalized]) {
        expanded.add(variant);
      }
    }
    // Also check if any family contains this role, and add all siblings
    for (const family of Object.values(ROLE_FAMILIES)) {
      if (family.includes(normalized)) {
        for (const variant of family) {
          expanded.add(variant);
        }
      }
    }
  }
  return Array.from(expanded);
}

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

  // Role check — expand families so "student" also matches "universal_student" etc.
  const userRole = (user.role || '').toLowerCase().trim();
  if (allowedRoles && allowedRoles.length > 0) {
    const expandedAllowed = expandAllowedRoles(allowedRoles);
    if (!expandedAllowed.includes(userRole)) {
      // Navigate to the role-appropriate dashboard instead of bare /dashboard
      // to avoid redirect loops through DashboardRouter
      let fallback = '/dashboard/student';
      if (userRole.includes('teacher')) fallback = '/dashboard/teacher';
      else if (userRole.includes('admin') && !userRole.includes('institution')) fallback = '/dashboard/admin';
      else if (userRole.includes('institution')) fallback = '/dashboard/institution';
      else if (userRole.includes('parent')) fallback = '/dashboard/parent';
      return <Navigate to={fallback} replace />;
    }
  }

  // Granular RBAC Checks — also redirect to role-specific dashboard on denial
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireAnyPermission && !hasAnyPermission(requireAnyPermission)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireAllPermissions && !hasAllPermissions(requireAllPermissions)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
