import { eq } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { classes, sections } from '../../db/schema/index.js';
import { ConflictError, NotFoundError } from '../../utils/errors.js';

export async function createClass({ name, displayOrder }) {
  const existing = await db.query.classes.findFirst({ where: eq(classes.name, name) });
  if (existing) throw new ConflictError('A class with this name already exists');

  const [result] = await db.insert(classes).values({ name, displayOrder: displayOrder ?? 0 });
  return getClassById(result.insertId);
}

export async function listClasses() {
  return db.query.classes.findMany({
    orderBy: (c, { asc }) => [asc(c.displayOrder), asc(c.name)],
    with: { sections: true }
  });
}

export async function getClassById(id) {
  const classRecord = await db.query.classes.findFirst({
    where: eq(classes.id, id),
    with: { sections: true }
  });
  if (!classRecord) throw new NotFoundError('Class not found');
  return classRecord;
}

export async function updateClass(id, updates) {
  await getClassById(id);
  await db.update(classes).set(updates).where(eq(classes.id, id));
  return getClassById(id);
}

export async function deleteClass(id) {
  await getClassById(id);
  await db.delete(classes).where(eq(classes.id, id));
}

export async function createSection({ classId, name }) {
  await getClassById(classId);
  const existing = await db.query.sections.findFirst({
    where: (s, { and, eq: eqOp }) => and(eqOp(s.classId, classId), eqOp(s.name, name))
  });
  if (existing) throw new ConflictError('A section with this name already exists in this class');

  const [result] = await db.insert(sections).values({ classId, name });
  return getSectionById(result.insertId);
}

export async function getSectionById(id) {
  const section = await db.query.sections.findFirst({
    where: eq(sections.id, id),
    with: { class: true }
  });
  if (!section) throw new NotFoundError('Section not found');
  return section;
}

export async function updateSection(id, updates) {
  await getSectionById(id);
  await db.update(sections).set(updates).where(eq(sections.id, id));
  return getSectionById(id);
}

export async function deleteSection(id) {
  await getSectionById(id);
  await db.delete(sections).where(eq(sections.id, id));
}
