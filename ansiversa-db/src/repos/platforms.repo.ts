import type { DbDriver } from "../drivers/driver";
import { NewPlatformSchema, type NewPlatform, parsePlatform, type Platform } from "../types/quiz";

export interface PlatformsRepo {
  list(): Promise<Platform[]>;
  getById(id: string): Promise<Platform | null>;
  create(input: NewPlatform): Promise<Platform>;
}

export const createPlatformsRepo = (driver: DbDriver): PlatformsRepo => ({
  async list() {
    const { rows } = await driver.query(
      `SELECT id, name, description, icon, type, qCount, isActive FROM Platform ORDER BY name ASC`,
    );
    return rows.map(parsePlatform);
  },
  async getById(id: string) {
    const { rows } = await driver.query(
      `SELECT id, name, description, icon, type, qCount, isActive FROM Platform WHERE id = ? LIMIT 1`,
      [id],
    );
    if (rows.length === 0) {
      return null;
    }
    return parsePlatform(rows[0]);
  },
  async create(input: NewPlatform) {
    const data = NewPlatformSchema.parse(input);
    const { rows } = await driver.query(
      `INSERT INTO Platform (name, description, icon, type, qCount, isActive)
       VALUES (?, ?, ?, ?, ?, ?)
       RETURNING id, name, description, icon, type, qCount, isActive`,
      [
        data.name,
        data.description,
        data.icon,
        data.type ?? null,
        data.qCount,
        data.isActive ? 1 : 0,
      ],
    );
    if (rows.length === 0) {
      throw new Error("Failed to insert platform record");
    }
    return parsePlatform(rows[0]);
  },
});
