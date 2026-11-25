import { eq, like, or, and } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { parents, studentParents, users, roles, students } from '../../db/schema/index.js';
import { hashPassword } from '../../utils/password.js';
import { ConflictError, NotFoundError } from '../../utils/errors.js';
import { countRows } from '../../utils/dbCount.js';
import { ROLES } from '../../config/constants.js';

export async function createParent({ fullName, phone, email, createLogin, password, studentIds, relationship }) {
  let userId = null;

  if (createLogin) {
    if (!email || !password) throw new ConflictError('Email and password are required to create a parent login');
    const existingUser = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (existingUser) throw new ConflictError('A user with this email already exists');

    const parentRole = await db.query.roles.findFirst({ where: eq(roles.name, ROLES.PARENT) });
    const passwordHash = await hashPassword(password);
    const [userResult] = await db.insert(users).values({
      email,
      passwordHash,
      roleId: parentRole.id,
      mustChangePassword: true
    });
    userId = userResult.insertId;
  }

  const [parentResult] = await db.insert(parents).values({ userId, fullName, phone, email });
  const parentId = parentResult.insertId;

  for (const studentId of studentIds || []) {
    await linkStudentToParent(parentId, studentId, relationship);
  }

  return getParentById(parentId);
}

export async function linkStudentToParent(parentId, studentId, relationship = 'guardian') {
  const student = await db.query.students.findFirst({ where: eq(students.id, studentId) });
  if (!student) throw new NotFoundError('Student not found');

  const existingLink = await db.query.studentParents.findFirst({
    where: (sp, { and, eq: eqOp }) => and(eqOp(sp.studentId, studentId), eqOp(sp.parentId, parentId))
  });
  if (existingLink) throw new ConflictError('This parent is already linked to this student');

  await db.insert(studentParents).values({ studentId, parentId, relationship });
  return getParentById(parentId);
}

export async function unlinkStudentFromParent(parentId, studentId) {
  await db
    .delete(studentParents)
    .where(and(eq(studentParents.parentId, parentId), eq(studentParents.studentId, studentId)));
}

export async function listParents({ page, limit, offset, search }) {
  const whereClause = search
    ? or(like(parents.fullName, `%${search}%`), like(parents.email, `%${search}%`))
    : undefined;

  const rows = await db.query.parents.findMany({
    where: whereClause,
    limit,
    offset,
    orderBy: (p, { desc }) => [desc(p.createdAt)],
    with: { studentParents: { with: { student: true } } }
  });

  const totalItems = await countRows(parents, whereClause);
  return { rows, totalItems };
}

export async function getParentById(id) {
  const parent = await db.query.parents.findFirst({
    where: eq(parents.id, id),
    with: { studentParents: { with: { student: true } } }
  });
  if (!parent) throw new NotFoundError('Parent not found');
  return parent;
}

export async function updateParent(id, updates) {
  await getParentById(id);
  await db.update(parents).set(updates).where(eq(parents.id, id));
  return getParentById(id);
}

export async function getStudentIdsForParentUser(userId) {
  const parent = await db.query.parents.findFirst({
    where: eq(parents.userId, userId),
    with: { studentParents: true }
  });
  if (!parent) return [];
  return parent.studentParents.map((link) => link.studentId);
}
