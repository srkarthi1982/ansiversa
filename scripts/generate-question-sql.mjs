import { promises as fs } from 'fs';
import path from 'path';

const INPUT_DIR = path.resolve('public', 'questions');
const OUTPUT_DIR = path.resolve('public', 'questions-sql');
const OUTPUT_COLUMNS = [
  'platform_id',
  'subject_id',
  'topic_id',
  'roadmap_id',
  'q',
  'o',
  'a',
  'e',
  'l',
  'is_active',
];

const ensureDirectory = async (dir) => {
  await fs.mkdir(dir, { recursive: true });
};

const toSqlString = (value) => {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (typeof value === 'string') {
    const escaped = value.replace(/'/g, "''");
    return `'${escaped}'`;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : 'NULL';
  }
  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }
  if (Array.isArray(value)) {
    return toSqlString(JSON.stringify(value));
  }
  return toSqlString(JSON.stringify(value));
};

const pickNumber = (record, keys, fallback = null) => {
  for (const key of keys) {
    const raw = record[key];
    if (raw === null || raw === undefined) continue;
    const numeric = Number(raw);
    if (Number.isFinite(numeric)) {
      return numeric;
    }
  }
  return fallback;
};

const pickString = (record, keys, fallback = null) => {
  for (const key of keys) {
    const raw = record[key];
    if (raw === null || raw === undefined) continue;
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (trimmed) {
        return trimmed;
      }
    } else if (typeof raw === 'number' || typeof raw === 'boolean') {
      return String(raw);
    }
  }
  return fallback;
};

const pickBoolean = (record, keys, fallback = true) => {
  for (const key of keys) {
    const raw = record[key];
    if (typeof raw === 'boolean') {
      return raw;
    }
    if (typeof raw === 'string') {
      const trimmed = raw.trim().toLowerCase();
      if (trimmed === 'true' || trimmed === '1') return true;
      if (trimmed === 'false' || trimmed === '0') return false;
    }
    if (typeof raw === 'number') {
      if (raw === 1) return true;
      if (raw === 0) return false;
    }
  }
  return fallback;
};

const pickOptions = (record) => {
  const raw = record.o ?? record.options ?? record.choices;
  if (!raw) {
    return [];
  }
  if (Array.isArray(raw)) {
    return raw.map((entry) => {
      if (typeof entry === 'string') return entry;
      if (typeof entry === 'number' || typeof entry === 'boolean') return String(entry);
      if (entry && typeof entry === 'object') return JSON.stringify(entry);
      return '';
    });
  }
  if (typeof raw === 'object') {
    return Object.values(raw).map((entry) => {
      if (typeof entry === 'string') return entry;
      if (typeof entry === 'number' || typeof entry === 'boolean') return String(entry);
      if (entry && typeof entry === 'object') return JSON.stringify(entry);
      return '';
    });
  }
  return [];
};

const buildRowValues = (record) => {
  const platformId = pickNumber(record, ['platform_id', 'platformId']);
  const subjectId = pickNumber(record, ['subject_id', 'subjectId']);
  const topicId = pickNumber(record, ['topic_id', 'topicId']);
  const roadmapId = pickNumber(record, ['roadmap_id', 'roadmapId']);

  const question = pickString(record, ['q', 'question', 'question_text', 'prompt']);
  const options = pickOptions(record);
  const answerRaw = pickString(
    record,
    ['a', 'answer', 'answer_key', 'correct_option', 'correct_answer', 'correctOption'],
  );
  const explanation = pickString(record, ['e', 'explanation']);
  const level = pickString(record, ['l', 'level', 'difficulty']);
  const isActive = pickBoolean(record, ['is_active', 'isActive']);

  const answerValue = answerRaw === null ? null : answerRaw;
  const levelValue = level ? level.toUpperCase() : null;

  return [
    platformId,
    subjectId,
    topicId,
    roadmapId,
    question,
    options,
    answerValue,
    explanation,
    levelValue,
    isActive,
  ].map((value) => toSqlString(value));
};

const convertDataset = async (filePath) => {
  const source = await fs.readFile(filePath, 'utf8');
  let data;
  try {
    data = JSON.parse(source);
  } catch (error) {
    throw new Error(`Failed to parse JSON file ${filePath}: ${error instanceof Error ? error.message : error}`);
  }

  if (!Array.isArray(data) || data.length === 0) {
    return '-- No records found in dataset.\n';
  }

  const rows = data.map((record) => {
    const values = buildRowValues(record);
    return `  (${values.join(', ')})`;
  });

  return `INSERT INTO quiz_questions (${OUTPUT_COLUMNS.join(', ')}) VALUES\n${rows.join(',\n')};\n`;
};

const main = async () => {
  await ensureDirectory(OUTPUT_DIR);

  const entries = await fs.readdir(INPUT_DIR);
  const jsonFiles = entries.filter((entry) => entry.toLowerCase().endsWith('.json'));

  for (const fileName of jsonFiles) {
    const inputPath = path.join(INPUT_DIR, fileName);
    const outputPath = path.join(
      OUTPUT_DIR,
      fileName.replace(/\.json$/i, '.sql'),
    );

    const sql = await convertDataset(inputPath);
    await fs.writeFile(outputPath, sql, 'utf8');
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
