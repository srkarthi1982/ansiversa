import type { DbDriver } from "../drivers/driver";
import { NewPlatformSchema, type NewPlatform, parsePlatform, type Platform } from "../types/quiz";

export interface PlatformsRepo {
  list(): Promise<Platform[]>;
  getById(id: string): Promise<Platform | null>;
  create(input: NewPlatform): Promise<Platform>;
}

export const createPlatformsRepo = (driver: DbDriver): PlatformsRepo => ({
  async list() {
    const { rows } = await driver.query<Platform>(
      `SELECT id, name, slug, description, createdAt, updatedAt FROM platforms ORDER BY name ASC`,
    );
    return rows.map(parsePlatform);
  },
  async getById(id: string) {
    const { rows } = await driver.query<Platform>(
      `SELECT id, name, slug, description, createdAt, updatedAt FROM platforms WHERE id = ? LIMIT 1`,
      [id],
    );
    if (rows.length === 0) {
      return null;
    }
    return parsePlatform(rows[0]);
  },
  async create(input: NewPlatform) {
    const data = NewPlatformSchema.parse(input);
    const { rows } = await driver.query<Platform>(
      `INSERT INTO platforms (name, slug, description)
       VALUES (?, ?, ?)
       RETURNING id, name, slug, description, createdAt, updatedAt`,
      [data.name, data.slug, data.description ?? null],
    );
    if (rows.length === 0) {
      throw new Error("Failed to insert platform record");
    }
    return parsePlatform(rows[0]);
  },
});
