// api/index.ts — Vercel Serverless entry
import { app } from '../src/app';
// Node serverless runtime (good default)
import { handle } from 'hono/vercel';
export const config = { runtime: 'nodejs20.x' }; // or nodejs18.x if needed
export default handle(app);
// If you ever switch to Edge runtime instead:
// export const runtime = 'edge';
// export default app.fetch;
