import { db } from './client';

async function run() {
  // Seed a default platform/subject/topic/question set
  const platform = await db.execute({
    sql: "INSERT INTO platforms (name, description) VALUES (?, ?) RETURNING id",
    args: ["General Knowledge", "Default platform for demo"],
  });

  const platformId = Number(platform.rows[0]['id']);

  const subj = await db.execute({
    sql: "INSERT INTO subjects (platform_id, name, description) VALUES (?, ?, ?) RETURNING id",
    args: [platformId, "Sample Subject", "Demo subject"],
  });
  const subjectId = Number(subj.rows[0]['id']);

  const top = await db.execute({
    sql: "INSERT INTO topics (subject_id, name, description) VALUES (?, ?, ?) RETURNING id",
    args: [subjectId, "Sample Topic", "Demo topic"],
  });
  const topicId = Number(top.rows[0]['id']);

  await db.execute({
    sql: "INSERT INTO questions (topic_id, question, options, answer_index, explanation) VALUES (?, ?, ?, ?, ?)",
    args: [topicId, "2 + 2 = ?", JSON.stringify(["3","4","5","6"]), 1, "Basic arithmetic"],
  });

  console.log('Seed completed.');
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
