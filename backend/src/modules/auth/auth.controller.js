import * as authService from './auth.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { setRefreshCookie, clearRefreshCookie, REFRESH_COOKIE_NAME } from '../../utils/cookies.js';
import { UnauthorizedError } from '../../utils/errors.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import { db } from '../../db/client.js';
import { users } from '../../db/schema/index.js';
import { eq } from 'drizzle-orm';
import { logAudit } from '../audit/audit.service.js';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({
    email,
    password,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || ''
  });

  setRefreshCookie(res, result.refreshToken);
  await logAudit({ userId: result.user.id, action: 'auth.login', entityType: 'user', entityId: result.user.id, req });

  return sendSuccess(res, {
    message: 'Login successful',
    data: { accessToken: result.accessToken, user: result.user }
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!rawRefreshToken) throw new UnauthorizedError('Refresh token not provided');

  const result = await authService.refresh({
    rawRefreshToken,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || ''
  });

  setRefreshCookie(res, result.refreshToken);

  return sendSuccess(res, {
    message: 'Token refreshed',
    data: { accessToken: result.accessToken, user: result.user }
  });
});

export const logout = asyncHandler(async (req, res) => {
  const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
  if (rawRefreshToken) {
    await authService.logout({ rawRefreshToken });
  }
  clearRefreshCookie(res);
  return sendSuccess(res, { message: 'Logged out successfully' });
});

export const logoutAll = asyncHandler(async (req, res) => {
  await authService.logoutAllSessions({ userId: req.user.id });
  clearRefreshCookie(res);
  return sendSuccess(res, { message: 'All sessions logged out' });
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);
  return sendSuccess(res, { message: 'Current user retrieved', data: user });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await db.query.users.findFirst({ where: eq(users.id, req.user.id) });
  if (!user) throw new UnauthorizedError('User not found');

  const isValid = await verifyPassword(user.passwordHash, currentPassword);
  if (!isValid) throw new UnauthorizedError('Current password is incorrect');

  const newHash = await hashPassword(newPassword);
  await db
    .update(users)
    .set({ passwordHash: newHash, mustChangePassword: false })
    .where(eq(users.id, req.user.id));

  await authService.logoutAllSessions({ userId: req.user.id });
  clearRefreshCookie(res);

  return sendSuccess(res, { message: 'Password changed successfully. Please log in again.' });
});
