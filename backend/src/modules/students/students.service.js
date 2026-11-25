import { eq, like, or, and } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { students } from '../../db/schema/index.js';
import { ConflictError, NotFoundError } from '../../utils/errors.js';
import { countRows } from '../../utils/dbCount.js';

export async function createStudent(input) {
  const existing = await db.query.students.findFirst({ where: eq(students.admissionNumber, input.admissionNumber) });
  if (existing) throw new ConflictError('A student with this admission number already exists');

  const [result] = await db.insert(students).values(input);
  return getStudentById(result.insertId);
}

export async function listStudents({ page, limit, offset, search, classId, sectionId }) {
  const conditions = [];
  if (search) {
    conditions.push(or(like(students.fullName, `%${search}%`), like(students.admissionNumber, `%${search}%`)));
  }
  if (classId) conditions.push(eq(students.classId, classId));
  if (sectionId) conditions.push(eq(students.sectionId, sectionId));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db.query.students.findMany({
    where: whereClause,
    limit,
    offset,
    orderBy: (s, { desc }) => [desc(s.createdAt)],
    with: { class: true, section: true }
  });

  const totalItems = await countRows(students, whereClause);
  return { rows, totalItems };
}

export async function getStudentById(id) {
  const student = await db.query.students.findFirst({
    where: eq(students.id, id),
    with: {
      class: true,
      section: true,
      faceEmbeddings: { where: (fe, { eq: eqOp }) => eqOp(fe.isActive, true) },
      studentParents: { with: { parent: true } }
    }
  });
  if (!student) throw new NotFoundError('Student not found');
  return student;
}

export async function updateStudent(id, updates) {
  await getStudentById(id);
  await db.update(students).set(updates).where(eq(students.id, id));
  return getStudentById(id);
}

export async function deleteStudent(id) {
  await getStudentById(id);
  await db.update(students).set({ status: 'inactive' }).where(eq(students.id, id));
}
