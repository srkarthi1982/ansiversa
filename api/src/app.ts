import { Hono } from 'hono';
import { cors } from './middleware/cors.js';
import { secureHeaders } from './middleware/secureHeaders.js';
import { errorHandler } from './middleware/error.js';
import { rateLimit } from './middleware/rateLimit.js';
import { routes } from './routes/index.js';

export const app = new Hono();

app.use('*', errorHandler());
app.use('*', secureHeaders());
app.use('*', cors());
app.use('*', rateLimit({ windowMs: 60_000, max: 60 }));

app.route('/', routes);
