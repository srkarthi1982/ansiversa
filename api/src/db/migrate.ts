import { db } from './client';

async function run() {
  // Users
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Quiz core
  await db.execute(`
    CREATE TABLE IF NOT EXISTS platforms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT DEFAULT ''
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id INTEGER NOT NULL,
      question TEXT NOT NULL,
      options TEXT NOT NULL, -- JSON string array
      answer_index INTEGER NOT NULL,
      explanation TEXT DEFAULT '',
      FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
    );
  `);

  console.log('Migrations completed.');
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
