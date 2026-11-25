import { eq, like, or, and } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { teachers, users, roles } from '../../db/schema/index.js';
import { hashPassword } from '../../utils/password.js';
import { ConflictError, NotFoundError } from '../../utils/errors.js';
import { ROLES } from '../../config/constants.js';
import { countRows } from '../../utils/dbCount.js';

export async function createTeacher({ email, password, fullName, employeeCode, phone }) {
  const existingUser = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existingUser) throw new ConflictError('A user with this email already exists');

  const existingEmployeeCode = await db.query.teachers.findFirst({ where: eq(teachers.employeeCode, employeeCode) });
  if (existingEmployeeCode) throw new ConflictError('This employee code is already in use');

  const teacherRole = await db.query.roles.findFirst({ where: eq(roles.name, ROLES.TEACHER) });
  if (!teacherRole) throw new Error('Teacher role is not seeded. Run the database seed script.');

  const passwordHash = await hashPassword(password);

  const [userResult] = await db.insert(users).values({
    email,
    passwordHash,
    roleId: teacherRole.id,
    mustChangePassword: true
  });

  const [teacherResult] = await db.insert(teachers).values({
    userId: userResult.insertId,
    fullName,
    employeeCode,
    phone
  });

  return getTeacherById(teacherResult.insertId);
}

export async function listTeachers({ page, limit, offset, search }) {
  const whereClause = search
    ? or(like(teachers.fullName, `%${search}%`), like(teachers.employeeCode, `%${search}%`))
    : undefined;

  const rows = await db.query.teachers.findMany({
    where: whereClause,
    limit,
    offset,
    orderBy: (t, { desc }) => [desc(t.createdAt)],
    with: { user: { columns: { id: true, email: true, status: true, lastLoginAt: true } } }
  });

  const totalItems = await countRows(teachers, whereClause);

  return { rows, totalItems };
}

export async function getTeacherById(id) {
  const teacher = await db.query.teachers.findFirst({
    where: eq(teachers.id, id),
    with: { user: { columns: { id: true, email: true, status: true, lastLoginAt: true } } }
  });
  if (!teacher) throw new NotFoundError('Teacher not found');
  return teacher;
}

export async function updateTeacher(id, updates) {
  const teacher = await getTeacherById(id);

  const teacherUpdates = {};
  if (updates.fullName !== undefined) teacherUpdates.fullName = updates.fullName;
  if (updates.phone !== undefined) teacherUpdates.phone = updates.phone;

  if (Object.keys(teacherUpdates).length > 0) {
    await db.update(teachers).set(teacherUpdates).where(eq(teachers.id, id));
  }

  if (updates.status !== undefined) {
    await db.update(users).set({ status: updates.status }).where(eq(users.id, teacher.userId));
  }

  return getTeacherById(id);
}

export async function deleteTeacher(id) {
  const teacher = await getTeacherById(id);
  await db.update(users).set({ status: 'suspended' }).where(eq(users.id, teacher.userId));
  return { id };
}
