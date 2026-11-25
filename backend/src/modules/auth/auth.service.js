import { eq, and, isNull } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { users, roles, sessions, refreshTokens, rolePermissions, permissions, teachers, parents } from '../../db/schema/index.js';
import { verifyPassword } from '../../utils/password.js';
import { signAccessToken, generateRefreshToken, hashRefreshToken } from '../../utils/jwt.js';
import { UnauthorizedError, ForbiddenError } from '../../utils/errors.js';
import { env } from '../../config/env.js';

async function getPermissionsForRole(roleId) {
  const rows = await db
    .select({ name: permissions.name })
    .from(rolePermissions)
    .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
    .where(eq(rolePermissions.roleId, roleId));
  return rows.map((row) => row.name);
}

function refreshExpiryDate() {
  const match = /^(\d+)([smhd])$/.exec(env.jwt.refreshExpiresIn);
  const now = new Date();
  if (!match) {
    now.setDate(now.getDate() + 30);
    return now;
  }
  const [, amount, unit] = match;
  const value = Number(amount);
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return new Date(now.getTime() + value * multipliers[unit]);
}

async function buildAuthPayload(user) {
  const permissionNames = await getPermissionsForRole(user.roleId);
  const role = await db.query.roles.findFirst({ where: eq(roles.id, user.roleId) });

  // Look up by userId regardless of role name: an admin account (e.g. the
  // seeded superuser) may also carry a teacher profile so it can upload
  // media, independent of which role grants its permissions.
  let profile = await db.query.teachers.findFirst({ where: eq(teachers.userId, user.id) });
  if (!profile) {
    profile = await db.query.parents.findFirst({ where: eq(parents.userId, user.id) });
  }

  return {
    accessTokenPayload: {
      sub: user.id,
      email: user.email,
      role: role.name,
      permissions: permissionNames,
      profileId: profile?.id ?? null
    },
    userView: {
      id: user.id,
      email: user.email,
      role: role.name,
      permissions: permissionNames,
      mustChangePassword: user.mustChangePassword,
      profile
    }
  };
}

export async function login({ email, password, ipAddress, userAgent }) {
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user) throw new UnauthorizedError('Invalid email or password');
  if (user.status !== 'active') throw new ForbiddenError('Account is not active');

  const isValid = await verifyPassword(user.passwordHash, password);
  if (!isValid) throw new UnauthorizedError('Invalid email or password');

  const [session] = await db.insert(sessions).values({
    userId: user.id,
    ipAddress,
    userAgent
  });

  const { raw, tokenHash } = generateRefreshToken();
  await db.insert(refreshTokens).values({
    userId: user.id,
    sessionId: session.insertId,
    tokenHash,
    expiresAt: refreshExpiryDate()
  });

  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

  const { accessTokenPayload, userView } = await buildAuthPayload(user);
  const accessToken = signAccessToken(accessTokenPayload);

  return { accessToken, refreshToken: raw, user: userView, sessionId: session.insertId };
}

export async function refresh({ rawRefreshToken, ipAddress, userAgent }) {
  const tokenHash = hashRefreshToken(rawRefreshToken);
  const tokenRecord = await db.query.refreshTokens.findFirst({
    where: eq(refreshTokens.tokenHash, tokenHash)
  });

  if (!tokenRecord || tokenRecord.revokedAt || tokenRecord.expiresAt < new Date()) {
    throw new UnauthorizedError('Refresh token is invalid or expired');
  }

  const user = await db.query.users.findFirst({ where: eq(users.id, tokenRecord.userId) });
  if (!user || user.status !== 'active') throw new ForbiddenError('Account is not active');

  const { raw, tokenHash: newTokenHash } = generateRefreshToken();

  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date(), replacedByTokenHash: newTokenHash })
    .where(eq(refreshTokens.id, tokenRecord.id));

  await db.insert(refreshTokens).values({
    userId: user.id,
    sessionId: tokenRecord.sessionId,
    tokenHash: newTokenHash,
    expiresAt: refreshExpiryDate()
  });

  await db
    .update(sessions)
    .set({ lastSeenAt: new Date(), ipAddress, userAgent })
    .where(eq(sessions.id, tokenRecord.sessionId));

  const { accessTokenPayload, userView } = await buildAuthPayload(user);
  const accessToken = signAccessToken(accessTokenPayload);

  return { accessToken, refreshToken: raw, user: userView };
}

export async function logout({ rawRefreshToken }) {
  const tokenHash = hashRefreshToken(rawRefreshToken);
  const tokenRecord = await db.query.refreshTokens.findFirst({ where: eq(refreshTokens.tokenHash, tokenHash) });
  if (!tokenRecord) return;

  await db.update(refreshTokens).set({ revokedAt: new Date() }).where(eq(refreshTokens.id, tokenRecord.id));
  await db.update(sessions).set({ isActive: false }).where(eq(sessions.id, tokenRecord.sessionId));
}

export async function logoutAllSessions({ userId }) {
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)));
  await db.update(sessions).set({ isActive: false }).where(eq(sessions.userId, userId));
}

export async function getCurrentUser(userId) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throw new UnauthorizedError('User not found');
  const { userView } = await buildAuthPayload(user);
  return userView;
}
