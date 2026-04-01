import React, { ReactNode } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { Permission } from '../../lib/permissions.matrix';

interface PermissionGuardProps {
  /**
   * Content to render if the user has the required permission(s).
   */
  children: ReactNode;
  
  /**
   * The specific permission required. Overrides requireAny and requireAll.
   */
  require?: Permission;

  /**
   * If the user must have *any* of the permissions in the list.
   */
  requireAny?: Permission[];

  /**
   * If the user must have *all* of the permissions in the list.
   */
  requireAll?: Permission[];

  /**
   * Optional fallback content to render if the user lacks the required permission(s).
   */
  fallback?: ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  require,
  requireAny,
  requireAll,
  fallback = null,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  let isAuthorized = false;

  if (require) {
    isAuthorized = hasPermission(require);
  } else if (requireAny) {
    isAuthorized = hasAnyPermission(requireAny);
  } else if (requireAll) {
    isAuthorized = hasAllPermissions(requireAll);
  } else {
    // If no specific requirement is given, we assume it's authorized.
    isAuthorized = true;
  }

  if (!isAuthorized) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
