import { db, pool } from './client.js';
import { roles, permissions, rolePermissions, users, teachers } from './schema/index.js';
import { ROLES, PERMISSIONS, ROLE_PERMISSIONS } from '../config/constants.js';
import { hashPassword } from '../utils/password.js';
import { logger } from '../utils/logger.js';
import { eq } from 'drizzle-orm';

async function upsertRole(name, description) {
  const existing = await db.query.roles.findFirst({ where: eq(roles.name, name) });
  if (existing) return existing;
  const [result] = await db.insert(roles).values({ name, description });
  return { id: result.insertId, name };
}

async function upsertPermission(name, description) {
  const existing = await db.query.permissions.findFirst({ where: eq(permissions.name, name) });
  if (existing) return existing;
  const [result] = await db.insert(permissions).values({ name, description });
  return { id: result.insertId, name };
}

async function seed() {
  logger.info('Seeding roles and permissions...');

  const roleRecords = {};
  for (const roleName of Object.values(ROLES)) {
    roleRecords[roleName] = await upsertRole(roleName, `${roleName} role`);
  }

  const permissionRecords = {};
  for (const permissionName of Object.values(PERMISSIONS)) {
    permissionRecords[permissionName] = await upsertPermission(permissionName, permissionName);
  }

  for (const [roleName, permissionNames] of Object.entries(ROLE_PERMISSIONS)) {
    const role = roleRecords[roleName];
    for (const permissionName of permissionNames) {
      const permission = permissionRecords[permissionName];
      const existing = await db.query.rolePermissions.findFirst({
        where: (rp, { and, eq: eqOp }) => and(eqOp(rp.roleId, role.id), eqOp(rp.permissionId, permission.id))
      });
      if (!existing) {
        await db.insert(rolePermissions).values({ roleId: role.id, permissionId: permission.id });
      }
    }
  }

  logger.info('Seeding default admin user...');
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@smms.local';
  const existingAdmin = await db.query.users.findFirst({ where: eq(users.email, adminEmail) });

  if (!existingAdmin) {
    const passwordHash = await hashPassword(process.env.SEED_ADMIN_PASSWORD || 'ChangeMe@12345');
    const [userResult] = await db.insert(users).values({
      email: adminEmail,
      passwordHash,
      roleId: roleRecords[ROLES.ADMIN].id,
      status: 'active',
      mustChangePassword: true
    });

    await db.insert(teachers).values({
      userId: userResult.insertId,
      employeeCode: 'ADMIN-001',
      fullName: 'System Administrator'
    });

    logger.info(`Admin user created: ${adminEmail}`);
  } else {
    logger.info('Admin user already exists, skipping.');
  }

  logger.info('Seed completed successfully.');
  await pool.end();
}

seed().catch((error) => {
  logger.error('Seeding failed', { error: error.message, stack: error.stack });
  process.exit(1);
});
