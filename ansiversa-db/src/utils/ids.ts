import type { DbDriver } from "../drivers/driver";

const coerceIdValue = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(1, Math.trunc(value));
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isNaN(parsed)) {
      return Math.max(1, parsed);
    }
  }
  return 1;
};

export const getNextNumericId = async (driver: DbDriver, tableName: string): Promise<number> => {
  const { rows } = await driver.query<{ nextId: number | string | null }>(
    `SELECT COALESCE(MAX(id), 0) + 1 as nextId FROM ${tableName}`,
  );

  const raw = rows[0]?.nextId ?? 1;
  return coerceIdValue(raw);
};
