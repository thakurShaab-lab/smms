import { ForbiddenError, UnauthorizedError } from '../utils/errors.js';

/**
 * Authorize by permission name(s). A user passes if they hold at least one
 * of the listed permissions (embedded in their access token at login time).
 */
export function authorize(...requiredPermissions) {
  return function authorizeMiddleware(req, res, next) {
    if (!req.user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }

    const userPermissions = new Set(req.user.permissions);
    const hasPermission = requiredPermissions.some((permission) => userPermissions.has(permission));

    if (!hasPermission) {
      next(new ForbiddenError('You do not have permission to perform this action'));
      return;
    }

    next();
  };
}

export function requireRole(...allowedRoles) {
  return function requireRoleMiddleware(req, res, next) {
    if (!req.user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      next(new ForbiddenError('This action is not available for your role'));
      return;
    }
    next();
  };
}
