// api/index.ts — Vercel Serverless entry
import { app } from '../src/app';

// Option A: Edge runtime (fast, cold-start free)
// export const runtime = 'edge';
// export default app.fetch;

// Option B: Node.js serverless runtime (choose this if you need Node APIs)
import { handle } from 'hono/vercel';
export const config = {
  runtime: 'nodejs18.x',   // or 'nodejs20.x' (check your project settings)
};
export default handle(app);
