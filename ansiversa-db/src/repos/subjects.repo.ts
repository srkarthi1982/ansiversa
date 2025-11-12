import type { DbDriver } from "../drivers/driver";
import { NewSubjectSchema, type NewSubject, parseSubject, type Subject } from "../types/quiz";

export interface SubjectsRepo {
  list(): Promise<Subject[]>;
  listByPlatform(platformId: number): Promise<Subject[]>;
  getById(id: number): Promise<Subject | null>;
  create(input: NewSubject): Promise<Subject>;
}

export const createSubjectsRepo = (driver: DbDriver): SubjectsRepo => ({
  async list() {
    const { rows } = await driver.query(
      `SELECT id, platformId, name, isActive, qCount FROM Subject ORDER BY name ASC`,
    );
    return rows.map((row) => parseSubject(row));
  },
  async listByPlatform(platformId: number) {
    const { rows } = await driver.query(
      `SELECT id, platformId, name, isActive, qCount FROM Subject WHERE platformId = ? ORDER BY name ASC`,
      [platformId],
    );
    return rows.map((row) => parseSubject(row));
  },
  async getById(id: number) {
    const { rows } = await driver.query(
      `SELECT id, platformId, name, isActive, qCount FROM Subject WHERE id = ? LIMIT 1`,
      [id],
    );
    if (rows.length === 0) {
      return null;
    }
    return parseSubject(rows[0]);
  },
  async create(input: NewSubject) {
    const data = NewSubjectSchema.parse(input);
    const { rows } = await driver.query(
      `INSERT INTO Subject (id, platformId, name, isActive, qCount)
       VALUES (?, ?, ?, ?, ?)
       RETURNING id, platformId, name, isActive, qCount`,
      [data.id, data.platformId, data.name, data.isActive ? 1 : 0, data.qCount],
    );
    if (rows.length === 0) {
      throw new Error("Failed to insert subject record");
    }
    return parseSubject(rows[0]);
  },
});
