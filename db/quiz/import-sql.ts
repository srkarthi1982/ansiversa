import { promises as fs } from 'node:fs';
import path from 'node:path';

import { db, sql } from 'astro:db';

const QUESTIONS_SQL_DIR = path.resolve('public', 'questions-sql');

const isSqlFile = (entry: string) => entry.toLowerCase().endsWith('.sql');

const COLUMN_REMAP: Record<string, string> = {
  platform_id: 'platformId',
  subject_id: 'subjectId',
  topic_id: 'topicId',
  roadmap_id: 'roadmapId',
  is_active: 'isActive',
};

const HEADER_REGEX = /INSERT INTO\s+question\s*\(([^)]+)\)\s*VALUES/i;

const normalizeSql = (rawSql: string) => {
  const match = rawSql.match(HEADER_REGEX);
  if (!match) {
    return rawSql;
  }

  const [fullMatch, columnsGroup] = match;
  const columns = columnsGroup
    .split(',')
    .map((column) => column.trim())
    .filter((column) => column.length > 0)
    .map((column) => COLUMN_REMAP[column] ?? column);

  const normalizedHeader = `INSERT INTO Question (${columns.join(', ')}) VALUES`;
  return rawSql.replace(fullMatch, normalizedHeader);
};

export default async function importQuestionSql() {
  const entries = await fs.readdir(QUESTIONS_SQL_DIR, { withFileTypes: true });
  const filterKeyword = process.env.QUESTIONS_SQL_MATCH?.toLowerCase().trim() ?? '';
  const limitRaw = process.env.QUESTIONS_SQL_LIMIT;
  const limit =
    typeof limitRaw === 'string' ? Math.max(Number.parseInt(limitRaw, 10), 0) || undefined : undefined;
  const skipEnv = process.env.QUESTIONS_SQL_SKIP ?? '';
  const skipSet = new Set(
    skipEnv
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter((value) => value.length > 0),
  );

  const files = entries
    .filter((entry) => entry.isFile() && isSqlFile(entry.name))
    .map((entry) => entry.name)
    .filter((file) => (filterKeyword ? file.toLowerCase().includes(filterKeyword) : true))
    .filter((file) => !skipSet.has(file.toLowerCase()))
    .sort((a, b) => a.localeCompare(b));

  const selectedFiles = typeof limit === 'number' && limit > 0 ? files.slice(0, limit) : files;

  if (selectedFiles.length === 0) {
    console.log(`No SQL files found in ${QUESTIONS_SQL_DIR}`);
    return;
  }

  console.log(`Running ${selectedFiles.length} SQL files from ${QUESTIONS_SQL_DIR}`);
  if (filterKeyword) {
    console.log(`Filter applied: filenames containing "${filterKeyword}"`);
  }
  if (typeof limit === 'number' && limit > 0) {
    console.log(`File limit applied: processing first ${limit} file(s)`);
  }
  if (skipSet.size > 0) {
    console.log(`Skipping ${skipSet.size} file(s): ${Array.from(skipSet).join(', ')}`);
  }

  for (const fileName of selectedFiles) {
    const filePath = path.join(QUESTIONS_SQL_DIR, fileName);
    const rawSql = (await fs.readFile(filePath, 'utf8')).trim();

    if (!rawSql) {
      console.log(`Skipping ${fileName}: empty file`);
      continue;
    }

    console.log(`Executing ${fileName}...`);
    try {
      const normalizedSql = normalizeSql(rawSql);
      await db.run(sql.raw(normalizedSql));
      console.log(`Completed ${fileName}`);
    } catch (error) {
      console.error(`Failed while executing ${fileName}`);
      throw error;
    }
  }
}
