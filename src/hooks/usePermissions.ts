import { useAuth } from '../contexts/AuthContext';
import { 
  Permission, 
  PLATFORM_ROLE_MATRIX, 
  INSTITUTIONAL_ROLE_MATRIX,
  PlatformRole,
  InstitutionalRole
} from '../lib/permissions.matrix';

export const usePermissions = () => {
  const { user, currentContext } = useAuth();

  /**
   * Checks if the currently authenticated user has the specified permission.
   * Resolves based on their platform role or active institutional role context.
   */
  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;

    // Platform admins always have access to everything intended for platform users
    // Wait, platform admins don't necessarily have all institution permissions, 
    // but for simplicity, let's say they do or they are resolved normally via the matrix.
    
    // First check platform-level permissions
    const platformRole = user.role as PlatformRole;
    if (platformRole === 'platform_admin') {
      // Admin overrides
      return true;
    }

    const platformPermissions = PLATFORM_ROLE_MATRIX[platformRole] || [];
    if (platformPermissions.includes(permission)) {
      return true;
    }

    // If they don't have it at the platform level, and we are in an institutional context,
    // check their institutional roles.
    // NOTE: This assumes `user` object has `institutional_roles` or similar. 
    // For now, if we have a robust user type, we might check it. 
    // If the frontend doesn't yet store institutional roles directly in user, 
    // this hook can be expanded later.
    
    // As a placeholder, assuming `user.institutional_role` exists in the context
    // In Phase 5+, you might derive this from `user.student_statuses.institutional` or similar.
    const institutionalRole = (user as any).institutional_role as InstitutionalRole;
    
    if (currentContext === 'institutional' && institutionalRole) {
      const instPermissions = INSTITUTIONAL_ROLE_MATRIX[institutionalRole] || [];
      if (instPermissions.includes(permission)) {
        return true;
      }
    }

    return false;
  };

  /**
   * Checks if the user has ANY of the specified permissions.
   */
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(hasPermission);
  };

  /**
   * Checks if the user has ALL of the specified permissions.
   */
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(hasPermission);
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  };
};
