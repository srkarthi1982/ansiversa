import { Hono } from 'hono';
import { auth } from './auth.routes.js';
import { quiz } from './quiz.routes.js';

export const routes = new Hono();

routes.get('/', (c) =>
  c.html(`
    <!doctype html>
    <meta charset="utf-8">
    <title>api.ansiversa</title>
    <style>
      body{font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin:2rem;line-height:1.5}
      code{background:#f5f5f5;padding:.2rem .4rem;border-radius:.25rem}
      a{color:#2563eb;text-decoration:none} a:hover{text-decoration:underline}
      ul{margin:.5rem 0 0 1rem}
    </style>
    <h1>api.ansiversa</h1>
    <p>Status: <code>ok</code></p>
    <h2>Quick links</h2>
    <ul>
      <li><a href="/health">/health</a></li>
      <li><a href="/quiz/platforms">/platforms</a></li>
      <li><a href="/quiz/subjects?platformId=1">/subjects?platformId=1</a></li>
      <li><a href="/quiz/topics?subjectId=1">/topics?subjectId=1</a></li>
      <li><a href="/quiz/questions/random?topicId=1&limit=5">/questions/random?topicId=1&limit=5</a></li>
    </ul>
  `)
);
routes.get('/health', (c) => c.json({ status: 'ok', env: process.env.NODE_ENV || 'development' }));

routes.route('/auth', auth);
routes.route('/quiz', quiz);
