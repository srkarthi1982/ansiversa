// Vercel Serverless entry
import { app } from '../src/app';

// Node Serverless runtime (good default)
import { handle } from 'hono/vercel';
export const config = { runtime: 'nodejs20.x' };
export default handle(app);

// If you switch to Edge later:
// export const runtime = 'edge';
// export default app.fetch;
